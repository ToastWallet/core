package com.nolanlawson.cordova.sqlite;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteStatement;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Author: Nolan Lawson
 * License: Apache 2
 */
public class SQLitePlugin extends CordovaPlugin {

  private static final boolean DEBUG_MODE = false;

  private static final String TAG = SQLitePlugin.class.getSimpleName();

  private static final Object[][] EMPTY_ROWS = new Object[][]{};
  private static final String[] EMPTY_COLUMNS = new String[]{};
  private static final SQLitePLuginResult EMPTY_RESULT = new SQLitePLuginResult(EMPTY_ROWS, EMPTY_COLUMNS, 0, 0, null);

  private static final Map<String, SQLiteDatabase> DATABASES = new HashMap<String, SQLiteDatabase>();

  private final Handler backgroundHandler = createBackgroundHandler();

  private Handler createBackgroundHandler() {
    HandlerThread thread = new HandlerThread("SQLitePlugin BG Thread");
    thread.start();
    return new Handler(thread.getLooper());
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    debug("execute(%s)", action);
    this.run(args, callbackContext);
    return true;
  }

  private void run(final JSONArray args, final CallbackContext callbackContext) {
    backgroundHandler.post(new Runnable() {
      @Override
      public void run() {
        try {
          runInBackground(args, callbackContext);
        } catch (Throwable e) {
          e.printStackTrace(); // should never happen
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  private void runInBackground(JSONArray args, CallbackContext callbackContext) throws JSONException {
    SQLitePLuginResult[] pluginResults = execInBackgroundAndReturnResults(args);
    callbackContext.success(pluginResultsToString(pluginResults));
  }

  private SQLitePLuginResult[] execInBackgroundAndReturnResults(JSONArray args) throws JSONException {

    String dbName = args.getString(0);
    JSONArray queries = args.getJSONArray(1);
    boolean readOnly = args.getBoolean(2);
    int numQueries = queries.length();
    SQLitePLuginResult[] results = new SQLitePLuginResult[numQueries];
    SQLiteDatabase db = getDatabase(dbName);

    for (int i = 0; i < numQueries; i++) {
      JSONArray sqlQuery = queries.getJSONArray(i);
      String sql = sqlQuery.getString(0);
      String[] bindArgs = jsonArrayToStringArray(sqlQuery.getJSONArray(1));
      try {
        if (isSelect(sql)) {
          results[i] = doSelectInBackgroundAndPossiblyThrow(sql, bindArgs, db);
        } else { // update/insert/delete
          if (readOnly) {
            results[i] = new SQLitePLuginResult(EMPTY_ROWS, EMPTY_COLUMNS, 0, 0, new ReadOnlyException());
          } else {
            results[i] = doUpdateInBackgroundAndPossiblyThrow(sql, bindArgs, db);
          }
        }
      } catch (Throwable e) {
        if (DEBUG_MODE) {
          e.printStackTrace();
        }
        results[i] = new SQLitePLuginResult(EMPTY_ROWS, EMPTY_COLUMNS, 0, 0, e);
      }
    }
    return results;
  }

  // do a update/delete/insert operation
  private SQLitePLuginResult doUpdateInBackgroundAndPossiblyThrow(String sql, String[] bindArgs,
                                                                  SQLiteDatabase db) {
    debug("\"run\" query: %s", sql);
    SQLiteStatement statement = null;
    try {
      statement = db.compileStatement(sql);
      debug("compiled statement");
      if (bindArgs != null) {
        statement.bindAllArgsAsStrings(bindArgs);
      }
      debug("bound args");
      if (isInsert(sql)) {
        debug("type: insert");
        long insertId = statement.executeInsert();
        int rowsAffected = insertId >= 0 ? 1 : 0;
        return new SQLitePLuginResult(EMPTY_ROWS, EMPTY_COLUMNS, rowsAffected, insertId, null);
      } else if (isDelete(sql) || isUpdate(sql)) {
        debug("type: update/delete");
        int rowsAffected = statement.executeUpdateDelete();
        return new SQLitePLuginResult(EMPTY_ROWS, EMPTY_COLUMNS, rowsAffected, 0, null);
      } else {
        // in this case, we don't need rowsAffected or insertId, so we can have a slight
        // perf boost by just executing the query
        debug("type: drop/create/etc.");
        statement.execute();
        return EMPTY_RESULT;
      }
    } finally {
      if (statement != null) {
        statement.close();
      }
    }
  }

  // do a select operation
  private SQLitePLuginResult doSelectInBackgroundAndPossiblyThrow(String sql, String[] bindArgs,
                                                                  SQLiteDatabase db) {
    debug("\"all\" query: %s", sql);
    Cursor cursor = null;
    try {
      cursor = db.rawQuery(sql, bindArgs);
      int numRows = cursor.getCount();
      if (numRows == 0) {
        return EMPTY_RESULT;
      }
      int numColumns = cursor.getColumnCount();
      Object[][] rows = new Object[numRows][];
      String[] columnNames = cursor.getColumnNames();
      for (int i = 0; cursor.moveToNext(); i++) {
        Object[] row = new Object[numColumns];
        for (int j = 0; j < numColumns; j++) {
          row[j] = getValueFromCursor(cursor, j, cursor.getType(j));
        }
        rows[i] = row;
      }
      debug("returning %d rows", numRows);
      return new SQLitePLuginResult(rows, columnNames, 0, 0, null);
    } finally {
      if (cursor != null) {
        cursor.close();
      }
    }
  }

  private Object getValueFromCursor(Cursor cursor, int index, int columnType) {
    switch (columnType) {
      case Cursor.FIELD_TYPE_FLOAT:
        return cursor.getFloat(index);
      case Cursor.FIELD_TYPE_INTEGER:
        return cursor.getInt(index);
      case Cursor.FIELD_TYPE_BLOB:
        // convert byte[] to binary string; it's good enough, because
        // WebSQL doesn't support blobs anyway
        return new String(cursor.getBlob(index));
      case Cursor.FIELD_TYPE_STRING:
        return cursor.getString(index);
    }
    return null;
  }

  private SQLiteDatabase getDatabase(String name) {
    SQLiteDatabase database = DATABASES.get(name);
    if (database == null) {
      if (":memory:".equals(name)) {
        database = SQLiteDatabase.openOrCreateDatabase(name, null);
      } else {
        File file = new File(cordova.getActivity().getFilesDir(), name);
        database = SQLiteDatabase.openOrCreateDatabase(file, null);
      }
      DATABASES.put(name, database);
    }
    return database;
  }

  private static void debug(String line, Object... format) {
    if (DEBUG_MODE) {
      Log.d(TAG, String.format(line, format));
    }
  }

  private static String pluginResultsToString(SQLitePLuginResult[] results) throws JSONException {
    // Instead of converting to a json array, we convert directly to a string
    // because the perf ends up being better, since Cordova will just stringify
    // the JSONArray anyway.
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < results.length; i++) {
      if (i > 0) {
        sb.append(',');
      }
      appendPluginResult(results[i], sb);
    }
    return sb.append(']').toString();
  }

  private static void appendPluginResult(SQLitePLuginResult result, StringBuilder sb) throws JSONException {
    sb.append('[');
    if (result.error == null) {
      sb.append("null");
    } else {
      sb.append(JSONObject.quote(result.error.getMessage()));
    }
    sb.append(',')
        .append(JSONObject.numberToString(result.insertId))
        .append(',')
        .append(JSONObject.numberToString(result.rowsAffected))
        .append(',');

    // column names
    sb.append('[');
    for (int i = 0; i < result.columns.length; i++) {
      if (i > 0) {
        sb.append(',');
      }
      sb.append(JSONObject.quote(result.columns[i]));
    }
    sb.append("],[");
    // rows
    for (int i = 0; i < result.rows.length; i++) {
      if (i > 0) {
        sb.append(',');
      }
      Object[] values = result.rows[i];
      // row content
      sb.append('[');
      for (int j = 0; j < values.length; j++) {
        if (j > 0) {
          sb.append(',');
        }
        Object value = values[j];
        if (value == null) {
          sb.append("null");
        } else if (value instanceof String) {
          sb.append(JSONObject.quote((String)value));
        } else if (value instanceof Boolean) {
          sb.append(value.toString());
        } else {
          sb.append(JSONObject.numberToString((Number)value));
        }
      }
      sb.append(']');
    }
    sb.append("]]");

    debug("returning json: %s", sb);
  }

  private static boolean isSelect(String str) {
    return startsWithCaseInsensitive(str, "select");
  }
  private static boolean isInsert(String str) {
    return startsWithCaseInsensitive(str, "insert");
  }
  private static boolean isUpdate(String str) {
    return startsWithCaseInsensitive(str, "update");
  }
  private static boolean isDelete(String str) {
    return startsWithCaseInsensitive(str, "delete");
  }

  // identify an "insert"/"select" query more efficiently than with a Pattern
  private static boolean startsWithCaseInsensitive(String str, String substr) {
    int i = -1;
    int len = str.length();
    while (++i < len) {
      char ch = str.charAt(i);
      if (!Character.isWhitespace(ch)) {
        break;
      }
    }

    int j = -1;
    int substrLen = substr.length();
    while (++j < substrLen) {
      if (j + i >= len) {
        return false;
      }
      char ch = str.charAt(j + i);
      if (Character.toLowerCase(ch) != substr.charAt(j)) {
        return false;
      }
    }
    return true;
  }

  private static String[] jsonArrayToStringArray(JSONArray jsonArray) throws JSONException {
    int len = jsonArray.length();
    String[] res = new String[len];
    for (int i = 0; i < len; i++) {
      res[i] = jsonArray.getString(i);
    }
    return res;
  }

  private static class SQLitePLuginResult {
    public final Object[][] rows;
    public final String[] columns;
    public final int rowsAffected;
    public final long insertId;
    public final Throwable error;

    public SQLitePLuginResult(Object[][] rows, String[] columns,
                              int rowsAffected, long insertId, Throwable error) {
      this.rows = rows;
      this.columns = columns;
      this.rowsAffected = rowsAffected;
      this.insertId = insertId;
      this.error = error;
    }
  }

  private static class ReadOnlyException extends Exception {
    public ReadOnlyException() {
      super("could not prepare statement (23 not authorized)");
    }
  }
}

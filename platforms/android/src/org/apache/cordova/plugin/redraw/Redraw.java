package org.apache.cordova.plugin.redraw;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Redraw extends CordovaPlugin {

  @Override
  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
    
    if(!"invalidateWebView".equals(action)) {
      return false;
    }

    // 300ms was the sweet spot it seems, but allow it to be overridden
    long delay = 300;
    if(args.length() == 1) {
      delay = args.getLong(0);
    }

    // Post a request for a redraw on the UI thread, with the specified delay
    this.webView.postInvalidateDelayed(delay);

    return true;
  }

}
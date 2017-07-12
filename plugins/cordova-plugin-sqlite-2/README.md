Cordova SQLite Plugin 2 [![Build Status](https://travis-ci.org/nolanlawson/cordova-plugin-sqlite-2.svg?branch=master)](https://travis-ci.org/nolanlawson/cordova-plugin-sqlite-2)
=====

A rewrite/fork of the [Cordova SQLite Plugin](https://github.com/litehelpers/Cordova-sqlite-storage). In most cases, it should be a drop-in replacement.

This plugin provides a [WebSQL](http://www.w3.org/TR/webdatabase/)-compatible API to store data
in a Cordova/PhoneGap/Ionic app, by using a SQLite database on the native side. The main
benefits are:

1. unlimited and durable storage
2. prepopulated databases
3. support where WebSQL isn't available ([namely iOS WKWebView](https://bugs.webkit.org/show_bug.cgi?id=137760))

**Note:** if you can avoid using this plugin in favor of [IndexedDB](http://w3c.github.io/IndexedDB/) (or regular WebSQL), then you should.
Performance, browser support, and future prospects are all better in IndexedDB. Please see [goals](#goals) and [non-goals](#non-goals) for more explanation.

Install
----

For Ionic, use the [Ionic CLI](http://ionicframework.com/docs/cli/):

    ionic plugin add cordova-plugin-sqlite-2

Otherwise, use the [Cordova CLI](https://www.npmjs.com/package/cordova):

    cordova plugin add cordova-plugin-sqlite-2

In both cases, the plugin will be downloaded [from npm](https://www.npmjs.com/package/cordova-plugin-sqlite-2).

Usage
----

This plugin creates a global `window.sqlitePlugin` object, with an `openDatabase` function
that is exactly the same as WebSQL. Example usage:

```js
var db = sqlitePlugin.openDatabase('mydb.db', '1.0', '', 1);
db.transaction(function (txn) {
  txn.executeSql('SELECT 42 AS `answer`', [], function (tx, res) {
    console.log(res.rows.item(0)); // {"answer": 42}
  });
});
```

Only the first argument to `openDatabase()` (the database name) is required.
The other values may be provided for backwards compatibility with WebSQL, but are ignored.

You can also pass in a single options object with the `name` key. This is for compatibility
with the original SQLite Plugin, although it is non-standard with respect to WebSQL:

```js
var db = sqlitePlugin.openDatabase({name: 'mydb.db'});
```

You can also create an in-memory SQLite database like so:

```js
var db = sqlitePlugin.openDatabase(':memory:');
```

Both `readTransaction()` (read-only) and `transaction()` (read-write) are supported.
`readTransaction()` has some small performance optimizations, so it's worthwhile to
use if you're not writing any data in a transaction.

For a tutorial on how to use WebSQL, check out [the HTML5 Rocks article](http://www.html5rocks.com/en/tutorials/webdatabase/todo/) or [the HTML5 Doctor article](http://html5doctor.com/introducing-web-sql-databases/).

Goals
---

- **Minimal:** Just polyfills WebSQL via native SQLite.
- **Well-tested:** Over 600 automated tests that [run in CI](https://travis-ci.org/nolanlawson/cordova-plugin-sqlite-2/builds) (many borrowed from the [PouchDB](http://pouchdb.com/) test suite).
- **Lightweight:** Instead of bundling SQLite with the plugin, it uses the built-in Android and iOS APIs.
- **Simple**: Uses [node-websql](https://github.com/nolanlawson/node-websql) to maximize code re-use. Transactional logic is mostly implemented in JavaScript.

Non-goals
----

This project is not designed to replicate 100% of the functionality of the old SQLite Plugin – deleting databases, closing databases, specifying a particular location, etc. The goal is just to provide a bridge to WebSQL, especially for environments where WebSQL is unavailable and IndexedDB is unfeasible (e.g. WKWebView on iOS).

If possible, you should prefer IndexedDB, e.g. via wrapper library like [Dexie](http://dexie.org/), [LocalForage](http://mozilla.github.io/localForage/), or [PouchDB](http://pouchdb.com/). This plugin should be thought of as a polyfill for less-capable platforms ([namely iOS](http://www.raymondcamden.com/2014/09/25/IndexedDB-on-iOS-8-Broken-Bad/)) while we wait for their browser implementations to catch up.

For more thoughts on why this plugin exists, read [my introductory blog post](https://nolanlawson.com/2016/04/10/introducing-the-cordova-sqlite-plugin-2/).

Supported platforms
---

- Android 4.0+ (including Crosswalk)
- iOS 8+ (both UIWebView and WKWebView)

To see which platforms are tested in CI, check out [the Travis builds](https://travis-ci.org/nolanlawson/cordova-plugin-sqlite-2/builds).
Android <4.4 and Crosswalk are not tested in CI due to limitations of Chromedriver, but have been manually confirmed to work.

For Windows Phone, you are recommended to use [cordova-plugin-websql](https://github.com/MSOpenTech/cordova-plugin-websql) instead.

Android vs iOS
----

**TLDR:** This plugin is more useful on iOS than on Android.

#### Android

If possible, you should avoid using this library on Android.
It works, but IndexedDB and WebSQL are better supported and faster on that platform.

To skip using it on Android, just do:

```js
document.addEventListener('deviceready', function () {
  if (/Android/i.test(navigator.userAgent)) {
    delete window.sqlitePlugin;
  }
}, false);
```

This will prevent tools like PouchDB from using the `sqlitePlugin` object, so they
can use IndexedDB/WebSQL instead.

#### iOS

On iOS, this plugin is quite a bit slower than native WebSQL, due to the overhead of serializing data sent between the WebView and the native layer. However, sometimes native WebSQL isn't an option: e.g. you are using WKWebView (where [WebSQL is not supported](https://bugs.webkit.org/show_bug.cgi?id=137760)), or you need to store more than [the maximum allowed by Apple in regular WebSQL](https://pouchdb.com/errors.html#not_enough_space). In those cases, this plugin can be very handy.

On both iOS and Android, this plugin can also be considered useful if you need huge
amounts of storage, or prepopulated databases.

How do I create a prepopulated database?
-----

Follow these steps:

1. Put your database file (e.g. `mydatabase.db`) in `www/`.

2. Install [the Cordova file plugin](https://github.com/apache/cordova-plugin-file).

3. Copy the file from the read-only `www/` subdirectory in `cordova.file.applicationDirectory`
to the read-write `cordova.file.dataDirectory`, using the Cordova file plugin APIs.

For more details, check out the [prepopulated database demo app](https://github.com/nolanlawson/cordova-prepopulated-database-demo).

Where is data stored?
----

On Android, it's stored in the app's local directory, under `files/`, accessed natively
via:

```java
File dir = getContext().getFilesDir();
```

On iOS, it's in `Library/NoCloud/`, following [the Cordova file plugin](https://github.com/apache/cordova-plugin-file) 
convention (and [unlike the original SQLite Plugin](https://github.com/litehelpers/Cordova-sqlite-storage/issues/430)).
It can be accessed natively via:

```objective-c
NSString *dir = [
  [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)
    objectAtIndex: 0]
  stringByAppendingPathComponent:@"NoCloud"];
```

Any database you store in there is accessible directly by filename.
E.g. if your file is called `foo.db`, then you open it with:

```js
var db = sqlitePlugin.openDatabase('foo.db', '1.0', '', 1);
```

Migrating from the original SQLite Plugin
------

On iOS, the original SQLite Plugin does not use the standard `Library/NoCloud`, 
but rather `Library/LocalDatabase` ([source](https://github.com/litehelpers/Cordova-sqlite-storage/issues/430)).
So you will need to migrate if you are upgrading an existing app to the SQLite Plugin 2.

To migrate, what you essentially need to do is copy the database file from `Library/LocalDatabase` to `Library/NoCloud`,
using [the Cordova file plugin](https://github.com/apache/cordova-plugin-file).  Here is [some sample code](https://gist.github.com/nolanlawson/1b3ad1c4b327f49a0d59e6e94cff49b6) to get you started. You can also check out the [prepopulated database demo app](https://github.com/nolanlawson/cordova-prepopulated-database-demo), which performs a similar file copy operation.

Building
---

Check out the code, then run:

    npm install

Then:

    npm run build

This will build the JS files and write them to `dist/`.

Testing
----

To run the eslint tests:

    npm run lint

To run the tests on any available Android device:

    npm run test-android

Or using Crosswalk:

    CROSSWALK=1 npm run test-android

To run the tests on any available iOS device:

    npm run test-ios

Or using WKWebView:

    WKWEBVIEW=1 npm run test-ios

Or to use normal WebSQL on either iOS or Android:

    WEBSQL=1 npm run test-ios
    WEBSQL=1 npm run test-android

Or to run the tests against PhantomJS, using normal WebSQL:

    npm run test-phantom

You can also run performance tests:

    PLATFORM=ios npm run test-perf
    PLATFORM=android npm run test-perf
    PLATFORM=ios WEBSQL=1 npm run test-perf
    PLATFORM=android WEBSQL=1 npm run test-perf
    PLATFORM=ios WKWEBVIEW=1 npm run test-perf
    PLATFORM=ios OLD_SQLITE_PLUGIN=1 npm run test-perf

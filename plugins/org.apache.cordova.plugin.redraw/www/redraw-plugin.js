var exec = require("cordova/exec");

var Redraw = function() {};

Redraw.invalidateWebView = function (successCallback, errorCallback) {
    exec(successCallback, errorCallback, "Redraw", "invalidateWebView", []);
};

Redraw.invalidateWebViewDelayed = function (delay, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "Redraw", "invalidateWebView", [delay]);
};

module.exports = Redraw;
//
//  Paolo Messina
//
//  Created by Paolo Messina on 06/07/15.
//
//

var argscheck = require('cordova/argscheck'),
    exec      = require('cordova/exec');

function OpenUrlExt () {};

OpenUrlExt.prototype = {

    open: function (url, success, failure, params)
    {
    	var urlHashed;
    	if(params && params.encode == false)
    		urlHashed = url;
    	else 
    		urlHashed = encodeURI(url);
    	var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
    	if(deviceType == "Android"){
    		if(navigator)
    			navigator.app.loadUrl(urlHashed, {openExternal : true});
    		else {
    			window.open(urlHashed, '_system');
    		}
    	} else {
    		exec(success, failure, 'OpenUrlExt', 'open', [url]);
    	}
    }
};

module.exports = new OpenUrlExt();

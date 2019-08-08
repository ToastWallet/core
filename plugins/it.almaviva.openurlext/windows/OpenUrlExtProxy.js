cordova.commandProxy.add("OpenUrlExt", {
	open: function (successCallback, errorCallback, params) {
		Windows.System.Launcher.launchUriAsync(params[0]).done(
        function (success) {
            if (success) { 
            	console.log("page opened correctly"); 
            }
            else { 
            	console.log("an error has occured");
            	 }
            });
	}
});
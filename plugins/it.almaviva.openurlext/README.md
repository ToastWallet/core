# OpenUrlExt
Open a specific URL in the external browser of the hosting OS.

## Installation

    cordova plugin add https://github.com/PaoloMessina/OpenUrlExt

## License

This plugin is released under the MIT license

## API

### open

	OpenUrlExt.open(url, onSuccess, onFailure);

Arguments:

- **url**: The url too open, will be encoded.
- **onSuccess**: function () {...} _Callback for successful scan._
- **onFailure**: function () {...} _Callback for cancelled scan or error._

Return:

- success() _Successful opening_
- error() _Error on opening_

Example:

    ```javascript
    {
        OpenUrlExt.open(urlString,
        				function(){ 
        					console.log("ok");
        				}, 
        				function(){ 
        					console.log("ko");
        				});
    }
    ```

## Quirks:

- __Android__: The plugin is not native but a simple call to javascript that just working well.


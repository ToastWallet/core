# A minimal sodium plugin for Cordova - for iOS and Android

A minimal build of the [libsodium](https://github.com/jedisct1/libsodium.git) library, as a plugin for Cordova applications on iOS and Android.

## Bound methods and constants

### Secretbox construction
* `crypto_secretbox_easy`
* `crypto_secretbox_open_easy`
* `crypto_secretbox_KEYBYTES`
* `crypto_secretbox_MACBYTES`
* `crypto_secretbox_NONCEBYTES`

### Public key signatures (Ed25519)
* `crypto_sign`
* `crypto_sign_open`
* `crypto_sign_detached`
* `crypto_sign_verify_detached`
* `crypto_sign_keypair`
* `crypto_sign_seed_keypair`
* `crypto_sign_ed25519_sk_to_pk`
* `crypto_sign_ed25519_sk_to_seed`
* `crypto_sign_BYTES`
* `crypto_sign_PUBLICKEYBYTES`
* `crypto_sign_SECRETKEYBYTES`
* `crypto_sign_SEEDBYTES`

### Key exchange (Curve25519)

* `crypto_scalarmult`
* `crypto_scalarmult_base`
* `crypto_scalarmult_BYTES`
* `crypto_scalarmult_SCALARBYTES`

### X25519 (Ed25519 -> Curve25519 conversion)

* `crypto_sign_ed25519_pk_to_curve25519`
* `crypto_sign_ed25519_sk_to_curve25519`

### Memory-hard password derivation (Scrypt)

* `crypto_pwhash_scryptsalsa208sha256`
* `crypto_pwhash_scryptsalsa208sha256_ll`
* `crypto_pwhash_scryptsalsa208sha256_SALTBYTES`
* `crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_INTERACTIVE`
* `crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_INTERACTIVE`

__NOTE:__ the constants `crypto_pwhash_scryptsalsa208sha256_*_SENSITIVE` have not been bound. Not that they were forgotten, but it's a design choice. A standard smartphone will most likely be too slow if these constants are used in scrypt. These values are not forbidden though...

### Box construction

* `crypto_box_keypair`
* `crypto_box_easy`
* `crypto_box_open_easy`
* `crypto_box_PUBLICKEYBYTES`
* `crypto_box_SECRETKEYBYTES`
* `crypto_box_NONCEBYTES`
* `crypto_box_SEEDBYTES`
* `crypto_box_MACBYTES`

### Sealed box construction

* `crypto_box_seal`
* `crypto_box_seal_open`
* `crypto_box_SEALBYTES`

### Generic hashing

* `crypto_generichash`
* `crypto_generichash_BYTES`
* `crypto_generichash_BYTES_MIN`
* `crypto_generichash_BYTES_MAX`
* `crypto_generichash_KEYBYTES`
* `crypto_generichash_KEYBYTES_MIN`
* `crypto_generichash_KEYBYTES_MAX`

### Helper methods

`HexString <-> Uint8Array` conversion
* `to_hex`
* `from_hex`

`UTF8String <-> Uint8Array` conversion
* `to_string`
* `from_string`

`Base64String <-> Uint8Array` conversion
* `to_base64`
* `from_base64`

## Installation

	cordova plugin add cordova-plugin-minisodium

__Note:__ This plugin is not built for Android API levels below 16. To set the `minSdkVersion` property in your Cordova app (if needed), add the following line in `config.xml`:
```
<preference name="android-minSdkVersion" value="16"/>
```

## Usage

Once the plugin is installed, all the methods of this plugin are available in `window.plugins.MiniSodium`.

Results of these methods are not returned, but rather passed to a callback function. The callback function will receive 2 parameters : `(err, result)`, where:
* `err` is an error (either a string or an `Error` instance), defined if an error occurred in the method
* `result` is the result of the method call (such as a ciphertext, a plaintext, a derived key, a key pair,...). Results are always `Uint8Array` instances, except for `keypair` generation methods, where `result` is a `{pk, sk}` object (`pk` and `sk` are Uint8Array containing the public and private/secret keys respectively)

Raw data parameters (e.g: message, ciphertext, keys, nonces, hashes,...) must provided either as `Uint8Array` instances or as hexadecimal strings.

The order of parameters in the bound methods is nearly respected (compared to the original [libsodium](https://github.com/jedisct1/libsodium) library)

If you have questions about the parameters of the methods, we advise you to [read the documentation](https://download.libsodium.org/libsodium/content/) of the original library

Anyway, here is this plugin's API:

__[Secretbox](https://download.libsodium.org/libsodium/content/secret-key_cryptography/authenticated_encryption.html)__
* `MiniSodium.crypto_secretbox_easy(message, nonce, key, callback)`
* `MiniSodium.crypto_secretbox_open_easy(ciphertext, nonce, key, callback)`

__[Sign](https://download.libsodium.org/libsodium/content/public-key_cryptography/public-key_signatures.html)__
* `MiniSodium.crypto_sign_keypair(callback)`
* `MiniSodium.crypto_sign_seed_keypair(seed, callback)`
* `MiniSodium.crypto_sign(message, secretKey, callback)`
* `MiniSodium.crypto_sign_open(signedMessage, publicKey, callback)` __NOTE:__ This method passes the message (without the signature) to the callback if the signature is valid. If the signature is invalid it passes `0` or `false` instead
* `MiniSodium.crypto_sign_detached(message, secretKey, callback)`
* `MiniSodium.crypto_sign_verify_detached(signature, message, publicKey, callback)` __NOTE:__ The result of this method is a boolean. The callback receives `true` or `1` if the signature is valid `false` or `0` otherwise
* `MiniSodium.crypto_sign_ed25519_sk_to_seed(secretKey, callback)`
* `MiniSodium.crypto_sign_ed25519_sk_to_pk(secretKey, callback)`

__[Ed25519 -> Curve25519 conversion](https://download.libsodium.org/libsodium/content/advanced/ed25519-curve25519.html)__
* `MiniSodium.crypto_sign_ed25519_pk_to_curve25519(ed25519Pk, callback)`
* `MiniSodium.crypto_sign_ed25519_sk_to_curve25519(ed25519Sk, callback)`

__[Scalarmult (Curve25519)](https://download.libsodium.org/libsodium/content/advanced/scalar_multiplication.html)__
* `MiniSodium.crypto_scalarmult_base(n, callback)`
* `MiniSodium.crypto_scalarmult(n, p, callback)`

__[Password-hashing (Scrypt)](https://download.libsodium.org/libsodium/content/password_hashing/scrypt.html)__
* `MiniSodium.crypto_pwhash_scryptsalsa208sha256(keyLength, password, salt, opsLimit, memLimit, callback)`
* `MiniSodium.crypto_pwhash_scryptsalsa208sha256_ll(password, salt, opsLimit, r, p, keyLength, callback)`

__[Box](https://download.libsodium.org/libsodium/content/public-key_cryptography/authenticated_encryption.html)__
* `MiniSodium.crypto_box_keypair(callback)`
* `MiniSodium.crypto_box_easy(message, nonce, receiverPk, senderSk, callback)`
* `MiniSodium.crypto_box_open_easy(cipher, nonce, senderPk, receiverSk, callback)`

__[Sealed box](https://download.libsodium.org/libsodium/content/public-key_cryptography/sealed_boxes.html)__
* `MiniSodium.crypto_box_seal(message, receiverPk, callback)`
* `MiniSodium.crypto_box_seal_open(message, receiverPk, receiverSk, callback)`

__[Generic hashing](https://download.libsodium.org/libsodium/content/hashing/generic_hashing.html)__
* `MiniSodium.crypto_generichash(hashLength, message, [key], callback)` Please note that `key` is an optional parameter. If omitted, you should put `undefined` or `null` in its place when calling this method

## Testing

1. Create a Cordova/Phonegap application
2. Add the iOS and/or the Android platforms
3. Add the [testing framework](https://github.com/apache/cordova-plugin-test-framework) and [bind its page](https://github.com/apache/cordova-plugin-test-framework#running-plugin-tests) as the main page of the app
4. Add the following preference in `config.xml`
```
<preference name="android-minSdkVersion" value="16"/>
```
5. Add this plugin
6. Add this plugin's test cases, by adding the plugin located in the `tests` folder
```
	phonegap plugin add https://github.com/LockateMe/cordova-plugin-minisodium.git#:/tests
```

## License

MIT license

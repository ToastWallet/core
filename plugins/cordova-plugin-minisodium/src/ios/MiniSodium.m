#import "MiniSodium.h"

#import <Cordova/CDV.h>
#import <Cordova/CDVPluginResult.h>

#import "sodium.h"

@implementation MiniSodium

- (void)pluginInitialize {
	self.sodiumInitStatus = sodium_init();
}

- (void)crypto_secretbox_easy:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *messageHex = [command.arguments objectAtIndex: 0];
	const unsigned char* message = [self from_hex:messageHex];
	const unsigned long long mlen = (unsigned long long) [messageHex length] / 2;

	NSString *nonceHex = [command.arguments objectAtIndex: 1];
	const unsigned char* nonce = [self from_hex: nonceHex];

	NSString *keyHex = [command.arguments objectAtIndex: 2];
	const unsigned char* key = [self from_hex: keyHex];

 	unsigned long long clen = (unsigned long long)(mlen + crypto_secretbox_MACBYTES);
	unsigned char* c = (unsigned char*) sodium_malloc(clen);

	crypto_secretbox_easy(c, message, mlen, nonce, key);

	NSString *cHex = [self to_hex: c withLength: clen];

	CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: cHex];
	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(c);
}

- (void)crypto_secretbox_open_easy:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString* ciphertextHex = [command.arguments objectAtIndex: 0];
	const unsigned char* ciphertext = [self from_hex: ciphertextHex];
	const unsigned long long clen = (unsigned long long)[ciphertextHex length] / 2;

	NSString *nonceHex = [command.arguments objectAtIndex: 1];
	const unsigned char* nonce = [self from_hex: nonceHex];

	NSString *keyHex = [command.arguments objectAtIndex: 2];
	const unsigned char* key = [self from_hex: keyHex];

	const unsigned long long mlen = (unsigned long long) clen - crypto_secretbox_MACBYTES;
	unsigned char* m = (unsigned char*) sodium_malloc(mlen);

	if (crypto_secretbox_open_easy(m , ciphertext, clen, nonce, key) != 0){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_DECRYPT"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	} else {
		NSString *mHex = [self to_hex: m withLength: mlen];
		//NSData *mNSData = [[NSData alloc] initWithBytes: m length: mlen];

		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: mHex];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	}

	sodium_free(m);
}

-(void)crypto_sign_keypair:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	//No seed is provided
	unsigned char* pk = (unsigned char*) sodium_malloc(crypto_sign_PUBLICKEYBYTES);
	unsigned char* sk = (unsigned char*) sodium_malloc(crypto_sign_SECRETKEYBYTES);

	if (crypto_sign_keypair(pk, sk) != 0){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_GENERATE_KEYPAIR"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	} else {
		NSString *pkHex = [self to_hex: pk withLength: crypto_sign_PUBLICKEYBYTES];
		NSString *skHex = [self to_hex: sk withLength: crypto_sign_SECRETKEYBYTES];

		NSDictionary *resObj = [NSDictionary dictionaryWithDictionary:@{@"pk": pkHex, @"sk": skHex}];
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: resObj];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	}

	sodium_free(pk);
	sodium_free(sk);
}

-(void)crypto_sign_seed_keypair:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	//A seed is provided
	NSString *seedHex = [command.arguments objectAtIndex: 0];
	const unsigned char* seed = [self from_hex: seedHex];
	const unsigned long long seedlen = (unsigned long long)[seedHex length] / 2;

	if (seedlen != crypto_sign_SEEDBYTES){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"INVALID_SEED_LENGTH"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
		return;
	}

	unsigned char* pk = (unsigned char*) sodium_malloc(crypto_sign_PUBLICKEYBYTES);
	unsigned char* sk = (unsigned char*) sodium_malloc(crypto_sign_SECRETKEYBYTES);

	if (crypto_sign_seed_keypair(pk, sk, seed) != 0){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_GENERATE_KEYPAIR"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	} else {
		NSString *pkHex = [self to_hex: pk withLength: crypto_sign_PUBLICKEYBYTES];
		NSString *skHex = [self to_hex: sk withLength: crypto_sign_SECRETKEYBYTES];

		NSDictionary *resObj = [NSDictionary dictionaryWithDictionary:@{@"pk": pkHex, @"sk": skHex}];
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: resObj];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	}

	sodium_free(pk);
	sodium_free(sk);
}

-(void)crypto_sign:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *mHex = [command.arguments objectAtIndex: 0];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long) [mHex length] / 2;

	NSString *skHex = [command.arguments objectAtIndex: 1];
	const unsigned char* sk = [self from_hex: skHex];
	const unsigned long long sklen = (unsigned long long) [skHex length] / 2;

	unsigned long long slen = mlen + crypto_sign_BYTES;
	unsigned char* s = (unsigned char*) sodium_malloc(slen);

	if (crypto_sign(s, &slen, m, mlen, sk) != 0){
		//Signature failure
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_SIGN"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	} else {
		//Signature success
		NSString *sHex = [self to_hex: s withLength: slen];
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: sHex];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	}

	sodium_free(s);
}

-(void)crypto_sign_open:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *sHex = [command.arguments objectAtIndex: 0];
	const unsigned char* s = [self from_hex: sHex];
	const unsigned long long slen = (unsigned long long) [sHex length] / 2;

	NSString *pkHex = [command.arguments objectAtIndex: 1];
	const unsigned char* pk = [self from_hex: pkHex];
	const unsigned long long pklen = (unsigned long long) [pkHex length] / 2;

	unsigned long long mlen = slen - crypto_sign_BYTES;
	unsigned char* m = (unsigned char*) sodium_malloc(mlen);

	int sigStatus = crypto_sign_open(m, &mlen, s, slen, pk);

	CDVPluginResult *result;

	if (sigStatus == 0){
		NSString *mHex = [self to_hex: m withLength: mlen];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: mHex];
	} else {
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsBool: false];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(m);
}

-(void)crypto_sign_detached:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *mHex = [command.arguments objectAtIndex: 0];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long)[mHex length] / 2;

	NSString *skHex = [command.arguments objectAtIndex: 1];
	const unsigned char* sk = [self from_hex: skHex];

	unsigned long long slen;
	unsigned char* s = (unsigned char*) sodium_malloc(crypto_sign_BYTES);

	if (crypto_sign_detached(s, &slen, m, mlen, sk) != 0){
		//Signature failure
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_SIGN"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	} else {
		//Signature success
		NSString *sHex = [self to_hex: s withLength: slen];
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: sHex];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
	}

	sodium_free(s);
}

-(void)crypto_sign_verify_detached:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *sHex = [command.arguments objectAtIndex: 0];
	const unsigned char* s = [self from_hex: sHex];
	const unsigned long long slen = (unsigned long long)[sHex length] / 2;

	if (slen != crypto_sign_BYTES){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"INVALID_SIGNATURE_LENGTH"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
		return;
	}

	NSString *mHex = [command.arguments objectAtIndex: 1];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long) [mHex length] / 2;

	NSString *pkHex = [command.arguments objectAtIndex: 2];
	const unsigned char* pk = [self from_hex: pkHex];
	const unsigned long long pklen = (unsigned long long) [pkHex length] / 2;

	int sigStatus = crypto_sign_verify_detached(s, m, mlen, pk);

	CDVPluginResult *result;
	if (sigStatus == 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsBool: true];
	} else {
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsBool: false];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
}

-(void)crypto_sign_ed25519_sk_to_seed:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *skHex = [command.arguments objectAtIndex: 0];
	const unsigned char* sk = [self from_hex: skHex];
	const unsigned long long sklen = (unsigned long long) [skHex length] / 2;

	unsigned char* seed = (unsigned char*) sodium_malloc(crypto_sign_SEEDBYTES);

	CDVPluginResult *result;
	if (crypto_sign_ed25519_sk_to_seed(seed, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *seedHex = [self to_hex: seed withLength: crypto_sign_SEEDBYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: seedHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(seed);
}

-(void)crypto_sign_ed25519_sk_to_pk:(CDVInvokedUrlCommand*) command {
	if (![self sodium_init_check: command]) return;

	NSString *skHex = [command.arguments objectAtIndex: 0];
	const unsigned char* sk = [self from_hex: skHex];
	const unsigned long long sklen = (unsigned long long) [skHex length] / 2;

	unsigned char* pk = (unsigned char*) sodium_malloc(crypto_sign_PUBLICKEYBYTES);

	CDVPluginResult *result;
	if (crypto_sign_ed25519_sk_to_pk(pk, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *pkHex = [self to_hex: pk withLength: crypto_sign_PUBLICKEYBYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: pkHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(pk);
}

-(void)crypto_sign_ed25519_sk_to_curve25519:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString* skHex = [command.arguments objectAtIndex: 0];
	const unsigned char* sk = [self from_hex: skHex];

	unsigned char* skCurve25519 = (unsigned char*) sodium_malloc(crypto_scalarmult_SCALARBYTES);

	CDVPluginResult *result;
	if (crypto_sign_ed25519_sk_to_curve25519(skCurve25519, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *skCurve25519Hex = [self to_hex: skCurve25519 withLength: crypto_scalarmult_SCALARBYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: skCurve25519Hex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(skCurve25519);
}

-(void)crypto_sign_ed25519_pk_to_curve25519:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString* pkHex = [command.arguments objectAtIndex: 0];
	const unsigned char* pk = [self from_hex: pkHex];

	unsigned char* pkCurve25519 = (unsigned char*) sodium_malloc(crypto_scalarmult_BYTES);

	CDVPluginResult *result;
	if (crypto_sign_ed25519_pk_to_curve25519(pkCurve25519, pk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *pkCurve25519Hex = [self to_hex: pkCurve25519 withLength: crypto_scalarmult_BYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: pkCurve25519Hex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(pkCurve25519);
}

-(void)crypto_scalarmult_base:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *nHex = [command.arguments objectAtIndex: 0];
	const unsigned char* n = [self from_hex: nHex];

	unsigned char* q = (unsigned char*) sodium_malloc(crypto_scalarmult_BYTES);

	CDVPluginResult *result;
	if (crypto_scalarmult_base(q, n) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *qHex = [self to_hex: q withLength: crypto_scalarmult_BYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: qHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(q);
}

-(void)crypto_scalarmult:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *nHex = [command.arguments objectAtIndex: 0];
	const unsigned char* n = [self from_hex: nHex];

	NSString *pHex = [command.arguments objectAtIndex: 1];
	const unsigned char* p = [self from_hex: pHex];

	unsigned char* q = (unsigned char*) sodium_malloc(crypto_scalarmult_BYTES);

	CDVPluginResult *result;
	if (crypto_scalarmult(q, n, p) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *qHex = [self to_hex: q withLength: crypto_scalarmult_BYTES];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: qHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(q);
}

-(void)crypto_pwhash_scryptsalsa208sha256:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	const unsigned int keyLength = [[command.arguments objectAtIndex: 0] unsignedIntValue];

	NSString *passwordHex = [command.arguments objectAtIndex: 1];
	const unsigned char* password = [self from_hex: passwordHex];
	const unsigned long long passwordlen = (unsigned long long)[passwordHex length] / 2;

	NSString *saltHex = [command.arguments objectAtIndex: 2];
	const unsigned char* salt = [self from_hex: saltHex];

	const unsigned int opsLimit = [[command.arguments objectAtIndex: 3] unsignedIntValue];
	const unsigned int memLimit = [[command.arguments objectAtIndex: 4] unsignedIntValue];

	unsigned char* key = (unsigned char*) sodium_malloc(keyLength);

	CDVPluginResult *result;
	if (crypto_pwhash_scryptsalsa208sha256(key, keyLength, password, passwordlen, salt, opsLimit, memLimit) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *keyHex = [self to_hex: key withLength: keyLength];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: keyHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(key);
}

-(void)crypto_pwhash_scryptsalsa208sha256_ll:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *passwordHex = [command.arguments objectAtIndex: 0];
	const unsigned char* password = [self from_hex: passwordHex];
	const unsigned long long passwordlen = (unsigned long long) [passwordHex length] / 2;

	NSString *saltHex = [command.arguments objectAtIndex: 1];
	const unsigned char* salt = [self from_hex: saltHex];
	const unsigned long long saltlen = (unsigned long long) [saltHex length] / 2;

	const int opsLimit = [[command.arguments objectAtIndex: 2] unsignedIntValue];
	const int r = [[command.arguments objectAtIndex: 3] unsignedIntValue];
	const int p = [[command.arguments objectAtIndex: 4] unsignedIntValue];
	const int keyLength = [[command.arguments objectAtIndex: 5] unsignedIntValue];

	unsigned char* key = (unsigned char*) sodium_malloc(keyLength);

	CDVPluginResult *result;
	if (crypto_pwhash_scryptsalsa208sha256_ll(password, passwordlen, salt, saltlen, opsLimit, r, p, key, keyLength) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_COMPUTE"];
	} else {
		NSString *keyHex = [self to_hex: key withLength: keyLength];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: keyHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(key);
}

-(void)crypto_box_keypair:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	unsigned char* pk = (unsigned char*) sodium_malloc(crypto_box_PUBLICKEYBYTES);
	unsigned char* sk = (unsigned char*) sodium_malloc(crypto_box_SECRETKEYBYTES);

	CDVPluginResult *result;
	if (crypto_box_keypair(pk, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_GENERATE_KEYPAIR"];
	} else {
		NSString *pkHex = [self to_hex: pk withLength: crypto_box_PUBLICKEYBYTES];
		NSString *skHex = [self to_hex: sk withLength: crypto_box_SECRETKEYBYTES];

		NSDictionary *resObj = [NSDictionary dictionaryWithDictionary:@{@"pk": pkHex, @"sk": skHex}];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: resObj];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(pk);
	sodium_free(sk);
}

-(void)crypto_box_easy:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *mHex = [command.arguments objectAtIndex: 0];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long) [mHex length] / 2;

	NSString *nHex = [command.arguments objectAtIndex: 1];
	const unsigned char* n = [self from_hex: nHex];

	NSString *pkHex = [command.arguments objectAtIndex: 2];
	const unsigned char* pk = [self from_hex: pkHex];

	NSString *skHex = [command.arguments objectAtIndex: 3];
	const unsigned char* sk = [self from_hex: skHex];

	unsigned long long clen = mlen + crypto_box_MACBYTES;
	unsigned char* c = (unsigned char*) sodium_malloc(clen);

	CDVPluginResult *result;
	if (crypto_box_easy(c, m, mlen, n, pk, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_ENCRYPT"];
	} else {
		NSString *cHex = [self to_hex: c withLength: clen];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: cHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(c);
}

-(void)crypto_box_open_easy:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *cHex = [command.arguments objectAtIndex: 0];
	const unsigned char* c = [self from_hex: cHex];
	const unsigned long long clen = (unsigned long long) [cHex length] / 2;

	NSString *nHex = [command.arguments objectAtIndex: 1];
	const unsigned char* n = [self from_hex: nHex];

	NSString *pkHex = [command.arguments objectAtIndex: 2];
	const unsigned char* pk = [self from_hex: pkHex];

	NSString *skHex = [command.arguments objectAtIndex: 3];
	const unsigned char* sk = [self from_hex: skHex];

	unsigned long long mlen = clen - crypto_box_MACBYTES;
	unsigned char* m = (unsigned char*) sodium_malloc(mlen);

	CDVPluginResult *result;
	if (crypto_box_open_easy(m, c, clen, n, pk, sk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_DECRYPT"];
	} else {
		NSString *mHex = [self to_hex: m withLength: mlen];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: mHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(m);
}

-(void)crypto_box_seal:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	NSString *mHex = [command.arguments objectAtIndex: 0];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long) [mHex length] / 2;

	NSString *pkHex = [command.arguments objectAtIndex: 1];
	const unsigned char* pk = [self from_hex: pkHex];

	unsigned long long clen = mlen + crypto_box_SEALBYTES;
	unsigned char* c = (unsigned char*) sodium_malloc(clen);

	CDVPluginResult *result;
	if (crypto_box_seal(c, m, mlen, pk) != 0){
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_ENCRYPT"];
	} else {
		NSString *cHex = [self to_hex: c withLength: clen];
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: cHex];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(c);
}

-(void)crypto_box_seal_open:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

		NSString *cHex = [command.arguments objectAtIndex: 0];
		const unsigned char* c = [self from_hex: cHex];
		const unsigned long long clen = (unsigned long long) [cHex length] / 2;

		NSString *pkHex = [command.arguments objectAtIndex: 1];
		const unsigned char* pk = [self from_hex: pkHex];

		NSString *skHex = [command.arguments objectAtIndex: 2];
		const unsigned char* sk = [self from_hex: skHex];

		unsigned long long mlen = clen - crypto_box_SEALBYTES;
		unsigned char* m = (unsigned char*) sodium_malloc(mlen);

		CDVPluginResult *result;
		if (crypto_box_seal_open(m, c, clen, pk, sk) != 0){
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_DECRYPT"];
		} else {
			NSString *mHex = [self to_hex: m withLength: mlen];
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: mHex];
		}

		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

		sodium_free(m);
}

-(void)crypto_generichash:(CDVInvokedUrlCommand*)command {
	if (![self sodium_init_check: command]) return;

	if ([command.arguments count] < 2 || [command.arguments count] > 3){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"INVALID_NUMBER_OF_ARGUMENTS"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
		return;
	}

	const unsigned int hlen = [[command.arguments objectAtIndex: 0] unsignedIntValue];
	if (hlen < crypto_generichash_BYTES){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"HASH_TOO_SHORT"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
		return;
	}

	NSString *mHex = [command.arguments objectAtIndex: 1];
	const unsigned char* m = [self from_hex: mHex];
	const unsigned long long mlen = (unsigned long long)[mHex length] / 2;

	unsigned char* h = (unsigned char*) sodium_malloc(hlen);

	CDVPluginResult *result;
	int cryptoStatus;
	if ([command.arguments count] == 2){
		if ((cryptoStatus = crypto_generichash(h, hlen, m, mlen, nil, 0)) != 0){
			NSLog([NSString stringWithFormat: @"cryptoStatus:%d", cryptoStatus]);
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_HASH"];
		} else {
			NSString *hHex = [self to_hex: h withLength: crypto_generichash_BYTES];
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: hHex];
		}
	} else if ([command.arguments count] == 3){
		NSString *kHex = [command.arguments objectAtIndex: 2];
		const unsigned char* k = [self from_hex: kHex];
		const unsigned long long klen = (unsigned long long)[kHex length] / 2;

		if ((cryptoStatus = crypto_generichash(h, hlen, m, mlen, k, klen)) != 0){
			NSLog([NSString stringWithFormat: @"cryptoStatus:%d", cryptoStatus]);
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANNOT_HASH"];
		} else {
			NSString *hHex = [self to_hex: h withLength: hlen];
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: hHex];
		}
	} else {
		NSLog(@"How the hell?");
		result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"INVALID_NUMBER_OF_ARGUMENTS"];
	}

	[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];

	sodium_free(h);
}

-(unsigned char*)from_hex:(NSString*)s {
	unsigned char whole_byte;
	char byte_chars[3] = {'\0', '\0', '\0'};

	NSMutableData *sMut = [[NSMutableData alloc] init];
	for (int i = 0; i < [s length] / 2; i++){
		byte_chars[0] = [s characterAtIndex: 2*i];
		byte_chars[1] = [s characterAtIndex: 2*i+1];
		whole_byte = strtol(byte_chars, NULL, 16);
		[sMut appendBytes: &whole_byte length: 1];
	}

	unsigned char* sBytes = (unsigned char*) [sMut bytes];
	return sBytes;
}

-(NSString*)to_hex:(unsigned char*)s withLength:(unsigned long long) slen {
	NSMutableString *hexMut = [[NSMutableString alloc] init];
	for (int i = 0; i < slen; i++){
		[hexMut appendFormat: @"%02x", s[i]];
	}

	return [hexMut lowercaseString];
}

-(bool)sodium_init_check:(CDVInvokedUrlCommand*)command {
	if (self.sodiumInitStatus == -1){
		CDVPluginResult *result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"SODIUM_INIT_FAILED"];
		[self.commandDelegate sendPluginResult: result callbackId: command.callbackId];
		return false;
	}

	return true;
}

@end

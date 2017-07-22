#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface MiniSodium : CDVPlugin

@property int sodiumInitStatus;

- (void)pluginInitialize;
// Secretbox construction
- (void)crypto_secretbox_easy:(CDVInvokedUrlCommand*)command;
- (void)crypto_secretbox_open_easy:(CDVInvokedUrlCommand*)command;

// Public key signatures (Ed255519)
- (void)crypto_sign_keypair:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_seed_keypair:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_open:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_detached:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_verify_detached:(CDVInvokedUrlCommand*)command;

// Public key signature (Ed25519) - secret key manipulation methods
- (void)crypto_sign_ed25519_sk_to_seed:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_ed25519_sk_to_pk:(CDVInvokedUrlCommand*)command;

// Ed25519 -> Curve25519 keypair conversion
- (void)crypto_sign_ed25519_sk_to_curve25519:(CDVInvokedUrlCommand*)command;
- (void)crypto_sign_ed25519_pk_to_curve25519:(CDVInvokedUrlCommand*)command;

// Curve25519 methods
- (void)crypto_scalarmult_base:(CDVInvokedUrlCommand*)command;
- (void)crypto_scalarmult:(CDVInvokedUrlCommand*)command;

// Scrypt password hashing
- (void)crypto_pwhash_scryptsalsa208sha256:(CDVInvokedUrlCommand*)command;
- (void)crypto_pwhash_scryptsalsa208sha256_ll:(CDVInvokedUrlCommand*)command;

// Box construction
- (void)crypto_box_keypair:(CDVInvokedUrlCommand*)command;
- (void)crypto_box_easy:(CDVInvokedUrlCommand*)command;
- (void)crypto_box_open_easy:(CDVInvokedUrlCommand*)command;
- (void)crypto_box_seal:(CDVInvokedUrlCommand*)command;
- (void)crypto_box_seal_open:(CDVInvokedUrlCommand*)command;

// Simple generic hashing
- (void)crypto_generichash:(CDVInvokedUrlCommand*)command;

// Hexadecimal encoding/decoding
- (unsigned char*)from_hex:(NSString*)s;
- (NSString*)to_hex:(unsigned char*)s withLength:(unsigned long long) slen;

- (bool)sodium_init_check:(CDVInvokedUrlCommand*)cmd;

@end

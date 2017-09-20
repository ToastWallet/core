'use strict';
if (typeof window !== 'undefined') {
	window['assert'] = require('assert');
	window['elliptic'] = require('elliptic');
	window['rippleKeypairs'] = require('ripple-keypairs');
	window['secp256k1'] = elliptic.ec('secp256k1');
	window['rippleAddressCodec'] = require('ripple-address-codec');
	window['R_B58_DICT'] = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
	window['base58'] = require('base-x')(R_B58_DICT);
	window['rippleBinaryCodec'] = require('ripple-binary-codec')
	window['rippleHashes'] = require('ripple-hashes')
	window['BN'] = require('bn.js');
	window['hashjs'] = require('hash.js')
	window['utils'] = require('./utils.js')
}

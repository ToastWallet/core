'use strict';

var elliptic = require('elliptic');
var secp256k1 = elliptic.ec('secp256k1');
var Sha512 = require('./sha512');

function deriveScalar(bytes, discrim) {
  var order = secp256k1.curve.n;
  for (var i = 0; i <= 0xFFFFFFFF; i++) {
    // We hash the bytes to find a 256 bit number, looping until we are sure it
    // is less than the order of the curve.
    var hasher = new Sha512().add(bytes);
    // If the optional discriminator index was passed in, update the hash.
    if (discrim !== undefined) {
      hasher.addU32(discrim);
    }
    hasher.addU32(i);
    var key = hasher.first256BN();
    if (key.cmpn(0) > 0 && key.cmp(order) < 0) {
      return key;
    }
  }
  throw new Error('impossible unicorn ;)');
}

/**
* @param {Array} seed - bytes
* @param {Object} [opts] - object
* @param {Number} [opts.accountIndex=0] - the account number to generate
* @param {Boolean} [opts.validator=false] - generate root key-pair,
*                                              as used by validators.
* @return {bn.js} - 256 bit scalar value
*
*/
function derivePrivateKey(seed) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var root = opts.validator;
  var order = secp256k1.curve.n;

  // This private generator represents the `root` private key, and is what's
  // used by validators for signing when a keypair is generated from a seed.
  var privateGen = deriveScalar(seed);
  if (root) {
    // As returned by validation_create for a given seed
    return privateGen;
  }
  var publicGen = secp256k1.g.mul(privateGen);
  // A seed can generate many keypairs as a function of the seed and a uint32.
  // Almost everyone just uses the first account, `0`.
  var accountIndex = opts.accountIndex || 0;
  return deriveScalar(publicGen.encodeCompressed(), accountIndex).add(privateGen).mod(order);
}

function accountPublicFromPublicGenerator(publicGenBytes) {
  var rootPubPoint = secp256k1.curve.decodePoint(publicGenBytes);
  var scalar = deriveScalar(publicGenBytes, 0);
  var point = secp256k1.g.mul(scalar);
  var offset = rootPubPoint.add(point);
  return offset.encodeCompressed();
}

module.exports = {
  derivePrivateKey: derivePrivateKey,
  accountPublicFromPublicGenerator: accountPublicFromPublicGenerator
};
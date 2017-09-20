'use strict';var Decimal = require('decimal.js');var _require = 
require('./utils/bytes-utils');var bytesToHex = _require.bytesToHex;var slice = _require.slice;var parseBytes = _require.parseBytes;var _require2 = 
require('./types');var UInt64 = _require2.UInt64;
var BN = require('bn.js');

module.exports = { 
  encode: function encode(arg) {
    var quality = arg instanceof Decimal ? arg : new Decimal(arg);
    var exponent = quality.e - 15;
    var qualityString = quality.times('1e' + -exponent).abs().toString();
    var bytes = new UInt64(new BN(qualityString)).toBytes();
    bytes[0] = exponent + 100;
    return bytes;}, 

  decode: function decode(arg) {
    var bytes = slice(parseBytes(arg), -8);
    var exponent = bytes[0] - 100;
    var mantissa = new Decimal('0x' + bytesToHex(slice(bytes, 1)));
    return mantissa.times('1e' + exponent);} };
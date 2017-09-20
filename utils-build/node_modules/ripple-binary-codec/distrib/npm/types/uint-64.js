'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;};var assert = require('assert');
var BN = require('bn.js');
var makeClass = require('../utils/make-class');var _require = 

require('../utils/bytes-utils');var bytesToHex = _require.bytesToHex;var parseBytes = _require.parseBytes;var serializeUIntN = _require.serializeUIntN;var _require2 = 
require('./uint');var UInt = _require2.UInt;

var HEX_REGEX = /^[A-F0-9]{16}$/;

var UInt64 = makeClass({ 
  inherits: UInt, 
  statics: { width: 8 }, 
  UInt64: function UInt64() {var arg = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var argType = typeof arg === 'undefined' ? 'undefined' : _typeof(arg);
    if (argType === 'number') {
      assert(arg >= 0);
      this._bytes = new Uint8Array(8);
      this._bytes.set(serializeUIntN(arg, 4), 4);} else 
    if (arg instanceof BN) {
      this._bytes = parseBytes(arg.toArray('be', 8), Uint8Array);
      this._toBN = arg;} else 
    {
      if (argType === 'string') {
        if (!HEX_REGEX.test(arg)) {
          throw new Error(arg + ' is not a valid UInt64 hex string');}}


      this._bytes = parseBytes(arg, Uint8Array);}

    assert(this._bytes.length === 8);}, 

  toJSON: function toJSON() {
    return bytesToHex(this._bytes);}, 

  valueOf: function valueOf() {
    return this.toBN();}, 

  cached: { 
    toBN: function toBN() {
      return new BN(this._bytes);} }, 


  toBytes: function toBytes() {
    return this._bytes;} });



module.exports = { 
  UInt64: UInt64 };
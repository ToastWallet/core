'use strict';var assert = require('assert');
var makeClass = require('../utils/make-class');var _require = 
require('./serialized-type');var Comparable = _require.Comparable;var SerializedType = _require.SerializedType;var _require2 = 
require('../utils/bytes-utils');var compareBytes = _require2.compareBytes;var parseBytes = _require2.parseBytes;

var Hash = makeClass({ 
  Hash: function Hash(bytes) {
    var width = this.constructor.width;
    this._bytes = bytes ? parseBytes(bytes, Uint8Array) : 
    new Uint8Array(width);
    assert.equal(this._bytes.length, width);}, 

  mixins: [Comparable, SerializedType], 
  statics: { 
    width: NaN, 
    from: function from(value) {
      if (value instanceof this) {
        return value;}

      return new this(parseBytes(value));}, 

    fromParser: function fromParser(parser, hint) {
      return new this(parser.read(hint || this.width));} }, 


  compareTo: function compareTo(other) {
    return compareBytes(this._bytes, this.constructor.from(other)._bytes);}, 

  toString: function toString() {
    return this.toHex();}, 

  nibblet: function nibblet(depth) {
    var byte_ix = depth > 0 ? depth / 2 | 0 : 0;
    var b = this._bytes[byte_ix];
    if (depth % 2 === 0) {
      b = (b & 0xF0) >>> 4;} else 
    {
      b = b & 0x0F;}

    return b;} });



module.exports = { 
  Hash: Hash };
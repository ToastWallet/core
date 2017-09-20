'use strict';var assert = require('assert');
var BN = require('bn.js');
var makeClass = require('../utils/make-class');var _require = 
require('./serialized-type');var Comparable = _require.Comparable;var SerializedType = _require.SerializedType;var _require2 = 
require('../utils/bytes-utils');var serializeUIntN = _require2.serializeUIntN;
var MAX_VALUES = [0, 255, 65535, 16777215, 4294967295];

function signum(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;}


var UInt = makeClass({ 
  mixins: [Comparable, SerializedType], 
  UInt: function UInt() {var val = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var max = MAX_VALUES[this.constructor.width];
    if (val < 0 || !(val <= max)) {
      throw new Error(val + ' not in range 0 <= $val <= ' + max);}

    this.val = val;}, 

  statics: { 
    width: 0, 
    fromParser: function fromParser(parser) {
      var val = this.width > 4 ? parser.read(this.width) : 
      parser.readUIntN(this.width);
      return new this(val);}, 

    from: function from(val) {
      return val instanceof this ? val : new this(val);} }, 


  toJSON: function toJSON() {
    return this.val;}, 

  valueOf: function valueOf() {
    return this.val;}, 

  compareTo: function compareTo(other) {
    var thisValue = this.valueOf();
    var otherValue = other.valueOf();
    if (thisValue instanceof BN) {
      return otherValue instanceof BN ? 
      thisValue.cmp(otherValue) : 
      thisValue.cmpn(otherValue);} else 
    if (otherValue instanceof BN) {
      return -other.compareTo(this);}

    assert(typeof otherValue === 'number');
    return signum(thisValue, otherValue);}, 

  toBytesSink: function toBytesSink(sink) {
    sink.put(this.toBytes());}, 

  toBytes: function toBytes() {
    return serializeUIntN(this.val, this.constructor.width);} });



module.exports = { 
  UInt: UInt };
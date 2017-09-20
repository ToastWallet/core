'use strict';var _require = require('../utils/bytes-utils');var bytesToHex = _require.bytesToHex;var slice = _require.slice;var _require2 = 
require('../serdes/binary-serializer');var BytesList = _require2.BytesList;

var Comparable = { 
  lt: function lt(other) {
    return this.compareTo(other) < 0;}, 

  eq: function eq(other) {
    return this.compareTo(other) === 0;}, 

  gt: function gt(other) {
    return this.compareTo(other) > 0;}, 

  gte: function gte(other) {
    return this.compareTo(other) > -1;}, 

  lte: function lte(other) {
    return this.compareTo(other) < 1;} };



var SerializedType = { 
  toBytesSink: function toBytesSink(sink) {
    sink.put(this._bytes);}, 

  toHex: function toHex() {
    return bytesToHex(this.toBytes());}, 

  toBytes: function toBytes() {
    if (this._bytes) {
      return slice(this._bytes);}

    var bl = new BytesList();
    this.toBytesSink(bl);
    return bl.toBytes();}, 

  toJSON: function toJSON() {
    return this.toHex();}, 

  toString: function toString() {
    return this.toHex();} };



function ensureArrayLikeIs(Type, arrayLike) {
  return { 
    withChildren: function withChildren(Child) {
      if (arrayLike instanceof Type) {
        return arrayLike;}

      var obj = new Type();
      for (var i = 0; i < arrayLike.length; i++) {
        obj.push(Child.from(arrayLike[i]));}

      return obj;} };}




module.exports = { 
  ensureArrayLikeIs: ensureArrayLikeIs, 
  SerializedType: SerializedType, 
  Comparable: Comparable };
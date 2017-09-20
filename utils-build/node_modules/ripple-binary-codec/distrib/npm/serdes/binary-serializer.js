'use strict';var assert = require('assert');var _require = 
require('../utils/bytes-utils');var parseBytes = _require.parseBytes;var bytesToHex = _require.bytesToHex;
var makeClass = require('../utils/make-class');var _require2 = 
require('../enums');var Type = _require2.Type;var Field = _require2.Field;

var BytesSink = { 
  put: function put() /* bytesSequence */{
    // any hex string or any object with a `length` and where 0 <= [ix] <= 255
  } };


var BytesList = makeClass({ 
  implementing: BytesSink, 
  BytesList: function BytesList() {
    this.arrays = [];
    this.length = 0;}, 

  put: function put(bytesArg) {
    var bytes = parseBytes(bytesArg, Uint8Array);
    this.length += bytes.length;
    this.arrays.push(bytes);
    return this;}, 

  toBytesSink: function toBytesSink(sink) {
    this.arrays.forEach(function (arr) {
      sink.put(arr);});}, 


  toBytes: function toBytes() {
    var concatenated = new Uint8Array(this.length);
    var pointer = 0;
    this.arrays.forEach(function (arr) {
      concatenated.set(arr, pointer);
      pointer += arr.length;});

    return concatenated;}, 

  toHex: function toHex() {
    return bytesToHex(this.toBytes());} });



var BinarySerializer = makeClass({ 
  BinarySerializer: function BinarySerializer(sink) {
    this.sink = sink;}, 

  write: function write(value) {
    value.toBytesSink(this.sink);}, 

  put: function put(bytes) {
    this.sink.put(bytes);}, 

  writeType: function writeType(type, value) {
    this.write(type.from(value));}, 

  writeBytesList: function writeBytesList(bl) {
    bl.toBytesSink(this.sink);}, 

  encodeVL: function encodeVL(len) {
    var length = len;
    var lenBytes = new Uint8Array(4);
    if (length <= 192) {
      lenBytes[0] = length;
      return lenBytes.subarray(0, 1);} else 
    if (length <= 12480) {
      length -= 193;
      lenBytes[0] = 193 + (length >>> 8);
      lenBytes[1] = length & 0xff;
      return lenBytes.subarray(0, 2);} else 
    if (length <= 918744) {
      length -= 12481;
      lenBytes[0] = 241 + (length >>> 16);
      lenBytes[1] = length >> 8 & 0xff;
      lenBytes[2] = length & 0xff;
      return lenBytes.subarray(0, 3);}

    throw new Error('Overflow error');}, 

  writeFieldAndValue: function writeFieldAndValue(field, _value) {
    var sink = this.sink;
    var value = field.associatedType.from(_value);
    assert(value.toBytesSink, field);
    sink.put(field.bytes);

    if (field.isVLEncoded) {
      this.writeLengthEncoded(value);} else 
    {
      value.toBytesSink(sink);
      if (field.type === Type.STObject) {
        sink.put(Field.ObjectEndMarker.bytes);} else 
      if (field.type === Type.STArray) {
        sink.put(Field.ArrayEndMarker.bytes);}}}, 



  writeLengthEncoded: function writeLengthEncoded(value) {
    var bytes = new BytesList();
    value.toBytesSink(bytes);
    this.put(this.encodeVL(bytes.length));
    this.writeBytesList(bytes);} });



module.exports = { 
  BytesList: BytesList, 
  BinarySerializer: BinarySerializer };
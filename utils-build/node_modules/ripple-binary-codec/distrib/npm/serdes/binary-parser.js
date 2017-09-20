'use strict';var assert = require('assert');
var makeClass = require('../utils/make-class');var _require = 
require('../enums');var Field = _require.Field;var _require2 = 
require('../utils/bytes-utils');var slice = _require2.slice;var parseBytes = _require2.parseBytes;

var BinaryParser = makeClass({ 
  BinaryParser: function BinaryParser(buf) {
    this._buf = parseBytes(buf, Uint8Array);
    this._length = this._buf.length;
    this._cursor = 0;}, 

  skip: function skip(n) {
    this._cursor += n;}, 

  read: function read(n) {var to = arguments.length <= 1 || arguments[1] === undefined ? Uint8Array : arguments[1];
    var start = this._cursor;
    var end = this._cursor + n;
    assert(end <= this._buf.length);
    this._cursor = end;
    return slice(this._buf, start, end, to);}, 

  readUIntN: function readUIntN(n) {
    return this.read(n, Array).reduce(function (a, b) {return a << 8 | b;}) >>> 0;}, 

  readUInt8: function readUInt8() {
    return this._buf[this._cursor++];}, 

  readUInt16: function readUInt16() {
    return this.readUIntN(2);}, 

  readUInt32: function readUInt32() {
    return this.readUIntN(4);}, 

  pos: function pos() {
    return this._cursor;}, 

  size: function size() {
    return this._buf.length;}, 

  end: function end(customEnd) {
    var cursor = this.pos();
    return cursor >= this._length || customEnd !== null && 
    cursor >= customEnd;}, 

  readVL: function readVL() {
    return this.read(this.readVLLength());}, 

  readVLLength: function readVLLength() {
    var b1 = this.readUInt8();
    if (b1 <= 192) {
      return b1;} else 
    if (b1 <= 240) {
      var b2 = this.readUInt8();
      return 193 + (b1 - 193) * 256 + b2;} else 
    if (b1 <= 254) {
      var _b = this.readUInt8();
      var b3 = this.readUInt8();
      return 12481 + (b1 - 241) * 65536 + _b * 256 + b3;}

    throw new Error('Invalid varint length indicator');}, 

  readFieldOrdinal: function readFieldOrdinal() {
    var tagByte = this.readUInt8();
    var type = (tagByte & 0xF0) >>> 4 || this.readUInt8();
    var nth = tagByte & 0x0F || this.readUInt8();
    return type << 16 | nth;}, 

  readField: function readField() {
    return Field.from(this.readFieldOrdinal());}, 

  readType: function readType(type) {
    return type.fromParser(this);}, 

  typeForField: function typeForField(field) {
    return field.associatedType;}, 

  readFieldValue: function readFieldValue(field) {
    var kls = this.typeForField(field);
    if (!kls) {
      throw new Error('unsupported: (' + field.name + ', ' + field.type.name + ')');}

    var sizeHint = field.isVLEncoded ? this.readVLLength() : null;
    var value = kls.fromParser(this, sizeHint);
    if (value === undefined) {
      throw new Error('fromParser for (' + 
      field.name + ', ' + field.type.name + ') -> undefined ');}

    return value;}, 

  readFieldAndValue: function readFieldAndValue() {
    var field = this.readField();
    return [field, this.readFieldValue(field)];} });




module.exports = { 
  BinaryParser: BinaryParser };
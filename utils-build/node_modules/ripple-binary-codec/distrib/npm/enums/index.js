'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var assert = require('assert');
var _ = require('lodash');var _require = 
require('./../utils/bytes-utils');var parseBytes = _require.parseBytes;var serializeUIntN = _require.serializeUIntN;
var makeClass = require('./../utils/make-class');
var enums = require('./definitions.json');

function transformWith(func, obj) {
  return _.transform(obj, func);}


function biMap(obj, valueKey) {
  return _.transform(obj, function (result, value, key) {
    result[key] = value;
    result[value[valueKey]] = value;});}



var EnumType = makeClass({ 
  EnumType: function EnumType(definition) {
    _.assign(this, definition);
    // At minimum
    assert(this.bytes instanceof Uint8Array);
    assert(typeof this.ordinal === 'number');
    assert(typeof this.name === 'string');}, 

  toString: function toString() {
    return this.name;}, 

  toJSON: function toJSON() {
    return this.name;}, 

  toBytesSink: function toBytesSink(sink) {
    sink.put(this.bytes);}, 

  statics: { 
    ordinalByteWidth: 1, 
    fromParser: function fromParser(parser) {
      return this.from(parser.readUIntN(this.ordinalByteWidth));}, 

    from: function from(val) {
      var ret = val instanceof this ? val : this[val];
      if (!ret) {
        throw new Error(
        val + ' is not a valid name or ordinal for ' + this.enumName);}

      return ret;}, 

    valuesByName: function valuesByName() {var _this = this;
      return _.transform(this.initVals, function (result, ordinal, name) {
        var bytes = serializeUIntN(ordinal, _this.ordinalByteWidth);
        var type = new _this({ name: name, ordinal: ordinal, bytes: bytes });
        result[name] = type;});}, 


    init: function init() {
      var mapped = this.valuesByName();
      _.assign(this, biMap(mapped, 'ordinal'));
      this.values = _.values(mapped);
      return this;} } });




function makeEnum(name, definition) {
  return makeClass({ 
    inherits: EnumType, 
    statics: _.assign(definition, { enumName: name }) });}



function makeEnums(to, definition, name) {
  to[name] = makeEnum(name, definition);}


var Enums = transformWith(makeEnums, { 
  Type: { 
    initVals: enums.TYPES }, 

  LedgerEntryType: { 
    initVals: enums.LEDGER_ENTRY_TYPES, ordinalByteWidth: 2 }, 

  TransactionType: { 
    initVals: enums.TRANSACTION_TYPES, ordinalByteWidth: 2 }, 

  TransactionResult: { 
    initVals: enums.TRANSACTION_RESULTS, ordinalByteWidth: 1 } });



Enums.Field = makeClass({ 
  inherits: EnumType, 
  statics: { 
    enumName: 'Field', 
    initVals: enums.FIELDS, 
    valuesByName: function valuesByName() {var _this2 = this;
      var fields = _.map(this.initVals, function (_ref) {var _ref2 = _slicedToArray(_ref, 2);var name = _ref2[0];var definition = _ref2[1];
        var type = Enums.Type[definition.type];
        var bytes = _this2.header(type.ordinal, definition.nth);
        var ordinal = type.ordinal << 16 | definition.nth;
        var extra = { ordinal: ordinal, name: name, type: type, bytes: bytes };
        return new _this2(_.assign(definition, extra));});

      return _.keyBy(fields, 'name');}, 

    header: function header(type, nth) {
      var name = nth;
      var header = [];
      var push = header.push.bind(header);
      if (type < 16) {
        if (name < 16) {
          push(type << 4 | name);} else 
        {
          push(type << 4, name);}} else 

      if (name < 16) {
        push(name, type);} else 
      {
        push(0, type, name);}

      return parseBytes(header, Uint8Array);} } });




module.exports = Enums;
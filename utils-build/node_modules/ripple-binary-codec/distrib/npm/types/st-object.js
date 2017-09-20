'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;};var _ = require('lodash');
var makeClass = require('../utils/make-class');var _require = 
require('../enums');var Field = _require.Field;var _require2 = 
require('../serdes/binary-serializer');var BinarySerializer = _require2.BinarySerializer;var 
ObjectEndMarker = Field.ObjectEndMarker;var _require3 = 
require('./serialized-type');var SerializedType = _require3.SerializedType;

var STObject = makeClass({ 
  mixins: SerializedType, 
  statics: { 
    fromParser: function fromParser(parser, hint) {
      var end = typeof hint === 'number' ? parser.pos() + hint : null;
      var so = new this();
      while (!parser.end(end)) {
        var field = parser.readField();
        if (field === ObjectEndMarker) {
          break;}

        so[field] = parser.readFieldValue(field);}

      return so;}, 

    from: function from(value) {
      if (value instanceof this) {
        return value;}

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        return _.transform(value, function (so, val, key) {
          var field = Field[key];
          if (field) {
            so[field] = field.associatedType.from(val);} else 
          {
            so[key] = val;}}, 

        new this());}

      throw new Error(value + ' is unsupported');} }, 


  fieldKeys: function fieldKeys() {
    return Object.keys(this).map(function (k) {return Field[k];}).filter(Boolean);}, 

  toJSON: function toJSON() {
    // Otherwise seemingly result will have same prototype as `this`
    var accumulator = {}; // of only `own` properties
    return _.transform(this, function (result, value, key) {
      result[key] = value && value.toJSON ? value.toJSON() : value;}, 
    accumulator);}, 

  toBytesSink: function toBytesSink(sink) {var _this = this;var filter = arguments.length <= 1 || arguments[1] === undefined ? function () {return true;} : arguments[1];
    var serializer = new BinarySerializer(sink);
    var fields = this.fieldKeys();
    var sorted = _.sortBy(fields, 'ordinal');
    sorted.filter(filter).forEach(function (field) {
      var value = _this[field];
      if (!field.isSerialized) {
        return;}

      serializer.writeFieldAndValue(field, value);});} });




module.exports = { 
  STObject: STObject };
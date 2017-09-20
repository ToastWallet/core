'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./serialized-type');var ensureArrayLikeIs = _require.ensureArrayLikeIs;var SerializedType = _require.SerializedType;var _require2 = 
require('../enums');var Field = _require2.Field;var _require3 = 
require('./st-object');var STObject = _require3.STObject;var 
ArrayEndMarker = Field.ArrayEndMarker;

var STArray = makeClass({ 
  mixins: SerializedType, 
  inherits: Array, 
  statics: { 
    fromParser: function fromParser(parser) {
      var array = new STArray();
      while (!parser.end()) {
        var field = parser.readField();
        if (field === ArrayEndMarker) {
          break;}

        var outer = new STObject();
        outer[field] = parser.readFieldValue(field);
        array.push(outer);}

      return array;}, 

    from: function from(value) {
      return ensureArrayLikeIs(STArray, value).withChildren(STObject);} }, 


  toJSON: function toJSON() {
    return this.map(function (v) {return v.toJSON();});}, 

  toBytesSink: function toBytesSink(sink) {
    this.forEach(function (so) {return so.toBytesSink(sink);});} });



module.exports = { 
  STArray: STArray };
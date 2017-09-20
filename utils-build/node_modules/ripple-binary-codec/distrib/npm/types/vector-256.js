'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./hash-256');var Hash256 = _require.Hash256;var _require2 = 
require('./serialized-type');var ensureArrayLikeIs = _require2.ensureArrayLikeIs;var SerializedType = _require2.SerializedType;

var Vector256 = makeClass({ 
  mixins: SerializedType, 
  inherits: Array, 
  statics: { 
    fromParser: function fromParser(parser, hint) {
      var vector256 = new this();
      var bytes = hint !== null ? hint : parser.size() - parser.pos();
      var hashes = bytes / 32;
      for (var i = 0; i < hashes; i++) {
        vector256.push(Hash256.fromParser(parser));}

      return vector256;}, 

    from: function from(value) {
      return ensureArrayLikeIs(Vector256, value).withChildren(Hash256);} }, 


  toBytesSink: function toBytesSink(sink) {
    this.forEach(function (h) {return h.toBytesSink(sink);});}, 

  toJSON: function toJSON() {
    return this.map(function (hash) {return hash.toJSON();});} });



module.exports = { 
  Vector256: Vector256 };
'use strict'; /* eslint-disable no-unused-expressions */

var makeClass = require('../utils/make-class');var _require = 
require('./serialized-type');var SerializedType = _require.SerializedType;var ensureArrayLikeIs = _require.ensureArrayLikeIs;var _require2 = 
require('./currency');var Currency = _require2.Currency;var _require3 = 
require('./account-id');var AccountID = _require3.AccountID;

var PATHSET_END_BYTE = 0x00;
var PATH_SEPARATOR_BYTE = 0xFF;
var TYPE_ACCOUNT = 0x01;
var TYPE_CURRENCY = 0x10;
var TYPE_ISSUER = 0x20;

var Hop = makeClass({ 
  statics: { 
    from: function from(value) {
      if (value instanceof this) {
        return value;}

      var hop = new Hop();
      value.issuer && (hop.issuer = AccountID.from(value.issuer));
      value.account && (hop.account = AccountID.from(value.account));
      value.currency && (hop.currency = Currency.from(value.currency));
      return hop;}, 

    parse: function parse(parser, type) {
      var hop = new Hop();
      type & TYPE_ACCOUNT && (hop.account = AccountID.fromParser(parser));
      type & TYPE_CURRENCY && (hop.currency = Currency.fromParser(parser));
      type & TYPE_ISSUER && (hop.issuer = AccountID.fromParser(parser));
      return hop;} }, 


  toJSON: function toJSON() {
    var type = this.type();
    var ret = {};
    type & TYPE_ACCOUNT && (ret.account = this.account.toJSON());
    type & TYPE_ISSUER && (ret.issuer = this.issuer.toJSON());
    type & TYPE_CURRENCY && (ret.currency = this.currency.toJSON());
    return ret;}, 

  type: function type() {
    var type = 0;
    this.issuer && (type += TYPE_ISSUER);
    this.account && (type += TYPE_ACCOUNT);
    this.currency && (type += TYPE_CURRENCY);
    return type;} });



var Path = makeClass({ 
  inherits: Array, 
  statics: { 
    from: function from(value) {
      return ensureArrayLikeIs(Path, value).withChildren(Hop);} }, 


  toJSON: function toJSON() {
    return this.map(function (k) {return k.toJSON();});} });



var PathSet = makeClass({ 
  mixins: SerializedType, 
  inherits: Array, 
  statics: { 
    from: function from(value) {
      return ensureArrayLikeIs(PathSet, value).withChildren(Path);}, 

    fromParser: function fromParser(parser) {
      var pathSet = new this();
      var path = void 0;
      while (!parser.end()) {
        var type = parser.readUInt8();
        if (type === PATHSET_END_BYTE) {
          break;}

        if (type === PATH_SEPARATOR_BYTE) {
          path = null;
          continue;}

        if (!path) {
          path = new Path();
          pathSet.push(path);}

        path.push(Hop.parse(parser, type));}

      return pathSet;} }, 


  toJSON: function toJSON() {
    return this.map(function (k) {return k.toJSON();});}, 

  toBytesSink: function toBytesSink(sink) {
    var n = 0;
    this.forEach(function (path) {
      if (n++ !== 0) {
        sink.put([PATH_SEPARATOR_BYTE]);}

      path.forEach(function (hop) {
        sink.put([hop.type()]);
        hop.account && hop.account.toBytesSink(sink);
        hop.currency && hop.currency.toBytesSink(sink);
        hop.issuer && hop.issuer.toBytesSink(sink);});});


    sink.put([PATHSET_END_BYTE]);} });



module.exports = { 
  PathSet: PathSet };
'use strict';var makeClass = require('./utils/make-class');var _require = 
require('./hash-prefixes');var HashPrefix = _require.HashPrefix;var _require2 = 
require('./types');var Hash256 = _require2.Hash256;var _require3 = 
require('./utils/bytes-utils');var parseBytes = _require3.parseBytes;
var createHash = require('create-hash');

var Sha512Half = makeClass({ 
  Sha512Half: function Sha512Half() {
    this.hash = createHash('sha512');}, 

  statics: { 
    put: function put(bytes) {
      return new this().put(bytes);} }, 


  put: function put(bytes) {
    this.hash.update(parseBytes(bytes, Buffer));
    return this;}, 

  finish256: function finish256() {
    var bytes = this.hash.digest();
    return bytes.slice(0, 32);}, 

  finish: function finish() {
    return new Hash256(this.finish256());} });



function sha512Half() {
  var hash = new Sha512Half();for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
  args.forEach(function (a) {return hash.put(a);});
  return parseBytes(hash.finish256(), Uint8Array);}


function transactionID(serialized) {
  return new Hash256(sha512Half(HashPrefix.transactionID, serialized));}


module.exports = { 
  Sha512Half: Sha512Half, 
  sha512Half: sha512Half, 
  transactionID: transactionID };
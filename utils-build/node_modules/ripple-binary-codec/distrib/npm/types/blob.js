'use strict';var makeClass = require('../utils/make-class');var _require = 
require('../utils/bytes-utils');var parseBytes = _require.parseBytes;var _require2 = 
require('./serialized-type');var SerializedType = _require2.SerializedType;

var Blob = makeClass({ 
  mixins: SerializedType, 
  Blob: function Blob(bytes) {
    if (bytes) {
      this._bytes = parseBytes(bytes, Uint8Array);} else 
    {
      this._bytes = new Uint8Array(0);}}, 


  statics: { 
    fromParser: function fromParser(parser, hint) {
      return new this(parser.read(hint));}, 

    from: function from(value) {
      if (value instanceof this) {
        return value;}

      return new this(value);} } });




module.exports = { 
  Blob: Blob };
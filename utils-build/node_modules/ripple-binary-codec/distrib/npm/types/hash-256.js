'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./hash');var Hash = _require.Hash;

var Hash256 = makeClass({ 
  inherits: Hash, 
  statics: { 
    width: 32, 
    init: function init() {
      this.ZERO_256 = new this(new Uint8Array(this.width));} } });




module.exports = { 
  Hash256: Hash256 };
'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./hash');var Hash = _require.Hash;

var Hash128 = makeClass({ 
  inherits: Hash, 
  statics: { width: 16 } });


module.exports = { 
  Hash128: Hash128 };
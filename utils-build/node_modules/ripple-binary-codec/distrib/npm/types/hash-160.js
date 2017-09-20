'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./hash');var Hash = _require.Hash;

var Hash160 = makeClass({ 
  inherits: Hash, 
  statics: { width: 20 } });


module.exports = { 
  Hash160: Hash160 };
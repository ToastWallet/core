'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./uint');var UInt = _require.UInt;

var UInt32 = makeClass({ 
  inherits: UInt, 
  statics: { width: 4 } });


module.exports = { 
  UInt32: UInt32 };
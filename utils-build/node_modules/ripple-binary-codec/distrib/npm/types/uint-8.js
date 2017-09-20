'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./uint');var UInt = _require.UInt;

var UInt8 = makeClass({ 
  inherits: UInt, 
  statics: { width: 1 } });


module.exports = { 
  UInt8: UInt8 };
'use strict';var makeClass = require('../utils/make-class');var _require = 
require('./uint');var UInt = _require.UInt;

var UInt16 = makeClass({ 
  inherits: UInt, 
  statics: { width: 2 } });


module.exports = { 
  UInt16: UInt16 };
'use strict';var enums = require('../enums');var 
Field = enums.Field;var _require = 
require('./account-id');var AccountID = _require.AccountID;var _require2 = 
require('./amount');var Amount = _require2.Amount;var _require3 = 
require('./blob');var Blob = _require3.Blob;var _require4 = 
require('./currency');var Currency = _require4.Currency;var _require5 = 
require('./hash-128');var Hash128 = _require5.Hash128;var _require6 = 
require('./hash-160');var Hash160 = _require6.Hash160;var _require7 = 
require('./hash-256');var Hash256 = _require7.Hash256;var _require8 = 
require('./path-set');var PathSet = _require8.PathSet;var _require9 = 
require('./st-array');var STArray = _require9.STArray;var _require10 = 
require('./st-object');var STObject = _require10.STObject;var _require11 = 
require('./uint-16');var UInt16 = _require11.UInt16;var _require12 = 
require('./uint-32');var UInt32 = _require12.UInt32;var _require13 = 
require('./uint-64');var UInt64 = _require13.UInt64;var _require14 = 
require('./uint-8');var UInt8 = _require14.UInt8;var _require15 = 
require('./vector-256');var Vector256 = _require15.Vector256;

var coreTypes = { 
  AccountID: AccountID, 
  Amount: Amount, 
  Blob: Blob, 
  Currency: Currency, 
  Hash128: Hash128, 
  Hash160: Hash160, 
  Hash256: Hash256, 
  PathSet: PathSet, 
  STArray: STArray, 
  STObject: STObject, 
  UInt8: UInt8, 
  UInt16: UInt16, 
  UInt32: UInt32, 
  UInt64: UInt64, 
  Vector256: Vector256 };


Field.values.forEach(function (field) {
  field.associatedType = coreTypes[field.type];});


Field.TransactionType.associatedType = enums.TransactionType;
Field.TransactionResult.associatedType = enums.TransactionResult;
Field.LedgerEntryType.associatedType = enums.LedgerEntryType;

module.exports = coreTypes;
'use strict';function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}var _ = require('lodash');
var BN = require('bn.js');
var assert = require('assert');
var types = require('./types');var 
STObject = types.STObject;var Hash256 = types.Hash256;var _require = 
require('./shamap');var ShaMap = _require.ShaMap;var _require2 = 
require('./hash-prefixes');var HashPrefix = _require2.HashPrefix;var _require3 = 
require('./hashes');var Sha512Half = _require3.Sha512Half;var _require4 = 
require('./binary');var BinarySerializer = _require4.BinarySerializer;var serializeObject = _require4.serializeObject;

function computeHash(itemizer, itemsJson) {
  var map = new ShaMap();
  itemsJson.forEach(function (item) {return map.addItem.apply(map, _toConsumableArray(itemizer(item)));});
  return map.hash();}


function transactionItem(json) {
  assert(json.hash);
  var index = Hash256.from(json.hash);
  var item = { 
    hashPrefix: function hashPrefix() {
      return HashPrefix.transaction;}, 

    toBytesSink: function toBytesSink(sink) {
      var serializer = new BinarySerializer(sink);
      serializer.writeLengthEncoded(STObject.from(json));
      serializer.writeLengthEncoded(STObject.from(json.metaData));} };


  return [index, item];}


function entryItem(json) {
  var index = Hash256.from(json.index);
  var bytes = serializeObject(json);
  var item = { 
    hashPrefix: function hashPrefix() {
      return HashPrefix.accountStateEntry;}, 

    toBytesSink: function toBytesSink(sink) {
      sink.put(bytes);} };


  return [index, item];}


var transactionTreeHash = _.partial(computeHash, transactionItem);
var accountStateHash = _.partial(computeHash, entryItem);

function ledgerHash(header) {
  var hash = new Sha512Half();
  hash.put(HashPrefix.ledgerHeader);
  assert(header.parent_close_time !== undefined);
  assert(header.close_flags !== undefined);

  types.UInt32.from(header.ledger_index).toBytesSink(hash);
  types.UInt64.from(new BN(header.total_coins)).toBytesSink(hash);
  types.Hash256.from(header.parent_hash).toBytesSink(hash);
  types.Hash256.from(header.transaction_hash).toBytesSink(hash);
  types.Hash256.from(header.account_hash).toBytesSink(hash);
  types.UInt32.from(header.parent_close_time).toBytesSink(hash);
  types.UInt32.from(header.close_time).toBytesSink(hash);
  types.UInt8.from(header.close_time_resolution).toBytesSink(hash);
  types.UInt8.from(header.close_flags).toBytesSink(hash);
  return hash.finish();}


module.exports = { 
  accountStateHash: accountStateHash, 
  transactionTreeHash: transactionTreeHash, 
  ledgerHash: ledgerHash };
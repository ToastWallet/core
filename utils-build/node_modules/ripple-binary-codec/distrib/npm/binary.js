'use strict'; /* eslint-disable func-style */

var BN = require('bn.js');
var types = require('./types');var _require = 
require('./hash-prefixes');var HashPrefix = _require.HashPrefix;var _require2 = 
require('./serdes/binary-parser');var BinaryParser = _require2.BinaryParser;var _require3 = 
require('./serdes/binary-serializer');var BinarySerializer = _require3.BinarySerializer;var BytesList = _require3.BytesList;var _require4 = 
require('./utils/bytes-utils');var bytesToHex = _require4.bytesToHex;var slice = _require4.slice;var parseBytes = _require4.parseBytes;var _require5 = 

require('./hashes');var sha512Half = _require5.sha512Half;var transactionID = _require5.transactionID;

var makeParser = function makeParser(bytes) {return new BinaryParser(bytes);};
var readJSON = function readJSON(parser) {return parser.readType(types.STObject).toJSON();};
var binaryToJSON = function binaryToJSON(bytes) {return readJSON(makeParser(bytes));};

function serializeObject(object) {var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];var 
  prefix = opts.prefix;var suffix = opts.suffix;var _opts$signingFieldsOn = opts.signingFieldsOnly;var signingFieldsOnly = _opts$signingFieldsOn === undefined ? false : _opts$signingFieldsOn;
  var bytesList = new BytesList();
  if (prefix) {
    bytesList.put(prefix);}

  var filter = signingFieldsOnly ? function (f) {return f.isSigningField;} : undefined;
  types.STObject.from(object).toBytesSink(bytesList, filter);
  if (suffix) {
    bytesList.put(suffix);}

  return bytesList.toBytes();}


function signingData(tx) {var prefix = arguments.length <= 1 || arguments[1] === undefined ? HashPrefix.transactionSig : arguments[1];
  return serializeObject(tx, { prefix: prefix, signingFieldsOnly: true });}


function signingClaimData(claim) {
  var prefix = HashPrefix.paymentChannelClaim;
  var channel = types.Hash256.from(claim.channel).toBytes();
  var amount = new types.UInt64(new BN(claim.amount)).toBytes();

  var bytesList = new BytesList();

  bytesList.put(prefix);
  bytesList.put(channel);
  bytesList.put(amount);
  return bytesList.toBytes();}


function multiSigningData(tx, signingAccount) {
  var prefix = HashPrefix.transactionMultiSig;
  var suffix = types.AccountID.from(signingAccount).toBytes();
  return serializeObject(tx, { prefix: prefix, suffix: suffix, signingFieldsOnly: true });}


module.exports = { 
  BinaryParser: BinaryParser, 
  BinarySerializer: BinarySerializer, 
  BytesList: BytesList, 
  makeParser: makeParser, 
  serializeObject: serializeObject, 
  readJSON: readJSON, 
  bytesToHex: bytesToHex, 
  parseBytes: parseBytes, 
  multiSigningData: multiSigningData, 
  signingData: signingData, 
  signingClaimData: signingClaimData, 
  binaryToJSON: binaryToJSON, 
  sha512Half: sha512Half, 
  transactionID: transactionID, 
  slice: slice };
'use strict'; /* eslint-disable func-style */

var _ = require('lodash');var _require = 
require('./types');var AccountID = _require.AccountID;
var binary = require('./binary');var 

serializeObject = 




binary.serializeObject;var bytesToHex = binary.bytesToHex;var multiSigningData = binary.multiSigningData;var transactionID = binary.transactionID;var signingData = binary.signingData;

var FULL_CANONICAL_SIGNATURE = 0x80000000;

var toHex = function toHex(v) {return bytesToHex(v);};
var getSigner = function getSigner(o) {return AccountID.from(o.Signer.Account);};
var signerComparator = function signerComparator(a, b) {return getSigner(a).compareTo(getSigner(b));};

function setCanonicalSignatureFlag(tx_json) {
  tx_json.Flags |= FULL_CANONICAL_SIGNATURE;
  tx_json.Flags >>>= 0;}


function serializedBundle(tx_json) {
  var serialized = serializeObject(tx_json);
  var hash = transactionID(serialized).toHex();
  var tx_blob = toHex(serialized);
  return { tx_json: tx_json, tx_blob: tx_blob, hash: hash };}


function signFor(tx_json_, keyPair) {var signingAccount = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
  var tx_json = _.clone(tx_json_);
  tx_json.SigningPubKey = '';
  setCanonicalSignatureFlag(tx_json);
  var signerID = signingAccount || keyPair.id();
  var signature = keyPair.sign(multiSigningData(tx_json, signerID));
  var signer = { 
    Signer: { 
      SigningPubKey: toHex(keyPair.publicBytes()), 
      TxnSignature: toHex(signature), 
      Account: signerID } };



  var signers = tx_json.Signers = tx_json.Signers || [];
  signers.push(signer);
  signers.sort(signerComparator);

  return serializedBundle(tx_json);}


function sign(tx_json_, keyPair) {
  var tx_json = _.clone(tx_json_);
  setCanonicalSignatureFlag(tx_json);

  tx_json.SigningPubKey = toHex(keyPair.publicBytes());
  tx_json.TxnSignature = toHex(keyPair.sign(signingData(tx_json)));

  return serializedBundle(tx_json);}


module.exports = { 
  signFor: signFor, 
  sign: sign };
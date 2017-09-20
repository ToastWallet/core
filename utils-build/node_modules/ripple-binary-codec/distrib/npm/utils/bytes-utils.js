'use strict';var assert = require('assert');

function signum(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;}


var hexLookup = function () {
  var res = {};
  var reverse = res.reverse = new Array(256);
  for (var i = 0; i < 16; i++) {
    var char = i.toString(16).toUpperCase();
    res[char] = i;

    for (var j = 0; j < 16; j++) {
      var char2 = j.toString(16).toUpperCase();
      var byte = (i << 4) + j;
      var byteHex = char + char2;
      res[byteHex] = byte;
      reverse[byte] = byteHex;}}


  return res;}();


var reverseHexLookup = hexLookup.reverse;

function bytesToHex(sequence) {
  var buf = Array(sequence.length);
  for (var i = sequence.length - 1; i >= 0; i--) {
    buf[i] = reverseHexLookup[sequence[i]];}

  return buf.join('');}


function byteForHex(hex) {
  var byte = hexLookup[hex];
  if (byte === undefined) {
    throw new Error('`' + hex + '` is not a valid hex representation of a byte');}

  return byte;}


function parseBytes(val) {var Output = arguments.length <= 1 || arguments[1] === undefined ? Array : arguments[1];
  if (!val || val.length === undefined) {
    throw new Error(val + ' is not a sequence');}


  if (typeof val === 'string') {
    var start = val.length % 2;
    var _res = new Output((val.length + start) / 2);
    for (var i = val.length, to = _res.length - 1; to >= start; i -= 2, to--) {
      _res[to] = byteForHex(val.slice(i - 2, i));}

    if (start === 1) {
      _res[0] = byteForHex(val[0]);}

    return _res;} else 
  if (val instanceof Output) {
    return val;} else 
  if (Output === Uint8Array) {
    return new Output(val);}

  var res = new Output(val.length);
  for (var _i = val.length - 1; _i >= 0; _i--) {
    res[_i] = val[_i];}

  return res;}


function serializeUIntN(val, width) {
  var newBytes = new Uint8Array(width);
  var lastIx = width - 1;
  for (var i = 0; i < width; i++) {
    newBytes[lastIx - i] = val >>> i * 8 & 0xff;}

  return newBytes;}


function compareBytes(a, b) {
  assert(a.length === b.length);
  for (var i = 0; i < a.length; i++) {
    var cmp = signum(a[i], b[i]);
    if (cmp !== 0) {
      return cmp;}}


  return 0;}


function slice(val) {var startIx = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];var endIx = arguments.length <= 2 || arguments[2] === undefined ? val.length : arguments[2];var Output = arguments.length <= 3 || arguments[3] === undefined ? val.constructor : arguments[3];
  /* eslint-disable no-param-reassign*/
  if (startIx < 0) {
    startIx += val.length;}

  if (endIx < 0) {
    endIx += val.length;}

  /* eslint-enable no-param-reassign*/
  var len = endIx - startIx;
  var res = new Output(len);
  for (var i = endIx - 1; i >= startIx; i--) {
    res[i - startIx] = val[i];}

  return res;}


module.exports = { 
  parseBytes: parseBytes, 
  bytesToHex: bytesToHex, 
  slice: slice, 
  compareBytes: compareBytes, 
  serializeUIntN: serializeUIntN };
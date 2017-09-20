'use strict';var assert = require('assert');
var makeClass = require('./utils/make-class');var _require = 
require('./types');var Hash256 = _require.Hash256;var _require2 = 
require('./hash-prefixes');var HashPrefix = _require2.HashPrefix;var _require3 = 
require('./hashes');var Hasher = _require3.Sha512Half;

var ShaMapNode = makeClass({ 
  virtuals: { 
    hashPrefix: function hashPrefix() {}, 
    isLeaf: function isLeaf() {}, 
    isInner: function isInner() {} }, 

  cached: { 
    hash: function hash() {
      var hasher = Hasher.put(this.hashPrefix());
      this.toBytesSink(hasher);
      return hasher.finish();} } });




var ShaMapLeaf = makeClass({ 
  inherits: ShaMapNode, 
  ShaMapLeaf: function ShaMapLeaf(index, item) {
    ShaMapNode.call(this);
    this.index = index;
    this.item = item;}, 

  isLeaf: function isLeaf() {
    return true;}, 

  isInner: function isInner() {
    return false;}, 

  hashPrefix: function hashPrefix() {
    return this.item.hashPrefix();}, 

  toBytesSink: function toBytesSink(sink) {
    this.item.toBytesSink(sink);
    this.index.toBytesSink(sink);} });



var $uper = ShaMapNode.prototype;

var ShaMapInner = makeClass({ 
  inherits: ShaMapNode, 
  ShaMapInner: function ShaMapInner() {var depth = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    ShaMapNode.call(this);
    this.depth = depth;
    this.slotBits = 0;
    this.branches = Array(16);}, 

  isInner: function isInner() {
    return true;}, 

  isLeaf: function isLeaf() {
    return false;}, 

  hashPrefix: function hashPrefix() {
    return HashPrefix.innerNode;}, 

  setBranch: function setBranch(slot, branch) {
    this.slotBits = this.slotBits | 1 << slot;
    this.branches[slot] = branch;}, 

  empty: function empty() {
    return this.slotBits === 0;}, 

  hash: function hash() {
    if (this.empty()) {
      return Hash256.ZERO_256;}

    return $uper.hash.call(this);}, 

  toBytesSink: function toBytesSink(sink) {
    for (var i = 0; i < this.branches.length; i++) {
      var branch = this.branches[i];
      var hash = branch ? branch.hash() : Hash256.ZERO_256;
      hash.toBytesSink(sink);}}, 


  addItem: function addItem(index, item, leaf) {
    assert(index instanceof Hash256);
    var nibble = index.nibblet(this.depth);
    var existing = this.branches[nibble];
    if (!existing) {
      this.setBranch(nibble, leaf || new ShaMapLeaf(index, item));} else 
    if (existing.isLeaf()) {
      var newInner = new ShaMapInner(this.depth + 1);
      newInner.addItem(existing.index, null, existing);
      newInner.addItem(index, item, leaf);
      this.setBranch(nibble, newInner);} else 
    if (existing.isInner()) {
      existing.addItem(index, item, leaf);} else 
    {
      assert(false);}} });




var ShaMap = makeClass({ 
  inherits: ShaMapInner });


module.exports = { 
  ShaMap: ShaMap };
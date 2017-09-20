'use strict';var _ = require('lodash');
var inherits = require('inherits');

function forEach(obj, func) {
  Object.keys(obj || {}).forEach(function (k) {
    func(obj[k], k);});}



function ensureArray(val) {
  return Array.isArray(val) ? val : [val];}


module.exports = function makeClass(klass_, definition_) {
  var definition = definition_ || klass_;
  var klass = typeof klass_ === 'function' ? klass_ : null;
  if (klass === null) {
    for (var k in definition) {
      if (k[0].match(/[A-Z]/)) {
        klass = definition[k];
        break;}}}



  var parent = definition.inherits;
  if (parent) {
    if (klass === null) {
      klass = function klass() {
        parent.apply(this, arguments);};}


    inherits(klass, parent);
    _.defaults(klass, parent);}

  if (klass === null) {
    klass = function klass() {};}

  var proto = klass.prototype;
  function addFunc(original, name, wrapper) {
    proto[name] = wrapper || original;}

  (definition.getters || []).forEach(function (k) {
    var key = '_' + k;
    proto[k] = function () {
      return this[key];};});


  forEach(definition.virtuals, function (f, n) {
    addFunc(f, n, function () {
      throw new Error('unimplemented');});});


  forEach(definition.methods, addFunc);
  forEach(definition, function (f, n) {
    if (_.isFunction(f) && f !== klass) {
      addFunc(f, n);}});


  _.assign(klass, definition.statics);
  if (typeof klass.init === 'function') {
    klass.init();}

  forEach(definition.cached, function (f, n) {
    var key = '_' + n;
    addFunc(f, n, function () {
      var value = this[key];
      if (value === undefined) {
        value = this[key] = f.call(this);}

      return value;});});


  if (definition.mixins) {(function () {
      var mixins = {};
      // Right-most in the list win
      ensureArray(definition.mixins).reverse().forEach(function (o) {
        _.defaults(mixins, o);});

      _.defaults(proto, mixins);})();}


  return klass;};
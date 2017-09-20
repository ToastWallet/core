'use strict';
var assert = require('assert-diff');
var parseOrderbookChanges = require('../src/index').parseOrderbookChanges;
var fixtures = require('./fixtures/orderbookchanges.js');
var orderWithExpiration = require('./fixtures/order-with-expiration.json');
var orderWithExpirationResult =
  require('./fixtures/order-with-expiration-parsed.json');

describe('parseOrderbookChanges', function() {
  it('parse OfferCreate -- consumed and partially consumed offer', function() {
    var meta = fixtures.offerCreateConsumedOffer().meta;
    var expected = fixtures.parsedOfferCreate();
    assert.deepEqual(parseOrderbookChanges(meta), expected);
  });

  it('parse OfferCreate -- created offer', function() {
    var meta = fixtures.offerCreateCreatedOffer().meta;
    var expected = fixtures.parsedOfferCreateCreated();
    assert.deepEqual(parseOrderbookChanges(meta), expected);
  });

  it('parse OfferCancel', function() {
    var meta = fixtures.offerCancel().meta;
    var expected = fixtures.parsedOfferCancel();
    assert.deepEqual(parseOrderbookChanges(meta), expected);
  });

  it('parse OfferCreate -- consumed offer, no changes to TakerGets',
  function() {
    var meta = fixtures.offerCreateNoChangeTakerGets().meta;
    var expected = fixtures.parsedOfferCreateNoChangeTakerGets();
    assert.deepEqual(parseOrderbookChanges(meta), expected);
  });

  it('order with expiration', function() {
    var meta = orderWithExpiration.meta;
    var expected = orderWithExpirationResult;
    assert.deepEqual(parseOrderbookChanges(meta), expected);
  });
});

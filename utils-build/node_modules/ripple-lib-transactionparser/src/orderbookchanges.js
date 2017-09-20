'use strict';
var _ = require('lodash');
var utils = require('./utils');
var GlobalBigNumber = require('bignumber.js');
var BigNumber = GlobalBigNumber.another({DECIMAL_PLACES: 40});
var parseQuality = require('./quality');

var lsfSell = 0x00020000;   // see "lsfSell" flag in rippled source code

function removeUndefined(obj) {
  return _.omit(obj, _.isUndefined);
}

function convertOrderChange(order) {
  var takerGets = order.taker_gets;
  var takerPays = order.taker_pays;
  var direction = order.sell ? 'sell' : 'buy';
  var quantity = (direction === 'buy') ? takerPays : takerGets;
  var totalPrice = (direction === 'buy') ? takerGets : takerPays;
  return removeUndefined({
    direction: direction,
    quantity: quantity,
    totalPrice: totalPrice,
    sequence: order.sequence,
    status: order.status,
    makerExchangeRate: order.quality,
    expirationTime: order.expiration
  });
}

function rippleToUnixTimestamp(rpepoch) {
  return (rpepoch + 0x386D4380) * 1000;
}

function getExpirationTime(node) {
  var expirationTime = node.finalFields.Expiration || node.newFields.Expiration;
  if (expirationTime === undefined) {
    return undefined;
  }
  return (new Date(rippleToUnixTimestamp(expirationTime))).toISOString();
}

function getQuality(node) {
  var takerGets = node.finalFields.TakerGets || node.newFields.TakerGets;
  var takerPays = node.finalFields.TakerPays || node.newFields.TakerPays;
  var takerGetsCurrency = takerGets.currency || 'XRP';
  var takerPaysCurrency = takerPays.currency || 'XRP';
  var bookDirectory = node.finalFields.BookDirectory
    || node.newFields.BookDirectory;
  var qualityHex = bookDirectory.substring(bookDirectory.length - 16);
  return parseQuality(qualityHex, takerGetsCurrency, takerPaysCurrency);
}

function parseOrderStatus(node) {
  if (node.diffType === 'CreatedNode') {
    // "submitted" is more conventional, but could be confusing in the
    // context of Ripple
    return 'created';
  }

  if (node.diffType === 'ModifiedNode') {
    return 'partially-filled';
  }

  if (node.diffType === 'DeletedNode') {
    // A filled order has previous fields
    if (node.previousFields.hasOwnProperty('TakerPays')) {
      return 'filled';
    }

    // A cancelled order has no previous fields
    // google search for "cancelled order" shows 5x more results than
    // "canceled order", even though both spellings are correct
    return 'cancelled';
  }
}

function calculateDelta(finalAmount, previousAmount) {
  if (previousAmount) {
    var finalValue = new BigNumber(finalAmount.value);
    var previousValue = new BigNumber(previousAmount.value);
    return finalValue.minus(previousValue).abs().toString();
  }
  return '0';
}

function parseChangeAmount(node, type) {
  var status = parseOrderStatus(node);

  if (status === 'cancelled') {
    // Canceled orders do not have PreviousFields; FinalFields
    // have positive values
    return utils.parseCurrencyAmount(node.finalFields[type]);
  } else if (status === 'created') {
    return utils.parseCurrencyAmount(node.newFields[type]);
  }
  var finalAmount = utils.parseCurrencyAmount(node.finalFields[type]);
  var previousAmount = utils.parseCurrencyAmount(node.previousFields[type]);
  var value = calculateDelta(finalAmount, previousAmount);
  return _.assign({}, finalAmount, {value: value});
}

function parseOrderChange(node) {
  var orderChange = convertOrderChange({
    taker_pays: parseChangeAmount(node, 'TakerPays'),
    taker_gets: parseChangeAmount(node, 'TakerGets'),
    sell: (node.finalFields.Flags & lsfSell) !== 0,
    sequence: node.finalFields.Sequence || node.newFields.Sequence,
    status: parseOrderStatus(node),
    quality: getQuality(node),
    expiration: getExpirationTime(node)
  });

  Object.defineProperty(orderChange, 'account', {
    value: node.finalFields.Account || node.newFields.Account
  });

  return orderChange;
}

function groupByAddress(orderChanges) {
  return _.groupBy(orderChanges, function(change) {
    return change.account;
  });
}

/**
 * Computes the complete list of every Offer that changed in the ledger
 * as a result of the given transaction.
 * Returns changes grouped by Ripple account.
 *
 *  @param {Object} metadata - Transaction metadata as return by ripple-lib
 *  @returns {Object} - Orderbook changes grouped by Ripple account
 *
 */
exports.parseOrderbookChanges = function parseOrderbookChanges(metadata) {
  var nodes = utils.normalizeNodes(metadata);

  var orderChanges = _.map(_.filter(nodes, function(node) {
    return node.entryType === 'Offer';
  }), parseOrderChange);

  return groupByAddress(orderChanges);
};

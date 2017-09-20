'use strict';
var createHash = require('create-hash');

// For a hash function, rippled uses SHA-512 and then truncates the result
// to the first 256 bytes. This algorithm, informally called SHA-512Half,
// provides an output that has comparable security to SHA-256, but runs
// faster on 64-bit processors.
function sha512half(buffer) {
  var sha512 = createHash('sha512');
  return sha512.update(buffer).digest('hex').toUpperCase().slice(0, 64);
}

module.exports = sha512half;

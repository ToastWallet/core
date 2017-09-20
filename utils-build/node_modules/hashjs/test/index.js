var Hash = require('../dist/hash.js');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe("Hash", function() {

  describe('#expand', function() {
    it('simple, string-key nested', function() {
      var flat = {
        'One.Two.val': 'nested2',
        'One.Two.Three.val': 'nested3',
        'One.Two.Three.Four.val': 'nested4',
        'One.Two.Three.Four.Five.val': 'nested5'
      };

      expect(Hash.expand(flat), {
        One: {
          Two: {
            val: 'nested2',
            Three: {
              val: 'nested3',
              Four: {
                val: 'nested4',
                Five: {
                  val: 'nested5'
                }
              }
            }
          }
        }
      }, 'Expands flattened object with only string keys.');

    });

    it('string-key and array nested', function() {
      var flat = {
        'One.0.val'         : 'first',
        'One.1.Two.val'       : 'second',
        'One.1.Two.Three.0.val'   : 'third',
        'One.1.Two.Three.1.val'   : 'third'
      };

      expect(Hash.expand(flat), objectArchetype(1), 'Expands flatened object with numberic keys. Should result in arrays.');

    });
  });

  describe('#extract', function() {
    it('extracts values for token-numeric wildcard query', function() {
      // 'Gets an array of "third" and "third", the values at the path One.1.Two.Three.{any numberic key}.val'
      var data = objectArchetype(1);

      expect(Hash.extract(data, 'One.1.Two.Three.{n}.val')).to.deep.equal([
        'third',
        'third'
      ]);

    });

    it('Token string wildcard extraction', function() {
      var data = objectArchetype(1);
      // 'Extract path One.1.{s}, gets the values at One.1.{any string key}'
      expect(Hash.extract(data, 'One.1.Two.{s}')).to.deep.equal([
        'second',
        [{
          val: 'third'
        },{
          val: 'third'
        }]
      ]);
    });
  });

  describe('#get', function() {
    it('simple get path', function() {
      var data = objectArchetype(1);

      expect(Hash.get(data, 'One.1.Two.Three.1.val')).to.equal('third');
    });
  });

  describe('#insert', function() {
    it('insert at simple path', function() {
      var data = objectArchetype(1);

      Hash.insert(data, 'One.1.Two.valsibling', 'two');

      expect(data).to.deep.equal({
          One: [{
            val: "first"
          },{
            Two: {
              Three: [{
                val: 'third'
              },{
                val: 'third'
              }],
              val: "second",
              valsibling: 'two'
            }
          }]
        }, 'Should insert sibling key "valsibling" in "Two" object with value "two"');
    });

    it('insert at simple path 2 - Array insert', function() {
      var data = objectArchetype(1);

      Hash.insert(data, 'One.1.Two.Three.2', {val: 'third'});

      expect(data).to.deep.equal({
          One: [{
            val: "first"
          },{
            Two: {
              Three: [{
                val: 'third'
              },{
                val: 'third'
              },{
                val: 'third'
              }],
              val: "second"
            }
          }]
        }, 'Should insert object val: third into "Three" array at index 2');
    });

    it('insert at complex path', function() {
      var data = objectArchetype(1);

      Hash.insert(data, 'One.1.Two.{s}', 'replaced');

      expect(data).to.deep.equal({
          One: [{
            val: "first"
          },{
            Two: {
              Three: 'replaced',
              val: 'replaced'
            }
          }]
        }, 'Should replace all values in "Two" object that have string keys with "replaced" ');
    });
  });

  describe('#remove', function() {
    it('remove at simple path', function() {
      var data = objectArchetype(1);

      Hash.remove(data, 'One.1.Two.Three.1');

      expect(data).to.deep.equal({
          "One": [{
            "val": "first"
          },{
            "Two": {
              "val": "second",
              "Three": [{
                "val": "third"
              }]
            }
          }]
        }, 'should have removed an object from the "Three" array of objects')
    });


    it('remove at complex path', function() {
      var data = objectArchetype(1);

      Hash.remove(data, 'One.1.Two.Three.{n}');

      expect(data).to.deep.equal({
          One: [{
            val: "first"
          },{
            Two: {
              val: "second"
            }
          }]
        }, 'should have removed an object from the "Three" array of objects, path: One.1.Two.Three.{n}')
    });
  });

  describe('#flatten', function() {
    it('deep object', function() {

      var date = new Date(),
        regex = new RegExp();

      var deepObject = {
        One: {
          Two: {
            val: 'string',
            Three: {
              Four: 1,
              Five: 2
            }
          }
        },
        Two: {
          Two: {
            Three: {
              val: date
            },
            Four: {
              val: regex
            }
          }
        }
      };

      var flattened = Hash.flatten(deepObject);

      expect(flattened).to.deep.equal({
        'One.Two.val'     : 'string',
        'One.Two.Three.Four'  : 1,
        'One.Two.Three.Five'  : 2,
        'Two.Two.Three.val'   : date,
        'Two.Two.Four.val'    : regex,
      }, 'flatten a deep object with native javascript objects inside');
    });

    it('simple flat', function() {

      var shallowObject = {
        one: 'val',
        two: 'val',
        three: 'val'
      };

      var flattened = Hash.flatten(shallowObject);

      expect(flattened).to.deep.equal({
        one: 'val',
        two: 'val',
        three: 'val'
      }, 'flatten a shallow object');
    });
  });

});

function objectArchetype(key) {
  if (key === 1) {
    return new Object({
      "One": [{
        "val": "first"
      },{
        "Two": {
          "val": "second",
          "Three": [{
            "val": "third"
          },{
            "val": "third"
          }]
        }
      }]
    });
  }
}
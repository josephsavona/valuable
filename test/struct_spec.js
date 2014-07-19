var assert = require('chai').assert,
    sinon = require('sinon'),
    Valueable = require('..'),
    Struct = require('../src/struct'),
    Map = require('../src/map'),
    List = require('../src/list'),
    Value = require('../src/value'),
    rawValues = require('./mock_values');

describe('Struct', function() {
  it('cannot be created directly', function() {
    assert.throws(function() {
      Struct();
    })
    assert.throws(function() {
      Struct({});
    });
    assert.throws(function() {
      Struct({key:'value'});
    });
  });

  it.skip('can create a subclass', function() {
    var MyStruct,
        map = {},
        list = [],
        literal = {};

    MyStruct = function MyStruct(map) {
      Struct.apply(this, map);
    };
    MyStruct.prototype = Object.create(Struct.prototype);
    MyStruct.prototype.properties = {
      map: Map,
      list: List,
      literal: Value
    };

    var struct = new MyStruct({
      map: map,
      list: list,
      literal: literal
    });
    assert.deepEqual(struct.val(), {
      map: map,
      list: list,
      literal: literal
    });
  });
});
var assert = require('chai').assert,
    sinon = require('sinon'),
    Valueable = require('..'),
    Struct = require('../src/struct'),
    Map = require('../src/map'),
    List = require('../src/list'),
    Value = require('../src/value'),
    rawValues = require('./mock_values');

describe('Struct', function() {
  var MyStruct;

  beforeEach(function() {
    MyStruct = function MyStruct(map) {
      Struct.call(this, map);
    };
    MyStruct.prototype = Object.create(Struct.prototype);
    MyStruct.prototype.properties = {
      map: Map,
      list: List,
      literal: Value
    };
  })

  it('constructor cannot be called directly', function() {
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

  it('cannot construct instances of subclass if properties are not defined', function() {
    delete MyStruct.prototype.properties;
    assert.throws(function() {
      new MyStruct();
    });
  });

  it('constructs instances of subclass with empty values for the defined property types', function() {
    var struct = new MyStruct();
    assert.ok(struct instanceof MyStruct);
    assert.ok(struct.get('map') instanceof Map);
    assert.ok(struct.get('list') instanceof List);
    assert.ok(struct.get('literal') instanceof Value);
    assert.deepEqual(struct.val(), {
      map: {},
      list: [],
      literal: undefined
    });
  });

  it('constructs instances with the given values for defined property types', function() {
    var map = {key: 'value'},
        list = ['item'],
        literal = 123,
        struct;
    struct = new MyStruct({
      map: map,
      list: list,
      literal: literal
    });
    assert.ok(struct instanceof MyStruct);
    assert.ok(struct.get('map') instanceof Map);
    assert.ok(struct.get('list') instanceof List);
    assert.ok(struct.get('literal') instanceof Value);
    assert.deepEqual(struct.val(), {
      map: map,
      list: list,
      literal: literal
    });
  });

  it('constructor enforces the types of properties', function() {
    var invalid = [
      {map: []},
      {map: true},
      {map: 123},
      {list: {}},
      {list: true},
      {list: 123}
    ];
    invalid.forEach(function(map) {
      assert.throws(function() {
        new MyStruct(map);
      });
    })
  });

  it('enforces the types of properties in set()', function() {
    var invalid = [
      ['map', []],
      ['map', true],
      ['map', 123],
      ['list', {}],
      ['list', true],
      ['list', 123]
    ];
    invalid.forEach(function(params) {
      assert.throws(function() {
        var struct = new MyStruct();
        struct.set.apply(struct, params);
      });
    })
  });
});
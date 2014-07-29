var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    Struct = require('../src/struct'),
    Map = require('../src/map'),
    List = require('../src/list'),
    Value = require('../src/value'),
    Decimal = require('../src/types/decimal'),
    Bool = require('../src/types/bool'),
    Str = require('../src/types/str'),
    rawValues = require('./mock_values');

describe('Struct', function() {
  var MyStruct, properties, sample, emptySample;

  // need to ensure that any Object.prototype hacking
  // will not interfere (also helps ensure 100% test coverage)
  beforeEach(function() {
    Object.prototype.prototypeKey = 'prototypeKey';
  });
  afterEach(function() {
    delete Object.prototype.prototypeKey;
  });

  beforeEach(function() {
    properties = {
      map: Map,
      list: List,
      literal: Value,
      decimal: Decimal,
      str: Str,
      bool: Bool
    };
    sample = {
      map: {key: 'value'},
      list: ['item'],
      literal: 123,
      decimal: 98.6,
      str: 'hi',
      bool: true
    };
    emptySample = {
      map: {},
      list: [],
      literal: undefined,
      decimal: 0,
      bool: false,
      str: ''
    };
    MyStruct = Struct.schema(properties);
  });

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
      MyStruct();
    });
  });

  it('cannot be created with a non-object value', function() {
    rawValues.forEach(function(val) {
      if (_.isPlainObject(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        Map(val);
      });
    });
  });

  it('constructs instances of subclass with empty values for the defined property types', function() {
    var struct = MyStruct();
    assert.ok(struct instanceof MyStruct);
    assert.ok(struct instanceof Struct);
    assert.ok(struct instanceof Map);
    assert.ok(struct instanceof Value);
    assert.ok(struct.get('map') instanceof Map);
    assert.ok(struct.get('list') instanceof List);
    assert.ok(struct.get('literal') instanceof Value);
    assert.deepEqual(struct.val(), emptySample);
  });

  it('constructs instances with the given values for defined property types', function() {
    var map = {key: 'value'},
        list = ['item'],
        literal = 123,
        decimal = 98.6,
        bool = true,
        str = 'hi',
        struct;
    struct = MyStruct({
      map: map,
      list: list,
      literal: literal,
      decimal: decimal,
      bool: bool,
      str: str
    });
    assert.ok(struct instanceof MyStruct);
    assert.ok(struct.get('map') instanceof Map);
    assert.ok(struct.get('list') instanceof List);
    assert.ok(struct.get('literal') instanceof Value);
    assert.deepEqual(struct.val(), {
      map: map,
      list: list,
      literal: literal,
      decimal: decimal,
      bool: bool,
      str: str
    });
  });

  it('unwraps wrapped values in setVal()', function() {
    rawValues.forEach(function(val) {
      var s1 = MyStruct(sample),
          s2 = MyStruct({bool: true});
      var newValue = _.cloneDeep(emptySample);
      newValue.bool = true;

      s1.setVal(s2);
      assert.deepEqual(s1.val(), s2.val());
      assert.deepEqual(s1.val(), newValue);
    });
  });

  it('constructor enforces the types of properties', function() {
    var invalid = [
      {map: []},
      {map: true},
      {map: 123},
      {list: {}},
      {list: true},
      {list: 123},
      {decimal: true},
      {decimal: []},
      {decimal: {}},
      {decimal: ''},
      {bool: 0},
      {bool: null},
      {bool: ''},
      {bool: {}},
      {bool: []},
      {str: true},
      {str: []},
      {str: {}},
      {str: 0}
    ];
    invalid.forEach(function(map) {
      assert.throws(function() {
        MyStruct(map);
      });
    })
  });

  it('enforces the types of properties in set()', function() {
    var invalid = [
      {map: []},
      {map: true},
      {map: 123},
      {list: {}},
      {list: true},
      {list: 123},
      {decimal: true},
      {decimal: []},
      {decimal: {}},
      {decimal: ''},
      {bool: 0},
      {bool: null},
      {bool: ''},
      {bool: {}},
      {bool: []},
      {str: true},
      {str: []},
      {str: {}},
      {str: 0}
    ];
    invalid.forEach(function(params) {
      _.forEach(params, function(value, key) {
        assert.throws(function() {
          var struct = MyStruct();
          struct.set(key, value);
        })
      })
    })
  });

  it('constructs custom subclasses with Struct.inherits()', function() {
    var SubStruct = Struct.inherits(properties, {
      proxyVal: function() {
        return this.val();
      }
    });
    var struct = SubStruct(sample);
    assert.deepEqual(struct.val(), sample, 'val() works');
    assert.deepEqual(struct.proxyVal(), sample, 'instance methods work');
  });

  it('can reset the value with setVal()', function() {
    var struct = MyStruct({});
    assert.deepEqual(struct.val(), emptySample);
    struct.setVal(sample);
    assert.deepEqual(struct.val(), sample);
  });
});
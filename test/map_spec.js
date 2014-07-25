var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    Map = require('../src/map'),
    Value = require('../src/value'),
    Bool = require('../src/types/bool'),
    Decimal = require('../src/types/decimal'),
    Str = require('../src/types/str'),
    rawValues = require('./mock_values');

describe('Map', function() {
  it('can be observe()-ed with a function callback', function() {
    assert.doesNotThrow(function() {
      var value = Map();
      value.observe(function(){});
    });
  });

  it('throws if observe() called with non-function', function() {
    assert.throws(function() {
      var value = Map();
      value.observe(1);
    });
  });

  it('throws if key is not a string', function() {
    rawValues.forEach(function(val) {
      if (typeof val === 'string') {
        return;
      }
      assert.throws(function() {
        Map().set(val, val);
      }, Error, null, 'set() takes string key');
      assert.throws(function() {
        Map().del(val);
      }, Error, null, 'del() takes string');
      assert.throws(function() {
        Map().get(val);
      }, Error, null, 'get() takes string');
      assert.throws(function() {
        Map().hasKey(val);
      }, Error, null, 'hasKey() takes string');
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

  it('returns the real value via val()', function() {
    var value = Map();
    assert.deepEqual(value.val(), {});
  });

  it('sets initial value on map creation', function() {
    rawValues.forEach(function(val) {
      var map = {key: val},
          value = Map(map);
      assert.deepEqual(value.val(), map);
    });
  });

  it('sets keys via set()', function() {
    rawValues.forEach(function(val) {
      var value = Map();
      value.set('key', val);
      assert.deepEqual(value.val('key'), val);
    });
  });

  it('wraps values as valuables', function() {
    rawValues.forEach(function(val) {
      var value = Map();
      value.set('key', val);
      assert.ok(value.get('key') instanceof Value, 'wraps values in Value');
      assert.deepEqual(value.get('key').val(), val, 'wrapped value has the set value');
    })
  });

  it('observe()s key changes from set()', function() {
    rawValues.forEach(function(val) {
      var value = Map(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], {key: val});
    });
  });

  it('observe()s key changes from get().set()', function() {
    rawValues.forEach(function(val) {
      var value = Map({key: 0}),
          observer = sinon.spy();
      value.observe(observer);
      value.get('key').setVal(val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], {key: val});
    });
  });

  it('observe()s key deletions', function() {
    rawValues.forEach(function(val) {
      var value = Map(),
          observer = sinon.spy(),
          deleted;
      value.observe(observer);
      value.set('key', val);
      deleted = value.del('key');
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], {key: val});
      assert.deepEqual(observer.args[1][0], {});
      assert.deepEqual(deleted, val, 'del() returns the raw value of the key');
    });
  });

  it('unwraps wrapped values in constructor', function() {
    rawValues.forEach(function(val) {
      var wrapped = Value(val),
          map = Map({key: wrapped});

      assert.deepEqual(map.val(), {key: val}, 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(map.val(), {key: val}, 'map remains unaffected');
    });
  });

  it('unwraps wrapped values in set()', function() {
    rawValues.forEach(function(val) {
      var wrapped = Value(val),
          map = Map();
      map.set('key', wrapped);

      assert.deepEqual(map.val(), {key: val}, 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(map.val(), {key: val}, 'map remains unaffected');
    });
  });

  it('nests maps', function() {
    var map = {key: 1, nested: {key: 11}},
        value = Map(map),
        observer = sinon.spy();

    assert.deepEqual(value.val(), map);
    assert.deepEqual(value.val('nested'), map.nested);
    assert.deepEqual(value.get('nested').val(), map.nested);
    assert.deepEqual(value.get('nested').val('key'), map.nested.key);

    value.observe(observer);
    value.get('nested').get('key').setVal(false);
    assert.ok(observer.calledOnce, 'observer called once for grandchild value change');
    map.nested.key = false;
    assert.deepEqual(observer.args[0][0], map, 'new value is as expected');
  });

  var types = [
    {klass: Decimal, label: 'Decimal', test: _.isNumber},
    {klass: Str, label: 'Str', test: _.isString},
    {klass: Bool, label: 'Bool', test: _.isBoolean}
  ];
  _.forEach(types, function(type) {
    rawValues.forEach(function(val) {
      if (type.test.call(_, val)) {
        var label = 'Map.of(' + type.label + ') OK ' + typeof val;
        it(label, function() {
          assert.doesNotThrow(function() {
            Map.of(type.klass)({key: val});
          }, label);
        });
      } else {
        var label = 'Map.of(' + type.label + ') rejects ' + typeof val;
        it(label, function() {
          assert.throws(function() {
            Map.of(type.klass)({key: val});
          }, Error, null, label);
        });
      }
    });
  });

  it('can be inherited', function() {
    var DecimalMap = Map.inherits(Decimal, {
      sum: function DecimalMap$sum() {
        var sum = 0;
        for (key in this._raw) {
          sum += this._raw[key];
        }
        return sum;
      }
    });
    var map = DecimalMap({zero: 0, one: 1, two: 2, three: 3, four: 0});
    map.set('five', 0);
    map.set('four', 4);
    map.set('five', 5);
    var sum = map.sum();
    assert.ok(map instanceof DecimalMap);
    assert.ok(map instanceof Map);
    assert.ok(map instanceof Value);
    assert.equal(sum, 15, 'prototype method works');
    assert.deepEqual(map.val(), {zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5}, 'val() returns original value');
  });
});
 
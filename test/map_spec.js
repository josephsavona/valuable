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
  // need to ensure that any Object.prototype hacking
  // will not interfere (also helps ensure 100% test coverage)
  beforeEach(function() {
    Object.prototype.prototypeKey = 'prototypeKey';
  });
  afterEach(function() {
    delete Object.prototype.prototypeKey;
  });

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

  it('ignores deletions of undefined keys', function() {
    var value = Map(),
        observer = sinon.spy(),
        deleted;
    value.observe(observer);
    deleted = value.del('key');
    assert.notOk(value.hasKey('key'));
    assert.ok(typeof deleted === 'undefined', 'nothing to delete');
    assert.notOk(observer.called, 'no change, observer not called');
    assert.deepEqual(value.val(), {});
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

  it('unwraps wrapped values in setVal()', function() {
    rawValues.forEach(function(val) {
      var map = Map({key: val}),
          map2 = Map({newKey: 'new value'}); // using a different key here to check that the old key is destroyed
      map.setVal(map2);
      assert.deepEqual(map.val(), map2.val());
      assert.deepEqual(map.val(), {newKey: 'new value'});
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
  it('typed maps accept/reject correct types', function () {
    _.forEach(types, function(type) {
      rawValues.forEach(function(val) {
        if (type.test.call(_, val)) {
          var label = 'Map.of(' + type.label + ') OK ' + typeof val;
          assert.doesNotThrow(function() {
            Map.of(type.klass)({key: val});
          }, label);
        } else {
          var label = 'Map.of(' + type.label + ') rejects ' + typeof val;
          assert.throws(function() {
            Map.of(type.klass)({key: val});
          }, Error, null, label);
        }
      });
    });
  });

  it('can be inherited', function() {
    var DecimalMap = Map.inherits(Decimal, {
      sum: function DecimalMap$sum() {
        var sum = 0;
        for (key in this._raw) {
          if (this._raw.hasOwnProperty(key)) {
            sum += this._raw[key];
          }
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

  it('can be inherited with any Value subclass or Valuable', function() {
    var klasses = [Value, Valueable, Valueable.List, Valueable.Map, Valueable.Decimal, Valueable.Str];
    klasses.forEach(function(klass) {
      assert.doesNotThrow(function() {
        Map.inherits(klass, {});
      });
      assert.doesNotThrow(function() {
        Map.of(klass);
      });
    });
  });

  it('observe() has source of change as second param for set()', function() {
    rawValues.forEach(function(val) {
      var value = Map(),
          observer = sinon.spy(),
          key,
          newKey;

      value.observe(observer);
      value.set('key', val);
      key = value.get('key');
      assert.equal(observer.args[0][1], key);
      value.set('key', _.isPlainObject(val) ? {key: val} : (_.isArray(val) ? [val] : val));
      newKey = value.get('key');
      assert.equal(observer.args[1][1], newKey);
    });
  });

  it('observe() has source of change as second param for get().setVal()', function() {
    var value = Map({key: ''}),
        observer = sinon.spy(),
        key = value.get('key');

    value.observe(observer);
    value.get('key').setVal('diff1');
    assert.equal(observer.args[0][1], key);
    value.get('key').setVal('diff2');
    assert.equal(observer.args[1][1], key);
  });

  it('observe() has source of change as second param for del()', function() {
    var value = Map({key: ''}),
        observer = sinon.spy(),
        key = value.get('key');

    value.observe(observer);
    value.del('key');
    assert.equal(observer.args[0][1], key);
  });

  it('observe() has source of change as second param for setVal()', function() {
    var value = Map({}),
        observer = sinon.spy();
    value.observe(observer);
    value.setVal({key: true});
    assert.equal(observer.args[0][1], value);
  });

  it.skip('get() returns a lense into the targeted path', function() {
    var value = Map({a: {b: {c: 1}}}),
        lense,
        lense2;
    lense = value.get('a').get('b').get('c');
    assert.deepEqual(lense.val(), 1);

    value.setVal({a: {b: {c: 2}}});
    lense2 = value.get('a').get('b').get('c');
    assert.equal(lense, lense2);
    assert.deepEqual(lense.val(), 2);
    assert.deepEqual(lense2.val(), 2);
  });
});
 
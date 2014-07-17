var assert = require('chai').assert,
    sinon = require('sinon'),
    Valueable = require('..'),
    Map = require('../src/Map'),
    Value = require('../src/value'),
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
      value.get('key').set(val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], {key: val});
    });
  });

  it('observe()s key deletions', function() {
    rawValues.forEach(function(val) {
      var value = Map(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      value.del('key');
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], {key: val});
      assert.deepEqual(observer.args[1][0], {});
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
    value.get('nested').get('key').set(false);
    assert.ok(observer.calledOnce, 'observer called once for grandchild value change');
    map.nested.key = false;
    assert.deepEqual(observer.args[0][0], map, 'new value is as expected');
  });
});
 
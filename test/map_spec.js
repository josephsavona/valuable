var assert = require('chai').assert,
    sinon = require('sinon'),
    map = require('../src/map'),
    rawValues = require('./mock_values');

describe('map', function() {
  it('can be observe()-ed with a function callback', function() {
    assert.doesNotThrow(function() {
      var value = map();
      value.observe(function(){});
    });
  });

  it('throws if observe() called with non-function', function() {
    assert.throws(function() {
      var value = map();
      value.observe(1);
    });
  });

  it('throws if key is not a string', function() {
    rawValues.forEach(function(val) {
      if (typeof val === 'string') {
        return;
      }
      assert.throws(function() {
        map().set(val, val);
      }, Error, null, 'set() takes string key');
      assert.throws(function() {
        map().del(val);
      }, Error, null, 'del() takes string');
      assert.throws(function() {
        map().get(val);
      }, Error, null, 'get() takes string');
      assert.throws(function() {
        map().hasKey(val);
      }, Error, null, 'hasKey() takes string');
    });
  });

  it('returns the real value via val()', function() {
    var value = map();
    assert.deepEqual(value.val(), {});
  });

  it('sets keys via set()', function() {
    rawValues.forEach(function(val) {
      var value = map();
      value.set('key', val);
      assert.deepEqual(value.get('key'), val);
    });
  });

  it('observe()s key changes', function() {
    rawValues.forEach(function(val) {
      var value = map(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], {key: val});
    });
  });

  it('observe()s key deletions', function() {
    rawValues.forEach(function(val) {
      var value = map(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      value.del('key');
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], {key: val});
      assert.deepEqual(observer.args[1][0], {});
    });
  });
});
 
var assert = require('chai').assert,
    sinon = require('sinon'),
    valuable = require('..'),
    rawValues = require('./mock_values');

describe('Value', function() {
  it('can be observe()-ed with a function callback', function() {
    assert.doesNotThrow(function() {
      var value = valuable();
      value.observe(function(){});
    });
  });

  it('throws if observe() called with non-function', function() {
    assert.throws(function() {
      var value = valuable();
      value.observe(1);
    });
  });

  it('returns the real value via val()', function() {
    rawValues.forEach(function(val) {
      var value = valuable(val);
      assert.deepEqual(value.val(), val);
    });
  });

  it('modifies the value via set()', function() {
    rawValues.forEach(function(val) {
      var value = valuable();
      assert.deepEqual(value.val(), undefined);
      value.set(val);
      assert.deepEqual(value.val(), val);
    });
  });

  it('observe()s value changes', function() {
    rawValues.forEach(function(val) {
      var value = valuable(),
          observer = sinon.spy();
      value.observe(observer);
      value.set(val);
      assert.ok(observer.calledOnce, 'observer called when value set()');
      assert.ok(observer.calledWith, val, 'observer called with the new value');
    });
  });

  it('can be unobserve()-ed', function() {
    var value = valuable(),
        observer = sinon.spy();
    value.observe(observer);
    value.set(true);
    value.unobserve(observer);
    value.set(false);
    assert.ok(observer.calledOnce, 'observer called only once');
    assert.ok(observer.calledWith(true), 'observer called only before unobserved');
  });

  it('always returns the current value (even if re-set() a ton)', function() {
    var value = valuable();
    rawValues.forEach(function(val, ix) {
      value.set(val);
      assert.deepEqual(value.val(), val);
    });
  });
});
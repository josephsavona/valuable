var assert = require('chai').assert,
    sinon = require('sinon'),
    valuable = require('..'),
    rawValues = require('./mock_values');

describe('value', function() {
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

  it('notifies observe()-rs when value is set', function() {
    rawValues.forEach(function(val) {
      var value = valuable(),
          observer = sinon.spy();
      value.observe(observer);
      value.set(val);
      assert.ok(observer.calledOnce, 'observer called when value set()');
    });
  });
});
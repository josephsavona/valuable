var assert = require('chai').assert,
    sinon = require('sinon'),
    helpers = require('./helpers'),
    Value = require('../src/value'),
    rawValues = require('./mock_values');

describe('Value', function() {
  helpers.init();

  it('can be observe()-ed with a function callback', function() {
    assert.doesNotThrow(function() {
      var value = Value();
      value.observe(function(){});
    });
  });

  it('throws if observe() called with non-function', function() {
    assert.throws(function() {
      var value = Value();
      value.observe(1);
    });
  });

  it('returns the real value via val()', function() {
    rawValues.forEach(function(val) {
      var value = Value(val);
      assert.deepEqual(value.val(), val);
    });
  });

  it('modifies the value via set()', function() {
    rawValues.forEach(function(val) {
      var value = Value();
      assert.deepEqual(value.val(), undefined);
      value.setVal(val);
      assert.deepEqual(value.val(), val);
    });
  });

  it('can handle DOM-like events with a .target.value via .handleChange()', function() {
    rawValues.forEach(function(val) {
      var value = Value(),
          change = value.handleChange(),
          observer = sinon.spy();
      value.observe(observer);
      change({target: {value: val}});
      helpers.runOneTick();
      assert.ok(observer.calledOnce, 'observer notified');
      assert.deepEqual(value.val(), val, 'value is updated');
    });
  });

  it('uwraps wrapped values on set()', function() {
    rawValues.forEach(function(val) {
      var value = Value(val),
          other = Value();
      other.setVal(value);

      assert.deepEqual(value.val(), val, 'values identical');
      assert.deepEqual(other.val(), val, 'values identical');

      value.setVal([val]);
      assert.deepEqual(value.val(), [val], 'value is changed');
      assert.deepEqual(other.val(), val, 'other is unaffected');
    });
  });

  it('observe()s value changes', function() {
    rawValues.forEach(function(val) {
      var value = Value(),
          observer = sinon.spy();
      value.observe(observer);
      value.setVal(val);
      helpers.runOneTick();
      assert.ok(observer.calledOnce, 'observer called when value set()');
      assert.ok(observer.calledWith, val, 'observer called with the new value');
    });
  });

  it('can be unobserve()-ed', function() {
    var value = Value(),
        observer = sinon.spy();
    value.observe(observer);
    value.setVal(true);
    helpers.runOneTick();
    value.unobserve(observer);
    value.setVal(false);
    helpers.runOneTick();
    assert.ok(observer.calledOnce, 'observer called only once');
    assert.ok(observer.calledWith(true), 'observer called only before unobserved');
  });

  it('always returns the current value (even if re-set() a ton)', function() {
    var value = Value();
    rawValues.forEach(function(val, ix) {
      value.setVal(val);
      assert.deepEqual(value.val(), val, 'literal value always updates');
    });
  });
});
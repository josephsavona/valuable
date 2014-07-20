var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Value = require('../../src/value'),
    Bool = require('../../src/types/bool'),
    rawValues = require('../mock_values');

describe('Bool', function() {
  it('has a default value of 0', function() {
    var i = Bool();
    assert.equal(i.val(), 0);
  });

  it('cannot construct from non-number values', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        Bool(val);
      })
    });
  });

  it('constructs with the given number value', function() {
    [true,false].forEach(function(val) {
      var d = Bool(val);
      assert.deepEqual(d.val(), val);
      assert.ok(isNaN(d.val()) || typeof d.val() === 'boolean');
    });
  });

  it('cannot set to a non-number value', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      d = Bool();
      assert.throws(function() {
        d.set(val);
      })
    });
  });

  it('sets to true/false', function() {
    [true,false].forEach(function(val) {
      var d = Bool();
      d.set(val);
      assert.deepEqual(d.val(), val);
      assert.ok(isNaN(d.val()) || typeof d.val() === 'boolean');
    });
  });

  it('negates the current value', function() {
    [true,false].forEach(function(val) {
      var d = Bool(val);
      d.negate();
      assert.deepEqual(d.val(), !val);
      assert.ok(isNaN(d.val()) || typeof d.val() === 'boolean');
    });
  });
});
var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Value = require('../../src/value'),
    Bool = require('../../src/types/bool'),
    rawValues = require('../mock_values');

describe('Bool', function() {
  it('has a default value of 0', function() {
    var i = Bool();
    assert.equal(i.val(), false);
  });

  it('resets to default value for setVal(undefined)', function() {
    var i = Bool(true);
    i.setVal();
    assert.equal(i.val(), false);
  });

  it('cannot construct from non-boolean values', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        Bool(val);
      })
    });
  });

  it('constructs with the given boolean value', function() {
    [true,false].forEach(function(val) {
      var d = Bool(val);
      assert.deepEqual(d.val(), val);
    });
  });

  it('cannot set to a non-boolean value', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      d = Bool();
      assert.throws(function() {
        d.setVal(val);
      })
    });
  });

  it('sets to true/false', function() {
    [true,false].forEach(function(val) {
      var d = Bool();
      d.setVal(val);
      assert.deepEqual(d.val(), val);
    });
  });

  it('negates the current value', function() {
    [true,false].forEach(function(val) {
      var d = Bool(val);
      d.negate();
      assert.deepEqual(d.val(), !val);
    });
  });
});
var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../../src/model'),
    Bool = require('../../src/bool'),
    rawValues = require('../mock_values');

var MyModel = Model.define({
  bool: Bool
});

describe('Bool', function() {
  var model;
  it('has a default value of 0', function() {
    var i = new MyModel();
    assert.equal(i.val('bool'), false);
  });

  it('cannot construct from non-boolean values', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        new MyModel({bool: val});
      })
    });
  });

  it('constructs with the given boolean value', function() {
    [true,false].forEach(function(val) {
      var i = new MyModel({bool: val});
      assert.deepEqual(i.bool.val, val);
    });
  });

  it('cannot set to a non-boolean value', function() {
    rawValues.forEach(function(val) {
      if (_.isBoolean(val) || val === null || typeof val === 'undefined') {
        return;
      }
      var i = new MyModel();
      assert.throws(function() {
        i.bool.val = val;
      })
    });
  });

  it('sets to true/false', function() {
    [true,false].forEach(function(val) {
      var i = new MyModel();
      i.bool.val = val;
      assert.deepEqual(i.val('bool'), val);
    });
  });

  it('negates the current value', function() {
    [true,false].forEach(function(val) {
      var i = new MyModel({bool: val});
      i.bool.negate();
      assert.deepEqual(i.val('bool'), !val);
    });
  });
});
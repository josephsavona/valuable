var assert = require('assert'),
    _ = require('lodash'),
    Int = require('./int'),
    inherits = require('../inherits');

var Float = function Float() {};

var proto = {
  assertValidValue: function(val) {
    assert.ok(typeof val === 'number');
  }
};

module.exports = inherits(Int, Float, proto);
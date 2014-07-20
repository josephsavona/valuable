var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Bool = function Bool() {
  if (typeof this._raw === 'undefined') {
    this._raw = false;
  }
};

var proto = {
  assertValidValue: function(val) {
    assert.ok(typeof val === 'boolean', 'Bool(): value must be true/false');
  },
  set: function Bool$set(val) {
    this.assertValidValue(val);
    Value.prototype.set.call(this, val);
  },
  negate: function Bool$negate() {
    this.set(!this._raw);
  }
};

module.exports = inherits(Value, Bool, proto);
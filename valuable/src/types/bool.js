var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Bool = function Bool(value) {
  Value.call(this, value);
};

var proto = {
  _defaultValue: false,
  assertValidValue: function Bool$assertValidValue(val) {
    assert.ok(typeof val === 'boolean', 'Bool(): value must be true/false');
  },
  negate: function Bool$negate() {
    this.setVal(!this._raw);
  }
};

module.exports = inherits(Value, Bool, proto);
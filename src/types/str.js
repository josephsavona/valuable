var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Str = function Str(value) {
  Value.call(this, value);
  if (typeof this._raw === 'undefined') {
    this._raw = '';
  }
};

var proto = {
  assertValidValue: function Str$assertValidValue(val) {
    assert.ok(typeof val === 'string', 'Str(): value must be a string');
  },
  append: function Str$append(val) {
    this.assertValidValue(val);
    this.setVal(this._raw + val);
  },
  prepend: function Str$prepend(val) {
    this.assertValidValue(val);
    this.setVal(val + this._raw);
  },
  wrap: function Str$wrap(pre, post) {
    this.assertValidValue(pre);
    this.assertValidValue(post);
    this.setVal(pre + this._raw + post);
  },
  length: function() {
    return this._raw.length;
  },
  update: function Str$update(fn) {
    var val;
    assert.equal(typeof fn, 'function');
    this.setVal(fn(this._raw))
  }
};

module.exports = inherits(Value, Str, proto);
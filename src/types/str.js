var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Str = function Str() {
  if (typeof this._raw === 'undefined') {
    this._raw = 0;
  }
};

var proto = {
  assertValidValue: function(val) {
    assert.ok(typeof val === 'string', 'Str(): value must be a string');
  },
  set: function Str$set(val) {
    this.assertValidValue(val);
    Value.prototype.set.call(this, val);
  },
  append: function Str$append(val) {
    this.assertValidValue(val);
    this.set(this._raw + val);
  },
  prepend: function Str$prepend(val) {
    this.assertValidValue(val);
    this.set(val + this._raw);
  },
  wrap: function Str$wrap(pre, post) {
    this.assertValidValue(pre);
    this.assertValidValue(post);
    this.set(pre + this._raw + post);
  },
  length: function() {
    return this._raw.length;
  },
  update: function Str$update(fn) {
    var val;
    assert.equal(typeof fn, 'function');
    this.set(fn(this._raw))
  }
};

module.exports = inherits(Value, Str, proto);
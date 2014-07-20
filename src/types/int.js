var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Int = function Int() {
  if (typeof this._val === 'undefined') {
    this._val = 0;
  }
};

var proto = {
  assertValidValue: function(val) {
    assert.ok(typeof val === 'number' && val % 1 === 0);
  },
  set: function Int$set(val) {
    this.assertValidValue(val);
    Value.prototype.set.call(this, val);
  },
  inc: function Int$inc() {
    this.set(this._val + 1);
  },
  dec: function Int$dec() {
    this.set(this._val - 1);
  },
  add: function Int$add(val) {
    this.assertValidValue(val);
    this.set(this._val + val);
  },
  sub: function Int$sub(val) {
    this.assertValidValue(val);
    this.set(this._val - val);
  },
  mult: function Int$mult(val) {
    this.assertValidValue(val);
    this.set(this._val * val);
  },
  div: function Int$div(val) {
    this.assertValidValue(val);
    this.set(this._val / val);
  },
  isNaN: function Int$isNaN() {
    return isNaN(this._val);
  },
  eq: function Int$eq(val) {
    this.assertValidValue(val);
    return this_.val === val;
  },
  ne: function Int$ne(val) {
    this.assertValidValue(val);
    return this_.val !== val;
  },
  lt: function Int$lt(val) {
    this.assertValidValue(val);
    return this_.val < val;
  },
  gt: function Int$gt(val) {
    this.assertValidValue(val);
    return this_.val > val;
  },
  lte: function Int$lte(val) {
    this.assertValidValue(val);
    return this_.val <= val;
  },
  gte: function Int$gte(val) {
    this.assertValidValue(val);
    return this_.val >= val;
  }
};

module.exports = inherits(Value, Int, proto);
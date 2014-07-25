var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var Decimal = function Decimal(value) {
  Value.call(this, value);
  if (typeof this._raw === 'undefined') {
    this._raw = 0;
  }
};

var proto = {
  assertValidValue: function Decimal$assertValidValue(val) {
    assert.ok(typeof val === 'number', 'Decimal(): value must be a number');
  },
  inc: function Decimal$inc() {
    this.setVal(this._raw + 1);
  },
  dec: function Decimal$dec() {
    this.setVal(this._raw - 1);
  },
  add: function Decimal$add(val) {
    this.assertValidValue(val);
    this.setVal(this._raw + val);
  },
  sub: function Decimal$sub(val) {
    this.assertValidValue(val);
    this.setVal(this._raw - val);
  },
  mult: function Decimal$mult(val) {
    this.assertValidValue(val);
    this.setVal(this._raw * val);
  },
  div: function Decimal$div(val) {
    this.assertValidValue(val);
    this.setVal(this._raw / val);
  },
  isNaN: function Decimal$isNaN() {
    return isNaN(this._raw);
  },
  eq: function Decimal$eq(val) {
    this.assertValidValue(val);
    return this._raw == val;
  },
  ne: function Decimal$ne(val) {
    this.assertValidValue(val);
    return this._raw != val;
  },
  lt: function Decimal$lt(val) {
    this.assertValidValue(val);
    return this._raw < val;
  },
  gt: function Decimal$gt(val) {
    this.assertValidValue(val);
    return this._raw > val;
  },
  lte: function Decimal$lte(val) {
    this.assertValidValue(val);
    return this._raw <= val;
  },
  gte: function Decimal$gte(val) {
    this.assertValidValue(val);
    return this._raw >= val;
  },
  update: function Decimal$update(fn) {
    var val;
    assert.equal(typeof fn, 'function');
    this.setVal(fn(this._raw))
  }
};

module.exports = inherits(Value, Decimal, proto);
var assert = require('assert'),
    Literal = require('./literal');

var Decimal = function Decimal(model, prop) {
  this._model = model;
  this._prop = prop;
};

Decimal.prototype = Object.create(Literal.prototype);

Decimal.isValidValue = Decimal.prototype.isValidValue = function Decimal$isValidValue(val) {
  return typeof val === 'number';
};

Decimal.defaultValue = Decimal.prototype.defaultValue = 0;

Decimal.prototype.inc = function Decimal$inc() {
  this.val += 1;
};

Decimal.prototype.dec = function Decimal$dec() {
  this.val -= 1;
};

Decimal.prototype.add = function Decimal$add(x) {
  assert.ok(this.isValidValue(x));
  this.val += x;
};

Decimal.prototype.sub = function Decimal$sub(x) {
  assert.ok(this.isValidValue(x));
  this.val -= x;
};

Decimal.prototype.mult = function Decimal$mult(x) {
  assert.ok(this.isValidValue(x));
  this.val *= x;
};

Decimal.prototype.div = function Decimal$div(x) {
  assert.ok(this.isValidValue(x));
  this.val /= x;
};

Decimal.prototype.gt = function Decimal$gt(x) {
  assert.ok(this.isValidValue(x));
  return this.val > x;
};

Decimal.prototype.gte = function Decimal$gte(x) {
  assert.ok(this.isValidValue(x));
  return this.val >= x;
};

Decimal.prototype.lt = function Decimal$lt(x) {
  assert.ok(this.isValidValue(x));
  return this.val < x;
};

Decimal.prototype.lte = function Decimal$lte(x) {
  assert.ok(this.isValidValue(x));
  return this.val <= x;
};

Decimal.prototype.eq = function Decimal$eq(x) {
  assert.ok(this.isValidValue(x));
  return this.val === x;
};

Decimal.prototype.ne = function Decimal$ne(x) {
  assert.ok(this.isValidValue(x));
  return this.val !== x;
};

Decimal.prototype.isNaN = function Decimal$isNaN() {
  return isNaN(this.val);
};

Decimal.prototype.update = function Decimal$update(fn) {
  assert.equal(typeof fn, 'function', 'Decimal(): update must be a function');
  this.val = fn(this.val);
};

Object.defineProperties(Decimal.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Decimal(): must be a valid number');
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Decimal;
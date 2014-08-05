var assert = require('assert'),
    Literal = require('./literal');

var Str = function Str(model, prop) {
  this._model = model;
  this._prop = prop;
};

Str.prototype = Object.create(Literal.prototype);

Str.isValidValue = Str.prototype.isValidValue = function Str$isValidValue(val) {
  return typeof val === 'string';
};

Str.defaultValue = Str.prototype.defaultValue = '';

Str.prototype.prepend = function Str$prepend(x) {
  this.val = x + this.val;
};

Str.prototype.append = function Str$append(x) {
  this.val = this.val + x;
};

Str.prototype.wrap = function Str$wrap(x, y) {
  this.val = x + this.val + y;
};

Str.prototype.gt = function Str$gt(x) {
  return this.val > x;
};

Str.prototype.gte = function Str$gte(x) {
  return this.val >= x;
};

Str.prototype.lt = function Str$lt(x) {
  return this.val < x;
};

Str.prototype.lte = function Str$lte(x) {
  return this.val <= x;
};

Str.prototype.eq = function Str$eq(x) {
  return this.val === x;
};

Str.prototype.ne = function Str$ne(x) {
  return this.val !== x;
};

Object.defineProperties(Str.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Str(): must be a valid number');
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Str;
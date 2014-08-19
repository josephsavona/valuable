var _ = require('./utils'),
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
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  this.val = x + this.val;
};

Str.prototype.append = function Str$append(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  this.val = this.val + x;
};

Str.prototype.wrap = function Str$wrap(x, y) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  _.invariant(this.isValidValue(y), 'Str(): argument must be string');
  this.val = x + this.val + y;
};

Str.prototype.gt = function Str$gt(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  return this.val > x;
};

Str.prototype.gte = function Str$gte(x) {
  return this.val >= x;
};

Str.prototype.lt = function Str$lt(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  return this.val < x;
};

Str.prototype.lte = function Str$lte(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  return this.val <= x;
};

Str.prototype.eq = function Str$eq(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  return this.val === x;
};

Str.prototype.ne = function Str$ne(x) {
  _.invariant(this.isValidValue(x), 'Str(): argument must be string');
  return this.val !== x;
};

Str.prototype.update = function Str$update(fn) {
  _.invariant(typeof fn === 'function', 'Str(): update must be a function');
  this.val = fn(this.val);
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
      _.invariant(this.isValidValue(val), 'Str(): must be a valid number');
      this._model._set(this._prop, val);
    }
  },
  length: {
    get: function() {
      return this._model._source[this._prop].length;
    }
  }
});

module.exports = Str;
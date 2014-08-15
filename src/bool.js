var assert = require('assert'),
    Literal = require('./literal');

var Bool = function Bool(model, prop) {
  this._model = model;
  this._prop = prop;
};

Bool.prototype = Object.create(Literal.prototype);

Bool.isValidValue = Bool.prototype.isValidValue = function Bool$isValidValue(val) {
  return typeof val === 'boolean';
};

Bool.defaultValue = Bool.prototype.defaultValue = false;

Bool.prototype.negate = function Bool$negate() {
  this.val = !this.val;
};

Bool.prototype.eq = function Bool$eq(x) {
  return this.val === x;
};

Bool.prototype.ne = function Bool$ne(x) {
  return this.val !== x;
};

Object.defineProperties(Bool.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Bool(): must be a valid number');
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Bool;
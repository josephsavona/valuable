var assert = require('assert');

var Literal = function Literal(model, prop) {
  this._model = model;
  this._prop = prop;
};

Literal.isValidValue = Literal.prototype.isValidValue = function Literal$isValidValue(val) {
  return true;
};

Literal.defaultValue = Literal.prototype.defaultValue = null;

Object.defineProperties(Literal.prototype, {
  val: {
    get: function() {
      return this._model._map[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Literal;
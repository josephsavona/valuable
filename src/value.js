var assert = require('assert');

var Value = function Value(value) {
  if (!(this instanceof Value)) {
    return new Value(value);
  }
  this._value = value;
  this._listeners = [];
};

Value.prototype.observe = function Value$observe(fn) {
  assert.equal(typeof fn, 'function', 'Value$observe(): function required');
  this._listeners.push(fn);
};

Value.prototype.unobserve = function Value$unobserve(fn) {
  assert.equal(typeof fn, 'function', 'Value$unobserve(): function required');
  this._listeners = this._listeners.filter(function(x) {
    return x !== fn;
  });
};

Value.prototype.set = function Value$set(value) {
  this._value = value;
  this._notify();
};

Value.prototype.val = function Value$val() {
  return this._value;
};

Value.prototype._notify = function Value$private$_notify() {
  var value = this._value;
  this._listeners.forEach(function(listener) {
    listener(value);
  });
};

module.exports = Value;
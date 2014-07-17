var assert = require('assert'),
    _ = require('lodash'),
    Valueable = require('./valueable');

var Value = function Value(value) {
  if (!(this instanceof Value)) {
    return new Value(value);
  }
  this._id = _.uniqueId('valuable');
  this._raw = value;
  this._child = null;
  this._listeners = [];
  this._parent = null;
};

Value.prototype.observe = function Value$observe(fn) {
  assert.equal(typeof fn, 'function', 'Value(): function required');
  this._listeners.push(fn);
};

Value.prototype.unobserve = function Value$unobserve(fn) {
  assert.equal(typeof fn, 'function', 'Value(): function required');
  this._listeners = this._listeners.filter(function(x) {
    return x !== fn;
  });
};

Value.prototype.set = function Value$set(rawValue) {
  var value;
  if (this._child) {
    this._child.destroy();
  }
  value = (rawValue instanceof Value) ? rawValue : Valueable(rawValue);
  this._child = value;
  this._child._parent = this;
  this._updateChild(this._child, value.val());
};

Value.prototype.val = function Value$val() {
  return this._raw;
};

Value.prototype.destroy = function Value$destroy() {
  this._raw = null;
  this._listeners = null;
  this._parent = null;
  this._child = null;
};

Value.prototype._notify = function Value$private$_notify() {
  var value = this._raw;
  if (this._parent) {
    this._parent._updateChild(this, value);
  }
  this._listeners.forEach(function(listener) {
    listener(value);
  });
};

Value.prototype._updateChild = function Value$private$updateChild(child, rawValue) {
  this._raw = rawValue;
  this._notify();
};

module.exports = Value;
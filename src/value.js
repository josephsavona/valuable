var assert = require('assert'),
    _ = require('lodash');

var Value = function Value(value) {
  if (!(this instanceof Value)) {
    return new Value(value);
  }
  this._id = _.uniqueId('valuable');
  this._raw = value;
  this._listeners = [];
  this._parent = null;
};

Value.assertValidValue = Value.prototype.assertValidValue = function Value$assertValidValue(input) {
  assert.ok(true, 'Value(): all inputs welcome');
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

Value.prototype.val = function Value$val() {
  return this._raw;
};

Value.prototype._defaultValue = void 0;

Value.prototype.setVal = function Value$setVal(value) {
  var rawValue;
  rawValue = (value instanceof Value) ? value.val() : value;
  rawValue = typeof rawValue !== 'undefined' ? rawValue : this._defaultValue;
  this.assertValidValue(rawValue);
  this._raw = rawValue;
  this._notify(this);
};

Value.prototype.destroy = function Value$destroy() {
  this._raw = null;
  this._listeners = null;
  this._parent = null;
  this._child = null;
  this._handleChange = null;
};

Value.prototype._notify = function Value$private$_notify(source) {
  var value = this._raw;
  if (this._parent) {
    this._parent._updateChild(this, value, source);
  }
  if (!this._listeners.length) {
    return;
  }

  this._runObserversBound = this._runObserversBound || this._runObservers.bind(this);
  this._queuedUpdates = this._queuedUpdates || [];
  this._queuedUpdates.push(source);
  if (this._queuedUpdates.length === 1) {
    process.nextTick(this._runObserversBound);
  }
};

Value.prototype._runObservers = function Value$private$runObservers() {
  var value = this._raw;
  this._listeners.forEach(function(listener) {
    listener(value);
  });
  this._queuedUpdates = [];
};

Value.prototype.handleChange = function Value$handleChange() {
  return this._handleChange || (this._handleChange  = function Value$computed$handleChange(event) {
    this.setVal(event.target.value);
  }.bind(this));
};

// Value cannot have child values, probably don't need
// Value.prototype._updateChild = function Value$private$updateChild(child, rawValue) {
//   assert.ok(false, 'Value(): cannot have child values');
// };

module.exports = Value;
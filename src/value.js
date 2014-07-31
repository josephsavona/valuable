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
  this._hasChange = false;
  this._root = this;
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
  this._sync();
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
  this._root = null;
  this._hasChange = null;
  this._child = null;
  this._scheduledUpdates = null;
  this._runUpdatesBound = null;
  this._handleChange = null;
};

Value.prototype._sync = function Value$private$sync() {
  this._root._runUpdates();
};

Value.prototype._notify = function Value$private$notify(source) {
  source._hasChange = true;
  this._root._scheduleUpdate(source);
};

Value.prototype._scheduleUpdate = function Value$private$scheduleUpdate(source) {
  this._scheduledUpdates = this._scheduledUpdates || [];
  this._runUpdatesBound = this._runUpdatesBound || this._runUpdates.bind(this);

  this._scheduledUpdates.push(source);
  // schedule if this was the first change
  if (this._scheduledUpdates.length === 1) {
    process.nextTick(this._runUpdatesBound);
  }
};

Value.prototype._hasUpdates = function Value$private$hasUpdates() {
  return this._root._scheduledUpdates.length > 0;
};

Value.prototype._runUpdates = function Value$private$runUpdates() {
  var value, ix, length, raw;
  if (!this._scheduledUpdates || !this._scheduledUpdates.length) {
    return;
  }
  length = this._scheduledUpdates.length;
  for (ix = 0; ix < length; ix++) {
    value = this._scheduledUpdates[ix];
    if (!value._hasChange || value._root !== this) {
      continue;
    }
    if (value._parent) {
      value._parent._updateChild(value, value);
    }
    value._hasChange = false;
  }
  this._scheduledUpdates = [];
  raw = this._raw;
  this._listeners.forEach(function(listener) {
    listener(raw);
  });
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
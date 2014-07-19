var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable');

var Map = function Map(map) {
  var key, value;

  Map.assertValidValue(map);
  if (!(this instanceof Map)) {
    return new Map(map);
  }
  Value.apply(this);
  this._map = {};
  this._raw = {};
  if (!map) {
    return;
  }
  for (key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }
    value = Valueable(map[key]);
    this._map[key] = value;
    this._map[key]._parent = this;
    this._raw[key] = value.val();
  }
};

Map.prototype = new Value();

Map.assertValidValue = Map.prototype.assertValidValue = function Map$assertValidValue(input) {
  assert.ok(input === null || typeof input === 'undefined' || _.isPlainObject(input),
    'Map(): value must be an object (or null/undefined)');
};

Map.prototype.set = function Map$set(key, rawValue) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');

  var value;
  if (key in this._map) {
    this._map[key].destroy();
  }
  value = Valueable(rawValue);
  this._map[key] = value;
  this._map[key]._parent = this;
  this._updateChild(value, value.val());
};

Map.prototype.get = function Map$get(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');
  return this._map[key];
};

Map.prototype.del = function Map$del(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');

  var raw;
  if (!(key in this._map)) {
    return;
  }
  // nested Values
  this._map[key].destroy();
  delete this._map[key];
  // literal representation
  raw = _.clone(this._raw);
  delete raw[key];
  this._raw = raw;
  this._notify();
};

Map.prototype.hasKey = function Map$hasKey(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');

  return (key in this._map);
};

Map.prototype.val = function Map$val(key) {
  assert.ok(key === undefined || typeof key === 'string', 'Map(): key must be undefined or string');

  var raw;
  if (key) {
    raw = this._raw[key];
  } else {
    raw = this._raw;
  }

  if (process.env.NODE_ENV !== 'production') {
    // return a clone in dev/test to ensure that you
    // cannot make your code work by directly modifying
    // the returned value. in production disable
    // this for speed
    return _.clone(raw);
  }
  return raw;
};

Map.prototype._updateChild = function Map$private$updateChild(child, rawValue) {
  var key, found, raw;
  // figure out which key this child is
  for (key in this._map) {
    if (this._map[key] === child) {
      found = true;
      break;
    }
  }
  assert.ok(found, 'Map(): child value not found');
  raw = _.clone(this._raw);
  raw[key] = rawValue;
  this._raw = raw;
  this._notify();
};

module.exports = Map;
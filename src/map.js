var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value');

var Map = function Map(map) {
  assert.ok(map === null || typeof map === 'undefined' || _.isPlainObject(map), 'Map(): value must be an object (or null/undefined)');
  if (!(this instanceof Map)) {
    return new Map(map);
  }
  Value.call(this, map || {});
};

Map.prototype = new Value();

Map.prototype.set = function Map$set(key, rawValue) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');

  var map = _.clone(this._value);
  map[key] = rawValue;

  Value.prototype.set.call(this, map);
};

Map.prototype.get = function Map$get(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');
  return this._value[key];
};

Map.prototype.del = function Map$del(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');
  if (!(key in this._value)) {
    return;
  }
  var map = _.clone(this._value);
  delete map[key];
  Value.prototype.set.call(this, map);
};

Map.prototype.hasKey = function Map$hasKey(key) {
  assert.ok(typeof key === 'string', 'Map(): key must be string');
  return (key in this._value);
};

module.exports = Map;
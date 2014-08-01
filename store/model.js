var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(map) {
  this._map = Immutable.Map();
  this._props = {};

  map = map || {};
  for (var key in this.properties) {
    if (!this.properties.hasOwnProperty(key)) {
      continue;
    }
    if (typeof map[key] !== 'undefined') {
      assert.ok(this.properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
      this._map = this._map.set(key, map[key]);
    } else {
      this._map = this._map.set(key, this.properties[key].defaultValue);
    }
  }
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  this._map = this._map.set(key, value);
};

ModelBase.prototype._get = function Model$private$get(key) {
  return this._map.get(key);
};

ModelBase.prototype.val = function Model$val() {
  return this._map.toJSON();
};

ModelBase.prototype.raw = function Map$raw() {
  return this._map;
};

ModelBase.define = function Model$$define(properties) {
  var klass = function Model(map) {
    ModelBase.call(this, map);
  }
  klass.prototype = Object.create(ModelBase.prototype);
  klass.prototype.constructor = klass;
  klass.prototype.properties = properties;

  _.each(properties, function(prop, key, properties) {
    Object.defineProperty(klass.prototype, key, {
      get: function() {
        return this._props[key] || (this._props[key] = new (properties[key])(this, key));
      },
      enumerable: true,
      configurable: false
    });
  });
  return klass;
};

ModelBase.Bool = Bool;
ModelBase.Decimal = Decimal;
ModelBase.Str = Str;

module.exports = ModelBase;
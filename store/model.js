var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(map, parent) {
  if (!(map instanceof Immutable.Map)) {
    map = this.constructor._convertMap(map);
  }
  this._parent = parent;
  this._map = map;
  this._props = {};
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  this._map = this._map.set(key, value);
};

ModelBase.prototype._get = function Model$private$get(key) {
  return this._map.get(key);
};

ModelBase.prototype.val = function Model$val() {
  return this._map.toJS();
};

ModelBase.prototype.toJS = function Model$toJSON() {
  return this._map.toJS();
};

ModelBase.prototype.raw = function Map$raw() {
  return this._map;
};

ModelBase.define = function Model$$define(properties) {
  var klass = function Model(parent, map) {
    ModelBase.call(this, parent, map);
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

  klass._convertMap = function Model$private$convertMap(map) {
    var props = {};
    map = map || {};
    for (var key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }
      if (typeof map[key] !== 'undefined') {
        assert.ok(properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
        props[key] = map[key];
      } else {
        props[key] = properties[key].defaultValue;
      }
    }
    return Immutable.Map(props);
  };
  return klass;
};

ModelBase.Bool = Bool;
ModelBase.Decimal = Decimal;
ModelBase.Str = Str;

module.exports = ModelBase;
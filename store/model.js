var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(raw, path) {
  var map = {},
      properties = this.properties;
  raw = raw || {};
  // if (raw instanceof Immutable.Map) {
  //   raw = raw.toJS();
  // }
  for (var key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }
    if (typeof raw[key] !== 'undefined') {
      assert.ok(properties[key].isValidValue(raw[key]), 'Model(): invalid value for property ' + key);
      map[key] = raw[key];
    } else {
      map[key] = properties[key].defaultValue;
    }
  }

  this._parent = null;
  this._path = path;
  this._props = {};
  
  this._map = map;
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  var clone = _.clone(this._map);
  clone[key] = value;
  if (this._parent) {
    this._parent._update(this);
  }
  this._map = clone;
};

ModelBase.prototype.set = function Model$set(map) {
  var clone = _.clone(this._map);
  for (key in map) {
    if (this.properties.hasOwnProperty(key)) {
      asset.ok(this.properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
      clone[key] = map[key];
    }
  }
  this._map = clone;

  if (this._parent) {
    this._parent._update(this);
  }
};

ModelBase.prototype.val = function Model$val() {
  return this._map;
};

ModelBase.prototype.toJS = function Model$toJSON() {
  return this._map;
};

ModelBase.prototype.raw = function Map$raw() {
  return this._map;
};

ModelBase.define = function Model$$define(properties) {
  var klass = function Model(map, path) {
    ModelBase.call(this, map, path);
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
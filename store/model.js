var _ = require('lodash'),
    assert = require('assert'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(attributes, id) {
  var key,
      map = {},
      properties = this._properties;

  assert.ok(!attributes || _.isPlainObject(attributes), 'Model(): attributes is an optional object');
  attributes = attributes || {};
  for (key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }
    if (typeof attributes[key] !== 'undefined') {
      assert.ok(properties[key].isValidValue(attributes[key]), 'Model(): invalid value for property ' + key);
      map[key] = attributes[key];
    } else {
      map[key] = properties[key].defaultValue;
    }
  }

  this._editable = false;
  this._props = {};
  this._map = map;
  this.id = id;
  this.cid = id || _.uniqueId(this._path);
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  assert.ok(this._editable, 'Model(): use forEdit() to get an editable version');
  var clone = _.clone(this._map);
  clone[key] = value;
  this._map = clone;
};

ModelBase.prototype.set = function Model$set(map) {
  assert.ok(this._editable, 'Model(): use forEdit() to get an editable version');
  var clone = _.clone(this._map);
  for (key in map) {
    if (this._properties.hasOwnProperty(key)) {
      assert.ok(this._properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
      clone[key] = map[key];
    }
  }
  this._map = clone;
};

ModelBase.prototype.isEditable = function Model$isEditable() {
  return this._editable;
};

ModelBase.prototype.forEdit = function Model$forEdit() {
  var clone = this.clone();
  clone._editable = true;
  return clone;
};

ModelBase.prototype.clone = function Model$clone() {
  var clone = Object.create(this.constructor.prototype);
  clone._map = this._map;
  clone._editable = this._editable;
  clone._props = {};
  clone.cid = this.cid;
  clone.id = this.id;
  return clone;
};

ModelBase.prototype.destroy = function Model$destroy() {
  this._editable = false;
  this._destroy = true;
};

ModelBase.prototype.val = function Model$val(key) {
  if (typeof key !== 'undefined') {
    return this._map[key];
  }
  return this._map;
};

ModelBase.prototype.toJS = function Model$toJSON() {
  return this._map;
};

ModelBase.prototype.raw = function Map$raw() {
  return this._map;
};

ModelBase.define = function Model$$define(properties, path) {
  var klass = function Model(map, path) {
    ModelBase.call(this, map, path);
  }
  klass.prototype = Object.create(ModelBase.prototype);
  klass.prototype.constructor = klass;
  klass.prototype._properties = properties;
  klass.prototype._path = path;

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
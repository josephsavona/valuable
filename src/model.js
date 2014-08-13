var _ = require('lodash'),
    assert = require('assert'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(attributes) {
  var key,
      map = {},
      properties = this._properties;

  if (process.env.NODE_ENV !== 'production') {
    assert.ok(!attributes || _.isPlainObject(attributes), 'Model(): attributes is an optional object');
  }
  attributes = attributes || {};
  for (key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }
    if (typeof attributes[key] !== 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        assert.ok(properties[key].isValidValue(attributes[key]), 'Model(): invalid value for property ' + key);
      }
      map[key] = attributes[key];
    } else {
      map[key] = properties[key].defaultValue;
    }
  }

  this._props = {};
  this._source = map;
  this.cid = this.id || _.uniqueId(this._path);
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  var clone = _.clone(this._source);
  clone[key] = value;
  this._source = clone;
};

ModelBase.prototype.set = function Model$set(map) {
  var clone = _.clone(this._source);
  for (key in map) {
    if (this._properties.hasOwnProperty(key)) {
      if (typeof map[key] !== 'undefined') {
        if (process.env.NODE_ENV !== 'production') {
          assert.ok(this._properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
        }
        clone[key] = map[key];
      } else {
        clone[key] = this._properties[key].defaultValue;
      }
    }
  }
  this._source = clone;
};

ModelBase.prototype.clone = function Model$clone() {
  var clone = Object.create(this.constructor.prototype);
  clone._source = this._source;
  clone._props = {};
  clone.cid = this.cid;
  return clone;
};

ModelBase.prototype.destroy = function Model$destroy() {
  this._destroy = true;
};

ModelBase.prototype.val = function Model$val(key) {
  if (typeof key !== 'undefined') {
    return this._source[key];
  }
  return this._source;
};

ModelBase.prototype.raw = function Model$raw() {
  return this._source;
};

ModelBase.prototype.observe = function Model$observe(fn) {
  // circular dependency
  makeObservable = require('./observable_model');
  makeObservable(this);
  this.observe(fn);
};

ModelBase.define = function Model$$define(properties, path) {
  var klass = function Model(map, path) {
    ModelBase.call(this, map, path);
  }
  klass.prototype = Object.create(ModelBase.prototype);
  klass.prototype.constructor = klass;
  klass.prototype._properties = properties;
  klass.prototype._path = path;

  // quickly create a model w/o parsing attributes
  klass.from = function Model$from(attributes) {
    var model = new klass({});
    model._source = attributes;
    return model;
  };

  // define 'id' prop and getter/setter
  properties.id = Str;
  Object.defineProperty(klass.prototype, 'id', {
    get: function() {
      return this._source.id;
    },
    set: function(id) {
      this._set('id', id);
    },
    enumerable: true,
    configurable: false
  });

  // getters for all other props
  _.each(properties, function(prop, key, properties) {
    if (key === 'id') return;
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
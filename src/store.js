var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Valuable = require('./valueable');

var Lens = function Lens(store, path) {
  this._store = store;
  this._path = path;
};

Lens.prototype.factory = function(data) {
  return this._store._factory(this._path, data);
};

Lens.prototype.add = function(model) {
  return this._store._add(this._path, model);
};

Object.defineProperty(Lens.prototype, 'length', {
  get: function() {
    return this._store._store.get(this._path).length;
  },
  enumerable: false,
  configurable: false
});

var Store = function Store(definition) {
  if (!(this instanceof Store)) {
    return new Store(definition);
  }

  assert.ok(_.isPlainObject(definition) && !_.isEmpty(definition), 'Store(): definition must be an object of name->props');

  this._structs = {};
  this._store = Immutable.Map();
  this._lenses = {};
  this._listeners = [];

  var key;
  for (key in definition) {
    definition[key]['id'] = Valuable.Str;
    this._structs[key] = Valuable.Struct.schema(definition[key]);
    this._store = this._store.set(key, Immutable.Map());

    Object.defineProperty(this, key, {
      get: function() {
        return this._lens(key)
      },
      enumerable: false,
      configurable: false
    });
  }
};

Store.prototype.execute = function(fn, params) {
  assert.equal(typeof fn, 'function', 'Store(): execute requires function');
  assert.ok(!params || _.isPlainObject(params), 'Store(): params is an optional object');
  return fn.call(this, params || {});
};

Store.prototype._lens = function(key) {
  return new Lens(this, key);
};

Store.prototype._factory = function(key, data) {
  data['id'] = uuid.v4();
  return this._structs[key](data);
};

Store.prototype._add = function(key, model) {
  this._store = this._store.updateIn([key], function(map) {
    return map.set(model.val('id'), model);
  });
};

Store.prototype.commit = function() {
  var args = Array.prototype.slice.call(arguments),
      ix;
  for (ix = 0; ix < args.length; ix++) {
    // execute the batched updates on the given lens
  };
};

module.exports = Store;
var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Valuable = require('../src/valueable');

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

// var ModelLens = function ModelLens() {};

// // usage
// userLens.prop.val -> get literal value of prop
// userLens.prop.val = x -> set literal value of prop
// userLens.prop.gt('val') -> returns true/false
// userLens.prop.inc() -> increments the literal value

// userLens.relationName -> lens referring to the relation (model or collection depending on HasOne/HasMany)
// userLens.relationName = assignment for HasOne
// userLens.relationName.add(relationItem) -> adds a related item to the set

// app.commit(userLens) -> commits all changes to userLens, including changes to its nested structures

// var CollectionLens = function CollectionLens() {};

// // usage
// users = app.users -> iterable over all users
// users.filter(fn) -> iterable over the filtered user model lenses
// users.last() -> last item (user model lens)
// user = users.factory({...}) -> create a new user (not yet attached)

// users.add(user) -> adds the new unattached user item to the set
// app.commit(users) -> commits all changes to users table


var ModelLens = function ModelLens() {};

ModelLens.define = function ModelLens$$define(structKlass) {
  var properties = structKlass.prototype.properties;
  var klass = function ModelLens(store, path, struct) {
    this._store = store;
    this._path = path;
    this._struct = struct;
  };
  klass.prototype = Object.create(ModelLens.prototype);
  klass.prototype.constructor = klass;
  klass.struct = klass.prototype.struct = structKlass;

  // getters for each property/relation
  for (var key in properties) {
    if (!properties.hasOwnProperties(key)) {
      continue;
    }
    // TODO: if/else clause for relation vs literal prop
    Object.defineProperty(klass.prototype, key, {
      get: function() {
        this._struct.get(key);
      },
      enumerable: false,
      configurable: false
    });
  }
  return klass;
};

var CollectionLens = function CollectionLens() {};

CollectionLens.prototype.factory = function CollectionLens$factory(data) {
  var struct = new this.lens.struct(data);
  return new this.lens(this._store, this._path, struct);
};

CollectionLens.prototype.filter = function CollectionLens$filter(fn) {
  this._items = this._items.filter(fn);
};

CollectionLens.define = function CollectionLens$$define(modelLens) {
  var klass = function CollectionLens(store, path, items) {
    this._store = store;
    this._path = path;
    this._items = items.map(function(i) {
      return modelLens(this._store, this._path, i);
    });
  };
  klass.prototype = Object.create(CollectionLens.prototype);
  klass.prototype.constructor = klass;
  klass.lens = klass.prototype.lens = modelLens;
  return klass;
};


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
var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Model = require('./model'),
    Collection = require('./collection');

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

var Store = function Store(definition) {
  if (!(this instanceof Store)) {
    return new Store(definition);
  }

  assert.ok(_.isPlainObject(definition) && !_.isEmpty(definition), 'Store(): definition must be an object of modelName:string -> modelProps:object');
  _.each(definition, function(value, key) {
    assert.ok(_.isPlainObject(value), 'Store(): each prop must be an object of propName:string -> propType:constructor (eg Model.Str) ' + key);
  });

  this._models = Immutable.Map();
  this._store = Immutable.Map();
  this._listeners = [];

  var key, model;
  for (key in definition) {
    definition[key]['id'] = Model.Str;
    model = Model.define(definition[key]);
    this._models = this._models.set(key, model);
    this._store = this._store.set(key, new (Collection.define(model))([], [key]));

    Object.defineProperty(this, key, {
      get: function() {
        return this._store.get(key).editable();
      },
      enumerable: false,
      configurable: false
    });
  }
};

Store.prototype.commit = function() {
  var args = Array.prototype.slice.call(arguments),
      store = this._store;

  args.forEach(function(changed) {
    var collection = store.get(changed._path[0]),
        list = collection._list.asMutable();
    changed._changes.forEach(function(change) {
      var target = change.target,
          path = target._path,
          index = list.findIndex(function(x) { return x.id.val === target.id.val });
      path.pop(); // remove the last ID reference
      if (change.type === 'add' && index < 0) {
        list = list.push(target);
      } else if (change.type === 'remove') {
        list = Immutable.Vector.from(list.splice(index, 1));
      } else if (change.type === 'update') {
        list = Immutable.Vector.from(list.splice(index, 1, target));
      }
    });
    collection._list = list.asImmutable();
    changed._changes = [];
  });
};

module.exports = Store;
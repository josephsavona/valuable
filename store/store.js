var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Model = require('./model'),
    Collection = require('./collection');

var Store = function Store(definition) {
  var store = {};
  if (!(this instanceof Store)) {
    return new Store(definition);
  }

  assert.ok(_.isPlainObject(definition) && !_.isEmpty(definition), 'Store(): definition must be an object of modelName:string -> modelProps:object');
  _.each(definition, function(value, key) {
    assert.ok(_.isPlainObject(value), 'Store(): each prop must be an object of propName:string -> propType:constructor (eg Model.Str) ' + key);
  });

  this._models = {};
  this._collections = {};
  this._listeners = [];

  var key, model, collection;
  for (key in definition) {
    model = Model.define(definition[key]);
    collection = Collection.define(model);
    this._models[key] = model;
    this._collections[key] = collection;
    store[key] = Immutable.Vector();

    Object.defineProperty(this, key, {
      get: function() {
        var collection = this._collections[key];
        return new collection(this._store.get(key), [key]);
      },
      enumerable: false,
      configurable: false
    });
  }
  this._store = Immutable.Map.from(store);
};

Store.prototype.factory = function Store$factory(modelName, attributes) {
  assert.ok(modelName in this._models, 'Store(): model not defined ' + modelName);
  assert.ok(!attributes || _.isPlainObject(attributes), 'Store(): attributes is an optional object');
  return new this._models[modelName](attributes, this, [modelName]);
};

Store.prototype.collection = function Store$collection(modelName, items) {
  assert.ok(modelName in this._collections, 'Store(): model not defined ' + modelName);
  assert.ok(!items || _.isArray(items), 'Store(): items is an optional array of models');

  return new this._collections[modelName](items, this, [modelName]);
};

Store.prototype.commit = function Store$commit() {
  var args = Array.prototype.slice.call(arguments);

  args.forEach(function(changed) {
    var list = this._store.get(changed._path[0]).asMutable();

    changed._changes.forEach(function(change) {
      var target = change.target,
          path = target._path,
          index = list.findIndex(function(x) { return x === target });
      path.pop(); // remove the last ID reference
      if (change.type === 'add' && index < 0) {
        list = list.push(target);
      } else if (change.type === 'remove') {
        list = list.delete(index);
      } else if (change.type === 'update') {
        list = list.set(index, target);
      }
    });
    this._store = this._store.set(changed._path[0], Immutable.Vector.from(list.filter(function(x) { return ~x})));
    changed._changes = [];
  }.bind(this));
};

module.exports = Store;
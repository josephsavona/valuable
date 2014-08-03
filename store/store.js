var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Literal = require('./literal'),
    Model = require('./model'),
    CollectionLens = require('./collection_lens'),
    StoreLens = require('./store_lens');

var Store = function Store(definition) {
  assert.ok(_.isPlainObject(definition) && !_.isEmpty(definition), 'Store(): definition must be an object of modelName:string -> modelProps:object');
  _.each(definition, function(model, key) {
    assert.ok(_.isPlainObject(model), 'Store(): each prop must be an object of propName:string -> propType:constructor (eg Model.Str) ' + key);
    _.each(model, function(type, prop) {
      assert.ok(type === Literal || type.prototype instanceof Literal, 'Store(): each prop must be a Literal/Decimal/Str/Bool etc ' + prop);
    })
  });

  var store = {},
      models = {},
      modelName;

  for (modelName in definition) {
    if (definition.hasOwnProperty(modelName)) {
      models[modelName] = Model.define(definition[modelName], modelName);
      store[modelName] = [];
    }
  }
  this._models = models;
  this._source = Immutable.fromJS(store);
  this._lens = new StoreLens(this._source, this);
};

Store.prototype.snapshot = function Store$snapshot() {
  return this._lens;
};

Store.prototype.commit = function Store$private$commit() {
  var length = arguments.length,
      source = this._source,
      model,
      index,
      path,
      collection;
  for (var ix = 0; ix < length; ix++) {
    model = arguments[ix];
    path = model._path;
    collection = source.get(path);
    if (model._destroy) {
      if (!model.id) { continue; }
      index = collection.findIndex(function(x) { return x.id === model.id });
      collection = collection.destroy(index);
      collection = collection.filter(function(x) { return ~x });
    } else if (model.id) {
      index = collection.findIndex(function(x) { return x.id === model.id });
      collection = collection.set(index, model.clone());
    } else {
      model = model.clone();
      model.id = uuid.v4();
      collection = collection.push(model);
    }
    source = source.set(path, collection);
    // TODO: iterate model's relations and add/update anything there...
    // unless we always make the user explicitly add these to the commit
  }
  // replace the source of truth, create a new lens into it
  this._source = source;
  this._lens = new StoreLens(this._source, this);
};

Store.prototype.create = function Store$create(model, attributes) {
  assert.ok(model in this._models, 'Store(): model not defined ' + model);
  assert.ok(!attributes || _.isPlainObject(attributes), 'Store(): attributes is an optional object');
  return new this._models[model](attributes);
};

module.exports = Store;
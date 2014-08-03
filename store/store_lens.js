var Model = require('./model'),
    CollectionLens = require('./collection_lens');

var StoreLens = function StoreLens(source, store) {
  this._source = source;
  this._store = store;
  this._collections = {};
};

StoreLens.prototype.get = function StoreLens$get(model, id) {
  // load a model's value in the current snapshot
  if (model instanceof Model) {
    return this.get(model._path, model.id);
  }

  // find a model by id
  if (typeof id !== 'undefined') {
    // TODO: need an id->model mapping
    return this.get(model).findWhere({id: id});
  }

  // otherwise get the full collection
  if (!(model in this._collections)) {
    this._collections[model] = new CollectionLens(this._source.get(model), model, this._store);
  }
  return this._collections[model]
};

StoreLens.prototype.create = function StoreLens$create(model, attributes) {
  return this._store.create(model, attributes);
};

module.exports = StoreLens;
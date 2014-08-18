var Model = require('./model'),
    Collection = require('./collection');

var Snapshot = function Snapshot(source, models) {
  this._source = source;
  this._collections = {};
  this._models = models;
};

Snapshot.prototype.get = function Snapshot$get(modelName, id) {
  var model;

  // load a model's value in the current snapshot
  if (modelName instanceof Model) {
    return this.get(modelName._path, modelName.id);
  }

  // find a model by id
  if (typeof id !== 'undefined') {
    model = this.get(modelName).id(id).clone();
    model._snapshot = this;
    return model;
  }

  // otherwise get the full collection
  if (!(modelName in this._collections)) {
    this._collections[modelName] = new Collection(this._source.get(modelName), modelName, this);
  }
  return this._collections[modelName];
};

Snapshot.prototype._from = function Snapshot$_from(modelName, attributes) {
  return this._models[modelName].from(attributes);
};

module.exports = Snapshot;
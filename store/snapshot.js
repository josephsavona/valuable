var Model = require('./model'),
    Collection = require('./collection'),
    mori = require('mori');

var Snapshot = function Snapshot(source) {
  this._source = source;
  this._collections = {};
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
    this._collections[modelName] = new Collection(mori.get(this._source, modelName), modelName, this);
  }
  return this._collections[modelName];
};

module.exports = Snapshot;
var Model = require('./model'),
    Collection = require('./collection');

var Snapshot = function Snapshot(source) {
  this._source = source;
  this._collections = {};
};

Snapshot.prototype.get = function Snapshot$get(modelName, id) {
  // load a model's value in the current snapshot
  if (modelName instanceof Model) {
    return this.get(modelName._path, modelName.id);
  }

  // find a model by id
  if (typeof id !== 'undefined') {
    // TODO: need an id->model mapping
    return this.get(modelName).findWhere({id: id});
  }

  // otherwise get the full collection
  if (!(modelName in this._collections)) {
    this._collections[modelName] = new Collection(this._source.get(modelName), modelName, this);
  }
  return this._collections[modelName];
};

module.exports = Snapshot;
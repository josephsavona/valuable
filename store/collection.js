var Lazy = require('lazy.js');

var Collection = function Collection(source, path, snapshot) {
  this._source = source;
  this._path = path;
  this._snapshot = snapshot;
};

Collection.prototype = Object.create(Lazy.ArrayLikeSequence.prototype);

Collection.prototype.length = function Collection$length() {
  return this._source.length;
};

Collection.prototype.get = function Collection$get(i) {
  var model = this._source.values().get(i).clone();
  model._snapshot = this._snapshot;
  return model;
};

Collection.prototype.id = function Collection$id(id) {
  var model = this._source.get(id).clone();
  model._snapshot = this._snapshot;
  return model;
};

module.exports = Collection;
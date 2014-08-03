var Lazy = require('lazy.js');

var CollectionLens = function CollectionLens(source, path, store) {
  this._source = source;
  this._path = path;
  this._store = store;
};

CollectionLens.prototype = Object.create(Lazy.ArrayLikeSequence.prototype);

CollectionLens.prototype.length = function CollectionLens$length() {
  return this._source.length;
};

CollectionLens.prototype.get = function CollectionLens$get(i) {
  return this._source.get(i);
};

module.exports = CollectionLens;
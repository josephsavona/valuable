var Lazy = require('lazy.js');

// transform(fn) ~= .map(fn).value()
Lazy.Sequence.prototype.transform = function Lazy$transform(fn) {
  return this.map(fn).value();
};

var Collection = function Collection(source, path, snapshot) {
  this._source = source;
  this._values = null;
  this._path = path;
  this._snapshot = snapshot;
};

Collection.prototype = Object.create(Lazy.ArrayLikeSequence.prototype);

Collection.prototype.length = function Collection$length() {
  return this._source.length;
};

Collection.prototype.get = function Collection$get(i) {
  var attributes = this._source.values().get(i);
  return this._snapshot._from(this._path, attributes);
};

Collection.prototype.id = function Collection$id(id) {
  var attributes = this._source.get(id);
  return this._snapshot._from(this._path, attributes);
};

module.exports = Collection;
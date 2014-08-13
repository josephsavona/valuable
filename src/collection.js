var Lazy = require('lazy.js'),
    mori = require('mori');

var Collection = function Collection(source, path, snapshot) {
  this._source = source;
  this._values = null;
  this._path = path;
  this._snapshot = snapshot;
};

Collection.prototype = Object.create(Lazy.ArrayLikeSequence.prototype);

Collection.prototype.length = function Collection$length() {
  return mori.count(this._source);
};

Collection.prototype.get = function Collection$get(i) {
  this._values = this._values || mori.vals(this._source);
  var attributes = mori.nth(this._values, i);
  return this._snapshot._from(this._path, attributes);
};

Collection.prototype.id = function Collection$id(id) {
  var attributes = mori.get(this._source, id);
  return this._snapshot._from(this._path, attributes);
};

module.exports = Collection;
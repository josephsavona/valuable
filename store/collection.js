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
  var model = mori.nth(this._values, i);
  if (!model || !model.clone) {
    process.stdout.write('no model\n');
    process.stdout.write(require('util').inspect(model, 4) + '\n');
    process.stdout.write(require('util').inspect(this._values, 4) + '\n');
    process.stdout.write(require('util').inspect(this._values, 4) + '\n');
    process.stdout.write(require('util').inspect(this._source, 4) + '\n');
  }
  model._snapshot = this._snapshot;
  return model;
};

Collection.prototype.id = function Collection$id(id) {
  var model = mori.get(this._source, id).clone();
  model._snapshot = this._snapshot;
  return model;
};

module.exports = Collection;
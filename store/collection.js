var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var CollectionBase = function Collection(list, parent) {
  if (!(list instanceof Immutable.Vector)) {
    list = this.constructor._convertList(list);
  }
  this._parent = parent;
  this._list = list;
  this._changes = [];
};

CollectionBase.prototype.filter = function Collection$filter(fn) {
  this._list = this._list.filter(fn);
};

CollectionBase.prototype.get = function Collection$get(ix) {
  return this._list.get(ix);
};

CollectionBase.prototype.factory = function Collection$factory(map) {
  assert.ok(!map || _.isPlainObject(map), 'Collection(): factory accepts an optional object of property values');
  return new this.model(map, this);
};

CollectionBase.prototype.add = function Collection$add(model) {
  assert.ok(model instanceof this.model, 'Collection(): can only add models of the collection type');

  this._list = this._list.push(model);
  this._changes.push({
    add: model
  });
  return model;
};

CollectionBase.prototype.remove = function Collection$remove(model) {
  assert.ok(model instanceof this.model, 'Collection(): can only add models of the collection type');

  this._list = this._list.remove(model);
  this._changes.push({
    remove: model
  });
};

CollectionBase.prototype._update = function Collection$private$update(model) {

};

CollectionBase.prototype.val = function Collection$val() {
  return this._list.toJS();
};

CollectionBase.prototype.toJS = function CollectionBase$toJSON() {
  return this._list.toJS();
};

CollectionBase.prototype.raw = function Collection$raw() {
  return this._list;
};

CollectionBase.define = function Collection$$define(model) {
  var klass = function Collection(list, parent) {
    CollectionBase.call(this, list, parent);
  };
  klass.prototype = Object.create(CollectionBase.prototype);
  klass.prototype.constructor = klass;
  klass.prototype.model = model;

  klass._convertList = function Collection$private$convertList(list) {
    var items = [];
    list = list || []; 
    for (var ix = 0; ix < list.length; ix++) {
      items[ix] = new model(list[ix], this);
    }
    return Immutable.Vector.from(items);
    return ilist;
  };

  return klass;
};

module.exports = CollectionBase;
var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    Immutable = require('immutable'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var CollectionBase = function Collection(list, path) {
  if (!(list instanceof Immutable.Vector)) {
    list = this.constructor._convertList(list);
  }
  this._path = path;
  this._list = list;
  this._changes = [];
};

Object.defineProperty(CollectionBase.prototype, 'length', {
  get: function() {
    return this._list.length;
  },
  enumerable: true,
  configurable: false
});

CollectionBase.prototype.editable = function Collection$editable() {
  return new this.constructor(this._list, this._path);
};

CollectionBase.prototype.query = function Collection$filter(fn) {
  var results = fn(this._list);
  return new this.constructor(Immutable.Vector.from(results), this._path);
};

CollectionBase.prototype.get = function Collection$get(ix) {
  return this._list.get(ix);
};

CollectionBase.prototype.forEach = function Collection$forEach(fn) {
  return this._list.forEach(fn);
};

CollectionBase.prototype.map = function Collection$map(fn) {
  return this._list.map(fn);
};

CollectionBase.prototype.factory = function Collection$factory(map) {
  assert.ok(!map || _.isPlainObject(map), 'Collection(): factory accepts an optional object of property values');
  map['id'] = uuid.v4();
  return new this.model(map, this._path.concat(map['id']));
};

CollectionBase.prototype.add = function Collection$add(model) {
  assert.ok(model instanceof this.model, 'Collection(): can only add models of the collection type');

  // this._list = this._list.push(model);
  this._changes.push({
    type: 'add',
    target: model
  });
  model._parent = this;
  return model;
};

CollectionBase.prototype.remove = function Collection$remove(model) {
  assert.ok(model instanceof this.model, 'Collection(): can only add models of the collection type');

  // this._list = this._list.remove(model);
  this._changes.push({
    type: 'remove',
    target: model
  });
};

CollectionBase.prototype._update = function Collection$private$update(model) {
  this._changes.push({
    type: 'update',
    target: model
  });
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
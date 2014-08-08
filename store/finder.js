var assert = require('assert'),
    _ = require('lodash'),
    Model = require('./model');

var Finder = function Finder(store) {
  this._store = store;
  this._finders = {};
  this._observers = [];

  this._store.observe(this._observeStore.bind(this));
};

Finder.prototype.finder = function Finder$finder(name, paramTypes, fn) {
  if (process.env.NODE_ENV !== 'production') {
    assert.ok(name && typeof name === 'string', 'Finder(): finder name must be string');
    assert.ok(_.isPlainObject(paramTypes), 'Finder(): paramTypes must be a model-like schema of key:string -> type:Str/Decimal/Bool');
    assert.equal(typeof fn, 'function', 'Finder(): finder function must be function');
  }
  this._finders[name] = {
    paramClass: Model.define(paramTypes),
    finder: fn
  };
};

Finder.prototype.observe = function Finder$observe(name, fn, params) {
  if (process.env.NODE_ENV === 'production') {
    assert.ok(name in this._finders, 'Finder(): finder name must be a defined finder() ' + name);
    assert.equal(typeof fn, 'function', 'Finder(): observer must be a function');
    assert.ok(!params || _.isPlainObject(params), 'Finder(): params is an optional object');
  }
  var finder = this._finders[name],
      paramModel = new finder.paramClass(params || {}),
      observer,
      unobserver;

  observer = function Finder$computed$observer(snapshot) {
    var results;
    snapshot = snapshot || this._store.snapshot();
    results = finder.finder(snapshot, paramModel);
    fn(results, paramModel);
  }.bind(this);

  unobserver = function Finder$computed$unobserver() {
    this._observers = this._observers.filter(function(o) {
      if (o.observer === observer) {
        o.paramModel.unobserve(o.observer);
        return false;
      }
      return true;
    });
  }.bind(this);

  // run observer on every push
  this._observers.push({
    observer: observer,
    paramModel: paramModel
  });
  // run observer whenever params model changes
  paramModel.observe(observer);

  // immediately run observer
  observer();

  return unobserver;
};

Finder.prototype._observeStore = function Finder$private$observeStore() {
  var length = this._observers.length,
      snapshot = this._store.snapshot();
  for (var ix = 0; ix < length; ix++) {
    this._observers[ix].observer(snapshot);
  }
};

module.exports = Finder;
var _ = require('./utils'),
    Model = require('./model'),
    modelSetKey = Model.prototype._set,
    modelSetAll = Model.prototype.set;

var ObservableModelProps = {
  _set: function() {
    modelSetKey.apply(this, arguments);
    this._notify();
  },

  set: function() {
    modelSetAll.apply(this, arguments);
    this._notify();
  },

  observe: function ObservableModel$observe(fn) {
    if (process.env.NODE_ENV !== 'production') {
      _.invariant(typeof fn === 'function', 'Model(): observer must be a function');
    }
    this._listeners.push(fn);
  },

  unobserve: function ObservableModel$unobserve(fn) {
    this._listeners = this._listeners.filter(function(observer) {
      return observer !== fn;
    });
  },

  _notify: function ObservableModel$private$notify() {
    for (var ix = 0; ix < this._listeners.length; ix++) {
      this._listeners[ix]();
    }
  }
};

module.exports = function ObservableModel$$makeObservable(model) {
  _.invariant(model instanceof Model);
  if (model._listeners) {
    return;
  }
  model._listeners = [];
  _.extend(model, ObservableModelProps);
};
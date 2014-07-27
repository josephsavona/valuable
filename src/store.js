var _ = require('lodash'),
    Promise = require('bluebird'),
    assert = require('assert'),
    HAS_ONE = 'hasOne',
    HAS_MANY = 'hasMany';

var Store = function Store(name) {
  this._name = name;
  this._models = {};
  this._actions = {};
  this._finders = {};
};

Store.prototype = {
  model: function Store$model(name, constructor, options) {
    assert.notOk(name in this._models, 'Store(): model name must be unique ' + name);
    assert.equal(typeof name, 'string', 'Store(): name must be a string');
    assert.equal(typeof constructor, 'function', 'Store(): constructor must be a function');

    options = options || {};
    this._models[name] = {
      constructor: constructor,
      relations: {}
    };
    this._map[name] = {};
  },
  action: function Store$action(name, fn) {
    assert.notOk(name in this._actions, 'Store(): action name must be unique');
    assert.equal(typeof name, 'string', 'Store(): name must be a string');
    assert.equal(typeof fn, 'function', 'Store(): action must be a function');
    this._actions[name] = fn;
  },
  dispatch: function(name, params) {
    if (!(name in this._actions)) {
      return Promise.reject(new Error('Store(): action is not defined'));
    }
    return this._actions[name].call(this, params);
  },
  finder: function Store$fnder(name, fn) {
    assert.notOk(name in this._finders, 'Store(): finder name must be unique');
    assert.equal(typeof name, 'string', 'Store(): name must be a string');
    assert.equal(typeof fn, 'function', 'Store(): action must be a function');
    this._finders[name] = fn;
  },
  find: function Store$find(name, params) {
    if (!(name in this._finders)) {
      return Promise.reject(new Error('Store(): finder is not defined'));
    }
    return this._finders[name].call(this, params);
  },
  relation: function(options) {
    assert.ok(_.isPlainObject(options), 'Store(): relation definition must be an object');
    assert.ok(options.from && options.from in this._models, 'Store(): from/to must be defined model names');
    assert.ok(options.to && options.to in this._models, 'Store(): from/to must be defined model names');
    assert.ok([HAS_ONE, HAS_MANY].indexOf(options.type) >= 0, 'Store(): type must be ' + HAS_ONE + ' or ' + HAS_MANY);

    options.name = options.name || options.to;
    options.reverseName = options.reverseName || options.from;

    this._models[options.from].relations[options.name] = {
      klass: this._models[options.to],
      type: options.type,
      name: options.name
    };
    this._models[options.to].relations[options.reverseName] = {
      klass: this._models[options.from],
      type: 'belongsTo',
      name: options.reverseName
    };
  },
  factory: function(model, attrs) {
    assert.ok(model in this._models, 'Store(): model not defined');
    if (this._models[model].isSingleton && this._models[model].lastInstance) {
      return this._models[model].lastInstance;
    }
    return this._models[model].lastInstance = new (this._models[model].constructor)(attrs);
  },
  get: function Store$get(model, id) {
    return this.sync('get', module, id);
  },
  create: function Store$create(model, attrs) {
    return this.sync('create', model, attrs);
  },
  update: function Store$update(model, id, attrs) {
    return this.sync('update', model, id, attrs);
  },
  destroy: function Store$destroy(model, id) {
    return this.sync('destroy', model, id);
  },
  sync: function Store$sync(action, model, id, attrs) {
    throw new Error('Store#sync(): you must define or include a sync() function for your store');
  }
};

module.exports = Store;
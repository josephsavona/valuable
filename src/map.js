var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable'),
    inherits = require('./inherits');

var MapConstructor = function Map(map) {
  var key, value;

  assert.ok(this.type && (this.type.prototype instanceof Value || this.type === Value || this.type === Valueable),
    'Map(): must provide prototype.type (use `Map.of(ValueSubClas)`');

  Value.call(this, map);

  this._map = {};
  this._raw = {};
  if (!map) {
    return;
  }
  for (key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }
    value = this.type(map[key]);
    this._map[key] = value;
    this._map[key]._parent = this;
    this._raw[key] = value.val();
  }
};

var MapProto = {
  assertValidValue: function Map$assertValidValue(input) {
    assert.ok(input === null || typeof input === 'undefined' || _.isPlainObject(input),
      'Map(): value must be an object (or null/undefined)');
  },

  type: Valueable,

  set: function Map$set(key, rawValue) {
    var value;
    assert.ok(typeof key === 'string', 'Map(): key must be string');
    assert.ok(typeof rawValue !== 'undefined', 'Map(): value must be defined');

    if (key in this._map) {
      this._map[key].destroy();
    }
    value = this.type(rawValue);
    this._map[key] = value;
    this._map[key]._parent = this;
    this._updateChild(value, value.val(), value);
  },

  get: function Map$get(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');
    return this._map[key];
  },

  del: function Map$del(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');

    var raw, rawValue, deleted;
    if (!(key in this._map)) {
      return;
    }
    // nested Values
    deleted = this._map[key];
    this._map[key].destroy();
    delete this._map[key];
    // literal representation
    raw = _.clone(this._raw);
    rawValue = raw[key];
    delete raw[key];
    this._raw = raw;
    this._notify(deleted);
    return rawValue;
  },

  hasKey: function Map$hasKey(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');

    return (key in this._map);
  },

  setVal: function Map$setVal(map) {
    var key,
        rawValue = (map instanceof Value) ? map.val() : map;
    this.assertValidValue(rawValue);
    for (key in this._map) {
      if (this._map.hasOwnProperty(key)) {
        this._map[key].destroy();
      }
    }
    this._map = {};
    this._raw = {};

    for (key in rawValue) {
      if (!rawValue.hasOwnProperty(key)) {
        continue;
      }
      this._map[key] = this.type(rawValue[key]);
      this._map[key]._parent = this;
      this._raw[key] = this._map[key].val();
    }
    this._notify(this);
  },

  val: function Map$val(key) {
    assert.ok(key === undefined || typeof key === 'string', 'Map(): key must be undefined or string');

    var raw;
    if (key) {
      raw = this._raw[key];
    } else {
      raw = this._raw;
    }

    // if (process.env.NODE_ENV !== 'production') {
    //   // return a clone in dev/test to ensure that you
    //   // cannot make your code work by directly modifying
    //   // the returned value. in production disable
    //   // this for speed
    //   return _.clone(raw);
    // }
    return raw;
  },

  _updateChild: function Map$private$updateChild(child, rawValue, source) {
    var key, raw;
    raw = {};
    for (key in this._map) {
      if (this._map.hasOwnProperty(key)) {
        raw[key] = this._map[key] === child ? rawValue : this._raw[key];
      }
    }
    this._raw = raw;
    this._notify(source);
  }
};

var Map = inherits(Value, MapConstructor, MapProto, {});

Map.of = function Map$$of(klass) {
  assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Value || klass === Valueable),
    'Map(): requires a subclass of Value as the type');

  var proto = {type: klass};
  return inherits(Map, function MyMap(value) {
    Map.call(this, value);
  }, proto);
};

Map.inherits = function Map$$inherits(klass, proto, statics) {
  assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Value || klass === Valueable),
    'Map(): requires a subclass of Value as the type');
  assert.ok(!proto || _.isPlainObject(proto),
    'Map(): proto is an optional object');
  assert.ok(!statics || _.isPlainObject(statics),
    'Map(): statics is an optional object');

  proto = proto || {};
  statics = statics || {};
  proto.type = klass;

  return inherits(Map, function MyMap(value){
    Map.call(this, value);
  }, proto, statics);
};

module.exports = Map;
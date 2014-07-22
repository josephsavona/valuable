var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable'),
    inherits = require('./inherits');

var Map = function Map(map) {
  var key, value;

  assert.ok(this.type && (this.type.prototype instanceof Value || this.type === Value || this.type === Valueable),
    'Map(): must provide prototype.type (use `Map.of(ValueSubClas)`');

  this._map = {};
  this._raw = {};
  if (!map) {
    return;
  }
  for (key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }
    value = Valueable(map[key]);
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
    this._updateChild(value, value.val());
  },

  get: function Map$get(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');
    return this._map[key];
  },

  del: function Map$del(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');

    var raw, rawValue;
    if (!(key in this._map)) {
      return;
    }
    // nested Values
    this._map[key].destroy();
    delete this._map[key];
    // literal representation
    raw = _.clone(this._raw);
    rawValue = raw[key];
    delete raw[key];
    this._raw = raw;
    this._notify();
    return rawValue;
  },

  hasKey: function Map$hasKey(key) {
    assert.ok(typeof key === 'string', 'Map(): key must be string');

    return (key in this._map);
  },

  setVal: function Map$setVal(map) {
    assert.ok(false, 'Map(): setVal() not implemented');
  },

  val: function Map$val(key) {
    assert.ok(key === undefined || typeof key === 'string', 'Map(): key must be undefined or string');

    var raw;
    if (key) {
      raw = this._raw[key];
    } else {
      raw = this._raw;
    }

    if (process.env.NODE_ENV !== 'production') {
      // return a clone in dev/test to ensure that you
      // cannot make your code work by directly modifying
      // the returned value. in production disable
      // this for speed
      return _.clone(raw);
    }
    return raw;
  },

  _updateChild: function Map$private$updateChild(child, rawValue) {
    var key, found, raw;
    // figure out which key this child is
    for (key in this._map) {
      if (this._map[key] === child) {
        found = true;
        break;
      }
    }
    assert.ok(found, 'Map(): child value not found');
    raw = _.clone(this._raw);
    raw[key] = rawValue;
    this._raw = raw;
    this._notify();
  }
};

var MapStatics = {
  of: function List$$of(klass) {
    assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Valueable),
      'Map(): requires a subclass of Value as the type');

    var proto = _.extend({type: klass}, ListProto);
    return inherits(Value, Map, proto, MapStatics);
  }
};

module.exports = inherits(Value, Map, MapProto, MapStatics);
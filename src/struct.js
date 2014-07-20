var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Map = require('./map'),
    inherits = require('./inherits'),
    Valueable = require('./valueable');

var Struct = function Struct(map) {
  var key, value, properties;

  // custom property instantiation for only the defined properties
  map = map || {};
  properties = this.__proto__.properties;
  for (key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }
    value = properties[key](map[key]);
    this._map[key] = value;
    this._map[key]._parent = this;
    this._raw[key] = value.val();
  }
};

var proto = {
  assertValidValue: function(map) {
    assert.ok(map === null || typeof map === 'undefined' || _.isPlainObject(map),
      'Struct(): value must be an object (or null/undefined)');
    assert.ok(this.__proto__.properties && _.isPlainObject(this.__proto__.properties),
      'Struct(): must inherit and provide prototype.properties (be sure to use `*new* YourStructSubclass(...)`');
  },
  set: function Struct$set(key, value) {
    assert.ok(typeof key === 'string', 'Struct(): key must be string');
    assert.ok(key in this.__proto__.properties, 'Struct(): key must be a defined property');

    // Map$set() destroys the previous value and makes a new one via Valuable()
    // which is an auto-converting function - this means no type safety.
    // therefore manually get the raw value and ensure it is valid before passing down.
    var rawValue = (value instanceof Value) ? value.val() : value;
    this.__proto__.properties[key].assertValidValue(rawValue);
    Map.prototype.set.call(this, key, rawValue);
  }
};

module.exports = inherits(Map, Struct, proto);
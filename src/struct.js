var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Map = require('./map'),
    Valueable = require('./valueable');

var Struct = function Struct(map) {
  var key, value, properties;
  if (!(this instanceof Struct)) {
    return new Struct(map);
  }
  assert.ok(map === null || typeof map === 'undefined' || _.isPlainObject(map), 'Struct(): value must be an object (or null/undefined)');
  assert.ok(this.__proto__.properties && _.isPlainObject(this.__proto__.properties), 'Struct(): must inherit and provide prototype.properties');

  // basic map instantiation
  Map.apply(this);

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

Struct.prototype = new Map();

module.exports = Struct;
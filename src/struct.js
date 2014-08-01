var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Map = require('./map'),
    inherits = require('./inherits'),
    Valueable = require('./valueable');

var StructConstructor = function Struct(map) {
  var key, value, properties;

  assert.ok(this.properties && _.isPlainObject(this.properties),
    'Struct(): must inherit and provide prototype.properties (be sure to use `*new* YourStructSubclass(...)`');

  Value.call(this, map);
  this._map = {};
  this._raw = {};
    
  // custom property instantiation for only the defined properties
  map = map || {};
  properties = this.properties;
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

var StructProto = {
  assertValidValue: function Struct$assertValidValue(map) {
    assert.ok(map === null || typeof map === 'undefined' || _.isPlainObject(map),
      'Struct(): value must be an object (or null/undefined)');
  },
  set: function Struct$set(key, value) {
    assert.ok(typeof key === 'string', 'Struct(): key must be string');
    assert.ok(key in this.properties, 'Struct(): key must be a defined property');
    this._map[key].setVal(value);
  },
  setVal: function Struct$setVal(value) {
    var rawValue = (value instanceof Value) ? value.val() : value,
        key;
    this.assertValidValue(rawValue);
    for (key in this.properties) {
      if (!this.properties.hasOwnProperty(key)) {
        continue;
      }
      if (key in rawValue) {
        this._map[key].setVal(rawValue[key])
      } else {
        this._map[key].setVal(void 0);
      }
    }
    this._notify();
  }
};

var Struct = inherits(Map, StructConstructor, StructProto, {});

Struct.assertValidSchema = function Struct$$assertValidSchema(schema) {
  assert.ok(_.isPlainObject(schema),
    'Struct(): schema is a required object');

  for (var key in schema) {
    if (schema.hasOwnProperty(key)) {
      assert.ok(typeof schema[key] === 'function' &&
        (schema[key].prototype instanceof Value || schema[key] === Value),
        'Struct(): all schema values must be Value or a subclass');
    }
  }
};

Struct.schema = function Struct$$schema(schema) {
  var proto;
  Struct.assertValidSchema(schema);
  proto = {properties: schema};

  return inherits(Struct, function MyStruct(value) {
    Struct.call(this, value);
  }, proto);
};

Struct.inherits = function Struct$$inherits(schema, proto, statics) {
  Struct.assertValidSchema(schema);
  assert.ok(!proto || _.isPlainObject(proto),
    'Struct(): proto is an optional object');
  assert.ok(!statics || _.isPlainObject(statics),
    'Struct(): statics is an optional object');

  proto = proto || {};
  statics = statics || {};
  proto.properties = schema;

  return inherits(Struct, function MyStruct(value){
    Struct.call(this, value);
  }, proto, statics);
};

module.exports = Struct;
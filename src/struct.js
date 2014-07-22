var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Map = require('./map'),
    inherits = require('./inherits'),
    Valueable = require('./valueable');

var Struct = function Struct(map) {
  var key, value, properties;

  assert.ok(this.__proto__.properties && _.isPlainObject(this.__proto__.properties),
    'Struct(): must inherit and provide prototype.properties (be sure to use `*new* YourStructSubclass(...)`');
    
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

var StructProto = {
  assertValidValue: function Struct$assertValidValue(map) {
    assert.ok(map === null || typeof map === 'undefined' || _.isPlainObject(map),
      'Struct(): value must be an object (or null/undefined)');
  },
  set: function Struct$set(key, value) {
    assert.ok(typeof key === 'string', 'Struct(): key must be string');
    assert.ok(key in this.__proto__.properties, 'Struct(): key must be a defined property');
    this._map[key].setVal(value);
  }
};

var StructStatics = {
  define: function(properties, proto, statics) {
    assert.ok(_.isPlainObject(properties),
      'Struct(): properties is a required object');
    assert.ok(!proto || _.isPlainObject(proto),
      'Struct(): prototype is an optional plain object');

    proto = _.defaults(proto || {}, StructProto);
    proto.properties = properties;
    statics = _.defaults(statics || {}, StructStatics);

    return inherits(Map, Struct, proto, statics);
  },
  schema: function(schema) {
    var proto, statics;
    assert.ok(_.isPlainObject(schema),
      'Struct(): schema is a required object');

    proto = _.defaults({}, StructProto);
    proto.properties = schema;
    statics = _.defaults({}, StructStatics);

    return inherits(Map, Struct, proto, statics);
  }
};

module.exports = inherits(Map, Struct, StructProto, StructStatics);
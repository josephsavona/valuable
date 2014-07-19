var Valueable = require('./src/valueable'),
    Map = require('./src/map'),
    Struct = require('./src/struct'),
    List = require('./src/list'),
    Value = require('./src/value'),
    _ = require('lodash');

Valueable.register(_.isArray, List, 'List');
Valueable.List = List;

Valueable.register(_.isPlainObject, Map, 'Map');
Valueable.Map = Map;

Valueable.register(function() { return true; }, Value, 'Value');
Valueable.Value = Value;

// struct has no auto-converter
Value.Struct = Struct;

module.exports = Valueable;
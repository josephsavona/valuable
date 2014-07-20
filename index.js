var Valueable = require('./src/valueable'),
    Map = require('./src/map'),
    List = require('./src/list'),
    Value = require('./src/value'),
    Struct = require('./src/struct'),
    Decimal = require('./src/types/decimal'),
    Bool = require('./src/types/bool'),
    _ = require('lodash');

// Valueable.register(_.isNumber, Float, 'Float');
// Value.Float = Float;

Valueable.register(_.isArray, List, 'List');
Valueable.List = List;

Valueable.register(_.isPlainObject, Map, 'Map');
Valueable.Map = Map;

Valueable.register(function() { return true; }, Value, 'Value');
Valueable.Value = Value;

// stricter types have no auto-converter
Value.Struct = Struct;
Valueable.Decimal = Decimal;
Valueable.Bool = Bool;

module.exports = Valueable;
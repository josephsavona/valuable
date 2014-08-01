var Valueable = require('./src/valueable'),
    Map = require('./src/map'),
    List = require('./src/list'),
    Undo = require('./src/undo'),
    Value = require('./src/value'),
    Struct = require('./src/struct'),
    Decimal = require('./src/types/decimal'),
    Bool = require('./src/types/bool'),
    Str = require('./src/types/str'),
    store = require('./src/store'),
    _ = require('lodash');

Valueable.register(_.isArray, List, 'List');
Valueable.List = List;

Valueable.register(_.isPlainObject, Map, 'Map');
Valueable.Map = Map;

Valueable.register(function() { return true; }, Value, 'Value');
Valueable.Value = Value;

Valueable.Undo = Undo;

// stricter types have no auto-converter
Valueable.Struct = Struct;
Valueable.Decimal = Decimal;
Valueable.Bool = Bool;
Valueable.Str = Str;

// data store
Valueable.store = store;

module.exports = Valueable;
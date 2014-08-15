var Valueable = require('./valueable'),
    Map = require('./map'),
    List = require('./list'),
    Undo = require('./undo'),
    Value = require('./value'),
    Struct = require('./struct'),
    Decimal = require('./types/decimal'),
    Bool = require('./types/bool'),
    Str = require('./types/str'),
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

module.exports = Valueable;
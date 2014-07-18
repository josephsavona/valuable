var Valueable = require('./src/valueable'),
    Map = require('./src/map'),
    List = require('./src/list'),
    Value = require('./src/value'),
    _ = require('lodash');

Valueable.register(_.isArray, List, 'List');
Valueable.register(_.isPlainObject, Map, 'Map');
Valueable.register(function() { return true; }, Value, 'Value');

module.exports = Valueable;
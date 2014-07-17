var Valueable = require('./src/valueable'),
    Map = require('./src/map'),
    Value = require('./src/value'),
    _ = require('lodash');

Valueable.register(_.isPlainObject, Map, 'Map');
Valueable.register(function() { return true; }, Value, 'Value');

module.exports = Valueable;
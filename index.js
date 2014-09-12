var Store = require('./src/store'),
    Model = require('./src/model'),
    Bool = require('./src/bool'),
    Decimal = require('./src/decimal'),
    Str = require('./src/str');

Store.Model = Model;
Store.Bool = Bool;
Store.Decimal = Decimal;
Store.Str = Str;

module.exports = Store;

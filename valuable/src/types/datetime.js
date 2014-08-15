var assert = require('assert'),
    _ = require('lodash'),
    moment = require('moment'),
    Value = require('../value'),
    inherits = require('../inherits');

var DateTimeConstructor = function DateTime(value) {
  Value.call(this, value);

  this._date = moment(value);
  this._raw = this._date.toDate();
};

var DateTimeProto = {
  assertValidValue: function DateTime$assertValidValue(val) {
    var date = moment(val);
    assert.ok(date.isValid(), 'DateTime(): value must be a JavaScript Date or momentjs date object');
  },
  setVal: function DateTime$setVal(value) {
    var rawValue = (value instanceof Value) ? value.val() : value,
        date = moment(rawValue);
    assert.ok(date.isValid(), 'DateTime(): value must be a JavaScript Date or momentjs date object');
    this._date = date;
    this._raw = date.toDate();
    this._notify();
  }
};

var DateTime = inherits(Value, DateTimeConstructor, DateTimeProto, {});

module.exports = DateTime;
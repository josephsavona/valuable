var assert = require('assert'),
    _ = require('lodash'),
    moment = require('moment'),
    Value = require('../value'),
    inherits = require('../inherits');

/* 
 * WORK IN PROGRESS
 * the raw value should be a JavaScript Date - internally
 * keep a momentjs object that is the source of truth
 * and always create a new raw value from it whenever
 * the user changes the date. 
 */

var DateTime = function DateTime(value) {
  Value.call(this, value);
  if (typeof this._raw === 'undefined') {
    this._raw = moment();
  }
};

var proto = {
  assertValidValue: function DateTime$assertValidValue(val) {
    var date = moment(val);
    assert.ok(date.isValid(), 'DateTime(): value must be a JavaScript Date or momentjs date object');
  },
  negate: function DateTime$negate() {
    this.setVal(!this._raw);
  },
  setVal: function DateTime$setVal(value) {
    var rawValue = (value instanceof Value) ? value.val() : value,
        date = moment(rawValue);
    assert.ok(date.isValid(), 'DateTime(): value must be a JavaScript Date or momentjs date object');
    this._raw = date;
    this._notify();
  },
  add: function() {

  }
};

module.exports = inherits(Value, DateTime, proto);
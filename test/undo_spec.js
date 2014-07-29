var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    List = require('../src/list'),
    Map = require('../src/map'),
    Value = require('../src/value'),
    Bool = require('../src/types/bool'),
    Decimal = require('../src/types/decimal'),
    Str = require('../src/types/str'),
    Undo = require('../src/undo'),
    rawValues = require('./mock_values');

describe('Undo', function() {
  var literals = [
    {klass: Str, values: ['', 'hello', 'hello world']},
    {klass: Bool, values: [true, false, false, true]},
    {klass: Decimal, values: [0.1, 1, 5, 999]},
  ];

  it('rejects anything other than a Value instance', function() {
    rawValues.forEach(function(val) {
      assert.throws(function() {
        Undo(val);
      });
    });
  });

  it.only('accepts value instances', function() {
    rawValues.forEach(function(val) {
      assert.doesNotThrow(function() {
        var value = Valueable(val);
        Undo(value);
      });
    });
  });
});
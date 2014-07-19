var _ = require('lodash'),
    assert = require('assert'),
    Value = require('./value'),
    matchers = [];

var Valueable = function Valueable(value) {
  var klass, inst;
  if (value instanceof Value) {
    return new value.constructor(value.val());
  }

  for (var ix = 0; ix < matchers.length; ix++) {
    if (matchers[ix].test(value)) {
      return new matchers[ix].klass(value);
    }
  }
  assert.ok(false, 'Valueable(): type not supported');
};

Valueable.register = function Valueable$register(test, klass, name) {
  matchers.push({
    test: test,
    klass: klass,
    name: name
  });
};

module.exports = Valueable;
var _ = require('lodash'),
    assert = require('assert'),
    matchers = [];

var Valueable = function Valueable(rawValue) {
  for (var ix = 0; ix < matchers.length; ix++) {
    if (matchers[ix].test(rawValue)) {
      // console.log(matchers[ix].name, rawValue);
      return new matchers[ix].klass(rawValue);
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
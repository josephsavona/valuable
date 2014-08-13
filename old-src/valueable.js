var _ = require('lodash'),
    Value = require('./value'),
    inherits = require('./inherits'),
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
  throw new Error('Valueable(): type not supported');
};

Valueable.__reset__ = function Valueable$private$reset(m) {
  var tmp = matchers;
  matchers = m;
  return tmp;
};

Valueable.register = function Valueable$register(test, klass, name) {
  matchers.push({
    test: test,
    klass: klass,
    name: name
  });
};

Valueable.inherits = inherits;

module.exports = Valueable;
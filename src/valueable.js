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

Valueable.inherits = function Valueable$inherits(parent, proto, statics) {
  assert.ok(typeof parent === 'function' && parent.prototype instanceof Value,
    'Valueable(): can only inherit from a Value class');
  assert.ok(_.isPlainObject(proto),
    'Valueable(): inherits requires proto object to set prototype variables/functions');
  assert.ok(typeof proto.initialize === 'function',
    'Valueable(): proto.initialize is a required function that will be run as the last step of the constructor');
  assert.ok(!proto.assertValidValue || typeof proto.assertValidValue === 'function',
    'Valueable(): proto.assertValidValue(val) is an optional function that should throw if its input is an invalid type');
  assert.ok(!statics || _.isPlainObject(statics),
    'Valueable(): inherits accepts optional statics object for class variables/functions');

  // if a custom type validator is supplied ensure that the instance and class
  // versions are the same
  if (proto.assertValidValue) {
    statics.assertValidValue = proto.assertValidValue;
  }

  // declare the subclass
  var klass = function ValueSubClass(val) {
    this.assertValidValue(val);
    parent.call(this, val);
    this.initialize(val);
  };
  klass.prototype = Object.create(parent.prototype);
  _.extend(klass.prototype, proto);
  _.extend(klass, parent, statics);

  return klass;
};

module.exports = Valueable;
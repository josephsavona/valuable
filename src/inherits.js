var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value');

var inherits = function Valuable$$inherits(parent, constructor, proto, statics) {
  assert.ok(typeof parent === 'function' && parent.prototype instanceof Value,
    'inherits(): can only inherit from a Value class');
  assert.ok(typeof constructor === 'function',
    'inherits(): constructor is a required function that will be run as the last step of the constructor stub');
  assert.ok(_.isPlainObject(proto),
    'inherits(): proto is a required object to set prototype variables/functions');
  assert.ok(!proto.assertValidValue || typeof proto.assertValidValue === 'function',
    'inherits(): proto.assertValidValue(val) is an optional function that should throw if its input is an invalid type');
  assert.ok(!statics || _.isPlainObject(statics),
    'inherits(): statics is an optional object for class variables/functions');

  // if a custom type validator is supplied ensure that the instance and class
  // versions are the same
  if (proto.assertValidValue) {
    statics.assertValidValue = proto.assertValidValue;
  }

  // declare the subclass
  var klass = function ValueSubClass(val) {
    this.assertValidValue(val);
    if (!(this instanceof ValueSubClass)) {
      return new ValueSubClass(val);
    }
    parent.call(this, val);
    constructor.call(this, val);
  };
  klass.prototype = Object.create(parent.prototype);
  _.extend(klass.prototype, proto);
  _.extend(klass, parent, statics);

  return klass;
};

module.exports = inherits;
var assert = require('assert'),
    _ = require('lodash'),
    Value = require('../value'),
    inherits = require('../inherits');

var FuncConstructor = function Func(value) {
  Value.call(this, value);
  assert.equal(typeof this._raw, 'function', 'Func(): must specify a function value');
};

var FuncProto = {
  assertValidValue: function Func$assertValidValue(val) {
    assert.equal(typeof val, 'function', 'Func(): value must be a function');
  },
  call: function Func$call(bind, varargs) {
    var args = Array.prototype.slice.call(arguments, 1);
    this._raw.apply(bind, args);
  },
  apply: function Func$apply(bind, args) {
    assert.ok(_.isArray(args), 'Func(): apply takes single array of args');
    this._raw.apply(bind, args);
  }
};

var Func = inherits(Value, FuncConstructor, FuncProto, {});

module.exports = Func;
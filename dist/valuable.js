!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Valuable=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./src/bool":56,"./src/decimal":58,"./src/model":60,"./src/store":63,"./src/str":64}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":5}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":30,"inherits":27}],6:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
var TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":7,"ieee754":8}],7:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],8:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],9:[function(require,module,exports){
(function (Buffer){
var createHash = require('sha.js')

var md5 = toConstructor(require('./md5'))
var rmd160 = toConstructor(require('ripemd160'))

function toConstructor (fn) {
  return function () {
    var buffers = []
    var m= {
      update: function (data, enc) {
        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
        buffers.push(data)
        return this
      },
      digest: function (enc) {
        var buf = Buffer.concat(buffers)
        var r = fn(buf)
        buffers = null
        return enc ? r.toString(enc) : r
      }
    }
    return m
  }
}

module.exports = function (alg) {
  if('md5' === alg) return new md5()
  if('rmd160' === alg) return new rmd160()
  return createHash(alg)
}

}).call(this,require("buffer").Buffer)
},{"./md5":13,"buffer":6,"ripemd160":14,"sha.js":16}],10:[function(require,module,exports){
(function (Buffer){
var createHash = require('./create-hash')

var blocksize = 64
var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)

module.exports = Hmac

function Hmac (alg, key) {
  if(!(this instanceof Hmac)) return new Hmac(alg, key)
  this._opad = opad
  this._alg = alg

  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

  if(key.length > blocksize) {
    key = createHash(alg).update(key).digest()
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = this._ipad = new Buffer(blocksize)
  var opad = this._opad = new Buffer(blocksize)

  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  this._hash = createHash(alg).update(ipad)
}

Hmac.prototype.update = function (data, enc) {
  this._hash.update(data, enc)
  return this
}

Hmac.prototype.digest = function (enc) {
  var h = this._hash.digest()
  return createHash(this._alg).update(this._opad).update(h).digest(enc)
}


}).call(this,require("buffer").Buffer)
},{"./create-hash":9,"buffer":6}],11:[function(require,module,exports){
(function (Buffer){
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

}).call(this,require("buffer").Buffer)
},{"buffer":6}],12:[function(require,module,exports){
(function (Buffer){
var rng = require('./rng')

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = require('./create-hash')

exports.createHmac = require('./create-hmac')

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)))
    } catch (err) { callback(err) }
  } else {
    return new Buffer(rng(size))
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

exports.getHashes = function () {
  return ['sha1', 'sha256', 'md5', 'rmd160']

}

var p = require('./pbkdf2')(exports.createHmac)
exports.pbkdf2 = p.pbkdf2
exports.pbkdf2Sync = p.pbkdf2Sync


// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

}).call(this,require("buffer").Buffer)
},{"./create-hash":9,"./create-hmac":10,"./pbkdf2":20,"./rng":21,"buffer":6}],13:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = require('./helpers');

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":11}],14:[function(require,module,exports){
(function (Buffer){

module.exports = ripemd160



/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/** @preserve
(c) 2012 by Cédric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Constants table
var zl = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
var zr = [
    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
var sl = [
     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
var sr = [
    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

var bytesToWords = function (bytes) {
  var words = [];
  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32);
  }
  return words;
};

var wordsToBytes = function (words) {
  var bytes = [];
  for (var b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  }
  return bytes;
};

var processBlock = function (H, M, offset) {

  // Swap endian
  for (var i = 0; i < 16; i++) {
    var offset_i = offset + i;
    var M_offset_i = M[offset_i];

    // Swap
    M[offset_i] = (
        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    );
  }

  // Working variables
  var al, bl, cl, dl, el;
  var ar, br, cr, dr, er;

  ar = al = H[0];
  br = bl = H[1];
  cr = cl = H[2];
  dr = dl = H[3];
  er = el = H[4];
  // Computation
  var t;
  for (var i = 0; i < 80; i += 1) {
    t = (al +  M[offset+zl[i]])|0;
    if (i<16){
        t +=  f1(bl,cl,dl) + hl[0];
    } else if (i<32) {
        t +=  f2(bl,cl,dl) + hl[1];
    } else if (i<48) {
        t +=  f3(bl,cl,dl) + hl[2];
    } else if (i<64) {
        t +=  f4(bl,cl,dl) + hl[3];
    } else {// if (i<80) {
        t +=  f5(bl,cl,dl) + hl[4];
    }
    t = t|0;
    t =  rotl(t,sl[i]);
    t = (t+el)|0;
    al = el;
    el = dl;
    dl = rotl(cl, 10);
    cl = bl;
    bl = t;

    t = (ar + M[offset+zr[i]])|0;
    if (i<16){
        t +=  f5(br,cr,dr) + hr[0];
    } else if (i<32) {
        t +=  f4(br,cr,dr) + hr[1];
    } else if (i<48) {
        t +=  f3(br,cr,dr) + hr[2];
    } else if (i<64) {
        t +=  f2(br,cr,dr) + hr[3];
    } else {// if (i<80) {
        t +=  f1(br,cr,dr) + hr[4];
    }
    t = t|0;
    t =  rotl(t,sr[i]) ;
    t = (t+er)|0;
    ar = er;
    er = dr;
    dr = rotl(cr, 10);
    cr = br;
    br = t;
  }
  // Intermediate hash value
  t    = (H[1] + cl + dr)|0;
  H[1] = (H[2] + dl + er)|0;
  H[2] = (H[3] + el + ar)|0;
  H[3] = (H[4] + al + br)|0;
  H[4] = (H[0] + bl + cr)|0;
  H[0] =  t;
};

function f1(x, y, z) {
  return ((x) ^ (y) ^ (z));
}

function f2(x, y, z) {
  return (((x)&(y)) | ((~x)&(z)));
}

function f3(x, y, z) {
  return (((x) | (~(y))) ^ (z));
}

function f4(x, y, z) {
  return (((x) & (z)) | ((y)&(~(z))));
}

function f5(x, y, z) {
  return ((x) ^ ((y) |(~(z))));
}

function rotl(x,n) {
  return (x<<n) | (x>>>(32-n));
}

function ripemd160(message) {
  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

  if (typeof message == 'string')
    message = new Buffer(message, 'utf8');

  var m = bytesToWords(message);

  var nBitsLeft = message.length * 8;
  var nBitsTotal = message.length * 8;

  // Add padding
  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
  );

  for (var i=0 ; i<m.length; i += 16) {
    processBlock(H, m, i);
  }

  // Swap endian
  for (var i = 0; i < 5; i++) {
      // Shortcut
    var H_i = H[i];

    // Swap
    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
  }

  var digestbytes = wordsToBytes(H);
  return new Buffer(digestbytes);
}



}).call(this,require("buffer").Buffer)
},{"buffer":6}],15:[function(require,module,exports){
var u = require('./util')
var write = u.write
var fill = u.zeroFill

module.exports = function (Buffer) {

  //prototype class for hash functions
  function Hash (blockSize, finalSize) {
    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
    this._finalSize = finalSize
    this._blockSize = blockSize
    this._len = 0
    this._s = 0
  }

  Hash.prototype.init = function () {
    this._s = 0
    this._len = 0
  }

  function lengthOf(data, enc) {
    if(enc == null)     return data.byteLength || data.length
    if(enc == 'ascii' || enc == 'binary')  return data.length
    if(enc == 'hex')    return data.length/2
    if(enc == 'base64') return data.length/3
  }

  Hash.prototype.update = function (data, enc) {
    var bl = this._blockSize

    //I'd rather do this with a streaming encoder, like the opposite of
    //http://nodejs.org/api/string_decoder.html
    var length
      if(!enc && 'string' === typeof data)
        enc = 'utf8'

    if(enc) {
      if(enc === 'utf-8')
        enc = 'utf8'

      if(enc === 'base64' || enc === 'utf8')
        data = new Buffer(data, enc), enc = null

      length = lengthOf(data, enc)
    } else
      length = data.byteLength || data.length

    var l = this._len += length
    var s = this._s = (this._s || 0)
    var f = 0
    var buffer = this._block
    while(s < l) {
      var t = Math.min(length, f + bl - s%bl)
      write(buffer, data, enc, s%bl, f, t)
      var ch = (t - f);
      s += ch; f += ch

      if(!(s%bl))
        this._update(buffer)
    }
    this._s = s

    return this

  }

  Hash.prototype.digest = function (enc) {
    var bl = this._blockSize
    var fl = this._finalSize
    var len = this._len*8

    var x = this._block

    var bits = len % (bl*8)

    //add end marker, so that appending 0's creats a different hash.
    x[this._len % bl] = 0x80
    fill(this._block, this._len % bl + 1)

    if(bits >= fl*8) {
      this._update(this._block)
      u.zeroFill(this._block, 0)
    }

    //TODO: handle case where the bit length is > Math.pow(2, 29)
    x.writeInt32BE(len, fl + 4) //big endian

    var hash = this._update(this._block) || this._hash()
    if(enc == null) return hash
    return hash.toString(enc)
  }

  Hash.prototype._update = function () {
    throw new Error('_update must be implemented by subclass')
  }

  return Hash
}

},{"./util":19}],16:[function(require,module,exports){
var exports = module.exports = function (alg) {
  var Alg = exports[alg]
  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
  return new Alg()
}

var Buffer = require('buffer').Buffer
var Hash   = require('./hash')(Buffer)

exports.sha =
exports.sha1 = require('./sha1')(Buffer, Hash)
exports.sha256 = require('./sha256')(Buffer, Hash)

},{"./hash":15,"./sha1":17,"./sha256":18,"buffer":6}],17:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */
module.exports = function (Buffer, Hash) {

  var inherits = require('util').inherits

  inherits(Sha1, Hash)

  var A = 0|0
  var B = 4|0
  var C = 8|0
  var D = 12|0
  var E = 16|0

  var BE = false
  var LE = true

  var W = new Int32Array(80)

  var POOL = []

  function Sha1 () {
    if(POOL.length)
      return POOL.pop().init()

    if(!(this instanceof Sha1)) return new Sha1()
    this._w = W
    Hash.call(this, 16*4, 14*4)
  
    this._h = null
    this.init()
  }

  Sha1.prototype.init = function () {
    this._a = 0x67452301
    this._b = 0xefcdab89
    this._c = 0x98badcfe
    this._d = 0x10325476
    this._e = 0xc3d2e1f0

    Hash.prototype.init.call(this)
    return this
  }

  Sha1.prototype._POOL = POOL

  // assume that array is a Uint32Array with length=16,
  // and that if it is the last block, it already has the length and the 1 bit appended.


  var isDV = new Buffer(1) instanceof DataView
  function readInt32BE (X, i) {
    return isDV
      ? X.getInt32(i, false)
      : X.readInt32BE(i)
  }

  Sha1.prototype._update = function (array) {

    var X = this._block
    var h = this._h
    var a, b, c, d, e, _a, _b, _c, _d, _e

    a = _a = this._a
    b = _b = this._b
    c = _c = this._c
    d = _d = this._d
    e = _e = this._e

    var w = this._w

    for(var j = 0; j < 80; j++) {
      var W = w[j]
        = j < 16
        //? X.getInt32(j*4, false)
        //? readInt32BE(X, j*4) //*/ X.readInt32BE(j*4) //*/
        ? X.readInt32BE(j*4)
        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

      var t =
        add(
          add(rol(a, 5), sha1_ft(j, b, c, d)),
          add(add(e, W), sha1_kt(j))
        );

      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = t
    }

    this._a = add(a, _a)
    this._b = add(b, _b)
    this._c = add(c, _c)
    this._d = add(d, _d)
    this._e = add(e, _e)
  }

  Sha1.prototype._hash = function () {
    if(POOL.length < 100) POOL.push(this)
    var H = new Buffer(20)
    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
    H.writeInt32BE(this._a|0, A)
    H.writeInt32BE(this._b|0, B)
    H.writeInt32BE(this._c|0, C)
    H.writeInt32BE(this._d|0, D)
    H.writeInt32BE(this._e|0, E)
    return H
  }

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d) {
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
  }

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t) {
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
           (t < 60) ? -1894007588 : -899497514;
  }

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
   *
   */
  function add(x, y) {
    return (x + y ) | 0
  //lets see how this goes on testling.
  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  //  return (msw << 16) | (lsw & 0xFFFF);
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  return Sha1
}

},{"util":50}],18:[function(require,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('util').inherits
var BE       = false
var LE       = true
var u        = require('./util')

module.exports = function (Buffer, Hash) {

  var K = [
      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
    ]

  inherits(Sha256, Hash)
  var W = new Array(64)
  var POOL = []
  function Sha256() {
    if(POOL.length) {
      //return POOL.shift().init()
    }
    //this._data = new Buffer(32)

    this.init()

    this._w = W //new Array(64)

    Hash.call(this, 16*4, 14*4)
  };

  Sha256.prototype.init = function () {

    this._a = 0x6a09e667|0
    this._b = 0xbb67ae85|0
    this._c = 0x3c6ef372|0
    this._d = 0xa54ff53a|0
    this._e = 0x510e527f|0
    this._f = 0x9b05688c|0
    this._g = 0x1f83d9ab|0
    this._h = 0x5be0cd19|0

    this._len = this._s = 0

    return this
  }

  var safe_add = function(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  function S (X, n) {
    return (X >>> n) | (X << (32 - n));
  }

  function R (X, n) {
    return (X >>> n);
  }

  function Ch (x, y, z) {
    return ((x & y) ^ ((~x) & z));
  }

  function Maj (x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z));
  }

  function Sigma0256 (x) {
    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
  }

  function Sigma1256 (x) {
    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
  }

  function Gamma0256 (x) {
    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
  }

  function Gamma1256 (x) {
    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
  }

  Sha256.prototype._update = function(m) {
    var M = this._block
    var W = this._w
    var a, b, c, d, e, f, g, h
    var T1, T2

    a = this._a | 0
    b = this._b | 0
    c = this._c | 0
    d = this._d | 0
    e = this._e | 0
    f = this._f | 0
    g = this._g | 0
    h = this._h | 0

    for (var j = 0; j < 64; j++) {
      var w = W[j] = j < 16
        ? M.readInt32BE(j * 4)
        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

      T2 = Sigma0256(a) + Maj(a, b, c);
      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
    }

    this._a = (a + this._a) | 0
    this._b = (b + this._b) | 0
    this._c = (c + this._c) | 0
    this._d = (d + this._d) | 0
    this._e = (e + this._e) | 0
    this._f = (f + this._f) | 0
    this._g = (g + this._g) | 0
    this._h = (h + this._h) | 0

  };

  Sha256.prototype._hash = function () {
    if(POOL.length < 10)
      POOL.push(this)

    var H = new Buffer(32)

    H.writeInt32BE(this._a,  0)
    H.writeInt32BE(this._b,  4)
    H.writeInt32BE(this._c,  8)
    H.writeInt32BE(this._d, 12)
    H.writeInt32BE(this._e, 16)
    H.writeInt32BE(this._f, 20)
    H.writeInt32BE(this._g, 24)
    H.writeInt32BE(this._h, 28)

    return H
  }

  return Sha256

}

},{"./util":19,"util":50}],19:[function(require,module,exports){
exports.write = write
exports.zeroFill = zeroFill

exports.toString = toString

function write (buffer, string, enc, start, from, to, LE) {
  var l = (to - from)
  if(enc === 'ascii' || enc === 'binary') {
    for( var i = 0; i < l; i++) {
      buffer[start + i] = string.charCodeAt(i + from)
    }
  }
  else if(enc == null) {
    for( var i = 0; i < l; i++) {
      buffer[start + i] = string[i + from]
    }
  }
  else if(enc === 'hex') {
    for(var i = 0; i < l; i++) {
      var j = from + i
      buffer[start + i] = parseInt(string[j*2] + string[(j*2)+1], 16)
    }
  }
  else if(enc === 'base64') {
    throw new Error('base64 encoding not yet supported')
  }
  else
    throw new Error(enc +' encoding not yet supported')
}

//always fill to the end!
function zeroFill(buf, from) {
  for(var i = from; i < buf.length; i++)
    buf[i] = 0
}


},{}],20:[function(require,module,exports){
(function (Buffer){
// JavaScript PBKDF2 Implementation
// Based on http://git.io/qsv2zw
// Licensed under LGPL v3
// Copyright (c) 2013 jduncanator

var blocksize = 64
var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)

module.exports = function (createHmac, exports) {
  exports = exports || {}

  exports.pbkdf2 = function(password, salt, iterations, keylen, cb) {
    if('function' !== typeof cb)
      throw new Error('No callback provided to pbkdf2');
    setTimeout(function () {
      cb(null, exports.pbkdf2Sync(password, salt, iterations, keylen))
    })
  }

  exports.pbkdf2Sync = function(key, salt, iterations, keylen) {
    if('number' !== typeof iterations)
      throw new TypeError('Iterations not a number')
    if(iterations < 0)
      throw new TypeError('Bad iterations')
    if('number' !== typeof keylen)
      throw new TypeError('Key length not a number')
    if(keylen < 0)
      throw new TypeError('Bad key length')

    //stretch key to the correct length that hmac wants it,
    //otherwise this will happen every time hmac is called
    //twice per iteration.
    var key = !Buffer.isBuffer(key) ? new Buffer(key) : key

    if(key.length > blocksize) {
      key = createHash(alg).update(key).digest()
    } else if(key.length < blocksize) {
      key = Buffer.concat([key, zeroBuffer], blocksize)
    }

    var HMAC;
    var cplen, p = 0, i = 1, itmp = new Buffer(4), digtmp;
    var out = new Buffer(keylen);
    out.fill(0);
    while(keylen) {
      if(keylen > 20)
        cplen = 20;
      else
        cplen = keylen;

      /* We are unlikely to ever use more than 256 blocks (5120 bits!)
         * but just in case...
         */
        itmp[0] = (i >> 24) & 0xff;
        itmp[1] = (i >> 16) & 0xff;
          itmp[2] = (i >> 8) & 0xff;
          itmp[3] = i & 0xff;

          HMAC = createHmac('sha1', key);
          HMAC.update(salt)
          HMAC.update(itmp);
        digtmp = HMAC.digest();
        digtmp.copy(out, p, 0, cplen);

        for(var j = 1; j < iterations; j++) {
          HMAC = createHmac('sha1', key);
          HMAC.update(digtmp);
          digtmp = HMAC.digest();
          for(var k = 0; k < cplen; k++) {
            out[k] ^= digtmp[k];
          }
        }
      keylen -= cplen;
      i++;
      p += cplen;
    }

    return out;
  }

  return exports
}

}).call(this,require("buffer").Buffer)
},{"buffer":6}],21:[function(require,module,exports){
(function (Buffer){
(function() {
  module.exports = function(size) {
    var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
    /* This will not work in older browsers.
     * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
     */
    crypto.getRandomValues(bytes);
    return bytes;
  }
}())

}).call(this,require("buffer").Buffer)
},{"buffer":6}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],23:[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');
var url = require('url')

http.request = function (params, cb) {
    if (typeof params === 'string') {
        params = url.parse(params)
    }
    if (!params) params = {};
    if (!params.host && !params.port) {
        params.port = parseInt(window.location.port, 10);
    }
    if (!params.host && params.hostname) {
        params.host = params.hostname;
    }
    
    if (!params.scheme) params.scheme = window.location.protocol.split(':')[0];
    if (!params.host) {
        params.host = window.location.hostname || window.location.host;
    }
    if (/:/.test(params.host)) {
        if (!params.port) {
            params.port = params.host.split(':')[1];
        }
        params.host = params.host.split(':')[0];
    }
    if (!params.port) params.port = params.scheme == 'https' ? 443 : 80;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

http.STATUS_CODES = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version Not Supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
};
},{"./lib/request":24,"events":22,"url":48}],24:[function(require,module,exports){
var Stream = require('stream');
var Response = require('./response');
var Base64 = require('Base64');
var inherits = require('inherits');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = [];
    
    self.uri = (params.scheme || 'http') + '://'
        + params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    if (typeof params.withCredentials === 'undefined') {
        params.withCredentials = true;
    }

    try { xhr.withCredentials = params.withCredentials }
    catch (e) {}
    
    if (params.responseType) try { xhr.responseType = params.responseType }
    catch (e) {}
    
    xhr.open(
        params.method || 'GET',
        self.uri,
        true
    );

    self._headers = {};
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            self.setHeader(key, value);
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        // Fix for IE9 bug
        // SCRIPT575: Could not complete the operation due to error c00c023f
        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
        if (xhr.__aborted) return;
        res.handle(xhr);
    };
};

inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    this._headers[key.toLowerCase()] = value
};

Request.prototype.getHeader = function (key) {
    return this._headers[key.toLowerCase()]
};

Request.prototype.removeHeader = function (key) {
    delete this._headers[key.toLowerCase()]
};

Request.prototype.write = function (s) {
    this.body.push(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.__aborted = true;
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.push(s);

    var keys = objectKeys(this._headers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this._headers[key];
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                this.xhr.setRequestHeader(key, value[j]);
            }
        }
        else this.xhr.setRequestHeader(key, value)
    }

    if (this.body.length === 0) {
        this.xhr.send('');
    }
    else if (typeof this.body[0] === 'string') {
        this.xhr.send(this.body.join(''));
    }
    else if (isArray(this.body[0])) {
        var body = [];
        for (var i = 0; i < this.body.length; i++) {
            body.push.apply(body, this.body[i]);
        }
        this.xhr.send(body);
    }
    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
        var len = 0;
        for (var i = 0; i < this.body.length; i++) {
            len += this.body[i].length;
        }
        var body = new(this.body[0].constructor)(len);
        var k = 0;
        
        for (var i = 0; i < this.body.length; i++) {
            var b = this.body[i];
            for (var j = 0; j < b.length; j++) {
                body[k++] = b[j];
            }
        }
        this.xhr.send(body);
    }
    else {
        var body = '';
        for (var i = 0; i < this.body.length; i++) {
            body += this.body[i].toString();
        }
        this.xhr.send(body);
    }
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

},{"./response":25,"Base64":26,"inherits":27,"stream":47}],25:[function(require,module,exports){
var Stream = require('stream');
var util = require('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":47,"util":50}],26:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '');
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],27:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],28:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],29:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],30:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],31:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],34:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":32,"./encode":33}],35:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":36}],36:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))
},{"./_stream_readable":38,"./_stream_writable":40,"_process":30,"core-util-is":41,"inherits":27}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":39,"core-util-is":41,"inherits":27}],38:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || n === null) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode &&
      !er) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    process.nextTick(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    process.nextTick(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      process.nextTick(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"_process":30,"buffer":6,"core-util-is":41,"events":22,"inherits":27,"isarray":28,"stream":47,"string_decoder/":42}],39:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":36,"core-util-is":41,"inherits":27}],40:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/


var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      cb(er);
    });
  else
    cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))
},{"./_stream_duplex":36,"_process":30,"buffer":6,"core-util-is":41,"inherits":27,"stream":47}],41:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,require("buffer").Buffer)
},{"buffer":6}],42:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  this.charBuffer = new Buffer(6);
  this.charReceived = 0;
  this.charLength = 0;
};


StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  var offset = 0;

  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var i = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, offset, i);
    this.charReceived += (i - offset);
    offset = i;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (i == buffer.length) return charStr;

    // otherwise cut off the characters end from the beginning of this buffer
    buffer = buffer.slice(i, buffer.length);
    break;
  }

  var lenIncomplete = this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
    this.charReceived = lenIncomplete;
    end -= lenIncomplete;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  return i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 2;
  this.charLength = incomplete ? 2 : 0;
  return incomplete;
}

function base64DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 3;
  this.charLength = incomplete ? 3 : 0;
  return incomplete;
}

},{"buffer":6}],43:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":37}],44:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":36,"./lib/_stream_passthrough.js":37,"./lib/_stream_readable.js":38,"./lib/_stream_transform.js":39,"./lib/_stream_writable.js":40}],45:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":39}],46:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":40}],47:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":22,"inherits":27,"readable-stream/duplex.js":35,"readable-stream/passthrough.js":43,"readable-stream/readable.js":44,"readable-stream/transform.js":45,"readable-stream/writable.js":46}],48:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":31,"querystring":34}],49:[function(require,module,exports){
module.exports=require(4)
},{}],50:[function(require,module,exports){
module.exports=require(5)
},{"./support/isBuffer":49,"_process":30,"inherits":27}],51:[function(require,module,exports){
/*
 * @name Lazy.js
 *
 * @fileOverview
 * Lazy.js is a lazy evaluation library for JavaScript.
 *
 * This has been done before. For examples see:
 *
 * - [wu.js](http://fitzgen.github.io/wu.js/)
 * - [Linq.js](http://linqjs.codeplex.com/)
 * - [from.js](https://github.com/suckgamoni/fromjs/)
 * - [IxJS](http://rx.codeplex.com/)
 * - [sloth.js](http://rfw.name/sloth.js/)
 *
 * However, at least at present, Lazy.js is faster (on average) than any of
 * those libraries. It is also more complete, with nearly all of the
 * functionality of [Underscore](http://underscorejs.org/) and
 * [Lo-Dash](http://lodash.com/).
 *
 * Finding your way around the code
 * --------------------------------
 *
 * At the heart of Lazy.js is the {@link Sequence} object. You create an initial
 * sequence using {@link Lazy}, which can accept an array, object, or string.
 * You can then "chain" together methods from this sequence, creating a new
 * sequence with each call.
 *
 * Here's an example:
 *
 *     var data = getReallyBigArray();
 *
 *     var statistics = Lazy(data)
 *       .map(transform)
 *       .filter(validate)
 *       .reduce(aggregate);
 *
 * {@link Sequence} is the foundation of other, more specific sequence types.
 *
 * An {@link ArrayLikeSequence} provides indexed access to its elements.
 *
 * An {@link ObjectLikeSequence} consists of key/value pairs.
 *
 * A {@link StringLikeSequence} is like a string (duh): actually, it is an
 * {@link ArrayLikeSequence} whose elements happen to be characters.
 *
 * An {@link AsyncSequence} is special: it iterates over its elements
 * asynchronously (so calling `each` generally begins an asynchronous loop and
 * returns immediately).
 *
 * For more information
 * --------------------
 *
 * I wrote a blog post that explains a little bit more about Lazy.js, which you
 * can read [here](http://philosopherdeveloper.com/posts/introducing-lazy-js.html).
 *
 * You can also [create an issue on GitHub](https://github.com/dtao/lazy.js/issues)
 * if you have any issues with the library. I work through them eventually.
 *
 * [@dtao](https://github.com/dtao)
 */

(function(context) {
  /**
   * Wraps an object and returns a {@link Sequence}. For `null` or `undefined`,
   * simply returns an empty sequence (see {@link Lazy.strict} for a stricter
   * implementation).
   *
   * - For **arrays**, Lazy will create a sequence comprising the elements in
   *   the array (an {@link ArrayLikeSequence}).
   * - For **objects**, Lazy will create a sequence of key/value pairs
   *   (an {@link ObjectLikeSequence}).
   * - For **strings**, Lazy will create a sequence of characters (a
   *   {@link StringLikeSequence}).
   *
   * @public
   * @param {Array|Object|string} source An array, object, or string to wrap.
   * @returns {Sequence} The wrapped lazy object.
   *
   * @exampleHelpers
   * // Utility functions to provide to all examples
   * function increment(x) { return x + 1; }
   * function isEven(x) { return x % 2 === 0; }
   * function isPositive(x) { return x > 0; }
   * function isNegative(x) { return x < 0; }
   *
   * @examples
   * Lazy([1, 2, 4])       // instanceof Lazy.ArrayLikeSequence
   * Lazy({ foo: "bar" })  // instanceof Lazy.ObjectLikeSequence
   * Lazy("hello, world!") // instanceof Lazy.StringLikeSequence
   * Lazy()                // sequence: []
   * Lazy(null)            // sequence: []
   */
  function Lazy(source) {
    if (source instanceof Array) {
      return new ArrayWrapper(source);
    } else if (typeof source === "string") {
      return new StringWrapper(source);
    } else if (source instanceof Sequence) {
      return source;
    }

    if (Lazy.extensions) {
      var extensions = Lazy.extensions, length = extensions.length, result;
      while (!result && length--) {
        result = extensions[length](source);
      }
      if (result) {
        return result;
      }
    }

    return new ObjectWrapper(source);
  }

  Lazy.VERSION = '0.3.2';

  /*** Utility methods of questionable value ***/

  Lazy.noop = function noop() {};
  Lazy.identity = function identity(x) { return x; };

  /**
   * Provides a stricter version of {@link Lazy} which throws an error when
   * attempting to wrap `null`, `undefined`, or numeric or boolean values as a
   * sequence.
   *
   * @public
   * @returns {Function} A stricter version of the {@link Lazy} helper function.
   *
   * @examples
   * var Strict = Lazy.strict();
   *
   * Strict()                  // throws
   * Strict(null)              // throws
   * Strict(true)              // throws
   * Strict(5)                 // throws
   * Strict([1, 2, 3])         // instanceof Lazy.ArrayLikeSequence
   * Strict({ foo: "bar" })    // instanceof Lazy.ObjectLikeSequence
   * Strict("hello, world!")   // instanceof Lazy.StringLikeSequence
   *
   * // Let's also ensure the static functions are still there.
   * Strict.range(3)           // sequence: [0, 1, 2]
   * Strict.generate(Date.now) // instanceof Lazy.GeneratedSequence
   */
  Lazy.strict = function strict() {
    function StrictLazy(source) {
      if (source == null) {
        throw "You cannot wrap null or undefined using Lazy.";
      }

      if (typeof source === "number" || typeof source === "boolean") {
        throw "You cannot wrap primitive values using Lazy.";
      }

      return Lazy(source);
    };

    Lazy(Lazy).each(function(property, name) {
      StrictLazy[name] = property;
    });

    return StrictLazy;
  };

  /**
   * The `Sequence` object provides a unified API encapsulating the notion of
   * zero or more consecutive elements in a collection, stream, etc.
   *
   * Lazy evaluation
   * ---------------
   *
   * Generally speaking, creating a sequence should not be an expensive operation,
   * and should not iterate over an underlying source or trigger any side effects.
   * This means that chaining together methods that return sequences incurs only
   * the cost of creating the `Sequence` objects themselves and not the cost of
   * iterating an underlying data source multiple times.
   *
   * The following code, for example, creates 4 sequences and does nothing with
   * `source`:
   *
   *     var seq = Lazy(source) // 1st sequence
   *       .map(func)           // 2nd
   *       .filter(pred)        // 3rd
   *       .reverse();          // 4th
   *
   * Lazy's convention is to hold off on iterating or otherwise *doing* anything
   * (aside from creating `Sequence` objects) until you call `each`:
   *
   *     seq.each(function(x) { console.log(x); });
   *
   * Defining custom sequences
   * -------------------------
   *
   * Defining your own type of sequence is relatively simple:
   *
   * 1. Pass a *method name* and an object containing *function overrides* to
   *    {@link Sequence.define}. If the object includes a function called `init`,
   *    this function will be called upon initialization.
   * 2. The object should include at least either a `getIterator` method or an
   *    `each` method. The former supports both asynchronous and synchronous
   *    iteration, but is slightly more cumbersome to implement. The latter
   *    supports synchronous iteration and can be automatically implemented in
   *    terms of the former. You can also implement both if you want, e.g. to
   *    optimize performance. For more info, see {@link Iterator} and
   *    {@link AsyncSequence}.
   *
   * As a trivial example, the following code defines a new method, `sample`,
   * which randomly may or may not include each element from its parent.
   *
   *     Lazy.Sequence.define("sample", {
   *       each: function(fn) {
   *         return this.parent.each(function(e) {
   *           // 50/50 chance of including this element.
   *           if (Math.random() > 0.5) {
   *             return fn(e);
   *           }
   *         });
   *       }
   *     });
   *
   * (Of course, the above could also easily have been implemented using
   * {@link #filter} instead of creating a custom sequence. But I *did* say this
   * was a trivial example, to be fair.)
   *
   * Now it will be possible to create this type of sequence from any parent
   * sequence by calling the method name you specified. In other words, you can
   * now do this:
   *
   *     Lazy(arr).sample();
   *     Lazy(arr).map(func).sample();
   *     Lazy(arr).map(func).filter(pred).sample();
   *
   * Etc., etc.
   *
   * @public
   * @constructor
   */
  function Sequence() {}

  /**
   * Create a new constructor function for a type inheriting from `Sequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `Sequence` prototype so that it can be chained with any other
   *     sequence methods, like {@link #map}, {@link #filter}, etc.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include either `getIterator` or `each` (or
   *     both). *May* include an `init` method as well. For these overrides,
   *     `this` will be the new sequence, and `this.parent` will be the base
   *     sequence from which the new sequence was constructed.
   * @returns {Function} A constructor for a new type inheriting from `Sequence`.
   *
   * @examples
   * // This sequence type logs every element to the specified logger as it
   * // iterates over it.
   * Lazy.Sequence.define("verbose", {
   *   init: function(logger) {
   *     this.logger = logger;
   *   },
   *
   *   each: function(fn) {
   *     var logger = this.logger;
   *     return this.parent.each(function(e, i) {
   *       logger(e);
   *       return fn(e, i);
   *     });
   *   }
   * });
   *
   * Lazy([1, 2, 3]).verbose(logger).each(Lazy.noop) // calls logger 3 times
   */
  Sequence.define = function define(methodName, overrides) {
    if (!overrides || (!overrides.getIterator && !overrides.each)) {
      throw "A custom sequence must implement *at least* getIterator or each!";
    }

    return defineSequenceType(Sequence, methodName, overrides);
  };

  /**
   * Gets the number of elements in the sequence. In some cases, this may
   * require eagerly evaluating the sequence.
   *
   * @public
   * @returns {number} The number of elements in the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).size();                 // => 3
   * Lazy([1, 2]).map(Lazy.identity).size(); // => 2
   * Lazy([1, 2, 3]).reject(isEven).size();  // => 2
   * Lazy([1, 2, 3]).take(1).size();         // => 1
   * Lazy({ foo: 1, bar: 2 }).size();        // => 2
   * Lazy('hello').size();                   // => 5
   */
  Sequence.prototype.size = function size() {
    return this.getIndex().length();
  };

  /**
   * Creates an {@link Iterator} object with two methods, `moveNext` -- returning
   * true or false -- and `current` -- returning the current value.
   *
   * This method is used when asynchronously iterating over sequences. Any type
   * inheriting from `Sequence` must implement this method or it can't support
   * asynchronous iteration.
   *
   * Note that **this method is not intended to be used directly by application
   * code.** Rather, it is intended as a means for implementors to potentially
   * define custom sequence types that support either synchronous or
   * asynchronous iteration.
   *
   * @public
   * @returns {Iterator} An iterator object.
   *
   * @examples
   * var iterator = Lazy([1, 2]).getIterator();
   *
   * iterator.moveNext(); // => true
   * iterator.current();  // => 1
   * iterator.moveNext(); // => true
   * iterator.current();  // => 2
   * iterator.moveNext(); // => false
   */
  Sequence.prototype.getIterator = function getIterator() {
    return new Iterator(this);
  };

  /**
   * Gets the root sequence underlying the current chain of sequences.
   */
  Sequence.prototype.root = function root() {
    return this.parent.root();
  };

  /**
   * Evaluates the sequence and produces an appropriate value (an array in most
   * cases, an object for {@link ObjectLikeSequence}s or a string for
   * {@link StringLikeSequence}s).
   */
  Sequence.prototype.value = function value() {
    return this.toArray();
  };

  /**
   * Applies the current transformation chain to a given source.
   *
   * @examples
   * var sequence = Lazy([])
   *   .map(function(x) { return x * -1; })
   *   .filter(function(x) { return x % 2 === 0; });
   *
   * sequence.apply([1, 2, 3, 4]); // => [-2, -4]
   */
  Sequence.prototype.apply = function apply(source) {
    var root = this.root(),
        previousSource = root.source,
        result;

    try {
      root.source = source;
      result = this.value();
    } finally {
      root.source = previousSource;
    }

    return result;
  };

  /**
   * The Iterator object provides an API for iterating over a sequence.
   *
   * The purpose of the `Iterator` type is mainly to offer an agnostic way of
   * iterating over a sequence -- either synchronous (i.e. with a `while` loop)
   * or asynchronously (with recursive calls to either `setTimeout` or --- if
   * available --- `setImmediate`). It is not intended to be used directly by
   * application code.
   *
   * @public
   * @constructor
   * @param {Sequence} sequence The sequence to iterate over.
   */
  function Iterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  /**
   * Gets the current item this iterator is pointing to.
   *
   * @public
   * @returns {*} The current item.
   */
  Iterator.prototype.current = function current() {
    return this.cachedIndex && this.cachedIndex.get(this.index);
  };

  /**
   * Moves the iterator to the next item in a sequence, if possible.
   *
   * @public
   * @returns {boolean} True if the iterator is able to move to a new item, or else
   *     false.
   */
  Iterator.prototype.moveNext = function moveNext() {
    var cachedIndex = this.cachedIndex;

    if (!cachedIndex) {
      cachedIndex = this.cachedIndex = this.sequence.getIndex();
    }

    if (this.index >= cachedIndex.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * Creates an array snapshot of a sequence.
   *
   * Note that for indefinite sequences, this method may raise an exception or
   * (worse) cause the environment to hang.
   *
   * @public
   * @returns {Array} An array containing the current contents of the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).toArray() // => [1, 2, 3]
   */
  Sequence.prototype.toArray = function toArray() {
    return this.reduce(function(arr, element) {
      arr.push(element);
      return arr;
    }, []);
  };

  /**
   * Provides an indexed view into the sequence.
   *
   * For sequences that are already indexed, this will simply return the
   * sequence. For non-indexed sequences, this will eagerly evaluate the
   * sequence and cache the result (so subsequent calls will not create
   * additional arrays).
   *
   * @returns {ArrayLikeSequence} A sequence containing the current contents of
   *     the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).filter(isEven)            // instanceof Lazy.Sequence
   * Lazy([1, 2, 3]).filter(isEven).getIndex() // instanceof Lazy.ArrayLikeSequence
   */
  Sequence.prototype.getIndex = function getIndex() {
    if (!this.cachedIndex) {
      this.cachedIndex = new ArrayWrapper(this.toArray());
    }
    return this.cachedIndex;
  };

  /**
   * Provides an indexed, memoized view into the sequence. This will cache the
   * result whenever the sequence is first iterated, so that subsequent
   * iterations will access the same element objects.
   *
   * @public
   * @returns {ArrayLikeSequence} An indexed, memoized sequence containing this
   *     sequence's elements, cached after the first iteration.
   *
   * @example
   * function createObject() { return new Object(); }
   *
   * var plain    = Lazy.generate(createObject, 10),
   *     memoized = Lazy.generate(createObject, 10).memoize();
   *
   * plain.toArray()[0] === plain.toArray()[0];       // => false
   * memoized.toArray()[0] === memoized.toArray()[0]; // => true
   */
  Sequence.prototype.memoize = function memoize() {
    return new MemoizedSequence(this);
  };

  /**
   * @constructor
   */
  function MemoizedSequence(parent) {
    this.parent = parent;
  }

  // MemoizedSequence needs to have its prototype set up after ArrayLikeSequence

  /**
   * Creates an object from a sequence of key/value pairs.
   *
   * @public
   * @returns {Object} An object with keys and values corresponding to the pairs
   *     of elements in the sequence.
   *
   * @examples
   * var details = [
   *   ["first", "Dan"],
   *   ["last", "Tao"],
   *   ["age", 29]
   * ];
   *
   * Lazy(details).toObject() // => { first: "Dan", last: "Tao", age: 29 }
   */
  Sequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, pair) {
      object[pair[0]] = pair[1];
      return object;
    }, {});
  };

  /**
   * Iterates over this sequence and executes a function for every element.
   *
   * @public
   * @aka forEach
   * @param {Function} fn The function to call on each element in the sequence.
   *     Return false from the function to end the iteration.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).each(fn) // calls fn 4 times
   */
  Sequence.prototype.each = function each(fn) {
    var iterator = this.getIterator(),
        i = -1;

    while (iterator.moveNext()) {
      if (fn(iterator.current(), ++i) === false) {
        return false;
      }
    }

    return true;
  };

  Sequence.prototype.forEach = function forEach(fn) {
    return this.each(fn);
  };

  /**
   * Creates a new sequence whose values are calculated by passing this sequence's
   * elements through some mapping function.
   *
   * @public
   * @aka collect
   * @param {Function} mapFn The mapping function used to project this sequence's
   *     elements onto a new sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([]).map(increment)        // sequence: []
   * Lazy([1, 2, 3]).map(increment) // sequence: [2, 3, 4]
   *
   * @benchmarks
   * function increment(x) { return x + 1; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).map(increment).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).map(increment).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.map(smArr, increment), _.noop)    // lodash - 10 elements
   * _.each(_.map(lgArr, increment), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.map = function map(mapFn) {
    return new MappedSequence(this, createCallback(mapFn));
  };

  Sequence.prototype.collect = function collect(mapFn) {
    return this.map(mapFn);
  };

  /**
   * @constructor
   */
  function MappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedSequence.prototype = new Sequence();

  MappedSequence.prototype.getIterator = function getIterator() {
    return new MappingIterator(this.parent, this.mapFn);
  };

  MappedSequence.prototype.each = function each(fn) {
    var mapFn = this.mapFn;
    return this.parent.each(function(e, i) {
      return fn(mapFn(e, i), i);
    });
  };

  /**
   * @constructor
   */
  function MappingIterator(sequence, mapFn) {
    this.iterator = sequence.getIterator();
    this.mapFn    = mapFn;
    this.index    = -1;
  }

  MappingIterator.prototype.current = function current() {
    return this.mapFn(this.iterator.current(), this.index);
  };

  MappingIterator.prototype.moveNext = function moveNext() {
    if (this.iterator.moveNext()) {
      ++this.index;
      return true;
    }

    return false;
  };

  /**
   * Creates a new sequence whose values are calculated by accessing the specified
   * property from each element in this sequence.
   *
   * @public
   * @param {string} propertyName The name of the property to access for every
   *     element in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).pluck("last") // sequence: ["Tao", "Smith"]
   */
  Sequence.prototype.pluck = function pluck(property) {
    return this.map(property);
  };

  /**
   * Creates a new sequence whose values are calculated by invoking the specified
   * function on each element in this sequence.
   *
   * @public
   * @param {string} methodName The name of the method to invoke for every element
   *     in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function Person(first, last) {
   *   this.fullName = function fullName() {
   *     return first + " " + last;
   *   };
   * }
   *
   * var people = [
   *   new Person("Dan", "Tao"),
   *   new Person("Bob", "Smith")
   * ];
   *
   * Lazy(people).invoke("fullName") // sequence: ["Dan Tao", "Bob Smith"]
   */
  Sequence.prototype.invoke = function invoke(methodName) {
    return this.map(function(e) {
      return e[methodName]();
    });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence which
   * satisfy the specified predicate.
   *
   * @public
   * @aka select
   * @param {Function} filterFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be included.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5, 6];
   *
   * Lazy(numbers).filter(isEven) // sequence: [2, 4, 6]
   *
   * @benchmarks
   * function isEven(x) { return x % 2 === 0; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).filter(isEven).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).filter(isEven).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.filter(smArr, isEven), _.noop)    // lodash - 10 elements
   * _.each(_.filter(lgArr, isEven), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.filter = function filter(filterFn) {
    return new FilteredSequence(this, createCallback(filterFn));
  };

  Sequence.prototype.select = function select(filterFn) {
    return this.filter(filterFn);
  };

  /**
   * @constructor
   */
  function FilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredSequence.prototype = new Sequence();

  FilteredSequence.prototype.getIterator = function getIterator() {
    return new FilteringIterator(this.parent, this.filterFn);
  };

  FilteredSequence.prototype.each = function each(fn) {
    var filterFn = this.filterFn;

    return this.parent.each(function(e, i) {
      if (filterFn(e, i)) {
        return fn(e, i);
      }
    });
  };

  FilteredSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().filter(this.filterFn);
  };

  /**
   * @constructor
   */
  function FilteringIterator(sequence, filterFn) {
    this.iterator = sequence.getIterator();
    this.filterFn = filterFn;
    this.index    = 0;
  }

  FilteringIterator.prototype.current = function current() {
    return this.value;
  };

  FilteringIterator.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        filterFn = this.filterFn,
        value;

    while (iterator.moveNext()) {
      value = iterator.current();
      if (filterFn(value, this.index++)) {
        this.value = value;
        return true;
      }
    }

    this.value = undefined;
    return false;
  };

  /**
   * Creates a new sequence whose values exclude the elements of this sequence
   * identified by the specified predicate.
   *
   * @public
   * @param {Function} rejectFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be omitted.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).reject(isEven)              // sequence: [1, 3, 5]
   * Lazy([{ foo: 1 }, { bar: 2 }]).reject('foo')      // sequence: [{ bar: 2 }]
   * Lazy([{ foo: 1 }, { foo: 2 }]).reject({ foo: 2 }) // sequence: [{ foo: 1 }]
   */
  Sequence.prototype.reject = function reject(rejectFn) {
    rejectFn = createCallback(rejectFn);
    return this.filter(function(e) { return !rejectFn(e); });
  };

  /**
   * Creates a new sequence whose values have the specified type, as determined
   * by the `typeof` operator.
   *
   * @public
   * @param {string} type The type of elements to include from the underlying
   *     sequence, i.e. where `typeof [element] === [type]`.
   * @returns {Sequence} The new sequence, comprising elements of the specified
   *     type.
   *
   * @examples
   * Lazy([1, 2, 'foo', 'bar']).ofType('number')  // sequence: [1, 2]
   * Lazy([1, 2, 'foo', 'bar']).ofType('string')  // sequence: ['foo', 'bar']
   * Lazy([1, 2, 'foo', 'bar']).ofType('boolean') // sequence: []
   */
  Sequence.prototype.ofType = function ofType(type) {
    return this.filter(function(e) { return typeof e === type; });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence with
   * property names and values matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on every
   *     element that is to be included in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).where({ first: "Dan" }) // sequence: [{ first: "Dan", last: "Tao" }]
   *
   * @benchmarks
   * var animals = ["dog", "cat", "mouse", "horse", "pig", "snake"];
   *
   * Lazy(animals).where({ length: 3 }).each(Lazy.noop) // lazy
   * _.each(_.where(animals, { length: 3 }), _.noop)    // lodash
   */
  Sequence.prototype.where = function where(properties) {
    return this.filter(properties);
  };

  /**
   * Creates a new sequence with the same elements as this one, but to be iterated
   * in the opposite order.
   *
   * Note that in some (but not all) cases, the only way to create such a sequence
   * may require iterating the entire underlying source when `each` is called.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // sequence: [3, 2, 1]
   * Lazy([]).reverse()        // sequence: []
   */
  Sequence.prototype.reverse = function reverse() {
    return new ReversedSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedSequence(parent) {
    this.parent = parent;
  }

  ReversedSequence.prototype = new Sequence();

  ReversedSequence.prototype.getIterator = function getIterator() {
    return new ReversedIterator(this.parent);
  };

  /**
   * @constuctor
   */
  function ReversedIterator(sequence) {
    this.sequence = sequence;
  }

  ReversedIterator.prototype.current = function current() {
    return this.sequence.getIndex().get(this.index);
  };

  ReversedIterator.prototype.moveNext = function moveNext() {
    var indexed = this.sequence.getIndex(),
        length  = indexed.length();

    if (typeof this.index === "undefined") {
      this.index = length;
    }

    return (--this.index >= 0);
  };

  /**
   * Creates a new sequence with all of the elements of this one, plus those of
   * the given array(s).
   *
   * @public
   * @param {...*} var_args One or more values (or arrays of values) to use for
   *     additional items after this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var left  = [1, 2, 3];
   * var right = [4, 5, 6];
   *
   * Lazy(left).concat(right)         // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(Lazy(right))   // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(right, [7, 8]) // sequence: [1, 2, 3, 4, 5, 6, 7, 8]
   */
  Sequence.prototype.concat = function concat(var_args) {
    return new ConcatenatedSequence(this, arraySlice.call(arguments, 0));
  };

  /**
   * @constructor
   */
  function ConcatenatedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ConcatenatedSequence.prototype = new Sequence();

  ConcatenatedSequence.prototype.each = function each(fn) {
    var done = false,
        i = 0;

    this.parent.each(function(e) {
      if (fn(e, i++) === false) {
        done = true;
        return false;
      }
    });

    if (!done) {
      Lazy(this.arrays).flatten().each(function(e) {
        if (fn(e, i++) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Creates a new sequence comprising the first N elements from this sequence, OR
   * (if N is `undefined`) simply returns the first element of this sequence.
   *
   * @public
   * @aka head, take
   * @param {number=} count The number of elements to take from this sequence. If
   *     this value exceeds the length of the sequence, the resulting sequence
   *     will be essentially the same as this one.
   * @returns {*} The new sequence (or the first element from this sequence if
   *     no count was given).
   *
   * @examples
   * function powerOfTwo(exp) {
   *   return Math.pow(2, exp);
   * }
   *
   * Lazy.generate(powerOfTwo).first()          // => 1
   * Lazy.generate(powerOfTwo).first(5)         // sequence: [1, 2, 4, 8, 16]
   * Lazy.generate(powerOfTwo).skip(2).first()  // => 4
   * Lazy.generate(powerOfTwo).skip(2).first(2) // sequence: [4, 8]
   */
  Sequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return getFirst(this);
    }
    return new TakeSequence(this, count);
  };

  Sequence.prototype.head =
  Sequence.prototype.take = function (count) {
    return this.first(count);
  };

  /**
   * @constructor
   */
  function TakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  TakeSequence.prototype = new Sequence();

  TakeSequence.prototype.getIterator = function getIterator() {
    return new TakeIterator(this.parent, this.count);
  };

  TakeSequence.prototype.each = function each(fn) {
    var count = this.count,
        i     = 0;

    this.parent.each(function(e) {
      var result;
      if (i < count) { result = fn(e, i); }
      if (++i >= count) { return false; }
      return result;
    });
  };

  /**
   * @constructor
   */
  function TakeIterator(sequence, count) {
    this.iterator = sequence.getIterator();
    this.count    = count;
  }

  TakeIterator.prototype.current = function current() {
    return this.iterator.current();
  };

  TakeIterator.prototype.moveNext = function moveNext() {
    return ((--this.count >= 0) && this.iterator.moveNext());
  };

  /**
   * Creates a new sequence comprising the elements from the head of this sequence
   * that satisfy some predicate. Once an element is encountered that doesn't
   * satisfy the predicate, iteration will stop.
   *
   * @public
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   *
   * @examples
   * function lessThan(x) {
   *   return function(y) {
   *     return y < x;
   *   };
   * }
   *
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(3)) // sequence: [1, 2]
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(0)) // sequence: []
   */
  Sequence.prototype.takeWhile = function takeWhile(predicate) {
    return new TakeWhileSequence(this, predicate);
  };

  /**
   * @constructor
   */
  function TakeWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  TakeWhileSequence.prototype = new Sequence();

  TakeWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate;

    this.parent.each(function(e) {
      return predicate(e) && fn(e);
    });
  };

  /**
   * Creates a new sequence comprising all but the last N elements of this
   * sequence.
   *
   * @public
   * @param {number=} count The number of items to omit from the end of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).initial()                    // sequence: [1, 2, 3]
   * Lazy([1, 2, 3, 4]).initial(2)                   // sequence: [1, 2]
   * Lazy([1, 2, 3]).filter(Lazy.identity).initial() // sequence: [1, 2]
   */
  Sequence.prototype.initial = function initial(count) {
    if (typeof count === "undefined") {
      count = 1;
    }
    return this.take(this.getIndex().length() - count);
  };

  /**
   * Creates a new sequence comprising the last N elements of this sequence, OR
   * (if N is `undefined`) simply returns the last element of this sequence.
   *
   * @public
   * @param {number=} count The number of items to take from the end of the
   *     sequence.
   * @returns {*} The new sequence (or the last element from this sequence
   *     if no count was given).
   *
   * @examples
   * Lazy([1, 2, 3]).last()                 // => 3
   * Lazy([1, 2, 3]).last(2)                // sequence: [2, 3]
   * Lazy([1, 2, 3]).filter(isEven).last(2) // sequence: [2]
   */
  Sequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.reverse().first();
    }
    return this.reverse().take(count).reverse();
  };

  /**
   * Returns the first element in this sequence with property names and values
   * matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on some
   *     element in this sequence.
   * @returns {*} The found element, or `undefined` if none exists in this
   *     sequence.
   *
   * @examples
   * var words = ["foo", "bar"];
   *
   * Lazy(words).findWhere({ 0: "f" }); // => "foo"
   * Lazy(words).findWhere({ 0: "z" }); // => undefined
   */
  Sequence.prototype.findWhere = function findWhere(properties) {
    return this.where(properties).first();
  };

  /**
   * Creates a new sequence comprising all but the first N elements of this
   * sequence.
   *
   * @public
   * @aka skip, tail, rest
   * @param {number=} count The number of items to omit from the beginning of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).rest()  // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(0) // sequence: [1, 2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(2) // sequence: [3, 4]
   * Lazy([1, 2, 3, 4]).rest(5) // sequence: []
   */
  Sequence.prototype.rest = function rest(count) {
    return new DropSequence(this, count);
  };

  Sequence.prototype.skip =
  Sequence.prototype.tail =
  Sequence.prototype.drop = function drop(count) {
    return this.rest(count);
  };

  /**
   * @constructor
   */
  function DropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  DropSequence.prototype = new Sequence();

  DropSequence.prototype.each = function each(fn) {
    var count   = this.count,
        dropped = 0,
        i       = 0;

    this.parent.each(function(e) {
      if (dropped++ < count) { return; }
      return fn(e, i++);
    });
  };

  /**
   * Creates a new sequence comprising the elements from this sequence *after*
   * those that satisfy some predicate. The sequence starts with the first
   * element that does not match the predicate.
   *
   * @public
   * @aka skipWhile
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   */
  Sequence.prototype.dropWhile = function dropWhile(predicate) {
    return new DropWhileSequence(this, predicate);
  };

  Sequence.prototype.skipWhile = function skipWhile(predicate) {
    return this.dropWhile(predicate);
  };

  /**
   * @constructor
   */
  function DropWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  DropWhileSequence.prototype = new Sequence();

  DropWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate,
        done      = false;

    this.parent.each(function(e) {
      if (!done) {
        if (predicate(e)) {
          return;
        }

        done = true;
      }

      return fn(e);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, but ordered
   * according to the values returned by the specified function.
   *
   * @public
   * @param {Function} sortFn The function to call on the elements in this
   *     sequence, in order to sort them.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function population(country) {
   *   return country.pop;
   * }
   *
   * function area(country) {
   *   return country.sqkm;
   * }
   *
   * var countries = [
   *   { name: "USA", pop: 320000000, sqkm: 9600000 },
   *   { name: "Brazil", pop: 194000000, sqkm: 8500000 },
   *   { name: "Nigeria", pop: 174000000, sqkm: 924000 },
   *   { name: "China", pop: 1350000000, sqkm: 9700000 },
   *   { name: "Russia", pop: 143000000, sqkm: 17000000 },
   *   { name: "Australia", pop: 23000000, sqkm: 7700000 }
   * ];
   *
   * Lazy(countries).sortBy(population).last(3).pluck('name') // sequence: ["Brazil", "USA", "China"]
   * Lazy(countries).sortBy(area).last(3).pluck('name')       // sequence: ["USA", "China", "Russia"]
   *
   * @benchmarks
   * var randoms = Lazy.generate(Math.random).take(100).toArray();
   *
   * Lazy(randoms).sortBy(Lazy.identity).each(Lazy.noop) // lazy
   * _.each(_.sortBy(randoms, Lazy.identity), _.noop)    // lodash
   */
  Sequence.prototype.sortBy = function sortBy(sortFn) {
    return new SortedSequence(this, sortFn);
  };

  /**
   * @constructor
   */
  function SortedSequence(parent, sortFn) {
    this.parent = parent;
    this.sortFn = sortFn;
  }

  SortedSequence.prototype = new Sequence();

  SortedSequence.prototype.each = function each(fn) {
    var sortFn = createCallback(this.sortFn),
        sorted = this.parent.toArray(),
        i = -1;

    sorted.sort(function(x, y) { return compare(x, y, sortFn); });

    return forEach(sorted, fn);
  };

  /**
   * Creates a new {@link ObjectLikeSequence} comprising the elements in this
   * one, grouped together according to some key. The value associated with each
   * key in the resulting object-like sequence is an array containing all of
   * the elements in this sequence with that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to group them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).groupBy(oddOrEven)            // sequence: { odd: [1, 3, 5], even: [2, 4] }
   * Lazy(numbers).groupBy(oddOrEven).get("odd") // => [1, 3, 5]
   * Lazy(numbers).groupBy(oddOrEven).get("foo") // => undefined
   */
  Sequence.prototype.groupBy = function groupBy(keyFn) {
    return new GroupedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function GroupedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // GroupedSequence must have its prototype set after ObjectLikeSequence has
  // been fully initialized.

  /**
   * Creates a new {@link ObjectLikeSequence} containing the unique keys of all
   * the elements in this sequence, each paired with the number of elements
   * in this sequence having that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to count them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).countBy(oddOrEven)            // sequence: { odd: 3, even: 2 }
   * Lazy(numbers).countBy(oddOrEven).get("odd") // => 3
   * Lazy(numbers).countBy(oddOrEven).get("foo") // => undefined
   */
  Sequence.prototype.countBy = function countBy(keyFn) {
    return new CountedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function CountedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // CountedSequence, like GroupedSequence, must have its prototype set after
  // ObjectLikeSequence has been fully initialized.

  /**
   * Creates a new sequence with every unique element from this one appearing
   * exactly once (i.e., with duplicates removed).
   *
   * @public
   * @aka unique
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 2, 3, 3, 3]).uniq() // sequence: [1, 2, 3]
   *
   * @benchmarks
   * function randomOf(array) {
   *   return function() {
   *     return array[Math.floor(Math.random() * array.length)];
   *   };
   * }
   *
   * var mostUnique = Lazy.generate(randomOf(_.range(100)), 100).toArray(),
   *     someUnique = Lazy.generate(randomOf(_.range(50)), 100).toArray(),
   *     mostDupes  = Lazy.generate(randomOf(_.range(5)), 100).toArray();
   *
   * Lazy(mostUnique).uniq().each(Lazy.noop) // lazy - mostly unique elements
   * Lazy(someUnique).uniq().each(Lazy.noop) // lazy - some unique elements
   * Lazy(mostDupes).uniq().each(Lazy.noop)  // lazy - mostly duplicate elements
   * _.each(_.uniq(mostUnique), _.noop)      // lodash - mostly unique elements
   * _.each(_.uniq(someUnique), _.noop)      // lodash - some unique elements
   * _.each(_.uniq(mostDupes), _.noop)       // lodash - mostly duplicate elements
   */
  Sequence.prototype.uniq = function uniq(keyFn) {
    return new UniqueSequence(this, keyFn);
  };

  Sequence.prototype.unique = function unique(keyFn) {
    return this.uniq(keyFn);
  };

  /**
   * @constructor
   */
  function UniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  UniqueSequence.prototype = new Sequence();

  UniqueSequence.prototype.each = function each(fn) {
    var cache = new Set(),
        keyFn = this.keyFn,
        i     = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      return this.parent.each(function(e) {
        if (cache.add(keyFn(e))) {
          return fn(e, i++);
        }
      });

    } else {
      return this.parent.each(function(e) {
        if (cache.add(e)) {
          return fn(e, i++);
        }
      });
    }
  };

  /**
   * Creates a new sequence by combining the elements from this sequence with
   * corresponding elements from the specified array(s).
   *
   * @public
   * @param {...Array} var_args One or more arrays of elements to combine with
   *     those of this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2]).zip([3, 4]) // sequence: [[1, 3], [2, 4]]
   *
   * @benchmarks
   * var smArrL = Lazy.range(10).toArray(),
   *     smArrR = Lazy.range(10, 20).toArray(),
   *     lgArrL = Lazy.range(100).toArray(),
   *     lgArrR = Lazy.range(100, 200).toArray();
   *
   * Lazy(smArrL).zip(smArrR).each(Lazy.noop) // lazy - zipping 10-element arrays
   * Lazy(lgArrL).zip(lgArrR).each(Lazy.noop) // lazy - zipping 100-element arrays
   * _.each(_.zip(smArrL, smArrR), _.noop)    // lodash - zipping 10-element arrays
   * _.each(_.zip(lgArrL, lgArrR), _.noop)    // lodash - zipping 100-element arrays
   */
  Sequence.prototype.zip = function zip(var_args) {
    if (arguments.length === 1) {
      return new SimpleZippedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new ZippedSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function ZippedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ZippedSequence.prototype = new Sequence();

  ZippedSequence.prototype.each = function each(fn) {
    var arrays = this.arrays,
        i = 0;
    this.parent.each(function(e) {
      var group = [e];
      for (var j = 0; j < arrays.length; ++j) {
        if (arrays[j].length > i) {
          group.push(arrays[j][i]);
        }
      }
      return fn(group, i++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, in a randomized
   * order.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).shuffle() // the values [1, 2, 3, 4, 5] in any order
   */
  Sequence.prototype.shuffle = function shuffle() {
    return new ShuffledSequence(this);
  };

  /**
   * @constructor
   */
  function ShuffledSequence(parent) {
    this.parent = parent;
  }

  ShuffledSequence.prototype = new Sequence();

  ShuffledSequence.prototype.each = function each(fn) {
    var shuffled = this.parent.toArray(),
        floor = Math.floor,
        random = Math.random,
        j = 0;

    for (var i = shuffled.length - 1; i > 0; --i) {
      swap(shuffled, i, floor(random() * i) + 1);
      if (fn(shuffled[i], j++) === false) {
        return;
      }
    }
    fn(shuffled[0], j);
  };

  /**
   * Creates a new sequence with every element from this sequence, and with arrays
   * exploded so that a sequence of arrays (of arrays) becomes a flat sequence of
   * values.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, [2, 3], [4, [5]]]).flatten() // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, Lazy([2, 3])]).flatten()     // sequence: [1, 2, 3]
   */
  Sequence.prototype.flatten = function flatten() {
    return new FlattenedSequence(this);
  };

  /**
   * @constructor
   */
  function FlattenedSequence(parent) {
    this.parent = parent;
  }

  FlattenedSequence.prototype = new Sequence();

  FlattenedSequence.prototype.each = function each(fn) {
    var index = 0;

    return this.parent.each(function recurseVisitor(e) {
      if (e instanceof Array) {
        return forEach(e, recurseVisitor);
      }

      if (e instanceof Sequence) {
        return e.each(recurseVisitor);
      }

      return fn(e, index++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, except for all
   * falsy values (`false`, `0`, `""`, `null`, and `undefined`).
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", null, "bar", undefined]).compact() // sequence: ["foo", "bar"]
   */
  Sequence.prototype.compact = function compact() {
    return this.filter(function(e) { return !!e; });
  };

  /**
   * Creates a new sequence with all the elements of this sequence that are not
   * also among the specified arguments.
   *
   * @public
   * @aka difference
   * @param {...*} var_args The values, or array(s) of values, to be excluded from the
   *     resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).without(2, 3)   // sequence: [1, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).without([4, 5]) // sequence: [1, 2, 3]
   */
  Sequence.prototype.without = function without(var_args) {
    return new WithoutSequence(this, arraySlice.call(arguments, 0));
  };

  Sequence.prototype.difference = function difference(var_args) {
    return this.without.apply(this, arguments);
  };

  /**
   * @constructor
   */
  function WithoutSequence(parent, values) {
    this.parent = parent;
    this.values = values;
  }

  WithoutSequence.prototype = new Sequence();

  WithoutSequence.prototype.each = function each(fn) {
    var set = createSet(this.values),
        i = 0;
    return this.parent.each(function(e) {
      if (!set.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  /**
   * Creates a new sequence with all the unique elements either in this sequence
   * or among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, to be additionally
   *     included in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).union([])             // sequence: ["foo", "bar"]
   * Lazy(["foo", "bar"]).union(["bar", "baz"]) // sequence: ["foo", "bar", "baz"]
   */
  Sequence.prototype.union = function union(var_args) {
    return this.concat(var_args).uniq();
  };

  /**
   * Creates a new sequence with all the elements of this sequence that also
   * appear among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, in which elements
   *     from this sequence must also be included to end up in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).intersection([])             // sequence: []
   * Lazy(["foo", "bar"]).intersection(["bar", "baz"]) // sequence: ["bar"]
   */
  Sequence.prototype.intersection = function intersection(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new SimpleIntersectionSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new IntersectionSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function IntersectionSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  IntersectionSequence.prototype = new Sequence();

  IntersectionSequence.prototype.each = function each(fn) {
    var sets = Lazy(this.arrays).map(function(values) {
      return new UniqueMemoizer(Lazy(values).getIterator());
    });

    var setIterator = new UniqueMemoizer(sets.getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      var includedInAll = true;
      setIterator.each(function(set) {
        if (!set.contains(e)) {
          includedInAll = false;
          return false;
        }
      });

      if (includedInAll) {
        return fn(e, i++);
      }
    });
  };

  /**
   * @constructor
   */
  function UniqueMemoizer(iterator) {
    this.iterator     = iterator;
    this.set          = new Set();
    this.memo         = [];
    this.currentValue = undefined;
  }

  UniqueMemoizer.prototype.current = function current() {
    return this.currentValue;
  };

  UniqueMemoizer.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        set = this.set,
        memo = this.memo,
        current;

    while (iterator.moveNext()) {
      current = iterator.current();
      if (set.add(current)) {
        memo.push(current);
        this.currentValue = current;
        return true;
      }
    }
    return false;
  };

  UniqueMemoizer.prototype.each = function each(fn) {
    var memo = this.memo,
        length = memo.length,
        i = -1;

    while (++i < length) {
      if (fn(memo[i], i) === false) {
        return false;
      }
    }

    while (this.moveNext()) {
      if (fn(this.currentValue, i++) === false) {
        break;
      }
    }
  };

  UniqueMemoizer.prototype.contains = function contains(e) {
    if (this.set.contains(e)) {
      return true;
    }

    while (this.moveNext()) {
      if (this.currentValue === e) {
        return true;
      }
    }

    return false;
  };

  /**
   * Checks whether every element in this sequence satisfies a given predicate.
   *
   * @public
   * @aka all
   * @param {Function} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for every element in the
   *     sequence (or the sequence is empty). False if `predicate` returns false
   *     for at least one element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * var objects = [{ foo: true }, { foo: false, bar: true }];
   *
   * Lazy(numbers).every(isEven)     // => false
   * Lazy(numbers).every(isPositive) // => true
   * Lazy(objects).all('foo')        // => false
   * Lazy(objects).all('bar')        // => false
   */
  Sequence.prototype.every = function every(predicate) {
    predicate = createCallback(predicate);

    return this.each(function(e, i) {
      return !!predicate(e, i);
    });
  };

  Sequence.prototype.all = function all(predicate) {
    return this.every(predicate);
  };

  /**
   * Checks whether at least one element in this sequence satisfies a given
   * predicate (or, if no predicate is specified, whether the sequence contains at
   * least one element).
   *
   * @public
   * @aka any
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for at least one element
   *     in the sequence. False if `predicate` returns false for every element (or
   *     the sequence is empty).
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).some()           // => true
   * Lazy(numbers).some(isEven)     // => true
   * Lazy(numbers).some(isNegative) // => false
   * Lazy([]).some()                // => false
   */
  Sequence.prototype.some = function some(predicate) {
    predicate = createCallback(predicate, true);

    var success = false;
    this.each(function(e) {
      if (predicate(e)) {
        success = true;
        return false;
      }
    });
    return success;
  };

  Sequence.prototype.any = function any(predicate) {
    return this.some(predicate);
  };

  /**
   * Checks whether NO elements in this sequence satisfy the given predicate
   * (the opposite of {@link Sequence#all}, basically).
   *
   * @public
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` does not return true for any element
   *     in the sequence. False if `predicate` returns true for at least one
   *     element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).none()           // => false
   * Lazy(numbers).none(isEven)     // => false
   * Lazy(numbers).none(isNegative) // => true
   * Lazy([]).none(isEven)          // => true
   * Lazy([]).none(isNegative)      // => true
   * Lazy([]).none()                // => true
   */
  Sequence.prototype.none = function none(predicate) {
    return !this.any(predicate);
  };

  /**
   * Checks whether the sequence has no elements.
   *
   * @public
   * @returns {boolean} True if the sequence is empty, false if it contains at
   *     least one element.
   *
   * @examples
   * Lazy([]).isEmpty()        // => true
   * Lazy([1, 2, 3]).isEmpty() // => false
   */
  Sequence.prototype.isEmpty = function isEmpty() {
    return !this.any();
  };

  /**
   * Performs (at worst) a linear search from the head of this sequence,
   * returning the first index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The index within this sequence where the given value is
   *     located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * function reciprocal(x) { return 1 / x; }
   *
   * Lazy(["foo", "bar", "baz"]).indexOf("bar")   // => 1
   * Lazy([1, 2, 3]).indexOf(4)                   // => -1
   * Lazy([1, 2, 3]).map(reciprocal).indexOf(0.5) // => 1
   */
  Sequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;
    this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });
    return foundIndex;
  };

  /**
   * Performs (at worst) a linear search from the tail of this sequence,
   * returning the last index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The last index within this sequence where the given value
   *     is located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * Lazy(["a", "b", "c", "b", "a"]).lastIndexOf("b")    // => 3
   * Lazy([1, 2, 3]).lastIndexOf(0)                      // => -1
   * Lazy([2, 2, 1, 2, 4]).filter(isEven).lastIndexOf(2) // 2
   */
  Sequence.prototype.lastIndexOf = function lastIndexOf(value) {
    var index = this.reverse().indexOf(value);
    if (index !== -1) {
      index = this.getIndex().length() - index - 1;
    }
    return index;
  };

  /**
   * Performs a binary search of this sequence, returning the lowest index where
   * the given value is either found, or where it belongs (if it is not already
   * in the sequence).
   *
   * This method assumes the sequence is in sorted order and will fail otherwise.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} An index within this sequence where the given value is
   *     located, or where it belongs in sorted order.
   *
   * @examples
   * Lazy([1, 3, 6, 9]).sortedIndex(3)                    // => 1
   * Lazy([1, 3, 6, 9]).sortedIndex(7)                    // => 3
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(10) // => 0
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(12) // => 1
   */
  Sequence.prototype.sortedIndex = function sortedIndex(value) {
    var indexed = this.getIndex(),
        lower   = 0,
        upper   = indexed.length(),
        i;

    while (lower < upper) {
      i = (lower + upper) >>> 1;
      if (compare(indexed.get(i), value) === -1) {
        lower = i + 1;
      } else {
        upper = i;
      }
    }
    return lower;
  };

  /**
   * Checks whether the given value is in this sequence.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {boolean} True if the sequence contains the value, false if not.
   *
   * @examples
   * var numbers = [5, 10, 15, 20];
   *
   * Lazy(numbers).contains(15) // => true
   * Lazy(numbers).contains(13) // => false
   */
  Sequence.prototype.contains = function contains(value) {
    return this.indexOf(value) !== -1;
  };

  /**
   * Aggregates a sequence into a single value according to some accumulator
   * function.
   *
   * @public
   * @aka inject, foldl
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*=} memo The starting value to use for the aggregated result
   *     (defaults to the first element in the sequence).
   * @returns {*} The result of the aggregation.
   *
   * @examples
   * function multiply(x, y) { return x * y; }
   *
   * var numbers = [1, 2, 3, 4];
   *
   * Lazy(numbers).reduce(multiply)    // => 24
   * Lazy(numbers).reduce(multiply, 5) // => 120
   */
  Sequence.prototype.reduce = function reduce(aggregator, memo) {
    if (arguments.length < 2) {
      return this.tail().reduce(aggregator, this.head());
    }
    this.each(function(e, i) {
      memo = aggregator(memo, e, i);
    });
    return memo;
  };

  Sequence.prototype.inject =
  Sequence.prototype.foldl = function foldl(aggregator, memo) {
    return this.reduce(aggregator, memo);
  };

  /**
   * Aggregates a sequence, from the tail, into a single value according to some
   * accumulator function.
   *
   * @public
   * @aka foldr
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*} memo The starting value to use for the aggregated result.
   * @returns {*} The result of the aggregation.
   *
   * @examples
   * function append(s1, s2) {
   *   return s1 + s2;
   * }
   *
   * function isVowel(str) {
   *   return "aeiou".indexOf(str) !== -1;
   * }
   *
   * Lazy("abcde").reduceRight(append)                 // => "edcba"
   * Lazy("abcde").filter(isVowel).reduceRight(append) // => "ea"
   */
  Sequence.prototype.reduceRight = function reduceRight(aggregator, memo) {
    if (arguments.length < 2) {
      return this.initial(1).reduceRight(aggregator, this.last());
    }

    // This bothers me... but frankly, calling reverse().reduce() is potentially
    // going to eagerly evaluate the sequence anyway; so it's really not an issue.
    var i = this.getIndex().length() - 1;
    return this.reverse().reduce(function(m, e) {
      return aggregator(m, e, i--);
    }, memo);
  };

  Sequence.prototype.foldr = function foldr(aggregator, memo) {
    return this.reduceRight(aggregator, memo);
  };

  /**
   * Groups this sequence into consecutive (overlapping) segments of a specified
   * length. If the underlying sequence has fewer elements than the specfied
   * length, then this sequence will be empty.
   *
   * @public
   * @param {number} length The length of each consecutive segment.
   * @returns {Sequence} The resulting sequence of consecutive segments.
   *
   * @examples
   * Lazy([]).consecutive(2)        // => sequence: []
   * Lazy([1]).consecutive(2)       // => sequence: []
   * Lazy([1, 2]).consecutive(2)    // => sequence: [[1, 2]]
   * Lazy([1, 2, 3]).consecutive(2) // => sequence: [[1, 2], [2, 3]]
   * Lazy([1, 2, 3]).consecutive(0) // => sequence: [[]]
   * Lazy([1, 2, 3]).consecutive(1) // => sequence: [[1], [2], [3]]
   */
  Sequence.prototype.consecutive = function consecutive(count) {
    var queue    = new Queue(count);
    var segments = this.map(function(element) {
      if (queue.add(element).count === count) {
        return queue.toArray();
      }
    });
    return segments.compact();
  };

  /**
   * Breaks this sequence into chunks (arrays) of a specified length.
   *
   * @public
   * @param {number} size The size of each chunk.
   * @returns {Sequence} The resulting sequence of chunks.
   *
   * @examples
   * Lazy([]).chunk(2)        // sequence: []
   * Lazy([1, 2, 3]).chunk(2) // sequence: [[1, 2], [3]]
   * Lazy([1, 2, 3]).chunk(1) // sequence: [[1], [2], [3]]
   * Lazy([1, 2, 3]).chunk(4) // sequence: [[1, 2, 3]]
   * Lazy([1, 2, 3]).chunk(0) // throws
   */
  Sequence.prototype.chunk = function chunk(size) {
    if (size < 1) {
      throw "You must specify a positive chunk size.";
    }

    return new ChunkedSequence(this, size);
  };

  /**
   * @constructor
   */
  function ChunkedSequence(parent, size) {
    this.parent    = parent;
    this.chunkSize = size;
  }

  ChunkedSequence.prototype = new Sequence();

  ChunkedSequence.prototype.getIterator = function getIterator() {
    return new ChunkedIterator(this.parent, this.chunkSize);
  };

  /**
   * @constructor
   */
  function ChunkedIterator(sequence, size) {
    this.iterator = sequence.getIterator();
    this.size     = size;
  }

  ChunkedIterator.prototype.current = function current() {
    return this.currentChunk;
  };

  ChunkedIterator.prototype.moveNext = function moveNext() {
    var iterator  = this.iterator,
        chunkSize = this.size,
        chunk     = [];

    while (chunk.length < chunkSize && iterator.moveNext()) {
      chunk.push(iterator.current());
    }

    if (chunk.length === 0) {
      return false;
    }

    this.currentChunk = chunk;
    return true;
  };

  /**
   * Passes each element in the sequence to the specified callback during
   * iteration. This is like {@link Sequence#each}, except that it can be
   * inserted anywhere in the middle of a chain of methods to "intercept" the
   * values in the sequence at that point.
   *
   * @public
   * @param {Function} callback A function to call on every element in the
   *     sequence during iteration. The return value of this function does not
   *     matter.
   * @returns {Sequence} A sequence comprising the same elements as this one.
   *
   * @examples
   * Lazy([1, 2, 3]).tap(fn).each(Lazy.noop); // calls fn 3 times
   */
  Sequence.prototype.tap = function tap(callback) {
    return new TappedSequence(this, callback);
  };

  /**
   * @constructor
   */
  function TappedSequence(parent, callback) {
    this.parent = parent;
    this.callback = callback;
  }

  TappedSequence.prototype = new Sequence();

  TappedSequence.prototype.each = function each(fn) {
    var callback = this.callback;
    return this.parent.each(function(e, i) {
      callback(e, i);
      return fn(e, i);
    });
  };

  /**
   * Seaches for the first element in the sequence satisfying a given predicate.
   *
   * @public
   * @aka detect
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {*} The first element in the sequence for which `predicate` returns
   *     `true`, or `undefined` if no such element is found.
   *
   * @examples
   * function divisibleBy3(x) {
   *   return x % 3 === 0;
   * }
   *
   * var numbers = [5, 6, 7, 8, 9, 10];
   *
   * Lazy(numbers).find(divisibleBy3) // => 6
   * Lazy(numbers).find(isNegative)   // => undefined
   */
  Sequence.prototype.find = function find(predicate) {
    return this.filter(predicate).first();
  };

  Sequence.prototype.detect = function detect(predicate) {
    return this.find(predicate);
  };

  /**
   * Gets the minimum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the lowest value in the sequence, or
   *     `Infinity` if the sequence is empty.
   *
   * @examples
   * function negate(x) { return x * -1; }
   *
   * Lazy([]).min()                       // => Infinity
   * Lazy([6, 18, 2, 49, 34]).min()       // => 2
   * Lazy([6, 18, 2, 49, 34]).min(negate) // => 49
   */
  Sequence.prototype.min = function min(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.minBy(valueFn);
    }

    return this.reduce(function(x, y) { return y < x ? y : x; }, Infinity);
  };

  Sequence.prototype.minBy = function minBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) < valueFn(x) ? y : x; });
  };

  /**
   * Gets the maximum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the highest value in the sequence, or
   *     `-Infinity` if the sequence is empty.
   *
   * @examples
   * function reverseDigits(x) {
   *   return Number(String(x).split('').reverse().join(''));
   * }
   *
   * Lazy([]).max()                              // => -Infinity
   * Lazy([6, 18, 2, 48, 29]).max()              // => 48
   * Lazy([6, 18, 2, 48, 29]).max(reverseDigits) // => 29
   */
  Sequence.prototype.max = function max(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.maxBy(valueFn);
    }

    return this.reduce(function(x, y) { return y > x ? y : x; }, -Infinity);
  };

  Sequence.prototype.maxBy = function maxBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) > valueFn(x) ? y : x; });
  };

  /**
   * Gets the sum of the values in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function used to select the values that will
   *     be summed up.
   * @returns {*} The sum.
   *
   * @examples
   * Lazy([]).sum()                     // => 0
   * Lazy([1, 2, 3, 4]).sum()           // => 10
   * Lazy([1.2, 3.4]).sum(Math.floor)   // => 4
   * Lazy(['foo', 'bar']).sum('length') // => 6
   */
  Sequence.prototype.sum = function sum(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.sumBy(valueFn);
    }

    return this.reduce(function(x, y) { return x + y; }, 0);
  };

  Sequence.prototype.sumBy = function sumBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return x + valueFn(y); }, 0);
  };

  /**
   * Creates a string from joining together all of the elements in this sequence,
   * separated by the given delimiter.
   *
   * @public
   * @aka toString
   * @param {string=} delimiter The separator to insert between every element from
   *     this sequence in the resulting string (defaults to `","`).
   * @returns {string} The delimited string.
   *
   * @examples
   * Lazy([6, 29, 1984]).join("/")  // => "6/29/1984"
   * Lazy(["a", "b", "c"]).join()   // => "a,b,c"
   * Lazy(["a", "b", "c"]).join("") // => "abc"
   * Lazy([1, 2, 3]).join()         // => "1,2,3"
   * Lazy([1, 2, 3]).join("")       // => "123"
   */
  Sequence.prototype.join = function join(delimiter) {
    delimiter = typeof delimiter === "string" ? delimiter : ",";

    return this.reduce(function(str, e) {
      if (str.length > 0) {
        str += delimiter;
      }
      return str + e;
    }, "");
  };

  Sequence.prototype.toString = function toString(delimiter) {
    return this.join(delimiter);
  };

  /**
   * Creates a sequence, with the same elements as this one, that will be iterated
   * over asynchronously when calling `each`.
   *
   * @public
   * @param {number=} interval The approximate period, in milliseconds, that
   *     should elapse between each element in the resulting sequence. Omitting
   *     this argument will result in the fastest possible asynchronous iteration.
   * @returns {AsyncSequence} The new asynchronous sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).async(100).each(fn) // calls fn 3 times asynchronously
   */
  Sequence.prototype.async = function async(interval) {
    return new AsyncSequence(this, interval);
  };

  /**
   * @constructor
   */
  function SimpleIntersectionSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
    this.each   = getEachForIntersection(array);
  }

  SimpleIntersectionSequence.prototype = new Sequence();

  SimpleIntersectionSequence.prototype.eachMemoizerCache = function eachMemoizerCache(fn) {
    var iterator = new UniqueMemoizer(Lazy(this.array).getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      if (iterator.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  SimpleIntersectionSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    var array = this.array,
        find  = arrayContains,
        i = 0;

    return this.parent.each(function(e) {
      if (find(array, e)) {
        return fn(e, i++);
      }
    });
  };

  function getEachForIntersection(source) {
    if (source.length < 40) {
      return SimpleIntersectionSequence.prototype.eachArrayCache;
    } else {
      return SimpleIntersectionSequence.prototype.eachMemoizerCache;
    }
  }

  /**
   * An optimized version of {@link ZippedSequence}, when zipping a sequence with
   * only one array.
   *
   * @param {Sequence} parent The underlying sequence.
   * @param {Array} array The array with which to zip the sequence.
   * @constructor
   */
  function SimpleZippedSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
  }

  SimpleZippedSequence.prototype = new Sequence();

  SimpleZippedSequence.prototype.each = function each(fn) {
    var array = this.array;
    return this.parent.each(function(e, i) {
      return fn([e, array[i]], i);
    });
  };

  /**
   * An `ArrayLikeSequence` is a {@link Sequence} that provides random access to
   * its elements. This extends the API for iterating with the additional methods
   * {@link #get} and {@link #length}, allowing a sequence to act as a "view" into
   * a collection or other indexed data source.
   *
   * The initial sequence created by wrapping an array with `Lazy(array)` is an
   * `ArrayLikeSequence`.
   *
   * All methods of `ArrayLikeSequence` that conceptually should return
   * something like a array (with indexed access) return another
   * `ArrayLikeSequence`.
   *
   * Defining custom array-like sequences
   * ------------------------------------
   *
   * Creating a custom `ArrayLikeSequence` is essentially the same as creating a
   * custom {@link Sequence}. You just have a couple more methods you need to
   * implement: `get` and (optionally) `length`.
   *
   * Here's an example. Let's define a sequence type called `OffsetSequence` that
   * offsets each of its parent's elements by a set distance, and circles back to
   * the beginning after reaching the end. **Remember**: the initialization
   * function you pass to {@link #define} should always accept a `parent` as its
   * first parameter.
   *
   *     ArrayLikeSequence.define("offset", {
   *       init: function(parent, offset) {
   *         this.offset = offset;
   *       },
   *
   *       get: function(i) {
   *         return this.parent.get((i + this.offset) % this.parent.length());
   *       }
   *     });
   *
   * It's worth noting a couple of things here.
   *
   * First, Lazy's default implementation of `length` simply returns the parent's
   * length. In this case, since an `OffsetSequence` will always have the same
   * number of elements as its parent, that implementation is fine; so we don't
   * need to override it.
   *
   * Second, the default implementation of `each` uses `get` and `length` to
   * essentially create a `for` loop, which is fine here. If you want to implement
   * `each` your own way, you can do that; but in most cases (as here), you can
   * probably just stick with the default.
   *
   * So we're already done, after only implementing `get`! Pretty easy, huh?
   *
   * Now the `offset` method will be chainable from any `ArrayLikeSequence`. So
   * for example:
   *
   *     Lazy([1, 2, 3]).map(mapFn).offset(3);
   *
   * ...will work, but:
   *
   *     Lazy([1, 2, 3]).filter(mapFn).offset(3);
   *
   * ...will not (because `filter` does not return an `ArrayLikeSequence`).
   *
   * (Also, as with the example provided for defining custom {@link Sequence}
   * types, this example really could have been implemented using a function
   * already available as part of Lazy.js: in this case, {@link Sequence#map}.)
   *
   * @public
   * @constructor
   *
   * @examples
   * Lazy([1, 2, 3])                    // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).take(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).drop(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).reverse()          // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).slice(1, 2)        // instanceof Lazy.ArrayLikeSequence
   */
  function ArrayLikeSequence() {}

  ArrayLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ArrayLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ArrayLikeSequence` prototype so that it can be chained with any other
   *     methods that return array-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `get`. *May* include `init`,
   *     `length`, `getIterator`, and `each`. For each function, `this` will be
   *     the new sequence and `this.parent` will be the source sequence.
   * @returns {Function} A constructor for a new type inheriting from
   *     `ArrayLikeSequence`.
   *
   * @examples
   * Lazy.ArrayLikeSequence.define("offset", {
   *   init: function(offset) {
   *     this.offset = offset;
   *   },
   *
   *   get: function(i) {
   *     return this.parent.get((i + this.offset) % this.parent.length());
   *   }
   * });
   *
   * Lazy([1, 2, 3]).offset(1) // sequence: [2, 3, 1]
   */
  ArrayLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw "A custom array-like sequence must implement *at least* get!";
    }

    return defineSequenceType(ArrayLikeSequence, methodName, overrides);
  };

  /**
   * Returns the element at the specified index.
   *
   * @public
   * @param {number} i The index to access.
   * @returns {*} The element.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([1, 2, 3]).get(1)                // => 2
   * Lazy([1, 2, 3]).get(-1)               // => undefined
   * Lazy([1, 2, 3]).map(increment).get(1) // => 3
   */
  ArrayLikeSequence.prototype.get = function get(i) {
    return this.parent.get(i);
  };

  /**
   * Returns the length of the sequence.
   *
   * @public
   * @returns {number} The length.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([]).length()                       // => 0
   * Lazy([1, 2, 3]).length()                // => 3
   * Lazy([1, 2, 3]).map(increment).length() // => 3
   */
  ArrayLikeSequence.prototype.length = function length() {
    return this.parent.length();
  };

  /**
   * Returns the current sequence (since it is already indexed).
   */
  ArrayLikeSequence.prototype.getIndex = function getIndex() {
    return this;
  };

  /**
   * An optimized version of {@link Sequence#getIterator}.
   */
  ArrayLikeSequence.prototype.getIterator = function getIterator() {
    return new IndexedIterator(this);
  };

  /**
   * An optimized version of {@link Iterator} meant to work with already-indexed
   * sequences.
   *
   * @param {ArrayLikeSequence} sequence The sequence to iterate over.
   * @constructor
   */
  function IndexedIterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  IndexedIterator.prototype.current = function current() {
    return this.sequence.get(this.index);
  };

  IndexedIterator.prototype.moveNext = function moveNext() {
    if (this.index >= this.sequence.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayLikeSequence.prototype.each = function each(fn) {
    var length = this.length(),
        i = -1;

    while (++i < length) {
      if (fn(this.get(i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the last
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).pop() // sequence: [1, 2]
   * Lazy([]).pop()        // sequence: []
   */
  ArrayLikeSequence.prototype.pop = function pop() {
    return this.initial();
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the first
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).shift() // sequence: [2, 3]
   * Lazy([]).shift()        // sequence: []
   */
  ArrayLikeSequence.prototype.shift = function shift() {
    return this.drop();
  };

  /**
   * Returns a new sequence comprising the portion of this sequence starting
   * from the specified starting index and continuing until the specified ending
   * index or to the end of the sequence.
   *
   * @public
   * @param {number} begin The index at which the new sequence should start.
   * @param {number=} end The index at which the new sequence should end.
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).slice(0)     // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2)     // sequence: [3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2, 4)  // sequence: [3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(-1)    // sequence: [5]
   * Lazy([1, 2, 3, 4, 5]).slice(1, -1) // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(0, 10) // sequence: [1, 2, 3, 4, 5]
   */
  ArrayLikeSequence.prototype.slice = function slice(begin, end) {
    var length = this.length();

    if (begin < 0) {
      begin = length + begin;
    }

    var result = this.drop(begin);

    if (typeof end === "number") {
      if (end < 0) {
        end = length + end;
      }
      result = result.take(end - begin);
    }

    return result;
  };

  /**
   * An optimized version of {@link Sequence#map}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.map = function map(mapFn) {
    return new IndexedMappedSequence(this, createCallback(mapFn));
  };

  /**
   * @constructor
   */
  function IndexedMappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  IndexedMappedSequence.prototype = new ArrayLikeSequence();

  IndexedMappedSequence.prototype.get = function get(i) {
    if (i < 0 || i >= this.parent.length()) {
      return undefined;
    }

    return this.mapFn(this.parent.get(i), i);
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayLikeSequence.prototype.filter = function filter(filterFn) {
    return new IndexedFilteredSequence(this, createCallback(filterFn));
  };

  /**
   * @constructor
   */
  function IndexedFilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  IndexedFilteredSequence.prototype = new FilteredSequence();

  IndexedFilteredSequence.prototype.each = function each(fn) {
    var parent = this.parent,
        filterFn = this.filterFn,
        length = this.parent.length(),
        i = -1,
        e;

    while (++i < length) {
      e = parent.get(i);
      if (filterFn(e, i) && fn(e, i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An optimized version of {@link Sequence#reverse}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.reverse = function reverse() {
    return new IndexedReversedSequence(this);
  };

  /**
   * @constructor
   */
  function IndexedReversedSequence(parent) {
    this.parent = parent;
  }

  IndexedReversedSequence.prototype = new ArrayLikeSequence();

  IndexedReversedSequence.prototype.get = function get(i) {
    return this.parent.get(this.length() - i - 1);
  };

  /**
   * An optimized version of {@link Sequence#first}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).first(2) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.get(0);
    }

    return new IndexedTakeSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedTakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  IndexedTakeSequence.prototype = new ArrayLikeSequence();

  IndexedTakeSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? this.count : parentLength;
  };

  /**
   * An optimized version of {@link Sequence#rest}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).rest() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.rest = function rest(count) {
    return new IndexedDropSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedDropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  IndexedDropSequence.prototype = new ArrayLikeSequence();

  IndexedDropSequence.prototype.get = function get(i) {
    return this.parent.get(this.count + i);
  };

  IndexedDropSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? parentLength - this.count : 0;
  };

  /**
   * An optimized version of {@link Sequence#concat} that returns another
   * {@link ArrayLikeSequence} *if* the argument is an array.
   *
   * @public
   * @param {...*} var_args
   *
   * @examples
   * Lazy([1, 2]).concat([3, 4]) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2]).concat([3, 4]) // sequence: [1, 2, 3, 4]
   */
  ArrayLikeSequence.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new IndexedConcatenatedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return Sequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * @constructor
   */
  function IndexedConcatenatedSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  IndexedConcatenatedSequence.prototype = new ArrayLikeSequence();

  IndexedConcatenatedSequence.prototype.get = function get(i) {
    var parentLength = this.parent.length();
    if (i < parentLength) {
      return this.parent.get(i);
    } else {
      return this.other[i - parentLength];
    }
  };

  IndexedConcatenatedSequence.prototype.length = function length() {
    return this.parent.length() + this.other.length;
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayLikeSequence.prototype.uniq = function uniq(keyFn) {
    return new IndexedUniqueSequence(this, createCallback(keyFn));
  };

  /**
   * @param {ArrayLikeSequence} parent
   * @constructor
   */
  function IndexedUniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForParent(parent);
    this.keyFn  = keyFn;
  }

  IndexedUniqueSequence.prototype = new Sequence();

  IndexedUniqueSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var parent = this.parent,
        keyFn  = this.keyFn,
        length = parent.length(),
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    while (++i < length) {
      value = parent.get(i);
      key = keyFn(value);
      if (!find(cache, key)) {
        cache.push(key);
        if (fn(value, j++) === false) {
          return false;
        }
      }
    }
  };

  IndexedUniqueSequence.prototype.eachSetCache = UniqueSequence.prototype.each;

  function getEachForParent(parent) {
    if (parent.length() < 100) {
      return IndexedUniqueSequence.prototype.eachArrayCache;
    } else {
      return UniqueSequence.prototype.each;
    }
  }

  // Now that we've fully initialized the ArrayLikeSequence prototype, we can
  // set the prototype for MemoizedSequence.

  MemoizedSequence.prototype = new ArrayLikeSequence();

  MemoizedSequence.prototype.cache = function cache() {
    return this.cachedResult || (this.cachedResult = this.parent.toArray());
  };

  MemoizedSequence.prototype.get = function get(i) {
    return this.cache()[i];
  };

  MemoizedSequence.prototype.length = function length() {
    return this.cache().length;
  };

  MemoizedSequence.prototype.slice = function slice(begin, end) {
    return this.cache().slice(begin, end);
  };

  MemoizedSequence.prototype.toArray = function toArray() {
    return this.cache().slice(0);
  };

  /**
   * ArrayWrapper is the most basic {@link Sequence}. It directly wraps an array
   * and implements the same methods as {@link ArrayLikeSequence}, but more
   * efficiently.
   *
   * @constructor
   */
  function ArrayWrapper(source) {
    this.source = source;
  }

  ArrayWrapper.prototype = new ArrayLikeSequence();

  ArrayWrapper.prototype.root = function root() {
    return this;
  };

  /**
   * Returns the element at the specified index in the source array.
   *
   * @param {number} i The index to access.
   * @returns {*} The element.
   */
  ArrayWrapper.prototype.get = function get(i) {
    return this.source[i];
  };

  /**
   * Returns the length of the source array.
   *
   * @returns {number} The length.
   */
  ArrayWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayWrapper.prototype.each = function each(fn) {
    return forEach(this.source, fn);
  };

  /**
   * An optimized version of {@link Sequence#map}.
   */
  ArrayWrapper.prototype.map =
  ArrayWrapper.prototype.collect = function collect(mapFn) {
    return new MappedArrayWrapper(this, createCallback(mapFn));
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayWrapper.prototype.filter =
  ArrayWrapper.prototype.select = function select(filterFn) {
    return new FilteredArrayWrapper(this, createCallback(filterFn));
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayWrapper.prototype.uniq =
  ArrayWrapper.prototype.unique = function unique(keyFn) {
    return new UniqueArrayWrapper(this, keyFn);
  };

  /**
   * An optimized version of {@link ArrayLikeSequence#concat}.
   *
   * @param {...*} var_args
   */
  ArrayWrapper.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new ConcatArrayWrapper(this, (/** @type {Array} */ var_args));
    } else {
      return ArrayLikeSequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * An optimized version of {@link Sequence#toArray}.
   */
  ArrayWrapper.prototype.toArray = function toArray() {
    return this.source.slice(0);
  };

  /**
   * @constructor
   */
  function MappedArrayWrapper(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedArrayWrapper.prototype = new ArrayLikeSequence();

  MappedArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source;

    if (i < 0 || i >= source.length) {
      return undefined;
    }

    return this.mapFn(source[i]);
  };

  MappedArrayWrapper.prototype.length = function length() {
    return this.parent.source.length;
  };

  MappedArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        length = source.length,
        mapFn  = this.mapFn,
        i = -1;

    while (++i < length) {
      if (fn(mapFn(source[i], i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function FilteredArrayWrapper(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredArrayWrapper.prototype = new FilteredSequence();

  FilteredArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        filterFn = this.filterFn,
        length = source.length,
        i = -1,
        e;

    while (++i < length) {
      e = source[i];
      if (filterFn(e, i) && fn(e, i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function UniqueArrayWrapper(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForSource(parent.source);
    this.keyFn  = keyFn;
  }

  UniqueArrayWrapper.prototype = new Sequence();

  UniqueArrayWrapper.prototype.eachNoCache = function eachNoCache(fn) {
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        find   = arrayContainsBefore,
        value,

        // Yes, this is hideous.
        // Trying to get performance first, will refactor next!
        i = -1,
        k = 0;

    while (++i < length) {
      value = source[i];
      if (!find(source, value, i, keyFn) && fn(value, k++) === false) {
        return false;
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < length) {
        value = source[i];
        key = keyFn(value);
        if (!find(cache, key)) {
          cache.push(key);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }

    } else {
      while (++i < length) {
        value = source[i];
        if (!find(cache, value)) {
          cache.push(value);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachSetCache = UniqueSequence.prototype.each;

  /**
   * My latest findings here...
   *
   * So I hadn't really given the set-based approach enough credit. The main issue
   * was that my Set implementation was totally not optimized at all. After pretty
   * heavily optimizing it (just take a look; it's a monstrosity now!), it now
   * becomes the fastest option for much smaller values of N.
   */
  function getEachForSource(source) {
    if (source.length < 40) {
      return UniqueArrayWrapper.prototype.eachNoCache;
    } else if (source.length < 100) {
      return UniqueArrayWrapper.prototype.eachArrayCache;
    } else {
      return UniqueArrayWrapper.prototype.eachSetCache;
    }
  }

  /**
   * @constructor
   */
  function ConcatArrayWrapper(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  ConcatArrayWrapper.prototype = new ArrayLikeSequence();

  ConcatArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source,
        sourceLength = source.length;

    if (i < sourceLength) {
      return source[i];
    } else {
      return this.other[i - sourceLength];
    }
  };

  ConcatArrayWrapper.prototype.length = function length() {
    return this.parent.source.length + this.other.length;
  };

  ConcatArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        sourceLength = source.length,
        other = this.other,
        otherLength = other.length,
        i = 0,
        j = -1;

    while (++j < sourceLength) {
      if (fn(source[j], i++) === false) {
        return false;
      }
    }

    j = -1;
    while (++j < otherLength) {
      if (fn(other[j], i++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An `ObjectLikeSequence` object represents a sequence of key/value pairs.
   *
   * The initial sequence you get by wrapping an object with `Lazy(object)` is
   * an `ObjectLikeSequence`.
   *
   * All methods of `ObjectLikeSequence` that conceptually should return
   * something like an object return another `ObjectLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * var obj = { foo: 'bar' };
   *
   * Lazy(obj).assign({ bar: 'baz' })   // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).defaults({ bar: 'baz' }) // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).invert()                 // instanceof Lazy.ObjectLikeSequence
   */
  function ObjectLikeSequence() {}

  ObjectLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ObjectLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ObjectLikeSequence` prototype so that it can be chained with any other
   *     methods that return object-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `each`. *May* include `init` and
   *     `get` (for looking up an element by key).
   * @returns {Function} A constructor for a new type inheriting from
   *     `ObjectLikeSequence`.
   *
   * @examples
   * function downcaseKey(value, key) {
   *   return [key.toLowerCase(), value];
   * }
   *
   * Lazy.ObjectLikeSequence.define("caseInsensitive", {
   *   init: function() {
   *     var downcased = this.parent
   *       .map(downcaseKey)
   *       .toObject();
   *     this.downcased = Lazy(downcased);
   *   },
   *
   *   get: function(key) {
   *     return this.downcased.get(key.toLowerCase());
   *   },
   *
   *   each: function(fn) {
   *     return this.downcased.each(fn);
   *   }
   * });
   *
   * Lazy({ Foo: 'bar' }).caseInsensitive()            // sequence: { foo: 'bar' }
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('foo') // => 'bar'
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('FOO') // => 'bar'
   */
  ObjectLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.each !== 'function') {
      throw "A custom object-like sequence must implement *at least* each!";
    }

    return defineSequenceType(ObjectLikeSequence, methodName, overrides);
  };

  ObjectLikeSequence.prototype.value = function value() {
    return this.toObject();
  };

  /**
   * Gets the element at the specified key in this sequence.
   *
   * @public
   * @param {string} key The key.
   * @returns {*} The element.
   *
   * @examples
   * Lazy({ foo: "bar" }).get("foo")                          // => "bar"
   * Lazy({ foo: "bar" }).extend({ foo: "baz" }).get("foo")   // => "baz"
   * Lazy({ foo: "bar" }).defaults({ bar: "baz" }).get("bar") // => "baz"
   * Lazy({ foo: "bar" }).invert().get("bar")                 // => "foo"
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("foo")        // => 1
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("bar")        // => undefined
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("bar")        // => 2
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("foo")        // => undefined
   */
  ObjectLikeSequence.prototype.get = function get(key) {
    var pair = this.pairs().find(function(pair) {
      return pair[0] === key;
    });

    return pair ? pair[1] : undefined;
  };

  /**
   * Returns a {@link Sequence} whose elements are the keys of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's keys.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).keys() // sequence: ["hello", "goodbye"]
   */
  ObjectLikeSequence.prototype.keys = function keys() {
    return this.map(function(v, k) { return k; });
  };

  /**
   * Returns a {@link Sequence} whose elements are the values of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's values.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).values() // sequence: ["hola", "hasta luego"]
   */
  ObjectLikeSequence.prototype.values = function values() {
    return this.map(function(v, k) { return v; });
  };

  /**
   * Throws an exception. Asynchronous iteration over object-like sequences is
   * not supported.
   *
   * @public
   * @examples
   * Lazy({ foo: 'bar' }).async() // throws
   */
  ObjectLikeSequence.prototype.async = function async() {
    throw 'An ObjectLikeSequence does not support asynchronous iteration.';
  };

  /**
   * Returns this same sequence. (Reversing an object-like sequence doesn't make
   * any sense.)
   */
  ObjectLikeSequence.prototype.reverse = function reverse() {
    return this;
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and another object. In the case of a key appearing in both this
   * sequence and the given object, the other object's value will override the
   * one in this sequence.
   *
   * @public
   * @aka extend
   * @param {Object} other The other object to assign to this sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence plus the contents of `other`.
   *
   * @examples
   * Lazy({ "uno": 1, "dos": 2 }).assign({ "tres": 3 }) // sequence: { uno: 1, dos: 2, tres: 3 }
   * Lazy({ foo: "bar" }).assign({ foo: "baz" });       // sequence: { foo: "baz" }
   */
  ObjectLikeSequence.prototype.assign = function assign(other) {
    return new AssignSequence(this, other);
  };

  ObjectLikeSequence.prototype.extend = function extend(other) {
    return this.assign(other);
  };

  /**
   * @constructor
   */
  function AssignSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  AssignSequence.prototype = new ObjectLikeSequence();

  AssignSequence.prototype.get = function get(key) {
    return this.other[key] || this.parent.get(key);
  };

  AssignSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    Lazy(this.other).each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      merged.add(key);
    });

    if (!done) {
      return this.parent.each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and a 'default' object. In the case of a key appearing in both
   * this sequence and the given object, this sequence's value will override the
   * default object's.
   *
   * @public
   * @param {Object} defaults The 'default' object to use for missing keys in this
   *     sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence supplemented by the contents of `defaults`.
   *
   * @examples
   * Lazy({ name: "Dan" }).defaults({ name: "User", password: "passw0rd" }) // sequence: { name: "Dan", password: "passw0rd" }
   */
  ObjectLikeSequence.prototype.defaults = function defaults(defaults) {
    return new DefaultsSequence(this, defaults);
  };

  /**
   * @constructor
   */
  function DefaultsSequence(parent, defaults) {
    this.parent   = parent;
    this.defaults = defaults;
  }

  DefaultsSequence.prototype = new ObjectLikeSequence();

  DefaultsSequence.prototype.get = function get(key) {
    return this.parent.get(key) || this.defaults[key];
  };

  DefaultsSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    this.parent.each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      if (typeof value !== "undefined") {
        merged.add(key);
      }
    });

    if (!done) {
      Lazy(this.defaults).each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose values are this sequence's keys,
   * and whose keys are this sequence's values.
   *
   * @public
   * @returns {ObjectLikeSequence} A new sequence comprising the inverted keys and
   *     values from this sequence.
   *
   * @examples
   * Lazy({ first: "Dan", last: "Tao" }).invert() // sequence: { Dan: "first", Tao: "last" }
   */
  ObjectLikeSequence.prototype.invert = function invert() {
    return new InvertedSequence(this);
  };

  /**
   * @constructor
   */
  function InvertedSequence(parent) {
    this.parent = parent;
  }

  InvertedSequence.prototype = new ObjectLikeSequence();

  InvertedSequence.prototype.each = function each(fn) {
    this.parent.each(function(value, key) {
      return fn(key, value);
    });
  };

  /**
   * Produces an {@link ObjectLikeSequence} consisting of all the recursively
   * merged values from this and the given object(s) or sequence(s).
   *
   * @public
   * @param {...Object|ObjectLikeSequence} others The other object(s) or
   *     sequence(s) whose values will be merged into this one.
   * @param {Function=} mergeFn An optional function used to customize merging
   *     behavior.
   * @returns {ObjectLikeSequence} The new sequence consisting of merged values.
   *
   * @examples
   * // These examples are completely stolen from Lo-Dash's documentation:
   * // lodash.com/docs#merge
   *
   * var names = {
   *   'characters': [
   *     { 'name': 'barney' },
   *     { 'name': 'fred' }
   *   ]
   * };
   *
   * var ages = {
   *   'characters': [
   *     { 'age': 36 },
   *     { 'age': 40 }
   *   ]
   * };
   *
   * var food = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var otherFood = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * function mergeArrays(a, b) {
   *   return Array.isArray(a) ? a.concat(b) : undefined;
   * }
   *
   * Lazy(names).merge(ages); // => sequence: { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
   * Lazy(food).merge(otherFood, mergeArrays); // => sequence: { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
   *
   * // ----- Now for my own tests: -----
   *
   * // merges objects
   * Lazy({ foo: 1 }).merge({ foo: 2 }); // => sequence: { foo: 2 }
   * Lazy({ foo: 1 }).merge({ bar: 2 }); // => sequence: { foo: 1, bar: 2 }
   *
   * // goes deep
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { bar: 2 } }); // => sequence: { foo: { bar: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   *
   * // gives precedence to later sources
   * Lazy({ foo: 1 }).merge({ bar: 2 }, { bar: 3 }); // => sequence: { foo: 1, bar: 3 }
   *
   * // undefined gets passed over
   * Lazy({ foo: 1 }).merge({ foo: undefined }); // => sequence: { foo: 1 }
   *
   * // null doesn't get passed over
   * Lazy({ foo: 1 }).merge({ foo: null }); // => sequence: { foo: null }
   *
   * // array contents get merged as well
   * Lazy({ foo: [{ bar: 1 }] }).merge({ foo: [{ baz: 2 }] }); // => sequence: { foo: [{ bar: 1, baz: 2}] }
   */
  ObjectLikeSequence.prototype.merge = function merge(var_args) {
    var mergeFn = arguments.length > 1 && typeof arguments[arguments.length - 1] === "function" ?
      arrayPop.call(arguments) : null;
    return new MergedSequence(this, arraySlice.call(arguments, 0), mergeFn);
  };

  /**
   * @constructor
   */
  function MergedSequence(parent, others, mergeFn) {
    this.parent  = parent;
    this.others  = others;
    this.mergeFn = mergeFn;
  }

  MergedSequence.prototype = new ObjectLikeSequence();

  MergedSequence.prototype.each = function each(fn) {
    var others  = this.others,
        mergeFn = this.mergeFn || mergeObjects,
        keys    = {};

    var iteratedFullSource = this.parent.each(function(value, key) {
      var merged = value;

      forEach(others, function(other) {
        if (key in other) {
          merged = mergeFn(merged, other[key]);
        }
      });

      keys[key] = true;

      return fn(merged, key);
    });

    if (iteratedFullSource === false) {
      return false;
    }

    var remaining = {};

    forEach(others, function(other) {
      for (var k in other) {
        if (!keys[k]) {
          remaining[k] = mergeFn(remaining[k], other[k]);
        }
      }
    });

    return Lazy(remaining).each(fn);
  };

  /**
   * @private
   * @examples
   * mergeObjects({ foo: 1 }, { bar: 2 }); // => { foo: 1, bar: 2 }
   * mergeObjects({ foo: { bar: 1 } }, { foo: { baz: 2 } }); // => { foo: { bar: 1, baz: 2 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: undefined }); // => { foo: { bar: 1 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: null }); // => { foo: null }
   */
  function mergeObjects(a, b) {
    if (typeof b === 'undefined') {
      return a;
    }

    // Unless we're dealing with two objects, there's no merging to do --
    // just replace a w/ b.
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return b;
    }

    var merged = {}, prop;
    for (prop in a) {
      merged[prop] = mergeObjects(a[prop], b[prop]);
    }
    for (prop in b) {
      if (!merged[prop]) {
        merged[prop] = b[prop];
      }
    }
    return merged;
  }

  /**
   * Creates a {@link Sequence} consisting of the keys from this sequence whose
   *     values are functions.
   *
   * @public
   * @aka methods
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var dog = {
   *   name: "Fido",
   *   breed: "Golden Retriever",
   *   bark: function() { console.log("Woof!"); },
   *   wagTail: function() { console.log("TODO: implement robotic dog interface"); }
   * };
   *
   * Lazy(dog).functions() // sequence: ["bark", "wagTail"]
   */
  ObjectLikeSequence.prototype.functions = function functions() {
    return this
      .filter(function(v, k) { return typeof(v) === "function"; })
      .map(function(v, k) { return k; });
  };

  ObjectLikeSequence.prototype.methods = function methods() {
    return this.functions();
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence whose keys are included in the given array of property names.
   *
   * @public
   * @param {Array} properties An array of the properties to "pick" from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).pick(["who", "what"]) // sequence: { who: "first", what: "second" }
   */
  ObjectLikeSequence.prototype.pick = function pick(properties) {
    return new PickSequence(this, properties);
  };

  /**
   * @constructor
   */
  function PickSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  PickSequence.prototype = new ObjectLikeSequence();

  PickSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? this.parent.get(key) : undefined;
  };

  PickSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence excluding those with the specified keys.
   *
   * @public
   * @param {Array} properties An array of the properties to *omit* from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).omit(["who", "what"]) // sequence: { "i don't know": "third" }
   */
  ObjectLikeSequence.prototype.omit = function omit(properties) {
    return new OmitSequence(this, properties);
  };

  /**
   * @constructor
   */
  function OmitSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  OmitSequence.prototype = new ObjectLikeSequence();

  OmitSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? undefined : this.parent.get(key);
  };

  OmitSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (!inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Maps the key/value pairs in this sequence to arrays.
   *
   * @public
   * @aka toArray
   * @returns {Sequence} An sequence of `[key, value]` pairs.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).pairs() // sequence: [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.pairs = function pairs() {
    return this.map(function(v, k) { return [k, v]; });
  };

  /**
   * Creates an array from the key/value pairs in this sequence.
   *
   * @public
   * @returns {Array} An array of `[key, value]` elements.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toArray() // => [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.toArray = function toArray() {
    return this.pairs().toArray();
  };

  /**
   * Creates an object with the key/value pairs from this sequence.
   *
   * @public
   * @returns {Object} An object with the same key/value pairs as this sequence.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toObject() // => { red: "#f00", green: "#0f0", blue: "#00f" }
   */
  ObjectLikeSequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, value, key) {
      object[key] = value;
      return object;
    }, {});
  };

  // Now that we've fully initialized the ObjectLikeSequence prototype, we can
  // actually set the prototype for GroupedSequence and CountedSequence.

  GroupedSequence.prototype = new ObjectLikeSequence();

  GroupedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        grouped = {};

    this.parent.each(function(e) {
      var key = keyFn(e);
      if (!grouped[key]) {
        grouped[key] = [e];
      } else {
        grouped[key].push(e);
      }
    });

    for (var key in grouped) {
      if (fn(grouped[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  CountedSequence.prototype = new ObjectLikeSequence();

  CountedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        counted = {};

    this.parent.each(function(e) {
      var key = keyFn(e);
      if (!counted[key]) {
        counted[key] = 1;
      } else {
        counted[key] += 1;
      }
    });

    for (var key in counted) {
      if (fn(counted[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Watches for all changes to a specified property (or properties) of an
   * object and produces a sequence whose elements have the properties
   * `{ property, value }` indicating which property changed and what it was
   * changed to.
   *
   * Note that this method **only works on directly wrapped objects**; it will
   * *not* work on any arbitrary {@link ObjectLikeSequence}.
   *
   * @public
   * @param {(string|Array)=} propertyNames A property name or array of property
   *     names to watch. If this parameter is `undefined`, all of the object's
   *     current (enumerable) properties will be watched.
   * @returns {Sequence} A sequence comprising `{ property, value }` objects
   *     describing each change to the specified property/properties.
   *
   * @examples
   * var obj = {},
   *     changes = [];
   *
   * Lazy(obj).watch('foo').each(function(change) {
   *   changes.push(change);
   * });
   *
   * obj.foo = 1;
   * obj.bar = 2;
   * obj.foo = 3;
   *
   * obj.foo; // => 3
   * changes; // => [{ property: 'foo', value: 1 }, { property: 'foo', value: 3 }]
   */
  ObjectLikeSequence.prototype.watch = function watch(propertyNames) {
    throw 'You can only call #watch on a directly wrapped object.';
  };

  /**
   * @constructor
   */
  function ObjectWrapper(source) {
    this.source = source;
  }

  ObjectWrapper.prototype = new ObjectLikeSequence();

  ObjectWrapper.prototype.root = function root() {
    return this;
  };

  ObjectWrapper.prototype.get = function get(key) {
    return this.source[key];
  };

  ObjectWrapper.prototype.each = function each(fn) {
    var source = this.source,
        key;

    for (key in source) {
      if (fn(source[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * A `StringLikeSequence` represents a sequence of characters.
   *
   * The initial sequence you get by wrapping a string with `Lazy(string)` is a
   * `StringLikeSequence`.
   *
   * All methods of `StringLikeSequence` that conceptually should return
   * something like a string return another `StringLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * function upcase(str) { return str.toUpperCase(); }
   *
   * Lazy('foo')               // instanceof Lazy.StringLikeSequence
   * Lazy('foo').toUpperCase() // instanceof Lazy.StringLikeSequence
   * Lazy('foo').reverse()     // instanceof Lazy.StringLikeSequence
   * Lazy('foo').take(2)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').drop(1)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').substring(1)  // instanceof Lazy.StringLikeSequence
   *
   * // Note that `map` does not create a `StringLikeSequence` because there's
   * // no guarantee the mapping function will return characters. In the event
   * // you do want to map a string onto a string-like sequence, use
   * // `mapString`:
   * Lazy('foo').map(Lazy.identity)       // instanceof Lazy.ArrayLikeSequence
   * Lazy('foo').mapString(Lazy.identity) // instanceof Lazy.StringLikeSequence
   */
  function StringLikeSequence() {}

  StringLikeSequence.prototype = new ArrayLikeSequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `StringLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `StringLikeSequence` prototype so that it can be chained with any other
   *     methods that return string-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. Has the same requirements as
   *     {@link ArrayLikeSequence.define}.
   * @returns {Function} A constructor for a new type inheriting from
   *     `StringLikeSequence`.
   *
   * @examples
   * Lazy.StringLikeSequence.define("zomg", {
   *   length: function() {
   *     return this.parent.length() + "!!ZOMG!!!1".length;
   *   },
   *
   *   get: function(i) {
   *     if (i < this.parent.length()) {
   *       return this.parent.get(i);
   *     }
   *     return "!!ZOMG!!!1".charAt(i - this.parent.length());
   *   }
   * });
   *
   * Lazy('foo').zomg() // sequence: "foo!!ZOMG!!!1"
   */
  StringLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw "A custom string-like sequence must implement *at least* get!";
    }

    return defineSequenceType(StringLikeSequence, methodName, overrides);
  };

  StringLikeSequence.prototype.value = function value() {
    return this.toString();
  };

  /**
   * Returns an {@link IndexedIterator} that will step over each character in this
   * sequence one by one.
   *
   * @returns {IndexedIterator} The iterator.
   */
  StringLikeSequence.prototype.getIterator = function getIterator() {
    return new CharIterator(this);
  };

  /**
   * @constructor
   */
  function CharIterator(source) {
    this.source = Lazy(source);
    this.index = -1;
  }

  CharIterator.prototype.current = function current() {
    return this.source.charAt(this.index);
  };

  CharIterator.prototype.moveNext = function moveNext() {
    return (++this.index < this.source.length());
  };

  /**
   * Returns the character at the given index of this sequence, or the empty
   * string if the specified index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of this sequence.
   * @returns {string} The character at the specified index.
   *
   * @examples
   * Lazy("foo").charAt(0)  // => "f"
   * Lazy("foo").charAt(-1) // => ""
   * Lazy("foo").charAt(10) // => ""
   */
  StringLikeSequence.prototype.charAt = function charAt(i) {
    return this.get(i);
  };

  /**
   * Returns the character code at the given index of this sequence, or `NaN` if
   * the index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of the character whose character code you want.
   * @returns {number} The character code.
   *
   * @examples
   * Lazy("abc").charCodeAt(0)  // => 97
   * Lazy("abc").charCodeAt(-1) // => NaN
   * Lazy("abc").charCodeAt(10) // => NaN
   */
  StringLikeSequence.prototype.charCodeAt = function charCodeAt(i) {
    var char = this.charAt(i);
    if (!char) { return NaN; }

    return char.charCodeAt(0);
  };

  /**
   * Returns a {@link StringLikeSequence} comprising the characters from *this*
   * sequence starting at `start` and ending at `stop` (exclusive), or---if
   * `stop` is `undefined`, including the rest of the sequence.
   *
   * @public
   * @param {number} start The index where this sequence should begin.
   * @param {number=} stop The index (exclusive) where this sequence should end.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * Lazy("foo").substring(1)      // sequence: "oo"
   * Lazy("foo").substring(-1)     // sequence: "foo"
   * Lazy("hello").substring(1, 3) // sequence: "el"
   * Lazy("hello").substring(1, 9) // sequence: "ello"
   */
  StringLikeSequence.prototype.substring = function substring(start, stop) {
    return new StringSegment(this, start, stop);
  };

  /**
   * @constructor
   */
  function StringSegment(parent, start, stop) {
    this.parent = parent;
    this.start  = Math.max(0, start);
    this.stop   = stop;
  }

  StringSegment.prototype = new StringLikeSequence();

  StringSegment.prototype.get = function get(i) {
    return this.parent.get(i + this.start);
  };

  StringSegment.prototype.length = function length() {
    return (typeof this.stop === "number" ? this.stop : this.parent.length()) - this.start;
  };

  /**
   * An optimized version of {@link Sequence#first} that returns another
   * {@link StringLikeSequence} (or just the first character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').first()                // => 'f'
   * Lazy('fo').first(2)                // sequence: 'fo'
   * Lazy('foo').first(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().first()  // => 'F'
   * Lazy('foo').toUpperCase().first(2) // sequence: 'FO'
   */
  StringLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.charAt(0);
    }

    return this.substring(0, count);
  };

  /**
   * An optimized version of {@link Sequence#last} that returns another
   * {@link StringLikeSequence} (or just the last character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').last()                // => 'o'
   * Lazy('foo').last(2)               // sequence: 'oo'
   * Lazy('foo').last(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().last()  // => 'O'
   * Lazy('foo').toUpperCase().last(2) // sequence: 'OO'
   */
  StringLikeSequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.charAt(this.length() - 1);
    }

    return this.substring(this.length() - count);
  };

  StringLikeSequence.prototype.drop = function drop(count) {
    return this.substring(count);
  };

  /**
   * Finds the index of the first occurrence of the given substring within this
   * sequence, starting from the specified index (or the beginning of the
   * sequence).
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The first index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').indexOf('a')    // => 1
   * Lazy('canal').indexOf('a', 2) // => 3
   * Lazy('canal').indexOf('ana')  // => 1
   * Lazy('canal').indexOf('andy') // => -1
   * Lazy('canal').indexOf('x')    // => -1
   */
  StringLikeSequence.prototype.indexOf = function indexOf(substring, startIndex) {
    return this.toString().indexOf(substring, startIndex);
  };

  /**
   * Finds the index of the last occurrence of the given substring within this
   * sequence, starting from the specified index (or the end of the sequence)
   * and working backwards.
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The last index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').lastIndexOf('a')    // => 3
   * Lazy('canal').lastIndexOf('a', 2) // => 1
   * Lazy('canal').lastIndexOf('ana')  // => 1
   * Lazy('canal').lastIndexOf('andy') // => -1
   * Lazy('canal').lastIndexOf('x')    // => -1
   */
  StringLikeSequence.prototype.lastIndexOf = function lastIndexOf(substring, startIndex) {
    return this.toString().lastIndexOf(substring, startIndex);
  };

  /**
   * Checks if this sequence contains a given substring.
   *
   * @public
   * @param {string} substring The substring to check for.
   * @returns {boolean} Whether or not this sequence contains `substring`.
   *
   * @examples
   * Lazy('hello').contains('ell') // => true
   * Lazy('hello').contains('')    // => true
   * Lazy('hello').contains('abc') // => false
   */
  StringLikeSequence.prototype.contains = function contains(substring) {
    return this.indexOf(substring) !== -1;
  };

  /**
   * Checks if this sequence ends with a given suffix.
   *
   * @public
   * @param {string} suffix The suffix to check for.
   * @returns {boolean} Whether or not this sequence ends with `suffix`.
   *
   * @examples
   * Lazy('foo').endsWith('oo')  // => true
   * Lazy('foo').endsWith('')    // => true
   * Lazy('foo').endsWith('abc') // => false
   */
  StringLikeSequence.prototype.endsWith = function endsWith(suffix) {
    return this.substring(this.length() - suffix.length).toString() === suffix;
  };

  /**
   * Checks if this sequence starts with a given prefix.
   *
   * @public
   * @param {string} prefix The prefix to check for.
   * @returns {boolean} Whether or not this sequence starts with `prefix`.
   *
   * @examples
   * Lazy('foo').startsWith('fo')  // => true
   * Lazy('foo').startsWith('')    // => true
   * Lazy('foo').startsWith('abc') // => false
   */
  StringLikeSequence.prototype.startsWith = function startsWith(prefix) {
    return this.substring(0, prefix.length).toString() === prefix;
  };

  /**
   * Converts all of the characters in this string to uppercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all uppercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('foo').toUpperCase()                       // sequence: 'FOO'
   * Lazy('foo').substring(1).toUpperCase()          // sequence: 'OO'
   * Lazy('abc').mapString(nextLetter).toUpperCase() // sequence: 'BCD'
   */
  StringLikeSequence.prototype.toUpperCase = function toUpperCase() {
    return this.mapString(function(char) { return char.toUpperCase(); });
  };

  /**
   * Converts all of the characters in this string to lowercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all lowercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('FOO').toLowerCase()                       // sequence: 'foo'
   * Lazy('FOO').substring(1).toLowerCase()          // sequence: 'oo'
   * Lazy('ABC').mapString(nextLetter).toLowerCase() // sequence: 'bcd'
   */
  StringLikeSequence.prototype.toLowerCase = function toLowerCase() {
    return this.mapString(function(char) { return char.toLowerCase(); });
  };

  /**
   * Maps the characters of this sequence onto a new {@link StringLikeSequence}.
   *
   * @public
   * @param {Function} mapFn The function used to map characters from this
   *     sequence onto the new sequence.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * function upcase(char) { return char.toUpperCase(); }
   *
   * Lazy("foo").mapString(upcase)               // sequence: "FOO"
   * Lazy("foo").mapString(upcase).charAt(0)     // => "F"
   * Lazy("foo").mapString(upcase).charCodeAt(0) // => 70
   * Lazy("foo").mapString(upcase).substring(1)  // sequence: "OO"
   */
  StringLikeSequence.prototype.mapString = function mapString(mapFn) {
    return new MappedStringLikeSequence(this, mapFn);
  };

  /**
   * @constructor
   */
  function MappedStringLikeSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedStringLikeSequence.prototype = new StringLikeSequence();
  MappedStringLikeSequence.prototype.get = IndexedMappedSequence.prototype.get;
  MappedStringLikeSequence.prototype.length = IndexedMappedSequence.prototype.length;

  /**
   * Returns a copy of this sequence that reads back to front.
   *
   * @public
   *
   * @examples
   * Lazy("abcdefg").reverse() // sequence: "gfedcba"
   */
  StringLikeSequence.prototype.reverse = function reverse() {
    return new ReversedStringLikeSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedStringLikeSequence(parent) {
    this.parent = parent;
  }

  ReversedStringLikeSequence.prototype = new StringLikeSequence();
  ReversedStringLikeSequence.prototype.get = IndexedReversedSequence.prototype.get;
  ReversedStringLikeSequence.prototype.length = IndexedReversedSequence.prototype.length;

  StringLikeSequence.prototype.toString = function toString() {
    return this.join("");
  };

  /**
   * Creates a {@link Sequence} comprising all of the matches for the specified
   * pattern in the underlying string.
   *
   * @public
   * @param {RegExp} pattern The pattern to match.
   * @returns {Sequence} A sequence of all the matches.
   *
   * @examples
   * Lazy("abracadabra").match(/a[bcd]/) // sequence: ["ab", "ac", "ad", "ab"]
   * Lazy("fee fi fo fum").match(/\w+/)  // sequence: ["fee", "fi", "fo", "fum"]
   * Lazy("hello").match(/xyz/)          // sequence: []
   */
  StringLikeSequence.prototype.match = function match(pattern) {
    return new StringMatchSequence(this.source, pattern);
  };

  /**
   * @constructor
   */
  function StringMatchSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  StringMatchSequence.prototype = new Sequence();

  StringMatchSequence.prototype.getIterator = function getIterator() {
    return new StringMatchIterator(this.source, this.pattern);
  };

  /**
   * @constructor
   */
  function StringMatchIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  StringMatchIterator.prototype.current = function current() {
    return this.match[0];
  };

  StringMatchIterator.prototype.moveNext = function moveNext() {
    return !!(this.match = this.pattern.exec(this.source));
  };

  /**
   * Creates a {@link Sequence} comprising all of the substrings of this string
   * separated by the given delimiter, which can be either a string or a regular
   * expression.
   *
   * @public
   * @param {string|RegExp} delimiter The delimiter to use for recognizing
   *     substrings.
   * @returns {Sequence} A sequence of all the substrings separated by the given
   *     delimiter.
   *
   * @examples
   * Lazy("foo").split("")                      // sequence: ["f", "o", "o"]
   * Lazy("yo dawg").split(" ")                 // sequence: ["yo", "dawg"]
   * Lazy("bah bah\tblack  sheep").split(/\s+/) // sequence: ["bah", "bah", "black", "sheep"]
   */
  StringLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStringSequence(this.source, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStringSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  SplitStringSequence.prototype = new Sequence();

  SplitStringSequence.prototype.getIterator = function getIterator() {
    if (this.pattern instanceof RegExp) {
      if (this.pattern.source === "" || this.pattern.source === "(?:)") {
        return new CharIterator(this.source);
      } else {
        return new SplitWithRegExpIterator(this.source, this.pattern);
      }
    } else if (this.pattern === "") {
      return new CharIterator(this.source);
    } else {
      return new SplitWithStringIterator(this.source, this.pattern);
    }
  };

  /**
   * @constructor
   */
  function SplitWithRegExpIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  SplitWithRegExpIterator.prototype.current = function current() {
    return this.source.substring(this.start, this.end);
  };

  SplitWithRegExpIterator.prototype.moveNext = function moveNext() {
    if (!this.pattern) {
      return false;
    }

    var match = this.pattern.exec(this.source);

    if (match) {
      this.start = this.nextStart ? this.nextStart : 0;
      this.end = match.index;
      this.nextStart = match.index + match[0].length;
      return true;

    } else if (this.pattern) {
      this.start = this.nextStart;
      this.end = undefined;
      this.nextStart = undefined;
      this.pattern = undefined;
      return true;
    }

    return false;
  };

  /**
   * @constructor
   */
  function SplitWithStringIterator(source, delimiter) {
    this.source = source;
    this.delimiter = delimiter;
  }

  SplitWithStringIterator.prototype.current = function current() {
    return this.source.substring(this.leftIndex, this.rightIndex);
  };

  SplitWithStringIterator.prototype.moveNext = function moveNext() {
    if (!this.finished) {
      this.leftIndex = typeof this.leftIndex !== "undefined" ?
        this.rightIndex + this.delimiter.length :
        0;
      this.rightIndex = this.source.indexOf(this.delimiter, this.leftIndex);
    }

    if (this.rightIndex === -1) {
      this.finished = true;
      this.rightIndex = undefined;
      return true;
    }

    return !this.finished;
  };

  /**
   * Wraps a string exposing {@link #match} and {@link #split} methods that return
   * {@link Sequence} objects instead of arrays, improving on the efficiency of
   * JavaScript's built-in `String#split` and `String.match` methods and
   * supporting asynchronous iteration.
   *
   * @param {string} source The string to wrap.
   * @constructor
   */
  function StringWrapper(source) {
    this.source = source;
  }

  StringWrapper.prototype = new StringLikeSequence();

  StringWrapper.prototype.root = function root() {
    return this;
  };

  StringWrapper.prototype.get = function get(i) {
    return this.source.charAt(i);
  };

  StringWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * A `GeneratedSequence` does not wrap an in-memory colllection but rather
   * determines its elements on-the-fly during iteration according to a generator
   * function.
   *
   * You create a `GeneratedSequence` by calling {@link Lazy.generate}.
   *
   * @public
   * @constructor
   * @param {function(number):*} generatorFn A function which accepts an index
   *     and returns a value for the element at that position in the sequence.
   * @param {number=} length The length of the sequence. If this argument is
   *     omitted, the sequence will go on forever.
   */
  function GeneratedSequence(generatorFn, length) {
    this.get = generatorFn;
    this.fixedLength = length;
  }

  GeneratedSequence.prototype = new Sequence();

  /**
   * Returns the length of this sequence.
   *
   * @public
   * @returns {number} The length, or `undefined` if this is an indefinite
   *     sequence.
   */
  GeneratedSequence.prototype.length = function length() {
    return this.fixedLength;
  };

  /**
   * Iterates over the sequence produced by invoking this sequence's generator
   * function up to its specified length, or, if length is `undefined`,
   * indefinitely (in which case the sequence will go on forever--you would need
   * to call, e.g., {@link Sequence#take} to limit iteration).
   *
   * @public
   * @param {Function} fn The function to call on each output from the generator
   *     function.
   */
  GeneratedSequence.prototype.each = function each(fn) {
    var generatorFn = this.get,
        length = this.fixedLength,
        i = 0;

    while (typeof length === "undefined" || i < length) {
      if (fn(generatorFn(i++)) === false) {
        return false;
      }
    }

    return true;
  };

  GeneratedSequence.prototype.getIterator = function getIterator() {
    return new GeneratedIterator(this);
  };

  /**
   * Iterates over a generated sequence. (This allows generated sequences to be
   * iterated asynchronously.)
   *
   * @param {GeneratedSequence} sequence The generated sequence to iterate over.
   * @constructor
   */
  function GeneratedIterator(sequence) {
    this.sequence     = sequence;
    this.index        = 0;
    this.currentValue = null;
  }

  GeneratedIterator.prototype.current = function current() {
    return this.currentValue;
  };

  GeneratedIterator.prototype.moveNext = function moveNext() {
    var sequence = this.sequence;

    if (typeof sequence.fixedLength === "number" && this.index >= sequence.fixedLength) {
      return false;
    }

    this.currentValue = sequence.get(this.index++);
    return true;
  };

  /**
   * An `AsyncSequence` iterates over its elements asynchronously when
   * {@link #each} is called.
   *
   * You get an `AsyncSequence` by calling {@link Sequence#async} on any
   * sequence. Note that some sequence types may not support asynchronous
   * iteration.
   *
   * Returning values
   * ----------------
   *
   * Because of its asynchronous nature, an `AsyncSequence` cannot be used in the
   * same way as other sequences for functions that return values directly (e.g.,
   * `reduce`, `max`, `any`, even `toArray`).
   *
   * Instead, these methods return an `AsyncHandle` whose `onComplete` method
   * accepts a callback that will be called with the final result once iteration
   * has finished.
   *
   * Defining custom asynchronous sequences
   * --------------------------------------
   *
   * There are plenty of ways to define an asynchronous sequence. Here's one.
   *
   * 1. First, implement an {@link Iterator}. This is an object whose prototype
   *    has the methods {@link Iterator#moveNext} (which returns a `boolean`) and
   *    {@link current} (which returns the current value).
   * 2. Next, create a simple wrapper that inherits from `AsyncSequence`, whose
   *    `getIterator` function returns an instance of the iterator type you just
   *    defined.
   *
   * The default implementation for {@link #each} on an `AsyncSequence` is to
   * create an iterator and then asynchronously call {@link Iterator#moveNext}
   * (using `setImmediate`, if available, otherwise `setTimeout`) until the iterator
   * can't move ahead any more.
   *
   * @public
   * @constructor
   * @param {Sequence} parent A {@link Sequence} to wrap, to expose asynchronous
   *     iteration.
   * @param {number=} interval How many milliseconds should elapse between each
   *     element when iterating over this sequence. If this argument is omitted,
   *     asynchronous iteration will be executed as fast as possible.
   */
  function AsyncSequence(parent, interval) {
    if (parent instanceof AsyncSequence) {
      throw "Sequence is already asynchronous!";
    }

    this.parent         = parent;
    this.interval       = interval;
    this.onNextCallback = getOnNextCallback(interval);
  }

  AsyncSequence.prototype = new Sequence();

  /**
   * Throws an exception. You cannot manually iterate over an asynchronous
   * sequence.
   *
   * @public
   * @example
   * Lazy([1, 2, 3]).async().getIterator() // throws
   */
  AsyncSequence.prototype.getIterator = function getIterator() {
    throw 'An AsyncSequence does not support synchronous iteration.';
  };

  /**
   * An asynchronous version of {@link Sequence#each}.
   *
   * @public
   * @param {Function} fn The function to invoke asynchronously on each element in
   *     the sequence one by one.
   * @returns {AsyncHandle} An {@link AsyncHandle} providing the ability to
   *     cancel the asynchronous iteration (by calling `cancel()`) as well as
   *     supply callback(s) for when an error is encountered (`onError`) or when
   *     iteration is complete (`onComplete`).
   */
  AsyncSequence.prototype.each = function each(fn) {
    var iterator = this.parent.getIterator(),
        onNextCallback = this.onNextCallback,
        i = 0;

    var handle = new AsyncHandle(this.interval);

    handle.id = onNextCallback(function iterate() {
      try {
        if (iterator.moveNext() && fn(iterator.current(), i++) !== false) {
          handle.id = onNextCallback(iterate);

        } else {
          handle.completeCallback();
        }

      } catch (e) {
        handle.errorCallback(e);
      }
    });

    return handle;
  };

  /**
   * An `AsyncHandle` provides control over an {@link AsyncSequence} that is
   * currently (or was) iterating over its elements asynchronously. In
   * particular it provides the ability to {@link AsyncHandle#cancel} the
   * iteration as well as execute a callback when either an error occurs or
   * iteration is complete with {@link AsyncHandle#onError} and
   * {@link AsyncHandle#onComplete}.
   *
   * @public
   * @constructor
   */
  function AsyncHandle(interval) {
    this.cancelCallback = getCancelCallback(interval);
  }

  /**
   * Cancels asynchronous iteration.
   *
   * @public
   */
  AsyncHandle.prototype.cancel = function cancel() {
    var cancelCallback = this.cancelCallback;

    if (this.id) {
      cancelCallback(this.id);
      this.id = null;
    }
  };

  /**
   * Updates the handle with a callback to execute if/when any error is
   * encountered during asynchronous iteration.
   *
   * @public
   * @param {Function} callback The function to call, with any associated error
   *     object, when an error occurs.
   */
  AsyncHandle.prototype.onError = function onError(callback) {
    this.errorCallback = callback;
  };

  AsyncHandle.prototype.errorCallback = Lazy.noop;

  /**
   * Updates the handle with a callback to execute when iteration is completed.
   *
   * @public
   * @param {Function} callback The function to call when the asynchronous
   *     iteration is completed.
   */
  AsyncHandle.prototype.onComplete = function onComplete(callback) {
    this.completeCallback = callback;
  };

  AsyncHandle.prototype.completeCallback = Lazy.noop;

  function getOnNextCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof setImmediate === "function") {
        return setImmediate;
      }
    }

    interval = interval || 0;
    return function(fn) {
      return setTimeout(fn, interval);
    };
  }

  function getCancelCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof clearImmediate === "function") {
        return clearImmediate;
      }
    }

    return clearTimeout;
  }

  /**
   * An async version of {@link Sequence#reverse}.
   */
  AsyncSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().async();
  };

  /**
   * A version of {@link Sequence#reduce} which, instead of immediately
   * returning a result (which it can't, obviously, because this is an
   * asynchronous sequence), returns an {@link AsyncHandle} whose `onComplete`
   * method can be called to supply a callback to handle the final result once
   * iteration has completed.
   *
   * @public
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*=} memo The starting value to use for the aggregated result
   *     (defaults to the first element in the sequence).
   * @returns {AsyncHandle} An {@link AsyncHandle} allowing you to cancel
   *     iteration and/or handle errors, with an added `then` method providing
   *     a promise-like thing allowing you to handle the result of aggregation.
   */
  AsyncSequence.prototype.reduce = function reduce(aggregator, memo) {
    var handle = this.each(function(e, i) {
      if (typeof memo === "undefined" && i === 0) {
        memo = e;
      } else {
        memo = aggregator(memo, e, i);
      }
    });

    handle.then = handle.onComplete = function(callback) {
      handle.completeCallback = function() {
        callback(memo);
      };
    };

    return handle;
  };

  /**
   * A version of {@link Sequence#find} which returns a promise-y
   * {@link AsyncHandle}.
   *
   * @public
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} allowing you to cancel
   *     iteration and/or handle errors, with an added `then` method providing
   *     a promise-like interface to handle the found element, once it is
   *     detected.
   */
  AsyncSequence.prototype.find = function find(predicate) {
    var found;

    var handle = this.each(function(e, i) {
      if (predicate(e, i)) {
        found = e;
        return false;
      }
    });

    handle.then = handle.onComplete = function(callback) {
      handle.completeCallback = function() {
        callback(found);
      };
    };

    return handle;
  };

  /**
   * A version of {@link Sequence#indexOf} which returns a promise-y
   * {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} with an added `then` method
   *     providing a promise-like interface to handle the found index, once it
   *     is detected, or -1.
   */
  AsyncSequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;

    var handle = this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });

    handle.then = handle.onComplete = function(callback) {
      handle.completeCallback = function() {
        callback(foundIndex);
      };
    };

    return handle;
  };

  /**
   * A version of {@link Sequence#contains} which returns a promise-y
   * {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} with an added `then` method
   *     providing a promise-like interface to handle the result (either `true`
   *     `false` to indicate whether the element was found).
   */
  AsyncSequence.prototype.contains = function contains(value) {
    var found = false;

    var handle = this.each(function(e) {
      if (e === value) {
        found = true;
        return false;
      }
    });

    handle.then = handle.onComplete = function(callback) {
      handle.completeCallback = function() {
        callback(found);
      };
    };

    return handle;
  };

  /**
   * Just return the same sequence for `AsyncSequence#async` (I see no harm in this).
   */
  AsyncSequence.prototype.async = function async() {
    return this;
  };

  /**
   * See {@link ObjectLikeSequence#watch} for docs.
   */
  ObjectWrapper.prototype.watch = function watch(propertyNames) {
    return new WatchedPropertySequence(this.source, propertyNames);
  };

  function WatchedPropertySequence(object, propertyNames) {
    this.listeners = [];

    if (!propertyNames) {
      propertyNames = Lazy(object).keys().toArray();
    } else if (!(propertyNames instanceof Array)) {
      propertyNames = [propertyNames];
    }

    var listeners = this.listeners,
        index     = 0;

    Lazy(propertyNames).each(function(propertyName) {
      var propertyValue = object[propertyName];

      Object.defineProperty(object, propertyName, {
        get: function() {
          return propertyValue;
        },

        set: function(value) {
          for (var i = listeners.length - 1; i >= 0; --i) {
            if (listeners[i]({ property: propertyName, value: value }, index) === false) {
              listeners.splice(i, 1);
            }
          }
          propertyValue = value;
          ++index;
        }
      });
    });
  }

  WatchedPropertySequence.prototype = new AsyncSequence();

  WatchedPropertySequence.prototype.each = function each(fn) {
    this.listeners.push(fn);
  };

  /**
   * A StreamLikeSequence comprises a sequence of 'chunks' of data, which are
   * typically multiline strings.
   *
   * @constructor
   */
  function StreamLikeSequence() {}

  StreamLikeSequence.prototype = new AsyncSequence();

  StreamLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStreamSequence(this, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStreamSequence(parent, delimiter) {
    this.parent    = parent;
    this.delimiter = delimiter;
  }

  SplitStreamSequence.prototype = new Sequence();

  SplitStreamSequence.prototype.each = function each(fn) {
    var delimiter = this.delimiter,
        done      = false,
        i         = 0;

    return this.parent.each(function(chunk) {
      Lazy(chunk).split(delimiter).each(function(piece) {
        if (fn(piece, i++) === false) {
          done = true;
          return false;
        }
      });

      return !done;
    });
  };

  StreamLikeSequence.prototype.lines = function lines() {
    return this.split("\n");
  };

  StreamLikeSequence.prototype.match = function match(pattern) {
    return new MatchedStreamSequence(this, pattern);
  };

  /**
   * @constructor
   */
  function MatchedStreamSequence(parent, pattern) {
    this.parent  = parent;
    this.pattern = cloneRegex(pattern);
  }

  MatchedStreamSequence.prototype = new AsyncSequence();

  MatchedStreamSequence.prototype.each = function each(fn) {
    var pattern = this.pattern,
        done      = false,
        i         = 0;

    return this.parent.each(function(chunk) {
      Lazy(chunk).match(pattern).each(function(match) {
        if (fn(match, i++) === false) {
          done = true;
          return false;
        }
      });

      return !done;
    });
  };

  /**
   * Defines a wrapper for custom {@link StreamLikeSequence}s. This is useful
   * if you want a way to handle a stream of events as a sequence, but you can't
   * use Lazy's existing interface (i.e., you're wrapping an object from a
   * library with its own custom events).
   *
   * This method defines a *factory*: that is, it produces a function that can
   * be used to wrap objects and return a {@link Sequence}. Hopefully the
   * example will make this clear.
   *
   * @public
   * @param {Function} initializer An initialization function called on objects
   *     created by this factory. `this` will be bound to the created object,
   *     which is an instance of {@link StreamLikeSequence}. Use `emit` to
   *     generate data for the sequence.
   * @returns {Function} A function that creates a new {@link StreamLikeSequence},
   *     initializes it using the specified function, and returns it.
   *
   * @example
   * var factory = Lazy.createWrapper(function(eventSource) {
   *   var sequence = this;
   *
   *   eventSource.handleEvent(function(data) {
   *     sequence.emit(data);
   *   });
   * });
   *
   * var eventEmitter = {
   *   triggerEvent: function(data) {
   *     eventEmitter.eventHandler(data);
   *   },
   *   handleEvent: function(handler) {
   *     eventEmitter.eventHandler = handler;
   *   },
   *   eventHandler: function() {}
   * };
   *
   * var events = [];
   *
   * factory(eventEmitter).each(function(e) {
   *   events.push(e);
   * });
   *
   * eventEmitter.triggerEvent('foo');
   * eventEmitter.triggerEvent('bar');
   *
   * events // => ['foo', 'bar']
   */
  Lazy.createWrapper = function createWrapper(initializer) {
    var ctor = function() {
      this.listeners = [];
    };

    ctor.prototype = new StreamLikeSequence();

    ctor.prototype.each = function(listener) {
      this.listeners.push(listener);
    };

    ctor.prototype.emit = function(data) {
      var listeners = this.listeners;

      for (var len = listeners.length, i = len - 1; i >= 0; --i) {
        if (listeners[i](data) === false) {
          listeners.splice(i, 1);
        }
      }
    };

    return function() {
      var sequence = new ctor();
      initializer.apply(sequence, arguments);
      return sequence;
    };
  };

  /**
   * Creates a {@link GeneratedSequence} using the specified generator function
   * and (optionally) length.
   *
   * @public
   * @param {function(number):*} generatorFn The function used to generate the
   *     sequence. This function accepts an index as a parameter and should return
   *     a value for that index in the resulting sequence.
   * @param {number=} length The length of the sequence, for sequences with a
   *     definite length.
   * @returns {GeneratedSequence} The generated sequence.
   *
   * @examples
   * var randomNumbers = Lazy.generate(Math.random);
   * var countingNumbers = Lazy.generate(function(i) { return i + 1; }, 5);
   *
   * randomNumbers          // instanceof Lazy.GeneratedSequence
   * randomNumbers.length() // => undefined
   * countingNumbers          // sequence: [1, 2, 3, 4, 5]
   * countingNumbers.length() // => 5
   */
  Lazy.generate = function generate(generatorFn, length) {
    return new GeneratedSequence(generatorFn, length);
  };

  /**
   * Creates a sequence from a given starting value, up to a specified stopping
   * value, incrementing by a given step.
   *
   * @public
   * @returns {GeneratedSequence} The sequence defined by the given ranges.
   *
   * @examples
   * Lazy.range(3)         // sequence: [0, 1, 2]
   * Lazy.range(1, 4)      // sequence: [1, 2, 3]
   * Lazy.range(2, 10, 2)  // sequence: [2, 4, 6, 8]
   * Lazy.range(5, 1, 2)   // sequence: []
   * Lazy.range(5, 15, -2) // sequence: []
   */
  Lazy.range = function range() {
    var start = arguments.length > 1 ? arguments[0] : 0,
        stop  = arguments.length > 1 ? arguments[1] : arguments[0],
        step  = arguments.length > 2 ? arguments[2] : 1;
    return this.generate(function(i) { return start + (step * i); })
      .take(Math.floor((stop - start) / step));
  };

  /**
   * Creates a sequence consisting of the given value repeated a specified number
   * of times.
   *
   * @public
   * @param {*} value The value to repeat.
   * @param {number=} count The number of times the value should be repeated in
   *     the sequence. If this argument is omitted, the value will repeat forever.
   * @returns {GeneratedSequence} The sequence containing the repeated value.
   *
   * @examples
   * Lazy.repeat("hi", 3)          // sequence: ["hi", "hi", "hi"]
   * Lazy.repeat("young")          // instanceof Lazy.GeneratedSequence
   * Lazy.repeat("young").length() // => undefined
   * Lazy.repeat("young").take(3)  // sequence: ["young", "young", "young"]
   */
  Lazy.repeat = function repeat(value, count) {
    return Lazy.generate(function() { return value; }, count);
  };

  Lazy.Sequence           = Sequence;
  Lazy.ArrayLikeSequence  = ArrayLikeSequence;
  Lazy.ObjectLikeSequence = ObjectLikeSequence;
  Lazy.StringLikeSequence = StringLikeSequence;
  Lazy.StreamLikeSequence = StreamLikeSequence;
  Lazy.GeneratedSequence  = GeneratedSequence;
  Lazy.AsyncSequence      = AsyncSequence;
  Lazy.AsyncHandle        = AsyncHandle;

  /*** Useful utility methods ***/

  /**
   * Marks a method as deprecated, so calling it will issue a console warning.
   */
  Lazy.deprecate = function deprecate(message, fn) {
    return function() {
      console.warn(message);
      return fn.apply(this, arguments);
    };
  };

  var arrayPop   = Array.prototype.pop,
      arraySlice = Array.prototype.slice;

  /**
   * Creates a callback... you know, Lo-Dash style.
   *
   * - for functions, just returns the function
   * - for strings, returns a pluck-style callback
   * - for objects, returns a where-style callback
   *
   * @private
   * @param {Function|string|Object} callback A function, string, or object to
   *     convert to a callback.
   * @param {*} defaultReturn If the callback is undefined, a default return
   *     value to use for the function.
   * @returns {Function} The callback function.
   *
   * @examples
   * createCallback(function() {})                  // instanceof Function
   * createCallback('foo')                          // instanceof Function
   * createCallback('foo')({ foo: 'bar'})           // => 'bar'
   * createCallback({ foo: 'bar' })({ foo: 'bar' }) // => true
   * createCallback({ foo: 'bar' })({ foo: 'baz' }) // => false
   */
  function createCallback(callback, defaultValue) {
    switch (typeof callback) {
      case "function":
        return callback;

      case "string":
        return function(e) {
          return e[callback];
        };

      case "object":
        return function(e) {
          return Lazy(callback).all(function(value, key) {
            return e[key] === value;
          });
        };

      case "undefined":
        return defaultValue ?
          function() { return defaultValue; } :
          Lazy.identity;

      default:
        throw "Don't know how to make a callback from a " + typeof callback + "!";
    }
  }

  /**
   * Creates a Set containing the specified values.
   *
   * @param {...Array} values One or more array(s) of values used to populate the
   *     set.
   * @returns {Set} A new set containing the values passed in.
   */
  function createSet(values) {
    var set = new Set();
    Lazy(values || []).flatten().each(function(e) {
      set.add(e);
    });
    return set;
  }

  /**
   * Compares two elements for sorting purposes.
   *
   * @private
   * @param {*} x The left element to compare.
   * @param {*} y The right element to compare.
   * @param {Function=} fn An optional function to call on each element, to get
   *     the values to compare.
   * @returns {number} 1 if x > y, -1 if x < y, or 0 if x and y are equal.
   *
   * @examples
   * compare(1, 2)     // => -1
   * compare(1, 1)     // => 0
   * compare(2, 1)     // => 1
   * compare('a', 'b') // => -1
   */
  function compare(x, y, fn) {
    if (typeof fn === "function") {
      return compare(fn(x), fn(y));
    }

    if (x === y) {
      return 0;
    }

    return x > y ? 1 : -1;
  }

  /**
   * Iterates over every element in an array.
   *
   * @param {Array} array The array.
   * @param {Function} fn The function to call on every element, which can return
   *     false to stop the iteration early.
   * @returns {boolean} True if every element in the entire sequence was iterated,
   *     otherwise false.
   */
  function forEach(array, fn) {
    var i = -1,
        len = array.length;

    while (++i < len) {
      if (fn(array[i], i) === false) {
        return false;
      }
    }

    return true;
  }

  function getFirst(sequence) {
    var result;
    sequence.each(function(e) {
      result = e;
      return false;
    });
    return result;
  }

  /**
   * Checks if an element exists in an array.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @returns {boolean} Whether or not the element exists in the array.
   *
   * @examples
   * arrayContains([1, 2], 2)              // => true
   * arrayContains([1, 2], 3)              // => false
   * arrayContains([undefined], undefined) // => true
   * arrayContains([NaN], NaN)             // => true
   */
  function arrayContains(array, element) {
    var i = -1,
        length = array.length;

    // Special handling for NaN
    if (element !== element) {
      while (++i < length) {
        if (array[i] !== array[i]) {
          return true;
        }
      }
      return false;
    }

    while (++i < length) {
      if (array[i] === element) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if an element exists in an array before a given index.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @param {number} index
   * @param {Function} keyFn
   * @returns {boolean}
   *
   * @examples
   * arrayContainsBefore([1, 2, 3], 3, 2) // => false
   * arrayContainsBefore([1, 2, 3], 3, 3) // => true
   */
  function arrayContainsBefore(array, element, index, keyFn) {
    var i = -1;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < index) {
        if (keyFn(array[i]) === keyFn(element)) {
          return true;
        }
      }

    } else {
      while (++i < index) {
        if (array[i] === element) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Swaps the elements at two specified positions of an array.
   *
   * @private
   * @param {Array} array
   * @param {number} i
   * @param {number} j
   *
   * @examples
   * var array = [1, 2, 3, 4, 5];
   *
   * swap(array, 2, 3) // array == [1, 2, 4, 3, 5]
   */
  function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  /**
   * "Clones" a regular expression (but makes it always global).
   *
   * @private
   * @param {RegExp|string} pattern
   * @returns {RegExp}
   */
  function cloneRegex(pattern) {
    return eval("" + pattern + (!pattern.global ? "g" : ""));
  };

  /**
   * A collection of unique elements.
   *
   * @private
   * @constructor
   *
   * @examples
   * var set  = new Set(),
   *     obj1 = {},
   *     obj2 = {},
   *     fn1 = function fn1() {},
   *     fn2 = function fn2() {};
   *
   * set.add('foo')            // => true
   * set.add('foo')            // => false
   * set.add(1)                // => true
   * set.add(1)                // => false
   * set.add('1')              // => true
   * set.add('1')              // => false
   * set.add(obj1)             // => true
   * set.add(obj1)             // => false
   * set.add(obj2)             // => true
   * set.add(fn1)              // => true
   * set.add(fn2)              // => true
   * set.add(fn2)              // => false
   * set.contains('__proto__') // => false
   * set.add('__proto__')      // => true
   * set.add('__proto__')      // => false
   * set.contains('add')       // => false
   * set.add('add')            // => true
   * set.add('add')            // => false
   * set.contains(undefined)   // => false
   * set.add(undefined)        // => true
   * set.contains(undefined)   // => true
   * set.contains('undefined') // => false
   * set.add('undefined')      // => true
   * set.contains('undefined') // => true
   * set.contains(NaN)         // => false
   * set.add(NaN)              // => true
   * set.contains(NaN)         // => true
   * set.contains('NaN')       // => false
   * set.add('NaN')            // => true
   * set.contains('NaN')       // => true
   * set.contains('@foo')      // => false
   * set.add('@foo')           // => true
   * set.contains('@foo')      // => true
   */
  function Set() {
    this.table   = {};
    this.objects = [];
  }

  /**
   * Attempts to add a unique value to the set.
   *
   * @param {*} value The value to add.
   * @returns {boolean} True if the value was added to the set (meaning an equal
   *     value was not already present), or else false.
   */
  Set.prototype.add = function add(value) {
    var table = this.table,
        type  = typeof value,

        // only applies for strings
        firstChar,

        // only applies for objects
        objects;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        objects = this.objects;
        if (!arrayContains(objects, value)) {
          objects.push(value);
          return true;
        }
        return false;
    }
  };

  /**
   * Checks whether the set contains a value.
   *
   * @param {*} value The value to check for.
   * @returns {boolean} True if the set contains the value, or else false.
   */
  Set.prototype.contains = function contains(value) {
    var type = typeof value,

        // only applies for strings
        firstChar;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        return !!this.table[value];

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        return !!this.table[value];

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        return arrayContains(this.objects, value);
    }
  };

  /**
   * A "rolling" queue, with a fixed capacity. As items are added to the head,
   * excess items are dropped from the tail.
   *
   * @private
   * @constructor
   *
   * @examples
   * var queue = new Queue(3);
   *
   * queue.add(1).toArray()        // => [1]
   * queue.add(2).toArray()        // => [1, 2]
   * queue.add(3).toArray()        // => [1, 2, 3]
   * queue.add(4).toArray()        // => [2, 3, 4]
   * queue.add(5).add(6).toArray() // => [4, 5, 6]
   * queue.add(7).add(8).toArray() // => [6, 7, 8]
   *
   * // also want to check corner cases
   * new Queue(1).add('foo').add('bar').toArray() // => ['bar']
   * new Queue(0).add('foo').toArray()            // => []
   * new Queue(-1)                                // throws
   *
   * @benchmarks
   * function populateQueue(count, capacity) {
   *   var q = new Queue(capacity);
   *   for (var i = 0; i < count; ++i) {
   *     q.add(i);
   *   }
   * }
   *
   * function populateArray(count, capacity) {
   *   var arr = [];
   *   for (var i = 0; i < count; ++i) {
   *     if (arr.length === capacity) { arr.shift(); }
   *     arr.push(i);
   *   }
   * }
   *
   * populateQueue(100, 10); // populating a Queue
   * populateArray(100, 10); // populating an Array
   */
  function Queue(capacity) {
    this.contents = new Array(capacity);
    this.start    = 0;
    this.count    = 0;
  }

  /**
   * Adds an item to the queue, and returns the queue.
   */
  Queue.prototype.add = function add(element) {
    var contents = this.contents,
        capacity = contents.length,
        start    = this.start;
  
    if (this.count === capacity) {
      contents[start] = element;
      this.start = (start + 1) % capacity;
  
    } else {
      contents[this.count++] = element;
    }

    return this;
  };

  /**
   * Returns an array containing snapshot of the queue's contents.
   */
  Queue.prototype.toArray = function toArray() {
    var contents = this.contents,
        start    = this.start,
        count    = this.count;

    var snapshot = contents.slice(start, start + count);
    if (snapshot.length < count) {
      snapshot = snapshot.concat(contents.slice(0, count - snapshot.length));
    }

    return snapshot;
  };

  /**
   * Shared base method for defining new sequence types.
   */
  function defineSequenceType(base, name, overrides) {
    /** @constructor */
    var ctor = function ctor() {};

    // Make this type inherit from the specified base.
    ctor.prototype = new base();

    // Attach overrides to the new sequence type's prototype.
    for (var override in overrides) {
      ctor.prototype[override] = overrides[override];
    }

    // Define a factory method that sets the new sequence's parent to the caller
    // and (optionally) applies any additional initialization logic.
    // Expose this as a chainable method so that we can do:
    // Lazy(...).map(...).filter(...).blah(...);
    var factory = function factory() {
      var sequence = new ctor();

      // Every sequence needs a reference to its parent in order to work.
      sequence.parent = this;

      // If a custom init function was supplied, call it now.
      if (sequence.init) {
        sequence.init.apply(sequence, arguments);
      }

      return sequence;
    };

    var methodNames = typeof name === 'string' ? [name] : name;
    for (var i = 0; i < methodNames.length; ++i) {
      base.prototype[methodNames[i]] = factory;
    }

    return ctor;
  }

  /*** Exposing Lazy to the world ***/

  // For Node.js
  if (typeof module === "object" && module && module.exports === context) {
    module.exports = Lazy;

  // For browsers
  } else {
    context.Lazy = Lazy;
  }

}(this));

},{}],52:[function(require,module,exports){
var fs     = require("fs");
var http   = require("http");
var os     = require("os");
var Stream = require("stream");
var URL    = require("url");
var util   = require("util");

// The starting point is everything that works in any environment (browser OR
// Node.js)
var Lazy = require("./lazy.js");

/**
 * @constructor
 */
function StreamedSequence(stream) {
  this.stream = stream;
}

StreamedSequence.prototype = new Lazy.StreamLikeSequence();

StreamedSequence.prototype.openStream = function(callback) {
  this.stream.resume();
  callback(this.stream);
};

/**
 * Handles every chunk of data in this sequence.
 *
 * @param {function(string):*} fn The function to call on each chunk of data as
 *     it's read from the stream. Return false from the function to stop reading
 *     the stream.
 */
StreamedSequence.prototype.each = function(fn) {
  var encoding = this.encoding || "utf-8";

  var handle = new Lazy.AsyncHandle();

  this.openStream(function(stream) {
    var listener = function(e) {
      try {
        if (fn(e) === false) {
          stream.removeListener("data", listener);
        }
      } catch (e) {
        handle.errorCallback(e);
      }
    };

    if (stream.setEncoding) {
      stream.setEncoding(encoding);
    }

    stream.on("data", listener);

    stream.on("end", function() {
      handle.completeCallback();
    });
  });

  return handle;
};

/**
 * Creates a {@link Sequence} of lines as they are read from a file.
 *
 * @return {Sequence} A sequence comprising the lines in the underlying file, as
 *     they are read.
 */
StreamedSequence.prototype.lines = function() {
  return this.split(os.EOL || "\n");
};

function FileStreamSequence(path, encoding) {
  this.path = path;
  this.encoding = encoding;
}

FileStreamSequence.prototype = new StreamedSequence();

FileStreamSequence.prototype.openStream = function(callback) {
  var stream = fs.createReadStream(this.path, { autoClose: true });
  callback(stream);
};

/**
 * Creates a {@link Sequence} from a file stream, whose elements are chunks of
 * data as the stream is read. This is an {@link AsyncSequence}, so methods such
 * as {@link Sequence#reduce} return an {@link AsyncHandle} rather than a value.
 *
 * @param {string} path A path to a file.
 * @param {string} encoding The text encoding of the file (e.g., "utf-8").
 * @return {Sequence} The streamed sequence.
 */
Lazy.readFile = function(path, encoding) {
  return new FileStreamSequence(path, encoding);
};

function HttpStreamSequence(url, encoding) {
  this.url = url;
  this.encoding = encoding;
}

HttpStreamSequence.prototype = new StreamedSequence();

HttpStreamSequence.prototype.openStream = function(callback) {
  http.get(URL.parse(this.url), callback);
};

/**
 * Creates a {@link Sequence} from an HTTP stream, whose elements are chunks of
 * data as the stream is read. This sequence works asynchronously, so
 * synchronous methods such as {@code indexOf}, {@code any}, and {@code toArray}
 * won't work.
 *
 * @param {string} url The URL for the HTTP request.
 * @return {Sequence} The streamed sequence.
 */
Lazy.makeHttpRequest = function(url) {
  return new HttpStreamSequence(url);
};

if (typeof Stream.Readable !== "undefined") {
  Lazy.Sequence.prototype.toStream = function toStream(options) {
    return new LazyStream(this, options);
  };

  Lazy.Sequence.prototype.pipe = function pipe(destination) {
    this.toStream().pipe(destination);
  };

  function LazyStream(sequence, options) {
    options = Lazy(options || {})
      .extend({ objectMode: true })
      .toObject();

    Stream.Readable.call(this, options);

    this.sequence = sequence;
    this.started  = false;
  }

  util.inherits(LazyStream, Stream.Readable);

  LazyStream.prototype._read = function() {
    var self = this;

    if (!this.started) {
      var handle = this.sequence.each(function(e, i) {
        return self.push(e, i);
      });
      if (handle instanceof Lazy.AsyncHandle) {
        handle.onComplete(function() {
          self.push(null);
        });
      }
      this.started = true;
    }
  };
}

/*
 * Add support for `Lazy(Stream)`.
 */
Lazy.extensions || (Lazy.extensions = []);

Lazy.extensions.push(function(source) {
  if (source instanceof Stream) {
    return new StreamedSequence(source);
  }
});

module.exports = Lazy;

},{"./lazy.js":51,"fs":2,"http":23,"os":29,"stream":47,"url":48,"util":50}],53:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],54:[function(require,module,exports){
(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{mori=definition();}})(function(){return function(){
var g,aa=this;
function m(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function p(a,b){var c=a.split("."),d=aa;c[0]in d||!d.execScript||d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d=d[e]?d[e]:d[e]={}:d[e]=b};function da(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function ea(a,b){null!=a&&this.append.apply(this,arguments)}ea.prototype.Va="";ea.prototype.append=function(a,b,c){this.Va+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Va+=arguments[d];return this};ea.prototype.toString=function(){return this.Va};function fa(a,b){a.sort(b||ga)}function ha(a,b){for(var c=0;c<a.length;c++)a[c]={index:c,value:a[c]};var d=b||ga;fa(a,function(a,b){return d(a.value,b.value)||a.index-b.index});for(c=0;c<a.length;c++)a[c]=a[c].value}function ga(a,b){return a>b?1:a<b?-1:0};var ia=null,ja=null;function ka(){return new la(null,5,[ma,!0,oa,!0,pa,!1,qa,!1,ra,ia],null)}function r(a){return null!=a&&!1!==a}function sa(a){return r(a)?!1:!0}function s(a,b){return a[m(null==b?null:b)]?!0:a._?!0:u?!1:null}function ta(a){return null==a?null:a.constructor}function x(a,b){var c=ta(b),c=r(r(c)?c.Db:c)?c.Bb:m(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function ua(a){var b=a.Bb;return r(b)?b:""+A.b(a)}
function va(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}function wa(a){return Array.prototype.slice.call(arguments)}
var xa=function(){function a(a,b){return C.c?C.c(function(a,b){a.push(b);return a},[],b):C.call(null,function(a,b){a.push(b);return a},[],b)}function b(a){return c.a(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,0,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),ya={},za={};
function Aa(a){if(a?a.L:a)return a.L(a);var b;b=Aa[m(null==a?null:a)];if(!b&&(b=Aa._,!b))throw x("ICounted.-count",a);return b.call(null,a)}function Ba(a){if(a?a.I:a)return a.I(a);var b;b=Ba[m(null==a?null:a)];if(!b&&(b=Ba._,!b))throw x("IEmptyableCollection.-empty",a);return b.call(null,a)}var Ca={};function Da(a,b){if(a?a.G:a)return a.G(a,b);var c;c=Da[m(null==a?null:a)];if(!c&&(c=Da._,!c))throw x("ICollection.-conj",a);return c.call(null,a,b)}
var Ea={},D=function(){function a(a,b,c){if(a?a.aa:a)return a.aa(a,b,c);var h;h=D[m(null==a?null:a)];if(!h&&(h=D._,!h))throw x("IIndexed.-nth",a);return h.call(null,a,b,c)}function b(a,b){if(a?a.J:a)return a.J(a,b);var c;c=D[m(null==a?null:a)];if(!c&&(c=D._,!c))throw x("IIndexed.-nth",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),
Fa={};function Ha(a){if(a?a.Q:a)return a.Q(a);var b;b=Ha[m(null==a?null:a)];if(!b&&(b=Ha._,!b))throw x("ISeq.-first",a);return b.call(null,a)}function Ia(a){if(a?a.S:a)return a.S(a);var b;b=Ia[m(null==a?null:a)];if(!b&&(b=Ia._,!b))throw x("ISeq.-rest",a);return b.call(null,a)}
var Ja={},Ka={},La=function(){function a(a,b,c){if(a?a.C:a)return a.C(a,b,c);var h;h=La[m(null==a?null:a)];if(!h&&(h=La._,!h))throw x("ILookup.-lookup",a);return h.call(null,a,b,c)}function b(a,b){if(a?a.u:a)return a.u(a,b);var c;c=La[m(null==a?null:a)];if(!c&&(c=La._,!c))throw x("ILookup.-lookup",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=
a;return c}(),Ma={};function Na(a,b){if(a?a.kb:a)return a.kb(a,b);var c;c=Na[m(null==a?null:a)];if(!c&&(c=Na._,!c))throw x("IAssociative.-contains-key?",a);return c.call(null,a,b)}function Oa(a,b,c){if(a?a.ua:a)return a.ua(a,b,c);var d;d=Oa[m(null==a?null:a)];if(!d&&(d=Oa._,!d))throw x("IAssociative.-assoc",a);return d.call(null,a,b,c)}var Pa={};function Qa(a,b){if(a?a.nb:a)return a.nb(a,b);var c;c=Qa[m(null==a?null:a)];if(!c&&(c=Qa._,!c))throw x("IMap.-dissoc",a);return c.call(null,a,b)}var Sa={};
function Ta(a){if(a?a.$a:a)return a.$a(a);var b;b=Ta[m(null==a?null:a)];if(!b&&(b=Ta._,!b))throw x("IMapEntry.-key",a);return b.call(null,a)}function Ua(a){if(a?a.ab:a)return a.ab(a);var b;b=Ua[m(null==a?null:a)];if(!b&&(b=Ua._,!b))throw x("IMapEntry.-val",a);return b.call(null,a)}var Va={};function Wa(a,b){if(a?a.vb:a)return a.vb(a,b);var c;c=Wa[m(null==a?null:a)];if(!c&&(c=Wa._,!c))throw x("ISet.-disjoin",a);return c.call(null,a,b)}
function Xa(a){if(a?a.Ia:a)return a.Ia(a);var b;b=Xa[m(null==a?null:a)];if(!b&&(b=Xa._,!b))throw x("IStack.-peek",a);return b.call(null,a)}function Ya(a){if(a?a.Ja:a)return a.Ja(a);var b;b=Ya[m(null==a?null:a)];if(!b&&(b=Ya._,!b))throw x("IStack.-pop",a);return b.call(null,a)}var Za={};function $a(a,b,c){if(a?a.Pa:a)return a.Pa(a,b,c);var d;d=$a[m(null==a?null:a)];if(!d&&(d=$a._,!d))throw x("IVector.-assoc-n",a);return d.call(null,a,b,c)}
function ab(a){if(a?a.ub:a)return a.ub(a);var b;b=ab[m(null==a?null:a)];if(!b&&(b=ab._,!b))throw x("IDeref.-deref",a);return b.call(null,a)}var bb={};function cb(a){if(a?a.D:a)return a.D(a);var b;b=cb[m(null==a?null:a)];if(!b&&(b=cb._,!b))throw x("IMeta.-meta",a);return b.call(null,a)}var db={};function eb(a,b){if(a?a.F:a)return a.F(a,b);var c;c=eb[m(null==a?null:a)];if(!c&&(c=eb._,!c))throw x("IWithMeta.-with-meta",a);return c.call(null,a,b)}
var fb={},gb=function(){function a(a,b,c){if(a?a.M:a)return a.M(a,b,c);var h;h=gb[m(null==a?null:a)];if(!h&&(h=gb._,!h))throw x("IReduce.-reduce",a);return h.call(null,a,b,c)}function b(a,b){if(a?a.N:a)return a.N(a,b);var c;c=gb[m(null==a?null:a)];if(!c&&(c=gb._,!c))throw x("IReduce.-reduce",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();
function hb(a,b,c){if(a?a.Za:a)return a.Za(a,b,c);var d;d=hb[m(null==a?null:a)];if(!d&&(d=hb._,!d))throw x("IKVReduce.-kv-reduce",a);return d.call(null,a,b,c)}function ib(a,b){if(a?a.v:a)return a.v(a,b);var c;c=ib[m(null==a?null:a)];if(!c&&(c=ib._,!c))throw x("IEquiv.-equiv",a);return c.call(null,a,b)}function jb(a){if(a?a.B:a)return a.B(a);var b;b=jb[m(null==a?null:a)];if(!b&&(b=jb._,!b))throw x("IHash.-hash",a);return b.call(null,a)}var kb={};
function lb(a){if(a?a.H:a)return a.H(a);var b;b=lb[m(null==a?null:a)];if(!b&&(b=lb._,!b))throw x("ISeqable.-seq",a);return b.call(null,a)}var mb={},nb={},ob={};function pb(a){if(a?a.Xa:a)return a.Xa(a);var b;b=pb[m(null==a?null:a)];if(!b&&(b=pb._,!b))throw x("IReversible.-rseq",a);return b.call(null,a)}function qb(a,b){if(a?a.yb:a)return a.yb(a,b);var c;c=qb[m(null==a?null:a)];if(!c&&(c=qb._,!c))throw x("ISorted.-sorted-seq",a);return c.call(null,a,b)}
function rb(a,b,c){if(a?a.zb:a)return a.zb(a,b,c);var d;d=rb[m(null==a?null:a)];if(!d&&(d=rb._,!d))throw x("ISorted.-sorted-seq-from",a);return d.call(null,a,b,c)}function sb(a,b){if(a?a.xb:a)return a.xb(a,b);var c;c=sb[m(null==a?null:a)];if(!c&&(c=sb._,!c))throw x("ISorted.-entry-key",a);return c.call(null,a,b)}function tb(a){if(a?a.wb:a)return a.wb(a);var b;b=tb[m(null==a?null:a)];if(!b&&(b=tb._,!b))throw x("ISorted.-comparator",a);return b.call(null,a)}
function ub(a,b){if(a?a.Sb:a)return a.Sb(0,b);var c;c=ub[m(null==a?null:a)];if(!c&&(c=ub._,!c))throw x("IWriter.-write",a);return c.call(null,a,b)}var vb={};function wb(a,b,c){if(a?a.w:a)return a.w(a,b,c);var d;d=wb[m(null==a?null:a)];if(!d&&(d=wb._,!d))throw x("IPrintWithWriter.-pr-writer",a);return d.call(null,a,b,c)}function xb(a,b,c){if(a?a.Rb:a)return a.Rb(0,b,c);var d;d=xb[m(null==a?null:a)];if(!d&&(d=xb._,!d))throw x("IWatchable.-notify-watches",a);return d.call(null,a,b,c)}
function yb(a){if(a?a.Wa:a)return a.Wa(a);var b;b=yb[m(null==a?null:a)];if(!b&&(b=yb._,!b))throw x("IEditableCollection.-as-transient",a);return b.call(null,a)}function zb(a,b){if(a?a.Ka:a)return a.Ka(a,b);var c;c=zb[m(null==a?null:a)];if(!c&&(c=zb._,!c))throw x("ITransientCollection.-conj!",a);return c.call(null,a,b)}function Ab(a){if(a?a.Oa:a)return a.Oa(a);var b;b=Ab[m(null==a?null:a)];if(!b&&(b=Ab._,!b))throw x("ITransientCollection.-persistent!",a);return b.call(null,a)}
function Bb(a,b,c){if(a?a.cb:a)return a.cb(a,b,c);var d;d=Bb[m(null==a?null:a)];if(!d&&(d=Bb._,!d))throw x("ITransientAssociative.-assoc!",a);return d.call(null,a,b,c)}function Cb(a,b){if(a?a.Ab:a)return a.Ab(a,b);var c;c=Cb[m(null==a?null:a)];if(!c&&(c=Cb._,!c))throw x("ITransientMap.-dissoc!",a);return c.call(null,a,b)}function Db(a,b,c){if(a?a.Pb:a)return a.Pb(0,b,c);var d;d=Db[m(null==a?null:a)];if(!d&&(d=Db._,!d))throw x("ITransientVector.-assoc-n!",a);return d.call(null,a,b,c)}
function Eb(a){if(a?a.Qb:a)return a.Qb();var b;b=Eb[m(null==a?null:a)];if(!b&&(b=Eb._,!b))throw x("ITransientVector.-pop!",a);return b.call(null,a)}function Fb(a,b){if(a?a.Ob:a)return a.Ob(0,b);var c;c=Fb[m(null==a?null:a)];if(!c&&(c=Fb._,!c))throw x("ITransientSet.-disjoin!",a);return c.call(null,a,b)}function Gb(a){if(a?a.Kb:a)return a.Kb();var b;b=Gb[m(null==a?null:a)];if(!b&&(b=Gb._,!b))throw x("IChunk.-drop-first",a);return b.call(null,a)}
function Hb(a){if(a?a.sb:a)return a.sb(a);var b;b=Hb[m(null==a?null:a)];if(!b&&(b=Hb._,!b))throw x("IChunkedSeq.-chunked-first",a);return b.call(null,a)}function Ib(a){if(a?a.tb:a)return a.tb(a);var b;b=Ib[m(null==a?null:a)];if(!b&&(b=Ib._,!b))throw x("IChunkedSeq.-chunked-rest",a);return b.call(null,a)}function Jb(a){if(a?a.rb:a)return a.rb(a);var b;b=Jb[m(null==a?null:a)];if(!b&&(b=Jb._,!b))throw x("IChunkedNext.-chunked-next",a);return b.call(null,a)}
function Kb(a){this.vc=a;this.q=0;this.i=1073741824}Kb.prototype.Sb=function(a,b){return this.vc.append(b)};function Lb(a){var b=new ea;a.w(null,new Kb(b),ka());return""+A.b(b)}var Mb="undefined"!==typeof Math.imul&&0!==(Math.imul.a?Math.imul.a(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul(a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function Nb(a){a=Mb(a,3432918353);return Mb(a<<15|a>>>-15,461845907)}
function Ob(a,b){var c=a^b;return Mb(c<<13|c>>>-13,5)+3864292196}function Pb(a,b){var c=a^b,c=Mb(c^c>>>16,2246822507),c=Mb(c^c>>>13,3266489909);return c^c>>>16}var Qb={},Rb=0;function Sb(a){255<Rb&&(Qb={},Rb=0);var b=Qb[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b){for(var c=0,d=0;;)if(c<b)var e=c+1,d=Mb(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}b=void 0}else b=0;else b=0;Qb[a]=b;Rb+=1}return a=b}
function Tb(a){a&&(a.i&4194304||a.Dc)?a=a.B(null):"number"===typeof a?a=Math.floor(a)%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=Sb(a),0!==a&&(a=Nb(a),a=Ob(0,a),a=Pb(a,4))):a=null==a?0:u?jb(a):null;return a}
function Ub(a){var b;b=a.name;var c;a:{c=1;for(var d=0;;)if(c<b.length){var e=c+2,d=Ob(d,Nb(b.charCodeAt(c-1)|b.charCodeAt(c)<<16));c=e}else{c=d;break a}c=void 0}c=1===(b.length&1)?c^Nb(b.charCodeAt(b.length-1)):c;b=Pb(c,Mb(2,b.length));a=Sb(a.fa);return b^a+2654435769+(b<<6)+(b>>2)}
function Vb(a,b){if(r(Wb.a?Wb.a(a,b):Wb.call(null,a,b)))return 0;var c=sa(a.fa);if(r(c?b.fa:c))return-1;if(r(a.fa)){if(sa(b.fa))return 1;c=Xb.a?Xb.a(a.fa,b.fa):Xb.call(null,a.fa,b.fa);return 0===c?Xb.a?Xb.a(a.name,b.name):Xb.call(null,a.name,b.name):c}return Yb?Xb.a?Xb.a(a.name,b.name):Xb.call(null,a.name,b.name):null}function Zb(a,b,c,d,e){this.fa=a;this.name=b;this.Na=c;this.Ua=d;this.W=e;this.i=2154168321;this.q=4096}g=Zb.prototype;g.w=function(a,b){return ub(b,this.Na)};
g.B=function(){var a=this.Ua;return null!=a?a:this.Ua=a=Ub(this)};g.F=function(a,b){return new Zb(this.fa,this.name,this.Na,this.Ua,b)};g.D=function(){return this.W};g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return La.c(c,this,null);case 3:return La.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return La.c(a,this,null)};
g.a=function(a,b){return La.c(a,this,b)};g.v=function(a,b){return b instanceof Zb?this.Na===b.Na:!1};g.toString=function(){return this.Na};var $b=function(){function a(a,b){var c=null!=a?""+A.b(a)+"/"+A.b(b):b;return new Zb(a,b,c,null,null)}function b(a){return a instanceof Zb?a:c.a(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();
function E(a){if(null==a)return null;if(a&&(a.i&8388608||a.hc))return a.H(null);if(a instanceof Array||"string"===typeof a)return 0===a.length?null:new ac(a,0);if(s(kb,a))return lb(a);if(u)throw Error(""+A.b(a)+" is not ISeqable");return null}function F(a){if(null==a)return null;if(a&&(a.i&64||a.bb))return a.Q(null);a=E(a);return null==a?null:Ha(a)}function G(a){return null!=a?a&&(a.i&64||a.bb)?a.S(null):(a=E(a))?Ia(a):H:H}function I(a){return null==a?null:a&&(a.i&128||a.ob)?a.U(null):E(G(a))}
var Wb=function(){function a(a,b){return null==a?null==b:a===b||ib(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(b.a(a,d))if(I(e))a=d,d=F(e),e=I(e);else return b.a(d,F(e));else return!1}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!0;case 2:return a.call(this,b,
e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(){return!0};b.a=a;b.d=c.d;return b}();function bc(a,b){var c=Nb(a),c=Ob(0,c);return Pb(c,b)}function cc(a){var b=0,c=1;for(a=E(a);;)if(null!=a)b+=1,c=Mb(31,c)+Tb(F(a))|0,a=I(a);else return bc(c,b)}function dc(a){var b=0,c=0;for(a=E(a);;)if(null!=a)b+=1,c=c+Tb(F(a))|0,a=I(a);else return bc(c,b)}za["null"]=!0;Aa["null"]=function(){return 0};
Date.prototype.v=function(a,b){return b instanceof Date&&this.toString()===b.toString()};ib.number=function(a,b){return a===b};bb["function"]=!0;cb["function"]=function(){return null};ya["function"]=!0;jb._=function(a){return a[ba]||(a[ba]=++ca)};function ec(a){this.l=a;this.q=0;this.i=32768}ec.prototype.ub=function(){return this.l};function fc(a){return a instanceof ec}
var gc=function(){function a(a,b,c,d){for(var l=Aa(a);;)if(d<l){c=b.a?b.a(c,D.a(a,d)):b.call(null,c,D.a(a,d));if(fc(c))return K.b?K.b(c):K.call(null,c);d+=1}else return c}function b(a,b,c){for(var d=Aa(a),l=0;;)if(l<d){c=b.a?b.a(c,D.a(a,l)):b.call(null,c,D.a(a,l));if(fc(c))return K.b?K.b(c):K.call(null,c);l+=1}else return c}function c(a,b){var c=Aa(a);if(0===c)return b.o?b.o():b.call(null);for(var d=D.a(a,0),l=1;;)if(l<c){d=b.a?b.a(d,D.a(a,l)):b.call(null,d,D.a(a,l));if(fc(d))return K.b?K.b(d):K.call(null,
d);l+=1}else return d}var d=null,d=function(d,f,h,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,h);case 4:return a.call(this,d,f,h,k)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),hc=function(){function a(a,b,c,d){for(var l=a.length;;)if(d<l){c=b.a?b.a(c,a[d]):b.call(null,c,a[d]);if(fc(c))return K.b?K.b(c):K.call(null,c);d+=1}else return c}function b(a,b,c){for(var d=a.length,l=0;;)if(l<d){c=b.a?b.a(c,a[l]):b.call(null,c,
a[l]);if(fc(c))return K.b?K.b(c):K.call(null,c);l+=1}else return c}function c(a,b){var c=a.length;if(0===a.length)return b.o?b.o():b.call(null);for(var d=a[0],l=1;;)if(l<c){d=b.a?b.a(d,a[l]):b.call(null,d,a[l]);if(fc(d))return K.b?K.b(d):K.call(null,d);l+=1}else return d}var d=null,d=function(d,f,h,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,h);case 4:return a.call(this,d,f,h,k)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}();
function ic(a){return a?a.i&2||a.Yb?!0:a.i?!1:s(za,a):s(za,a)}function jc(a){return a?a.i&16||a.Lb?!0:a.i?!1:s(Ea,a):s(Ea,a)}function ac(a,b){this.e=a;this.p=b;this.i=166199550;this.q=8192}g=ac.prototype;g.toString=function(){return Lb(this)};g.J=function(a,b){var c=b+this.p;return c<this.e.length?this.e[c]:null};g.aa=function(a,b,c){a=b+this.p;return a<this.e.length?this.e[a]:c};g.U=function(){return this.p+1<this.e.length?new ac(this.e,this.p+1):null};g.L=function(){return this.e.length-this.p};
g.Xa=function(){var a=Aa(this);return 0<a?new kc(this,a-1,null):null};g.B=function(){return cc(this)};g.v=function(a,b){return lc.a?lc.a(this,b):lc.call(null,this,b)};g.I=function(){return H};g.N=function(a,b){return hc.n(this.e,b,this.e[this.p],this.p+1)};g.M=function(a,b,c){return hc.n(this.e,b,c,this.p)};g.Q=function(){return this.e[this.p]};g.S=function(){return this.p+1<this.e.length?new ac(this.e,this.p+1):H};g.H=function(){return this};
g.G=function(a,b){return M.a?M.a(b,this):M.call(null,b,this)};
var mc=function(){function a(a,b){return b<a.length?new ac(a,b):null}function b(a){return c.a(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),J=function(){function a(a,b){return mc.a(a,b)}function b(a){return mc.a(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.b=b;c.a=a;return c}();function kc(a,b,c){this.jb=a;this.p=b;this.j=c;this.i=32374990;this.q=8192}g=kc.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.U=function(){return 0<this.p?new kc(this.jb,this.p-1,null):null};g.L=function(){return this.p+1};g.B=function(){return cc(this)};g.v=function(a,b){return lc.a?lc.a(this,b):lc.call(null,this,b)};g.I=function(){return N.a?N.a(H,this.j):N.call(null,H,this.j)};
g.N=function(a,b){return nc.a?nc.a(b,this):nc.call(null,b,this)};g.M=function(a,b,c){return nc.c?nc.c(b,c,this):nc.call(null,b,c,this)};g.Q=function(){return D.a(this.jb,this.p)};g.S=function(){return 0<this.p?new kc(this.jb,this.p-1,null):H};g.H=function(){return this};g.F=function(a,b){return new kc(this.jb,this.p,b)};g.G=function(a,b){return M.a?M.a(b,this):M.call(null,b,this)};function oc(a){for(;;){var b=I(a);if(null!=b)a=b;else return F(a)}}ib._=function(a,b){return a===b};
var pc=function(){function a(a,b){return null!=a?Da(a,b):Da(H,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(r(e))a=b.a(a,d),d=F(e),e=I(e);else return b.a(a,d)}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+
arguments.length);};b.k=2;b.f=c.f;b.a=a;b.d=c.d;return b}();function qc(a){return null==a?null:Ba(a)}function O(a){if(null!=a)if(a&&(a.i&2||a.Yb))a=a.L(null);else if(a instanceof Array)a=a.length;else if("string"===typeof a)a=a.length;else if(s(za,a))a=Aa(a);else if(u)a:{a=E(a);for(var b=0;;){if(ic(a)){a=b+Aa(a);break a}a=I(a);b+=1}a=void 0}else a=null;else a=0;return a}
var rc=function(){function a(a,b,c){for(;;){if(null==a)return c;if(0===b)return E(a)?F(a):c;if(jc(a))return D.c(a,b,c);if(E(a))a=I(a),b-=1;else return u?c:null}}function b(a,b){for(;;){if(null==a)throw Error("Index out of bounds");if(0===b){if(E(a))return F(a);throw Error("Index out of bounds");}if(jc(a))return D.a(a,b);if(E(a)){var c=I(a),h=b-1;a=c;b=h}else{if(u)throw Error("Index out of bounds");return null}}}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),P=function(){function a(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(a&&(a.i&16||a.Lb))return a.aa(null,b,c);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:c;if(s(Ea,a))return D.a(a,b);if(a?a.i&64||a.bb||(a.i?0:s(Fa,a)):s(Fa,a))return rc.c(a,b,c);if(u)throw Error("nth not supported on this type "+A.b(ua(ta(a))));return null}function b(a,
b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.i&16||a.Lb))return a.J(null,b);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:null;if(s(Ea,a))return D.a(a,b);if(a?a.i&64||a.bb||(a.i?0:s(Fa,a)):s(Fa,a))return rc.a(a,b);if(u)throw Error("nth not supported on this type "+A.b(ua(ta(a))));return null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+
arguments.length);};c.a=b;c.c=a;return c}(),Q=function(){function a(a,b,c){return null!=a?a&&(a.i&256||a.Mb)?a.C(null,b,c):a instanceof Array?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:s(Ka,a)?La.c(a,b,c):u?c:null:c}function b(a,b){return null==a?null:a&&(a.i&256||a.Mb)?a.u(null,b):a instanceof Array?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:s(Ka,a)?La.a(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),R=function(){function a(a,b,c){return null!=a?Oa(a,b,c):sc.a?sc.a([b],[c]):sc.call(null,[b],[c])}var b=null,c=function(){function a(b,d,k,l){var n=null;3<arguments.length&&(n=J(Array.prototype.slice.call(arguments,3),0));return c.call(this,b,d,k,n)}function c(a,d,e,l){for(;;)if(a=b.c(a,d,e),r(l))d=F(l),e=F(I(l)),l=I(I(l));else return a}a.k=3;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=I(a);var l=F(a);a=G(a);return c(b,
d,l,a)};a.d=c;return a}(),b=function(b,e,f,h){switch(arguments.length){case 3:return a.call(this,b,e,f);default:return c.d(b,e,f,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};b.k=3;b.f=c.f;b.c=a;b.d=c.d;return b}(),tc=function(){function a(a,b){return null==a?null:Qa(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.a(a,d);
if(r(e))d=F(e),e=I(e);else return a}}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function uc(a){var b="function"==m(a);return b?b:a?r(r(null)?null:a.Xb)?!0:a.Cb?!1:s(ya,a):s(ya,a)}
function vc(a,b){this.h=a;this.j=b;this.q=0;this.i=393217}g=vc.prototype;
g.call=function(){var a=null;return a=function(a,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,Ra,wc){switch(arguments.length){case 1:var z=a,z=this;return z.h.o?z.h.o():z.h.call(null);case 2:return z=a,z=this,z.h.b?z.h.b(c):z.h.call(null,c);case 3:return z=a,z=this,z.h.a?z.h.a(c,d):z.h.call(null,c,d);case 4:return z=a,z=this,z.h.c?z.h.c(c,d,e):z.h.call(null,c,d,e);case 5:return z=a,z=this,z.h.n?z.h.n(c,d,e,f):z.h.call(null,c,d,e,f);case 6:return z=a,z=this,z.h.s?z.h.s(c,d,e,f,h):z.h.call(null,c,d,e,f,
h);case 7:return z=a,z=this,z.h.X?z.h.X(c,d,e,f,h,k):z.h.call(null,c,d,e,f,h,k);case 8:return z=a,z=this,z.h.ga?z.h.ga(c,d,e,f,h,k,l):z.h.call(null,c,d,e,f,h,k,l);case 9:return z=a,z=this,z.h.Ga?z.h.Ga(c,d,e,f,h,k,l,n):z.h.call(null,c,d,e,f,h,k,l,n);case 10:return z=a,z=this,z.h.Ha?z.h.Ha(c,d,e,f,h,k,l,n,q):z.h.call(null,c,d,e,f,h,k,l,n,q);case 11:return z=a,z=this,z.h.va?z.h.va(c,d,e,f,h,k,l,n,q,t):z.h.call(null,c,d,e,f,h,k,l,n,q,t);case 12:return z=a,z=this,z.h.wa?z.h.wa(c,d,e,f,h,k,l,n,q,t,v):
z.h.call(null,c,d,e,f,h,k,l,n,q,t,v);case 13:return z=a,z=this,z.h.xa?z.h.xa(c,d,e,f,h,k,l,n,q,t,v,w):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w);case 14:return z=a,z=this,z.h.ya?z.h.ya(c,d,e,f,h,k,l,n,q,t,v,w,y):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y);case 15:return z=a,z=this,z.h.za?z.h.za(c,d,e,f,h,k,l,n,q,t,v,w,y,B):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B);case 16:return z=a,z=this,z.h.Aa?z.h.Aa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L);case 17:return z=a,z=this,
z.h.Ba?z.h.Ba(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U);case 18:return z=a,z=this,z.h.Ca?z.h.Ca(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z);case 19:return z=a,z=this,z.h.Da?z.h.Da(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na);case 20:return z=a,z=this,z.h.Ea?z.h.Ea(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga);case 21:return z=
a,z=this,z.h.Fa?z.h.Fa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,Ra):z.h.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,Ra);case 22:return z=a,z=this,S.bc?S.bc(z.h,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,Ra,wc):S.call(null,z.h,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,Ra,wc)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.o=function(){return this.h.o?this.h.o():this.h.call(null)};
g.b=function(a){return this.h.b?this.h.b(a):this.h.call(null,a)};g.a=function(a,b){return this.h.a?this.h.a(a,b):this.h.call(null,a,b)};g.c=function(a,b,c){return this.h.c?this.h.c(a,b,c):this.h.call(null,a,b,c)};g.n=function(a,b,c,d){return this.h.n?this.h.n(a,b,c,d):this.h.call(null,a,b,c,d)};g.s=function(a,b,c,d,e){return this.h.s?this.h.s(a,b,c,d,e):this.h.call(null,a,b,c,d,e)};g.X=function(a,b,c,d,e,f){return this.h.X?this.h.X(a,b,c,d,e,f):this.h.call(null,a,b,c,d,e,f)};
g.ga=function(a,b,c,d,e,f,h){return this.h.ga?this.h.ga(a,b,c,d,e,f,h):this.h.call(null,a,b,c,d,e,f,h)};g.Ga=function(a,b,c,d,e,f,h,k){return this.h.Ga?this.h.Ga(a,b,c,d,e,f,h,k):this.h.call(null,a,b,c,d,e,f,h,k)};g.Ha=function(a,b,c,d,e,f,h,k,l){return this.h.Ha?this.h.Ha(a,b,c,d,e,f,h,k,l):this.h.call(null,a,b,c,d,e,f,h,k,l)};g.va=function(a,b,c,d,e,f,h,k,l,n){return this.h.va?this.h.va(a,b,c,d,e,f,h,k,l,n):this.h.call(null,a,b,c,d,e,f,h,k,l,n)};
g.wa=function(a,b,c,d,e,f,h,k,l,n,q){return this.h.wa?this.h.wa(a,b,c,d,e,f,h,k,l,n,q):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q)};g.xa=function(a,b,c,d,e,f,h,k,l,n,q,t){return this.h.xa?this.h.xa(a,b,c,d,e,f,h,k,l,n,q,t):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t)};g.ya=function(a,b,c,d,e,f,h,k,l,n,q,t,v){return this.h.ya?this.h.ya(a,b,c,d,e,f,h,k,l,n,q,t,v):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v)};
g.za=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w){return this.h.za?this.h.za(a,b,c,d,e,f,h,k,l,n,q,t,v,w):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w)};g.Aa=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y){return this.h.Aa?this.h.Aa(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y)};g.Ba=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B){return this.h.Ba?this.h.Ba(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B)};
g.Ca=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L){return this.h.Ca?this.h.Ca(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L)};g.Da=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U){return this.h.Da?this.h.Da(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U)};
g.Ea=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z){return this.h.Ea?this.h.Ea(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z)};g.Fa=function(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na){return this.h.Fa?this.h.Fa(a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na):this.h.call(null,a,b,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na)};g.Xb=!0;g.F=function(a,b){return new vc(this.h,b)};g.D=function(){return this.j};
function N(a,b){return uc(a)&&!(a?a.i&262144||a.oc||(a.i?0:s(db,a)):s(db,a))?new vc(a,b):null==a?null:eb(a,b)}function xc(a){var b=null!=a;return(b?a?a.i&131072||a.ec||(a.i?0:s(bb,a)):s(bb,a):b)?cb(a):null}function yc(a){return null==a?null:Xa(a)}function zc(a){return null==a?null:Ya(a)}
var Ac=function(){function a(a,b){return null==a?null:Wa(a,b)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.a(a,d);if(r(e))d=F(e),e=I(e);else return a}}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,
e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function Bc(a){return null==a||sa(E(a))}function Cc(a){return null==a?!1:a?a.i&8||a.Ac?!0:a.i?!1:s(Ca,a):s(Ca,a)}function Dc(a){return null==a?!1:a?a.i&4096||a.jc?!0:a.i?!1:s(Va,a):s(Va,a)}function Ec(a){return a?a.i&512||a.yc?!0:a.i?!1:s(Ma,a):s(Ma,a)}function Fc(a){return a?a.i&16777216||a.ic?!0:a.i?!1:s(mb,a):s(mb,a)}
function Gc(a){return null==a?!1:a?a.i&1024||a.cc?!0:a.i?!1:s(Pa,a):s(Pa,a)}function Hc(a){return a?a.i&16384||a.Gc?!0:a.i?!1:s(Za,a):s(Za,a)}function Ic(a){return a?a.q&512||a.zc?!0:!1:!1}function Jc(a){var b=[];da(a,function(a){return function(b,e){return a.push(e)}}(b));return b}function Kc(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,e-=1,b+=1}var Lc={};function Mc(a){return null==a?!1:a?a.i&64||a.bb?!0:a.i?!1:s(Fa,a):s(Fa,a)}function Nc(a){return r(a)?!0:!1}
function Oc(a,b){return Q.c(a,b,Lc)===Lc?!1:!0}function Xb(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(ta(a)===ta(b))return a&&(a.q&2048||a.lb)?a.mb(null,b):ga(a,b);if(u)throw Error("compare on non-nil objects of different types");return null}
var Pc=function(){function a(a,b,c,h){for(;;){var k=Xb(P.a(a,h),P.a(b,h));if(0===k&&h+1<c)h+=1;else return k}}function b(a,b){var f=O(a),h=O(b);return f<h?-1:f>h?1:u?c.n(a,b,f,0):null}var c=null,c=function(c,e,f,h){switch(arguments.length){case 2:return b.call(this,c,e);case 4:return a.call(this,c,e,f,h)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.n=a;return c}();
function Qc(a){return Wb.a(a,Xb)?Xb:function(b,c){var d=a.a?a.a(b,c):a.call(null,b,c);return"number"===typeof d?d:r(d)?-1:r(a.a?a.a(c,b):a.call(null,c,b))?1:0}}
var Sc=function(){function a(a,b){if(E(b)){var c=Rc.b?Rc.b(b):Rc.call(null,b);ha(c,Qc(a));return E(c)}return H}function b(a){return c.a(Xb,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Tc=function(){function a(a,b,c){return Sc.a(function(c,f){return Qc(b).call(null,a.b?a.b(c):a.call(null,c),a.b?a.b(f):a.call(null,f))},c)}function b(a,b){return c.c(a,Xb,b)}
var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),nc=function(){function a(a,b,c){for(c=E(c);;)if(c){b=a.a?a.a(b,F(c)):a.call(null,b,F(c));if(fc(b))return K.b?K.b(b):K.call(null,b);c=I(c)}else return b}function b(a,b){var c=E(b);return c?C.c?C.c(a,F(c),I(c)):C.call(null,a,F(c),I(c)):a.o?a.o():a.call(null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),C=function(){function a(a,b,c){return c&&(c.i&524288||c.Nb)?c.M(null,a,b):c instanceof Array?hc.c(c,a,b):"string"===typeof c?hc.c(c,a,b):s(fb,c)?gb.c(c,a,b):u?nc.c(a,b,c):null}function b(a,b){return b&&(b.i&524288||b.Nb)?b.N(null,a):b instanceof Array?hc.a(b,a):"string"===typeof b?hc.a(b,a):s(fb,b)?gb.a(b,a):u?nc.a(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),Uc=function(){var a=null,b=function(){function a(c,f,h){var k=null;2<arguments.length&&(k=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,f,k)}function b(a,c,d){for(;;)if(a>c)if(I(d))a=c,c=F(d),d=I(d);else return c>F(d);else return!1}a.k=2;a.f=function(a){var c=F(a);a=I(a);var h=F(a);a=G(a);return b(c,h,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;
case 2:return a>d;default:return b.d(a,d,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};a.k=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a>b};a.d=b.d;return a}(),Vc=function(){var a=null,b=function(){function a(c,f,h){var k=null;2<arguments.length&&(k=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,f,k)}function b(a,c,d){for(;;)if(a>=c)if(I(d))a=c,c=F(d),d=I(d);else return c>=F(d);else return!1}a.k=2;a.f=function(a){var c=F(a);a=I(a);var h=F(a);
a=G(a);return b(c,h,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;case 2:return a>=d;default:return b.d(a,d,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};a.k=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a>=b};a.d=b.d;return a}();function Wc(a){return a-1}
var Xc=function(){function a(a,b){return a>b?a:b}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){return C.c(b,a>d?a:d,e)}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);
};b.k=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function Yc(a){a=(a-a%2)/2;return 0<=a?Math.floor.b?Math.floor.b(a):Math.floor.call(null,a):Math.ceil.b?Math.ceil.b(a):Math.ceil.call(null,a)}function Zc(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function $c(a){var b=1;for(a=E(a);;)if(a&&0<b)b-=1,a=I(a);else return a}
var A=function(){function a(a){return null==a?"":a.toString()}var b=null,c=function(){function a(b,d){var k=null;1<arguments.length&&(k=J(Array.prototype.slice.call(arguments,1),0));return c.call(this,b,k)}function c(a,d){for(var e=new ea(b.b(a)),l=d;;)if(r(l))e=e.append(b.b(F(l))),l=I(l);else return e.toString()}a.k=1;a.f=function(a){var b=F(a);a=G(a);return c(b,a)};a.d=c;return a}(),b=function(b,e){switch(arguments.length){case 0:return"";case 1:return a.call(this,b);default:return c.d(b,J(arguments,
1))}throw Error("Invalid arity: "+arguments.length);};b.k=1;b.f=c.f;b.o=function(){return""};b.b=a;b.d=c.d;return b}(),ad=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return a.substring(c);case 3:return a.substring(c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return a.substring(c)};a.c=function(a,c,d){return a.substring(c,d)};return a}();
function lc(a,b){return Nc(Fc(b)?function(){for(var c=E(a),d=E(b);;){if(null==c)return null==d;if(null==d)return!1;if(Wb.a(F(c),F(d)))c=I(c),d=I(d);else return u?!1:null}}():null)}function bd(a,b,c,d,e){this.j=a;this.first=b;this.ta=c;this.count=d;this.m=e;this.i=65937646;this.q=8192}g=bd.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.U=function(){return 1===this.count?null:this.ta};g.L=function(){return this.count};g.Ia=function(){return this.first};g.Ja=function(){return Ia(this)};
g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return H};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return this.first};g.S=function(){return 1===this.count?H:this.ta};g.H=function(){return this};g.F=function(a,b){return new bd(b,this.first,this.ta,this.count,this.m)};g.G=function(a,b){return new bd(this.j,b,this,this.count+1,null)};
function cd(a){this.j=a;this.i=65937614;this.q=8192}g=cd.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.U=function(){return null};g.L=function(){return 0};g.Ia=function(){return null};g.Ja=function(){throw Error("Can't pop empty list");};g.B=function(){return 0};g.v=function(a,b){return lc(this,b)};g.I=function(){return this};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return null};g.S=function(){return H};
g.H=function(){return null};g.F=function(a,b){return new cd(b)};g.G=function(a,b){return new bd(this.j,b,null,1,null)};var H=new cd(null);function dd(a){return a?a.i&134217728||a.Fc?!0:a.i?!1:s(ob,a):s(ob,a)}function ed(a){return dd(a)?pb(a):C.c(pc,H,a)}
var fd=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b;if(a instanceof ac&&0===a.p)b=a.e;else a:{for(b=[];;)if(null!=a)b.push(a.Q(null)),a=a.U(null);else break a;b=void 0}a=b.length;for(var e=H;;)if(0<a){var f=a-1,e=e.G(null,b[a-1]);a=f}else return e}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}();function gd(a,b,c,d){this.j=a;this.first=b;this.ta=c;this.m=d;this.i=65929452;this.q=8192}
g=gd.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.U=function(){return null==this.ta?null:E(this.ta)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return this.first};g.S=function(){return null==this.ta?H:this.ta};g.H=function(){return this};
g.F=function(a,b){return new gd(b,this.first,this.ta,this.m)};g.G=function(a,b){return new gd(null,b,this,this.m)};function M(a,b){var c=null==b;return(c?c:b&&(b.i&64||b.bb))?new gd(null,a,b,null):new gd(null,a,E(b),null)}function T(a,b,c,d){this.fa=a;this.name=b;this.sa=c;this.Ua=d;this.i=2153775105;this.q=4096}g=T.prototype;g.w=function(a,b){return ub(b,":"+A.b(this.sa))};g.B=function(){var a=this.Ua;return null!=a?a:this.Ua=a=Ub(this)+2654435769};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return Q.a(c,this);case 3:return Q.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return Q.a(a,this)};g.a=function(a,b){return Q.c(a,this,b)};g.v=function(a,b){return b instanceof T?this.sa===b.sa:!1};g.toString=function(){return":"+A.b(this.sa)};
function hd(a,b){return a===b?!0:a instanceof T&&b instanceof T?a.sa===b.sa:!1}
var jd=function(){function a(a,b){return new T(a,b,""+A.b(r(a)?""+A.b(a)+"/":null)+A.b(b),null)}function b(a){if(a instanceof T)return a;if(a instanceof Zb){var b;if(a&&(a.q&4096||a.fc))b=a.fa;else throw Error("Doesn't support namespace: "+A.b(a));return new T(b,id.b?id.b(a):id.call(null,a),a.Na,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new T(b[0],b[1],a,null):new T(null,b[0],a,null)):null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,
c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();function V(a,b,c,d){this.j=a;this.Ya=b;this.r=c;this.m=d;this.q=0;this.i=32374988}g=V.prototype;g.toString=function(){return Lb(this)};function kd(a){null!=a.Ya&&(a.r=a.Ya.o?a.Ya.o():a.Ya.call(null),a.Ya=null);return a.r}g.D=function(){return this.j};g.U=function(){lb(this);return null==this.r?null:I(this.r)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};
g.I=function(){return N(H,this.j)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){lb(this);return null==this.r?null:F(this.r)};g.S=function(){lb(this);return null!=this.r?G(this.r):H};g.H=function(){kd(this);if(null==this.r)return null;for(var a=this.r;;)if(a instanceof V)a=kd(a);else return this.r=a,E(this.r)};g.F=function(a,b){return new V(b,this.Ya,this.r,this.m)};g.G=function(a,b){return M(b,this)};
function ld(a,b){this.qb=a;this.end=b;this.q=0;this.i=2}ld.prototype.L=function(){return this.end};ld.prototype.add=function(a){this.qb[this.end]=a;return this.end+=1};ld.prototype.da=function(){var a=new md(this.qb,0,this.end);this.qb=null;return a};function md(a,b,c){this.e=a;this.O=b;this.end=c;this.q=0;this.i=524306}g=md.prototype;g.N=function(a,b){return hc.n(this.e,b,this.e[this.O],this.O+1)};g.M=function(a,b,c){return hc.n(this.e,b,c,this.O)};
g.Kb=function(){if(this.O===this.end)throw Error("-drop-first of empty chunk");return new md(this.e,this.O+1,this.end)};g.J=function(a,b){return this.e[this.O+b]};g.aa=function(a,b,c){return 0<=b&&b<this.end-this.O?this.e[this.O+b]:c};g.L=function(){return this.end-this.O};
var nd=function(){function a(a,b,c){return new md(a,b,c)}function b(a,b){return new md(a,b,a.length)}function c(a){return new md(a,0,a.length)}var d=null,d=function(d,f,h){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,h)}throw Error("Invalid arity: "+arguments.length);};d.b=c;d.a=b;d.c=a;return d}();function od(a,b,c,d){this.da=a;this.oa=b;this.j=c;this.m=d;this.i=31850732;this.q=1536}g=od.prototype;g.toString=function(){return Lb(this)};
g.D=function(){return this.j};g.U=function(){if(1<Aa(this.da))return new od(Gb(this.da),this.oa,this.j,null);var a=lb(this.oa);return null==a?null:a};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.Q=function(){return D.a(this.da,0)};g.S=function(){return 1<Aa(this.da)?new od(Gb(this.da),this.oa,this.j,null):null==this.oa?H:this.oa};g.H=function(){return this};g.sb=function(){return this.da};
g.tb=function(){return null==this.oa?H:this.oa};g.F=function(a,b){return new od(this.da,this.oa,b,this.m)};g.G=function(a,b){return M(b,this)};g.rb=function(){return null==this.oa?null:this.oa};function pd(a,b){return 0===Aa(a)?b:new od(a,b,null,null)}function Rc(a){for(var b=[];;)if(E(a))b.push(F(a)),a=I(a);else return b}function qd(a,b){if(ic(a))return O(a);for(var c=a,d=b,e=0;;)if(0<d&&E(c))c=I(c),d-=1,e+=1;else return e}
var sd=function rd(b){return null==b?null:null==I(b)?E(F(b)):u?M(F(b),rd(I(b))):null},td=function(){function a(a,b){return new V(null,function(){var c=E(a);return c?Ic(c)?pd(Hb(c),d.a(Ib(c),b)):M(F(c),d.a(G(c),b)):b},null,null)}function b(a){return new V(null,function(){return a},null,null)}function c(){return new V(null,function(){return null},null,null)}var d=null,e=function(){function a(c,d,e){var f=null;2<arguments.length&&(f=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,
d,f)}function b(a,c,e){return function t(a,b){return new V(null,function(){var c=E(a);return c?Ic(c)?pd(Hb(c),t(Ib(c),b)):M(F(c),t(G(c),b)):r(b)?t(F(b),I(b)):null},null,null)}(d.a(a,c),e)}a.k=2;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=G(a);return b(c,d,a)};a.d=b;return a}(),d=function(d,h,k){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,d);case 2:return a.call(this,d,h);default:return e.d(d,h,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};d.k=
2;d.f=e.f;d.o=c;d.b=b;d.a=a;d.d=e.d;return d}(),ud=function(){function a(a,b,c,d){return M(a,M(b,M(c,d)))}function b(a,b,c){return M(a,M(b,c))}var c=null,d=function(){function a(c,d,e,n,q){var t=null;4<arguments.length&&(t=J(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,n,t)}function b(a,c,d,e,f){return M(a,M(c,M(d,M(e,sd(f)))))}a.k=4;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=I(a);var q=F(a);a=G(a);return b(c,d,e,q,a)};a.d=b;return a}(),c=function(c,f,
h,k,l){switch(arguments.length){case 1:return E(c);case 2:return M(c,f);case 3:return b.call(this,c,f,h);case 4:return a.call(this,c,f,h,k);default:return d.d(c,f,h,k,J(arguments,4))}throw Error("Invalid arity: "+arguments.length);};c.k=4;c.f=d.f;c.b=function(a){return E(a)};c.a=function(a,b){return M(a,b)};c.c=b;c.n=a;c.d=d.d;return c}();function vd(a){return Ab(a)}
var wd=function(){var a=null,b=function(){function a(c,f,h){var k=null;2<arguments.length&&(k=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,f,k)}function b(a,c,d){for(;;)if(a=zb(a,c),r(d))c=F(d),d=I(d);else return a}a.k=2;a.f=function(a){var c=F(a);a=I(a);var h=F(a);a=G(a);return b(c,h,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 2:return zb(a,d);default:return b.d(a,d,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};a.k=2;a.f=b.f;a.a=
function(a,b){return zb(a,b)};a.d=b.d;return a}(),xd=function(){var a=null,b=function(){function a(c,f,h,k){var l=null;3<arguments.length&&(l=J(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,f,h,l)}function b(a,c,d,k){for(;;)if(a=Bb(a,c,d),r(k))c=F(k),d=F(I(k)),k=I(I(k));else return a}a.k=3;a.f=function(a){var c=F(a);a=I(a);var h=F(a);a=I(a);var k=F(a);a=G(a);return b(c,h,k,a)};a.d=b;return a}(),a=function(a,d,e,f){switch(arguments.length){case 3:return Bb(a,d,e);default:return b.d(a,
d,e,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};a.k=3;a.f=b.f;a.c=function(a,b,e){return Bb(a,b,e)};a.d=b.d;return a}(),yd=function(){var a=null,b=function(){function a(c,f,h){var k=null;2<arguments.length&&(k=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,f,k)}function b(a,c,d){for(;;)if(a=Cb(a,c),r(d))c=F(d),d=I(d);else return a}a.k=2;a.f=function(a){var c=F(a);a=I(a);var h=F(a);a=G(a);return b(c,h,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 2:return Cb(a,
d);default:return b.d(a,d,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};a.k=2;a.f=b.f;a.a=function(a,b){return Cb(a,b)};a.d=b.d;return a}(),zd=function(){var a=null,b=function(){function a(c,f,h){var k=null;2<arguments.length&&(k=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,f,k)}function b(a,c,d){for(;;)if(a=Fb(a,c),r(d))c=F(d),d=I(d);else return a}a.k=2;a.f=function(a){var c=F(a);a=I(a);var h=F(a);a=G(a);return b(c,h,a)};a.d=b;return a}(),a=function(a,d,
e){switch(arguments.length){case 2:return Fb(a,d);default:return b.d(a,d,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};a.k=2;a.f=b.f;a.a=function(a,b){return Fb(a,b)};a.d=b.d;return a}();
function Ad(a,b,c){var d=E(c);if(0===b)return a.o?a.o():a.call(null);c=Ha(d);var e=Ia(d);if(1===b)return a.b?a.b(c):a.b?a.b(c):a.call(null,c);var d=Ha(e),f=Ia(e);if(2===b)return a.a?a.a(c,d):a.a?a.a(c,d):a.call(null,c,d);var e=Ha(f),h=Ia(f);if(3===b)return a.c?a.c(c,d,e):a.c?a.c(c,d,e):a.call(null,c,d,e);var f=Ha(h),k=Ia(h);if(4===b)return a.n?a.n(c,d,e,f):a.n?a.n(c,d,e,f):a.call(null,c,d,e,f);var h=Ha(k),l=Ia(k);if(5===b)return a.s?a.s(c,d,e,f,h):a.s?a.s(c,d,e,f,h):a.call(null,c,d,e,f,h);var k=Ha(l),
n=Ia(l);if(6===b)return a.X?a.X(c,d,e,f,h,k):a.X?a.X(c,d,e,f,h,k):a.call(null,c,d,e,f,h,k);var l=Ha(n),q=Ia(n);if(7===b)return a.ga?a.ga(c,d,e,f,h,k,l):a.ga?a.ga(c,d,e,f,h,k,l):a.call(null,c,d,e,f,h,k,l);var n=Ha(q),t=Ia(q);if(8===b)return a.Ga?a.Ga(c,d,e,f,h,k,l,n):a.Ga?a.Ga(c,d,e,f,h,k,l,n):a.call(null,c,d,e,f,h,k,l,n);var q=Ha(t),v=Ia(t);if(9===b)return a.Ha?a.Ha(c,d,e,f,h,k,l,n,q):a.Ha?a.Ha(c,d,e,f,h,k,l,n,q):a.call(null,c,d,e,f,h,k,l,n,q);var t=Ha(v),w=Ia(v);if(10===b)return a.va?a.va(c,d,e,
f,h,k,l,n,q,t):a.va?a.va(c,d,e,f,h,k,l,n,q,t):a.call(null,c,d,e,f,h,k,l,n,q,t);var v=Ha(w),y=Ia(w);if(11===b)return a.wa?a.wa(c,d,e,f,h,k,l,n,q,t,v):a.wa?a.wa(c,d,e,f,h,k,l,n,q,t,v):a.call(null,c,d,e,f,h,k,l,n,q,t,v);var w=Ha(y),B=Ia(y);if(12===b)return a.xa?a.xa(c,d,e,f,h,k,l,n,q,t,v,w):a.xa?a.xa(c,d,e,f,h,k,l,n,q,t,v,w):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w);var y=Ha(B),L=Ia(B);if(13===b)return a.ya?a.ya(c,d,e,f,h,k,l,n,q,t,v,w,y):a.ya?a.ya(c,d,e,f,h,k,l,n,q,t,v,w,y):a.call(null,c,d,e,f,h,k,l,n,q,
t,v,w,y);var B=Ha(L),U=Ia(L);if(14===b)return a.za?a.za(c,d,e,f,h,k,l,n,q,t,v,w,y,B):a.za?a.za(c,d,e,f,h,k,l,n,q,t,v,w,y,B):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B);var L=Ha(U),Z=Ia(U);if(15===b)return a.Aa?a.Aa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L):a.Aa?a.Aa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L);var U=Ha(Z),na=Ia(Z);if(16===b)return a.Ba?a.Ba(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U):a.Ba?a.Ba(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U);var Z=
Ha(na),Ga=Ia(na);if(17===b)return a.Ca?a.Ca(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z):a.Ca?a.Ca(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z);var na=Ha(Ga),Ra=Ia(Ga);if(18===b)return a.Da?a.Da(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na):a.Da?a.Da(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na);Ga=Ha(Ra);Ra=Ia(Ra);if(19===b)return a.Ea?a.Ea(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga):a.Ea?a.Ea(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga):a.call(null,
c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga);var wc=Ha(Ra);Ia(Ra);if(20===b)return a.Fa?a.Fa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,wc):a.Fa?a.Fa(c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,wc):a.call(null,c,d,e,f,h,k,l,n,q,t,v,w,y,B,L,U,Z,na,Ga,wc);throw Error("Only up to 20 arguments supported on functions");}
var S=function(){function a(a,b,c,d,e){b=ud.n(b,c,d,e);c=a.k;return a.f?(d=qd(b,c+1),d<=c?Ad(a,d,b):a.f(b)):a.apply(a,Rc(b))}function b(a,b,c,d){b=ud.c(b,c,d);c=a.k;return a.f?(d=qd(b,c+1),d<=c?Ad(a,d,b):a.f(b)):a.apply(a,Rc(b))}function c(a,b,c){b=ud.a(b,c);c=a.k;if(a.f){var d=qd(b,c+1);return d<=c?Ad(a,d,b):a.f(b)}return a.apply(a,Rc(b))}function d(a,b){var c=a.k;if(a.f){var d=qd(b,c+1);return d<=c?Ad(a,d,b):a.f(b)}return a.apply(a,Rc(b))}var e=null,f=function(){function a(c,d,e,f,h,w){var y=null;
5<arguments.length&&(y=J(Array.prototype.slice.call(arguments,5),0));return b.call(this,c,d,e,f,h,y)}function b(a,c,d,e,f,h){c=M(c,M(d,M(e,M(f,sd(h)))));d=a.k;return a.f?(e=qd(c,d+1),e<=d?Ad(a,e,c):a.f(c)):a.apply(a,Rc(c))}a.k=5;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=I(a);var f=F(a);a=I(a);var h=F(a);a=G(a);return b(c,d,e,f,h,a)};a.d=b;return a}(),e=function(e,k,l,n,q,t){switch(arguments.length){case 2:return d.call(this,e,k);case 3:return c.call(this,e,k,l);case 4:return b.call(this,
e,k,l,n);case 5:return a.call(this,e,k,l,n,q);default:return f.d(e,k,l,n,q,J(arguments,5))}throw Error("Invalid arity: "+arguments.length);};e.k=5;e.f=f.f;e.a=d;e.c=c;e.n=b;e.s=a;e.d=f.d;return e}(),Bd=function(){function a(a,b){return!Wb.a(a,b)}var b=null,c=function(){function a(c,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,l)}function b(a,c,d){return sa(S.n(Wb,a,c,d))}a.k=2;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=G(a);return b(c,
d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!1;case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(){return!1};b.a=a;b.d=c.d;return b}();function Cd(a){return E(a)?a:null}function Dd(a,b){for(;;){if(null==E(b))return!0;if(r(a.b?a.b(F(b)):a.call(null,F(b)))){var c=a,d=I(b);a=c;b=d}else return u?!1:null}}
function Ed(a,b){for(;;)if(E(b)){var c=a.b?a.b(F(b)):a.call(null,F(b));if(r(c))return c;var c=a,d=I(b);a=c;b=d}else return null}function Fd(a){return a}
function Gd(a){return function(){var b=null,c=function(){function b(a,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,a,d,l)}function c(b,d,e){return sa(S.n(a,b,d,e))}b.k=2;b.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};b.d=c;return b}(),b=function(b,e,f){switch(arguments.length){case 0:return sa(a.o?a.o():a.call(null));case 1:var h=b;return sa(a.b?a.b(h):a.call(null,h));case 2:var h=b,k=e;return sa(a.a?a.a(h,k):a.call(null,
h,k));default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;return b}()}
var Hd=function(){function a(a,b,c){return function(){var d=null,l=function(){function d(a,b,c,e){var f=null;3<arguments.length&&(f=J(Array.prototype.slice.call(arguments,3),0));return k.call(this,a,b,c,f)}function k(d,l,n,q){return a.b?a.b(b.b?b.b(S.s(c,d,l,n,q)):b.call(null,S.s(c,d,l,n,q))):a.call(null,b.b?b.b(S.s(c,d,l,n,q)):b.call(null,S.s(c,d,l,n,q)))}d.k=3;d.f=function(a){var b=F(a);a=I(a);var c=F(a);a=I(a);var d=F(a);a=G(a);return k(b,c,d,a)};d.d=k;return d}(),d=function(d,k,t,v){switch(arguments.length){case 0:return a.b?
a.b(b.b?b.b(c.o?c.o():c.call(null)):b.call(null,c.o?c.o():c.call(null))):a.call(null,b.b?b.b(c.o?c.o():c.call(null)):b.call(null,c.o?c.o():c.call(null)));case 1:var w=d;return a.b?a.b(b.b?b.b(c.b?c.b(w):c.call(null,w)):b.call(null,c.b?c.b(w):c.call(null,w))):a.call(null,b.b?b.b(c.b?c.b(w):c.call(null,w)):b.call(null,c.b?c.b(w):c.call(null,w)));case 2:var w=d,y=k;return a.b?a.b(b.b?b.b(c.a?c.a(w,y):c.call(null,w,y)):b.call(null,c.a?c.a(w,y):c.call(null,w,y))):a.call(null,b.b?b.b(c.a?c.a(w,y):c.call(null,
w,y)):b.call(null,c.a?c.a(w,y):c.call(null,w,y)));case 3:var w=d,y=k,B=t;return a.b?a.b(b.b?b.b(c.c?c.c(w,y,B):c.call(null,w,y,B)):b.call(null,c.c?c.c(w,y,B):c.call(null,w,y,B))):a.call(null,b.b?b.b(c.c?c.c(w,y,B):c.call(null,w,y,B)):b.call(null,c.c?c.c(w,y,B):c.call(null,w,y,B)));default:return l.d(d,k,t,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};d.k=3;d.f=l.f;return d}()}function b(a,b){return function(){var c=null,d=function(){function c(a,b,e,f){var h=null;3<arguments.length&&
(h=J(Array.prototype.slice.call(arguments,3),0));return d.call(this,a,b,e,h)}function d(c,h,k,l){return a.b?a.b(S.s(b,c,h,k,l)):a.call(null,S.s(b,c,h,k,l))}c.k=3;c.f=function(a){var b=F(a);a=I(a);var c=F(a);a=I(a);var e=F(a);a=G(a);return d(b,c,e,a)};c.d=d;return c}(),c=function(c,h,q,t){switch(arguments.length){case 0:return a.b?a.b(b.o?b.o():b.call(null)):a.call(null,b.o?b.o():b.call(null));case 1:var v=c;return a.b?a.b(b.b?b.b(v):b.call(null,v)):a.call(null,b.b?b.b(v):b.call(null,v));case 2:var v=
c,w=h;return a.b?a.b(b.a?b.a(v,w):b.call(null,v,w)):a.call(null,b.a?b.a(v,w):b.call(null,v,w));case 3:var v=c,w=h,y=q;return a.b?a.b(b.c?b.c(v,w,y):b.call(null,v,w,y)):a.call(null,b.c?b.c(v,w,y):b.call(null,v,w,y));default:return d.d(c,h,q,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};c.k=3;c.f=d.f;return c}()}var c=null,d=function(){function a(c,d,e,n){var q=null;3<arguments.length&&(q=J(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,d,e,q)}function b(a,c,d,
e){return function(a){return function(){function b(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return c.call(this,d)}function c(b){b=S.a(F(a),b);for(var d=I(a);;)if(d)b=F(d).call(null,b),d=I(d);else return b}b.k=0;b.f=function(a){a=E(a);return c(a)};b.d=c;return b}()}(ed(ud.n(a,c,d,e)))}a.k=3;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=G(a);return b(c,d,e,a)};a.d=b;return a}(),c=function(c,f,h,k){switch(arguments.length){case 0:return Fd;
case 1:return c;case 2:return b.call(this,c,f);case 3:return a.call(this,c,f,h);default:return d.d(c,f,h,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};c.k=3;c.f=d.f;c.o=function(){return Fd};c.b=function(a){return a};c.a=b;c.c=a;c.d=d.d;return c}(),Id=function(){function a(a,b,c,d){return function(){function e(a){var b=null;0<arguments.length&&(b=J(Array.prototype.slice.call(arguments,0),0));return q.call(this,b)}function q(e){return S.s(a,b,c,d,e)}e.k=0;e.f=function(a){a=E(a);
return q(a)};e.d=q;return e}()}function b(a,b,c){return function(){function d(a){var b=null;0<arguments.length&&(b=J(Array.prototype.slice.call(arguments,0),0));return e.call(this,b)}function e(d){return S.n(a,b,c,d)}d.k=0;d.f=function(a){a=E(a);return e(a)};d.d=e;return d}()}function c(a,b){return function(){function c(a){var b=null;0<arguments.length&&(b=J(Array.prototype.slice.call(arguments,0),0));return d.call(this,b)}function d(c){return S.c(a,b,c)}c.k=0;c.f=function(a){a=E(a);return d(a)};
c.d=d;return c}()}var d=null,e=function(){function a(c,d,e,f,t){var v=null;4<arguments.length&&(v=J(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,v)}function b(a,c,d,e,f){return function(){function b(a){var c=null;0<arguments.length&&(c=J(Array.prototype.slice.call(arguments,0),0));return h.call(this,c)}function h(b){return S.s(a,c,d,e,td.a(f,b))}b.k=0;b.f=function(a){a=E(a);return h(a)};b.d=h;return b}()}a.k=4;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);
a=I(a);var f=F(a);a=G(a);return b(c,d,e,f,a)};a.d=b;return a}(),d=function(d,h,k,l,n){switch(arguments.length){case 1:return d;case 2:return c.call(this,d,h);case 3:return b.call(this,d,h,k);case 4:return a.call(this,d,h,k,l);default:return e.d(d,h,k,l,J(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.k=4;d.f=e.f;d.b=function(a){return a};d.a=c;d.c=b;d.n=a;d.d=e.d;return d}(),Jd=function(){function a(a,b,c,d){return function(){var l=null,n=function(){function l(a,b,c,d){var e=null;
3<arguments.length&&(e=J(Array.prototype.slice.call(arguments,3),0));return n.call(this,a,b,c,e)}function n(l,q,t,B){return S.s(a,null==l?b:l,null==q?c:q,null==t?d:t,B)}l.k=3;l.f=function(a){var b=F(a);a=I(a);var c=F(a);a=I(a);var d=F(a);a=G(a);return n(b,c,d,a)};l.d=n;return l}(),l=function(l,t,v,w){switch(arguments.length){case 2:var y=l,B=t;return a.a?a.a(null==y?b:y,null==B?c:B):a.call(null,null==y?b:y,null==B?c:B);case 3:var y=l,B=t,L=v;return a.c?a.c(null==y?b:y,null==B?c:B,null==L?d:L):a.call(null,
null==y?b:y,null==B?c:B,null==L?d:L);default:return n.d(l,t,v,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};l.k=3;l.f=n.f;return l}()}function b(a,b,c){return function(){var d=null,l=function(){function d(a,b,c,e){var f=null;3<arguments.length&&(f=J(Array.prototype.slice.call(arguments,3),0));return k.call(this,a,b,c,f)}function k(d,l,n,q){return S.s(a,null==d?b:d,null==l?c:l,n,q)}d.k=3;d.f=function(a){var b=F(a);a=I(a);var c=F(a);a=I(a);var d=F(a);a=G(a);return k(b,c,d,a)};d.d=
k;return d}(),d=function(d,k,t,v){switch(arguments.length){case 2:var w=d,y=k;return a.a?a.a(null==w?b:w,null==y?c:y):a.call(null,null==w?b:w,null==y?c:y);case 3:var w=d,y=k,B=t;return a.c?a.c(null==w?b:w,null==y?c:y,B):a.call(null,null==w?b:w,null==y?c:y,B);default:return l.d(d,k,t,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};d.k=3;d.f=l.f;return d}()}function c(a,b){return function(){var c=null,d=function(){function c(a,b,e,f){var h=null;3<arguments.length&&(h=J(Array.prototype.slice.call(arguments,
3),0));return d.call(this,a,b,e,h)}function d(c,h,k,l){return S.s(a,null==c?b:c,h,k,l)}c.k=3;c.f=function(a){var b=F(a);a=I(a);var c=F(a);a=I(a);var e=F(a);a=G(a);return d(b,c,e,a)};c.d=d;return c}(),c=function(c,h,q,t){switch(arguments.length){case 1:var v=c;return a.b?a.b(null==v?b:v):a.call(null,null==v?b:v);case 2:var v=c,w=h;return a.a?a.a(null==v?b:v,w):a.call(null,null==v?b:v,w);case 3:var v=c,w=h,y=q;return a.c?a.c(null==v?b:v,w,y):a.call(null,null==v?b:v,w,y);default:return d.d(c,h,q,J(arguments,
3))}throw Error("Invalid arity: "+arguments.length);};c.k=3;c.f=d.f;return c}()}var d=null,d=function(d,f,h,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,h);case 4:return a.call(this,d,f,h,k)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),Kd=function(){function a(a,b,c,e){return new V(null,function(){var n=E(b),q=E(c),t=E(e);return n&&q&&t?M(a.c?a.c(F(n),F(q),F(t)):a.call(null,F(n),F(q),F(t)),d.n(a,G(n),G(q),G(t))):null},
null,null)}function b(a,b,c){return new V(null,function(){var e=E(b),n=E(c);return e&&n?M(a.a?a.a(F(e),F(n)):a.call(null,F(e),F(n)),d.c(a,G(e),G(n))):null},null,null)}function c(a,b){return new V(null,function(){var c=E(b);if(c){if(Ic(c)){for(var e=Hb(c),n=O(e),q=new ld(Array(n),0),t=0;;)if(t<n){var v=a.b?a.b(D.a(e,t)):a.call(null,D.a(e,t));q.add(v);t+=1}else break;return pd(q.da(),d.a(a,Ib(c)))}return M(a.b?a.b(F(c)):a.call(null,F(c)),d.a(a,G(c)))}return null},null,null)}var d=null,e=function(){function a(c,
d,e,f,t){var v=null;4<arguments.length&&(v=J(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,v)}function b(a,c,e,f,h){var v=function y(a){return new V(null,function(){var b=d.a(E,a);return Dd(Fd,b)?M(d.a(F,b),y(d.a(G,b))):null},null,null)};return d.a(function(){return function(b){return S.a(a,b)}}(v),v(pc.d(h,f,J([e,c],0))))}a.k=4;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=I(a);var f=F(a);a=G(a);return b(c,d,e,f,a)};a.d=b;return a}(),d=function(d,h,k,l,
n){switch(arguments.length){case 2:return c.call(this,d,h);case 3:return b.call(this,d,h,k);case 4:return a.call(this,d,h,k,l);default:return e.d(d,h,k,l,J(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.k=4;d.f=e.f;d.a=c;d.c=b;d.n=a;d.d=e.d;return d}(),Md=function Ld(b,c){return new V(null,function(){if(0<b){var d=E(c);return d?M(F(d),Ld(b-1,G(d))):null}return null},null,null)};
function Nd(a,b){return new V(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=E(b);if(0<a&&e){var f=a-1,e=G(e);a=f;b=e}else return e}}),null,null)}
var Od=function(){function a(a,b){return Md(a,c.b(b))}function b(a){return new V(null,function(){return M(a,c.b(a))},null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Pd=function(){function a(a,b){return Md(a,c.b(b))}function b(a){return new V(null,function(){return M(a.o?a.o():a.call(null),c.b(a))},null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Qd=function(){function a(a,c){return new V(null,function(){var f=E(a),h=E(c);return f&&h?M(F(f),M(F(h),b.a(G(f),G(h)))):null},null,null)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){return new V(null,function(){var c=Kd.a(E,pc.d(e,d,J([a],0)));return Dd(Fd,c)?td.a(Kd.a(F,
c),S.a(b,Kd.a(G,c))):null},null,null)}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.a=a;b.d=c.d;return b}();function Rd(a){return function c(a,e){return new V(null,function(){var f=E(a);return f?M(F(f),c(G(f),e)):E(e)?c(F(e),G(e)):null},null,null)}(null,a)}
var Sd=function(){function a(a,b){return Rd(Kd.a(a,b))}var b=null,c=function(){function a(c,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,l)}function b(a,c,d){return Rd(S.n(Kd,a,c,d))}a.k=2;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=G(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};
b.k=2;b.f=c.f;b.a=a;b.d=c.d;return b}(),Ud=function Td(b,c){return new V(null,function(){var d=E(c);if(d){if(Ic(d)){for(var e=Hb(d),f=O(e),h=new ld(Array(f),0),k=0;;)if(k<f){if(r(b.b?b.b(D.a(e,k)):b.call(null,D.a(e,k)))){var l=D.a(e,k);h.add(l)}k+=1}else break;return pd(h.da(),Td(b,Ib(d)))}e=F(d);d=G(d);return r(b.b?b.b(e):b.call(null,e))?M(e,Td(b,d)):Td(b,d)}return null},null,null)};function Vd(a,b){return Ud(Gd(a),b)}
function Wd(a){var b=Xd;return function d(a){return new V(null,function(){return M(a,r(b.b?b.b(a):b.call(null,a))?Sd.a(d,E.b?E.b(a):E.call(null,a)):null)},null,null)}(a)}function Yd(a,b){return null!=a?a&&(a.q&4||a.Bc)?vd(C.c(zb,yb(a),b)):C.c(Da,a,b):C.c(pc,H,b)}
var Zd=function(){function a(a,b,c,k){return new V(null,function(){var l=E(k);if(l){var n=Md(a,l);return a===O(n)?M(n,d.n(a,b,c,Nd(b,l))):Da(H,Md(a,td.a(n,c)))}return null},null,null)}function b(a,b,c){return new V(null,function(){var k=E(c);if(k){var l=Md(a,k);return a===O(l)?M(l,d.c(a,b,Nd(b,k))):null}return null},null,null)}function c(a,b){return d.c(a,a,b)}var d=null,d=function(d,f,h,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,h);case 4:return a.call(this,
d,f,h,k)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),$d=function(){function a(a,b,c){var h=Lc;for(b=E(b);;)if(b){var k=a;if(k?k.i&256||k.Mb||(k.i?0:s(Ka,k)):s(Ka,k)){a=Q.c(a,F(b),h);if(h===a)return c;b=I(b)}else return c}else return a}function b(a,b){return c.c(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),ae=
function(){function a(a,b,c,d,f,t){var v=P.c(b,0,null);return(b=$c(b))?R.c(a,v,e.X(Q.a(a,v),b,c,d,f,t)):R.c(a,v,c.n?c.n(Q.a(a,v),d,f,t):c.call(null,Q.a(a,v),d,f,t))}function b(a,b,c,d,f){var t=P.c(b,0,null);return(b=$c(b))?R.c(a,t,e.s(Q.a(a,t),b,c,d,f)):R.c(a,t,c.c?c.c(Q.a(a,t),d,f):c.call(null,Q.a(a,t),d,f))}function c(a,b,c,d){var f=P.c(b,0,null);return(b=$c(b))?R.c(a,f,e.n(Q.a(a,f),b,c,d)):R.c(a,f,c.a?c.a(Q.a(a,f),d):c.call(null,Q.a(a,f),d))}function d(a,b,c){var d=P.c(b,0,null);return(b=$c(b))?
R.c(a,d,e.c(Q.a(a,d),b,c)):R.c(a,d,c.b?c.b(Q.a(a,d)):c.call(null,Q.a(a,d)))}var e=null,f=function(){function a(c,d,e,f,h,w,y){var B=null;6<arguments.length&&(B=J(Array.prototype.slice.call(arguments,6),0));return b.call(this,c,d,e,f,h,w,B)}function b(a,c,d,f,h,k,y){var B=P.c(c,0,null);return(c=$c(c))?R.c(a,B,S.d(e,Q.a(a,B),c,d,f,J([h,k,y],0))):R.c(a,B,S.d(d,Q.a(a,B),f,h,k,J([y],0)))}a.k=6;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=I(a);var f=F(a);a=I(a);var h=F(a);a=I(a);var y=
F(a);a=G(a);return b(c,d,e,f,h,y,a)};a.d=b;return a}(),e=function(e,k,l,n,q,t,v){switch(arguments.length){case 3:return d.call(this,e,k,l);case 4:return c.call(this,e,k,l,n);case 5:return b.call(this,e,k,l,n,q);case 6:return a.call(this,e,k,l,n,q,t);default:return f.d(e,k,l,n,q,t,J(arguments,6))}throw Error("Invalid arity: "+arguments.length);};e.k=6;e.f=f.f;e.c=d;e.n=c;e.s=b;e.X=a;e.d=f.d;return e}();function be(a,b){this.t=a;this.e=b}
function ce(a){return new be(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function de(a){return new be(a.t,va(a.e))}function ee(a){a=a.g;return 32>a?0:a-1>>>5<<5}function fe(a,b,c){for(;;){if(0===b)return c;var d=ce(a);d.e[0]=c;c=d;b-=5}}var he=function ge(b,c,d,e){var f=de(d),h=b.g-1>>>c&31;5===c?f.e[h]=e:(d=d.e[h],b=null!=d?ge(b,c-5,d,e):fe(null,c-5,e),f.e[h]=b);return f};
function ie(a,b){throw Error("No item "+A.b(a)+" in vector of length "+A.b(b));}function je(a){var b=a.root;for(a=a.shift;;)if(0<a)a-=5,b=b.e[0];else return b.e}function ke(a,b){if(b>=ee(a))return a.R;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.e[b>>>d&31],d=e;else return c.e}function le(a,b){return 0<=b&&b<a.g?ke(a,b):ie(b,a.g)}
var ne=function me(b,c,d,e,f){var h=de(d);if(0===c)h.e[e&31]=f;else{var k=e>>>c&31;b=me(b,c-5,d.e[k],e,f);h.e[k]=b}return h},pe=function oe(b,c,d){var e=b.g-2>>>c&31;if(5<c){b=oe(b,c-5,d.e[e]);if(null==b&&0===e)return null;d=de(d);d.e[e]=b;return d}return 0===e?null:u?(d=de(d),d.e[e]=null,d):null};function W(a,b,c,d,e,f){this.j=a;this.g=b;this.shift=c;this.root=d;this.R=e;this.m=f;this.i=167668511;this.q=8196}g=W.prototype;g.toString=function(){return Lb(this)};
g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return"number"===typeof b?D.c(this,b,c):c};g.Za=function(a,b,c){a=[0,c];for(c=0;;)if(c<this.g){var d=ke(this,c),e=d.length;a:{for(var f=0,h=a[1];;)if(f<e){h=b.c?b.c(h,f+c,d[f]):b.call(null,h,f+c,d[f]);if(fc(h)){d=h;break a}f+=1}else{a[0]=e;d=a[1]=h;break a}d=void 0}if(fc(d))return K.b?K.b(d):K.call(null,d);c+=a[0]}else return a[1]};g.J=function(a,b){return le(this,b)[b&31]};
g.aa=function(a,b,c){return 0<=b&&b<this.g?ke(this,b)[b&31]:c};g.Pa=function(a,b,c){if(0<=b&&b<this.g)return ee(this)<=b?(a=va(this.R),a[b&31]=c,new W(this.j,this.g,this.shift,this.root,a,null)):new W(this.j,this.g,this.shift,ne(this,this.shift,this.root,b,c),this.R,null);if(b===this.g)return Da(this,c);if(u)throw Error("Index "+A.b(b)+" out of bounds  [0,"+A.b(this.g)+"]");return null};g.D=function(){return this.j};g.L=function(){return this.g};g.$a=function(){return D.a(this,0)};
g.ab=function(){return D.a(this,1)};g.Ia=function(){return 0<this.g?D.a(this,this.g-1):null};g.Ja=function(){if(0===this.g)throw Error("Can't pop empty vector");if(1===this.g)return eb(qe,this.j);if(1<this.g-ee(this))return new W(this.j,this.g-1,this.shift,this.root,this.R.slice(0,-1),null);if(u){var a=ke(this,this.g-2),b=pe(this,this.shift,this.root),b=null==b?X:b,c=this.g-1;return 5<this.shift&&null==b.e[1]?new W(this.j,c,this.shift-5,b.e[0],a,null):new W(this.j,c,this.shift,b,a,null)}return null};
g.Xa=function(){return 0<this.g?new kc(this,this.g-1,null):null};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.Wa=function(){return new re(this.g,this.shift,se.b?se.b(this.root):se.call(null,this.root),te.b?te.b(this.R):te.call(null,this.R))};g.I=function(){return N(qe,this.j)};g.N=function(a,b){return gc.a(this,b)};g.M=function(a,b,c){return gc.c(this,b,c)};
g.ua=function(a,b,c){if("number"===typeof b)return $a(this,b,c);throw Error("Vector's key for assoc must be a number.");};g.H=function(){return 0===this.g?null:32>=this.g?new ac(this.R,0):u?ue.n?ue.n(this,je(this),0,0):ue.call(null,this,je(this),0,0):null};g.F=function(a,b){return new W(b,this.g,this.shift,this.root,this.R,this.m)};
g.G=function(a,b){if(32>this.g-ee(this)){for(var c=this.R.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.R[e],e+=1;else break;d[c]=b;return new W(this.j,this.g+1,this.shift,this.root,d,null)}c=(d=this.g>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=ce(null),d.e[0]=this.root,e=fe(null,this.shift,new be(null,this.R)),d.e[1]=e):d=he(this,this.shift,this.root,new be(null,this.R));return new W(this.j,this.g+1,c,d,[b],null)};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.J(null,c);case 3:return this.aa(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.J(null,a)};g.a=function(a,b){return this.aa(null,a,b)};
var X=new be(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),qe=new W(null,0,5,X,[],0);function ve(a,b){var c=a.length,d=b?a:va(a);if(32>c)return new W(null,c,5,X,d,null);for(var e=32,f=(new W(null,32,5,X,d.slice(0,32),null)).Wa(null);;)if(e<c)var h=e+1,f=wd.a(f,d[e]),e=h;else return Ab(f)}function we(a){return Ab(C.c(zb,yb(qe),a))}
var xe=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return a instanceof ac&&0===a.p?ve.a?ve.a(a.e,!0):ve.call(null,a.e,!0):we(a)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}();function ye(a,b,c,d,e,f){this.P=a;this.ea=b;this.p=c;this.O=d;this.j=e;this.m=f;this.i=32243948;this.q=1536}g=ye.prototype;g.toString=function(){return Lb(this)};
g.U=function(){if(this.O+1<this.ea.length){var a=ue.n?ue.n(this.P,this.ea,this.p,this.O+1):ue.call(null,this.P,this.ea,this.p,this.O+1);return null==a?null:a}return Jb(this)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(qe,this.j)};g.N=function(a,b){return gc.a(ze.c?ze.c(this.P,this.p+this.O,O(this.P)):ze.call(null,this.P,this.p+this.O,O(this.P)),b)};
g.M=function(a,b,c){return gc.c(ze.c?ze.c(this.P,this.p+this.O,O(this.P)):ze.call(null,this.P,this.p+this.O,O(this.P)),b,c)};g.Q=function(){return this.ea[this.O]};g.S=function(){if(this.O+1<this.ea.length){var a=ue.n?ue.n(this.P,this.ea,this.p,this.O+1):ue.call(null,this.P,this.ea,this.p,this.O+1);return null==a?H:a}return Ib(this)};g.H=function(){return this};g.sb=function(){return nd.a(this.ea,this.O)};
g.tb=function(){var a=this.p+this.ea.length;return a<Aa(this.P)?ue.n?ue.n(this.P,ke(this.P,a),a,0):ue.call(null,this.P,ke(this.P,a),a,0):H};g.F=function(a,b){return ue.s?ue.s(this.P,this.ea,this.p,this.O,b):ue.call(null,this.P,this.ea,this.p,this.O,b)};g.G=function(a,b){return M(b,this)};g.rb=function(){var a=this.p+this.ea.length;return a<Aa(this.P)?ue.n?ue.n(this.P,ke(this.P,a),a,0):ue.call(null,this.P,ke(this.P,a),a,0):null};
var ue=function(){function a(a,b,c,d,l){return new ye(a,b,c,d,l,null)}function b(a,b,c,d){return new ye(a,b,c,d,null,null)}function c(a,b,c){return new ye(a,le(a,b),b,c,null,null)}var d=null,d=function(d,f,h,k,l){switch(arguments.length){case 3:return c.call(this,d,f,h);case 4:return b.call(this,d,f,h,k);case 5:return a.call(this,d,f,h,k,l)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.n=b;d.s=a;return d}();
function Ae(a,b,c,d,e){this.j=a;this.ca=b;this.start=c;this.end=d;this.m=e;this.i=166617887;this.q=8192}g=Ae.prototype;g.toString=function(){return Lb(this)};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return"number"===typeof b?D.c(this,b,c):c};g.J=function(a,b){return 0>b||this.end<=this.start+b?ie(b,this.end-this.start):D.a(this.ca,this.start+b)};g.aa=function(a,b,c){return 0>b||this.end<=this.start+b?c:D.c(this.ca,this.start+b,c)};
g.Pa=function(a,b,c){var d=this,e=d.start+b;return Be.s?Be.s(d.j,R.c(d.ca,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null):Be.call(null,d.j,R.c(d.ca,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null)};g.D=function(){return this.j};g.L=function(){return this.end-this.start};g.Ia=function(){return D.a(this.ca,this.end-1)};
g.Ja=function(){if(this.start===this.end)throw Error("Can't pop empty vector");return Be.s?Be.s(this.j,this.ca,this.start,this.end-1,null):Be.call(null,this.j,this.ca,this.start,this.end-1,null)};g.Xa=function(){return this.start!==this.end?new kc(this,this.end-this.start-1,null):null};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(qe,this.j)};g.N=function(a,b){return gc.a(this,b)};
g.M=function(a,b,c){return gc.c(this,b,c)};g.ua=function(a,b,c){if("number"===typeof b)return $a(this,b,c);throw Error("Subvec's key for assoc must be a number.");};g.H=function(){var a=this;return function(b){return function d(e){return e===a.end?null:M(D.a(a.ca,e),new V(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};g.F=function(a,b){return Be.s?Be.s(b,this.ca,this.start,this.end,this.m):Be.call(null,b,this.ca,this.start,this.end,this.m)};
g.G=function(a,b){return Be.s?Be.s(this.j,$a(this.ca,this.end,b),this.start,this.end+1,null):Be.call(null,this.j,$a(this.ca,this.end,b),this.start,this.end+1,null)};g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.J(null,c);case 3:return this.aa(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.J(null,a)};
g.a=function(a,b){return this.aa(null,a,b)};function Be(a,b,c,d,e){for(;;)if(b instanceof Ae)c=b.start+c,d=b.start+d,b=b.ca;else{var f=O(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new Ae(a,b,c,d,e)}}
var ze=function(){function a(a,b,c){return Be(null,a,b,c,null)}function b(a,b){return c.c(a,b,O(a))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();function Ce(a,b){return a===b.t?b:new be(a,va(b.e))}function se(a){return new be({},va(a.e))}
function te(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];Kc(a,0,b,0,a.length);return b}
var Ee=function De(b,c,d,e){d=Ce(b.root.t,d);var f=b.g-1>>>c&31;if(5===c)b=e;else{var h=d.e[f];b=null!=h?De(b,c-5,h,e):fe(b.root.t,c-5,e)}d.e[f]=b;return d},Ge=function Fe(b,c,d){d=Ce(b.root.t,d);var e=b.g-2>>>c&31;if(5<c){b=Fe(b,c-5,d.e[e]);if(null==b&&0===e)return null;d.e[e]=b;return d}return 0===e?null:u?(d.e[e]=null,d):null};function re(a,b,c,d){this.g=a;this.shift=b;this.root=c;this.R=d;this.i=275;this.q=88}g=re.prototype;
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return"number"===typeof b?D.c(this,b,c):c};
g.J=function(a,b){if(this.root.t)return le(this,b)[b&31];throw Error("nth after persistent!");};g.aa=function(a,b,c){return 0<=b&&b<this.g?D.a(this,b):c};g.L=function(){if(this.root.t)return this.g;throw Error("count after persistent!");};
g.Pb=function(a,b,c){var d=this;if(d.root.t){if(0<=b&&b<d.g)return ee(this)<=b?d.R[b&31]=c:(a=function(){return function f(a,k){var l=Ce(d.root.t,k);if(0===a)l.e[b&31]=c;else{var n=b>>>a&31,q=f(a-5,l.e[n]);l.e[n]=q}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.g)return zb(this,c);if(u)throw Error("Index "+A.b(b)+" out of bounds for TransientVector of length"+A.b(d.g));return null}throw Error("assoc! after persistent!");};
g.Qb=function(){if(this.root.t){if(0===this.g)throw Error("Can't pop empty vector");if(1===this.g)return this.g=0,this;if(0<(this.g-1&31))return this.g-=1,this;if(u){var a;a:if(a=this.g-2,a>=ee(this))a=this.R;else{for(var b=this.root,c=b,d=this.shift;;)if(0<d)c=Ce(b.t,c.e[a>>>d&31]),d-=5;else{a=c.e;break a}a=void 0}b=Ge(this,this.shift,this.root);b=null!=b?b:new be(this.root.t,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,
null,null,null,null,null,null,null,null]);5<this.shift&&null==b.e[1]?(this.root=Ce(this.root.t,b.e[0]),this.shift-=5):this.root=b;this.g-=1;this.R=a;return this}return null}throw Error("pop! after persistent!");};g.cb=function(a,b,c){if("number"===typeof b)return Db(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
g.Ka=function(a,b){if(this.root.t){if(32>this.g-ee(this))this.R[this.g&31]=b;else{var c=new be(this.root.t,this.R),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.R=d;if(this.g>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=fe(this.root.t,this.shift,c);this.root=new be(this.root.t,d);this.shift=e}else this.root=Ee(this,this.shift,this.root,c)}this.g+=1;return this}throw Error("conj! after persistent!");};g.Oa=function(){if(this.root.t){this.root.t=null;var a=this.g-ee(this),b=Array(a);Kc(this.R,0,b,0,a);return new W(null,this.g,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function He(a,b,c,d){this.j=a;this.ba=b;this.pa=c;this.m=d;this.q=0;this.i=31850572}g=He.prototype;
g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.Q=function(){return F(this.ba)};g.S=function(){var a=I(this.ba);return a?new He(this.j,a,this.pa,null):null==this.pa?Ba(this):new He(this.j,this.pa,null,null)};g.H=function(){return this};g.F=function(a,b){return new He(b,this.ba,this.pa,this.m)};g.G=function(a,b){return M(b,this)};
function Ie(a,b,c,d,e){this.j=a;this.count=b;this.ba=c;this.pa=d;this.m=e;this.i=31858766;this.q=8192}g=Ie.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.L=function(){return this.count};g.Ia=function(){return F(this.ba)};g.Ja=function(){if(r(this.ba)){var a=I(this.ba);return a?new Ie(this.j,this.count-1,a,this.pa,null):new Ie(this.j,this.count-1,E(this.pa),qe,null)}return this};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};
g.v=function(a,b){return lc(this,b)};g.I=function(){return Je};g.Q=function(){return F(this.ba)};g.S=function(){return G(E(this))};g.H=function(){var a=E(this.pa),b=this.ba;return r(r(b)?b:a)?new He(null,this.ba,E(a),null):null};g.F=function(a,b){return new Ie(b,this.count,this.ba,this.pa,this.m)};g.G=function(a,b){var c;r(this.ba)?(c=this.pa,c=new Ie(this.j,this.count+1,this.ba,pc.a(r(c)?c:qe,b),null)):c=new Ie(this.j,this.count+1,pc.a(this.ba,b),qe,null);return c};var Je=new Ie(null,0,null,qe,0);
function Ke(){this.q=0;this.i=2097152}Ke.prototype.v=function(){return!1};var Le=new Ke;function Me(a,b){return Nc(Gc(b)?O(a)===O(b)?Dd(Fd,Kd.a(function(a){return Wb.a(Q.c(b,F(a),Le),F(I(a)))},a)):null:null)}function Ne(a){this.r=a}Ne.prototype.next=function(){if(null!=this.r){var a=F(this.r);this.r=I(this.r);return{done:!1,value:a}}return{done:!0,value:null}};function Oe(a){return new Ne(E(a))}function Pe(a){this.r=a}
Pe.prototype.next=function(){if(null!=this.r){var a=F(this.r),b=P.c(a,0,null),a=P.c(a,1,null);this.r=I(this.r);return{done:!1,value:[b,a]}}return{done:!0,value:null}};function Qe(a){return new Pe(E(a))}function Re(a){this.r=a}Re.prototype.next=function(){if(null!=this.r){var a=F(this.r);this.r=I(this.r);return{done:!1,value:[a,a]}}return{done:!0,value:null}};function Se(a){return new Re(E(a))}
function Te(a,b){var c=a.e;if(b instanceof T)a:{for(var d=c.length,e=b.sa,f=0;;){if(d<=f){c=-1;break a}var h=c[f];if(h instanceof T&&e===h.sa){c=f;break a}if(u)f+=2;else{c=null;break a}}c=void 0}else if("string"==typeof b||"number"===typeof b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(b===c[e]){c=e;break a}if(u)e+=2;else{c=null;break a}}c=void 0}else if(b instanceof Zb)a:{d=c.length;e=b.Na;for(f=0;;){if(d<=f){c=-1;break a}h=c[f];if(h instanceof Zb&&e===h.Na){c=f;break a}if(u)f+=2;else{c=null;
break a}}c=void 0}else if(null==b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(null==c[e]){c=e;break a}if(u)e+=2;else{c=null;break a}}c=void 0}else if(u)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(Wb.a(b,c[e])){c=e;break a}if(u)e+=2;else{c=null;break a}}c=void 0}else c=null;return c}function Ue(a,b,c){this.e=a;this.p=b;this.W=c;this.q=0;this.i=32374990}g=Ue.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.W};
g.U=function(){return this.p<this.e.length-2?new Ue(this.e,this.p+2,this.W):null};g.L=function(){return(this.e.length-this.p)/2};g.B=function(){return cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.W)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return new W(null,2,5,X,[this.e[this.p],this.e[this.p+1]],null)};g.S=function(){return this.p<this.e.length-2?new Ue(this.e,this.p+2,this.W):H};g.H=function(){return this};
g.F=function(a,b){return new Ue(this.e,this.p,b)};g.G=function(a,b){return M(b,this)};function la(a,b,c,d){this.j=a;this.g=b;this.e=c;this.m=d;this.i=16647951;this.q=8196}g=la.prototype;g.toString=function(){return Lb(this)};g.keys=function(){return Oe(Ve.b?Ve.b(this):Ve.call(null,this))};g.entries=function(){return Qe(E(this))};g.values=function(){return Oe(We.b?We.b(this):We.call(null,this))};g.has=function(a){return Oc(this,a)};g.get=function(a){return this.u(null,a)};
g.forEach=function(a){for(var b=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e),h=P.c(f,0,null),f=P.c(f,1,null);a.a?a.a(f,h):a.call(null,f,h);e+=1}else if(b=E(b))Ic(b)?(c=Hb(b),b=Ib(b),h=c,d=O(c),c=h):(c=F(b),h=P.c(c,0,null),f=P.c(c,1,null),a.a?a.a(f,h):a.call(null,f,h),b=I(b),c=null,d=0),e=0;else return null};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){a=Te(this,b);return-1===a?c:this.e[a+1]};
g.Za=function(a,b,c){a=this.e.length;for(var d=0;;)if(d<a){c=b.c?b.c(c,this.e[d],this.e[d+1]):b.call(null,c,this.e[d],this.e[d+1]);if(fc(c))return K.b?K.b(c):K.call(null,c);d+=2}else return c};g.D=function(){return this.j};g.L=function(){return this.g};g.B=function(){var a=this.m;return null!=a?a:this.m=a=dc(this)};g.v=function(a,b){return Me(this,b)};g.Wa=function(){return new Xe({},this.e.length,va(this.e))};g.I=function(){return eb(Ye,this.j)};g.N=function(a,b){return nc.a(b,this)};
g.M=function(a,b,c){return nc.c(b,c,this)};g.nb=function(a,b){if(0<=Te(this,b)){var c=this.e.length,d=c-2;if(0===d)return Ba(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new la(this.j,this.g-1,d,null);if(Wb.a(b,this.e[e]))e+=2;else if(u)d[f]=this.e[e],d[f+1]=this.e[e+1],f+=2,e+=2;else return null}}else return this};
g.ua=function(a,b,c){a=Te(this,b);if(-1===a){if(this.g<Ze){a=this.e;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new la(this.j,this.g+1,e,null)}return eb(Oa(Yd($e,this),b,c),this.j)}return c===this.e[a+1]?this:u?(b=va(this.e),b[a+1]=c,new la(this.j,this.g,b,null)):null};g.kb=function(a,b){return-1!==Te(this,b)};g.H=function(){var a=this.e;return 0<=a.length-2?new Ue(a,0,null):null};g.F=function(a,b){return new la(b,this.g,this.e,this.m)};
g.G=function(a,b){if(Hc(b))return Oa(this,D.a(b,0),D.a(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(Hc(e))c=Oa(c,D.a(e,0),D.a(e,1)),d=I(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};
g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};var Ye=new la(null,0,[],null),Ze=8;function af(a){for(var b=a.length,c=0,d=yb(Ye);;)if(c<b)var e=c+2,d=Bb(d,a[c],a[c+1]),c=e;else return Ab(d)}function Xe(a,b,c){this.Ra=a;this.ja=b;this.e=c;this.q=56;this.i=258}g=Xe.prototype;
g.Ab=function(a,b){if(r(this.Ra)){var c=Te(this,b);0<=c&&(this.e[c]=this.e[this.ja-2],this.e[c+1]=this.e[this.ja-1],c=this.e,c.pop(),c.pop(),this.ja-=2);return this}throw Error("dissoc! after persistent!");};g.cb=function(a,b,c){if(r(this.Ra)){a=Te(this,b);if(-1===a)return this.ja+2<=2*Ze?(this.ja+=2,this.e.push(b),this.e.push(c),this):xd.c(bf.a?bf.a(this.ja,this.e):bf.call(null,this.ja,this.e),b,c);c!==this.e[a+1]&&(this.e[a+1]=c);return this}throw Error("assoc! after persistent!");};
g.Ka=function(a,b){if(r(this.Ra)){if(b?b.i&2048||b.dc||(b.i?0:s(Sa,b)):s(Sa,b))return Bb(this,cf.b?cf.b(b):cf.call(null,b),df.b?df.b(b):df.call(null,b));for(var c=E(b),d=this;;){var e=F(c);if(r(e))c=I(c),d=Bb(d,cf.b?cf.b(e):cf.call(null,e),df.b?df.b(e):df.call(null,e));else return d}}else throw Error("conj! after persistent!");};g.Oa=function(){if(r(this.Ra))return this.Ra=!1,new la(null,Yc(this.ja),this.e,null);throw Error("persistent! called twice");};g.u=function(a,b){return La.c(this,b,null)};
g.C=function(a,b,c){if(r(this.Ra))return a=Te(this,b),-1===a?c:this.e[a+1];throw Error("lookup after persistent!");};g.L=function(){if(r(this.Ra))return Yc(this.ja);throw Error("count after persistent!");};function bf(a,b){for(var c=yb($e),d=0;;)if(d<a)c=xd.c(c,b[d],b[d+1]),d+=2;else return c}function ef(){this.l=!1}function ff(a,b){return a===b?!0:hd(a,b)?!0:u?Wb.a(a,b):null}
var gf=function(){function a(a,b,c,h,k){a=va(a);a[b]=c;a[h]=k;return a}function b(a,b,c){a=va(a);a[b]=c;return a}var c=null,c=function(c,e,f,h,k){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,h,k)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.s=a;return c}();function hf(a,b){var c=Array(a.length-2);Kc(a,0,c,0,2*b);Kc(a,2*(b+1),c,2*b,c.length-2*b);return c}
var jf=function(){function a(a,b,c,h,k,l){a=a.La(b);a.e[c]=h;a.e[k]=l;return a}function b(a,b,c,h){a=a.La(b);a.e[c]=h;return a}var c=null,c=function(c,e,f,h,k,l){switch(arguments.length){case 4:return b.call(this,c,e,f,h);case 6:return a.call(this,c,e,f,h,k,l)}throw Error("Invalid arity: "+arguments.length);};c.n=b;c.X=a;return c}();
function kf(a,b,c){for(var d=a.length,e=0;;)if(e<d){var f=a[e];null!=f?c=b.c?b.c(c,f,a[e+1]):b.call(null,c,f,a[e+1]):(f=a[e+1],c=null!=f?f.Ta(b,c):c);if(fc(c))return K.b?K.b(c):K.call(null,c);e+=2}else return c}function lf(a,b,c){this.t=a;this.A=b;this.e=c}g=lf.prototype;g.La=function(a){if(a===this.t)return this;var b=Zc(this.A),c=Array(0>b?4:2*(b+1));Kc(this.e,0,c,0,2*b);return new lf(a,this.A,c)};
g.gb=function(a,b,c,d,e){var f=1<<(c>>>b&31);if(0===(this.A&f))return this;var h=Zc(this.A&f-1),k=this.e[2*h],l=this.e[2*h+1];return null==k?(b=l.gb(a,b+5,c,d,e),b===l?this:null!=b?jf.n(this,a,2*h+1,b):this.A===f?null:u?mf(this,a,f,h):null):ff(d,k)?(e[0]=!0,mf(this,a,f,h)):u?this:null};function mf(a,b,c,d){if(a.A===c)return null;a=a.La(b);b=a.e;var e=b.length;a.A^=c;Kc(b,2*(d+1),b,2*d,e-2*(d+1));b[e-2]=null;b[e-1]=null;return a}g.eb=function(){return nf.b?nf.b(this.e):nf.call(null,this.e)};
g.Ta=function(a,b){return kf(this.e,a,b)};g.Ma=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.A&e))return d;var f=Zc(this.A&e-1),e=this.e[2*f],f=this.e[2*f+1];return null==e?f.Ma(a+5,b,c,d):ff(c,e)?f:u?d:null};
g.ia=function(a,b,c,d,e,f){var h=1<<(c>>>b&31),k=Zc(this.A&h-1);if(0===(this.A&h)){var l=Zc(this.A);if(2*l<this.e.length){a=this.La(a);b=a.e;f.l=!0;a:for(c=2*(l-k),f=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[f];l-=1;c-=1;f-=1}b[2*k]=d;b[2*k+1]=e;a.A|=h;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=of.ia(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.A>>>d&1)&&(k[d]=null!=this.e[e]?of.ia(a,b+5,Tb(this.e[e]),this.e[e],this.e[e+1],f):this.e[e+1],e+=2),d+=1;else break;return new pf(a,l+1,k)}return u?(b=Array(2*(l+4)),Kc(this.e,0,b,0,2*k),b[2*k]=d,b[2*k+1]=e,Kc(this.e,2*k,b,2*(k+1),2*(l-k)),f.l=!0,a=this.La(a),a.e=b,a.A|=h,a):null}l=this.e[2*k];h=this.e[2*k+1];return null==l?(l=h.ia(a,b+5,c,d,e,f),l===h?this:jf.n(this,a,2*k+1,l)):ff(d,l)?e===h?this:jf.n(this,a,2*k+1,e):u?(f.l=!0,jf.X(this,a,2*k,null,2*k+1,qf.ga?qf.ga(a,b+5,l,h,c,d,e):qf.call(null,
a,b+5,l,h,c,d,e))):null};
g.ha=function(a,b,c,d,e){var f=1<<(b>>>a&31),h=Zc(this.A&f-1);if(0===(this.A&f)){var k=Zc(this.A);if(16<=k){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[b>>>a&31]=of.ha(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.A>>>c&1)&&(h[c]=null!=this.e[d]?of.ha(a+5,Tb(this.e[d]),this.e[d],this.e[d+1],e):this.e[d+1],d+=2),c+=1;else break;return new pf(null,k+1,h)}a=Array(2*(k+1));Kc(this.e,
0,a,0,2*h);a[2*h]=c;a[2*h+1]=d;Kc(this.e,2*h,a,2*(h+1),2*(k-h));e.l=!0;return new lf(null,this.A|f,a)}k=this.e[2*h];f=this.e[2*h+1];return null==k?(k=f.ha(a+5,b,c,d,e),k===f?this:new lf(null,this.A,gf.c(this.e,2*h+1,k))):ff(c,k)?d===f?this:new lf(null,this.A,gf.c(this.e,2*h+1,d)):u?(e.l=!0,new lf(null,this.A,gf.s(this.e,2*h,null,2*h+1,qf.X?qf.X(a+5,k,f,b,c,d):qf.call(null,a+5,k,f,b,c,d)))):null};
g.fb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.A&d))return this;var e=Zc(this.A&d-1),f=this.e[2*e],h=this.e[2*e+1];return null==f?(a=h.fb(a+5,b,c),a===h?this:null!=a?new lf(null,this.A,gf.c(this.e,2*e+1,a)):this.A===d?null:u?new lf(null,this.A^d,hf(this.e,e)):null):ff(c,f)?new lf(null,this.A^d,hf(this.e,e)):u?this:null};var of=new lf(null,0,[]);
function rf(a,b,c){var d=a.e;a=2*(a.g-1);for(var e=Array(a),f=0,h=1,k=0;;)if(f<a)f!==c&&null!=d[f]&&(e[h]=d[f],h+=2,k|=1<<f),f+=1;else return new lf(b,k,e)}function pf(a,b,c){this.t=a;this.g=b;this.e=c}g=pf.prototype;g.La=function(a){return a===this.t?this:new pf(a,this.g,va(this.e))};
g.gb=function(a,b,c,d,e){var f=c>>>b&31,h=this.e[f];if(null==h)return this;b=h.gb(a,b+5,c,d,e);if(b===h)return this;if(null==b){if(8>=this.g)return rf(this,a,f);a=jf.n(this,a,f,b);a.g-=1;return a}return u?jf.n(this,a,f,b):null};g.eb=function(){return sf.b?sf.b(this.e):sf.call(null,this.e)};g.Ta=function(a,b){for(var c=this.e.length,d=0,e=b;;)if(d<c){var f=this.e[d];if(null!=f&&(e=f.Ta(a,e),fc(e)))return K.b?K.b(e):K.call(null,e);d+=1}else return e};
g.Ma=function(a,b,c,d){var e=this.e[b>>>a&31];return null!=e?e.Ma(a+5,b,c,d):d};g.ia=function(a,b,c,d,e,f){var h=c>>>b&31,k=this.e[h];if(null==k)return a=jf.n(this,a,h,of.ia(a,b+5,c,d,e,f)),a.g+=1,a;b=k.ia(a,b+5,c,d,e,f);return b===k?this:jf.n(this,a,h,b)};g.ha=function(a,b,c,d,e){var f=b>>>a&31,h=this.e[f];if(null==h)return new pf(null,this.g+1,gf.c(this.e,f,of.ha(a+5,b,c,d,e)));a=h.ha(a+5,b,c,d,e);return a===h?this:new pf(null,this.g,gf.c(this.e,f,a))};
g.fb=function(a,b,c){var d=b>>>a&31,e=this.e[d];return null!=e?(a=e.fb(a+5,b,c),a===e?this:null==a?8>=this.g?rf(this,null,d):new pf(null,this.g-1,gf.c(this.e,d,a)):u?new pf(null,this.g,gf.c(this.e,d,a)):null):this};function tf(a,b,c){b*=2;for(var d=0;;)if(d<b){if(ff(c,a[d]))return d;d+=2}else return-1}function uf(a,b,c,d){this.t=a;this.ra=b;this.g=c;this.e=d}g=uf.prototype;
g.La=function(a){if(a===this.t)return this;var b=Array(2*(this.g+1));Kc(this.e,0,b,0,2*this.g);return new uf(a,this.ra,this.g,b)};g.gb=function(a,b,c,d,e){b=tf(this.e,this.g,d);if(-1===b)return this;e[0]=!0;if(1===this.g)return null;a=this.La(a);e=a.e;e[b]=e[2*this.g-2];e[b+1]=e[2*this.g-1];e[2*this.g-1]=null;e[2*this.g-2]=null;a.g-=1;return a};g.eb=function(){return nf.b?nf.b(this.e):nf.call(null,this.e)};g.Ta=function(a,b){return kf(this.e,a,b)};
g.Ma=function(a,b,c,d){a=tf(this.e,this.g,c);return 0>a?d:ff(c,this.e[a])?this.e[a+1]:u?d:null};
g.ia=function(a,b,c,d,e,f){if(c===this.ra){b=tf(this.e,this.g,d);if(-1===b){if(this.e.length>2*this.g)return a=jf.X(this,a,2*this.g,d,2*this.g+1,e),f.l=!0,a.g+=1,a;c=this.e.length;b=Array(c+2);Kc(this.e,0,b,0,c);b[c]=d;b[c+1]=e;f.l=!0;f=this.g+1;a===this.t?(this.e=b,this.g=f,a=this):a=new uf(this.t,this.ra,f,b);return a}return this.e[b+1]===e?this:jf.n(this,a,b+1,e)}return(new lf(a,1<<(this.ra>>>b&31),[null,this,null,null])).ia(a,b,c,d,e,f)};
g.ha=function(a,b,c,d,e){return b===this.ra?(a=tf(this.e,this.g,c),-1===a?(a=2*this.g,b=Array(a+2),Kc(this.e,0,b,0,a),b[a]=c,b[a+1]=d,e.l=!0,new uf(null,this.ra,this.g+1,b)):Wb.a(this.e[a],d)?this:new uf(null,this.ra,this.g,gf.c(this.e,a+1,d))):(new lf(null,1<<(this.ra>>>a&31),[null,this])).ha(a,b,c,d,e)};g.fb=function(a,b,c){a=tf(this.e,this.g,c);return-1===a?this:1===this.g?null:u?new uf(null,this.ra,this.g-1,hf(this.e,Yc(a))):null};
var qf=function(){function a(a,b,c,h,k,l,n){var q=Tb(c);if(q===k)return new uf(null,q,2,[c,h,l,n]);var t=new ef;return of.ia(a,b,q,c,h,t).ia(a,b,k,l,n,t)}function b(a,b,c,h,k,l){var n=Tb(b);if(n===h)return new uf(null,n,2,[b,c,k,l]);var q=new ef;return of.ha(a,n,b,c,q).ha(a,h,k,l,q)}var c=null,c=function(c,e,f,h,k,l,n){switch(arguments.length){case 6:return b.call(this,c,e,f,h,k,l);case 7:return a.call(this,c,e,f,h,k,l,n)}throw Error("Invalid arity: "+arguments.length);};c.X=b;c.ga=a;return c}();
function vf(a,b,c,d,e){this.j=a;this.ka=b;this.p=c;this.r=d;this.m=e;this.q=0;this.i=32374860}g=vf.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return null==this.r?new W(null,2,5,X,[this.ka[this.p],this.ka[this.p+1]],null):F(this.r)};
g.S=function(){return null==this.r?nf.c?nf.c(this.ka,this.p+2,null):nf.call(null,this.ka,this.p+2,null):nf.c?nf.c(this.ka,this.p,I(this.r)):nf.call(null,this.ka,this.p,I(this.r))};g.H=function(){return this};g.F=function(a,b){return new vf(b,this.ka,this.p,this.r,this.m)};g.G=function(a,b){return M(b,this)};
var nf=function(){function a(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new vf(null,a,b,null,null);var h=a[b+1];if(r(h)&&(h=h.eb(),r(h)))return new vf(null,a,b+2,h,null);b+=2}else return null;else return new vf(null,a,b,c,null)}function b(a){return c.c(a,0,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();
function wf(a,b,c,d,e){this.j=a;this.ka=b;this.p=c;this.r=d;this.m=e;this.q=0;this.i=32374860}g=wf.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return F(this.r)};
g.S=function(){return sf.n?sf.n(null,this.ka,this.p,I(this.r)):sf.call(null,null,this.ka,this.p,I(this.r))};g.H=function(){return this};g.F=function(a,b){return new wf(b,this.ka,this.p,this.r,this.m)};g.G=function(a,b){return M(b,this)};
var sf=function(){function a(a,b,c,h){if(null==h)for(h=b.length;;)if(c<h){var k=b[c];if(r(k)&&(k=k.eb(),r(k)))return new wf(a,b,c+1,k,null);c+=1}else return null;else return new wf(a,b,c,h,null)}function b(a){return c.n(null,a,0,null)}var c=null,c=function(c,e,f,h){switch(arguments.length){case 1:return b.call(this,c);case 4:return a.call(this,c,e,f,h)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.n=a;return c}();
function xf(a,b,c,d,e,f){this.j=a;this.g=b;this.root=c;this.T=d;this.Y=e;this.m=f;this.i=16123663;this.q=8196}g=xf.prototype;g.toString=function(){return Lb(this)};g.keys=function(){return Oe(Ve.b?Ve.b(this):Ve.call(null,this))};g.entries=function(){return Qe(E(this))};g.values=function(){return Oe(We.b?We.b(this):We.call(null,this))};g.has=function(a){return Oc(this,a)};g.get=function(a){return this.u(null,a)};
g.forEach=function(a){for(var b=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e),h=P.c(f,0,null),f=P.c(f,1,null);a.a?a.a(f,h):a.call(null,f,h);e+=1}else if(b=E(b))Ic(b)?(c=Hb(b),b=Ib(b),h=c,d=O(c),c=h):(c=F(b),h=P.c(c,0,null),f=P.c(c,1,null),a.a?a.a(f,h):a.call(null,f,h),b=I(b),c=null,d=0),e=0;else return null};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return null==b?this.T?this.Y:c:null==this.root?c:u?this.root.Ma(0,Tb(b),b,c):null};
g.Za=function(a,b,c){a=this.T?b.c?b.c(c,null,this.Y):b.call(null,c,null,this.Y):c;return fc(a)?K.b?K.b(a):K.call(null,a):null!=this.root?this.root.Ta(b,a):u?a:null};g.D=function(){return this.j};g.L=function(){return this.g};g.B=function(){var a=this.m;return null!=a?a:this.m=a=dc(this)};g.v=function(a,b){return Me(this,b)};g.Wa=function(){return new yf({},this.root,this.g,this.T,this.Y)};g.I=function(){return eb($e,this.j)};
g.nb=function(a,b){if(null==b)return this.T?new xf(this.j,this.g-1,this.root,!1,null,null):this;if(null==this.root)return this;if(u){var c=this.root.fb(0,Tb(b),b);return c===this.root?this:new xf(this.j,this.g-1,c,this.T,this.Y,null)}return null};
g.ua=function(a,b,c){if(null==b)return this.T&&c===this.Y?this:new xf(this.j,this.T?this.g:this.g+1,this.root,!0,c,null);a=new ef;b=(null==this.root?of:this.root).ha(0,Tb(b),b,c,a);return b===this.root?this:new xf(this.j,a.l?this.g+1:this.g,b,this.T,this.Y,null)};g.kb=function(a,b){return null==b?this.T:null==this.root?!1:u?this.root.Ma(0,Tb(b),b,Lc)!==Lc:null};g.H=function(){if(0<this.g){var a=null!=this.root?this.root.eb():null;return this.T?M(new W(null,2,5,X,[null,this.Y],null),a):a}return null};
g.F=function(a,b){return new xf(b,this.g,this.root,this.T,this.Y,this.m)};g.G=function(a,b){if(Hc(b))return Oa(this,D.a(b,0),D.a(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(Hc(e))c=Oa(c,D.a(e,0),D.a(e,1)),d=I(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};var $e=new xf(null,0,null,!1,null,0);function sc(a,b){for(var c=a.length,d=0,e=yb($e);;)if(d<c)var f=d+1,e=e.cb(null,a[d],b[d]),d=f;else return Ab(e)}
function yf(a,b,c,d,e){this.t=a;this.root=b;this.count=c;this.T=d;this.Y=e;this.q=56;this.i=258}g=yf.prototype;g.Ab=function(a,b){if(this.t)if(null==b)this.T&&(this.T=!1,this.Y=null,this.count-=1);else{if(null!=this.root){var c=new ef,d=this.root.gb(this.t,0,Tb(b),b,c);d!==this.root&&(this.root=d);r(c[0])&&(this.count-=1)}}else throw Error("dissoc! after persistent!");return this};g.cb=function(a,b,c){return zf(this,b,c)};
g.Ka=function(a,b){var c;a:{if(this.t){if(b?b.i&2048||b.dc||(b.i?0:s(Sa,b)):s(Sa,b)){c=zf(this,cf.b?cf.b(b):cf.call(null,b),df.b?df.b(b):df.call(null,b));break a}c=E(b);for(var d=this;;){var e=F(c);if(r(e))c=I(c),d=zf(d,cf.b?cf.b(e):cf.call(null,e),df.b?df.b(e):df.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");c=void 0}return c};
g.Oa=function(){var a;if(this.t)this.t=null,a=new xf(null,this.count,this.root,this.T,this.Y,null);else throw Error("persistent! called twice");return a};g.u=function(a,b){return null==b?this.T?this.Y:null:null==this.root?null:this.root.Ma(0,Tb(b),b)};g.C=function(a,b,c){return null==b?this.T?this.Y:c:null==this.root?c:this.root.Ma(0,Tb(b),b,c)};g.L=function(){if(this.t)return this.count;throw Error("count after persistent!");};
function zf(a,b,c){if(a.t){if(null==b)a.Y!==c&&(a.Y=c),a.T||(a.count+=1,a.T=!0);else{var d=new ef;b=(null==a.root?of:a.root).ia(a.t,0,Tb(b),b,c,d);b!==a.root&&(a.root=b);d.l&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}function Af(a,b,c){for(var d=b;;)if(null!=a)b=c?a.left:a.right,d=pc.a(d,a),a=b;else return d}function Bf(a,b,c,d,e){this.j=a;this.stack=b;this.ib=c;this.g=d;this.m=e;this.q=0;this.i=32374862}g=Bf.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.j};
g.L=function(){return 0>this.g?O(I(this))+1:this.g};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return yc(this.stack)};g.S=function(){var a=F(this.stack),a=Af(this.ib?a.right:a.left,I(this.stack),this.ib);return null!=a?new Bf(null,a,this.ib,this.g-1,null):H};g.H=function(){return this};
g.F=function(a,b){return new Bf(b,this.stack,this.ib,this.g,this.m)};g.G=function(a,b){return M(b,this)};function Cf(a,b,c){return new Bf(null,Af(a,null,b),b,c,null)}function Df(a,b,c,d){return c instanceof Y?c.left instanceof Y?new Y(c.key,c.l,c.left.qa(),new $(a,b,c.right,d,null),null):c.right instanceof Y?new Y(c.right.key,c.right.l,new $(c.key,c.l,c.left,c.right.left,null),new $(a,b,c.right.right,d,null),null):u?new $(a,b,c,d,null):null:new $(a,b,c,d,null)}
function Ef(a,b,c,d){return d instanceof Y?d.right instanceof Y?new Y(d.key,d.l,new $(a,b,c,d.left,null),d.right.qa(),null):d.left instanceof Y?new Y(d.left.key,d.left.l,new $(a,b,c,d.left.left,null),new $(d.key,d.l,d.left.right,d.right,null),null):u?new $(a,b,c,d,null):null:new $(a,b,c,d,null)}
function Ff(a,b,c,d){if(c instanceof Y)return new Y(a,b,c.qa(),d,null);if(d instanceof $)return Ef(a,b,c,d.hb());if(d instanceof Y&&d.left instanceof $)return new Y(d.left.key,d.left.l,new $(a,b,c,d.left.left,null),Ef(d.key,d.l,d.left.right,d.right.hb()),null);if(u)throw Error("red-black tree invariant violation");return null}
var Hf=function Gf(b,c,d){d=null!=b.left?Gf(b.left,c,d):d;if(fc(d))return K.b?K.b(d):K.call(null,d);d=c.c?c.c(d,b.key,b.l):c.call(null,d,b.key,b.l);if(fc(d))return K.b?K.b(d):K.call(null,d);b=null!=b.right?Gf(b.right,c,d):d;return fc(b)?K.b?K.b(b):K.call(null,b):b};function $(a,b,c,d,e){this.key=a;this.l=b;this.left=c;this.right=d;this.m=e;this.q=0;this.i=32402207}g=$.prototype;g.Hb=function(a){return a.Jb(this)};g.hb=function(){return new Y(this.key,this.l,this.left,this.right,null)};g.qa=function(){return this};
g.Gb=function(a){return a.Ib(this)};g.replace=function(a,b,c,d){return new $(a,b,c,d,null)};g.Ib=function(a){return new $(a.key,a.l,this,a.right,null)};g.Jb=function(a){return new $(a.key,a.l,a.left,this,null)};g.Ta=function(a,b){return Hf(this,a,b)};g.u=function(a,b){return D.c(this,b,null)};g.C=function(a,b,c){return D.c(this,b,c)};g.J=function(a,b){return 0===b?this.key:1===b?this.l:null};g.aa=function(a,b,c){return 0===b?this.key:1===b?this.l:u?c:null};
g.Pa=function(a,b,c){return(new W(null,2,5,X,[this.key,this.l],null)).Pa(null,b,c)};g.D=function(){return null};g.L=function(){return 2};g.$a=function(){return this.key};g.ab=function(){return this.l};g.Ia=function(){return this.l};g.Ja=function(){return new W(null,1,5,X,[this.key],null)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return qe};g.N=function(a,b){return gc.a(this,b)};g.M=function(a,b,c){return gc.c(this,b,c)};
g.ua=function(a,b,c){return R.c(new W(null,2,5,X,[this.key,this.l],null),b,c)};g.H=function(){return Da(Da(H,this.l),this.key)};g.F=function(a,b){return N(new W(null,2,5,X,[this.key,this.l],null),b)};g.G=function(a,b){return new W(null,3,5,X,[this.key,this.l,b],null)};g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();
g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};function Y(a,b,c,d,e){this.key=a;this.l=b;this.left=c;this.right=d;this.m=e;this.q=0;this.i=32402207}g=Y.prototype;g.Hb=function(a){return new Y(this.key,this.l,this.left,a,null)};g.hb=function(){throw Error("red-black tree invariant violation");};g.qa=function(){return new $(this.key,this.l,this.left,this.right,null)};
g.Gb=function(a){return new Y(this.key,this.l,a,this.right,null)};g.replace=function(a,b,c,d){return new Y(a,b,c,d,null)};g.Ib=function(a){return this.left instanceof Y?new Y(this.key,this.l,this.left.qa(),new $(a.key,a.l,this.right,a.right,null),null):this.right instanceof Y?new Y(this.right.key,this.right.l,new $(this.key,this.l,this.left,this.right.left,null),new $(a.key,a.l,this.right.right,a.right,null),null):u?new $(a.key,a.l,this,a.right,null):null};
g.Jb=function(a){return this.right instanceof Y?new Y(this.key,this.l,new $(a.key,a.l,a.left,this.left,null),this.right.qa(),null):this.left instanceof Y?new Y(this.left.key,this.left.l,new $(a.key,a.l,a.left,this.left.left,null),new $(this.key,this.l,this.left.right,this.right,null),null):u?new $(a.key,a.l,a.left,this,null):null};g.Ta=function(a,b){return Hf(this,a,b)};g.u=function(a,b){return D.c(this,b,null)};g.C=function(a,b,c){return D.c(this,b,c)};
g.J=function(a,b){return 0===b?this.key:1===b?this.l:null};g.aa=function(a,b,c){return 0===b?this.key:1===b?this.l:u?c:null};g.Pa=function(a,b,c){return(new W(null,2,5,X,[this.key,this.l],null)).Pa(null,b,c)};g.D=function(){return null};g.L=function(){return 2};g.$a=function(){return this.key};g.ab=function(){return this.l};g.Ia=function(){return this.l};g.Ja=function(){return new W(null,1,5,X,[this.key],null)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};
g.v=function(a,b){return lc(this,b)};g.I=function(){return qe};g.N=function(a,b){return gc.a(this,b)};g.M=function(a,b,c){return gc.c(this,b,c)};g.ua=function(a,b,c){return R.c(new W(null,2,5,X,[this.key,this.l],null),b,c)};g.H=function(){return Da(Da(H,this.l),this.key)};g.F=function(a,b){return N(new W(null,2,5,X,[this.key,this.l],null),b)};g.G=function(a,b){return new W(null,3,5,X,[this.key,this.l,b],null)};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};
var Jf=function If(b,c,d,e,f){if(null==c)return new Y(d,e,null,null,null);var h=b.a?b.a(d,c.key):b.call(null,d,c.key);return 0===h?(f[0]=c,null):0>h?(b=If(b,c.left,d,e,f),null!=b?c.Gb(b):null):u?(b=If(b,c.right,d,e,f),null!=b?c.Hb(b):null):null},Lf=function Kf(b,c){if(null==b)return c;if(null==c)return b;if(b instanceof Y){if(c instanceof Y){var d=Kf(b.right,c.left);return d instanceof Y?new Y(d.key,d.l,new Y(b.key,b.l,b.left,d.left,null),new Y(c.key,c.l,d.right,c.right,null),null):new Y(b.key,b.l,
b.left,new Y(c.key,c.l,d,c.right,null),null)}return new Y(b.key,b.l,b.left,Kf(b.right,c),null)}return c instanceof Y?new Y(c.key,c.l,Kf(b,c.left),c.right,null):u?(d=Kf(b.right,c.left),d instanceof Y?new Y(d.key,d.l,new $(b.key,b.l,b.left,d.left,null),new $(c.key,c.l,d.right,c.right,null),null):Ff(b.key,b.l,b.left,new $(c.key,c.l,d,c.right,null))):null},Nf=function Mf(b,c,d,e){if(null!=c){var f=b.a?b.a(d,c.key):b.call(null,d,c.key);if(0===f)return e[0]=c,Lf(c.left,c.right);if(0>f)return b=Mf(b,c.left,
d,e),null!=b||null!=e[0]?c.left instanceof $?Ff(c.key,c.l,b,c.right):new Y(c.key,c.l,b,c.right,null):null;if(u){b=Mf(b,c.right,d,e);if(null!=b||null!=e[0])if(c.right instanceof $)if(e=c.key,d=c.l,c=c.left,b instanceof Y)c=new Y(e,d,c,b.qa(),null);else if(c instanceof $)c=Df(e,d,c.hb(),b);else if(c instanceof Y&&c.right instanceof $)c=new Y(c.right.key,c.right.l,Df(c.key,c.l,c.left.hb(),c.right.left),new $(e,d,c.right.right,b,null),null);else{if(u)throw Error("red-black tree invariant violation");
c=null}else c=new Y(c.key,c.l,c.left,b,null);else c=null;return c}}return null},Pf=function Of(b,c,d,e){var f=c.key,h=b.a?b.a(d,f):b.call(null,d,f);return 0===h?c.replace(f,e,c.left,c.right):0>h?c.replace(f,c.l,Of(b,c.left,d,e),c.right):u?c.replace(f,c.l,c.left,Of(b,c.right,d,e)):null};function Qf(a,b,c,d,e){this.Z=a;this.ma=b;this.g=c;this.j=d;this.m=e;this.i=418776847;this.q=8192}g=Qf.prototype;g.toString=function(){return Lb(this)};g.keys=function(){return Oe(Ve.b?Ve.b(this):Ve.call(null,this))};
g.entries=function(){return Qe(E(this))};g.values=function(){return Oe(We.b?We.b(this):We.call(null,this))};g.has=function(a){return Oc(this,a)};g.get=function(a){return this.u(null,a)};g.forEach=function(a){for(var b=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e),h=P.c(f,0,null),f=P.c(f,1,null);a.a?a.a(f,h):a.call(null,f,h);e+=1}else if(b=E(b))Ic(b)?(c=Hb(b),b=Ib(b),h=c,d=O(c),c=h):(c=F(b),h=P.c(c,0,null),f=P.c(c,1,null),a.a?a.a(f,h):a.call(null,f,h),b=I(b),c=null,d=0),e=0;else return null};
function Rf(a,b){for(var c=a.ma;;)if(null!=c){var d=a.Z.a?a.Z.a(b,c.key):a.Z.call(null,b,c.key);if(0===d)return c;if(0>d)c=c.left;else if(u)c=c.right;else return null}else return null}g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){a=Rf(this,b);return null!=a?a.l:c};g.Za=function(a,b,c){return null!=this.ma?Hf(this.ma,b,c):c};g.D=function(){return this.j};g.L=function(){return this.g};g.Xa=function(){return 0<this.g?Cf(this.ma,!1,this.g):null};
g.B=function(){var a=this.m;return null!=a?a:this.m=a=dc(this)};g.v=function(a,b){return Me(this,b)};g.I=function(){return N(Sf,this.j)};g.nb=function(a,b){var c=[null],d=Nf(this.Z,this.ma,b,c);return null==d?null==P.a(c,0)?this:new Qf(this.Z,null,0,this.j,null):new Qf(this.Z,d.qa(),this.g-1,this.j,null)};
g.ua=function(a,b,c){a=[null];var d=Jf(this.Z,this.ma,b,c,a);return null==d?(a=P.a(a,0),Wb.a(c,a.l)?this:new Qf(this.Z,Pf(this.Z,this.ma,b,c),this.g,this.j,null)):new Qf(this.Z,d.qa(),this.g+1,this.j,null)};g.kb=function(a,b){return null!=Rf(this,b)};g.H=function(){return 0<this.g?Cf(this.ma,!0,this.g):null};g.F=function(a,b){return new Qf(this.Z,this.ma,this.g,b,this.m)};
g.G=function(a,b){if(Hc(b))return Oa(this,D.a(b,0),D.a(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(Hc(e))c=Oa(c,D.a(e,0),D.a(e,1)),d=I(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};
g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};g.yb=function(a,b){return 0<this.g?Cf(this.ma,b,this.g):null};g.zb=function(a,b,c){if(0<this.g){a=null;for(var d=this.ma;;)if(null!=d){var e=this.Z.a?this.Z.a(b,d.key):this.Z.call(null,b,d.key);if(0===e)return new Bf(null,pc.a(a,d),c,-1,null);if(r(c))0>e?(a=pc.a(a,d),d=d.left):d=d.right;else if(u)0<e?(a=pc.a(a,d),d=d.right):d=d.left;else return null}else return null==a?null:new Bf(null,a,c,-1,null)}else return null};
g.xb=function(a,b){return cf.b?cf.b(b):cf.call(null,b)};g.wb=function(){return this.Z};
var Sf=new Qf(Xb,null,0,null,0),Tf=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){a=E(a);for(var b=yb($e);;)if(a){var e=I(I(a)),b=xd.c(b,F(a),F(I(a)));a=e}else return Ab(b)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}(),Uf=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return new la(null,Yc(O(a)),S.a(wa,
a),null)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}(),Vf=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){a=E(a);for(var b=Sf;;)if(a){var e=I(I(a)),b=R.c(b,F(a),F(I(a)));a=e}else return b}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}(),Wf=function(){function a(a,d){var e=null;1<arguments.length&&(e=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,
b){for(var e=E(b),f=new Qf(Qc(a),null,0,null,0);;)if(e)var h=I(I(e)),f=R.c(f,F(e),F(I(e))),e=h;else return f}a.k=1;a.f=function(a){var d=F(a);a=G(a);return b(d,a)};a.d=b;return a}();function Xf(a,b){this.V=a;this.W=b;this.q=0;this.i=32374988}g=Xf.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.W};g.U=function(){var a=this.V,a=(a?a.i&128||a.ob||(a.i?0:s(Ja,a)):s(Ja,a))?this.V.U(null):I(this.V);return null==a?null:new Xf(a,this.W)};g.B=function(){return cc(this)};
g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.W)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return this.V.Q(null).$a(null)};g.S=function(){var a=this.V,a=(a?a.i&128||a.ob||(a.i?0:s(Ja,a)):s(Ja,a))?this.V.U(null):I(this.V);return null!=a?new Xf(a,this.W):H};g.H=function(){return this};g.F=function(a,b){return new Xf(this.V,b)};g.G=function(a,b){return M(b,this)};function Ve(a){return(a=E(a))?new Xf(a,null):null}
function cf(a){return Ta(a)}function Yf(a,b){this.V=a;this.W=b;this.q=0;this.i=32374988}g=Yf.prototype;g.toString=function(){return Lb(this)};g.D=function(){return this.W};g.U=function(){var a=this.V,a=(a?a.i&128||a.ob||(a.i?0:s(Ja,a)):s(Ja,a))?this.V.U(null):I(this.V);return null==a?null:new Yf(a,this.W)};g.B=function(){return cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.W)};g.N=function(a,b){return nc.a(b,this)};g.M=function(a,b,c){return nc.c(b,c,this)};g.Q=function(){return this.V.Q(null).ab(null)};
g.S=function(){var a=this.V,a=(a?a.i&128||a.ob||(a.i?0:s(Ja,a)):s(Ja,a))?this.V.U(null):I(this.V);return null!=a?new Yf(a,this.W):H};g.H=function(){return this};g.F=function(a,b){return new Yf(this.V,b)};g.G=function(a,b){return M(b,this)};function We(a){return(a=E(a))?new Yf(a,null):null}function df(a){return Ua(a)}
var Zf=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return r(Ed(Fd,a))?C.a(function(a,b){return pc.a(r(a)?a:Ye,b)},a):null}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}();function $f(a,b,c){this.j=a;this.Sa=b;this.m=c;this.i=15077647;this.q=8196}g=$f.prototype;g.toString=function(){return Lb(this)};g.keys=function(){return Oe(E(this))};g.entries=function(){return Se(E(this))};g.values=function(){return Oe(E(this))};
g.has=function(a){return Oc(this,a)};g.forEach=function(a){for(var b=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e),h=P.c(f,0,null),f=P.c(f,1,null);a.a?a.a(f,h):a.call(null,f,h);e+=1}else if(b=E(b))Ic(b)?(c=Hb(b),b=Ib(b),h=c,d=O(c),c=h):(c=F(b),h=P.c(c,0,null),f=P.c(c,1,null),a.a?a.a(f,h):a.call(null,f,h),b=I(b),c=null,d=0),e=0;else return null};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return Na(this.Sa,b)?b:c};g.D=function(){return this.j};g.L=function(){return Aa(this.Sa)};
g.B=function(){var a=this.m;return null!=a?a:this.m=a=dc(this)};g.v=function(a,b){return Dc(b)&&O(this)===O(b)&&Dd(function(a){return function(b){return Oc(a,b)}}(this),b)};g.Wa=function(){return new ag(yb(this.Sa))};g.I=function(){return N(bg,this.j)};g.vb=function(a,b){return new $f(this.j,Qa(this.Sa,b),null)};g.H=function(){return Ve(this.Sa)};g.F=function(a,b){return new $f(b,this.Sa,this.m)};g.G=function(a,b){return new $f(this.j,R.c(this.Sa,b,null),null)};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};var bg=new $f(null,Ye,0);function ag(a){this.la=a;this.i=259;this.q=136}g=ag.prototype;
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return La.c(this.la,c,Lc)===Lc?null:c;case 3:return La.c(this.la,c,Lc)===Lc?d:c}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return La.c(this.la,a,Lc)===Lc?null:a};g.a=function(a,b){return La.c(this.la,a,Lc)===Lc?b:a};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){return La.c(this.la,b,Lc)===Lc?c:b};
g.L=function(){return O(this.la)};g.Ob=function(a,b){this.la=yd.a(this.la,b);return this};g.Ka=function(a,b){this.la=xd.c(this.la,b,null);return this};g.Oa=function(){return new $f(null,Ab(this.la),null)};function cg(a,b,c){this.j=a;this.na=b;this.m=c;this.i=417730831;this.q=8192}g=cg.prototype;g.toString=function(){return Lb(this)};g.keys=function(){return Oe(E(this))};g.entries=function(){return Se(E(this))};g.values=function(){return Oe(E(this))};g.has=function(a){return Oc(this,a)};
g.forEach=function(a){for(var b=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e),h=P.c(f,0,null),f=P.c(f,1,null);a.a?a.a(f,h):a.call(null,f,h);e+=1}else if(b=E(b))Ic(b)?(c=Hb(b),b=Ib(b),h=c,d=O(c),c=h):(c=F(b),h=P.c(c,0,null),f=P.c(c,1,null),a.a?a.a(f,h):a.call(null,f,h),b=I(b),c=null,d=0),e=0;else return null};g.u=function(a,b){return La.c(this,b,null)};g.C=function(a,b,c){a=Rf(this.na,b);return null!=a?a.key:c};g.D=function(){return this.j};g.L=function(){return O(this.na)};
g.Xa=function(){return 0<O(this.na)?Kd.a(cf,pb(this.na)):null};g.B=function(){var a=this.m;return null!=a?a:this.m=a=dc(this)};g.v=function(a,b){return Dc(b)&&O(this)===O(b)&&Dd(function(a){return function(b){return Oc(a,b)}}(this),b)};g.I=function(){return N(dg,this.j)};g.vb=function(a,b){return new cg(this.j,tc.a(this.na,b),null)};g.H=function(){return Ve(this.na)};g.F=function(a,b){return new cg(b,this.na,this.m)};g.G=function(a,b){return new cg(this.j,R.c(this.na,b,null),null)};
g.call=function(){var a=null;return a=function(a,c,d){switch(arguments.length){case 2:return this.u(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);}}();g.apply=function(a,b){return this.call.apply(this,[this].concat(va(b)))};g.b=function(a){return this.u(null,a)};g.a=function(a,b){return this.C(null,a,b)};g.yb=function(a,b){return Kd.a(cf,qb(this.na,b))};g.zb=function(a,b,c){return Kd.a(cf,rb(this.na,b,c))};g.xb=function(a,b){return b};g.wb=function(){return tb(this.na)};
var dg=new cg(null,Sf,0);function eg(a){a=E(a);if(null==a)return bg;if(a instanceof ac&&0===a.p){a=a.e;a:{for(var b=0,c=yb(bg);;)if(b<a.length)var d=b+1,c=c.Ka(null,a[b]),b=d;else{a=c;break a}a=void 0}return a.Oa(null)}if(u)for(d=yb(bg);;)if(null!=a)b=a.U(null),d=d.Ka(null,a.Q(null)),a=b;else return d.Oa(null);else return null}
var fg=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return C.c(Da,dg,a)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}(),gg=function(){function a(a,d){var e=null;1<arguments.length&&(e=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return C.c(Da,new cg(null,Wf(a),0),b)}a.k=1;a.f=function(a){var d=F(a);a=G(a);return b(d,a)};a.d=b;return a}();
function hg(a){for(var b=qe;;)if(I(a))b=pc.a(b,F(a)),a=I(a);else return E(b)}function id(a){if(a&&(a.q&4096||a.fc))return a.name;if("string"===typeof a)return a;throw Error("Doesn't support name: "+A.b(a));}
var ig=function(){function a(a,b,c){return(a.b?a.b(b):a.call(null,b))>(a.b?a.b(c):a.call(null,c))?b:c}var b=null,c=function(){function a(b,d,k,l){var n=null;3<arguments.length&&(n=J(Array.prototype.slice.call(arguments,3),0));return c.call(this,b,d,k,n)}function c(a,d,e,l){return C.c(function(c,d){return b.c(a,c,d)},b.c(a,d,e),l)}a.k=3;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=I(a);var l=F(a);a=G(a);return c(b,d,l,a)};a.d=c;return a}(),b=function(b,e,f,h){switch(arguments.length){case 2:return e;
case 3:return a.call(this,b,e,f);default:return c.d(b,e,f,J(arguments,3))}throw Error("Invalid arity: "+arguments.length);};b.k=3;b.f=c.f;b.a=function(a,b){return b};b.c=a;b.d=c.d;return b}(),jg=function(){function a(a,b,f){return new V(null,function(){var h=E(f);return h?M(Md(a,h),c.c(a,b,Nd(b,h))):null},null,null)}function b(a,b){return c.c(a,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);
};c.a=b;c.c=a;return c}(),lg=function kg(b,c){return new V(null,function(){var d=E(c);return d?r(b.b?b.b(F(d)):b.call(null,F(d)))?M(F(d),kg(b,G(d))):null:null},null,null)};function mg(a,b,c){return function(d){var e=tb(a);return b.a?b.a(e.a?e.a(sb(a,d),c):e.call(null,sb(a,d),c),0):b.call(null,e.a?e.a(sb(a,d),c):e.call(null,sb(a,d),c),0)}}
var ng=function(){function a(a,b,c,h,k){var l=rb(a,c,!0);if(r(l)){var n=P.c(l,0,null);return lg(mg(a,h,k),r(mg(a,b,c).call(null,n))?l:I(l))}return null}function b(a,b,c){var h=mg(a,b,c),k;a:{k=[Uc,Vc];var l=k.length;if(l<=Ze)for(var n=0,q=yb(Ye);;)if(n<l)var t=n+1,q=Bb(q,k[n],null),n=t;else{k=new $f(null,Ab(q),null);break a}else for(n=0,q=yb(bg);;)if(n<l)t=n+1,q=zb(q,k[n]),n=t;else{k=Ab(q);break a}k=void 0}return r(k.call(null,b))?(a=rb(a,c,!0),r(a)?(b=P.c(a,0,null),r(h.b?h.b(b):h.call(null,b))?a:
I(a)):null):lg(h,qb(a,!0))}var c=null,c=function(c,e,f,h,k){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,h,k)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.s=a;return c}();function og(a,b,c,d,e){this.j=a;this.start=b;this.end=c;this.step=d;this.m=e;this.i=32375006;this.q=8192}g=og.prototype;g.toString=function(){return Lb(this)};
g.J=function(a,b){if(b<Aa(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};g.aa=function(a,b,c){return b<Aa(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};g.D=function(){return this.j};
g.U=function(){return 0<this.step?this.start+this.step<this.end?new og(this.j,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new og(this.j,this.start+this.step,this.end,this.step,null):null};g.L=function(){return sa(lb(this))?0:Math.ceil((this.end-this.start)/this.step)};g.B=function(){var a=this.m;return null!=a?a:this.m=a=cc(this)};g.v=function(a,b){return lc(this,b)};g.I=function(){return N(H,this.j)};g.N=function(a,b){return gc.a(this,b)};
g.M=function(a,b,c){return gc.c(this,b,c)};g.Q=function(){return null==lb(this)?null:this.start};g.S=function(){return null!=lb(this)?new og(this.j,this.start+this.step,this.end,this.step,null):H};g.H=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};g.F=function(a,b){return new og(b,this.start,this.end,this.step,this.m)};g.G=function(a,b){return M(b,this)};
var pg=function(){function a(a,b,c){return new og(null,a,b,c,null)}function b(a,b){return e.c(a,b,1)}function c(a){return e.c(0,a,1)}function d(){return e.c(0,Number.MAX_VALUE,1)}var e=null,e=function(e,h,k){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,h);case 3:return a.call(this,e,h,k)}throw Error("Invalid arity: "+arguments.length);};e.o=d;e.b=c;e.a=b;e.c=a;return e}(),qg=function(){function a(a,b){for(;;)if(E(b)&&0<a){var c=a-1,h=
I(b);a=c;b=h}else return null}function b(a){for(;;)if(E(a))a=I(a);else return null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),rg=function(){function a(a,b){qg.a(a,b);return b}function b(a){qg.b(a);return a}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);
};c.b=b;c.a=a;return c}();function sg(a,b){if("string"===typeof b){var c=a.exec(b);return Wb.a(F(c),b)?1===O(c)?F(c):we(c):null}throw new TypeError("re-matches must match against a string.");}function tg(a){var b;b=/^(?:\(\?([idmsux]*)\))?(.*)/;if("string"===typeof a)a=b.exec(a),b=null==a?null:1===O(a)?F(a):we(a);else throw new TypeError("re-find must match against a string.");P.c(b,0,null);a=P.c(b,1,null);b=P.c(b,2,null);return new RegExp(b,a)}
function ug(a,b,c,d,e,f,h){var k=ja;try{ja=null==ja?null:ja-1;if(null!=ja&&0>ja)return ub(a,"#");ub(a,c);E(h)&&(b.c?b.c(F(h),a,f):b.call(null,F(h),a,f));for(var l=I(h),n=ra.b(f)-1;;)if(!l||null!=n&&0===n){E(l)&&0===n&&(ub(a,d),ub(a,"..."));break}else{ub(a,d);b.c?b.c(F(l),a,f):b.call(null,F(l),a,f);var q=I(l);c=n-1;l=q;n=c}return ub(a,e)}finally{ja=k}}
var vg=function(){function a(a,d){var e=null;1<arguments.length&&(e=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){for(var e=E(b),f=null,h=0,k=0;;)if(k<h){var l=f.J(null,k);ub(a,l);k+=1}else if(e=E(e))f=e,Ic(f)?(e=Hb(f),h=Ib(f),f=e,l=O(e),e=h,h=l):(l=F(f),ub(a,l),e=I(f),f=null,h=0),k=0;else return null}a.k=1;a.f=function(a){var d=F(a);a=G(a);return b(d,a)};a.d=b;return a}(),wg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};
function xg(a){return'"'+A.b(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return wg[a]}))+'"'}
var Ag=function yg(b,c,d){if(null==b)return ub(c,"nil");if(void 0===b)return ub(c,"#\x3cundefined\x3e");if(u){r(function(){var c=Q.a(d,pa);return r(c)?(c=b?b.i&131072||b.ec?!0:b.i?!1:s(bb,b):s(bb,b))?xc(b):c:c}())&&(ub(c,"^"),yg(xc(b),c,d),ub(c," "));if(null==b)return ub(c,"nil");if(b.Db)return b.Tb(b,c,d);if(b&&(b.i&2147483648||b.K))return b.w(null,c,d);if(ta(b)===Boolean||"number"===typeof b)return ub(c,""+A.b(b));if(null!=b&&b.constructor===Object)return ub(c,"#js "),zg.n?zg.n(Kd.a(function(c){return new W(null,
2,5,X,[jd.b(c),b[c]],null)},Jc(b)),yg,c,d):zg.call(null,Kd.a(function(c){return new W(null,2,5,X,[jd.b(c),b[c]],null)},Jc(b)),yg,c,d);if(b instanceof Array)return ug(c,yg,"#js ["," ","]",d,b);if("string"==typeof b)return r(oa.b(d))?ub(c,xg(b)):ub(c,b);if(uc(b))return vg.d(c,J(["#\x3c",""+A.b(b),"\x3e"],0));if(b instanceof Date){var e=function(b,c){for(var d=""+A.b(b);;)if(O(d)<c)d="0"+A.b(d);else return d};return vg.d(c,J(['#inst "',""+A.b(b.getUTCFullYear()),"-",e(b.getUTCMonth()+1,2),"-",e(b.getUTCDate(),
2),"T",e(b.getUTCHours(),2),":",e(b.getUTCMinutes(),2),":",e(b.getUTCSeconds(),2),".",e(b.getUTCMilliseconds(),3),"-",'00:00"'],0))}return b instanceof RegExp?vg.d(c,J(['#"',b.source,'"'],0)):(b?b.i&2147483648||b.K||(b.i?0:s(vb,b)):s(vb,b))?wb(b,c,d):u?vg.d(c,J(["#\x3c",""+A.b(b),"\x3e"],0)):null}return null};
function Bg(a,b){var c=new ea;a:{var d=new Kb(c);Ag(F(a),d,b);for(var e=E(I(a)),f=null,h=0,k=0;;)if(k<h){var l=f.J(null,k);ub(d," ");Ag(l,d,b);k+=1}else if(e=E(e))f=e,Ic(f)?(e=Hb(f),h=Ib(f),f=e,l=O(e),e=h,h=l):(l=F(f),ub(d," "),Ag(l,d,b),e=I(f),f=null,h=0),k=0;else break a}return c}
var Cg=function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b=ka();return Bc(a)?"":""+A.b(Bg(a,b))}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}();function zg(a,b,c,d){return ug(c,function(a,c,d){b.c?b.c(Ta(a),c,d):b.call(null,Ta(a),c,d);ub(c," ");return b.c?b.c(Ua(a),c,d):b.call(null,Ua(a),c,d)},"{",", ","}",d,E(a))}ac.prototype.K=!0;
ac.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};V.prototype.K=!0;V.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};Bf.prototype.K=!0;Bf.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};vf.prototype.K=!0;vf.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};$.prototype.K=!0;$.prototype.w=function(a,b,c){return ug(b,Ag,"["," ","]",c,this)};Ue.prototype.K=!0;Ue.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};
cg.prototype.K=!0;cg.prototype.w=function(a,b,c){return ug(b,Ag,"#{"," ","}",c,this)};ye.prototype.K=!0;ye.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};gd.prototype.K=!0;gd.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};kc.prototype.K=!0;kc.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};xf.prototype.K=!0;xf.prototype.w=function(a,b,c){return zg(this,Ag,b,c)};wf.prototype.K=!0;wf.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};
Ae.prototype.K=!0;Ae.prototype.w=function(a,b,c){return ug(b,Ag,"["," ","]",c,this)};Qf.prototype.K=!0;Qf.prototype.w=function(a,b,c){return zg(this,Ag,b,c)};$f.prototype.K=!0;$f.prototype.w=function(a,b,c){return ug(b,Ag,"#{"," ","}",c,this)};od.prototype.K=!0;od.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};Yf.prototype.K=!0;Yf.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};Y.prototype.K=!0;Y.prototype.w=function(a,b,c){return ug(b,Ag,"["," ","]",c,this)};
W.prototype.K=!0;W.prototype.w=function(a,b,c){return ug(b,Ag,"["," ","]",c,this)};He.prototype.K=!0;He.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};cd.prototype.K=!0;cd.prototype.w=function(a,b){return ub(b,"()")};Ie.prototype.K=!0;Ie.prototype.w=function(a,b,c){return ug(b,Ag,"#queue ["," ","]",c,E(this))};la.prototype.K=!0;la.prototype.w=function(a,b,c){return zg(this,Ag,b,c)};og.prototype.K=!0;og.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};
Xf.prototype.K=!0;Xf.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};bd.prototype.K=!0;bd.prototype.w=function(a,b,c){return ug(b,Ag,"("," ",")",c,this)};W.prototype.lb=!0;W.prototype.mb=function(a,b){return Pc.a(this,b)};Ae.prototype.lb=!0;Ae.prototype.mb=function(a,b){return Pc.a(this,b)};T.prototype.lb=!0;T.prototype.mb=function(a,b){return Vb(this,b)};Zb.prototype.lb=!0;Zb.prototype.mb=function(a,b){return Vb(this,b)};
function Dg(a,b){if(a?a.gc:a)return a.gc(a,b);var c;c=Dg[m(null==a?null:a)];if(!c&&(c=Dg._,!c))throw x("IReset.-reset!",a);return c.call(null,a,b)}
var Eg=function(){function a(a,b,c,d,e){if(a?a.nc:a)return a.nc(a,b,c,d,e);var q;q=Eg[m(null==a?null:a)];if(!q&&(q=Eg._,!q))throw x("ISwap.-swap!",a);return q.call(null,a,b,c,d,e)}function b(a,b,c,d){if(a?a.mc:a)return a.mc(a,b,c,d);var e;e=Eg[m(null==a?null:a)];if(!e&&(e=Eg._,!e))throw x("ISwap.-swap!",a);return e.call(null,a,b,c,d)}function c(a,b,c){if(a?a.lc:a)return a.lc(a,b,c);var d;d=Eg[m(null==a?null:a)];if(!d&&(d=Eg._,!d))throw x("ISwap.-swap!",a);return d.call(null,a,b,c)}function d(a,b){if(a?
a.kc:a)return a.kc(a,b);var c;c=Eg[m(null==a?null:a)];if(!c&&(c=Eg._,!c))throw x("ISwap.-swap!",a);return c.call(null,a,b)}var e=null,e=function(e,h,k,l,n){switch(arguments.length){case 2:return d.call(this,e,h);case 3:return c.call(this,e,h,k);case 4:return b.call(this,e,h,k,l);case 5:return a.call(this,e,h,k,l,n)}throw Error("Invalid arity: "+arguments.length);};e.a=d;e.c=c;e.n=b;e.s=a;return e}();function Fg(a,b,c,d){this.state=a;this.j=b;this.wc=c;this.Wb=d;this.i=2153938944;this.q=16386}g=Fg.prototype;
g.B=function(){return this[ba]||(this[ba]=++ca)};g.Rb=function(a,b,c){a=E(this.Wb);for(var d=null,e=0,f=0;;)if(f<e){var h=d.J(null,f),k=P.c(h,0,null),h=P.c(h,1,null);h.n?h.n(k,this,b,c):h.call(null,k,this,b,c);f+=1}else if(a=E(a))Ic(a)?(d=Hb(a),a=Ib(a),k=d,e=O(d),d=k):(d=F(a),k=P.c(d,0,null),h=P.c(d,1,null),h.n?h.n(k,this,b,c):h.call(null,k,this,b,c),a=I(a),d=null,e=0),f=0;else return null};g.w=function(a,b,c){ub(b,"#\x3cAtom: ");Ag(this.state,b,c);return ub(b,"\x3e")};g.D=function(){return this.j};
g.ub=function(){return this.state};g.v=function(a,b){return this===b};
var Hg=function(){function a(a){return new Fg(a,null,null,null)}var b=null,c=function(){function a(c,d){var k=null;1<arguments.length&&(k=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,k)}function b(a,c){var d=Mc(c)?S.a(Tf,c):c,e=Q.a(d,Gg),d=Q.a(d,pa);return new Fg(a,d,e,null)}a.k=1;a.f=function(a){var c=F(a);a=G(a);return b(c,a)};a.d=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.d(b,J(arguments,1))}throw Error("Invalid arity: "+
arguments.length);};b.k=1;b.f=c.f;b.b=a;b.d=c.d;return b}();function Ig(a,b){if(a instanceof Fg){var c=a.wc;if(null!=c&&!r(c.b?c.b(b):c.call(null,b)))throw Error("Assert failed: Validator rejected reference state\n"+A.b(Cg.d(J([fd(new Zb(null,"validate","validate",1439230700,null),new Zb(null,"new-value","new-value",-1567397401,null))],0))));c=a.state;a.state=b;null!=a.Wb&&xb(a,c,b);return b}return Dg(a,b)}function K(a){return ab(a)}
var Jg=function(){function a(a,b,c,d){return a instanceof Fg?Ig(a,b.c?b.c(a.state,c,d):b.call(null,a.state,c,d)):Eg.n(a,b,c,d)}function b(a,b,c){return a instanceof Fg?Ig(a,b.a?b.a(a.state,c):b.call(null,a.state,c)):Eg.c(a,b,c)}function c(a,b){return a instanceof Fg?Ig(a,b.b?b.b(a.state):b.call(null,a.state)):Eg.a(a,b)}var d=null,e=function(){function a(c,d,e,f,t){var v=null;4<arguments.length&&(v=J(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,v)}function b(a,c,d,e,f){return a instanceof
Fg?Ig(a,S.s(c,a.state,d,e,f)):Eg.s(a,c,d,e,f)}a.k=4;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=I(a);var e=F(a);a=I(a);var f=F(a);a=G(a);return b(c,d,e,f,a)};a.d=b;return a}(),d=function(d,h,k,l,n){switch(arguments.length){case 2:return c.call(this,d,h);case 3:return b.call(this,d,h,k);case 4:return a.call(this,d,h,k,l);default:return e.d(d,h,k,l,J(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.k=4;d.f=e.f;d.a=c;d.c=b;d.n=a;d.d=e.d;return d}(),Kg={};
function Lg(a){if(a?a.ac:a)return a.ac(a);var b;b=Lg[m(null==a?null:a)];if(!b&&(b=Lg._,!b))throw x("IEncodeJS.-clj-\x3ejs",a);return b.call(null,a)}function Mg(a){return(a?r(r(null)?null:a.$b)||(a.Cb?0:s(Kg,a)):s(Kg,a))?Lg(a):"string"===typeof a||"number"===typeof a||a instanceof T||a instanceof Zb?Ng.b?Ng.b(a):Ng.call(null,a):Cg.d(J([a],0))}
var Ng=function Og(b){if(null==b)return null;if(b?r(r(null)?null:b.$b)||(b.Cb?0:s(Kg,b)):s(Kg,b))return Lg(b);if(b instanceof T)return id(b);if(b instanceof Zb)return""+A.b(b);if(Gc(b)){var c={};b=E(b);for(var d=null,e=0,f=0;;)if(f<e){var h=d.J(null,f),k=P.c(h,0,null),h=P.c(h,1,null);c[Mg(k)]=Og(h);f+=1}else if(b=E(b))Ic(b)?(e=Hb(b),b=Ib(b),d=e,e=O(e)):(e=F(b),d=P.c(e,0,null),e=P.c(e,1,null),c[Mg(d)]=Og(e),b=I(b),d=null,e=0),f=0;else break;return c}if(Cc(b)){c=[];b=E(Kd.a(Og,b));d=null;for(f=e=0;;)if(f<
e)k=d.J(null,f),c.push(k),f+=1;else if(b=E(b))d=b,Ic(d)?(b=Hb(d),f=Ib(d),d=b,e=O(b),b=f):(b=F(d),c.push(b),b=I(d),d=null,e=0),f=0;else break;return c}return u?b:null},Pg={};function Qg(a,b){if(a?a.Zb:a)return a.Zb(a,b);var c;c=Qg[m(null==a?null:a)];if(!c&&(c=Qg._,!c))throw x("IEncodeClojure.-js-\x3eclj",a);return c.call(null,a,b)}
var Sg=function(){function a(a){return b.d(a,J([new la(null,1,[Rg,!1],null)],0))}var b=null,c=function(){function a(c,d){var k=null;1<arguments.length&&(k=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,k)}function b(a,c){if(a?r(r(null)?null:a.Cc)||(a.Cb?0:s(Pg,a)):s(Pg,a))return Qg(a,S.a(Uf,c));if(E(c)){var d=Mc(c)?S.a(Tf,c):c,e=Q.a(d,Rg);return function(a,b,c,d){return function y(e){return Mc(e)?rg.b(Kd.a(y,e)):Cc(e)?Yd(qc(e),Kd.a(y,e)):e instanceof Array?we(Kd.a(y,e)):ta(e)===
Object?Yd(Ye,function(){return function(a,b,c,d){return function Ra(f){return new V(null,function(a,b,c,d){return function(){for(;;){var a=E(f);if(a){if(Ic(a)){var b=Hb(a),c=O(b),h=new ld(Array(c),0);a:{for(var k=0;;)if(k<c){var l=D.a(b,k),l=new W(null,2,5,X,[d.b?d.b(l):d.call(null,l),y(e[l])],null);h.add(l);k+=1}else{b=!0;break a}b=void 0}return b?pd(h.da(),Ra(Ib(a))):pd(h.da(),null)}h=F(a);return M(new W(null,2,5,X,[d.b?d.b(h):d.call(null,h),y(e[h])],null),Ra(G(a)))}return null}}}(a,b,c,d),null,
null)}}(a,b,c,d)(Jc(e))}()):u?e:null}}(c,d,e,r(e)?jd:A)(a)}return null}a.k=1;a.f=function(a){var c=F(a);a=G(a);return b(c,a)};a.d=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.d(b,J(arguments,1))}throw Error("Invalid arity: "+arguments.length);};b.k=1;b.f=c.f;b.b=a;b.d=c.d;return b}();function Tg(a){this.pb=a;this.q=0;this.i=2153775104}
Tg.prototype.B=function(){for(var a=Cg.d(J([this],0)),b=0,c=0;c<a.length;++c)b=31*b+a.charCodeAt(c),b%=4294967296;return b};Tg.prototype.w=function(a,b){return ub(b,'#uuid "'+A.b(this.pb)+'"')};Tg.prototype.v=function(a,b){return b instanceof Tg&&this.pb===b.pb};Tg.prototype.toString=function(){return this.pb};var Ug=new T(null,"ppath","ppath"),Vg=new T("zip","branch?","zip/branch?"),Wg=new T(null,"r","r"),Xg=new T("zip","children","zip/children"),pa=new T(null,"meta","meta"),qa=new T(null,"dup","dup"),u=new T(null,"else","else"),Gg=new T(null,"validator","validator"),Yb=new T(null,"default","default"),Yg=new T(null,"sequential","sequential"),ma=new T(null,"flush-on-newline","flush-on-newline"),Zg=new T(null,"l","l"),$g=new T("zip","make-node","zip/make-node"),oa=new T(null,"readably","readably"),ra=new T(null,
"print-length","print-length"),ah=new T(null,"pnodes","pnodes"),bh=new T(null,"changed?","changed?"),ch=new T(null,"tag","tag"),dh=new T(null,"set","set"),eh=new T(null,"end","end"),fh=new T(null,"atom","atom"),Rg=new T(null,"keywordize-keys","keywordize-keys"),gh=new T(null,"map","map"),hh=new T("mori","not-found","mori/not-found"),ih=new T("cljs.core","not-found","cljs.core/not-found");var jh,kh;function lh(a){return a.o?a.o():a.call(null)}function mh(a){return a.o?a.o():a.call(null)}var nh=function(){function a(a,b,c){return Gc(c)?hb(c,a,b):null==c?b:c instanceof Array?hc.c(c,a,b):u?gb.c(c,a,b):null}function b(a,b){return c.c(a,a.o?a.o():a.call(null),b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();
function oh(a,b,c,d){if(a?a.Eb:a)return a.Eb(a,b,c,d);var e;e=oh[m(null==a?null:a)];if(!e&&(e=oh._,!e))throw x("CollFold.coll-fold",a);return e.call(null,a,b,c,d)}
var qh=function ph(b,c){"undefined"===typeof jh&&(jh=function(b,c,f,h){this.$=b;this.Qa=c;this.uc=f;this.sc=h;this.q=0;this.i=917504},jh.Db=!0,jh.Bb="clojure.core.reducers/t6322",jh.Tb=function(b,c){return ub(c,"clojure.core.reducers/t6322")},jh.prototype.N=function(b,c){return gb.c(this,c,c.o?c.o():c.call(null))},jh.prototype.M=function(b,c,f){return gb.c(this.Qa,this.$.b?this.$.b(c):this.$.call(null,c),f)},jh.prototype.D=function(){return this.sc},jh.prototype.F=function(b,c){return new jh(this.$,
this.Qa,this.uc,c)});return new jh(c,b,ph,null)},sh=function rh(b,c){"undefined"===typeof kh&&(kh=function(b,c,f,h){this.$=b;this.Qa=c;this.rc=f;this.tc=h;this.q=0;this.i=917504},kh.Db=!0,kh.Bb="clojure.core.reducers/t6328",kh.Tb=function(b,c){return ub(c,"clojure.core.reducers/t6328")},kh.prototype.Eb=function(b,c,f,h){return oh(this.Qa,c,f,this.$.b?this.$.b(h):this.$.call(null,h))},kh.prototype.N=function(b,c){return gb.c(this.Qa,this.$.b?this.$.b(c):this.$.call(null,c),c.o?c.o():c.call(null))},
kh.prototype.M=function(b,c,f){return gb.c(this.Qa,this.$.b?this.$.b(c):this.$.call(null,c),f)},kh.prototype.D=function(){return this.tc},kh.prototype.F=function(b,c){return new kh(this.$,this.Qa,this.rc,c)});return new kh(c,b,rh,null)},th=function(){function a(a,b){return sh(b,function(b){return function(){var c=null;return c=function(c,e,h){switch(arguments.length){case 0:return b.o?b.o():b.call(null);case 2:return b.a?b.a(c,a.b?a.b(e):a.call(null,e)):b.call(null,c,a.b?a.b(e):a.call(null,e));case 3:return b.a?
b.a(c,a.a?a.a(e,h):a.call(null,e,h)):b.call(null,c,a.a?a.a(e,h):a.call(null,e,h))}throw Error("Invalid arity: "+arguments.length);}}()})}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),uh=function(){function a(a,b){return sh(b,function(b){return function(){var c=null;return c=function(c,e,h){switch(arguments.length){case 0:return b.o?
b.o():b.call(null);case 2:return r(a.b?a.b(e):a.call(null,e))?b.a?b.a(c,e):b.call(null,c,e):c;case 3:return r(a.a?a.a(e,h):a.call(null,e,h))?b.c?b.c(c,e,h):b.call(null,c,e,h):c}throw Error("Invalid arity: "+arguments.length);}}()})}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),vh=function(){function a(a){return sh(a,
function(a){return function(){var b=null;return b=function(b,d){switch(arguments.length){case 0:return a.o?a.o():a.call(null);case 2:return Fc(d)?c.b(d).M(null,a,b):a.a?a.a(b,d):a.call(null,b,d)}throw Error("Invalid arity: "+arguments.length);}}()})}function b(){return function(a){return c.b(a)}}var c=null,c=function(c){switch(arguments.length){case 0:return b.call(this);case 1:return a.call(this,c)}throw Error("Invalid arity: "+arguments.length);};c.o=b;c.b=a;return c}(),wh=function(){function a(a,
b){return uh.a(Gd(a),b)}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),xh=function(){function a(a,b){return qh(b,function(b){return function(){var c=null;return c=function(c,e,h){switch(arguments.length){case 0:return b.o?b.o():b.call(null);case 2:return r(a.b?a.b(e):a.call(null,e))?b.a?b.a(c,e):b.call(null,c,e):
new ec(c);case 3:return r(a.a?a.a(e,h):a.call(null,e,h))?b.c?b.c(c,e,h):b.call(null,c,e,h):new ec(c)}throw Error("Invalid arity: "+arguments.length);}}()})}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),yh=function(){function a(a,b){return qh(b,function(b){return function(a){return function(){var c=null;return c=
function(c,d,e){switch(arguments.length){case 0:return b.o?b.o():b.call(null);case 2:return Jg.a(a,Wc),0>ab(a)?new ec(c):b.a?b.a(c,d):b.call(null,c,d);case 3:return Jg.a(a,Wc),0>ab(a)?new ec(c):b.c?b.c(c,d,e):b.call(null,c,d,e)}throw Error("Invalid arity: "+arguments.length);}}()}(Hg.b(a))})}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);
};c.b=b;c.a=a;return c}(),zh=function(){function a(a,b){return qh(b,function(b){return function(a){return function(){var c=null;return c=function(c,d,e){switch(arguments.length){case 0:return b.o?b.o():b.call(null);case 2:return Jg.a(a,Wc),0>ab(a)?b.a?b.a(c,d):b.call(null,c,d):c;case 3:return Jg.a(a,Wc),0>ab(a)?b.c?b.c(c,d,e):b.call(null,c,d,e):c}throw Error("Invalid arity: "+arguments.length);}}()}(Hg.b(a))})}function b(a){return function(b){return c.a(a,b)}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Bh=function Ah(b,c,d,e){if(Bc(b))return d.o?d.o():d.call(null);if(O(b)<=c)return nh.c(e,d.o?d.o():d.call(null),b);if(u){var f=Yc(O(b)),h=ze.c(b,0,f);b=ze.c(b,f,O(b));return lh(function(b,c,e,f){return function(){var b=f(c),h;h=f(e);return d.a?d.a(b.o?b.o():b.call(null),mh(h)):d.call(null,b.o?b.o():b.call(null),mh(h))}}(f,h,b,function(b,f,h){return function(q){return function(){return function(){return Ah(q,
c,d,e)}}(b,f,h)}}(f,h,b)))}return null};W.prototype.Eb=function(a,b,c,d){return Bh(this,b,c,d)};oh.object=function(a,b,c,d){return nh.c(d,c.o?c.o():c.call(null),a)};oh["null"]=function(a,b,c){return c.o?c.o():c.call(null)};function Ch(a,b){var c=S.c(ig,a,b);return M(c,Vd(function(a){return function(b){return a===b}}(c),b))}
var Dh=function(){function a(a,b){return O(a)<O(b)?C.c(pc,b,a):C.c(pc,a,b)}var b=null,c=function(){function a(c,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,l)}function b(a,c,d){a=Ch(O,pc.d(d,c,J([a],0)));return C.c(Yd,F(a),G(a))}a.k=2;a.f=function(a){var c=F(a);a=I(a);var d=F(a);a=G(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return bg;case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,
e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.o=function(){return bg};b.b=function(a){return a};b.a=a;b.d=c.d;return b}(),Eh=function(){function a(a,b){for(;;)if(O(b)<O(a)){var c=a;a=b;b=c}else return C.c(function(a,b){return function(a,c){return Oc(b,c)?a:Ac.a(a,c)}}(a,b),a,a)}var b=null,c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){a=Ch(function(a){return-O(a)},
pc.d(e,d,J([a],0)));return C.c(b,F(a),G(a))}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}(),Fh=function(){function a(a,b){return O(a)<O(b)?C.c(function(a,c){return Oc(b,c)?Ac.a(a,c):a},a,a):C.c(Ac,a,b)}var b=null,
c=function(){function a(b,d,k){var l=null;2<arguments.length&&(l=J(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){return C.c(b,a,pc.a(e,d))}a.k=2;a.f=function(a){var b=F(a);a=I(a);var d=F(a);a=G(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:return c.d(b,e,J(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.k=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=
c.d;return b}();function Gh(a,b){return Wb.a(a,b)?new W(null,3,5,X,[null,null,a],null):new W(null,3,5,X,[a,b,null],null)}function Hh(a){return E(a)?C.c(function(a,c){var d=P.c(c,0,null),e=P.c(c,1,null);return R.c(a,d,e)},we(Od.a(S.a(Xc,Ve(a)),null)),a):null}
function Ih(a,b,c){var d=Q.a(a,c),e=Q.a(b,c),f=Jh.a?Jh.a(d,e):Jh.call(null,d,e),h=P.c(f,0,null),k=P.c(f,1,null),f=P.c(f,2,null);a=Oc(a,c);b=Oc(b,c);d=a&&b&&(null!=f||null==d&&null==e);return new W(null,3,5,X,[!a||null==h&&d?null:new af([c,h]),!b||null==k&&d?null:new af([c,k]),d?new af([c,f]):null],null)}
var Kh=function(){function a(a,b,c){return C.c(function(a,b){return rg.b(Kd.c(Zf,a,b))},new W(null,3,5,X,[null,null,null],null),Kd.a(Id.c(Ih,a,b),c))}function b(a,b){return c.c(a,b,Dh.a(Ve(a),Ve(b)))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();
function Lh(a,b){return we(Kd.a(Hh,Kh.c(Hc(a)?a:we(a),Hc(b)?b:we(b),pg.b(function(){var c=O(a),d=O(b);return c>d?c:d}()))))}function Mh(a,b){return new W(null,3,5,X,[Cd(Fh.a(a,b)),Cd(Fh.a(b,a)),Cd(Eh.a(a,b))],null)}function Nh(a){if(a?a.qc:a)return a.qc(a);var b;b=Nh[m(null==a?null:a)];if(!b&&(b=Nh._,!b))throw x("EqualityPartition.equality-partition",a);return b.call(null,a)}
function Oh(a,b){if(a?a.pc:a)return a.pc(a,b);var c;c=Oh[m(null==a?null:a)];if(!c&&(c=Oh._,!c))throw x("Diff.diff-similar",a);return c.call(null,a,b)}Nh._=function(a){return(a?a.i&1024||a.cc||(a.i?0:s(Pa,a)):s(Pa,a))?gh:(a?a.i&4096||a.jc||(a.i?0:s(Va,a)):s(Va,a))?dh:(a?a.i&16777216||a.ic||(a.i?0:s(mb,a)):s(mb,a))?Yg:Yb?fh:null};Nh["boolean"]=function(){return fh};Nh["function"]=function(){return fh};Nh.array=function(){return Yg};Nh.number=function(){return fh};Nh.string=function(){return fh};
Nh["null"]=function(){return fh};Oh._=function(a,b){return function(){switch(Nh(a)instanceof T?Nh(a).sa:null){case "map":return Kh;case "sequential":return Lh;case "set":return Mh;case "atom":return Gh;default:throw Error("No matching clause: "+A.b(Nh(a)));}}().call(null,a,b)};Oh["boolean"]=function(a,b){return Gh(a,b)};Oh["function"]=function(a,b){return Gh(a,b)};Oh.array=function(a,b){return Lh(a,b)};Oh.number=function(a,b){return Gh(a,b)};Oh.string=function(a,b){return Gh(a,b)};
Oh["null"]=function(a,b){return Gh(a,b)};function Jh(a,b){return Wb.a(a,b)?new W(null,3,5,X,[null,null,a],null):Wb.a(Nh(a),Nh(b))?Oh(a,b):Gh(a,b)};function Ph(a){if(a?a.Ub:a)return a.Ub();var b;b=Ph[m(null==a?null:a)];if(!b&&(b=Ph._,!b))throw x("PushbackReader.read-char",a);return b.call(null,a)}function Qh(a,b){if(a?a.Vb:a)return a.Vb(0,b);var c;c=Qh[m(null==a?null:a)];if(!c&&(c=Qh._,!c))throw x("PushbackReader.unread",a);return c.call(null,a,b)}function Rh(a,b,c){this.r=a;this.buffer=b;this.Fb=c}Rh.prototype.Ub=function(){return 0===this.buffer.length?(this.Fb+=1,this.r[this.Fb]):this.buffer.pop()};Rh.prototype.Vb=function(a,b){return this.buffer.push(b)};
function Sh(a){var b=!/[^\t\n\r ]/.test(a);return r(b)?b:","===a}var Th=function(){function a(a,d){var e=null;1<arguments.length&&(e=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,0,e)}function b(a,b){throw Error(S.a(A,b));}a.k=1;a.f=function(a){F(a);a=G(a);return b(0,a)};a.d=b;return a}();
function Uh(a,b){for(var c=new ea(b),d=Ph(a);;){var e;if(!(e=null==d||Sh(d))){e=d;var f="#"!==e;e=f?(f="'"!==e)?(f=":"!==e)?Vh.b?Vh.b(e):Vh.call(null,e):f:f:f}if(e)return Qh(a,d),c.toString();c.append(d);d=Ph(a)}}function Wh(a){for(;;){var b=Ph(a);if("\n"===b||"\r"===b||null==b)return a}}var Xh=tg("^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+))(N)?$"),Yh=tg("^([-+]?[0-9]+)/([0-9]+)$"),Zh=tg("^([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?$"),$h=tg("^[:]?([^0-9/].*/)?([^0-9/][^/]*)$");
function ai(a,b){var c=a.exec(b);return null!=c&&c[0]===b?1===c.length?c[0]:c:null}var bi=tg("^[0-9A-Fa-f]{2}$"),ci=tg("^[0-9A-Fa-f]{4}$");function di(a,b,c,d){return r(sg(a,d))?d:Th.d(b,J(["Unexpected unicode escape \\",c,d],0))}function ei(a){return String.fromCharCode(parseInt(a,16))}
function fi(a){var b=Ph(a),c="t"===b?"\t":"r"===b?"\r":"n"===b?"\n":"\\"===b?"\\":'"'===b?'"':"b"===b?"\b":"f"===b?"\f":null;r(c)?a=c:"x"===b?(c=(new ea(Ph(a),Ph(a))).toString(),a=ei(di(bi,a,b,c))):"u"===b?(c=(new ea(Ph(a),Ph(a),Ph(a),Ph(a))).toString(),a=ei(di(ci,a,b,c))):a=/[^0-9]/.test(b)?u?Th.d(a,J(["Unexpected unicode escape \\",b],0)):null:String.fromCharCode(b);return a}
function gi(a,b){for(var c=yb(qe);;){var d;a:{d=Sh;for(var e=b,f=Ph(e);;)if(r(d.b?d.b(f):d.call(null,f)))f=Ph(e);else{d=f;break a}d=void 0}r(d)||Th.d(b,J(["EOF while reading"],0));if(a===d)return Ab(c);e=Vh.b?Vh.b(d):Vh.call(null,d);r(e)?d=e.a?e.a(b,d):e.call(null,b,d):(Qh(b,d),d=hi.n?hi.n(b,!0,null,!0):hi.call(null,b,!0,null));c=d===b?c:wd.a(c,d)}}function ii(a,b){return Th.d(a,J(["Reader for ",b," not implemented yet"],0))}
function ji(a,b){var c=Ph(a),d=ki.b?ki.b(c):ki.call(null,c);if(r(d))return d.a?d.a(a,b):d.call(null,a,b);d=li.a?li.a(a,c):li.call(null,a,c);return r(d)?d:Th.d(a,J(["No dispatch macro for ",c],0))}function mi(a,b){return Th.d(a,J(["Unmached delimiter ",b],0))}function ni(a){return S.a(fd,gi(")",a))}function oi(a){return gi("]",a)}
function pi(a){var b=gi("}",a),c=O(b);if("number"!==typeof c||isNaN(c)||Infinity===c||parseFloat(c)!==parseInt(c,10))throw Error("Argument must be an integer: "+A.b(c));0!==(c&1)&&Th.d(a,J(["Map literal must contain an even number of forms"],0));return S.a(Tf,b)}function qi(a){for(var b=new ea,c=Ph(a);;){if(null==c)return Th.d(a,J(["EOF while reading"],0));if("\\"===c)b.append(fi(a)),c=Ph(a);else{if('"'===c)return b.toString();if(Yb)b.append(c),c=Ph(a);else return null}}}
function ri(a){for(var b=new ea,c=Ph(a);;){if(null==c)return Th.d(a,J(["EOF while reading"],0));if("\\"===c){b.append(c);var d=Ph(a);if(null==d)return Th.d(a,J(["EOF while reading"],0));var e=function(){var a=b;a.append(d);return a}(),f=Ph(a),b=e,c=f}else{if('"'===c)return b.toString();if(u)e=function(){var a=b;a.append(c);return a}(),f=Ph(a),b=e,c=f;else return null}}}
function si(a,b){var c=Uh(a,b);if(r(-1!=c.indexOf("/")))c=$b.a(ad.c(c,0,c.indexOf("/")),ad.c(c,c.indexOf("/")+1,c.length));else var d=$b.b(c),c="nil"===c?null:"true"===c?!0:"false"===c?!1:u?d:null;return c}function ti(a){var b=Uh(a,Ph(a)),c=ai($h,b),b=c[0],d=c[1],c=c[2];return void 0!==d&&":/"===d.substring(d.length-2,d.length)||":"===c[c.length-1]||-1!==b.indexOf("::",1)?Th.d(a,J(["Invalid token: ",b],0)):null!=d&&0<d.length?jd.a(d.substring(0,d.indexOf("/")),c):jd.b(b)}
function ui(a){return function(b){return Da(Da(H,hi.n?hi.n(b,!0,null,!0):hi.call(null,b,!0,null)),a)}}function vi(){return function(a){return Th.d(a,J(["Unreadable form"],0))}}
function wi(a){var b;b=hi.n?hi.n(a,!0,null,!0):hi.call(null,a,!0,null);b=b instanceof Zb?new la(null,1,[ch,b],null):"string"===typeof b?new la(null,1,[ch,b],null):b instanceof T?new af([b,!0]):u?b:null;Gc(b)||Th.d(a,J(["Metadata must be Symbol,Keyword,String or Map"],0));var c=hi.n?hi.n(a,!0,null,!0):hi.call(null,a,!0,null);return(c?c.i&262144||c.oc||(c.i?0:s(db,c)):s(db,c))?N(c,Zf.d(J([xc(c),b],0))):Th.d(a,J(["Metadata can only be applied to IWithMetas"],0))}function xi(a){return eg(gi("}",a))}
function yi(a){return tg(ri(a))}function zi(a){hi.n?hi.n(a,!0,null,!0):hi.call(null,a,!0,null);return a}function Vh(a){return'"'===a?qi:":"===a?ti:";"===a?Wh:"'"===a?ui(new Zb(null,"quote","quote",1377916282,null)):"@"===a?ui(new Zb(null,"deref","deref",1494944732,null)):"^"===a?wi:"`"===a?ii:"~"===a?ii:"("===a?ni:")"===a?mi:"["===a?oi:"]"===a?mi:"{"===a?pi:"}"===a?mi:"\\"===a?Ph:"#"===a?ji:null}function ki(a){return"{"===a?xi:"\x3c"===a?vi():'"'===a?yi:"!"===a?Wh:"_"===a?zi:null}
function hi(a,b,c){for(;;){var d=Ph(a);if(null==d)return r(b)?Th.d(a,J(["EOF while reading"],0)):c;if(!Sh(d))if(";"===d)a=Wh.a?Wh.a(a,d):Wh.call(null,a);else if(u){var e=Vh(d);if(r(e))e=e.a?e.a(a,d):e.call(null,a,d);else{var e=a,f=void 0;!(f=!/[^0-9]/.test(d))&&(f=void 0,f="+"===d||"-"===d)&&(f=Ph(e),Qh(e,f),f=!/[^0-9]/.test(f));if(f)a:{e=a;d=new ea(d);for(f=Ph(e);;){var h;h=null==f;h||(h=(h=Sh(f))?h:Vh.b?Vh.b(f):Vh.call(null,f));if(r(h)){Qh(e,f);f=d=d.toString();h=void 0;if(r(ai(Xh,f)))if(f=ai(Xh,
f),null!=f[2])h=0;else{h=r(f[3])?[f[3],10]:r(f[4])?[f[4],16]:r(f[5])?[f[5],8]:r(f[6])?[f[7],parseInt(f[6],10)]:u?[null,null]:null;var k=h[0];null==k?h=null:(h=parseInt(k,h[1]),h="-"===f[1]?-h:h)}else h=void 0,r(ai(Yh,f))?(f=ai(Yh,f),h=parseInt(f[1],10)/parseInt(f[2],10)):h=r(ai(Zh,f))?parseFloat(f):null;f=h;e=r(f)?f:Th.d(e,J(["Invalid number format [",d,"]"],0));break a}d.append(f);f=Ph(e)}e=void 0}else e=u?si(a,d):null}if(e!==a)return e}else return null}}
function Ai(a){if(Wb.a(3,O(a)))return a;if(3<O(a))return ad.c(a,0,3);if(u)for(a=new ea(a);;)if(3>a.Va.length)a=a.append("0");else return a.toString();else return null}var Bi=function(a,b){return function(c,d){return Q.a(r(d)?b:a,c)}}(new W(null,13,5,X,[null,31,28,31,30,31,30,31,31,30,31,30,31],null),new W(null,13,5,X,[null,31,29,31,30,31,30,31,31,30,31,30,31],null)),Ci=/(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;
function Di(a){a=parseInt(a,10);return sa(isNaN(a))?a:null}function Ei(a,b,c,d){a<=b&&b<=c||Th.d(null,J([""+A.b(d)+" Failed:  "+A.b(a)+"\x3c\x3d"+A.b(b)+"\x3c\x3d"+A.b(c)],0));return b}
function Fi(a){var b=sg(Ci,a);P.c(b,0,null);var c=P.c(b,1,null),d=P.c(b,2,null),e=P.c(b,3,null),f=P.c(b,4,null),h=P.c(b,5,null),k=P.c(b,6,null),l=P.c(b,7,null),n=P.c(b,8,null),q=P.c(b,9,null),t=P.c(b,10,null);if(sa(b))return Th.d(null,J(["Unrecognized date/time syntax: "+A.b(a)],0));a=Di(c);var b=function(){var a=Di(d);return r(a)?a:1}(),c=function(){var a=Di(e);return r(a)?a:1}(),v=function(){var a=Di(f);return r(a)?a:0}(),w=function(){var a=Di(h);return r(a)?a:0}(),y=function(){var a=Di(k);return r(a)?
a:0}(),B=function(){var a=Di(Ai(l));return r(a)?a:0}(),n=(Wb.a(n,"-")?-1:1)*(60*function(){var a=Di(q);return r(a)?a:0}()+function(){var a=Di(t);return r(a)?a:0}());return new W(null,8,5,X,[a,Ei(1,b,12,"timestamp month field must be in range 1..12"),Ei(1,c,Bi.a?Bi.a(b,0===(a%4+4)%4&&(0!==(a%100+100)%100||0===(a%400+400)%400)):Bi.call(null,b,0===(a%4+4)%4&&(0!==(a%100+100)%100||0===(a%400+400)%400)),"timestamp day field must be in range 1..last day in month"),Ei(0,v,23,"timestamp hour field must be in range 0..23"),
Ei(0,w,59,"timestamp minute field must be in range 0..59"),Ei(0,y,Wb.a(w,59)?60:59,"timestamp second field must be in range 0..60"),Ei(0,B,999,"timestamp millisecond field must be in range 0..999"),n],null)}
var Gi=Hg.b(new la(null,4,["inst",function(a){var b;if("string"===typeof a)if(b=Fi(a),r(b)){a=P.c(b,0,null);var c=P.c(b,1,null),d=P.c(b,2,null),e=P.c(b,3,null),f=P.c(b,4,null),h=P.c(b,5,null),k=P.c(b,6,null);b=P.c(b,7,null);b=new Date(Date.UTC(a,c-1,d,e,f,h,k)-6E4*b)}else b=Th.d(null,J(["Unrecognized date/time syntax: "+A.b(a)],0));else b=Th.d(null,J(["Instance literal expects a string for its timestamp."],0));return b},"uuid",function(a){return"string"===typeof a?new Tg(a):Th.d(null,J(["UUID literal expects a string as its representation."],
0))},"queue",function(a){return Hc(a)?Yd(Je,a):Th.d(null,J(["Queue literal expects a vector for its elements."],0))},"js",function(a){if(Hc(a)){var b=[];a=E(a);for(var c=null,d=0,e=0;;)if(e<d){var f=c.J(null,e);b.push(f);e+=1}else if(a=E(a))c=a,Ic(c)?(a=Hb(c),e=Ib(c),c=a,d=O(a),a=e):(a=F(c),b.push(a),a=I(c),c=null,d=0),e=0;else break;return b}if(Gc(a)){b={};a=E(a);c=null;for(e=d=0;;)if(e<d){var h=c.J(null,e),f=P.c(h,0,null),h=P.c(h,1,null);b[id(f)]=h;e+=1}else if(a=E(a))Ic(a)?(d=Hb(a),a=Ib(a),c=d,
d=O(d)):(d=F(a),c=P.c(d,0,null),d=P.c(d,1,null),b[id(c)]=d,a=I(a),c=null,d=0),e=0;else break;return b}return u?Th.d(null,J(["JS literal expects a vector or map containing only string or unqualified keyword keys"],0)):null}],null)),Hi=Hg.b(null);
function li(a,b){var c=si(a,b),d=Q.a(ab(Gi),""+A.b(c)),e=ab(Hi);return r(d)?d.b?d.b(hi(a,!0,null)):d.call(null,hi(a,!0,null)):r(e)?e.a?e.a(c,hi(a,!0,null)):e.call(null,c,hi(a,!0,null)):u?Th.d(a,J(["Could not find tag parser for ",""+A.b(c)," in ",Cg.d(J([Ve(ab(Gi))],0))],0)):null};p("mori.apply",S);p("mori.count",O);p("mori.distinct",function(a){return function c(a,e){return new V(null,function(){return function(a,d){for(;;){var e=a,l=P.c(e,0,null);if(e=E(e))if(Oc(d,l))l=G(e),e=d,a=l,d=e;else return M(l,c(G(e),pc.a(d,l)));else return null}}.call(null,a,e)},null,null)}(a,bg)});p("mori.empty",qc);p("mori.first",F);p("mori.rest",G);p("mori.seq",E);p("mori.conj",pc);p("mori.cons",M);
p("mori.find",function(a,b){return null!=a&&Ec(a)&&Oc(a,b)?new W(null,2,5,X,[b,Q.a(a,b)],null):null});p("mori.nth",P);p("mori.last",oc);p("mori.assoc",R);p("mori.dissoc",tc);p("mori.get_in",$d);p("mori.update_in",ae);p("mori.assoc_in",function Ii(b,c,d){var e=P.c(c,0,null);return(c=$c(c))?R.c(b,e,Ii(Q.a(b,e),c,d)):R.c(b,e,d)});p("mori.fnil",Jd);p("mori.disj",Ac);p("mori.pop",zc);p("mori.peek",yc);p("mori.hash",Tb);p("mori.get",Q);p("mori.has_key",Oc);p("mori.is_empty",Bc);p("mori.reverse",ed);
p("mori.take",Md);p("mori.drop",Nd);p("mori.take_nth",function Ji(b,c){return new V(null,function(){var d=E(c);return d?M(F(d),Ji(b,Nd(b,d))):null},null,null)});p("mori.partition",Zd);p("mori.partition_all",jg);p("mori.partition_by",function Ki(b,c){return new V(null,function(){var d=E(c);if(d){var e=F(d),f=b.b?b.b(e):b.call(null,e),e=M(e,lg(function(c,d){return function(c){return Wb.a(d,b.b?b.b(c):b.call(null,c))}}(e,f,d,d),I(d)));return M(e,Ki(b,E(Nd(O(e),d))))}return null},null,null)});
p("mori.iterate",function Li(b,c){return M(c,new V(null,function(){return Li(b,b.b?b.b(c):b.call(null,c))},null,null))});p("mori.into",Yd);p("mori.merge",Zf);p("mori.subvec",ze);p("mori.take_while",lg);p("mori.drop_while",function(a,b){return new V(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=E(b),f;f=(f=e)?a.b?a.b(F(e)):a.call(null,F(e)):f;if(r(f))f=a,e=G(e),a=f,b=e;else return e}}),null,null)});
p("mori.group_by",function(a,b){return C.c(function(b,d){var e=a.b?a.b(d):a.call(null,d);return R.c(b,e,pc.a(Q.c(b,e,qe),d))},Ye,b)});p("mori.interpose",function(a,b){return Nd(1,Qd.a(Od.b(a),b))});p("mori.interleave",Qd);p("mori.concat",td);p("mori.conj1",function(a,b){return a.G(null,b)});function Xd(a){return a instanceof Array||Fc(a)}p("mori.flatten",function(a){return Ud(function(a){return!Xd(a)},G(Wd(a)))});p("mori.lazy_seq",function(a){return new V(null,a,null,null)});p("mori.keys",Ve);
p("mori.select_keys",function(a,b){for(var c=Ye,d=E(b);;)if(d)var e=F(d),f=Q.c(a,e,ih),c=Bd.a(f,ih)?R.c(c,e,f):c,d=I(d);else return c});p("mori.vals",We);p("mori.prim_seq",mc);p("mori.map",Kd);p("mori.mapcat",Sd);p("mori.reduce",C);p("mori.reduce_kv",function(a,b,c){return null!=c?hb(c,a,b):b});p("mori.filter",Ud);p("mori.remove",Vd);p("mori.some",Ed);p("mori.every",Dd);p("mori.equals",Wb);p("mori.range",pg);p("mori.repeat",Od);p("mori.repeatedly",Pd);p("mori.sort",Sc);p("mori.sort_by",Tc);
p("mori.into_array",xa);p("mori.subseq",ng);p("mori.rmap",th);p("mori.rfilter",uh);p("mori.rremove",wh);p("mori.rtake",yh);p("mori.rtake_while",xh);p("mori.rdrop",zh);p("mori.rflatten",vh);p("mori.list",fd);p("mori.vector",xe);p("mori.array_map",Uf);p("mori.hash_map",Tf);p("mori.set",eg);p("mori.sorted_set",fg);p("mori.sorted_set_by",gg);p("mori.sorted_map",Vf);p("mori.sorted_map_by",Wf);
p("mori.queue",function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return Yd.a?Yd.a(Je,a):Yd.call(null,Je,a)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}());p("mori.keyword",jd);p("mori.symbol",$b);p("mori.zipmap",function(a,b){for(var c=yb(Ye),d=E(a),e=E(b);;)if(d&&e)c=xd.c(c,F(d),F(e)),d=I(d),e=I(e);else return Ab(c)});
p("mori.is_list",function(a){return a?a.i&33554432||a.Ec?!0:a.i?!1:s(nb,a):s(nb,a)});p("mori.is_seq",Mc);p("mori.is_vector",Hc);p("mori.is_map",Gc);p("mori.is_set",Dc);p("mori.is_keyword",function(a){return a instanceof T});p("mori.is_symbol",function(a){return a instanceof Zb});p("mori.is_collection",Cc);p("mori.is_sequential",Fc);p("mori.is_associative",Ec);p("mori.is_counted",ic);p("mori.is_indexed",jc);p("mori.is_reduceable",function(a){return a?a.i&524288||a.Nb?!0:a.i?!1:s(fb,a):s(fb,a)});
p("mori.is_seqable",function(a){return a?a.i&8388608||a.hc?!0:a.i?!1:s(kb,a):s(kb,a)});p("mori.is_reversible",dd);p("mori.union",Dh);p("mori.intersection",Eh);p("mori.difference",Fh);p("mori.is_subset",function(a,b){return O(a)<=O(b)&&Dd(function(a){return Oc(b,a)},a)});p("mori.is_superset",function(a,b){return O(a)>=O(b)&&Dd(function(b){return Oc(a,b)},b)});p("mori.partial",Id);p("mori.comp",Hd);
p("mori.pipeline",function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return C.a?C.a(function(a,b){return b.b?b.b(a):b.call(null,a)},a):C.call(null,function(a,b){return b.b?b.b(a):b.call(null,a)},a)}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}());
p("mori.curry",function(){function a(a,d){var e=null;1<arguments.length&&(e=J(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return function(e){return S.a(a,M.a?M.a(e,b):M.call(null,e,b))}}a.k=1;a.f=function(a){var d=F(a);a=G(a);return b(d,a)};a.d=b;return a}());
p("mori.juxt",function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return function(){function b(a){var c=null;0<arguments.length&&(c=J(Array.prototype.slice.call(arguments,0),0));return e.call(this,c)}function e(b){return xa.b?xa.b(Kd.a?Kd.a(function(a){return S.a(a,b)},a):Kd.call(null,function(a){return S.a(a,b)},a)):xa.call(null,Kd.a?Kd.a(function(a){return S.a(a,b)},a):Kd.call(null,function(a){return S.a(a,
b)},a))}b.k=0;b.f=function(a){a=E(a);return e(a)};b.d=e;return b}()}a.k=0;a.f=function(a){a=E(a);return b(a)};a.d=b;return a}());
p("mori.knit",function(){function a(a){var d=null;0<arguments.length&&(d=J(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return function(b){return xa.b?xa.b(Kd.c?Kd.c(function(a,b){return a.b?a.b(b):a.call(null,b)},a,b):Kd.call(null,function(a,b){return a.b?a.b(b):a.call(null,b)},a,b)):xa.call(null,Kd.c?Kd.c(function(a,b){return a.b?a.b(b):a.call(null,b)},a,b):Kd.call(null,function(a,b){return a.b?a.b(b):a.call(null,b)},a,b))}}a.k=0;a.f=function(a){a=E(a);return b(a)};
a.d=b;return a}());p("mori.diff",Jh);p("mori.sum",function(a,b){return a+b});p("mori.inc",function(a){return a+1});p("mori.dec",function(a){return a-1});p("mori.is_even",function(a){return 0===(a%2+2)%2});p("mori.is_odd",function(a){return 1===(a%2+2)%2});p("mori.each",function(a,b){for(var c=E(a),d=null,e=0,f=0;;)if(f<e){var h=d.J(null,f);b.b?b.b(h):b.call(null,h);f+=1}else if(c=E(c))d=c,Ic(d)?(c=Hb(d),e=Ib(d),d=c,h=O(c),c=e,e=h):(h=F(d),b.b?b.b(h):b.call(null,h),c=I(d),d=null,e=0),f=0;else return null});
p("mori.identity",Fd);p("mori.constantly",function(a){return function(){function b(b){0<arguments.length&&J(Array.prototype.slice.call(arguments,0),0);return a}b.k=0;b.f=function(b){E(b);return a};b.d=function(){return a};return b}()});p("mori.clj_to_js",Ng);
p("mori.js_to_clj",function(){function a(a,b){return Sg.d(a,J([Rg,b],0))}function b(a){return Sg.b(a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}());p("mori.parse",function(a){return hi(new Rh(a,[],-1),!1,null)});
p("mori.configure",function(a,b){switch(a){case "print-length":return ia=b;case "print-level":return ja=b;default:throw Error("No matching clause: "+A.b(a));}});
p("mori.proxy",function(a){if("undefined"!==typeof Proxy)return Proxy.create(function(){return{has:function(b){return Oc(a,b)},hasOwn:function(b){return Oc(a,b)},get:function(b,c){var d=Q.c?Q.c(a,c,hh):Q.call(null,a,c,hh);return hd(d,hh)?ic(a)&&"length"===c?O.b?O.b(a):O.call(null,a):null:u?d:null},set:function(){return null},enumerate:function(){return xa.b?xa.b(Ve.b?Ve.b(a):Ve.call(null,a)):xa.call(null,Ve.b?Ve.b(a):Ve.call(null,a))},keys:function(){return Gc(a)?xa.b?xa.b(Ve.b?Ve.b(a):Ve.call(null,
a)):xa.call(null,Ve.b?Ve.b(a):Ve.call(null,a)):Hc(a)?xa.b?xa.b(pg.b?pg.b(O.b?O.b(a):O.call(null,a)):pg.call(null,O.b?O.b(a):O.call(null,a))):xa.call(null,pg.b?pg.b(O.b?O.b(a):O.call(null,a)):pg.call(null,O.b?O.b(a):O.call(null,a))):null}}}());throw Error("ES6 Proxy not supported!");});V.prototype.inspect=function(){return this.toString()};ac.prototype.inspect=function(){return this.toString()};kc.prototype.inspect=function(){return this.toString()};Bf.prototype.inspect=function(){return this.toString()};
vf.prototype.inspect=function(){return this.toString()};wf.prototype.inspect=function(){return this.toString()};bd.prototype.inspect=function(){return this.toString()};gd.prototype.inspect=function(){return this.toString()};cd.prototype.inspect=function(){return this.toString()};W.prototype.inspect=function(){return this.toString()};od.prototype.inspect=function(){return this.toString()};ye.prototype.inspect=function(){return this.toString()};Ae.prototype.inspect=function(){return this.toString()};
$.prototype.inspect=function(){return this.toString()};Y.prototype.inspect=function(){return this.toString()};la.prototype.inspect=function(){return this.toString()};xf.prototype.inspect=function(){return this.toString()};Qf.prototype.inspect=function(){return this.toString()};$f.prototype.inspect=function(){return this.toString()};cg.prototype.inspect=function(){return this.toString()};og.prototype.inspect=function(){return this.toString()};T.prototype.inspect=function(){return this.toString()};
Zb.prototype.inspect=function(){return this.toString()};Ie.prototype.inspect=function(){return this.toString()};He.prototype.inspect=function(){return this.toString()};p("mori._equiv",function(a,b){return a.Hc(b)});p("mori._keys",function(a){return a.keys()});p("mori._values",function(a){return a.values()});p("mori._entries",function(a){return a.entries()});p("mori._has",function(a){return a.has()});p("mori._get",function(a){return a.get()});p("mori._forEach",function(a){return a.forEach()});
p("mori._next",function(a){return a.next()});p("mori.mutable.thaw",function(a){return yb(a)});p("mori.mutable.freeze",vd);p("mori.mutable.conj1",function(a,b){return a.Ka(null,b)});p("mori.mutable.conj",wd);p("mori.mutable.assoc",xd);p("mori.mutable.dissoc",yd);p("mori.mutable.pop",function(a){return Eb(a)});p("mori.mutable.disj",zd);function Mi(a,b,c,d){return N(new W(null,2,5,X,[d,null],null),new la(null,3,[$g,c,Xg,b,Vg,a],null))}function Ni(a){return a.b?a.b(0):a.call(null,0)}function Oi(a){return Vg.b(xc(a)).call(null,Ni(a))}function Pi(a){if(r(Oi(a)))return Xg.b(xc(a)).call(null,Ni(a));throw"called children on a leaf node";}function Qi(a,b,c){return $g.b(xc(a)).call(null,b,c)}
function Ri(a){if(r(Oi(a))){var b=P.c(a,0,null),c=P.c(a,1,null),d=Pi(a),e=P.c(d,0,null),f=$c(d);return r(d)?N(new W(null,2,5,X,[e,new la(null,4,[Zg,qe,ah,r(c)?pc.a(ah.b(c),b):new W(null,1,5,X,[b],null),Ug,c,Wg,f],null)],null),xc(a)):null}return null}
function Si(a){var b=P.c(a,0,null),c=P.c(a,1,null),d=Mc(c)?S.a(Tf,c):c,c=Q.a(d,Zg),e=Q.a(d,Ug),f=Q.a(d,ah),h=Q.a(d,Wg),d=Q.a(d,bh);return r(f)?(f=yc(f),N(r(d)?new W(null,2,5,X,[Qi(a,f,td.a(c,M(b,h))),r(e)?R.c(e,bh,!0):e],null):new W(null,2,5,X,[f,e],null),xc(a))):null}function Ti(a){var b=P.c(a,0,null),c=P.c(a,1,null),c=Mc(c)?S.a(Tf,c):c,d=Q.a(c,Zg),e=Q.a(c,Wg),f=P.c(e,0,null),h=$c(e);return r(r(c)?e:c)?N(new W(null,2,5,X,[f,R.d(c,Zg,pc.a(d,b),J([Wg,h],0))],null),xc(a)):null}
function Ui(a){var b=P.c(a,0,null),c=P.c(a,1,null),c=Mc(c)?S.a(Tf,c):c,d=Q.a(c,Zg),e=Q.a(c,Wg);return r(r(c)?e:c)?N(new W(null,2,5,X,[oc(e),R.d(c,Zg,S.n(pc,d,b,hg(e)),J([Wg,null],0))],null),xc(a)):a}function Vi(a){var b=P.c(a,0,null),c=P.c(a,1,null),c=Mc(c)?S.a(Tf,c):c,d=Q.a(c,Zg),e=Q.a(c,Wg);return r(r(c)?E(d):c)?N(new W(null,2,5,X,[yc(d),R.d(c,Zg,zc(d),J([Wg,M(b,e)],0))],null),xc(a)):null}
function Wi(a,b){P.c(a,0,null);var c=P.c(a,1,null);return N(new W(null,2,5,X,[b,R.c(c,bh,!0)],null),xc(a))}var Xi=function(){function a(a,d,e){var f=null;2<arguments.length&&(f=J(Array.prototype.slice.call(arguments,2),0));return b.call(this,a,d,f)}function b(a,b,e){return Wi(a,S.c(b,Ni(a),e))}a.k=2;a.f=function(a){var d=F(a);a=I(a);var e=F(a);a=G(a);return b(d,e,a)};a.d=b;return a}();p("mori.zip.zipper",Mi);p("mori.zip.seq_zip",function(a){return Mi(Mc,Fd,function(a,c){return N(c,xc(a))},a)});p("mori.zip.vector_zip",function(a){return Mi(Hc,E,function(a,c){return N(we(c),xc(a))},a)});p("mori.zip.node",Ni);p("mori.zip.is_branch",{}.xc);p("mori.zip.children",Pi);p("mori.zip.make_node",Qi);p("mori.zip.path",function(a){return ah.b(a.b?a.b(1):a.call(null,1))});p("mori.zip.lefts",function(a){return E(Zg.b(a.b?a.b(1):a.call(null,1)))});
p("mori.zip.rights",function(a){return Wg.b(a.b?a.b(1):a.call(null,1))});p("mori.zip.down",Ri);p("mori.zip.up",Si);p("mori.zip.root",function(a){for(;;){if(Wb.a(eh,a.b?a.b(1):a.call(null,1)))return Ni(a);var b=Si(a);if(r(b))a=b;else return Ni(a)}});p("mori.zip.right",Ti);p("mori.zip.rightmost",Ui);p("mori.zip.left",Vi);
p("mori.zip.leftmost",function(a){var b=P.c(a,0,null),c=P.c(a,1,null),c=Mc(c)?S.a(Tf,c):c,d=Q.a(c,Zg),e=Q.a(c,Wg);return r(r(c)?E(d):c)?N(new W(null,2,5,X,[F(d),R.d(c,Zg,qe,J([Wg,td.d(G(d),new W(null,1,5,X,[b],null),J([e],0))],0))],null),xc(a)):a});p("mori.zip.insert_left",function(a,b){var c=P.c(a,0,null),d=P.c(a,1,null),d=Mc(d)?S.a(Tf,d):d,e=Q.a(d,Zg);if(null==d)throw"Insert at top";return N(new W(null,2,5,X,[c,R.d(d,Zg,pc.a(e,b),J([bh,!0],0))],null),xc(a))});
p("mori.zip.insert_right",function(a,b){var c=P.c(a,0,null),d=P.c(a,1,null),d=Mc(d)?S.a(Tf,d):d,e=Q.a(d,Wg);if(null==d)throw"Insert at top";return N(new W(null,2,5,X,[c,R.d(d,Wg,M(b,e),J([bh,!0],0))],null),xc(a))});p("mori.zip.replace",Wi);p("mori.zip.edit",Xi);p("mori.zip.insert_child",function(a,b){return Wi(a,Qi(a,Ni(a),M(b,Pi(a))))});p("mori.zip.append_child",function(a,b){return Wi(a,Qi(a,Ni(a),td.a(Pi(a),new W(null,1,5,X,[b],null))))});
p("mori.zip.next",function(a){if(Wb.a(eh,a.b?a.b(1):a.call(null,1)))return a;var b;b=Oi(a);b=r(b)?Ri(a):b;if(r(b))return b;b=Ti(a);if(r(b))return b;for(;;)if(r(Si(a))){b=Ti(Si(a));if(r(b))return b;a=Si(a)}else return new W(null,2,5,X,[Ni(a),eh],null)});p("mori.zip.prev",function(a){var b=Vi(a);if(r(b))for(a=b;;)if(b=Oi(a),b=r(b)?Ri(a):b,r(b))a=Ui(b);else return a;else return Si(a)});p("mori.zip.is_end",function(a){return Wb.a(eh,a.b?a.b(1):a.call(null,1))});
p("mori.zip.remove",function(a){P.c(a,0,null);var b=P.c(a,1,null),b=Mc(b)?S.a(Tf,b):b,c=Q.a(b,Zg),d=Q.a(b,Ug),e=Q.a(b,ah),f=Q.a(b,Wg);if(null==b)throw"Remove at top";if(0<O(c))for(a=N(new W(null,2,5,X,[yc(c),R.d(b,Zg,zc(c),J([bh,!0],0))],null),xc(a));;)if(b=Oi(a),b=r(b)?Ri(a):b,r(b))a=Ui(b);else return a;else return N(new W(null,2,5,X,[Qi(a,yc(e),f),r(d)?R.c(d,bh,!0):d],null),xc(a))});;return this.mori;}.call({});});

},{}],55:[function(require,module,exports){
(function (Buffer){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

}).call(this,require("buffer").Buffer)
},{"buffer":6,"crypto":12}],56:[function(require,module,exports){
var assert = require('assert'),
    Literal = require('./literal');

var Bool = function Bool(model, prop) {
  this._model = model;
  this._prop = prop;
};

Bool.prototype = Object.create(Literal.prototype);

Bool.isValidValue = Bool.prototype.isValidValue = function Bool$isValidValue(val) {
  return typeof val === 'boolean';
};

Bool.defaultValue = Bool.prototype.defaultValue = false;

Bool.prototype.negate = function Bool$negate() {
  this.val = !this.val;
};

Bool.prototype.eq = function Bool$eq(x) {
  return this.val === x;
};

Bool.prototype.ne = function Bool$ne(x) {
  return this.val !== x;
};

Object.defineProperties(Bool.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Bool(): must be a valid number');
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Bool;
},{"./literal":59,"assert":3}],57:[function(require,module,exports){
var Lazy = require('lazy.js'),
    mori = require('mori');

// transform(fn) ~= .map(fn).value()
Lazy.Sequence.prototype.transform = function Lazy$transform(fn) {
  return this.map(fn).value();
};

var Collection = function Collection(source, path, snapshot) {
  this._source = source;
  this._values = null;
  this._path = path;
  this._snapshot = snapshot;
};

Collection.prototype = Object.create(Lazy.ArrayLikeSequence.prototype);

Collection.prototype.length = function Collection$length() {
  return mori.count(this._source);
};

Collection.prototype.get = function Collection$get(i) {
  this._values = this._values || mori.vals(this._source);
  var attributes = mori.nth(this._values, i);
  return this._snapshot._from(this._path, attributes);
};

Collection.prototype.id = function Collection$id(id) {
  var attributes = mori.get(this._source, id);
  return this._snapshot._from(this._path, attributes);
};

module.exports = Collection;
},{"lazy.js":52,"mori":54}],58:[function(require,module,exports){
var assert = require('assert'),
    Literal = require('./literal');

var Decimal = function Decimal(model, prop) {
  this._model = model;
  this._prop = prop;
};

Decimal.prototype = Object.create(Literal.prototype);

Decimal.isValidValue = Decimal.prototype.isValidValue = function Decimal$isValidValue(val) {
  return typeof val === 'number';
};

Decimal.defaultValue = Decimal.prototype.defaultValue = 0;

Decimal.prototype.inc = function Decimal$inc() {
  this.val += 1;
};

Decimal.prototype.dec = function Decimal$dec() {
  this.val -= 1;
};

Decimal.prototype.add = function Decimal$add(x) {
  assert.ok(this.isValidValue(x));
  this.val += x;
};

Decimal.prototype.sub = function Decimal$sub(x) {
  assert.ok(this.isValidValue(x));
  this.val -= x;
};

Decimal.prototype.mult = function Decimal$mult(x) {
  assert.ok(this.isValidValue(x));
  this.val *= x;
};

Decimal.prototype.div = function Decimal$div(x) {
  assert.ok(this.isValidValue(x));
  this.val /= x;
};

Decimal.prototype.gt = function Decimal$gt(x) {
  assert.ok(this.isValidValue(x));
  return this.val > x;
};

Decimal.prototype.gte = function Decimal$gte(x) {
  assert.ok(this.isValidValue(x));
  return this.val >= x;
};

Decimal.prototype.lt = function Decimal$lt(x) {
  assert.ok(this.isValidValue(x));
  return this.val < x;
};

Decimal.prototype.lte = function Decimal$lte(x) {
  assert.ok(this.isValidValue(x));
  return this.val <= x;
};

Decimal.prototype.eq = function Decimal$eq(x) {
  assert.ok(this.isValidValue(x));
  return this.val === x;
};

Decimal.prototype.ne = function Decimal$ne(x) {
  assert.ok(this.isValidValue(x));
  return this.val !== x;
};

Decimal.prototype.isNaN = function Decimal$isNaN() {
  return isNaN(this.val);
};

Decimal.prototype.update = function Decimal$update(fn) {
  assert.equal(typeof fn, 'function', 'Decimal(): update must be a function');
  this.val = fn(this.val);
};

Object.defineProperties(Decimal.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Decimal(): must be a valid number');
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Decimal;
},{"./literal":59,"assert":3}],59:[function(require,module,exports){
var assert = require('assert');

var Literal = function Literal(model, prop) {
  this._model = model;
  this._prop = prop;
};

Literal.isValidValue = Literal.prototype.isValidValue = function Literal$isValidValue(val) {
  return true;
};

Literal.defaultValue = Literal.prototype.defaultValue = null;

Literal.prototype.handleChange = function Literal$handleChange() {
  return this._handleChange || (this._handleChange = function(event) {
    this.val = event.target.value;
  }.bind(this));
};

Object.defineProperties(Literal.prototype, {
  val: {
    get: function() {
      return this._model._map[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      this._model._set(this._prop, val);
    }
  }
});

module.exports = Literal;
},{"assert":3}],60:[function(require,module,exports){
(function (process){
var _ = require('lodash'),
    assert = require('assert'),
    Bool = require('./bool'),
    Decimal = require('./decimal'),
    Str = require('./str');

var ModelBase = function Model(attributes) {
  var key,
      map = {},
      properties = this._properties;

  if (process.env.NODE_ENV !== 'production') {
    assert.ok(!attributes || _.isPlainObject(attributes), 'Model(): attributes is an optional object');
  }
  attributes = attributes || {};
  for (key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }
    if (typeof attributes[key] !== 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        assert.ok(properties[key].isValidValue(attributes[key]), 'Model(): invalid value for property ' + key);
      }
      map[key] = attributes[key];
    } else {
      map[key] = properties[key].defaultValue;
    }
  }

  this._props = {};
  this._source = map;
  this.cid = this.id || _.uniqueId(this._path);
};

ModelBase.prototype._set = function Model$private$set(key, value) {
  var clone = _.clone(this._source);
  clone[key] = value;
  this._source = clone;
};

ModelBase.prototype.set = function Model$set(map) {
  var clone = _.clone(this._source);
  for (key in map) {
    if (this._properties.hasOwnProperty(key)) {
      if (typeof map[key] !== 'undefined') {
        if (process.env.NODE_ENV !== 'production') {
          assert.ok(this._properties[key].isValidValue(map[key]), 'Model(): invalid value for property ' + key);
        }
        clone[key] = map[key];
      } else {
        clone[key] = this._properties[key].defaultValue;
      }
    }
  }
  this._source = clone;
};

ModelBase.prototype.clone = function Model$clone() {
  var clone = Object.create(this.constructor.prototype);
  clone._source = this._source;
  clone._props = {};
  clone.cid = this.cid;
  return clone;
};

ModelBase.prototype.destroy = function Model$destroy() {
  this._destroy = true;
};

ModelBase.prototype.val = function Model$val(key) {
  if (typeof key !== 'undefined') {
    return this._source[key];
  }
  return this._source;
};

ModelBase.prototype.raw = function Model$raw() {
  return this._source;
};

ModelBase.prototype.observe = function Model$observe(fn) {
  // circular dependency
  makeObservable = require('./observable_model');
  makeObservable(this);
  this.observe(fn);
};

ModelBase.define = function Model$$define(properties, path) {
  var klass = function Model(map, path) {
    ModelBase.call(this, map, path);
  }
  klass.prototype = Object.create(ModelBase.prototype);
  klass.prototype.constructor = klass;
  klass.prototype._properties = properties;
  klass.prototype._path = path;

  // quickly create a model w/o parsing attributes
  klass.from = function Model$from(attributes) {
    var model = new klass({});
    model._source = attributes;
    return model;
  };

  // define 'id' prop and getter/setter
  properties.id = Str;
  Object.defineProperty(klass.prototype, 'id', {
    get: function() {
      return this._source.id;
    },
    set: function(id) {
      this._set('id', id);
    },
    enumerable: true,
    configurable: false
  });

  // getters for all other props
  _.each(properties, function(prop, key, properties) {
    if (key === 'id') return;
    Object.defineProperty(klass.prototype, key, {
      get: function() {
        return this._props[key] || (this._props[key] = new (properties[key])(this, key));
      },
      enumerable: true,
      configurable: false
    });
  });

  return klass;
};

ModelBase.Bool = Bool;
ModelBase.Decimal = Decimal;
ModelBase.Str = Str;

module.exports = ModelBase;
}).call(this,require('_process'))
},{"./bool":56,"./decimal":58,"./observable_model":61,"./str":64,"_process":30,"assert":3,"lodash":53}],61:[function(require,module,exports){
(function (process){
var _ = require('lodash'),
    assert = require('assert'),
    Model = require('./model'),
    modelSetKey = Model.prototype._set,
    modelSetAll = Model.prototype.set;

var ObservableModelProps = {
  _set: function() {
    modelSetKey.apply(this, arguments);
    this._notify();
  },

  set: function() {
    modelSetAll.apply(this, arguments);
    this._notify();
  },

  observe: function ObservableModel$observe(fn) {
    if (process.env.NODE_ENV !== 'production') {
      assert.equal(typeof fn, 'function', 'Model(): observer must be a function');
    }
    this._listeners.push(fn);
  },

  unobserve: function ObservableModel$unobserve(fn) {
    this._listeners = this._listeners.filter(function(observer) {
      return observer !== fn;
    });
  },

  _notify: function ObservableModel$private$notify() {
    for (var ix = 0; ix < this._listeners.length; ix++) {
      this._listeners[ix]();
    }
  }
};

module.exports = function ObservableModel$$makeObservable(model) {
  assert.ok(model instanceof Model);
  if (model._listeners) {
    return;
  }
  model._listeners = [];
  _.extend(model, ObservableModelProps);
};
}).call(this,require('_process'))
},{"./model":60,"_process":30,"assert":3,"lodash":53}],62:[function(require,module,exports){
var Model = require('./model'),
    Collection = require('./collection'),
    mori = require('mori');

var Snapshot = function Snapshot(source, models) {
  this._source = source;
  this._collections = {};
  this._models = models;
};

Snapshot.prototype.get = function Snapshot$get(modelName, id) {
  var model;

  // load a model's value in the current snapshot
  if (modelName instanceof Model) {
    return this.get(modelName._path, modelName.id);
  }

  // find a model by id
  if (typeof id !== 'undefined') {
    model = this.get(modelName).id(id).clone();
    model._snapshot = this;
    return model;
  }

  // otherwise get the full collection
  if (!(modelName in this._collections)) {
    this._collections[modelName] = new Collection(mori.get(this._source, modelName), modelName, this);
  }
  return this._collections[modelName];
};

Snapshot.prototype._from = function Snapshot$_from(modelName, attributes) {
  return this._models[modelName].from(attributes);
};

module.exports = Snapshot;
},{"./collection":57,"./model":60,"mori":54}],63:[function(require,module,exports){
(function (process){
var _ = require('lodash'),
    assert = require('assert'),
    uuid = require('node-uuid'),
    mori = require('mori'),
    Literal = require('./literal'),
    Model = require('./model'),
    Collection = require('./collection'),
    Snapshot = require('./snapshot');

var Store = function Store(definition) {
  if (process.env.NODE_ENV !== 'production') {
    assert.ok(_.isPlainObject(definition) && !_.isEmpty(definition), 'Store(): definition must be an object of modelName:string -> modelProps:object');
    _.each(definition, function(model, key) {
      assert.ok(_.isPlainObject(model), 'Store(): each prop must be an object of propName:string -> propType:constructor (eg Model.Str) ' + key);
      _.each(model, function(type, prop) {
        assert.ok(type === Literal || type.prototype instanceof Literal, 'Store(): each prop must be a Literal/Decimal/Str/Bool etc ' + prop);
      })
    });
  }

  var store = mori.hash_map(),
      models = {},
      modelName;

  for (modelName in definition) {
    if (definition.hasOwnProperty(modelName)) {
      models[modelName] = Model.define(definition[modelName], modelName);
      store = mori.assoc(store, modelName, mori.hash_map());
    }
  }
  this._listeners = [];
  this._models = models;
  this._source = store;
  this._snapshot = new Snapshot(this._source, this._models);
};

Store.prototype.is = Store.is = function Store$is(a, b) {
  return a === b || a._source === b._source;
};

Store.prototype.snapshot = function Store$snapshot() {
  return this._snapshot;
};

Store.prototype.get = function Store$get(modelName, id) {
  return this._snapshot.get(modelName, id);
};

Store.prototype.create = function Store$create(model, attributes) {
  if (process.env.NODE_ENV !== 'production') {
    assert.ok(model in this._models, 'Store(): model not defined ' + model);
    assert.ok(!attributes || _.isPlainObject(attributes), 'Store(): attributes is an optional object');
  }
  return new this._models[model](attributes);
};

Store.prototype.observe = function Store$observe(fn) {
  if (process.env.NODE_ENV === 'production') {
    assert.equal(typeof fn, 'function', 'Store(): observer must be a function');
  }
  this._listeners.push(fn);
};

Store.prototype.unobserve = function Store$unobserve(fn) {
 this._listeners = this._listeners.filter(function(observer) {
    return observer !== fn;
  }); 
};

Store.prototype.restoreSnapshot = function Store$restoreSnapshot(snapshot) {
  assert.ok(snapshot instanceof Snapshot, 'Store(): can only restore from a snapshot()');
  this._source = snapshot._source;
  this._notify();
};

Store.prototype.commit = function Store$commit(_args) {
  var args = _.isArray(_args) ? _args : arguments,
      source = this._source,
      collection,
      modelName,
      model,
      id,
      index,
      length;
  length = args.length;
  for (index = 0; index < length; index++) {
    model = args[index];
    modelName = model._path;
    collection = mori.get(source, modelName);
    if (model._destroy) {
      collection = mori.dissoc(collection, model.id);
    } else if (model.id) {
      collection = mori.assoc(collection, model.id, model.raw());
    } else {
      model.id = uuid.v4();
      collection = mori.assoc(collection, model.id, model.raw());
    }
    source = mori.assoc(source, modelName, collection);
  }
  this._source = source;
  this._snapshot = new Snapshot(this._source, this._models);
  this._notify();
};

Store.prototype._notify = function Store$private$notify() {
  var length = this._listeners.length;
  for (var ix = 0; ix < length; ix++) {
    this._listeners[ix]();
  }
};

module.exports = Store;
}).call(this,require('_process'))
},{"./collection":57,"./literal":59,"./model":60,"./snapshot":62,"_process":30,"assert":3,"lodash":53,"mori":54,"node-uuid":55}],64:[function(require,module,exports){
var assert = require('assert'),
    Literal = require('./literal');

var Str = function Str(model, prop) {
  this._model = model;
  this._prop = prop;
};

Str.prototype = Object.create(Literal.prototype);

Str.isValidValue = Str.prototype.isValidValue = function Str$isValidValue(val) {
  return typeof val === 'string';
};

Str.defaultValue = Str.prototype.defaultValue = '';

Str.prototype.prepend = function Str$prepend(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  this.val = x + this.val;
};

Str.prototype.append = function Str$append(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  this.val = this.val + x;
};

Str.prototype.wrap = function Str$wrap(x, y) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  assert.ok(this.isValidValue(y), 'Str(): argument must be string');
  this.val = x + this.val + y;
};

Str.prototype.gt = function Str$gt(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  return this.val > x;
};

Str.prototype.gte = function Str$gte(x) {
  return this.val >= x;
};

Str.prototype.lt = function Str$lt(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  return this.val < x;
};

Str.prototype.lte = function Str$lte(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  return this.val <= x;
};

Str.prototype.eq = function Str$eq(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  return this.val === x;
};

Str.prototype.ne = function Str$ne(x) {
  assert.ok(this.isValidValue(x), 'Str(): argument must be string');
  return this.val !== x;
};

Str.prototype.update = function Str$update(fn) {
  assert.equal(typeof fn, 'function', 'Str(): update must be a function');
  this.val = fn(this.val);
};

Object.defineProperties(Str.prototype, {
  val: {
    get: function() {
      return this._model._source[this._prop];
    },
    set: function(val) {
      if (typeof val === 'undefined') {
        return this._model._set(this._prop, this.defaultValue);
      }
      assert.ok(this.isValidValue(val), 'Str(): must be a valid number');
      this._model._set(this._prop, val);
    }
  },
  length: {
    get: function() {
      return this._model._source[this._prop].length;
    }
  }
});

module.exports = Str;
},{"./literal":59,"assert":3}]},{},[1])(1)
});
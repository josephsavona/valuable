exports.isArray = function isArray(a) {
  return a.constructor === Array;
};

exports.isPlainObject = function isPlainObject(o) {
  return o.constructor === Object;
};

exports.clone = function clone(o) {
  var clone = {};
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      clone[key] = o[key];
    }
  }
  return clone;
};

var _uniqueIdOffset = 0;
exports.uniqueId = function uniqueId(prefix) {
  return (prefix || '') + _uniqueIdOffset++;
};

exports.extend = function extend(target, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      target[key] = src[key];
    }
  }
};

exports.each = function each(o, fn) {
  if (this.isArray(o)) {
    for (var ix = 0; ix < o.length; ix++) {
      fn(o[ix], ix, o);
    }
    return;
  }
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      fn(o[key], key, o);
    }
  }
};

exports.invariant = function assert(invariant, message) {
  if (!invariant) {
    throw new Error(message || 'Unlabeled invariant() failed');
  }
}
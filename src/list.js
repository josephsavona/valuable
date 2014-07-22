var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable'),
    inherits = require('./inherits');

var List = function List(list) {
  var ix, value;
  
  List.assertValidValue(list);
  if (!(this instanceof List)) {
    return new List(list);
  }
  Value.apply(this);
  this._list = [];
  this._raw = [];
  if (!list || !list.length) {
    return;
  }
  for (ix = 0; ix < list.length; ix++) {
    value = Valueable(list[ix]);
    this._list[ix] = value;
    this._list[ix]._parent = this;
    this._raw[ix] = value.val();
  }
};

List.prototype = new Value();

List.assertValidValue = List.prototype.assertValidValue = function List$assertValidValue(input) {
  assert.ok(input === null || typeof input === 'undefined' || _.isArray(input),
    'List(): value must be an array (or null/undefined)');
};

List.prototype.type = Valueable;

List.prototype.push = function List$push(rawValue) {
  assert.ok(typeof rawValue !== 'undefined', 'List(): value must be defined');

  var value = this.type(rawValue);
  value._parent = this;
  this._list.push(value);
  this._updateChild(value, value.val());
};

List.prototype.pop = function List$pop() {
  var value = this._list.pop(),
      raw = _.clone(this._raw),
      rawValue;
  if (!value) {
    return value;
  }
  value.destroy(); 
  rawValue = raw.pop();
  this._raw = raw;
  this._notify();
  return rawValue;
};

List.prototype.unshift = function List$unshift(rawValue) {
  assert.ok(typeof rawValue !== 'undefined', 'List(): value must be defined');
  
  var value = this.type(rawValue);
  value._parent = this;
  this._list.unshift(value);
  this._updateChild(value, value.val());
};

List.prototype.shift = function List$shift() {
  var value = this._list.shift(),
      raw = _.clone(this._raw),
      rawValue;
  if (!value) {
    return value;
  }
  value.destroy();
  rawValue = raw.shift();
  this._raw = raw;
  this._notify();
  return rawValue;
};

List.prototype.get = function List$get(ix) {
  assert.ok(typeof ix === 'number' && ix >= 0, 'List(): index must be undefined or a positive integer');
  return this._list[ix];
};

List.prototype.set = function List$set(ix, rawValue) {
  assert.ok(typeof ix === 'number' && ix >= 0, 'List(): index must be undefined or a positive integer');
  assert.ok(typeof rawValue !== 'undefined', 'List(): value must be defined');

  if (ix in this._list) {
    this._list[ix].destroy();
    this._list[ix] = void 0;
  }
  var value = this.type(rawValue);
  this._list[ix] = value;
  this._list[ix]._parent = this;
  this._updateChild(value, value.val());
};

List.prototype.setVal = function List$setVal(map) {
  assert.ok(false, 'List(): setVal() not implemented');
};

List.prototype.val = function List$val(ix) {
  assert.ok(ix === undefined || (typeof ix === 'number' && ix >= 0), 'List(): index must be undefined or a positive integer');

  var raw;
  if (typeof ix !== 'undefined') {
    raw = this._raw[ix];
  } else {
    raw = this._raw;
  }

  if (process.env.NODE_ENV !== 'production') {
    // return a clone in dev/test to ensure that you
    // cannot make your code work by directly modifying
    // the returned value. in production disable
    // this for speed
    return _.clone(raw);
  }
  return raw;
};

List.prototype.each = function List$each(fn) {
  assert.equal(typeof fn, 'function', 'List(): must provide function');
  return this._list.forEach(fn);
};

List.prototype.map = function List$map(fn) {
  assert.equal(typeof fn, 'function', 'List(): must provide function');
  return this._list.map(fn);
};

List.prototype._updateChild = function List$private$updateChild(child, rawValue) {
  var ix, found, raw;
  // figure out which index this child is
  for (ix = 0; ix < this._list.length; ix++) {
    if (this._list[ix] === child) {
      found = true;
      break;
    }
  }
  assert.ok(found, 'List(): child value not found');
  raw = _.clone(this._raw);
  raw[ix] = rawValue;
  this._raw = raw;
  this._notify();
};

List.of = function List$$typed(klass) {
  assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Valueable),
    'List(): of() requires a subclass of Value as the type');

  proto = proto || {};
  proto.type = klass;
  return inherits(List, function TypedList(){}, proto, statics);
};

module.exports = List;
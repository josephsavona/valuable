var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable');

var List = function List(list) {
  assert.ok(list === null || typeof list === 'undefined' || _.isArray(list), 'List(): value must be an array (or null/undefined)');

  var ix, value;
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
    value = (list[ix] instanceof Value) ? list[ix] : Valueable(list[ix]);
    this._list[ix] = value;
    this._list[ix]._parent = this;
    this._raw[ix] = value.val();
  }
};

List.prototype = new Value();

List.prototype.val = function List$val(ix) {
  assert.ok(ix === undefined || (typeof ix === 'number' && ix >= 0), 'List(): key must be undefined or a positive integer');

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

List.prototype._updateChild = function List$private$updateChild(child, rawValue) {
  var ix, found, raw;
  // figure out which key this child is
  for (ix = 0; ix < this._list.length; ix++) {
    if (this._list[ix] === child) {
      found = true;
      break;
    }
  }
  assert.ok(found, 'List(): child value not found');
  raw = _.clone(this._raw);
  raw[ix] = rawValue;
  Value.prototype.set.call(this, raw);
};

module.exports = List;
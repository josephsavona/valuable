var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable'),
    inherits = require('./inherits');

var List = function List(list) {
  var ix, value;
  
  assert.ok(this.type && (this.type.prototype instanceof Value || this.type === Value || this.type === Valueable),
    'List(): must provide prototype.type (use `List.of(ValueSubClas)`');
  
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
}

var ListProto = {
  assertValidValue: function List$assertValidValue(input) {
    assert.ok(input === null || typeof input === 'undefined' || _.isArray(input),
    'List(): value must be an array (or null/undefined)');
  },

  type: Valueable,

  push: function List$push(rawValue) {
    assert.ok(typeof rawValue !== 'undefined', 'List(): value must be defined');

    var value = this.type(rawValue);
    value._parent = this;
    this._list.push(value);
    this._updateChild(value, value.val());
  },

  pop: function List$pop() {
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
  },

  unshift: function List$unshift(rawValue) {
    assert.ok(typeof rawValue !== 'undefined', 'List(): value must be defined');
    
    var value = this.type(rawValue);
    value._parent = this;
    this._list.unshift(value);
    this._updateChild(value, value.val());
  },

  shift: function List$shift() {
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
  },

  get: function List$get(ix) {
    assert.ok(typeof ix === 'number' && ix >= 0, 'List(): index must be undefined or a positive integer');
    return this._list[ix];
  },

  set: function List$set(ix, rawValue) {
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
  },

  setVal: function List$setVal(map) {
    assert.ok(false, 'List(): setVal() not implemented');
  },

  val: function List$val(ix) {
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
  },

  each: function List$each(fn) {
    assert.equal(typeof fn, 'function', 'List(): must provide function');
    return this._list.forEach(fn);
  },

  map: function List$map(fn) {
    assert.equal(typeof fn, 'function', 'List(): must provide function');
    return this._list.map(fn);
  },

  _updateChild: function List$private$updateChild(child, rawValue) {
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
  }
};

var ListStatics = {
  of: function List$$of(klass) {
    assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Valueable),
      'List(): of() requires a subclass of Value as the type');

    var proto = _.extend({type: klass}, ListProto);
    return inherits(List, function TypedList(){}, proto, ListStatics);
  }
};

module.exports = inherits(Value, List, ListProto, ListStatics);
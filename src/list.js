var assert = require('assert'),
    _ = require('lodash'),
    Value = require('./value'),
    Valueable = require('./valueable'),
    inherits = require('./inherits');

var ListConstructor = function List(list) {
  var ix, value;
  
  assert.ok(this.type && (this.type.prototype instanceof Value || this.type === Value || this.type === Valueable),
    'List(): must provide prototype.type (use `List.of(ValueSubClas)`');

  Value.call(this, list);
  
  this._list = [];
  this._raw = [];
  if (!list || !list.length) {
    return;
  }
  for (ix = 0; ix < list.length; ix++) {
    value = this.type(list[ix]);
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

  at: function List$at(ix) {
    assert.ok(typeof ix === 'number' && ix >= 0, 'List(): index must be undefined or a positive integer');
    return this._list[ix];
  },

  get: function List$get(ix) {
    console.warn('List$get(): deprecated: please use List$at() instead');
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

  setVal: function List$setVal(list) {
    var ix = 0,
        rawValue = (list instanceof Value) ? list.val() : list;
    this.assertValidValue(rawValue);
    for (ix = 0; ix < this._list.length; ix++) {
      this._list[ix].destroy();
    }
    this._list = [];
    this._raw = [];
    for (ix = 0; ix < rawValue.length; ix++) {
      this._list[ix] = this.type(rawValue[ix]);
      this._list[ix]._parent = this;
      this._raw[ix] = this._list[ix].val();
    }
    this._notify();
  },

  val: function List$val(ix) {
    assert.ok(ix === undefined || (typeof ix === 'number' && ix >= 0), 'List(): index must be undefined or a positive integer');

    var raw;
    if (typeof ix !== 'undefined') {
      raw = this._raw[ix];
    } else {
      raw = this._raw;
    }

    // if (process.env.NODE_ENV !== 'production') {
    //   // return a clone in dev/test to ensure that you
    //   // cannot make your code work by directly modifying
    //   // the returned value. in production disable
    //   // this for speed
    //   return _.clone(raw);
    // }
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
    var ix, length, raw;
    length = this._list.length;
    raw = Array(length);
    for (ix = 0; ix < length; ix++) {
      raw[ix] = this._list[ix] === child ? rawValue : this._raw[ix];
    }
    this._raw = raw;
    this._notify();
  }
};

var List = inherits(Value, ListConstructor, ListProto, {});

List.assertValidType = function List$$assertValidType(klass) {
  assert.ok(typeof klass === 'function' && (klass.prototype instanceof Value || klass === Value || klass === Valueable),
    'List(): requires a subclass of Value as the type');
};

List.of = function List$$of(klass) {
  List.assertValidType(klass);
  var proto = {type: klass};
  return inherits(List, function MyList(value) {
    List.call(this, value);
  }, proto);
};

List.inherits = function List$$inherits(klass, proto, statics) {
  List.assertValidType(klass);
  assert.ok(!proto || _.isPlainObject(proto),
    'List(): proto is an optional object');
  assert.ok(!statics || _.isPlainObject(statics),
    'List(): statics is an optional object');

  proto = proto || {};
  statics = statics || {};
  proto.type = klass;

  return inherits(List, function MyList(value){
    List.call(this, value);
  }, proto, statics);
};

module.exports = List;

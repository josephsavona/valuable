var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../store/model'),
    Store = require('../store/store');

describe('Model', function() {
  var properties, sample, emptySample;
  beforeEach(function() {
    properties = {
      decimal: Model.Decimal,
      str: Model.Str,
      bool: Model.Bool
    };
    sample = {
      decimal: 98.6,
      str: 'hi',
      bool: true,
      id: ''
    };
    emptySample = {
      decimal: 0,
      bool: false,
      str: '',
      id: ''
    };
    MyModel = Model.define(properties);
  });

  it('can create an empty model', function() {
    var m = new MyModel();
    assert.deepEqual(m.val(), emptySample);
  });

  it('can create a model with any one field', function() {
    for (key in sample) {
      if (sample.hasOwnProperty(key)) {
        var d = _.clone(emptySample);
        d[key] = sample[key];
        m = new MyModel(d);
        assert.deepEqual(m.val(), d);
      }
    }
  });

  it('identifies equal models', function() {
    var a = new MyModel(),
        b = a.clone(),
        c = new MyModel();
    c.set('bool', true);
    assert.ok(Store.is(a,b));
    assert.notOk(Store.is(a,c));
  });

  it('can create a model with all fields', function() {
    var m = new MyModel(sample);
    assert.deepEqual(m.val(), sample);
  });

  it('can clone a model', function() {
    var m = new MyModel(sample),
        m2 = m.clone();
    assert.deepEqual(m2.val(), sample);
  });

  it('can update a decimal with inc()', function() {
    var m = new MyModel(),
        raw = m.raw();
    assert.deepEqual(m.decimal.val, 0);
    m.decimal.inc();
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.decimal.val, 1);
  });

  it('can update a decimal via handleChange()', function() {
    var m = new MyModel();
    m.decimal.handleChange()({target: {value: 1}});
    assert.deepEqual(m.decimal.val, 1);
  });

  it('can update a string with append()', function() {
    var m = new MyModel(),
        raw = m.raw();
    assert.deepEqual(m.str.val, '');
    m.str.append('test');
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.str.val, 'test');
  });

  it('can update a string via handleChange()', function() {
    var m = new MyModel();
    m.str.handleChange()({target: {value: 'hello'}});
    assert.deepEqual(m.str.val, 'hello');
  });

  it('can update a boolean with negate()', function() {
    var m = new MyModel(),
        raw = m.raw();
    assert.deepEqual(m.bool.val, false);
    m.bool.negate();
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.bool.val, true);
  });

  it('can update a boolean via handleChange()', function() {
    var m = new MyModel();
    m.bool.handleChange()({target: {value: true}});
    assert.deepEqual(m.bool.val, true);
  });
});
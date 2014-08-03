var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../store/model');

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
      bool: true
    };
    emptySample = {
      decimal: 0,
      bool: false,
      str: ''
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

  it('can create a model with all fields', function() {
    var m = new MyModel(sample);
    assert.deepEqual(m.val(), sample);
  });

  it('can clone a model', function() {
    var m = new MyModel(sample),
        m2 = m.clone();
    assert.deepEqual(m2.val(), sample);
  });

  it('cannot edit a default model', function() {
    var m = new MyModel({});
    assert.throws(function() {
      m.str.val = 'fail!';
    });
  });

  it('can edit an editable model', function() {
    var m = new MyModel({}).forEdit();
    assert.doesNotThrow(function() {
      m.str.val = 'success';
    });
    assert.equal(m.val().str, 'success');
  });

  it('can update a decimal', function() {
    var m = new MyModel().forEdit(),
        raw = m.raw();
    assert.deepEqual(m.decimal.val, 0);
    m.decimal.inc();
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.decimal.val, 1);
  });

  it('can update a string', function() {
    var m = new MyModel().forEdit(),
        raw = m.raw();
    assert.deepEqual(m.str.val, '');
    m.str.append('test');
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.str.val, 'test');
  });

  it('can negate a boolean', function() {
    var m = new MyModel().forEdit(),
        raw = m.raw();
    assert.deepEqual(m.bool.val, false);
    m.bool.negate();
    assert.notEqual(m.raw(), raw);
    assert.deepEqual(m.bool.val, true);
  });
});
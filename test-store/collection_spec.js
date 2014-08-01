var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../store/model'),
    Collection = require('../store/collection');

describe('Model', function() {
  var properties, sample, emptySample, MyModel, MyCollection;
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
    MyCollection = Collection.define(MyModel);
  });

  it('can create an empty collection', function() {
    var c = new MyCollection();
    assert.deepEqual(c.val(), []);
  });

  it('can create a collection with an empty model', function() {
    var c = new MyCollection([{}]);
    assert.deepEqual(c.get(0).val(), emptySample);
    // assert.deepEqual(c.val(), [emptySample]);
  });

  it('can create a collection with a model with all fields', function() {
    var c = new MyCollection([sample]);
    assert.deepEqual(c.get(0).val(), sample);
  });
});
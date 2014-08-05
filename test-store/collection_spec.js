var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Immutable = require('immutable'),
    Model = require('../store/model'),
    Collection = require('../store/collection'),
    Store = require('../store/store');

describe('Collection', function() {
  var properties, sample, emptySample, items, snapshot, MyModel, MyCollection;
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
    items = Immutable.Vector.from([
      new MyModel(sample),
      new MyModel(emptySample)
    ]);
    snapshot = {};
  });

  it('can create an empty collection', function() {
    var collection = new Collection(items, 'my_model', snapshot),
        models = collection.map(function(m) { return m.val() }).toArray();
    assert.equal(models.length, 2);
    assert.deepEqual(models[0], sample);
    assert.deepEqual(models[1], emptySample);
  });

  it('identifies equal collections', function() {
    var a = new Collection(items, 'a', snapshot),
        b = new Collection(items, 'b', snapshot),
        c = new Collection(Immutable.Vector.from([], 'c', snapshot));
    assert.ok(Store.is(a,b));
    assert.notOk(Store.is(a,c));
  });

  it('can filter a collection', function() {
    var collection = new Collection(items, 'my_model', snapshot),
        models;
    models = collection.filter(function(m) { return m.str.val === sample.str })
      .map(function(m) { return m.val() })
      .toArray();
    assert.equal(models.length, 1);
    assert.deepEqual(models[0], sample);
  });

  it('can create a chained filter of a collection', function() {
    var collection = new Collection(items, 'my_model', snapshot),
        models;
    models = collection
      .filter(function(m) { return m.str.val === sample.str })
      .filter(function(m) { return m.bool.val === sample.bool })
      .map(function(m) { return m.val() })
      .toArray();
    assert.equal(models.length, 1);
    assert.deepEqual(models[0], sample);
  });
});
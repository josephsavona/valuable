var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Immutable = require('immutable'),
    helpers = require('./helpers'),
    Model = require('../src/model'),
    Collection = require('../src/collection'),
    Snapshot = require('../src/snapshot'),
    Store = require('../src/store');

describe('Collection', function() {
  helpers.init();
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
    items = Immutable.OrderedMap({
      "1": sample,
      "2": emptySample
    })
    snapshot = new Snapshot({}, {
      my_model: MyModel
    });
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
        c = new Collection(Immutable.Map(), 'c', snapshot);
    assert.ok(Store.is(a,b));
    assert.notOk(Store.is(a,c));
  });

  it('can get the nth item from a collection', function() {
    var items = Immutable.Map(),
        count = 1,
        collection,
        model;
    for (var ix = 0; ix < count; ix++) {
      model = new MyModel({decimal: ix});
      items = items.set(ix, model.raw());
    }
    collection = new Collection(items, 'my_model', snapshot);

    for (ix = 0; ix < count; ix++) {
      assert.ok(collection.get(ix) instanceof MyModel);
      assert.equal(collection.get(ix).decimal.val, ix);
    }
  });

  it('can filter a collection', function() {
    var collection = new Collection(items, 'my_model', snapshot),
        models;
    models = collection
      .filter(function(m) { return m.str.val === sample.str })
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
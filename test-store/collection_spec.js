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

  it('can filter a collection', function() {
    var items = [];
    for (var ix = 0; ix < 100; ix++) {
      items.push({
        decimal: ix,
        bool: ix % 2 === 0,
        str: 'name' + ix
      });
    }
    var c = new MyCollection(items);
    var item35 = c.get(35);
    var results = c.query(function(items) {
      return items.filter(function(item) {
        return item.decimal.val === 35;
      });
    });
    assert.equal(results.get(0).raw(), item35.raw());
    assert.equal(results.get(0).decimal.val, 35);
    assert.equal(c.length, 100);
  });

  it('can create a chained filter of a collection', function() {
    var items = [];
    for (var ix = 0; ix < 100; ix++) {
      items.push({
        decimal: ix,
        bool: ix % 2 === 0,
        str: 'name' + ix
      });
    }
    var c = new MyCollection(items);
    var results = c.query(function(items) {
      return items.filter(function(item) {
        return item.decimal.val > 35 && item.decimal.val <= 50;
      })
      .filter(function(item) {
        return item.bool.val; // true if even
      })
      .first()
    });
    assert.equal(results.length, 1);
    assert.equal(results.get(0).decimal.val, 36);
  });
});
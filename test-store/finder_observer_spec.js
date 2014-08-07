var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Store = require('../store/store'),
    Model = require('../store/model'),
    Collection = require('../store/collection'),
    rawValues = require('../test/mock_values');

function makeFinder(app) {
  app.finder('usersByName', {
    query: Model.Str
  }, function(snapshot, query) {
    return snapshot.get('users').filter(function(user) {
      return user.val('name') === query.val('query');
    });
  });
};

describe('Store() finder/observer', function() {
  var app, sample, emptySample;
  beforeEach(function() {
    app = new Store({
      users: {
        age: Model.Decimal,
        name: Model.Str,
        isDev: Model.Bool
      }
    });
    samples = [{
      age: 21,
      name: 'Dev',
      isDev: true
    }, {
      age: 25,
      name: 'Person',
      isDev: false
    }].map(function(item) {
      return app.create('users', item);
    });
    app.commit(samples);
  });

  it('can define finder()s', function() {
    assert.doesNotThrow(function() {
      makeFinder(app);
    });
  });

  it('can get results from a finder with observe()', function() {
    makeFinder(app);
    app.observe('usersByName', {query: 'Dev'}, function(results, params) {
      results = results.toArray();
      assert.equal(params.val('query'), 'Dev', 'query value matches passed values');
      assert.equal(results.length, 1, 'one matching result');
      assert.equal(results[0].val('name'), 'Dev', 'results match query params');
    });
  });
}); 
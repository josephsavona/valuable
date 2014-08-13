var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    helpers = require('./helpers'),
    Store = require('../src/store'),
    Finder = require('../src/finder'),
    Model = require('../src/model'),
    Collection = require('../src/collection'),
    rawValues = require('./mock_values');

function makeFinder(finder) {
  finder.finder('usersByName', {
    query: Model.Str
  }, function(snapshot, query) {
    return snapshot.get('users').filter(function(user) {
      return user.val('name') === query.val('query');
    });
  });
};

describe('Store() finder/observer', function() {
  helpers.init();
  var app, finder, sample, emptySample;
  beforeEach(function() {
    app = new Store({
      users: {
        age: Model.Decimal,
        name: Model.Str,
        isDev: Model.Bool
      }
    });
    finder = new Finder(app);
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
      makeFinder(finder);
    });
  });

  it('can get results from a finder with observe()', function() {
    makeFinder(finder);
    var expectedMatchCount = 1;
    var params;
    var observer = sinon.spy(function(results, _params) {
      results = results.toArray();
      params = _params;
      assert.equal(results.length, expectedMatchCount, 'result count is expected amount');
      results.forEach(function(result) {
        assert.equal(results[0].val('name'), params.query.val, 'results match query params');
      });
    });
    var unobserve = finder.observe('usersByName', observer, {query: 'Dev'});
    assert.equal(observer.callCount, 1, 'observer called once initially');

    expectedMatchCount = 2;
    app.commit(app.create('users', {
      age: 50,
      name: 'Dev',
      isDev: true
    }));
    assert.equal(observer.callCount, 2, 'observer called after every commit');

    expectedMatchCount = 1;
    params.query.val = 'Person';
    assert.equal(observer.callCount, 3, 'observer called when query cahnges');
  });
}); 
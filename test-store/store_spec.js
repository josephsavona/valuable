var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Store = require('../store/store'),
    Model = require('../store/model'),
    Collection = require('../store/collection'),
    rawValues = require('../test/mock_values');

describe('Store() constructor', function() {
  it('cannot create a store with an invalid definition', function() {
    rawValues.forEach(function(val) {
      assert.throws(function() {
        new Store(val);
      });
    });
  });

  it('can create a store', function() {
    assert.doesNotThrow(function() {
      var app = new Store({
        user: {
          name: Model.Str,
          age: Model.Decimal
        }
      });
    }, 'can create a store');
  });
});

describe('Store() can add an item', function() {
  var app;
  beforeEach(function() {
    app = new Store({
      users: {
        name: Model.Str,
        age: Model.Decimal
      }
    });
  });

  it('can execute a view over the data', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var users = app.users;
    var user = users.factory(dude);
    users.add(user);
    app.commit(users);
    assert.equal(app.users.length, 1);
  });
});
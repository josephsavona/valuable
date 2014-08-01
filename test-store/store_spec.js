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

  it('can add/remove items to/from the store via commit()', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var users = app.users;
    var user = users.factory(dude);
    users.add(user);
    app.commit(users);
    assert.equal(app.users.length, 1);
    assert.equal(app.users.get(0).name.val, 'dude');

    users.remove(user);
    app.commit(users);
    assert.equal(app.users.length, 0);
  });

  it('can update existing items in the store via commit()', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var users = app.users;
    var user = users.factory(dude);
    users.add(user);
    app.commit(users);
    assert.equal(app.users.length, 1);
    assert.equal(app.users.get(0).name.val, 'dude');

    // having an issue with Vector.splice(), on hold...
    user = app.users.get(0);
    user.age.inc();
    app.commit(users);
    assert.equal(app.users.length, 1);
    assert.equal(app.users.get(0).age.val, 22);
  });

  it('can find added items', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var users = app.users;
    users.add(users.factory(dude));
    app.commit(users);

    var results = app.users.query(function(users) {
      return users.filter(function(user) { return user.name.val === 'dude'; }).first();
    });
    assert.equal(results.length, 1);
  });

  it('cannot find removed items', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var users = app.users;
    var user = users.factory(dude);
    users.add(user);
    app.commit(users);
    users.remove(user)
    app.commit(users);

    var results = app.users.query(function(users) {
      return users.filter(function(user) { return user.name.val === 'dude'; }).first();
    });
    assert.equal(results.length, 0);
  });
});
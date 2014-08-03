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

  it('can add items to the store via commit()', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var user = app.create('users', dude);
    app.commit(user);
    var snapshot = app.snapshot();
    assert.equal(snapshot.get('users').length(), 1);
    console.dir(snapshot.get('users').first());
    assert.equal(snapshot.get('users').first().name.val, 'dude');
  });

  it('can remove items from the store via commit()');

  it('can update existing items in the store via commit()', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var user = app.create('users', dude);
    app.commit(user);

    var snapshot = app.snapshot();
    user = snapshot.get('users').first().forEdit();
    user.age.inc();
    app.commit(user);

    snapshot = app.snapshot();
    assert.equal(snapshot.get('users').length(), 1);
    assert.equal(snapshot.get('users').first().name.val, dude.name);
    assert.equal(snapshot.get('users').first().age.val, dude.age + 1);
  });

  it('can find added items', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    var user = app.create('users', dude);
    app.commit(user);

    var users = app.snapshot().get('users');
    assert.equal(users.length(), 1);
    assert.equal(users.first().name.val, dude.name);
    assert.equal(users.first().age.val, dude.age);
  });

  it('cannot find removed items');
});
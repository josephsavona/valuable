var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    helpers = require('./helpers'),
    Store = require('../src/store'),
    Model = require('../src/model'),
    Collection = require('../src/collection'),
    rawValues = require('../test/mock_values');

describe('Store() constructor', function() {
  helpers.init();
  it('cannot create a store with an invalid definition', function() {
    rawValues.forEach(function(val) {
      assert.throws(function() {
        new Store(val);
      });
    });
  });

  it('can create a store with a valid definition', function() {
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

describe('Store() snapshot/commit', function() {
  helpers.init();
  var app, dude;
  beforeEach(function() {
    app = new Store({
      users: {
        name: Model.Str,
        age: Model.Decimal
      }
    });
    dude = {
      name: 'dude',
      age: 21
    };
  });

  it('can add items to the store via commit()', function() {
    var user = app.create('users', dude);
    app.commit(user);
    var snapshot = app.snapshot();
    assert.equal(snapshot.get('users').length(), 1);
    assert.equal(app.get('users').length(), 1);
    assert.equal(snapshot.get('users').first().name.val, 'dude');
    assert.equal(app.get('users').first().name.val, 'dude');
  });

  it('can remove items from the store via commit()', function() {
    var user = app.create('users', dude);
    app.commit(user);

    user = app.snapshot().get('users', user.id); // reload user
    user.destroy();
    app.commit(user);
    
    var snapshot = app.snapshot();
    assert.equal(snapshot.get('users').length(), 0);
  });

  it('can update existing items in the store via commit()', function() {
    var user = app.create('users', dude);
    app.commit(user);

    var snapshot = app.snapshot();
    user = snapshot.get('users').first();
    user.age.inc();
    app.commit(user);

    snapshot = app.snapshot();
    assert.equal(snapshot.get('users').length(), 1);
    assert.equal(snapshot.get('users').first().name.val, dude.name);
    assert.equal(snapshot.get('users').first().age.val, dude.age + 1);
  });

  it('can find added items', function() {
    var user = app.create('users', dude);
    app.commit(user);

    var users = app.snapshot().get('users');
    assert.equal(users.length(), 1);
    assert.equal(users.first().name.val, dude.name);
    assert.equal(users.first().age.val, dude.age);
  });
});
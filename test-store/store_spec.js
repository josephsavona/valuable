var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    rawValues = require('../test/mock_values');

describe('Store() constructor', function() {
  it('cannot create a store with an invalid definition', function() {
    rawValues.forEach(function(val) {
      assert.throws(function() {
        Valueable.store(val);
      });
    });
  });

  it('can create a store', function() {
    assert.doesNotThrow(function() {
      var app = Valueable.store({
        user: {
          name: Valueable.Str,
          age: Valueable.Decimal
        }
      });
    }, 'can create a store');
  });
});

describe('Store#execute()', function() {
  var app;
  beforeEach(function() {
    app = Valueable.store({
      users: {
        name: Valueable.Str,
        age: Valueable.Decimal
      }
    });
  });

  it('can execute a view over the data', function() {
    var dude = {
      name: 'dude',
      age: 21
    };
    app.execute(function() {
      var user = this.users.factory(dude);
      this.commit(this.users.add(user));
    });
    assert.equal(app.users.length, 1);
  });
});
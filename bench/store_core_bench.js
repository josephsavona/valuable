var Store = require('../src/store'),
    Model = require('../src/model'),
    Valuable = require('../old-src/index'),
    Backbone = require('backbone');

Backbone.sync = function() {};

var createBackbone = function() {
  var User = Backbone.Model.extend({url: '/'}),
      Users = Backbone.Collection.extend({
        model: User,
        url: '/'
      });
  return {
    User: User,
    Users: Users
  };
};

var createValuable = function() {
  var User = Valuable.Struct.schema({
    id: Valuable.Str,
    name: Valuable.Str,
    age: Valuable.Decimal,
    dev: Valuable.Bool
  });
  var Users = Valuable.List.of(User);
  return {
    User: User,
    Users: Users
  };
};

var createStore = function() {
  return new Store({
    users: {
      name: Model.Str,
      age: Model.Decimal,
      dev: Model.Bool
    }
  });
};

suite('Schema Definition', function() {
  bench('Backbone', createBackbone);
  bench('Valuable', createValuable);
  bench('Store', createStore);
});

suite('Object Creation', function() {
  var backbone, valuable, store;
  before(function() {
    backbone = createBackbone();
    backbone.collection = new backbone.Users();
    valuable = createValuable();
    valuable.collection = new valuable.Users();
    store = createStore();
  });

  bench('Backbone - new User()', function() {
    var user = new backbone.User();
  });

  bench('Backbone - users.create()', function() {
    var user = backbone.collection.create();
  });

  bench('Valuable - new Users()', function() {
    var user = new valuable.User();
  });

  bench('Valuable - users.push()', function() {
    var user = valuable.collection.push({});
  });

  bench('Store - (private) new User()', function() {
    var user = new store._models.users({});
  });

  bench('Store - store.create(users)', function() {
    var user = store.create('users', {});
  });
});

suite('Object Property Access', function() {
  var object, backbone, valuable, store;
  before(function() {
    object = {name: 'hello'};
    backbone = new (createBackbone()).User({name: 'hello'});
    valuable = new (createValuable()).User({name: 'hello'});
    store = (createStore()).create('users', {name: 'hello'});
  });

  bench('Native', function() {
    return object.name;
  });

  bench('Backbone', function() {
    return backbone.get('name');
  });

  bench('Valuable', function() {
    return valuable.val('name');
  });

  bench('Store - object.name.val', function() {
    return store.name.val;
  });

  bench('Store - object.val(name)', function() {
    return store.val('name');
  });
});

suite('Collection Creation', function() {
  var backbone, valuable, store;
  before(function() {
    backbone = createBackbone();
    valuable = createValuable();
    store = createStore();
  });

  bench('Backbone - new Users()', function() {
    var users = new backbone.Users();
  });

  bench('Valuable - new Users()', function() {
    var users = new valuable.Users();
  });

  bench('Store - store.get(users))', function() {
    var users = store.get('users');
  });

  bench('Store - store.snapshot.get(users)', function() {
    var users = store.snapshot().get('users');
  });
});
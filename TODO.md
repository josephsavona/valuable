var store = new Store(definition);

store.initialize(dataMap); // -> put initial state into the store {name: [modelJson, modelJson], ...}
var dataMap = store.toJSON(); // -> get current state of the store {name: [modelJson, modelJson], ...}

// ad-hoc queries/updates:
store.transaction(function(lens, commit) {
  var user = lens.get('users', 1);
  user.name.val = 'new name';
  commit(user);
});

// ad-hoc realtime views:
store.observe(function listener(lens) {}); // re-run on every commit to the store
store.observeOnce(function cb(lens) {}); // run once on current value of store
store.snapshot(); // -> lens  -- non-callback version to get a lens of store's current state

// or using pre-defined finders:
store.finder('name', queryModelDef, function query(params, lens) { return lens.runQuery(params) });
store.observe('name', {params: params}, function listener(results, query) {}); // triggers on commits and on query changes
store.observeSnapshot('name', {params: params}, function cb(results, query) {}); // triggers only on query changes, ignores outside commits

// or using pre-defined actions:
store.action('name', function action(params, lens, commit) { commit(lens.updateItem(params)) });
store.execute('name', {params: params});



// MODIFYING AN OBSERVE QUERY
var token = store.observe('usersNamed', {name: 'me'}, function(users, query) {
  // render form for query (query is the params parsed into the finder's model definition)
  // render users list

  ui.callback = function() {
    query.name.val = 'not me'; // triggers observe()er to run again even if no commits happen
  }
});


// SNAPSHOTTING
var snapshot = store.snapshot():
var users = snapshot.get('users').filter(usersNamedMe).take(2);
assert(users.length === 1); //pretend someone exists
var newUser = snapshot.create('users');
newUser.name = 'me';
store.commit(newUser);

var snapshot2 = store.snapshot();
var users2 = snapshot2.get('users').filter(usersNamedMe).take(2);
assert(users2.length === 2);
assert(users2.get(0) === users.get(0)); // first item is identical
assert(users2.get(1) !== newUser); // commit does not have to uphold object equality
var me1 = users2.get(0).edit();
me1.name = 'not me';
store.commit(me1);

var snapshot3 = store.snapshot();
var users3 = snapshot3.get('users').filter(usersNamedMe).take(2);
assert(users3.length === 1);
assert(users3.get(0) === users2.get(1)); // item index has shifted, but item itself has stayed same




// TX -> RENDER -> UPDATE
store.transaction(function(store, commit) {
  var users = store.get('users')
    .filter(function(user) { return user.createdAt.val > moment().minus(1, 'day') })
    .take(10);

  // render this list, somewhere UI holds onto a ref to a user
  var form = {user: users.oneOfThem};
  form.onSubmit = function() {
    // long version
    store.transaction(function(store, commit) {
      var user = store.get(form.user); // reload current version of same item
      user.isChecked.negate();
      user.lastUpdated = moment();
      commit(user);
    });
    // shortcut for single item
    form.user.transaction(function(user) {
      user.isChecked.negate();
      user.lastUpdated = moment();
    });
    // perhaps simpler:
    form.user.isChecked.negate();
    form.user.lastUpdated = moment();
    form.user.commit();
  }
});

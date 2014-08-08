# Dev Journal / todos

## build
uglifyjs --screw-ie8 --output dist/store.js --compress 'dead_code,drop_console,drop_debugger,evaluate,loops,unused,join_vars'

## API
var store = new Store(definition);

store.initialize(dataMap); // -> put initial state into the store {name: [modelJson, modelJson], ...}
var dataMap = store.toJSON(); // -> get current state of the store {name: [modelJson, modelJson], ...}


// ad-hoc realtime views:
store.observe(function listener(snapshot) {}); // re-run on every commit to the store
store.observeOnce(function cb(snapshot) {}); // run once on current value of store
store.snapshot(); // -> snapshot  -- non-callback version to get a snapshot of store's current state

// or using pre-defined finders:
// define:
store.finder('name', queryModelDef, function query(params, lens) { return lens.runQuery(params) });
// use:
store.observe('name', {params: params}, function listener(results, query) {}); // triggers on commits and on query changes
store.observeSnapshot('name', {params: params}, function cb(results, query) {}); // triggers only on query changes, ignores outside commits

// or using pre-defined actions:
// define:
store.action('name', function action(params, lens, commit) { commit(lens.updateItem(params)) });
// use:
store.execute('name', {params: params});


// MODIFYING AN OBSERVE QUERY
var token = store.observe('usersNamed', {name: 'me'}, function(users, query) {
  // render form for query (query is the params parsed into the finder's model definition)
  // render users list

  ui.callback = function() {
    query.name.val = 'not me'; // triggers observe()er to run again even if no commits happen
  }
});

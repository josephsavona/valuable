[![Build Status](https://travis-ci.org/josephsavona/valuable.svg?branch=master)](https://travis-ci.org/josephsavona/valuable)

valuable
========

An *immutable data store* for the client supporting *transactional* add/modify/remove. Use a valuable `Store` as your central source of truth, and efficiently re-render only the necessary part of your app on changes. 

```javascript
var store = new Store({
  todos: {
    title: Store.Str, // dynamically type-checked string
    isCompleted: Store.Bool // dynamically type-checked boolean
  }
});

store.observe(function() {
  // called on every `store.commit()`
});

var todo = store.create('todos'); // create empty todo
todo.title.val = 'Build an app';

store.commit(todo); // `observer()` callback called

store.get('todos').length(); // => 1
```

# Use It

```bash
npm install --save valuable
```

Via browserify/webpack:
```javascript
var Valuable = require('valuable');
```

Or download `dist/valuable.js`:
```javascript
var Store = window.Valuable;
```

`valuable` is new but ready to try:
- Extensively tested
- Benchmarks show performance on par and better than Backbone
- Browser support is modern browsers and IE9+

Note: IE9 required for `Object.defineProperties()` for which polyfills do not work reliably in the author's experience.

# Example - TodoMVC

We have a partial implementation of TodoMVC in the `/examples/todomvc` directory. The example combines Valuable for data and React for views. This includes a full undo/redo functionality for all changes to the list (see [Undo](#undo)).

Feel free to clone `valuable` and run it:

```bash
# clone valuable
cd valuable/examples/todomvc
npm install
npm run build
npm start &
open 'http://localhost:8080'
```

# API

## `Store`

### `var store = new Store(schema)`

Creates a new store with the given model schema. Example:

```javascript
var schema = {
  // modelName: propertyMap
  users: {
    // propName: propType
    name: Store.Str,
    age: Store.Decimal,
    isDeveloper: Store.Bool
  },
  otherModel: {/*...*/}
};
var store = new Store(schema);
``` 

### `var model = store.create('<modelName>'[, attributes])`

Creates a new empty model instance of the given model name, optionally with the attributs if given. Example:

```javascript
var user = store.create('users'); // model name matches above
```

### `store.commit(model...)`

Accepts 1+ model instances (either created with new or updated existing) and commits their changes to the store.

```javascript
assert.equal(store.get('users').length(), 0); // no users to start
store.commit(user); // add new user from above
assert.equal(store.get('users').length(), 1); // now everyone can see the new user
```

### `var models = store.get('<modelName>')`

Returns a *lazy* `Collection` (array-like) of all models of the given type. To get all items, use eg `toArray()` on the result. 
You can filter, map, reduce, on this array lazily, eg only the minimal required set of operations is performed and
no work is done until you get a result via `toArray()`. See [lazy.js for full documentation](http://danieltao.com/lazy.js/) Example:

```javascript
var users = store.get('users');
var userModels = users.toArray();

var devsNamedBob = users
  .filter((user) => user.name.eq('bob'))
  .filter((user) => user.isDeveloper.isTrue())
  .toArray();
```


### `var model = store.get('<modelName>', '<id>')`

Retrieves the model of the given type and with the given id. This should either be a known ID if you created it,
or the id set on a model you created with `.create()` and `.commit()`. Example:

```javascript
var model = store.create('users');
store.commit(model); 
var id = model.id; // model.id is set by commit()

// later
var user = store.get('users', id);
```

### `store.observe(<function>)`

Schedules a function to be run after every commit. Use this for example to re-render your app on changes.

```javascript
var observer = function() {
  React.renderComponent(
    AppComponent({store: store}),
    rootEl
  );
};
store.observe(observer);
```

### `store.unobserve(<function>)`

Removes a function previously scheduled with `.observe()`:

```javascript
store.unobserve(observer);
```

### `var snapshot = store.snapshot()`

Get a reference to the current state of the store. Snapshots support the same `.get(<modelName>[, <id>])`
function as stores, but can also be used to restore a store to a previous state:

```javascript
var snapshot = store.snapshot();
// make changes via .commit()
// oops, want to go back:
store.restoreSnapshot(snapshot);
// restored!
```

### `store.restoreSnapshot(<snapshot>)`

Restores a snapshot - see `.snapshot()`

## Snapshot

An immutable lens into the state of the store at the moment the snapshot was created. Can be used to restore
a store to a previous state. A snapshot is implicitly used by `store.get()`. You can take advantage of snapshots
to do things like let a user know that the data they are editing has been changed or deleted, without updating the UI 
out from under them. 

### `snapshot.get(<modelName>[, <id>])`

See `store.get()`.

## `Collection`

A *lazy* sequence of `Model` instances. Returned from `var collection = store.get('<modelName>')`. This is an instance of a [lazy.js ArrayLikeSequence](http://danieltao.com/lazy.js/docs/#ArrayLikeSequence) with the extra method `.id()`. 

### `collection.length()`

Returns the length of the collection, accounting for any previously applied filters, maps, reduce, take, etc.

### `collection.get(<index>)`

Returns the model at the nth `index` (zero-based).

### `collection.id(<id>)`

Returns the model with id `id` if present.

### `collection.transform(<function>)`

Shortcut for `collection.map(function).toArray()`. Note that `.map()` does not immediately apply the mapping
but lazily creates a new, mapped sequence. `transform` is a shorcut for eg UIs, where you likely want to map 
models directly into UI and not call another function.

```javascript
var users = store.get('users');
var usersList = '<ul>' + users.transform((user) => '<li>' + user.name.val + '</li>') + '</ul>';

// the longer way is:
var usersList = '<ul>' + users.map((user) => '<li>' + user.name.val + '</li>').toArray() + '</ul>';
```

## `Model`

### React + Model Example

```javascript
React.createClass({
  getInitialState: function() {
    return {
      user: store.create('users')
    };
  },
  componentDidMount: function() {
    this.state.user.observe(this.forceUpdate);
  },
  componentWillUnmount: function() {
    this.state.user.unobserve(this.forceUpdate);
  },
  render: function() {
    return 
      <form>
        <input type="text" 
          value={user.name.val} 
          onChange={user.name.handleChange()} />
      </form>;
  }
});
```

### `var model = store.create(<modelName>[, <attributes>])`

See `store.create`

### `model.attribute.val`

Get the value of `attribute`

### `model.attribute.val = <value>`

Set the value of `attribute` to `value`.

### `model.set(<attributeMap>)`

Updates multiple keys at once, where keys are property names and values are property values.

### `model.destroy()`

Mark this model to be destroyed.

```javascript
var user = store.get('users', 123);
user.destroy();
store.commit(user); 
// user is gone now
```

### `model.observe(<function>)`

Similar to `store.observe()`, but for individual models: schedules a
function to be called whenever any attribute(s) change on the model.
For maintaining an up-to-date view of your data it is recommended to 
use `store.observe()`. Use `model.observe()` when you are editing a 
model and want to update the form to show the uncommitted changes
locally within eg a `<form>`.

Non-observed models have zero overhead - all observable functionality
is added as necessary when `.observe()` is first called on a particular
instance.

### `model.attribute.handleChange()`

Lazily creates a callback that will handle onChange UI events and set the attribute's value
to that of `event.target.value`. The generated callback is cached so that multiple calls to
`handleChange()` will not create new anonymous functions.


# Inspired By

Valuable is inspired by the functional approach to mutable state, in particular the [software transaction memory approach
of Clojure](http://clojure.org/state). Valuable provides a similar immutable, transaction-based data layer
via a more familiar imperative, mutable-looking API. At its core, however, everything is a functional `lense`: Stores, Collections, Models, and even literal values like strings and booleans.
Local modifications to models are just that - *local* - and are *not* visible to any other viewers until the changes are applied
via `store.commit()`. 

Other immutable/observable libraries include:
- [Cortex](http://mquan.github.io/cortex/)
- [Observ](https://github.com/Raynos/observ)


# License

The MIT License (MIT)

Copyright (c) 2014 Joseph Savona

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

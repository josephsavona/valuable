[![Build Status](https://travis-ci.org/josephsavona/valuable.svg?branch=master)](https://travis-ci.org/josephsavona/valuable)

valuable
========

Provides [immutable*](#immutability) structs, maps, lists, and literal values that you can observe for changes. Use a `Valuable` object as a central source of truth and update your (React) app whenever data changes. Freely pass around wrapped data and manipulate it anywhere in your view. `Valuable` bubbles these changes up so that React can re-render top-down. See the [intro post](https://medium.com/@josephsavona/valuable-a-data-model-for-react-1b8868493bf6).

```javascript
var value = Valuable({
  items: [1,2,3],
  name: 'numbers'
});
value.observe(function(val) {
	// val after .set('name', '4 numbers):
	{ items: [1,2,3], name: '4 numbers' }
	// val after .get('items').push(4)
	{ items: [1,2,3,4], name: '4 numbers' }
});
value.set('name', '4 numbers') // => notifies observe() function above
value.get('items').push(4) // => notifies observe() function above

// get the literal value:
value.val() // => { items: [1,2,3,4], name: '4 numbers'}

// or a nested value:
value.get('name').val() // => '4 numbers'
```

# Use It

```bash
npm install --save valuable
```

```javascript
var Valuable = require('valuable'); // use browserify/webpack
```

`valuable` is new but ready to try:
- Extensively tested, stable API
- Benchmarks show performance on par and better than Backbone (2x faster on list item updates)
- Browser support is modern browsers and IE9+

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

# Immutability

Valuable objects are mutable but the literal values returned by `value.val()` are immutable copies - every mutable modification creates an internal clone. This means you get the benefit of `O(1)` checking for changes while still being able to use a more familiar mutable-style API.

```javascript
var list = Valuable([1,2,3]);
var v1 = list.val();
var v2 = list.val();
assert.ok(v1 === v2, 'val() returns same object if not modified');

list.push(4);
var v3 = list.val();
assert.notOk(v1 === v3, 'val() returns new object for every modification');
```

# API

## `Valuable`

`var Valuable = require('valuable');` returns a special constructor that attempts to find the best possible wrapped type for the value you give it.

Examples:

```javascript
// arrays auto-convert to List
var list = Valuable([1,2,3]); // => list instanceof Valuable.List

// objects auto-convert to Map
var map = Valuable({key:'value'}); // => map instanceof Valuable.Map

// everything else auto-converts to Value
var int = Valuable(1); // => int instanceof Valuable.Value

// nested lists/objects are handled too:
var mixed = Valuable([
  {
    key: 'value'
  }
]);
// mixed instanceof Valuable.List
// mixed.at(0) instanceof Valuable.Map
// mixed.at(0).get('key') instanceof Valuable.Value
```

## `Value`

`var v = Valuable(literal)` - creates a wrapped value with `literal` as the starting value

- `value.val()` - get the literal value that was last assigned
- `value.setVal(literal)` - set the value to `literal` (notifies observers).
- `value.observe(fn)` - add `fn` to list of observers for changes
- `value.unobserve(fn)` - remove `fn` from the list of observers
- `value.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks
- `value.handleChange()` - returns a function that can be passed as the `onChange={}` prop in a React component or to handle any other normalized event value. the returned callback function is created only once and then cached, so repeated calls will get the original cached callback handler.

```javascript
	var value = Value('');
	// React example
	// dead simple onChange - no need for LinkedState or custom handlers everywhere!
	<input type="text" value={value.val()} onChange={value.handleChange()} />
```

### `Decimal`

A typed version of `Value` that only accepts values where typeof is `number`. Methods include: inc(), dec() add(x), sub(x), div(x), mult(x), update(fn(cur)->new), eq(), ne(), gt(), gte(), lt(), lte().

### `Str`

A typed version of `Value` that only accepts values where typeof is `string`. Methods include: append(str), prepend(str), wrap(before, after), update(fn(cur)->new), length()->int.

### `Bool`

A typed version of `Value` that only accepts `true` or `false` (not even falsy values - coerce to boolean for now). Methods include negate() (switches true->false and false->true).


## `Map`

Note: `Map` is an immutable representation of a key->value object/map/hash. All changes to the map - via `set()` or `del()` - will create a new internal object with the modifed value. See the [Immutability](#immutability) section for details.

`var map = Valuable({...})` - creates a wrapped map (object) with the given `{...}` object literal as its starting value.

- `map.val(key)` - gets the literal value at `key` (this is a normal JavaScript value)
- `map.val()` - get the literal value of the map itself (this is a normal JavaScript object)
- `map.setVal({})` - replaces the map with the given object, recursively wrapping all keys
- `map.set(key,value)` - shortcut to `.get(key).setVal(value)` - set the value of `key` to `value` - but also adds keys if they are not yet defined. 
- `map.get(key)` - gets the wrapped value at `key` (this is a `Value`)
- `map.del(key)` - deletes the key and returns its literal value (normal JavaScript value)
- `map.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks

### `Map.of(Klass)`

Creates a custom `Map` class that only accepts values of the given `Klass`, which must be `Value` of a subclass. Example:

```javascript
// define custom map class
var IntMap = Valuable.Map.of(Valuable.Int);
// create map instance
var map = IntMap([]);
map.set('age', 21); // ok
map.set('age', 'nope'); // throws error - value is of wrong type
```

## `List`

Note: `List` is an immutable representation of a Array. All changes to the list - via `set()/push()/pop()/etc` - will create a new internal array with the modifed value. See the [Immutability](#immutability) section for details.


`var list = Valuable([...])` - creates a wrapped list (Array) with the given `[...]` array literal as its starting value.

- `list.val(index)` - gets the literal value at `index` (this is a normal JavaScript value)
- `list.val()` - get the literal value of the list itself (this is a normal JavaScript object)
- `list.setVal([])` - replaces the list with the given array, recursively wrapping all keys
- `list.set(index,value)` - shortcut to `.at(index).setVal(value)` - set the value at `index` to `value`
- `list.at(index)` - gets the wrapped value at `index` (this is a `Value`)
- `list.push(value)` - pushes a wrapped version of `value` onto the end of the list
- `list.unshift(value)` - unshifts a wrapped version of `value` onto the front of the list
- `list.pop()` - removes the last item of the list and returns its literal value (normal JavaScript value)
- `list.shift()` - removes the first item of the list and returns its literal value (normal JavaScript value)
- `list.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks

### `List.of(Klass)`

Creates a custom `List` class that only accepts values of the given `Klass`, which must be `Value` of a subclass. Example:

```javascript
// define custom list class
var IntList = Valuable.List.of(Valuable.Int);
// create list instance
var ints = IntList([]);
ints.push(1); // ok
ints.push(true); // throws error - value is of wrong type
```

## `Struct`

Allows you to define object-like structures with a defined set of keys, each with a specific type. `Struct`s cannot be created directly but must be subclassed with `schema()` or `inherits()`. `Struct` inherits from `Map` and has all the same instance methods eg `set()`, `val()`, etc.

### `Struct.schema({...schema...})`

Shortcut to define a Struct type with a specific schema (property values are `Value` subclasses). Example:

```javascript
var Person = Valuable.Struct.schema({
  name: Valuable.Str, // note the use of class constructors as property values
  age: Valuable.Decimal,
  isDeveloper: Valuable.Bool,
  emails: Valuable.List.of(Valuable.Str) // property can be a complex type
});
var mark = Person({
  name: 'Mark',
  age: 30,
  isDeveloper: false,
  emails: ['mark@example.com']
});
mark.observe((val) -> console.log(val) );
mark.set('isDeveloper', true); // ok, type correct
mark.set('isDeveloper', 'yes'); // throws error, incorrect type for property
if (/* mark's bday */) {
  // the wrapped age is a Valuable.Decimal which has conveniences methods like inc(), dec(), etc
  mark.get('age').inc(); 
}
```

## `Undo`

An easy way to watch a `Value` object and undo/redo changes to it.

```javascript
var list = Valuable([]);
var history = Valuable.Undo(list);

list.push(1);
assert.deepEqual(list.val(), [1]);

history.canUndo(); // -> true
history.undo();
assert.deepEqual(list.val(), []);

history.canRedo(); // -> true 
history.redo();
assert.deepEqual(list.val(), [1]);
```

# Inspired By

Valuable is inspired by and hopes to improve upon the following libraries:
- [Backbone](http://backbonejs.org/) - Valuable adds automatic wrapping of nested objects/arrays
- [Cortex](http://mquan.github.io/cortex/) - Valuable is similar but provides a clearer API and more data types
- [Observ](https://github.com/Raynos/observ) - Valuable adds automatic wrapping of nested objects/arrays


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

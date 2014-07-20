valuable
========

Observable values, maps, and lists

# Status & Compatibility
`valuable` is very new, but already extensively tested and with a stabe API. Please try it for side projects and give us feedback. Browser support is modern browsers and IE9+ (baiscally anything that supports `Object.create()` and `Function.prototype.bind()`).

# Summary

`Valuable` recursively wraps your literals, objects, and arrays so that you can observe whenever any nested value, key, or item is changed. Use a `Valuable` object as a central source of truth and update all your views whenever it changes.

Valuable is inspired by and improves upon the following libraries:
- Backbone - Valuable adds automatic wrapping of nested objects/arrays
- Cortex - Valuable is similar but provides a clearer API and more data types
- Observ - Valuable adds automatic wrapping of nested objects/arrays

# Code, Please

```javascript
var value = Valuable({
  items: [1,2,3],
  name: 'numbers'
});
value.observe(function(val) {
	// val after .set('name'):
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

# Installation

```bash
npm install --save valuable
```

# More Examples

```javascript
var Valueable = require('valuable');

// literal
var value = Valuable(1);
value.observe(function(val) {
	console.log(val);
});
value.val() // => 1
value.set(10) // => notifies observe()-er, logs 10
value.val() // => 10

// nested object/list
var map = Valuable({
	ar: [1,2,3]
	name: 'test'
});
// access the raw value of a key:
assert.deepEqual(map.val('ar'), [1,2,3]);
assert.deepEqual(map.val('name'), 'test');

// or get the wrapped key and then its value:
assert.deepEqual(map.get('ar').val(), [1,2,3]);
assert.deepEqual(map.get('name').val(), 'test');

// observe changes and log the new raw values
map.observe(function(mapValue) {
	console.dir(mapValue);
});

// push a value onto the array at key 'ar'
map.get('ar').push(4); // => notifies observe()-er

// set the map key 'name' to a new value
map.set('name', 'new test'); // => notifies observe()-er

// get the raw value
map.val() // => { ar: [1,2,3,4], name: 'new test'}
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
// mixed.get(0) instanceof Valuable.Map
// mixed.get(0).get('key') instanceof Valuable.Value
```

## `Value`

`var v = Valuable(literal)` - creates a wrapped value with `literal` as the starting value

- `value.set(literal)` - changes the value to `literal` (notifies observers).
- `value.val()` - get the raw literal value that was last assigned
- `value.observe(fn)` - add `fn` to list of observers for changes
- `value.unobserve(fn)` - remove `fn` from the list of observers
- `value.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks


## `Map (inherits Value)`

Note: `Map` is an immutable representation of a key->value object/map/hash. All changes to the map - via `set()` or `del()` - will create a new internal object with the modifed value. 

```javascript
var map = Valuable({key: 'old'}); // same as Valuable.Map({key: 'old'})
var v1 = map.val();
var v1b = map.val();
assert.ok(v1 === v1b);

map.set('key', 'new');
var v2 = map.val();
assert.ok(v1 !== v2); // value is a new JavaScript object (internally cloned and modified)
```

`var map = Valuable({...})` - creates a wrapped map (object) with the given `{...}` object literal as its starting value.

- `map.set(key,value)` - sets the value of map's `key` to a wrapped version of `value`. note that this will recursively wrap `value` with the most appropriate type - array as List, object literal as Map, others as Value.
- `map.get(key)` - gets the wrapped value at `key` (this is a `Value`)
- `map.val(key)` - gets the literal value at `key` (this is a normal JavaScript value)
- `map.val()` - get the literal value of the map itself (this is a plain JavaScript object)
- `map.del(key)` - deletes the key
- `map.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks


## `List (inherits Value)`

Note: `List` is an immutable representation of a Array. All changes to the list - via `set()/push()/pop()/etc` - will create a new internal array with the modifed value. 

```javascript
var list = Valuable(['old']); // same as Valuable.List(['old'])
var v1 = map.val();
var v1b = map.val();
assert.ok(v1 === v1b);

list.set(0, 'new');
var v2 = map.val();
assert.ok(v1 !== v2); // value is a new JavaScript Array (internally cloned and modified)
```

`var list = Valuable([...])` - creates a wrapped list (Array) with the given `[...]` array literal as its starting value.

- `list.set(index,value)` - sets the value of list's `index` to a wrapped version of `value`. note that this will recursively wrap `value` with the most appropriate type - array as List, object literal as Map, others as Value.
- `list.get(index)` - gets the wrapped value at `index` (this is a `Value`)
- `list.val(index)` - gets the literal value at `index` (this is a normal JavaScript value)
- `list.val()` - get the literal value of the list itself (this is a plain JavaScript object)
- `list.push(value)` - pushes a wrapped version of `value` onto the end of the list
- `list.unshift(value)` - unshifts a wrapped version of `value` onto the front of the list
- `list.pop()` - removes the last item of the list
- `list.shift()` - removes the first item of the list
- `list.destroy()` - removes all listeners and cleans up the object to ensure no memory leaks


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

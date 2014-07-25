# Notes

- DONE - Struct schemas

- DONE - typed collections (eg values must be of a type)
	- list
	- map

- DONE cleaner API for val/set/get:
	- val() -> returns raw value
	- setVal(value) -> replaces the raw value with the given value (if given a Value object, extracts its raw value with .val())
	- get(key) -> returns the wrapped value at key
	- set(key, value) -> maps/structs: convenience for .get(key).setVal(value) but creates the key if missing
	- set(index, value) -> lists: convenience for .at(index).setVal(value) but creates the key if missing

- DONE ensure that instaces of custom lists/maps/structs (via .of/.schema) are an instanceof List/Map/Struct eg `someList instanceof List` should be true

- DONE - any time a value can be set, need to check for the possibility that this is a non-literal value and replace self with a new wrapper via Valuable. probably also need to do this._replaceChild(oldValuable, newValuable)
	- done in Value.setVal(value)
	- done in Map.set(key, value) via use of class constructors
	- done in List on push/unshift/splice/replace etc
	- done Struct via .get().setVal()

- DONE setVal() reuses constructor

- DONE - perf. improvements - now much faster than backbone - (check with `npm run bench`)
	
	List Update
	~2x faster than backbone
	constructing a large list and modifying a prop on the middle item
		Backbone x 937 ops/sec ±4.21% (78 runs sampled)
		Valuable x 1,724 ops/sec ±2.98% (71 runs sampled)

	Nested Create-Modify-Read
	~9x faster than backbone
	constructing a single-item list and modifying the item's prop
		Native x 43,719,983 ops/sec ±2.76% (89 runs sampled)
		Backbone x 9,000 ops/sec ±6.95% (53 runs sampled)
		Valuable x 81,745 ops/sec ±2.82% (86 runs sampled)

	Object Create-Modify-Read 
	~40% faster than backbone
	creating an object/model/struct and modifying a prop
		Native x 14,491,213 ops/sec ±3.64% (86 runs sampled)
		Backbone x 73,730 ops/sec ±2.86% (69 runs sampled)
		Valuable x 101,921 ops/sec ±1.62% (87 runs sampled)

- WIP - typed values, - cannot set() to anything but the exact type (throws TypeError)
	- done Decimal
	- done Bool
	- wip Str - needs tests
	- DateTime
	- Func

- consistent way of checking if an instance is a specific type, eg an equivalent to `someIntList instanceof List.of(Int)`

- more array operations and better accessors, eg slice(), map (map and mapv), filter (filter and filterv), negative indexing, range indexing, etc

- additional convenience value types
	- UUID
	- Range - defines a min/max, attempting to set the value below/above will force the value back to min/max respectively (eg like a Int with min/max, but prevents going outside the range and never has an error)
	- Email
	- USPhone
	- MaskedStr - make it easy to generate xxxx-xxxx-xxxx-1234 for credit cards where the true value is kept interally
	- FormattedStr - make it easy to generate (xxx) xxx-xxxx given a string xxxxxxxxxx

- make val() and get() supported nested.path.0.prop style paths. split into tokens and recursively call val/get until you've walked the whole path or reached the end.
	- subclasses should implement _val(), called by standard val()
	- subclasses should implement _get(), called by standard get()
	- the standard method can implement the recursive access using _val/_get

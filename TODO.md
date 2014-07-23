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

- WIP - any time a value can be set, need to check for the possibility that this is a non-literal value and replace self with a new wrapper via Valuable. probably also need to do this._replaceChild(oldValuable, newValuable)
	- done in Value.set(value)
	- done in Map.set(key, value)
	- done in List on push/unshift/splice/replace etc
	- need more tests for Struct

- WIP - typed values, - cannot set() to anything but the exact type (throws TypeError)
	- done Decimal
	- done Bool
	- wip Str
	- DateTime - using momentjs

- make val() and get() supported nested.path.0.prop style paths. split into tokens and recursively call val/get until you've walked the whole path or reached the end.
	- subclasses should implement _val(), called by standard val()
	- subclasses should implement _get(), called by standard get()
	- the standard method can implement the recursive access using _val/_get

- more array operations and better accessors, eg slice(), map (map and mapv), filter (filter and filterv), negative indexing, range indexing, etc

- constructors could/should use .setVal(value) for consistency so that values are only ever set in one place (or vice-versa)

- additional convenience value types
	- UUID
	- Range - defines a min/max, attempting to set the value below/above will force the value back to min/max respectively (eg like a Int with min/max, but prevents going outside the range and never has an error)
	- Email
	- USPhone
	- MaskedStr - make it easy to generate xxxx-xxxx-xxxx-1234 for credit cards where the true value is kept interally
	- FormattedStr - make it easy to generate (xxx) xxx-xxxx given a string xxxxxxxxxx
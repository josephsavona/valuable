# Notes

- cleaner API for val/set/get:
	- val() -> returns raw value
	- val(value) -> replaces the raw value with the given value (if given a Value object, extracts its raw value with .val())
	- get(key) -> returns the wrapped value at key
	- set(key, value) -> maps/structs: convenience for .get(key).val(value) but creates the key if missing
	- set(index, value) -> lists: convenience for .at(index).val(value) but creates the key if missing

- constructors could/should use .val(value) for consistency so that values are only ever set in one place

- any time a value can be set, need to check for the possibility that this is a non-literal value and replace self with a new wrapper via Valuable. probably also need to do this._replaceChild(oldValuable, newValuable)
	- done in Value.set(value)
	- done in Map.set(key, value)
	- done in List on push/unshift/splice/replace etc
	- need more tests for Struct

- typed values, - cannot set() to anything but the exact type (throws TypeError)
	- done Decimal
	- done Bool
	- wip Str
	- DateTime - using momentjs

- typed collections (eg values must be of a type)
	- list
	- map

- make val() and get() supported nested.path.0.prop style paths. split into tokens and recursively call val/get until you've walked the whole path or reached the end.
	- subclasses should implement _val(), called by standard val()
	- subclasses should implement _get(), called by standard get()
	- the standard method can implement the recursive access using _val/_get

- more array operations and better accessors, eg slice(), map (map and mapv), filter (filter and filterv), negative indexing, range indexing, etc

- additional convenience value types
	- UUID
	- Range - defines a min/max, attempting to set the value below/above will force the value back to min/max respectively (eg like a Int with min/max, but prevents going outside the range and never has an error)
	- Email
	- USPhone
	- MaskedStr - make it easy to generate xxxx-xxxx-xxxx-1234 for credit cards where the true value is kept interally
	- FormattedStr - make it easy to generate (xxx) xxx-xxxx given a string xxxxxxxxxx

# Schemas:

create a custom class with Valuable.inherits(Valuable.Klass, {..options..})

```

// schema() is shortcut for extend with schema prototype value
Struct.schema(schema) ~~ Struct.extend({ schema: schema, ..other proto..})

// of() is shortcut for extend with type prototype value
List.of(Klass) ~~ List.extend({ type: Klass, ..other proto..})
Map.of(Klass) ~~ Map.extend({ type: Klass, ..other proto..})

var Person = Valuable.Struct.extend(
	// strongly-typed property definition
	schema: {
		firstName: Valuable.String,
		lastName: Valuable.String,
		age: Valuable.Integer({min: 0}),
		dob: Valuable.DateTime(),
		emails: Valuable.List.of(Valuable.String),
		contacts: Valuable.List.extend({
			type: Valuable.Struct.extend({
				name: Valuable.String,
				photo: Valuable.URL
			})
		})
	},
	// instance method
	name: function() {
		return this.val('firstName') + ' ' + this.val('lastName');
	}
})

var CustomInt = Valuable.inherits(Valuable.Int, {
	min: 0,
	max: 10
})

var person = PersonSchema({ ...json blob... });
person.val('name') # => 'John Doe'
person.val('contacts.0.photo') => # http://example.com/john-doe.jpg
person.get('emails').push('john.doe@example.com'); // OK
person.get('emails').push({ email: 'blah@example.com'}) // TypeError - 'emails' is an array of strings, got an object
```
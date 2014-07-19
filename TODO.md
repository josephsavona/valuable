# Notes

DONE: any time a value can be set, need to check for the possibility that this is a non-literal value and replace self with a new wrapper via Valuable. probably also need to do this._replaceChild(oldValuable, newValuable)
	- done in Value.set(value)
	- done in Map.set(key, value)
	- done in List on push/unshift/splice/replace etc

- would be handy if val() and get() supported nested.path.0.prop style paths. split into tokens and recursively call val/get until you've walked the whole path or reached the end.
	- subclasses should implement _val(), called by standard val()
	- subclasses should implement _get(), called by standard get()
	- the standard method can implement the recursive access using _val/_get

- typed values, eg Integer, Double, Boolean, DateTime, String, etc. cannot set() to anything but the exact type (throws TypeError)

- range type (must inherit) - defines a min/max, attempting to set the value below/above will force the value back to min/max respectively (eg like a Int with min/max, but prevents going outside the range and never has an error)

- need hooks to define custom attributes for custom classes to implement validation etc

- more array operations and better accessors, eg slice(), map (map and mapv), filter (filter and filterv), negative indexing, range indexing, etc

- schemas



# Schemas:

create a custom class with Valuable.inherits(Valuable.Klass, {..options..})

```
var PersonSchema = Valuable.inherits(Valuable.Struct, {
	name: Valuable.String,
	age: Valuable.Integer({min: 0}),
	dob: Valuable.DateTime(),
	emails: [Valuable.String],
	contacts: [Valuable.Struct({
		name: Valuable.String,
		photo: Valuable.URL
	})]
})

var CustomInt = Valuable.inherits(Valuable.Int, {
	min: 0,
	max: 10
})

var person = PersonSchema({ ...json blob... });
person.get('name') # => 'John Doe'
person.get('contacts.0.photo') => # http://example.com/john-doe.jpg
person.get('emails').push('john.doe@example.com'); // OK
person.get('emails').push({ email: 'blah@example.com'}) // TypeError - 'emails' is an array of strings, got an object
```
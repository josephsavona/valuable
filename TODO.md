Notes:
- any time a value is set with an existing Value object, make a new Value instance with the original's type and val(). either that or properly remove the old value from it's old parent and add it to the new one

- any time a value can be set, need to check for the possibility that this is a non-literal value and replace self with a new wrapper via Valuable. probably also need to do this._replaceChild(oldValuable, newValuable)
	- done in Value.set(value)
	- done in Map.set(key, value)
	- TODO in List on push/unshift/splice/replace etc

- would be handy if val() and get() supported nested.path.0.prop style paths. split into tokens and recursively call val/get until you've walked the whole path or reached the end.

- typed values, eg Integer, Double, Boolean, DateTime, String, etc. cannot set() to anything but the exact type

- schemas

Schemas:

var PersonSchema = Valuable.Struct({
	name: Valuable.String,
	age: Valuable.Integer({min: 0}),
	dob: Valuable.DateTime(),
	emails: [Valuable.String],
	contacts: [Valuable.Struct({
		name: Valuable.String,
		photo: Valuable.URL
	})]
})

var person = PersonSchema({ ...json blob... });
person.get('name') # => 'John Doe'
person.get('contacts.0.photo') => # http://example.com/john-doe.jpg
person.get('emails').push('john.doe@example.com'); // OK
person.get('emails').push({ email: 'blah@example.com'}) // TypeError - 'emails' is an array of strings, got an object

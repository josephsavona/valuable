valuable
========

Observable values, maps, and lists

# Status
The code is passing all tests but in active development. Expect a publicly-usable beta release by August 2014.


# Summary

Wrap your literals/objects/arrays so that you can observe when they change. Get type safety along the way for free (eg ensure that a Map's values are all Strings, or that a literal's value is always a Date, or a Boolean).

```javascript
var Valueable = require('valuable');
var value = Valuable(1);
value.observe(function(val) {
	console.log(val);
});
value.get() # => 1
value.set(10) # => notifies observe()-er, logs 10
value.val() # => 10
```


# Installation

```bash
npm install --save valuable
```

# API

Coming Soon - see the summary for what we have now.



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
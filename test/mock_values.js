var rawValues = [
  0,
  1,
  99999,
  NaN,
  null,
  true,
  false,
  new Date(),
  {},
  {key: true},
  new (function Klass(){}),
  function(){},
  '',
  'string',
];

// create single-item arrays wrapping each of the above values
var length = rawValues.length;
for (var ix = 0; ix < length; ix++) {
  rawValues.push([rawValues[ix]]);
};

module.exports = rawValues;
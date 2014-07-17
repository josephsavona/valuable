var rawValues = [
  0,
  1,
  99999,
  NaN,
  null,
  undefined,
  true,
  false,
  new Date(),
  {},
  {key: true},
  new (function(){}),
  function(){},
  '',
  'string',
];

var length = rawValues.length;
for (var ix = 0; ix < length; ix++) {
  rawValues.push([rawValues[ix]]);
};

module.exports = rawValues;
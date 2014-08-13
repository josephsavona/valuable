var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    helpers = require('./helpers'),
    Valueable = require('../src/valueable');
 

describe('Valuable', function() {
  var matchers;
  helpers.init();
  beforeEach(function() {
    matchers = Valueable.__reset__([]);
  });
  afterEach(function() {
    Valueable.__reset__(matchers);
  });

  it('show throw an error if no matching type is found', function() {
    assert.throws(function() {
      Valueable(1);
    });
  });
});
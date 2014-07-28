var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Value = require('../../src/value'),
    Str = require('../../src/types/str'),
    rawValues = require('../mock_values');

describe('Str', function() {
  it('has a default value of ""', function() {
    var i = Str();
    assert.equal(i.val(), '');
  });

  it('cannot construct from non-string values', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      assert.throws(function() {
        Str(val);
      })
    });
  });

  it('constructs with the given string value', function() {
    rawValues.forEach(function(val) {
      if (!_.isString(val)) {
        return;
      }
      var d = Str(val);
      assert.deepEqual(d.val(), val, 'value should match');
      assert.ok(typeof d.val() === 'string', 'value should be a string');
      assert.equal(d.length, val.length, 'length should match');
    });
  });

  it('cannot set to a non-string value', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      d = Str();
      assert.throws(function() {
        d.setVal(val);
      })
    });
  });

  it('sets to string values', function() {
    rawValues.forEach(function(val) {
      if (!_.isString(val)) {
        return;
      }
      var d = Str();
      d.setVal(val);
      assert.deepEqual(d.val(), val, 'value should match');
      assert.ok(typeof d.val() === 'string', 'value should be a string');
      assert.equal(d.length, val.length, 'length should match');
    });
  });

  it('cannot append/prepend/wrap/update with a non-string value', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      d = Str();
      assert.throws(function() {
        d.append(val);
      });
      assert.throws(function() {
        d.prepend(val);
      });
      assert.throws(function() {
        d.wrap(val, '');
      });
      assert.throws(function() {
        d.wrap('', val);
      });
      assert.throws(function() {
        d.update(function(x) {
          return val;
        });
      });
    });
  });

  var updates = [{
    fn: 'append',
    set: 'a',
    args: ['b'],
    val: 'ab'
  },
  {
    fn: 'prepend',
    set: 'a',
    args: ['b'],
    val: 'ba'
  },
  {
    fn: 'wrap',
    set: 'a',
    args: ['b', 'c'],
    val: 'bac'
  },
  {
    fn: 'update',
    set: 'a',
    args: [function(x) { return x + 'b'}],
    val: 'ab'
  }];

  updates.forEach(function(update, index) {
    var label = update.set + '.' + update.fn + '(' + (update.args || []).join(',') + ') == ' + (update.resp || update.val || 'false');
    it(label, function() {
      var d, val, resp;
      d = Str();
      d.setVal(update.set);
      resp = d[update.fn].apply(d, update.args || []);
      if ('resp' in update) {
        assert.deepEqual(resp, update.resp, label);
      }
      if ('val' in update) {
        assert.deepEqual(d.val(), update.val, label);
      }
    });
  });
});
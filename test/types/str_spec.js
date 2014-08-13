var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../../src/model'),
    Str = require('../../src/str'),
    rawValues = require('../mock_values');

var MyModel = Model.define({
  str: Str
});

describe('Str', function() {
  var model, str;
  beforeEach(function() {
    model = new MyModel();
    str = model.str;
  });

  it('has a default value of ""', function() {
    assert.equal(str.val, '');
  });

  it('cannot construct from non-string values', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      assert.throws(function() {
        new MyModel({str: val});
      })
    });
  });

  it('constructs with the given string value', function() {
    rawValues.forEach(function(val) {
      if (!_.isString(val)) {
        return;
      }
      model = new MyModel({str: val});
      assert.deepEqual(model.str.val, val, 'value should match');
      assert.ok(typeof model.str.val === 'string', 'value should be a string');
      assert.equal(model.str.length, val.length, 'length should match');
    });
  });

  it('cannot set to a non-string value', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      assert.throws(function() {
        str.val = val;
      })
    });
  });

  it('sets to string values', function() {
    rawValues.forEach(function(val) {
      if (!_.isString(val)) {
        return;
      }
      str.val = val;
      assert.deepEqual(str.val, val, 'value should match');
      assert.ok(typeof str.val === 'string', 'value should be a string');
      assert.equal(str.length, val.length, 'length should match');
    });
  });

  it('cannot append/prepend/wrap/update with a non-string value', function() {
    rawValues.forEach(function(val) {
      if (_.isString(val)) {
        return;
      }
      assert.throws(function() {
        str.append(val);
      });
      assert.throws(function() {
        str.prepend(val);
      });
      assert.throws(function() {
        str.wrap(val, '');
      });
      assert.throws(function() {
        str.wrap('', val);
      });
      assert.throws(function() {
        str.update(function(x) {
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
      str.val = update.set;
      resp = str[update.fn].apply(str, update.args || []);
      if ('resp' in update) {
        assert.deepEqual(resp, update.resp, label);
      }
      if ('val' in update) {
        assert.deepEqual(str.val, update.val, label);
      }
    });
  });
});
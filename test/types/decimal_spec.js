var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Value = require('../../src/value'),
    Decimal = require('../../src/types/decimal'),
    rawValues = require('../mock_values');

describe('Decimal', function() {
  it('has a default value of 0', function() {
    var i = Decimal();
    assert.equal(i.val(), 0);
  });

  it('resets to default value for setVal(undefined)', function() {
    var i = Decimal(1);
    i.setVal();
    assert.equal(i.val(), 0);
  });

  it('cannot construct from non-number values', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        Decimal(val);
      })
    });
  });

  it('constructs with the given number value', function() {
    rawValues.forEach(function(val) {
      if (!_.isNumber(val)) {
        return;
      }
      var d = Decimal(val);
      assert.deepEqual(d.val(), val);
      assert.ok(isNaN(d.val()) || typeof d.val() === 'number');
    });
  });

  it('cannot set to a non-number value', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val) || val === null || typeof val === 'undefined') {
        return;
      }
      d = Decimal();
      assert.throws(function() {
        d.setVal(val);
      })
    });
  });

  it('sets to number values', function() {
    rawValues.forEach(function(val) {
      if (!_.isNumber(val)) {
        return;
      }
      var d = Decimal();
      d.setVal(val);
      assert.deepEqual(d.val(), val);
      assert.ok(isNaN(d.val()) || typeof d.val() === 'number');
    });
  });

  it('throws if helper function args are not numbers (add/eq/gt etc)', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val)) {
        return;
      }
      var d = Decimal();
      var methods = ['add', 'sub', 'mult', 'div', 'eq', 'ne', 'lt', 'lte', 'gt', 'gte'];
      methods.forEach(function(method) {
        assert.throws(function() {
          d[method](val);
        }, null, null, d.val() + '.' + method + '(' + val + ')');
      });
    });
  });

  var updates = [{
    fn:'inc',
    set: 1,
    val: 2
  },{
    fn: 'dec',
    set: 2,
    val: 1
  }, {
    fn: 'add',
    set: 0,
    args: [10],
    val: 10
  }, {
    fn: 'sub',
    set: 0,
    args: [10],
    val: -10
  }, {
    fn: 'mult',
    set: 1,
    args: [10],
    val: 10
  }, {
    fn: 'div',
    set: 10,
    args: [10],
    val: 1
  }, {
    fn: 'isNaN',
    set: NaN,
    resp: true
  }, {
    fn: 'isNaN',
    set: 0,
    resp: false
  }, {
    fn: 'eq',
    set: 0,
    args: [0],
    resp: true
  }, {
    fn: 'eq',
    set: 0,
    args: [1],
    resp: false
  }, {
    fn: 'ne',
    set: 0,
    args: [1],
    resp: true
  }, {
    fn: 'ne',
    set: 0,
    args: [0],
    resp: false
  }, {
    fn: 'lt',
    set: 0,
    args: [0],
    resp: false
  }, {
    fn: 'lt',
    set: 0,
    args: [1],
    resp: true
  }, {
    fn: 'gt',
    set: 0,
    args: [0],
    resp: false
  }, {
    fn: 'gt',
    set: 0,
    args: [-1],
    resp: true
  }, {
    fn: 'lte',
    set: 0,
    args: [0],
    resp: true
  }, {
    fn: 'lte',
    set: 0,
    args: [1],
    resp: true
  }, {
    fn: 'lte',
    set: 0,
    args: [-1],
    resp: false
  }, {
    fn: 'gte',
    set: 0,
    args: [0],
    resp: true
  }, {
    fn: 'gte',
    set: 0,
    args: [-1],
    resp: true
  }, {
    fn: 'gte',
    set: 0,
    args: [1],
    resp: false
  }, {
    fn: 'update',
    set: 0,
    args: [function(x) { return x + 10; }],
    val: 10
  }];

  updates.forEach(function(update, index) {
    var label = update.set + '.' + update.fn + '(' + (update.args || []).join(',') + ') == ' + (update.resp || update.val || 'false');
    it(label, function() {
      var d, val, resp;
      d = Decimal();
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
var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Model = require('../../src/model'),
    Decimal = require('../../src/decimal'),
    rawValues = require('../mock_values');

var MyModel = Model.define({
  decimal: Decimal
});

describe('Decimal', function() {
  var model, decimal;
  beforeEach(function() {
    model = new MyModel();
    decimal = model.decimal;
  });

  it('has a default value of 0', function() {
    assert.equal(decimal.val, 0);
  });

  it('cannot construct from non-number values', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        new MyModel({decimal: val});
      })
    });
  });

  it('constructs with the given number value', function() {
    rawValues.forEach(function(val) {
      if (!_.isNumber(val)) {
        return;
      }
      model = new MyModel({decimal: val});
      assert.deepEqual(model.decimal.val, val);
      assert.ok(isNaN(model.decimal.val) || typeof model.decimal.val === 'number');
    });
  });

  it('cannot set to a non-number value', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        decimal.val = val;
      })
    });
  });

  it('sets to number values', function() {
    rawValues.forEach(function(val) {
      if (!_.isNumber(val)) {
        return;
      }
      decimal.val = val;
      assert.deepEqual(decimal.val, val);
      assert.ok(isNaN(decimal.val) || typeof decimal.val === 'number');
    });
  });

  it('throws if helper function args are not numbers (add/eq/gt etc)', function() {
    rawValues.forEach(function(val) {
      if (_.isNumber(val)) {
        return;
      }
      var methods = ['add', 'sub', 'mult', 'div', 'eq', 'ne', 'lt', 'lte', 'gt', 'gte'];
      methods.forEach(function(method) {
        assert.throws(function() {
          decimal[method](val);
        }, null, null, decimal.val + '.' + method + '(' + val + ')');
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
      decimal.val = update.set;
      resp = decimal[update.fn].apply(decimal, update.args || []);
      if ('resp' in update) {
        assert.deepEqual(resp, update.resp, label);
      }
      if ('val' in update) {
        assert.deepEqual(decimal.val, update.val, label);
      }
    });
  });
});
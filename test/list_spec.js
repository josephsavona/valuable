var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    List = require('../src/list'),
    Value = require('../src/value'),
    Bool = require('../src/types/bool'),
    Decimal = require('../src/types/decimal'),
    Str = require('../src/types/str'),
    rawValues = require('./mock_values');

describe('List', function() {
  it('can be observe()-ed with a function callback', function() {
    assert.doesNotThrow(function() {
      var value = List();
      value.observe(function(){});
    });
  });

  it('throws if observe() called with non-function', function() {
    assert.throws(function() {
      var value = List();
      value.observe(1);
    });
  });

  it('throws if index is not a positive integer', function() {
    rawValues.forEach(function(val) {
      if (typeof val === 'number' || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        List().at(val);
      }, Error, null, 'get() takes int');
      assert.throws(function() {
        List().val(val);
      }, Error, null, 'val() takes int');
    });
  });

  it('cannot be created with a non-array value', function() {
    rawValues.forEach(function(val) {
      if (_.isArray(val) || val === null || typeof val === 'undefined') {
        return;
      }
      assert.throws(function() {
        List(val);
      });
    });
  });

  it('returns the real value via val()', function() {
    var value = List();
    assert.deepEqual(value.val(), []);
  });

  it('sets initial value on list creation', function() {
    rawValues.forEach(function(val) {
      var list = [val],
          value = List(list);
      assert.deepEqual(value.val(), list);
    });
  });

  it('wraps push()-ed values as valuables', function() {
    rawValues.forEach(function(val) {
      var value = List();
      value.push(val);
      assert.ok(value.at(0) instanceof Value, 'wraps values in Value');
      assert.deepEqual(value.at(0).val(), val, 'wrapped value has the set value');
    })
  });


  it('wraps unshift()-ed values as valuables', function() {
    rawValues.forEach(function(val) {
      var value = List();
      value.unshift(val);
      assert.ok(value.at(0) instanceof Value, 'wraps values in Value');
      assert.deepEqual(value.at(0).val(), val, 'wrapped value has the set value');
    })
  });

  it('observe()s item changes from set()', function() {
    rawValues.forEach(function(val) {
      var value = List([0]),
          observer = sinon.spy();
      value.observe(observer);
      value.set(0, val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], [val]);
    });
  });

  it('observe()s item changes from at().set()', function() {
    rawValues.forEach(function(val) {
      var value = List([0]),
          observer = sinon.spy();
      value.observe(observer);
      value.at(0).setVal(val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], [val]);
    });
  });

  it('observe()s shift() removals', function() {
    rawValues.forEach(function(val) {
      var value = List(),
          observer = sinon.spy(),
          shifted;
      value.observe(observer);
      value.set(0, val);
      shifted = value.shift();
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], [val]);
      assert.deepEqual(observer.args[1][0], []);
      assert.deepEqual(shifted, val, 'shift() returns the raw value');
    });
  });

  it('observe()s pop() removals', function() {
    rawValues.forEach(function(val) {
      var value = List(),
          observer = sinon.spy(),
          popped;
      value.observe(observer);
      value.set(0, val);
      popped = value.pop();
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], [val]);
      assert.deepEqual(observer.args[1][0], []);
      assert.deepEqual(popped, val, 'pop() returns the raw value');
    });
  });

  it('unwraps wrapped values in constructor', function() {
    rawValues.forEach(function(val) {
      var wrapped = Value(val),
          list1 = List([wrapped]);

      assert.deepEqual(list1.val(), [val], 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(list1.val(), [val], 'list remains unaffected');
    });
  });

  it('unwraps wrapped values in set()', function() {
    rawValues.forEach(function(val) {
      var list1 = List(),
          wrapped = Value(val);
      list1.set(0, wrapped);

      assert.deepEqual(list1.val(), [val], 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(list1.val(), [val], 'list remains unaffected');
    });
  });

  it('unwraps wrapped values in push()', function() {
    rawValues.forEach(function(val) {
      var list1 = List(),
          wrapped = Value(val);
      list1.push(wrapped);

      assert.deepEqual(list1.val(), [val], 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(list1.val(), [val], 'list remains unaffected');
    });
  });

  it('unwraps wrapped values in unshift()', function() {
    rawValues.forEach(function(val) {
      var list1 = List(),
          wrapped = Value(val);
      list1.unshift(wrapped);

      assert.deepEqual(list1.val(), [val], 'literal value matches');
      wrapped.setVal([val]);
      assert.deepEqual(wrapped.val(), [val], 'original wrapped changes');
      assert.deepEqual(list1.val(), [val], 'list remains unaffected');
    });
  });

  it('nests lists', function() {
    var list = [0, [1, 2]],
        value = List(list),
        observer = sinon.spy();

    // test basic structure
    assert.deepEqual(value.val(), list);
    assert.deepEqual(value.val(0), list[0]);
    assert.deepEqual(value.at(0).val(), list[0]);
    assert.deepEqual(value.val(1), list[1]);
    assert.deepEqual(value.at(1).val(), list[1]);
    assert.ok(value.at(1) instanceof List, 'nested list should be a List');

    // nesting get/val test
    assert.deepEqual(value.at(1).at(1).val(), list[1][1]);
    assert.deepEqual(value.at(1).val(1), list[1][1]);

    // nesting set test
    value.observe(observer);
    value.at(1).at(1).setVal(false);
    assert.ok(observer.calledOnce, 'observer called once for grandchild value change');
    list[1][1] = false;
    assert.deepEqual(observer.args[0][0], list, 'new value is as expected'); 
  });

  // typed list checks
  var types = [
    {klass: Decimal, label: 'Decimal', test: _.isNumber},
    {klass: Str, label: 'Str', test: _.isString},
    {klass: Bool, label: 'Bool', test: _.isBoolean}
  ];
  _.forEach(types, function(type) {
    rawValues.forEach(function(val) {
      if (type.test.call(_, val)) {
        var label = 'List.of(' + type.label + ') OK ' + typeof val;
        it(label, function() {
          assert.doesNotThrow(function() {
            List.of(type.klass)([val]);
          }, label);
        });
      } else {
        var label = 'List.of(' + type.label + ') rejects ' + typeof val;
        it(label, function() {
          assert.throws(function() {
            List.of(type.klass)([val]);
          }, Error, null, label);
        });
      }
    });
  });

  it('can be inherited', function() {
    var DecimalList = List.inherits(Decimal, {
      sum: function DecimalList$sum() {
        return this._raw.reduce(function(sum, item) {
          return sum + item;
        }, 0);
      }
    });
    var list = DecimalList([0,1,2,3,0]);
    list.push(0); // test list modification to ensure that everything is wired up
    list.at(4).setVal(4);
    list.set(5, 5);
    var sum = list.sum();
    assert.ok(list instanceof DecimalList);
    assert.ok(list instanceof List);
    assert.ok(list instanceof Value);
    assert.equal(sum, 15, 'prototype method works');
    assert.deepEqual(list.val(), [0,1,2,3,4,5], 'val() returns original value');
  });

  it('can be inherited with any Value subclass or Valuable', function() {
    var klasses = [Value, Valueable, Valueable.List, Valueable.Map, Valueable.Decimal, Valueable.Str];
    klasses.forEach(function(klass) {
      assert.doesNotThrow(function() {
        List.inherits(klass, {});
      });
    });
  });
});
 
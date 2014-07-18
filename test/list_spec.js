var assert = require('chai').assert,
    sinon = require('sinon'),
    Valueable = require('..'),
    List = require('../src/list'),
    Value = require('../src/value'),
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
        List().get(val);
      }, Error, null, 'get() takes int');
      assert.throws(function() {
        List().val(val);
      }, Error, null, 'val() takes int');
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

  it.skip('wraps push()-ed values as valuables', function() {
    rawValues.forEach(function(val) {
      var value = List();
      value.push(val);
      assert.ok(value.get(0) instanceof Value, 'wraps values in Value');
      assert.deepEqual(value.get(0).val(), val, 'wrapped value has the set value');
    })
  });


  it.skip('wraps unshift()-ed values as valuables', function() {
    rawValues.forEach(function(val) {
      var value = List();
      value.unshift(val);
      assert.ok(value.get(0) instanceof Value, 'wraps values in Value');
      assert.deepEqual(value.get(0).val(), val, 'wrapped value has the set value');
    })
  });

  it.skip('observe()s item changes from get().set()', function() {
    rawValues.forEach(function(val) {
      var value = List({key: 0}),
          observer = sinon.spy();
      value.observe(observer);
      value.get('key').set(val);
      assert.ok(observer.calledOnce, 'observer called');
      assert.deepEqual(observer.args[0][0], {key: val});
    });
  });

  it.skip('observe()s shift() removals', function() {
    rawValues.forEach(function(val) {
      var value = List(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      value.del('key');
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], {key: val});
      assert.deepEqual(observer.args[1][0], {});
    });
  });

  it.skip('observe()s pop() removals', function() {
    rawValues.forEach(function(val) {
      var value = List(),
          observer = sinon.spy();
      value.observe(observer);
      value.set('key', val);
      value.del('key');
      assert.ok(observer.calledTwice, 'observer called once per modifiction');
      assert.deepEqual(observer.args[0][0], {key: val});
      assert.deepEqual(observer.args[1][0], {});
    });
  });

  it('nests lists');
});
 
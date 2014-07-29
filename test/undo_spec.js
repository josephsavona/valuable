var assert = require('chai').assert,
    sinon = require('sinon'),
    _ = require('lodash'),
    Valueable = require('..'),
    List = require('../src/list'),
    Map = require('../src/map'),
    Value = require('../src/value'),
    Bool = require('../src/types/bool'),
    Decimal = require('../src/types/decimal'),
    Str = require('../src/types/str'),
    Undo = require('../src/undo'),
    rawValues = require('./mock_values');

describe('Undo', function() {
  var literals = [
    {klass: Str, values: ['', 'hello', 'hello world']},
    {klass: Bool, values: [true, false, false, true]},
    {klass: Decimal, values: [0.1, 1, 5, 999]},
  ];

  it('rejects anything other than a Value instance', function() {
    rawValues.forEach(function(val) {
      assert.throws(function() {
        Undo(val);
      });
    });
  });

  it('accepts value instances', function() {
    rawValues.forEach(function(val) {
      assert.doesNotThrow(function() {
        var value = Valueable(val);
        Undo(value);
      });
    });
  });

  it('cannot immediately undo/redo', function() {
    var value = Valueable(true),
        undo = Undo(value);
    assert.notOk(undo.canUndo());
    assert.notOk(undo.canRedo());
    assert.throws(function() {
      undo.undo();
    });
    assert.throws(function() {
      undo.redo();
    });
  });

  it('can undo/redo a change', function() {
    var value = Valueable('0'),
        undo = Undo(value);
    value.setVal('1');
    assert.ok(undo.canUndo());
    undo.undo();
    assert.deepEqual(value.val(), '0');
    assert.notOk(undo.canUndo());
    assert.ok(undo.canRedo());
    undo.redo();
    assert.deepEqual(value.val(), '1');
  });

  it('cannot redo a past change once value changed', function() {
    var value = Valueable('0'),
        undo = Undo(value);
    // 0 -> (1)
    value.setVal('1');
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());

    // (0) -> 1
    undo.undo();
    assert.notOk(undo.canUndo());
    assert.ok(undo.canRedo());
    
    // 0 -> (1b)
    value.setVal('1b');
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());
    
    // (0) -> 1b
    undo.undo();
    assert.deepEqual(value.val(), '0');
    assert.notOk(undo.canUndo());
    assert.ok(undo.canRedo());
    
    // 0 -> (1b)
    undo.redo();
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());
    assert.deepEqual(value.val(), '1b');
  });
});
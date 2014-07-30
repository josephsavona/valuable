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
    // 0 -> (1)
    value.setVal('1');
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());

    // (0) -> 1
    undo.undo();
    assert.notOk(undo.canUndo());
    assert.ok(undo.canRedo());
    assert.deepEqual(value.val(), '0');

    // 0 -> (1)
    undo.redo();
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());
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
    
    // 0 -> (1b) -- removes previous '1'
    value.setVal('1b');
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());
    
    // (0) -> 1b
    undo.undo();
    assert.notOk(undo.canUndo());
    assert.ok(undo.canRedo());
    assert.deepEqual(value.val(), '0');
    
    // 0 -> (1b)
    undo.redo();
    assert.ok(undo.canUndo());
    assert.notOk(undo.canRedo());
    assert.deepEqual(value.val(), '1b');
  });

  it('can change the watched Value via setVal()', function() {
    rawValues.forEach(function(val) {
      var undo = Valueable.Undo(Valueable());
      assert.throws(function() {
        undo.setVal(val);
      });
      assert.doesNotThrow(function() {
        undo.setVal(Valueable(val));
      });
    });
  });

  it('can undo/redo multiple times', function() {
    var count = 25,
        ix,
        value = Valueable.Decimal(0),
        undo = Valueable.Undo(value);
    for (ix = 1; ix <= count; ix++) {
      value.setVal(ix);
    }
    for (ix = count; ix > 0; ix--) {
      undo.undo();
      assert.deepEqual(value.val(), ix-1);
    }
    for (ix = 1; ix <= count; ix++) {
      undo.redo();
      assert.deepEqual(value.val(), ix);
    }
  });

  it('can undo/redo multiple times (List)', function() {
    var count = 25,
        ix,
        list = Valueable.List([]),
        undo = Valueable.Undo(list);
    for (ix = 1; ix <= count; ix++) {
      list.push(ix);
    }
    for (ix = count; ix > 0; ix--) {
      undo.undo();
      assert.deepEqual(list.val().length, ix-1, 'length after ' + ((count - ix) + 1) + ' iterations (' + ix + ')');
    }
    for (ix = 1; ix <= count; ix++) {
      undo.redo();
      assert.deepEqual(list.val().length, ix);
    }
  });

  it('can undo/redo multiple times (Map)', function() {
    var count = 25,
        ix,
        map = Valueable.Map({key: 0}),
        undo = Valueable.Undo(map);
    for (ix = 1; ix <= count; ix++) {
      map.set('key', ix);
    }
    for (ix = count; ix > 0; ix--) {
      undo.undo();
      assert.deepEqual(map.val('key'), ix-1, 'value after ' + ((count - ix) + 1) + ' iterations (' + ix + ')');
    }
    for (ix = 1; ix <= count; ix++) {
      undo.redo();
      assert.deepEqual(map.val('key'), ix);
    }
  });

  it('can undo/redo only after setVal called', function() {
    var value = Valueable('0'),
        undo = Undo(Valueable());
    value.setVal('1'); // change value before watching with Undo

    // (1)
    // start watching w Undo
    undo.setVal(value);
    assert.notOk(undo.canUndo(), 'cannot undo');
    assert.notOk(undo.canRedo(), 'cannot redo');

    // 1 -> (2)
    value.setVal('2');
    assert.ok(undo.canUndo(), 'can undo once new vaue is set');
    assert.notOk(undo.canRedo(), 'cannot redo until after an undo');

    // (1) -> 2
    undo.undo();
    assert.notOk(undo.canUndo(), 'cannot undo once all changes undone');
    assert.ok(undo.canRedo(), 'can redo once undo is called');
    assert.deepEqual(value.val(), '1', 'cannot get back to the "0" value set before watched');
  });

  it('can undo/redo only after setVal called (Undo starts undefined)', function() {
    var value = Valueable('0'),
        undo = Undo(); // <-- cann pass undefined
    value.setVal('1'); // change value before watching with Undo

    // (1)
    // start watching w Undo
    undo.setVal(value);
    assert.notOk(undo.canUndo(), 'cannot undo');
    assert.notOk(undo.canRedo(), 'cannot redo');

    // 1 -> (2)
    value.setVal('2');
    assert.ok(undo.canUndo(), 'can undo once new vaue is set');
    assert.notOk(undo.canRedo(), 'cannot redo until after an undo');

    // (1) -> 2
    undo.undo();
    assert.notOk(undo.canUndo(), 'cannot undo once all changes undone');
    assert.ok(undo.canRedo(), 'can redo once undo is called');
    assert.deepEqual(value.val(), '1', 'cannot get back to the "0" value set before watched');
  });

  it('cannot setMax() to negative or non-number', function() {
    var undo = Undo();
    [-1, false, '', null, undefined, [], {}].forEach(function(val) {
      assert.throws(function() {
        undo.setMax(val);
      });
    });
  });

  it('limits the number of undo items', function() {
    var value = Valueable(0),
        undo = Undo(value);
    undo.setMax(1);
    value.setVal(1);
    value.setVal(2);
    assert.ok(undo.canUndo(), 'can undo once');
    undo.undo();
    assert.deepEqual(value.val(), 1, 'undo() works normally');
    assert.notOk(undo.canUndo(), 'undo limited to 1');
    undo.redo();
    assert.deepEqual(value.val(), 2, 'redo() works normally');
    assert.ok(undo.canUndo());
  });

  it('unobserves its value when destroy()-ed', function() {
    var value = Valueable(0),
        undo = Undo(value);
    assert.equal(value._listeners.length, 1, 'has one listener (the Undo)');
    undo.destroy();
    assert.doesNotThrow(function() {
      value.setVal(1);
    });
    assert.equal(value._listeners.length, 0, 'has no listeners');
  });
});
var mori = require('mori'),
    Immutable = require('immutable'),
    helpers = require('./helpers'),
    assert = require('assert');

suite('Immutable Map - Constructor', function() {
  var data, idMap;
  before(function() {
    data = helpers.makeData();
    idMap = {};
    for (var ix = 0; ix < data.length; ix++) {
      idMap[ix] = data[ix];
    }
  });

  bench('mori', function() {
    var map = mori.hash_map();
    for (var ix = 0; ix < data.length; ix++) {
      map = mori.assoc(map, ix, data[ix]);
    }
    assert.equal(mori.count(map), data.length);
  });

  bench('immutable - Map()', function() {
    var map = Immutable.Map(idMap);
    assert.equal(map.length, data.length);
  });

  bench('immutable - immutable updates', function() {
    var map = Immutable.Map();
    for (var ix = 0; ix < data.length; ix++) {
      map = map.set(ix, data[ix]);
    }
    assert.equal(map.length, data.length);
  });

  bench('immutable - withMutations', function() {
    var map = Immutable.Map().withMutations(function(map) {
      for (var ix = 0; ix < data.length; ix++) {
        map = map.set(ix, data[ix]);
      }
    });
    assert.equal(map.length, data.length);
  });
});

suite('Immutable Map - Single Update', function() {
  var data, idMap, moriMap, immutableMap;
  before(function() {
    data = helpers.makeData();
    idMap = {};
    for (var ix = 0; ix < data.length; ix++) {
      idMap[ix] = data[ix];
    }
    moriMap = mori.hash_map();
    for (var ix = 0; ix < data.length; ix++) {
      moriMap = mori.assoc(moriMap, ix, data[ix]);
    }
    immutableMap = Immutable.Map(idMap);
  });

  bench('mori', function() {
    moriMap = mori.assoc(moriMap, data.length+1, {});
    assert.equal(mori.count(moriMap), data.length+1);
  });

  bench('immutable - immutable update', function() {
    immutableMap = immutableMap.set(data.length+1, {});
    assert.equal(immutableMap.length, data.length+1);
  });

  bench('immutable - withMutations', function() {
    immutableMap = immutableMap.withMutations(function(map) {
      map.set(data.length+1, {});
    });
    assert.equal(immutableMap.length, data.length+1);
  });
});

suite('Immutable Map - Multiple Updates', function() {
  var data, idMap, updates, updateOffset, moriMap, immutableMap;
  before(function() {
    data = helpers.makeData();
    idMap = {};
    for (var ix = 0; ix < data.length; ix++) {
      idMap[ix] = data[ix];
    }
    moriMap = mori.hash_map();
    for (var ix = 0; ix < data.length; ix++) {
      moriMap = mori.assoc(moriMap, ix, data[ix]);
    }
    immutableMap = Immutable.Map(idMap);

    updates = helpers.makeData(Math.floor(data.length / 4));
    updateOffset = data.length;
  });

  bench('mori', function() {
    for (var ix = 0; ix < updates.length; ix++) {
      moriMap = mori.assoc(moriMap, ix+updateOffset, {});
    }
    assert.equal(mori.count(moriMap), data.length + updates.length);
  });

  bench('immutable - immutable update', function() {
    for (var ix = 0; ix < updates.length; ix++) {
      immutableMap = immutableMap.set(ix+updateOffset, {});
    }
    assert.equal(immutableMap.length, data.length + updates.length);
  });

  bench('immutable - withMutations', function() {
    immutableMap = immutableMap.withMutations(function(map) {
      for (var ix = 0; ix < updates.length; ix++) {
        map = map.set(ix+updateOffset, {});
      }
    });
    assert.equal(immutableMap.length, data.length + updates.length);
  });
});
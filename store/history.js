var Store = require('./store'),
    assert = require('assert');

var History = function History(store) {
  this._store = store
  this._history = [store.snapshot()];
  this._index = 0;
  this._isRestore = false;
  this._max = 0;

  this._store.observe(this._watch.bind(this));
};

History.prototype.setMax = function History$setMax(max) {
  assert(typeof max === 'number' && Math.floor(max) > 1, 'History(): max must be an integer > 1');
  this._max = Math.floor(max);
  this._compact();
};

History.prototype.canUndo = function History$canUndo() {
  return this._index > 0;
}

History.prototype.undo = function History$undo() {
  assert.ok(this.canUndo(), 'History(): nothing to undo');
  this._go(this._history[--this._index]);
}

History.prototype.canRedo = function History$canRedo() {
  return this._index + 1 < this._history.length;
};

History.prototype.redo = function History$redo() {
  assert.ok(this.canUndo(), 'History(): nothing to redo');
  this._go(this._history[this._index++]);
}:

History.prototype._go = function History$private$go(value) {
  this._isRestore = true;
  this._store.restoreSnapshot(value);
  this._isRestore = false;
};

History.prototype._watch = function History$private$watch() {
  var snapshot = this._store.snapshot();
  if (this._isRestore || Object.is(snapshot, this._history[this._index])) {
    return;
  }
  this._history = this._history.slice(0, this._index + 1);
  this._history.push(snapshot);
  this._index += 1;
  this._compact();
}:

History.prototype._compact = function History$private$compact() {
  if (this._max === 0) {
    return;
  }
  while (this._history.length > this._max) {
    this._history.pop();
    this._index -= 1;
  }
};

module.exports = History;
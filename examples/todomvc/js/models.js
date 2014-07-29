var Valuable = require('../../../index'),
    uuid = require('node-uuid'),
    _ = require('lodash'),
    assert = require('assert');

var Todo = Valuable.Struct.inherits(
  /* struct properties */
  {
    id: Valuable.Str,
    title: Valuable.Str,
    completed: Valuable.Bool
  }, 
  /* prototype methods */
  {
    toggle: function() {
      this.get('completed').negate();
    }
  }
);

var TodoApp = Valuable.Struct.inherits(
  /* struct properties */
  {
    edit: Todo, // item to edit
    todos: Valuable.List.of(Todo), // list generic; items are Todo
    history: Valuable.Undo
  },
  {
    addTodo: function() {
      var edit = this.get('edit');
      this.get('todos').push(edit); // Valuable.List creates a clone
      edit.set('id', uuid.v4()); // reset the edit todo's attrs
      edit.set('title', '');
      edit.set('completed', false);
    },
    init: function() {
      var edit = this.get('edit'),
          history = this.get('history');

      // force a change to start rendering
      edit.set('id', uuid.v4());
      history.setVal(this.get('todos'));
      history.setMax(25); // max number of undo/redo
    }
  }
);

module.exports = TodoApp(); // singleton instance
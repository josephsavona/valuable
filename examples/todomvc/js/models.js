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
    todos: Valuable.List.of(Todo) // list generic; items are Todo
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
      // force a change to start rendering
      this.get('edit').set('id', uuid.v4());
    }
  }
);

module.exports = TodoApp(); // singleton instance
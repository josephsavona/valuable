var Valuable = require('../../../index'),
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

// custom list with specified item type
var TodoList = Valuable.List.of(Todo);

module.exports = {
  Todo: Todo,
  TodoList: TodoList
};
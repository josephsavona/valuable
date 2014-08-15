/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    React = require('react');

var TodoItem = React.createClass({
  _toggleTodo: function() {
    var todo = this.props.todo;
    todo.isCompleted.negate();
    TodoStore.commit(todo);
  },
  shouldComponentUpdate: function(newProps, newState) {
    return !TodoStore.is(newProps.todo, this.props.todo);
  },
  render: function() {
    var todo = this.props.todo;
    return (
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.isCompleted.val} 
          onClick={this._toggleTodo} />
        <label>
          {todo.title.val}
        </label>
      </div>
    );
  }
});

module.exports = TodoItem;
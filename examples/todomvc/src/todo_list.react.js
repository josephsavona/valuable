/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    TodoItem = require('./todo_item.react'),
    React = require('react');

var TodoList = React.createClass({
  getInitialState: function() {
    return this._fetch();
  },
  _observe: function() {
    this.setState(this._fetch());
  },
  _fetch: function() {
    return {
      settings: TodoStore.get('settings', 'settings'),
      todos: TodoStore.get('todos'),
    };
  },
  componentDidMount: function() {
    TodoStore.observe(this._observe);
  },
  componentWillUnmount: function() {
    TodoStore.unobserve(this._observe);
  },
  shouldComponentUpdate: function(newProps, newState) {
    // lightweight wrapper for object equality check
    return !TodoStore.is(newState.settings, this.state.settings) ||
      !TodoStore.is(newState.todos, this.state.todos);
  },
  render: function TodoList$render() {
    var settings = this.state.settings;
    var todos = this.state.todos;
    if (settings.filter.ne(TodoStore.constants.ALL)) {
      todos = todos.filter(function(todo) {
        return todo.isCompleted.eq(
          settings.filter.eq(TodoStore.constants.COMPLETED) ? true : false
        )
      });
    }
    return (
      <ul id="todo-list">
        {todos.transform(function(todo) {
          return (
            <li key={todo.cid}>
              <TodoItem todo={todo} />
            </li>
          );
        })}
      </ul>
    );
  }
});

module.exports = TodoList;
/* @jsx React.DOM */
var React = require('react'),
    TodoEntry = require('./todo_entry.react')
    TodoList = require('./todo_list.react');

var TodoApp = React.createClass({
  render: function TodoApp$render() {
    return (
      <div id="main">
        <TodoEntry />
        <TodoList />
      </div>
    );
  }
});

module.exports = TodoApp;


/* @jsx React.DOM */
var React = require('react'),
    TodoEntry = require('./todo_entry.react')
    TodoList = require('./todo_list.react'),
    TodoFooter = require('./todo_footer.react');

var TodoApp = React.createClass({
  render: function TodoApp$render() {
    return (
      <div>
        <TodoEntry />
        <TodoList />
        <TodoFooter />
      </div>
    );
  }
});

module.exports = TodoApp;


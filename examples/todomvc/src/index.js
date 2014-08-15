var React = require('react'),
    TodoApp = require('./todo_app.react');

React.renderComponent(
  TodoApp(),
  document.getElementById('todoapp')
);
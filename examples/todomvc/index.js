var React = require('react'),
    TodoApp = require('./src/todo_app.react');

React.renderComponent(
  TodoApp(),
  document.getElementById('todoapp')
);

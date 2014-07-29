/* @jsx React.DOM */
var uuid = require('node-uuid'),
    React = require('react'),
    TodoApp = require('./js/models');

var TodoView = React.createClass({
  addTodo: function(event) {
    event.preventDefault();
    this.props.app.addTodo();
  },
  shouldComponentUpdate: function(newProps) {
    // val is an immutable representation of the app state:
    // if its the same object, nothing changed
    return newProps.appVal !== this.props.appVal;
  },
  render: function() {
    var edit = this.props.app.get('edit'),
        todos = this.props.app.get('todos'),
        history = this.props.app.get('history');
    return (
      <div id="main">
        <form id="newtodo" onSubmit={this.addTodo}>
          <input className="edit" type="text" placeholder="Add todo" autoFocus
            value={edit.get('title').val()}
            onChange={edit.get('title').handleChange()} />
        </form>
        <ul id="todo-list">
          {todos.map(function(todo) {
            return (
              <li key={todo.val('id')} onClick={todo.toggle.bind(todo)}>
                <div className="view">
                  <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.val('completed')}
                    onChange={todo.toggle.bind(todo)} />
                  <label>
                    {todo.val('title')}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        {history.canUndo() ? <button type="button" onClick={history.undo.bind(history)}>Undo</button> : null}
        {history.canRedo() ? <button type="button" onClick={history.redo.bind(history)}>Redo</button> : null}
      </div>
    );
  }
});

window.React = React;
TodoApp.observe(function(val) {
  React.renderComponent(TodoView({
    app: TodoApp,
    appVal: val
  }), document.getElementById('todoapp'));
});
TodoApp.init(); // force a change to start rendering

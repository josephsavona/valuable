/* @jsx React.DOM */
var uuid = require('node-uuid'),
    React = require('react'),
    models = require('./js/models');

var todoList = models.TodoList([]);

var TodoView = React.createClass({
  getInitialState: function() {
    return {
      todos: todoList,
      todo: models.Todo({
        id: uuid.v4()
      })
    };
  },
  componentDidMount: function() {
    this.observer = function() {
      this.setState({
        todos: this.state.todos,
        todo: this.state.todo
      });
    }.bind(this);
    this.state.todos.observe(this.observer);
    this.state.todo.observe(this.observer);
  },
  componentWillUnmount: function() {
    this.state.todos.unobserve(this.observer);
    this.state.todo.unobserve(this.observer);
  },
  addTodo: function(event) {
    event.preventDefault();
    this.state.todos.push(this.state.todo);
    this.state.todo.set('id', uuid.v4());
    this.state.todo.set('title', '');
  },
  render: function() {
    console.log(this.state.todos.val());
    return (
      <div id="main">
        <form id="newtodo" onSubmit={this.addTodo}>
          <input className="edit" type="text" value={this.state.todo.get('title').val()} onChange={this.state.todo.get('title').handleChange()} placeholder="Add todo" autoFocus />
        </form>
        <ul id="todo-list">
          {this.state.todos.map(function(todo) {
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
      </div>
    );
  }
});

window.React = React;
React.renderComponent(TodoView(), document.getElementById('todoapp'));

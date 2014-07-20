/* @jsx React.DOM */
var Valuable = require('../../index'),
    uuid = require('node-uuid'),
    React = require('react');

var Todo = Valuable.inherits(Valuable.Struct, function Todo(){}, {
  toggle: function() {
    this.get('completed').negate()
  },
  properties: {
    id: Valuable.Str,
    title: Valuable.Str,
    completed: Valuable.Bool
  }
});

var TodoList = Valuable.inherits(Valuable.List, function TodoList(){}, {
  push: function(item) {
    var todo = Todo(item);
    Valuable.List.prototype.push.call(this, todo);
  },
  unshift: function(item) {
    var todo = Todo(item);
    Valuable.List.prototype.unshift.call(this, todo);
  },
  set: function(index, item) {
    var todo = Todo(item);
    Valuable.List.prototype.set.call(index, todo);
  }
});
// empty todo list
var todoList = TodoList([]);

var TodoView = React.createClass({
  getInitialState: function() {
    return {
      todos: todoList,
      todo: ''
    };
  },
  componentDidMount: function() {
    this.observer = function() {
      this.setState({
        todos: todoList
      });
    }.bind(this);
    todoList.observe(this.observer);
  },
  componentWillUnmount: function() {
    todoList.unobserve(this.observer);
  },
  addTodo: function(event) {
    event.preventDefault();
    this.state.todos.push({
      id: uuid.v4(),
      title: this.state.todo,
      completed: false
    });
    this.setState({
      todo: ''
    });
  },
  onTodoChange: function(event) {
    this.setState({
      todo: event.target.value
    });
  },
  render: function() {
    console.log(this.state.todos.val());
    return (
      <div id="main">
        <form id="newtodo" onSubmit={this.addTodo}>
          <input className="edit" type="text" value={this.state.todo} onChange={this.onTodoChange} placeholder="Add todo" autoFocus />
        </form>
        <ul>
          {this.state.todos.map(function(todo) {
            return (<li key={todo.val('id')} onClick={todo.toggle.bind(todo)}>{todo.val('title')}</li>);
          })}
        </ul>
      </div>
    );
  }
});

window.React = React;
React.renderComponent(TodoView(), document.getElementById('todoapp'));

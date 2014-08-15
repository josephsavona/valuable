/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    TodoItem = require('./todo_item.react'),
    React = require('react');

var TodoList = React.createClass({
  getInitialState: function() {
    return {
      todos: TodoStore.get('todos')
    }
  },
  _fetchData: function() {
    this.setState({
      todos: TodoStore.get('todos') // .filter(this._filterTodos) // to get a subset based on eg this.state
    });
  },
  componentDidMount: function() {
    TodoStore.observe(this._fetchData);
  },
  componentWillUnmount: function() {
    TodoStore.unobserve(this._fetchData);
  },
  // shouldComponentUpdate: function(newProps, newState) {
  //   return TodoStore.is(newState.todos, this.state.todos);
  // },
  render: function TodoList$render() {
    var todos = this.state.todos;
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
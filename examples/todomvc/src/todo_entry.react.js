/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    React = require('react');

var TodoEntry = React.createClass({
  _submitTodo: function(event) {
    event.preventDefault();
    var todo = this.state.todo;
    TodoStore.commit(todo);
    todo.title.val = '';
    todo.id = null;
  },
  shouldComponentUpdate: function(newProps, newState) {
    return !TodoStore.is(newState.todo, this.state.todo);
  },
  getInitialState: function() {
    return {
      todo: TodoStore.create('todos')
    };
  },
  componentDidMount: function() {
    this.state.todo.observe(this.forceUpdate.bind(this));
  },
  componentWillUnmount: function() {
    this.state.todo.unobserve(this.forceUpdate.bind(this));
  },
  render: function TodoEntry$render() {
    var todo = this.state.todo;
    return (
      <form id="newtodo" onSubmit={this._submitTodo}>
        <input className="edit" type="text" placeholder="Add todo" autoFocus
          value={todo.title.val}
          onChange={todo.title.handleChange()} />
      </form>
    );
  }
});

module.exports = TodoEntry;
/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    React = require('react');

var TodoEntry = React.createClass({
  getInitialState: function() {
    return {
      todo: TodoStore.create('todos')
    };
  },
  _observe: function() {
    this.forceUpdate();
  },
  _onKeyDown: function(event) {
    if (event.keyCode === 13 /* enter */) {
      this._submitTodo();
    }
  },
  _submitTodo: function() {
    TodoStore.commit(this.state.todo);
    this.state.todo.set({
      title: '',
      id: '',
    });
  },
  componentDidMount: function() {
    this.state.todo.observe(this._observe);
  },
  componentWillUnmount: function() {
    this.state.todo.unobserve(this._observe);
  },
  shouldComponentUpdate: function(newProps, newState) {
    // lightweight wrapper for object equality check
    return !TodoStore.is(newState.todo, this.state.todo);
  },
  render: function TodoEntry$render() {
    var todo = this.state.todo;
    return (
      <header id="header">
        <h1>todos</h1>
        <input id="new-todo" placeholder="What needs to be done?" autoFocus
          value={todo.title.val}
          onKeyDown={this._onKeyDown}
          onChange={todo.title.handleChange()} />
      </header>
    );
  }
});

module.exports = TodoEntry;
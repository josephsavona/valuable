/* @jsx React.DOM */
var TodoStore = require('./todo_store'),
    constants = TodoStore.constants,
    React = require('react');

var TodoFooter = React.createClass({
  getInitialState: function() {
    return this._fetch();
  },
  _observe: function() {
    this.setState(this._fetch());
  },
  _fetch: function() {
    return {
      settings: TodoStore.get('settings', 'settings'), // hack: singletons
      todos: TodoStore.get('todos'),
    };
  },
  _selectFilter: function(filter, event) {
    this.state.settings.filter.val = filter;
    TodoStore.commit(this.state.settings);
    this.state.settings.filter.val = ''; // hack: make different for shouldComponentUpdate
  },
  componentDidMount: function() {
    TodoStore.observe(this._observe);
  },
  componentWillUnmount: function() {
    TodoStore.unobserve(this._observe);
  },
  shouldComponentUpdate: function(newProps, newState) {
    // lightweight wrapper for object equality check
    return !TodoStore.is(newState.settings, this.state.settings) ||
      !TodoStore.is(newState.todos, this.state.todos);
  },
  render: function TodoFooter$render() {
    var settings = this.state.settings;
    var todos = this.state.todos;
    if (settings.filter.ne(TodoStore.constants.ALL)) {
      todos = todos.filter(function(todo) {
        return todo.isCompleted.eq(
          settings.filter.eq(TodoStore.constants.COMPLETED) ? true : false
        )
      });
    }
    return (
      <footer id="footer" style={{display: "block"}}>
        <span id="todo-count">
          <strong>{todos.size()}</strong>{' '}<span>item(s) left</span>
        </span>
        <ul id="filters">
          <li>
            <a className={[settings.filter.eq(constants.ALL) && "selected"]}
              href="#"
              onClick={this._selectFilter.bind(this, constants.ALL)}>
              All
            </a>
          </li>
          <li>
            <a className={[settings.filter.eq(constants.ACTIVE) && "selected"]}
              href="#"
              onClick={this._selectFilter.bind(this, constants.ACTIVE)}>
              Active
            </a>
          </li>
          <li>
            <a className={[settings.filter.eq(constants.COMPLETED) && "selected"]}
              href="#"
              onClick={this._selectFilter.bind(this, constants.COMPLETED)}>
              Completed
            </a>
          </li>
        </ul>
      </footer>
    );
  }
});

module.exports = TodoFooter;

var Store = require('../../../index');

var TodoStore = new Store({
  todos: {
    title: Store.Str,
    isCompleted: Store.Bool
  }
});

module.exports = TodoStore;
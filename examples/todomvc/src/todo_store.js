var Store = require('../../../index');

var TodoStore = new Store({
  todos: {
    title: Store.Str,
    isCompleted: Store.Bool,
  },
  settings: {
    filter: Store.Str,
  },
});

TodoStore.constants = {
  ALL: 'ALL',
  COMPLETED: 'COMPLETED',
  ACTIVE: 'ACTIVE',
};

// initialize settings as fake singleton
var settings = TodoStore.create('settings', {
  id: 'settings',
  filter: TodoStore.constants.ALL,
});
TodoStore.commit(settings);

module.exports = TodoStore;
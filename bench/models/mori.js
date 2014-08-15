var mori = require('mori'),
    uuid = require('node-uuid');

module.exports.init = function(properties) {
  var store = mori.hash_map();
  for (var key in properties) {
    if (properties.hasOwnProperty(key)) {
      store = mori.assoc(store, key, mori.hash_map());
    }
  }
  return store;
};

module.exports.commit = function(store, data) {
  var length = data.length,
      collection,
      model,
      path,
      id,
      index;
  for (index = 0; index < length; index++) {
    model = data[index];
    path = model._path || 'models';
    id = model.id || uuid.v4();
    model.id = id;
    collection = mori.get(store, path);
    collection = mori.assoc(collection, id, model);
    store = mori.assoc(store, path, collection);
  }
  return store;
};
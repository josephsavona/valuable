var _ = require('lodash'),
    helpers = require('./helpers'),
    backbone = require('./models/backbone'),
    valuable = require('./models/valuable'),
    store = require('./models/store');

suite('Create & Update Collection', function() {
  var data, backboneData, valuableData, storeData, updateIndex;

  before(function() {
    data = helpers.makeData();
    backboneData = _.cloneDeep(data);
    valuableData = _.cloneDeep(data);
    storeData = _.cloneDeep(data);
    updateIndex = Math.floor(data.length / 2);
  });

  bench('native', function() {
    var models = _.cloneDeep(data);
    models[updateIndex].label = 'changed';
    models[updateIndex].id = _.uniqueId('item');
    models.push({
      id: _.uniqueId('item'),
      label: 'new item'
    });
    return models[updateIndex].label;
  });

  bench('backbone', function() {
    var models = new backbone.Collection(backboneData);
    models.at(updateIndex).set('label', 'changed');
    models.at(updateIndex).set('id', _.uniqueId('item'));
    models.push({
      id: _.uniqueId('item'),
      label: 'new item'
    });
    return models.at(updateIndex).get('label');
  });

  bench('valuable', function() {
    var models = new valuable.Collection(valuableData);
    models.at(updateIndex).set('label', 'changed!');
    models.at(updateIndex).set('id', _.uniqueId('item'));
    models.push({
      id: _.uniqueId('item'),
      label: 'new item'
    });
    return models.at(updateIndex).val('label');
  });

  bench('store', function() {
    var app = store.app,
        models = app.models;
    storeData.forEach(function(item) {
      models.add(models.factory(item))
    });
    app.commit(models);
    return app.models.get(updateIndex).label.val;
  });
});
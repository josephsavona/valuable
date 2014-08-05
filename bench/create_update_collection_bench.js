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
    models[updateIndex].key = _.uniqueId('item');
    models.push({
      key: _.uniqueId('item'),
      label: 'new item'
    });
    return models[updateIndex].label;
  });

  bench('backbone', function() {
    var models = new backbone.Collection(backboneData);
    models.at(updateIndex).set('label', 'changed');
    models.at(updateIndex).set('key', _.uniqueId('item'));
    models.push({
      key: _.uniqueId('item'),
      label: 'new item'
    });
    return models.at(updateIndex).get('label');
  });

  bench('valuable', function() {
    var models = new valuable.Collection(valuableData);
    models.at(updateIndex).set('label', 'changed!');
    models.at(updateIndex).set('key', _.uniqueId('item'));
    models.push({
      key: _.uniqueId('item'),
      label: 'new item'
    });
    return models.at(updateIndex).val('label');
  });

  bench('store', function() {
    var app = store.app,
        models = [],
        update,
        add;
    storeData.forEach(function(item) {
      models.push(app.create('models', item));
    });
    app.commit(models);

    update = app.get('models').get(updateIndex).forEdit();
    update.set({
      label: 'changed!',
      key: _.uniqueId('item')
    });
    add = app.create('models', {
      key: _.uniqueId('item'),
      label: 'new item'
    });

    app.commit(update, add);

    return app.get('models').first().label.val;
  });
});
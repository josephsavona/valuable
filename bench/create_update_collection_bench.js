var _ = require('lodash'),
    helpers = require('./helpers'),
    backbone = require('./models/backbone'),
    valuable = require('./models/valuable'),
    store = require('./models/store'),
    mori = require('./models/mori');

suite('Create & Update Collection', function() {
  var data, backboneData, valuableData, storeData, moriData, updateIndex;

  before(function() {
    data = helpers.makeData(100);
    backboneData = _.cloneDeep(data);
    valuableData = _.cloneDeep(data);
    storeData = _.cloneDeep(data);
    moriData = _.cloneDeep(data);
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

  bench('mori', function() {
    var app = store.app,
        source = mori.init();
    for (var ix = 0; ix < moriData.length; ix++) {
      moriData[ix] = app.create('models', moriData[ix]);
    }
    source = mori.commit(source, moriData);
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
    for (var ix = 0; ix < storeData.length; ix++) {
      storeData[ix] = app.create('models', storeData[ix]);
    }
    app.commit(storeData);

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
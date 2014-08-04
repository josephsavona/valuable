var _ = require('lodash'),
    helpers = require('./helpers'),
    backbone = require('./models/backbone'),
    valuable = require('./models/valuable'),
    store = require('./models/store');

suite('Create & Update Model', function() {
  bench('native', function() {
    var model = {};
    model.label = 'new item';
    model.key = 1;
    return model.label;
  });

  bench('backbone - set(k,v)', function() {
    var model = new backbone.Model();
    model.set('label', 'changed');
    model.set('key', _.uniqueId('item'));
    return model.get('label');
  });

  bench('backbone - set({})', function() {
    var model = new backbone.Model();
    model.set({
      label: 'changed',
      key: _.uniqueId('item')
    });
    return model.get('label');
  });

  bench('valuable', function() {
    var model = new valuable.Model();
    model.set('label', 'changed!');
    model.set('key', _.uniqueId('item'));
    return model.val('label');
  });

  bench('store - set(k,v)', function() {
    var model = store.app.create('models', {}).forEdit();
    model.label.val = 'changed';
    model.key.val = _.uniqueId('item');
    return model.label.val;
  });

  bench('store - set({})', function() {
    var model = store.app.create('models', {}).forEdit();
    model.set({
      label: 'changed',
      key: _.uniqueId('item')
    });
    return model.label.val;
  });
});
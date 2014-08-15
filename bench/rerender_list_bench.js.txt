var helpers = require('./helpers');
helpers.setupDom();

var React = require('react');
var Benchmark = require('benchmark');
var _ = require('lodash');

var backbone = require('./backbone_samples');
var valuable = require('./valuable_samples');
var store = require('./store_samples');

var initializeState = [];
var length = 50;
var updateIndex = Math.floor(length/2);
for (var ix = 0; ix < length; ix++) {
  initializeState.push({
    id: _.uniqueId('item'),
    label: 'list item ' + ix
  });
}
var initialStateBackbone = _.cloneDeep(initializeState);
var initialStateValuable = _.cloneDeep(initializeState);
var initialStateStore = _.cloneDeep(initializeState);

new Benchmark.Suite('List Rendering with Update')
.add('Backbone', {
  fn: function() {
    var models = new backbone.Collection(initialStateBackbone);
    // React.renderComponent(backbone.ListView({models: models}), document.body);
    models.at(updateIndex).set('label', 'changed!');
    // React.renderComponent(backbone.ListView({models: models}), document.body);
    return models.models[updateIndex].attributes.label;
  },
  // setup: helpers.setupDom,
  // teardown: helpers.teardownDom,
  // minSamples: 20
})
.add('Valuable', {
  fn: function() {
    var models = valuable.Collection(initialStateValuable);
    // React.renderComponent(valuable.ListView({models: models}), document.body);
    models.at(updateIndex).set('label', 'changed!');
    // React.renderComponent(valuable.ListView({models: models}), document.body);
    return models.val()[updateIndex].label;
  },
  // setup: helpers.setupDom,
  // teardown: helpers.teardownDom,
  // minSamples: 20
})
.add('Store', {
  fn: function() {
    var models = store.app.models;
    initialStateStore.forEach(function(m) { models.add(store.app.models.factory(m))});
    store.app.commit(models);
    var m = store.app.models.get(updateIndex);
    m.label.val = 'changed';
    return store.app.models.val()[updateIndex].label;
  }
})
.on('error', function(err) {
  console.log('ERROR');
  console.log(err.target.error.stack);
})
.on('complete', function() {
  console.log(this.name);
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
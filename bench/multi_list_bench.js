var helpers = require('./helpers');
helpers.setupDom();

var React = require('react');
var Benchmark = require('benchmark');
var _ = require('lodash');

var backbone = require('./backbone_samples');
var valuable = require('./valuable_samples');

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

new Benchmark.Suite('Multiple List Updates')
.add('Backbone', {
  fn: function() {
    var models = new backbone.Collection(initialStateBackbone);
    models.at(updateIndex).set('label', 'changed!');
    models.at(updateIndex).set('id', _.uniqueId('item'));
    models.push({
      id: _.uniqueId('item'),
      label: 'new item'
    });
    return models.models[updateIndex].attributes.label;
  }
})
.add('Valuable', {
  fn: function() {
    var models = valuable.Collection(initialStateValuable);
    models.at(updateIndex).set('label', 'changed!');
    models.at(updateIndex).set('id', _.uniqueId('item'));
    models.push({
      id: _.uniqueId('item'),
      label: 'new item'
    });
    return models.val()[updateIndex].label;
  }
})
.on('error', function(err) {
  console.log('ERROR');
  console.log(err.target.error.stack);
})
// .on('cycle', function(event) {
//   console.log(String(event.target));
// })
.on('complete', function() {
  console.log(this.name);
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
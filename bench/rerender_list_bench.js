var Valuable = require('../index'),
    _ = require('lodash'),
    React = require('react'),
    Backbone = require('backbone'),
    Benchmark = require('benchmark');

var BModel = Backbone.Model.extend({
  initialize: function() {}
});

var BCollection = Backbone.Collection.extend({
  model: BModel
});

var VModel = Valuable.Struct.schema({
  label: Valuable.Str,
  id: Valuable.Str
});

var VCollection = Valuable.List.of(VModel);

var BItemView = React.createClass({
  render: function() {
    return React.DOM.div({}, this.props.model.get('label'));
  }
});

var BListView = React.createClass({
  render: function() {
    return React.DOM.div({},
      this.props.models.map(function(model) {
        return ItemView({model: model});
      })
    );
  }
});

var VItemView = React.createClass({
  render: function() {
    return React.DOM.div({}, this.props.model.get('label'));
  },
  shouldComponentUpdate: function(newProps) {
    return newProps.model !== this.props.model;
  }
});

var VListView = React.createClass({
  render: function() {
    return React.DOM.div({},
      this.props.models.map(function(model) {
        return ItemView({model: model});
      })
    );
  },
  shouldComponentUpdate: function(newProps) {
    return newProps.models !== this.props.models;
  }
});

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

new Benchmark.Suite('List Rendering with Update')
.add('Backbone', function() {
  var models = new BCollection(initialStateBackbone);
  models.at(updateIndex).set('label', 'changed!');
  return models.models[updateIndex].attributes.label;
}, {
  minSamples: 200
})
.add('Valuable', function() {
  var models = VCollection(initialStateValuable);
  models.at(Math.floor(length/2)).set('label', 'changed!');
  return models.val()[updateIndex].label;
}, {
  minSamples: 200
})
.on('complete', function() {
  console.log(this.name);
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
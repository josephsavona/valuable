var Backbone = require('backbone'),
    React = require('react');

var Model = module.exports.Model = Backbone.Model.extend({
  initialize: function() {}
});

var Collection = module.exports.Collection = Backbone.Collection.extend({
  model: Model
});

var ItemView = module.exports.ItemView = React.createClass({
  render: function() {
    return React.DOM.div({}, this.props.model.get('label'));
  }
});

var ListView = module.exports.ListView = React.createClass({
  render: function() {
    return React.DOM.div({},
      this.props.models.map(function(model) {
        return ItemView({key: model.cid, model: model});
      })
    );
  }
});
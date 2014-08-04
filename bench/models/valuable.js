var Valuable = require('../../index'),
    React = require('react');

var Model = module.exports.Model = Valuable.Struct.schema({
  label: Valuable.Str,
  key: Valuable.Str
});

var Collection = module.exports.Collection = Valuable.List.of(Model);

var ItemView = module.exports.ItemView = React.createClass({
  render: function() {
    return React.DOM.div({}, this.props.model.get('label'));
  },
  shouldComponentUpdate: function(newProps) {
    return newProps.model !== this.props.model;
  }
});

var ListView = module.exports.ListView = React.createClass({
  render: function() {
    return React.DOM.div({},
      this.props.models.map(function(model) {
        return ItemView({key: model.val('key'), model: model});
      })
    );
  },
  shouldComponentUpdate: function(newProps) {
    return newProps.models !== this.props.models;
  }
});
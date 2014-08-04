var Store = require('../../store/store'),
    Model = require('../../store/model'),
    React = require('react');

var app = module.exports.app = new Store({
  models: {
    label: Model.Str,
    key: Model.Str
  }
});

var ItemView = module.exports.ItemView = React.createClass({
  render: function() {
    return React.DOM.div({}, this.props.model.label.val);
  }
});

var ListView = module.exports.ListView = React.createClass({
  render: function() {
    return React.DOM.div({},
      this.props.models.map(function(model) {
        return ItemView({key: model.cid.val, model: model});
      })
    );
  }
});
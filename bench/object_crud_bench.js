var Valuable = require('../index'),
    Backbone = require('backbone'),
    Benchmark = require('benchmark');

var BModel = Backbone.Model.extend({
  initialize: function() {}
});

var BCollection = Backbone.Collection.extend({
  model: BModel
});

var VModel = Valuable.Struct.schema({
  key: Valuable.Str
});

new Benchmark.Suite()
.add('Object create modify read', function() {
  var o = {};
  o.key = 'value';
  return o.key;
})
.add('Backbone create modify read', function() {
  var o = new BModel();
  o.set('key', 'value');
  return o.get('key');
})
.add('Valuable create modify read', function() {
  var o = VModel({});
  o.set('key', 'value');
  return o.val('key');
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  // console.log(this.filter('successful'));
  console.log(this);
})
.run({ async: true })
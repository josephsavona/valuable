var Valuable = require('../index'),
    Backbone = require('backbone'),
    Benchmark = require('benchmark');

var BModel = Backbone.Model.extend({
  initialize: function() {}
});

var VModel = Valuable.Struct.schema({
  key: Valuable.Str
});

new Benchmark.Suite('Object Create-Modify-Read')
.add('Native', function() {
  var o = {};
  o.key = 'value';
  return o.key;
}, {
  minSamples: 200
})
.add('Backbone', function() {
  var o = new BModel();
  o.set('key', 'value');
  return o.get('key');
}, {
  minSamples: 200
})
.add('Valuable', function() {
  var o = VModel({});
  o.set('key', 'value');
  return o.val('key');
}, {
  minSamples: 200
})
.on('complete', function() {
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
var Valuable = require('../index'),
    Backbone = require('backbone'),
    Benchmark = require('benchmark');

var BModel = Backbone.Model.extend({
  initialize: function() {}
});

var BCollection = Backbone.Collection.extend({
  model: BModel
})

var VModel = Valuable.Struct.schema({
  key: Valuable.Str
});

var VCollection = Valuable.List.of(VModel);

new Benchmark.Suite('Nested Create-Modify-Read')
.add('Native', function() {
  var o = [{key: ''}];
  o[0].key = 'value';
  return o[0].key;
}, {
  minSamples: 200
})
.add('Backbone', function() {
  var o = new BCollection([{key: ''}]);
  o.at(0).set('key', 'value');
  return o.at(0).get('key');
}, {
  minSamples: 200
})
.add('Valuable', function() {
  var o = VCollection([{key: ''}]);
  o.at(0).set('key', 'value');
  return o.at(0).val('key');
}, {
  minSamples: 200
})
.on('complete', function() {
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
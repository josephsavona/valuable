var Valuable = require('../index'),
    Model = require('../store/model'),
    Backbone = require('backbone'),
    Benchmark = require('benchmark');

var minSamples = 200;

var BModel = Backbone.Model.extend({
  initialize: function() {}
});

var VModel = Valuable.Struct.schema({
  key: Valuable.Str
});

var SModel = Model.define({
  key: Model.Str
});

new Benchmark.Suite('Object Create-Modify-Read')
.add('Native', {
  fn: function() {
    var o = {};
    o.key = 'value';
    return o.key;
  },
  // minSamples: minSamples
})
.add('Backbone', {
  fn: function() {
    var o = new BModel();
    o.set('key', 'value');
    return o.get('key');
  },
  // minSamples: minSamples
})
.add('Valuable', {
  fn: function() {
    var o = VModel({});
    o.set('key', 'value');
    return o.val('key');
  },
  // minSamples: minSamples
})
.add('Store', {
  fn: function() {
    var o = new SModel({});
    o.key.val = 'value';
    return o.key.val;
  }
})
.on('complete', function() {
  console.log(this.name);
  this.filter('successful').forEach(function(benchmark) {
    console.log(String(benchmark));
  })
})
.run({ async: true })
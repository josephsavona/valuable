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

return;

new Benchmark.Suite()
.add('Valuable creation - boolean', function() {
  var a = Valuable(true);
})
.add('Valuable creation - string', function() {
  var a = Valuable('hello');
})
.add('Valuable creation - decimal', function() {
  var a = Valuable(1234);
})
.add('Valuable creation - list', function() {
  var a = Valuable([1,2,3]);
})
.add('Valuable creation - map', function() {
  var a = Valuable({key: true, key2: 'hello', key3: 1234});
})
.add('Valuable.List - set', function() {
  var list = Valuable([1,2,3]);
  list.set(3, 4);
})
.add('Valuable.List - push', function() {
  var list = Valuable([1,2,3]);
  list.push(4);
})
.add('Valuable.Map - set', function() {
  var map = Valuable({key: true, key2: 'hello'});
  map.set('key2', 'bye');
})
.add('Valuable.Map - add', function() {
  var map = Valuable({key: true, key2: 'hello'});
  map.set('key3', 1234);
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log(this.filter('successful').pluck('name'));
})
// run async
.run({ 'async': true });
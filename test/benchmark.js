var Valuable = require('../index'),
    Benchmark = require('benchmark'),
    suite = new Benchmark.Suite;

suite
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
  console.log(this.filter('successful'));
})
// run async
.run({ 'async': true });
var queue = [];
var processNextTick = process.nextTick;
var nextTick = function nextTick(fn) {
  queue.push(fn);
};

module.exports = {
  attach: function() {
    process.nextTick = nextTick;
  },
  detach: function() {
    process.nextTick = processNextTick;
  },
  runAll: function() {
    queue.forEach(function(fn) {
      fn();
    });
  },
  clearQueue: function() {
    queue = [];
  }
};
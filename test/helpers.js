var assert = require('chai').assert;

var queue = [];
var processNextTick = process.nextTick;
var nextTick = function nextTick(fn) {
  queue.push(fn);
};

module.exports = {
  init: function() {
    beforeEach(function() {
      Object.prototype.__DUMMY__ = 'ensure Valuable handles hacked native prototypes';
      Array.prototype.__DUMMY__ = 'ensure Valuable handles hacked native prototypes';

      // mock nextTick for control
      process.nextTick = nextTick;
      queue = [];
    });
    afterEach(function() {
      delete Object.prototype.__DUMMY__;
      delete Array.prototype.__DUMMY__;

      // replace native nextTick
      process.nextTick = processNextTick;
    });
  },
  runOneTick: function(queueCount) {
    // in future may want to verify the exact number of queued updates
    // queueCount = queueCount || 1;
    // assert.equal(queue.length, queueCount, 'only one item should ever be queued');
    queue.forEach(function(fn) {
      fn();
    });
    queue = [];
  },
  count: function() {
    return queue.length;
  }
};
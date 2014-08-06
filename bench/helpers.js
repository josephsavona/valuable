var uuid = require('node-uuid');
// var jsdom = require('jsdom');

// module.exports.setupDom = function setupDom() {
//   global.document = jsdom.jsdom();
//   global.window = document.createWindow();
//   global.navigator = window.navigator;
// };

// module.exports.teardownDom = function teardownDom() {
//   delete global.document;
//   delete global.window;
//   delete global.navigator;
// };

module.exports.makeData = function(length) {
  var _ = require('lodash');
  var initializeState = [];
  var updateIndex = Math.floor(length/2);

  length = length || 25;
  for (var ix = 0; ix < length; ix++) {
    initializeState.push({
      id: uuid.v4(),
      key: _.uniqueId('item'),
      label: 'list item ' + ix
    });
  }
  return initializeState;
};
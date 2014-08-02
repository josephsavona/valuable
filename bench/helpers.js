var jsdom = require('jsdom');

module.exports.setupDom = function setupDom() {
  global.document = jsdom.jsdom();
  global.window = document.createWindow();
  global.navigator = window.navigator;
};

module.exports.teardownDom = function teardownDom() {
  delete global.document;
  delete global.window;
  delete global.navigator;
};

module.exports.makeData = function() {
  var _ = require('lodash');
  var initializeState = [];
  var length = 50;
  var updateIndex = Math.floor(length/2);
  for (var ix = 0; ix < length; ix++) {
    initializeState.push({
      id: _.uniqueId('item'),
      label: 'list item ' + ix
    });
  }
  return initializeState;
};
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
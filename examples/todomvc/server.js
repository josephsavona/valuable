var http = require('http');
var ecstatic = require('ecstatic');

http.createServer(
  ecstatic({ root: __dirname })
).listen(8080, function() {
  console.log('Listening on :8080');
});

var http = require('http');

var decorate = require('./decorate');
var router = require('./router');

// create the server
var server = http.createServer(onrequest);
module.exports = server;

// request recieved
function onrequest(req, res) {
  // add convenience functions and access logging
  decorate(req, res);

  // check creds
  //console.dir(req.credentials);

  // route
  var route = router.match(req.urlparsed.pathname);
  if (!route) return res.notfound();

  // route it
  route.fn(req, res, route.params);
}

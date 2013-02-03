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
  if (CONFIG.creds) {
    var creds = req.credentials;
    if (!creds) return fail(res);
    if (creds.user !== CONFIG.creds.user) return setTimeout(function() { fail(res, creds); }, 3000);
    if (creds.pass !== CONFIG.creds.pass) return setTimeout(function() { fail(res, creds); }, 3000);
  }

  // route
  var route = router.match(req.urlparsed.pathname);
  if (!route) return res.notfound();

  // route it
  route.fn(req, res, route.params);
}

function fail(res, creds) {
  if (creds) console.error('user failed auth: %s', creds.user);
  res.setHeader('WWW-Authenticate', 'Basic realm="Auth Required"');
  res.writeHead(401, 'Authentication required');
  res.end();
}

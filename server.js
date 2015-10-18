var fs = require('fs');

var accesslog = require('access-log');
var easyreq = require('easyreq');
var router = require('./router');

var opts = {};
if (CONFIG.web.ssl) {
  opts.key = fs.readFileSync(CONFIG.web.key);
  opts.cert = fs.readFileSync(CONFIG.web.cert);
}

var server = CONFIG.web.ssl
           ? require('https').createServer(opts, onrequest)
           : require('http').createServer(onrequest);

module.exports = server;

// request recieved
function onrequest(req, res) {
  // add convenience functions and access logging
  accesslog(req, res, '[:endDate] :ip :method :statusCode :url (:{delta}ms)');
  easyreq(req, res);

  // check creds
  if (CONFIG.creds) {
    var creds = auth(req);
    if (!creds ||
        creds.name !== CONFIG.creds.name ||
        creds.pass !== CONFIG.creds.pass)
      return setTimeout(function() { fail(res, creds); }, 3000);
  }

  // route
  var route = router.match(req.urlparsed.pathname);
  if (!route)
    return res.notfound();

  // route it
  route.fn(req, res, route.params);
}

function fail(res, creds) {
  if (creds)
    console.error('user failed auth: %s', creds.name);
  res.setHeader('WWW-Authenticate', 'Basic realm="Auth Required"');
  res.writeHead(401, 'Authentication required');
  res.end();
}

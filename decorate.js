/**
 * add functions to the req and res object
 */

var path = require('path');
var url = require('url');

var accesslog = require('access-log');

module.exports = decorate;

function decorate(req, res) {
  accesslog(req, res);

  // parse the URL and normalize the pathname
  req.urlparsed = url.parse(req.url, true);
  req.urlparsed.pathname = path.normalize(req.urlparsed.pathname);

  // easily send a redirect
  res.redirect = function redirect(url, headers, code) {
    headers = headers || {};
    headers.Location = url;

    res.writeHead(code || 302, headers);
    res.end();
  };

  // shoot a server error
  res.error = function error(code) {
    res.statusCode = code || 500;
    res.end();
  };

  // 404 to the user, supply (true) for api
  res.notfound = function notfound(api) {
    res.statusCode = 404;
    res.end();
  };
}

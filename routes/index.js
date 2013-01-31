var _static = require('./static');

module.exports = index;

function index(req, res) {
  req.url = '/';
  req.urlparsed.pathname = '/';
  _static(req, res);
}

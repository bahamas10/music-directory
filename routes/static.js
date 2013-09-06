var path = require('path');

var sitepath = path.normalize(path.join(__dirname, '..', 'site'));
var staticroute = require('static-route')({
  autoindex: false,
  logger: function() {},
  dir: sitepath,
  tryfiles: ['index.html']
});

module.exports = _static;

function _static(req, res, params) {
  staticroute(req, res);
}

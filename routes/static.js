var path = require('path');
var filed = require('filed');
var sitepath = path.normalize(path.join(__dirname, '..', 'site'));

module.exports = _static;

function _static(req, res, params) {
  if (['HEAD', 'GET'].indexOf(req.method) === -1)
    return res.error(501);

  var filepath = path.join(sitepath, req.urlparsed.pathname);
  filed(filepath).pipe(res);
}

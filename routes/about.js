var fs = require('fs');

var ejs = require('ejs');

var templ = fs.readFileSync(__dirname + '/../templates/about.ejs').toString();
var package = require('../package.json');

module.exports = about;

function about(req, res) {
  res.end(ejs.render(templ, package));
}

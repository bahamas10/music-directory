var fs = require('fs');

var ejs = require('ejs');

var templ = fs.readFileSync(__dirname + '/../templates/system.ejs').toString();

module.exports = system;

function system(req, res) {
  var data = {
    cwd: process.cwd(),
    started: new Date(Date.now()  - process.uptime()),
    pid: process.pid,
    version: process.version
  };
  res.end(ejs.render(templ, data));
}

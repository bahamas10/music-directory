var fs = require('fs');

var ejs = require('ejs');

var templ = fs.readFileSync(__dirname + '/../templates/system.ejs').toString();
var cache = require('../lib/cache');

var started = new Date();

module.exports = system;

function system(req, res) {
  var data = {
    cwd: process.cwd(),
    started: started,
    pid: process.pid,
    cacheage: cache.lastcacherebuild,
    version: process.version
  };
  res.end(ejs.render(templ, data));
}

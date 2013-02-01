var fs = require('fs');
var path = require('path');

var sort = require('./sort');

module.exports = statall;

// stat all files in a dir and return an array
function statall(d, dosort, cb) {
  if (typeof dosort === 'function') {
    cb = dosort;
    dosort = true;
  }
  var cwd = process.cwd();
  fs.readdir(d, function(err, dir) {
    if (err) return cb(err);

    var ret = [];
    var i = 0;
    dir.forEach(function(f) {
      var fullfile = path.join(d, f);
      // the filename safe to give to the user without exposing
      // system information
      var safefile = fullfile.replace(cwd, '');
      fs.stat(fullfile, function(e, stats) {
        if (!e) {
          stats.filename = safefile;
          stats.isdir = stats.isDirectory();
          ret.push(stats);
        }
        if (++i !== dir.length) return;
        if (dosort) ret.sort(sort);
        cb(null, ret);
      });
    });
  });
}

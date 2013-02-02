var path = require('path');

var statall = require('./statall');
var sort = require('./sort');

var recentcache = exports.recentcache = [];
var songscache = exports.songscache = [];
var lastcacherebuild = exports.lastcacherebuild = null;

module.exports.buildcache = buildcache;

// create the recently added cache
function buildcache(cb) {
  console.log('building cache...');
  console.time('build cache');

  walk(process.cwd(), function(err, all) {
    var dirs = all.filter(function(a) {
      return a.isdir;
    });
    var files = all.filter(function(a) {
      return !a.isdir;
    });

    // sort the dirs by mtime
    dirs.sort(function(a, b) {
      return a.mtime > b.mtime ? -1 : 1;
    });

    // sort the files with lib/sort
    files = files.map(function(a) {
      return a.filename;
    });
    files.sort(sort.sortnames);

    exports.recentcache = dirs;
    exports.songscache = files;
    exports.lastcacherebuild = new Date();

    console.timeEnd('build cache');
    if (cb) cb();
  });
}

// taken from http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
function walk(dir, cb) {
  var cwd = process.cwd();
  var ret = [];
  statall(dir, false, function(err, list) {
    if (err) return cb(err);
    var pending = list.length;
    if (!pending) return cb(null, ret);
    list.forEach(function(stat) {
      if (stat.isdir) {
        ret.push(stat);
        walk(path.join(cwd, stat.filename), function(err, res) {
          ret = ret.concat(res);
          if (!--pending) cb(null, ret);
        });
      } else {
        ret.push(stat);
        if (!--pending) cb(null, ret);
      }
    });
  });
}

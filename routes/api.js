var path = require('path');

var statall = require('../lib/statall');
var sort = require('../lib/sort');

var recentcache = [];
var songscache = [];
buildcache();

module.exports = api;

function api(req, res, params) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  switch (params.action) {
    case 'cache': // song cache
      if (params.option === 'rebuild') {
        // rebuild the cache and do nothing else
        buildcache(function() {
          res.end();
        });
        return;
      }

      res.end(JSON.stringify(songscache));
      break;
    case 'recent': // recently added
      // give them the recently added
      var limit = +params.option || 20;
      if (params.option === 'all') limit = recentcache.length;
      var ret = recentcache.slice(0, limit);
      res.end(JSON.stringify(ret));
      break;
    default:
      res.notfound();
      break;
  }
}

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

    dirs.sort(function(a, b) {
      return a.mtime > b.mtime ? -1 : 1;
    });
    files = files.map(function(a) {
      return a.filename;
    });
    console.timeEnd('build cache');

    files.sort(sort.sortnames);

    recentcache = dirs;
    songscache = files;
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

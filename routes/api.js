var findit = require('findit');

var recentcache = [];
buildrecentcache();

module.exports = api;

function api(req, res, params) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  switch (params.action) {
    case 'recent': // recently added
      if (params.option === 'rebuild') {
        // rebuild the cache and do nothing else
        buildrecentcache(function() {
          res.end();
        });
        return;
      }

      // give them the recently added
      var limit = +params.option || 20;
      if (params.option === 'all') limit = recentcache.length;
      var ret = recentcache.slice(0, limit);
      res.end(JSON.stringify(ret));
      return;
    default:
      res.notfound();
      return;
  }
}

// create the recently added cache
function buildrecentcache(cb) {
  console.log('building recent cache...');
  console.time('build recent cache');

  var finder = findit.find('.');
  var dirs = [];

  finder.on('directory', function(dir, stat) {
    stat.filename = dir.slice(1);
    dirs.push(stat);
  });

  finder.on('end', function() {
    dirs.sort(function(a, b) {
      return a.mtime > b.mtime ? -1 : 1;
    });
    console.timeEnd('build recent cache');

    recentcache = dirs;
    if (cb) cb();
  });
}

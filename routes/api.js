var cache = require('../lib/cache');

// build the initial cache
cache.buildcache();

module.exports = api;

function api(req, res, params) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  switch (params.action) {
    case 'cache': // song cache
      switch (params.option) {
        case 'rebuild':
          // rebuild the cache and do nothing else
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          cache.buildcache(function() {
            res.end('cache rebuilt');
          });
          return;
        case 'age':
          res.end(JSON.stringify(cache.lastcacherebuild));
          return;
      }

      // no options, just give the cache
      res.end(JSON.stringify(cache.songscache));
      break;
    case 'recent': // recently added
      // give them the recently added
      var limit = +params.option || 20;
      if (params.option === 'all') limit = cache.recentcache.length;
      var ret = cache.recentcache.slice(0, limit);
      res.end(JSON.stringify(ret));
      break;
    default:
      res.notfound();
      break;
  }
}

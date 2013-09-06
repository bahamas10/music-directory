var fs = require('fs');
var path = require('path');
var util = require('util');

var ejs = require('ejs');
var mime = require('mime');
var musicmetadata = require('musicmetadata');

var statall = require('../lib/statall');
var infotemplate = fs.readFileSync(path.join(__dirname, '../templates/info.ejs'), 'utf-8');

module.exports = media;

function media(req, res) {
  // map the request to a file on the filesystem
  var reqfile = decodeURI(req.urlparsed.pathname.replace('/media', '')).replace(/%23/g, '#');
  var file = path.join(process.cwd(), reqfile);

  var art = req.urlparsed.query.art === 'true';
  var json = req.urlparsed.query.json === 'true';
  var tags = req.urlparsed.query.tags === 'true';
  var info = req.urlparsed.query.info === 'true';
  var size = req.urlparsed.query.size;

  // the user wants tags or artwork, fire up musicmetadata
  if (tags || art || info) {
    try {
      var rs = fs.createReadStream(file);
      rs.on('error', function() {
        res.error();
      });
      var parser = new musicmetadata(rs);
      parser.on('metadata', onmetadata);
    } catch (e) {
      rs.destroy();
      console.error('error opening <%s> for metadata', file);
      console.error(e);
      res.error();
      return;
    }

    // music metadata callback
    function onmetadata(metadata) {
      rs.destroy();
      metadata.request = req.urlparsed.pathname;
      metadata.basename = path.basename(req.urlparsed.pathname);
      metadata.haspicture = Object.keys(metadata.picture).length ? true : false;

      // just send the tags, no picture
      if (tags) {
        delete metadata.picture;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(metadata));
        return;
      }

      // html info in ejs format
      if (info) {
        metadata.size = +size;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(ejs.render(infotemplate, metadata));
        return;
      }

      // send the art only if present
      if (art) {
        var pic;
        try {
          pic = metadata.picture[0];
          if (!pic) throw new Error('picture not present');
        } catch (e) {
          res.notfound();
          return;
        }
        res.setHeader('Content-Type', 'image/' + (pic.format || 'xyz'));
        res.end(pic.data);
      }
    }

    return;
  }

  // the user wants some actual data
  fs.stat(file, function(err, stats) {
    if (err) {
      console.error(err.message);
      res.error();
      return;
    }

    // let's dish them the file
    if (!stats.isDirectory()) {
      var etag = '"' + stats.size + '-' + Date.parse(stats.mtime) + '"';
      res.setHeader('Last-Modified', stats.mtime);

      // check cache
      var range = req.headers.range;
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
      } else if (range) {
        var parts = range.replace(/bytes=/, '').split('-');
        var partialstart = parts[0];
        var partialend = parts[1];

        var startrange = parseInt(partialstart, 10);
        var endrange = partialend ? parseInt(partialend, 10) : stats.size - 1;
        if (!startrange)
          startrange = 0;
        if (!endrange)
          endrange = stats.size - 1;
        var chunksize = endrange - startrange + 1;

        res.statusCode = 206;
        res.setHeader('Content-Range', 'bytes ' + startrange + '-' + endrange + '/' + stats.size);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunksize);
        res.setHeader('Content-Type', mime.lookup(file));
        res.setHeader('ETag', etag);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          var rs = fs.createReadStream(file, {start: startrange, end: endrange});
          rs.pipe(res);
          res.on('close', rs.destroy.bind(rs));
        }
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', mime.lookup(file));
        res.setHeader('ETag', etag);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          var rs = fs.createReadStream(file);
          rs.pipe(res);
          res.on('close', rs.destroy.bind(rs));
        }
      }
      return;
    }

    // the user asked for a folder, show them it
    statall(file, function(e, ret) {
      if (e) return res.error();

      var s = '';
      if (json) {
        // just give the user some json
        s = JSON.stringify(ret);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else {
        // generate a pretty html page that can be navigated
        s = createprettyhtml(ret);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      res.end(s);
    });
  });
}

// given an array of stats objects, return some pretty HTML
function createprettyhtml(stats) {
  var s = '<!doctype html><html><head><link rel="stylesheet" href="/css/style.css" />';
  s += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />';
  s += '</head><body><div id="container"><div class="column">';

  var link = '<a href="%s">%s</a>\n';
  s += util.format(link, '../', '../');
  stats.forEach(function(stat) {
    var url = '/media' + stat.filename.replace(/#/g, '%23');
    var name = path.basename(stat.filename);
    if (stat.isdir) {
      url += '/';
      name += '/';
    }
    s += util.format(link, url, name);
  });

  s += '</div></div></body></html>';

  return s;
}

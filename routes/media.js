var fs = require('fs');
var path = require('path');
var util = require('util');

var mime = require('mime');
var musicmetadata = require('musicmetadata');

var articlere = /^(the|a) /;

module.exports = media;

function media(req, res) {
  // map the request to a file on the filesystem
  var reqfile = decodeURI(req.urlparsed.pathname.replace('/media', ''));
  var file = path.join(process.cwd(), reqfile);

  var tags = req.urlparsed.query.tags === 'true';
  var art = req.urlparsed.query.art === 'true';
  var json = req.urlparsed.query.json === 'true';

  // the user wants tags or artwork, fire up musicmetadata
  if (tags || art) {
    try {
      var rs = fs.createReadStream(file);
      rs.on('error', function(e) {
        res.error();
      });
      var parser = new musicmetadata(rs);
      parser.on('metadata', onmetadata);
    } catch (e) {
      console.error('error opening <%s> for metadata', file);
      console.error(e);
      res.error();
      return;
    }

    // music metadata callback
    function onmetadata(metadata) {
      // just send the tags, no picture
      if (tags) {
        delete metadata.picture;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(metadata));
        return;
      }

      // send the art only if present
      if (art) {
        try {
          var pic = metadata.picture[0];
        } catch (e) {
          res.notfound();
          return;
        }
        res.setHeader('Content-Type', 'image/' + pic.format);
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
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
      } else {
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', mime.lookup(file));
        res.setHeader('ETag', etag);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          fs.createReadStream(file).pipe(res);
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

// stat all files in a dir and return an array
function statall(d, cb) {
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
        if (++i === dir.length) {
          // sort it
          ret.sort(function(a, b) {
            // dirs above files
            if (a.isdir ^ b.isdir)
              return a.isdir ? 1 : -1;

            // sort alphabetically
            var aname = path.basename(a.filename).toLowerCase().replace(articlere, '');
            var bname = path.basename(b.filename).toLowerCase().replace(articlere, '');
            return aname < bname ? -1 : 1;
          });
          cb(null, ret);
        }
      });
    });
  });
}

// given an array of stats objects, return some pretty HTML
function createprettyhtml(stats) {
  var link = '<a href="%s">%s</a><br />\n';
  s = util.format(link, '../', '../');
  stats.forEach(function(stat) {
    var url = '/media' + stat.filename;
    var name = path.basename(stat.filename);
    if (stat.isdir) {
      url += '/';
      name += '/';
    }
    s += util.format(link, url, name);
  });
  return s;
}

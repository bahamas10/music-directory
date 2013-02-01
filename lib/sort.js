var path = require('path');

var articlere = /^(the|a) /;

module.exports = sort;

/**
 * sort an array of stats
 */
function sort(a, b) {
  // dirs above files
  if (a.isdir ^ b.isdir)
    return a.isdir ? -1 : 1;

  // sort alphabetically
  var aname = path.basename(a.filename).toLowerCase();
  var bname = path.basename(b.filename).toLowerCase();
  if (a.isdir) {
    aname = aname.replace(articlere, '');
    bname = bname.replace(articlere, '');
  }
  return aname < bname ? -1 : 1;
}

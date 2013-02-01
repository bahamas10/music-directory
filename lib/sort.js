var path = require('path');

var articlere = /^(the|a) /;

module.exports = sort;
module.exports.sortnames = sortnames;

/**
 * sort an array of stats
 */
function sort(a, b) {
  // dirs above files
  if (a.isdir ^ b.isdir)
    return a.isdir ? -1 : 1;
  return sortnames(a.filename, b.filename);
}

/**
 * sort just the names
 */
function sortnames(a, b) {
  // sort alphabetically
  var aname = a.toLowerCase();
  var bname = b.toLowerCase();

  as = aname.split('/').slice(1);
  bs = bname.split('/').slice(1);

  for (var i in as) {
    var ap = as[i];
    var bp = bs[i];

    if (!ap && bp) return -1;
    if (!bp && ap) return 1;

    if (as[i+1])
      ap = ap.replace(articlere, '');
    if (bs[i+1])
      bp = bp.replace(articlere, '');

    if (ap === bp) continue;

    return ap < bp ? -1 : 1;
  }
  return 0;
}

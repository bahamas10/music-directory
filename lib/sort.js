var articlere = /\/(the|a) /g;

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
  var aname = a.toLowerCase().replace(articlere, '/');
  var bname = b.toLowerCase().replace(articlere, '/');

  var as = aname.split('/').slice(1);
  var bs = bname.split('/').slice(1);

  for (var i in as) {
    var ap = as[i];
    var bp = bs[i];

    if (!ap && bp) return -1;
    if (!bp && ap) return 1;
    if (ap === bp) continue;

    return ap < bp ? -1 : 1;
  }
  return 0;
}

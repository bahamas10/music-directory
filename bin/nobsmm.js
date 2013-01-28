var getopt = require('posix-getopt');

var package = require('../package.json');

/**
 * Usage
 *
 * return the usage message
 */
function usage() {
  return [
    'Usage: nobsmm',
    '',
    'music',
    '',
    '-d, --dir <dir>       the music directory to expose, defaults to cwd',
    '-h, --help            print this message and exit',
    '-H, --host <host>     the host to listen on, defaults to 0.0.0.0',
    '-p, --port <port>     the port to listen on, defaults to :8080',
    '-u, --updates         check for available updates',
    '-v, --version         print the version number and exit'
  ].join('\n');
}

// command line arguments
var options = [
  'd:(dir)',
  'h(help)',
  'H:(host)',
  'p:(port)',
  'u(updates)',
  'v(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);
var host = '0.0.0.0';
var port = 8080;
var dir;
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'd': dir = option.optarg; break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': host = option.optarg; break;
    case 'p': port = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0);
    default: console.error(usage()); process.exit(1); break;
  }
}
var args = process.argv.slice(parser.optind());

// if the user supplied a dir, what better way to test its validity than by
// trying to go there
if (dir) {
  try {
    process.chdir(dir);
  } catch (e) {
    console.error(e.message);
    console.error('failed to chdir to <%s>, refusing to start', dir);
    process.exit(1);
  }
}

// let's get rollin
require('log-timestamp');

// start the server what's up
var server = require('../server');
server.listen(port, host, function() {
  console.log('server started: http://%s:%d/', host, port);
});

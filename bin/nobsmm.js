#!/usr/bin/env node
/**
 * no bullshit media
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * License: MIT
 */

var path = require('path');

var getopt = require('posix-getopt');

var package = require('../package.json');

var defaults = {
  host: '0.0.0.0',
  port: 8080
};

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
    '-c, --config <file>   optional config file to use, same as NODE_CONFIG env variable',
    '-d, --dir <dir>       the music directory to expose, defaults to cwd',
    '-h, --help            print this message and exit',
    '-H, --host <host>     the host on which to listen, defaults to ' + host,
    '-p, --port <port>     the port on which to listen, defaults to ' + port,
    '-u, --updates         check for available updates',
    '-v, --version         print the version number and exit'
  ].join('\n');
}

// grab the config if supplied
function loadconfig(c) {
  var config;
  if (c) {
    c = path.resolve(c);
    config = require(c);
  }
  if (!config) config = {};
  if (!config.web) config.web = {};

  return config;
}

// command line arguments
var options = [
  'c:(config)',
  'd:(dir)',
  'h(help)',
  'H:(host)',
  'p:(port)',
  'u(updates)',
  'v(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);
var dir;
var host;
var port;
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'c': process.env.NODE_CONFIG = option.optarg; break;
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

// load up the config and make that shit global
var config = loadconfig(process.env.NODE_CONFIG);
global.CONFIG = config;

// if the user supplied a dir, what better way to test its validity than by
// trying to go there
var dir = dir || config.music;
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
var lport = config.web.port || port || defaults.port;
var lhost = config.web.host || host || defaults.host;
server.listen(lport, lhost, function() {
  console.log('server started: http://%s:%d/', lhost, lport);
});

var configfile = process.env.NODE_CONFIG;

// try to grab the config
var config = {};
try {
  config = require(configfile);
} catch (e) {}

// load up default values if something failed
['web'].forEach(function(key) {
  if (!config.web) config.web = {};
});

module.exports = config;

music-directory
===============

Serve your music over the web with a nice UI, or as JSON

*still in beta, only tested on chrome*

![icon](/site/icon.png)

Installation
------------

First, install [Node.js][0].  Then:

    npm install -g music-directory

Usage
-----

run `md` on the command line to fire up a server on `0.0.0.0` port `8080`.

    $ md
    [2013-02-04T11:10:41.238Z] building cache...
    [2013-02-04T11:10:41.573Z] build cache: 333ms
    [2013-02-04T11:10:41.578Z] server started: http://0.0.0.0:8080/

By default, `md` will serve out of your current working directory.  the above command
will scan your current directory for music files, and build a local cache.

open a browser and navigation to [http://localhost:8080][1] to see this site in action.

    Usage: md [-d directory] [-c config]

    Serve your music over the web with a nice UI, or as JSON

    -c, --config <file>   optional config file to use, same as NODE_CONFIG env variable
    -d, --dir <dir>       the music directory to expose, defaults to cwd
    -h, --help            print this message and exit
    -H, --host <host>     the host on which to listen, defaults to 0.0.0.0
    -p, --port <port>     the port on which to listen, defaults to 8080
    -u, --updates         check for available updates
    -v, --version         print the version number and exit

Configuration
-------------

You may specify a config file to use with `-c <file>`.  Any values in this config file
will override the application defaults, but can be overridden still with command line
arguments.

You can also specify the `NODE_CONFIG` env variable instead of passing in `-c`

`config.json`
``` json
{
  "web": {
    "host": "0.0.0.0",
    "port": 8080,
    "ssl": false,
    "key": "./my.key",
    "cert": "./my.crt"
  },
  "creds": {
    "user": "dave",
    "pass": "secret"
  },
  "music": "./"
}
```

- `web.host`: the host on which to listen, defaults to `0.0.0.0`
- `web.port`: the port on which to listen, defaults to `8080`
- `web.ssl`: if this key is present and set to `true`, an SSL server will be used, defaults to `false`
- `web.key`: if ssl is enabled, this attribute should be the path to a key file
- `web.cert`: if ssl is enabled, this attribute should be the path to a cert file

- `creds`: if this key is present, authentication will be used (basic http auth)
- `creds.user`: the username to use during authentication
- `creds.pass`: the password to use during authentication

*note:* this is subject to change as a stronger form of authentication will be implemented

- `music`: the music directory from which to server, can be overridden with `-d <dir>`, and defaults to the current working directory

SSL
---

Pass in a config file with `web.ssl` set to `true` to run an SSL server instead of a standard
http server.  You can easily generate a self-signed cert/key combo with the following commands

    openssl genrsa -out my.key 4096
    openssl req -new -x509 -days 1826 -key my.key -out my.crt

These 2 commands will create `my.key` and `my.crt`, which can be passed in with the config
to fire up a secure server.

API
---

### `/`

The main page, this is nice looking HTML for scanning and playing your music

### `/api/*`

Various API calls

- `/api/cache`: get the full recursive list of files (not directories) found
- `/api/cache/age`: get the date the cache was created
- `/api/cache/rebuild`: inform the server to rebuild the cache
- `/api/recent/<num>`: grab the last `<num>` entries that have been recently modified, defaults to 20
- `/api/recent/all`: grab all entries sorted by recently modified (mtime)

### `/media/*`

Your media as it lives on the filesystem

- `/media/My Music`: generate a simple HTML index page for your directory
- `/media/My Music?json=true`: expose the directory as json
- `/media/My Music/mysong.mp3`: stream an mp3
- `/media/My Music/mysong.mp3?tags=true`: send the music tags as JSON
- `/media/My Music/mysong.mp3?art=true`: send the embedded album art if present
- `/media/My Music/mysong.mp3?info=true`: the info page as used by the UI

License
-------

MIT

[0]: http://nodejs.org
[1]: http://localhost:8080

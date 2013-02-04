music-directory
===============

Serve your music over the web with a nice UI, or as JSON

** still in beta, only tested on chrome **

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
    -H, --host <host>     the host on which to listen, defaults to undefined
    -p, --port <port>     the port on which to listen, defaults to undefined
    -u, --updates         check for available updates
    -v, --version         print the version number and exit

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

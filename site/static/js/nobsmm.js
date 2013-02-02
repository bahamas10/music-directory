var $container, $footer, $audio, $body;
var $opennowplaying;
var $pullmenu;

var viewstack = [];
var playlist = [];
var playlistpos = -1;

var footerheight = 300;

var cache = new BasicCache();

var verbose = true;

function debug() {
  if (verbose) console.log.apply(console, arguments);
}

$(document).ready(function() {
  $('.column').data('num', 0);

  $audio = $('#audio');
  $container = $('#container');
  $footer = $('#footer');
  $opennowplaying = $('#footer .open-now-playing');
  $pullmenu = $('#footer .pull-menu');
  $body = $('body');

  // override all linksss
  $container.on('click', '.column a', linkclick);
  $container.on('dblclick', '.column a', dbllinkclick);
  $container.on('touchstart', '.column a', dbllinkclick);

  // load the playlist
  $.getJSON('/api/cache', function(data) {
    playlist = data;
  });

  // load the hash
  loadlocation(window.location.hash);

  $audio.on('ended', next);
  $audio.on('error', function(e) {
    debug(e);
  });

  $pullmenu.click(function() {
    var $this = $(this);
    var isup = $this.hasClass('up');

    var opts = {height: (isup ? '+=' : '-=') + footerheight + 'px'};
    console.log(opts);
    $footer.animate(opts, 'slow', function() {
      if (isup) {
        $this.removeClass('up').addClass('down');
        $this.text('down');
      } else {
        $this.removeClass('down').addClass('up');
        $this.text('up');
      }
    });
  });
  $opennowplaying.click(function() {
    debug('right arrow');
    loadlocation($audio.attr('src'));
  });
});

// play the song on dbl click
function dbllinkclick() {
  var $this = $(this);
  var isfile = $this.attr('data-isdir') === 'false';
  if (!isfile) return;

  var href= $this.attr('href') || $this.attr('data-href');
  play(href);
}

// single click, load some stuff
function linkclick() {
  var $this = $(this);

  var href= $this.attr('href') || $this.attr('data-href');
  var isdir = $this.attr('data-isdir') === 'true';
  var isfile = $this.attr('data-isdir') === 'false';

  var $parent = $this.parent();
  var num = $parent.data('num');

  // update the window hash
  window.location.hash = href;

  // clear highlighted nodes and highlight the clicked on
  $parent.find('a').removeClass('current');
  $this.addClass('current');

  // figure out what to do with the clicked linked
  var type = isdir ? 'dir' : isfile ? 'file' : 'link';
  debug('click: %s', type);
  switch (type) {
    case 'file':
      var url = href + '?info=true';

      var data = cache.get(href);
      if (data) addcolumn(data, num);
      else $.get(url, loaddata);
      break;
    case 'dir':
      var url = href + '?json=true';

      // check the cache first
      var data = cache.get(href);
      if (data) addcolumn(data, num);
      else $.getJSON(url, loaddata);
      break;
    default:
      $.get(href, loaddata);
      break;
  }

  return false;

  // callback for async ajax reqs
  function loaddata(data) {
    var $column = createcolumn(data, type, href);
    cache.set(href, $column);
    addcolumn($column, num);
  }
}

/**
 * create a column of readdir info to pop onto the stack
 */
function createcolumn(data, type, href) {
  var $column = $(document.createElement('div'));
  $column.addClass('column');

  switch (type) {
    case 'dir':
      // loop the data and add the links
      for (var i in data) {
        var o = data[i];
        var $a = $(document.createElement('a'));
        $a.attr('data-href', '/media' + o.filename);
        $a.attr('data-isdir', o.isdir);
        $a.text(basename(o.filename));
        $a.attr('title', $a.text());
        $a.addClass('not-selectable');

        // dirs have arrows
        if (o.isdir) $a.addClass('arrow');

        $column.append($a);
      }
      // empty
      if (!data.length) {
        var $content = $(document.createElement('div'));
        $content.addClass('content');
        $content.text('(empty)');
        $column.append($content);
      }
      break;
    default:
      var $div = $(document.createElement('div'));
      $div.addClass('content');
      $div.html(data);
      $column.append($div);
      break;
  }

  var $spacer = $(document.createElement('div'));
  $spacer.addClass('spacer');
  $column.append($spacer);

  return $column;
}

/**
 * add a column div and handle the stack
 */
function addcolumn($column, num) {
  // pop off some columns from the stack
  var slice = viewstack.length - num;
  for (var i = 0; i < slice; i++) {
    var $oldcol = viewstack.pop();
    $oldcol.find('a').removeClass('current');
    debug('removing column num %d', viewstack.length + 1);
    $oldcol.remove();
  }

  // push the last column onto the stack
  viewstack.push($column);
  $column.data('num', viewstack.length);
  $container.append($column);
  scroll($column.width() * viewstack.length);
  debug('pushing num %d onto stack', viewstack.length);
}

// ghetto basename & dirname
function basename(s) {
  return s.replace(/^.*\//g, '');
}
function dirname(s) {
  return s.replace(/\/[^\/]+$/, '');
}

// load location
function loadlocation(loc) {
  if (!loc) return;
  debug('loadlocation = %s', loc);
  var parts = loc.split('/').slice(1);
  debug(parts.length);

  docolumn(0);

  function docolumn(i) {
    if (i >= parts.length || !parts[i]) return;
    debug('doculumn(%d)', i);
    var dir = parts[i];

    $('.column').eq(i).find('a').each(function() {
      var $this = $(this);
      var text = $this.text();
      if (text !== dir) return;
      debug('text = %s', dir);

      this.scrollIntoView();
      // defer action
      $this.trigger('click');
      if (!$.active) {
        return docolumn(i+1);
      } else {
        debug('ajax was active, appending an ajax stop');
        $(document).one('ajaxStop', function() {
          debug('ajaxStop for docolumn(%d)', i);
          docolumn(i+1);
        });
      }
    });
  }
}

// play a song number or url
function play(song) {
  if (typeof song === 'number')
    song = '/media' + playlist[song];
  else if (typeof song === 'string')
    playlistpos = playlist.indexOf(song.replace('/media', ''));
  else
    return;
  var songname = basename(song);
  document.title = songname
  $audio.attr('src', song);
  debug('song ' + playlistpos + ' of ' + playlist.length);
  $audio[0].pause();
  $audio[0].play();

  // get the tags and set the title
  $.getJSON(song + '?tags=true', function(data) {
    var s = '';
    if (data.title) s += data.title;
    if (data.artist.length) s = data.artist[0] + ' - ' + s;
    if (!s) s = songname;
    document.title = s;
  });
}

// prev track
function prev() {
  play(--playlistpos);
}
// next track
function next() {
  play(++playlistpos);
}

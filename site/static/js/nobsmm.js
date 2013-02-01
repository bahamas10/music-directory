var $container, $footer, $audio;
var viewstack = [];

$(document).ready(function() {
  $('.column').data('num', 0);

  $container = $('#container');
  $footer = $('#footer');
  $audio = $('#audio');

  // override all linksss
  $container.on('click', '.column a', linkclick);

  // audio html5 audio
  $footer.append($audio);
});

/**
 * when a link is clicked in the UI
 */
function linkclick() {
  var $this = $(this);

  var href= $this.attr('href');
  var isdir = $this.data('isdir');
  var json = $this.attr('data-json');
  var $parent = $this.parent();
  var num = $parent.data('num');

  window.location.hash = href

  // clear highlighted nodes and highlight the clicked on
  $parent.find('a').removeClass('current');
  $this.addClass('current');

  if (isdir === false) {
    // the link is a song or file
    $audio.attr('src', href);
    $audio[0].pause();
    $audio[0].play();
  } else if (isdir || json) {
    // request some json
    $.getJSON(href + '?json=true', loaddata);
  } else {
    // no one knows what this is, let's just get it i guess
    $.get(href, loaddata);
  }

  return false;

  // callback for async requests
  function loaddata(data) {
    var $column = createcolumn(data);
    addcolumn($column, num);
  }
}

/**
 * create a column of readdir info to pop onto the stack
 */
function createcolumn(data) {
  var $column = $(document.createElement('div'));
  $column.addClass('column');

  if (typeof data === 'string') {
    $column.html(data);
  } else {
    // loop the data and add the links
    for (var i in data) {
      var o = data[i];
      var $a = $(document.createElement('a'));
      $a.attr('href', '/media' + o.filename);
      $a.data('isdir', o.isdir);
      $a.text(basename(o.filename));
      $a.attr('title', $a.text());

      // dirs have arrows
      if (o.isdir) $a.addClass('arrow');

      $column.append($a);
      console.log('appended');
    }

    // empty
    if (!data.length) {
      var $content = $(document.createElement('div'));
      $content.addClass('content');
      $content.text('(empty)');
      $column.append($content);

    }
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
    viewstack.pop().remove();
  }

  // push the last column onto the stack
  viewstack.push($column);
  $column.data('num', viewstack.length);
  $container.append($column);
  scroll($column.width() * viewstack.length);
}

// ghetto basename
function basename(s) {
  return s.replace(/^.*\//g, '');
}

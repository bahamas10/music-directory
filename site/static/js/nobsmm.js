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
  var ispage = $this.hasClass('link');
  var $parent = $this.parent();

  // clear highlighted nodes and highlight the clicked on
  $parent.find('a').removeClass('current');
  $this.addClass('current');

  if (isdir === false) {
    // the link is a song, play it
    $audio.attr('src', href);
    $audio[0].pause();
    $audio[0].play();
    return false;
  } else if (ispage) {
    // the link is a normal link, send it through
    return true;
  }

  // the link should be treated like a directory if it makes it this far
  $.getJSON(href + '?json=true', function(data) {
    var $column = createcolumn(data);

    // pop off some columns from the stack
    var num = $parent.data('num');
    var slice = viewstack.length - num;
    for (var i = 0; i < slice; i++) {
      viewstack.pop().remove();
    }

    // push the last column onto the stack
    viewstack.push($column);
    $column.data('num', viewstack.length);
    $container.append($column);
    scroll(320);
  });

  return false;
}

/**
 * create a column of readdir info to pop onto the stack
 */
function createcolumn(data) {
  var $column = $(document.createElement('div'));
  $column.addClass('column');

  // loop the data and add the links
  for (var i in data) {
    var o = data[i];
    var $a = $(document.createElement('a'));
    $a.attr('href', '/media' + o.filename);
    $a.data('isdir', o.isdir);
    $a.text(o.filename.replace(/^.*\//g, ''));
    $a.attr('title', $a.text());
    $column.append($a);
  }

  var $spacer = $(document.createElement('div'));
  $spacer.addClass('spacer');
  $column.append($spacer);

  return $column;
}

function notify(title, content, icon) {
  if (!window.webkitNotifications) return;

  var permissions = window.webkitNotifications.checkPermission();
  if (permissions !== 0) {
    console.log('improper permissions: ' + permissions);
    window.webkitNotifications.requestPermission(notify.bind(this, arguments));
    return;
  }

  var notification = window.webkitNotifications.createNotification(icon, title, content);
  // timeout the notification
  notification.ondisplay = function(event) {
    setTimeout(function() {
      event.currentTarget.cancel();
    }, 10000);
  };
  // focus the app on click
  notification.onclick = function() {
    window.focus();
    this.cancel();
  };
  notification.show();
}

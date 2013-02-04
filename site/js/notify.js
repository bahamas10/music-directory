function notify(title, content, icon) {
  console.log(icon);
  if (!window.webkitNotifications || window.webkitNotifications.checkPermission() !== 0)
    return;

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

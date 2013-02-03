module.exports = auth;

function auth(username, password, fail_delay) {
  fail_delay || (fail_delay = 5000)
    return function(req, res, next) {
      var auth_head = req.headers.authorization
        if (auth_head && auth_head.search('Basic ') === 0) {
          var str = new Buffer(auth_head.split(' ')[1], 'base64').toString()
            , sp = str.split(":")
            , user = sp[0]
            , pass = sp[1]

            if (user === username && pass === password) {
              return next()
            }
        }
      res.setHeader('WWW-Authenticate', 'Basic realm="Private"')

        if (auth_head) {
          setTimeout(function () { deny(res) }, fail_delay)
        } else {
          deny(res)
        }
    }
}

function deny(res) {
  res.writeHead(401, 'Authentication required')
    res.end()
}

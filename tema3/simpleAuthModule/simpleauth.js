var _ = require("lodash")

strategy = {
  serializeUser: function(user) {
  },
  deserializeUser: function(userId, cb) {
  },
  checkCredentials: function(username, pass, done) {
  },
  loginRoute: "/login"
}

exports.setStrategy = function(customStrategy) {
  strategy = _.extend({}, strategy, customStrategy)
}

exports.createSession = function(options) {
  var config = {
    username: "username",
    password: "password",
    redirect: "/me",
    failRedirect: strategy.loginRoute
  }
  config = _.extend({}, config, options)
  return function(req, res, next) {
    var username = req.body[config.username],
        pass = req.body[config.password]
    strategy.checkCredentials(username, pass, function(err, user) {
      if (!err && user) {
        res.cookie("user", strategy.serializeUser(user), {signed: true, maxAge: 1000*60*60*24*7})
        res.redirect(config.redirect)
      } else {
        console.log("Credenciales incorrectas")
        res.redirect(config.failRedirect)
      }
    })
  }
}

exports.requiresSession = function(req, res, next) {
  if (req.signedCookies.user) {
    strategy.deserializeUser(req.signedCookies.user, function(user) {
      if (!user)  {
        console.log("El usuario no existe!")
        res.clearCookie("user")
        res.redirect(strategy.loginRoute)
      } else {
        req.user = user
        next()
      }
    })
  } else {
    console.log("No existe la sesión...")
    res.redirect(strategy.loginRoute)
  }
}

exports.destroySession = function(res) {
  res.clearCookie("user")
}

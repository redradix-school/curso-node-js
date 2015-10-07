function extend() {
  var args = [].slice.call(arguments)
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k] }
    return acc;
  })
}

var strategy = {
  serializeUser: function(user) {
  },
  deserializeUser: function(userId, cb) {
  },
  checkCredentials: function(username, pass, done) {
  }
}

exports.setStrategy = function(customStrategy) {
  strategy = extend({}, strategy, customStrategy)
}

exports.createSession = function(options) {
  var config = {
    username: "username",
    password: "password",
  }
  config = extend({}, config, options)
  return function(req, res, next) {
    var username = req.body[config.username],
        pass = req.body[config.password]
    strategy.checkCredentials(username, pass, function(err, user) {
      if (!err && user) {
        req.user = user
        next()
        /* res.redirect(config.redirect) */
      } else {
        console.log("Credenciales incorrectas")
        res.send(401, {error: "Username o contraseña incorrectos"})
      }
    })
  }
}

exports.requiresToken = function(req, res, next) {
  var token = req.param("token")
  if (token !== undefined) {
    strategy.deserializeUser(token, function(user) {
      if (!user)  {
        console.log("El usuario no existe!")
        res.send(401, {error: "No autorizado"})
      } else {
        req.user = user
        next()
      }
    })
  } else {
    console.log("No existe token...")
    res.send(401, {error: "No autorizado"})
  }
}

exports.withToken = function(app, cb) {
  function createAuthRouting(verb) {
    return function() {
      var route = arguments[0],
          args = [].slice.call(arguments, 1)
      return app[verb].apply(app, [route, exports.requiresToken].concat(args))
    }
  }
  var routeVerbs = Object.create(app);
  ["get", "post", "put", "delete"].forEach(function(v) {
    routeVerbs[v] = createAuthRouting(v)
  });
  cb(routeVerbs)
}

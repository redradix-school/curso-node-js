/* globals strategy, exports, console */

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

strategy = {
  serializeUser: function(user) {
  },
  deserializeUser: function(userId, cb) {
  },
  checkCredentials: function(username, pass, done) {
  },
  loginRoute: "/login"
};

exports.setStrategy = function(customStrategy) {
  strategy = extend({}, strategy, customStrategy);
};

exports.login = function(req, user) {
  req.session.user = strategy.serializeUser(user);
};

exports.createSession = function(options) {
  var config = {
    username: "username",
    password: "password",
    redirect: "/me",
    failRedirect: strategy.loginRoute
  };
  config = extend({}, config, options);
  return function(req, res, next) {
    var username = req.body[config.username],
        pass = req.body[config.password];
    strategy.checkCredentials(username, pass, function(err, user) {
      if (!err && user) {
        exports.login(req, user);
        res.redirect(config.redirect);
      } else {
        console.log("Credenciales incorrectas");
        res.redirect(config.failRedirect);
      }
    });
  };
};

exports.requiresSession = function(req, res, next) {
  if (req.session.user) {
    strategy.deserializeUser(req.session.user, function(user) {
      if (!user)  {
        console.log("El usuario no existe!");
        delete req.session.user;
        res.redirect(strategy.loginRoute);
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    console.log("No existe la sesión...");
    res.redirect(strategy.loginRoute);
  }
};

exports.destroySession = function(req, res, next) {
  delete req.session.user;
  next();
};

exports.withSession = function(app, cb) {
  function createAuthRouting(verb) {
    return function() {
      var route = arguments[0],
          args = [].slice.call(arguments, 1);
      return app[verb].apply(app, [route, exports.requiresSession].concat(args));
    };
  }
  var routeVerbs = Object.create(app);
  ["get", "post", "put", "delete"].forEach(function(v) {
    routeVerbs[v] = createAuthRouting(v);
  });
  cb(routeVerbs);
};

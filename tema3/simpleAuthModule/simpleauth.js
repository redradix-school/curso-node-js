var _ = require("lodash")

strategy = {
  serializeUser: function(user) {
  },
  deserializeUser: function(userId, cb) {
  },
  checkCredentials: function(username, pass, done) {
  },
  loginRoute: "/login.html"
}

var cookieName = 'user';

exports.setStrategy = function(customStrategy) {
  strategy = _.extend({}, strategy, customStrategy)
}

exports.createSession = function(options) {
	var defaultConfig = {
		username: "username",
		password: "password",
		redirect: '/secret',
		failRedirect: '/'
	}
	config = _.extend({}, defaultConfig, options);
	return function(req, res, next) {
		var username = req.body[config.username],
			password = req.body[config.password];
		strategy.checkCredentials(username, password, function(err, user) {
			if (user && !err) {
				res.cookie(cookieName, strategy.serializeUser(user), {signed: true, maxAge: 1000*60*60*24*7});
				res.redirect(config.redirect);	
			} else {
				console.log("error al checkear credenciales");
				res.redirect(config.failRedirect);
			}
		});
	}
}

exports.requiresSession = function(req, res, next) {
	if (req.signedCookies[cookieName]) {
		strategy.deserializeUser(req.signedCookies[cookieName], function(err, user) {
			if(err) {
				res.clearCookie(cookieName);
				return res.sendStatus(500);
			}
			req.user = user;
			next();
		});
	} else {
		next(strategy.loginRoute);
	}
}

exports.destroySession = function(res) {
	res.clearCookie(cookieName);
}

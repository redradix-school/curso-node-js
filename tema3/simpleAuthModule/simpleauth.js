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

}

exports.requiresSession = function(req, res, next) {

}

exports.destroySession = function(res) {

}

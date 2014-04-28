var express = require("express"),
    app = express();

// Datos

var users = [{email: "a@b.c", pass: "asdf"}];

// Estrategia

var strategy = {
  serializeUser: function(user) {
    return users.indexOf(user);
  },
  deserializeUser: function(id, cb) {
    cb(users[id]);
  },
  checkCredentials: function(login, pass, cb) {
    var user = users.find(function(u) {
      return u.email === login && u.pass === pass;
    });
    cb(user);
  }
};

// Auth

var auth = {
  createSession: function(options) {
  },
  requiresSession: function(req, res, next) {
  },
  destorySession: function(req, res, next) {
  }
};


app.get("/login", auth.createSession({redirect: "/secret"}));

app.get("/secret", auth.requiresSession, function(req, res) {
});

app.get("/logout", auth.destroySession);

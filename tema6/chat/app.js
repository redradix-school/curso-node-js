var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var crypto = require('crypto');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(cookieSession({secret: 'asdf'}));
app.use(express.static(path.join(__dirname, 'public')));

// utilidades

function gravatar(email, s) {
  var baseUrl = "http://www.gravatar.com/avatar/",
      parEmail = email.toLowerCase().trim(),
      hash = crypto.createHash("md5").update(parEmail).digest("hex");
  return baseUrl + hash + (s? "s="+s : "");
}

// rutas

app.post('/session', function(req, res) {
  req.session.nick = req.body.nick;
  req.session.avatar = gravatar(req.body.gravatar, 50);
  res.redirect('/chat.html');
});

app.get('/me', function(req, res) {
  res.send({name: req.session.nick, avatar: req.session.avatar});
});

app.use(function(req, res) {
  res.redirect('/login.html');
});

// sockets

// ---8<--- El servidor del chat aqui! ---8<---


// exports

module.exports = server;

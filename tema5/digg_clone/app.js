/* Modules */

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Q = require('q');
var auth = require('./simpleauth');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var models = require('./models');

var app = express();

/* Config */

var client = Q.ninvoke(MongoClient,
                       'connect',
                       'mongodb://127.0.0.1:27017/diggclone');

models.setClient(client);

client.fail(function(e) {
  console.log('ERROR conectando a Mongo: ', e);
});

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

Q.longStackSupport = true;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(cookieSession({secret: 'asdf'}));
app.use(express.static(path.join(__dirname, 'public')));

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
  },
  deserializeUser: function(userToken, cb) {
  },
  checkCredentials: function(username, pass, cb) {
  }
});

/* Routing */

app.use('/', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));

/* Errors */

app.use(function(req, res, next) {
  res.send(404);
});

app.use(function(err, req, res, next) {
  res.send(500);
});

module.exports = app;

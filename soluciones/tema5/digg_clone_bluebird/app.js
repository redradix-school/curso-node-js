/* Modules */

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Promise = require('bluebird');
var auth = require('./simpleauth');
//Esto nos añade los métodos Async a todos los objetos de mongo
var MongoDB = Promise.promisifyAll(require('mongodb'));
var MongoClient = MongoDB.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var models = require('./models');

var app = express();

/* Config */
var client = MongoClient.connectAsync('mongodb://127.0.0.1:27017/diggclone');

client.then(function(db){
  console.log('Connected to Mongo');
  models.setClient(db);
});

client.catch(function(e) {
  console.log('ERROR conectando a Mongo: ', e);
});

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(cookieSession({secret: 'asdf'}));
app.use(express.static(path.join(__dirname, 'public')));

/* Auth */

auth.setStrategy({
  //qué guardamos en la sesión de un usuario?
  serializeUser: function(user) {
    return user.token;
  },
  //dado el token, obtener el usuario
  deserializeUser: function(userToken, cb) {
    models.user.getUserByToken(userToken).then(function(user){
      if(user){
        //don't send the password!!!!
        delete user.password;
        cb(user);
      }
      else {
        cb(null);
      }
    });
  },
  //comprobar username y password
  checkCredentials: function(username, pass, cb) {
    models.user.checkCredentials(username, pass)
      .then(function(res){
        console.log('Res', res);
        if(res.length){
          cb(null, res[0]);
        }
        else {
          cb(null, false);
        }
      });

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

// app.use(function(err, req, res, next) {
//   console.log(err);
//   res.send(500);
// });

module.exports = app;

/* Dependencies */

var express = require("express")
  , Q = require("q")
  , check = require("validator").check
  , auth = require("./simpleauth")
  , mailer = require("nodemailer")
  , MongoClient = require("mongodb").MongoClient
  , ObjectID = require("mongodb").ObjectID;

var client = Q.ninvoke(MongoClient,
                       "connect",
                       "mongodb://127.0.0.1:27017/diggclone");

client.fail(function(e) {
  console.log("ERROR conectando a Mongo: ", e);
});

/* Solo para los que tengáis tiempo y sendmail */

var mailerTransport = mailer.createTransport("Sendmail", "/usr/sbin/sendmail");

/* Para enviar un correo: mailerTransport.sendMail({to: "", from: "", subject: "", text: "", html:""}) */

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

Q.longStackSupport = true;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('short'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser('your secret here'));
  app.use(express.session());

  app.use(app.router);
  app.use(express.static(__dirname +  '/public'));
});

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
  },
  deserializeUser: function(userToken, cb) {
  },
  checkCredentials: function(username, pass, cb) {
  }
});

/* Controllers */

var postsController = {
  index: function(req, res) {
  },
  show: function(req, res) {
  },
  create: function(req, res) {
  },
  update: function(req, res) {
  },
  "delete": function(req, res) {
  },
  vote: function(req, res) {
  },
  param: function(req, res, next, postId) {
  }
};

var commentsController = {
  index: function(req, res) {
  },
  show: function(req, res) {
  },
  create: function(req, res) {
  },
  update: function(req, res) {
  },
  "delete": function(req, res) {
  },
  vote: function(req, res) {
  },
  param: function(req, res, next, commentId) {
  }
};

var usersController = {
  create: function(req, res) {
  },
  me: function(req, res) {
  },
  login: function(req, res) {
  }
};

/* Routing */

function resources(app, name, controller) {
  if (controller.index) app.get("/"+name, controller.index);
  if (controller["new"]) app.get("/"+name+"/new", controller["new"]);
  if (controller.create) app.post("/"+name, controller.create);
  if (controller.show) app.get("/"+name+"/:"+name+"id", controller.show);
  if (controller.edit) app.get("/"+name+"/:"+name+"id/edit", controller.edit);
  if (controller.update) app.put("/"+name+"/:"+name+"id", controller.update);
  if (controller["delete"]) app["delete"]("/"+name+"/:"+name+"id", controller["delete"]);
  if (controller.param) app.param(name + "id", controller.param);
}

app.post("/session", auth.createSession(), usersController.login);
app.post("/users", usersController.create);
app.get("/me", auth.requiresToken, usersController.me);

auth.withToken(app, function(app) {
  resources(app, "posts", postsController);
  app.post("/posts/:postsid/vote/:vote", postsController.vote);
  resources(app, "comments", commentsController);
  app.post("/comments/:commentsid/vote/:vote", commentsController.vote);
});

app.use(function(req, res, next) {
  res.send(404);
});

app.use(function(err, req, res, next) {
  res.send(500);
});

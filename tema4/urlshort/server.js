var express = require("express"),
    client = require("redis").createClient(),
    auth = require("./simpleauth"),
    Q = require("q"),
    inherits = require("util").inherits,
    app = express();

Q.longStackSupport = true;

app.use(require("body-parser")());
app.use(require("method-override")());
app.use(require("cookie-parser")("secreto"));
app.use(require("cookie-session")({secret: "asdf"}));
app.engine("jade", require("jade").__express);
app.set("views", "./views");
app.set("view engine", "jade");

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
    // 8< ---- to codigo aqui ---- 8<
  },
  deserializeUser: function(email, cb) {
    // 8< ---- to codigo aqui ---- 8<
  },
  checkCredentials: function(email, pass, done) {
    // 8< ---- to codigo aqui ---- 8<
  },
  loginRoute: "/login"
});

/* Controllers */

var sessionsController = {
  "new": function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  "delete": function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  }
};

var usersController = {
  "new": function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  create: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  }
};

var urlsController = {
  index: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  "new": function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  create: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  show: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  edit: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  update: function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  "delete": function(req, res) {
    // 8< ---- to codigo aqui ---- 8<
  },
  navigate: function(req, res, next) {
    // 8< ---- to codigo aqui ---- 8<
  },
  param: function(req, res, next, code) {
    // 8< ---- to codigo aqui ---- 8<
  }
};

/* Routing */

function resources(app, name, controller) {
  app.get("/"+name, controller.index);
  app.get("/"+name+"/new", controller["new"]);
  app.post("/"+name, controller.create);
  app.get("/"+name+"/:"+name+"id", controller.show);
  app.get("/"+name+"/:"+name+"id/edit", controller.edit);
  app.put("/"+name+"/:"+name+"id", controller.update);
  app["delete"]("/"+name+"/:"+name+"id", controller["delete"]);
  if (controller.param) { app.param(name + "id", controller.param); }
}

app.get("/login", sessionsController.new);
app.post("/session", auth.createSession({redirect: "/urls"}));
app.get("/logout", auth.destroySession, sessionsController.delete);

app.get("/register", usersController.new);
app.post("/register", usersController.create);

auth.withSession(app, function(app) {
  resources(app, "urls", urlsController);
});

app.use(urlsController.navigate);

/* Ficheros estaticos */

app.use(express.static(__dirname + "/public"));

/* Manejo de errores */

// 8< ---- to codigo aqui ---- 8<

app.listen(3000);

/* Populate */

// Cread un usuario de prueba y alguna url

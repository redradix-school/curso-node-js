var express = require("express"),
    client = require("redis").createClient(),
    auth = require("./simpleauth"),
    Q = require("q"),
    inherits = require("util").inherits,
    app = express()

Q.longStackSupport = true

app.configure(function() {
  app.use(express.favicon())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser("secreto"))
  app.use(express.cookieSession({secret: "adsf"}))
  app.engine("jade", require("jade").__express)
  app.set("views", "./views")
  app.set("view engine", "jade")
  app.use(app.router)
  app.use(express.static(__dirname + "/public"))
})

function extend() {
  var args = [].slice.call(arguments)
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k] }
    return acc
  })
}

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
  },
  deserializeUser: function(email, cb) {
  },
  checkCredentials: function(email, pass, done) {
  },
  loginRoute: "/login"
})

/* Controllers */

var sessionsController = {
  "new": function(req, res) {
  },
  "delete": function(req, res) {
  }
}

var usersController = {
  "new": function(req, res) {
  },
  create: function(req, res) {
  }
}

var urlsController = {
  index: function(req, res) {
  },
  "new": function(req, res) {
  },
  create: function(req, res) {
  },
  show: function(req, res) {
  },
  edit: function(req, res) {
  },
  update: function(req, res) {
  },
  "delete": function(req, res) {
  },
  navigate: function(req, res, next) {
  },
  param: function(req, res, next, code) {
  }
}

/* Routing */

function resources(app, name, controller) {
  app.get("/"+name, controller.index)
  app.get("/"+name+"/new", controller["new"])
  app.post("/"+name, controller.create)
  app.get("/"+name+"/:"+name+"id", controller.show)
  app.get("/"+name+"/:"+name+"id/edit", controller.edit)
  app.put("/"+name+"/:"+name+"id", controller.update)
  app["delete"]("/"+name+"/:"+name+"id", controller["delete"])
  if (controller.param) { app.param(name + "id", controller.param) }
}

app.get("/login", sessionsController.new)
app.post("/session", auth.createSession({redirect: "/urls"}))
app.get("/logout", auth.destroySession, sessionsController.delete)

app.get("/register", usersController.new)
app.post("/register", usersController.create)

auth.withSession(app, function(app) {
  resources(app, "urls", urlsController)
})

app.use(urlsController.navigate)

app.listen(3000)

/* Populate */

// Cread un usuario de prueba y alguna url

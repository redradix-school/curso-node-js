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
app.use(require("morgan")("short"));
app.engine("jade", require("jade").__express);
app.set("views", "./views");
app.set("view engine", "jade");

/* Utils */

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

var op = Q.ninvoke.bind(Q, client);

/* Models */

var Model = function(data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
  extend(this, data);
};
Model.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var User = function(data) {
  return Model.call(this, data);
};
inherits(User, Model);
extend(User.prototype, {
  urls: function() {
    return Url.findForUser(this.username);
  },
  addUrl: function(data) {
    data.date = Date.now();
    if (data.original.indexOf("http") != 0) {
      data.original = "http://" + data.original;
    }
    var url = new Url(data, this.username);
    return url.save();
  },
  genKey: function(key) {
    return "user:" + (key || this.username);
  },
  save: function() {
    return op("set", this.genKey(), this);
  }
});
extend(User, {
  find: function(username) {
    return op("get", User.prototype.genKey(username))
      .then(function(userData) {
        return new User(userData);
      });
  },
  create: function(data) {
    var user = new User(data);
    return user.save()
      .then(function() {
        return user;
      });
  }

});

var Url = function(data, userId) {
  Model.call(this, data);
  extend(this,
         extend({code: Date.now().toString(36), userId: userId, visits: 0},
                this));
};
inherits(Url, Model);

extend(Url.prototype, {
  genKey: function(code) {
    return "url:" + (code || this.code);
  },
  genListKey: function(userId) {
    return "urls:" + (userId || this.userId);
  },
  save: function() {
    return op("set", this.genKey(), this)
      .then(function() {
        return op("rpush", this.genListKey(), this.code);
      }.bind(this));
  },
  update: function() {
    return op("set", this.genKey(), this);
  },
  addVisit: function() {
    this.visits++;
    this.update();
  }
});
extend(Url, {
  find: function(code) {
    return op("get", Url.prototype.genKey(code))
      .then(function(data) {
        return data? new Url(data) : null;
      });
  },
  findForUser: function(username) {
    return op("lrange", Url.prototype.genListKey(username), 0, -1)
      .then(function(codes) {
        return Url.findAll(codes || []);
      });
  },
  findAll: function(codes) {
    // NOTA: Podeis hacerlo mejor con MGET
    return Q.all(
      codes.map(function(code) {
        return op("get", Url.prototype.genKey(code))
          .then(function(urlData) {
            return new Url(urlData);
          });
      })
    );
  },
  "delete": function(url) {
    return op("del", url.genKey())
      .then(function() {
        return op("lrem", url.genListKey(), 0, url.code);
      });
  }
});

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
    return user.username;
  },
  deserializeUser: function(username, cb) {
    User.find(username)
      .then(cb)
      .fail(cb.bind({}, false))
      .done();
  },
  checkCredentials: function(username, pass, done) {
    User.find(username)
      .then(function(user) {
        if (user.password === pass) {
          done(null, user);
        } else {
          done(null, false);
        }
      })
      .fail(done)
      .done();
  },
  loginRoute: "/login"
});

/* Controllers */

var sessionsController = {
  "new": function(req, res) {
    res.render("login");
  },
  "delete": function(req, res) {
    res.redirect("/login");
  }
};

var usersController = {
  "new": function(req, res) {
    res.render("register");
  },
  create: function(req, res) {
    if (req.body.password !== req.body.passwordconfirm) {
      return res.redirect("/register");
    }
    var user = { username: req.body.username, password: req.body.password };
    op("set", "user:"+user.username, user.toJSON())
      .then(function(user) {
        auth.login(user);
        res.redirect("/urls");
      })
      .fail(function(err) {
        res.redirect("/register");
      })
      .done();
  }
};

var urlsController = {
  index: function(req, res) {
    req.user.urls()
      .then(function(urls) {
        res.render("url-index", {urls: urls, user: req.user, host: req.headers.host});
      })
      .done();
  },
  "new": function(req, res) {
    res.render("url-form", {url: {}});
  },
  create: function(req, res) {
    req.user.addUrl({original: req.body.original})
      .then(function() {
        res.redirect("/urls");
      })
      .done();
  },
  show: function(req, res) {
    res.render("url-show", {url: req.urlModel, host: req.headers.host});
  },
  edit: function(req, res) {
    res.render("url-form", {url: req.urlModel});
  },
  update: function(req, res) {
    req.urlModel.original = req.body.original;
    req.urlModel.update()
      .then(function() {
        res.redirect("/urls/"+req.urlModel.code);
      })
      .fail(function() {
        res.redirect("/urls/"+req.urlModel.code+"/edit");
      })
      .done();
  },
  "delete": function(req, res) {
    Url.delete(req.urlModel)
      .then(function() {
        res.redirect("/urls");
      })
      .fail(function() {
        res.redirect("/urls");
      })
      .done();

  },
  navigate: function(req, res, next) {
    var code = req.url.slice(1);
    Url.find(code)
      .then(function(url) {
        if (!url) { return next(); }
        if (url.original.indexOf("http") !== 0) {
          url.original = "http://" + url.original;
        }
        console.log(" * REDIRECTING TO: ", url.original);
        res.redirect(url.original);
        url.addVisit();
      })
      .fail(next)
      .done();
  },
  param: function(req, res, next, code) {
    Url.find(code)
      .then(function(url) {
        if (!url) { throw new Error("URL no encontrada"); }
        req.urlModel = url;
        next();
      })
      .fail(next)
      .done();
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

app.get("/login", sessionsController["new"]);
app.post("/session", auth.createSession({redirect: "/urls"}));
app.get("/logout", auth.destroySession, sessionsController["delete"]);

app.get("/register", usersController["new"]);
app.post("/register", usersController.create);

auth.withSession(app, function(app) {
  resources(app, "urls", urlsController);
});

/* Ficheros estaticos */

app.use(express.static(__dirname + "/public"));

/* Middleware de redireccion */

app.use(urlsController.navigate);

/* Arrancamos el servidor */

app.listen(3000);

/* Populate */

var admin = new User({username: "eliasagc@gmail.com", password: "asdf"});
admin.save().done();

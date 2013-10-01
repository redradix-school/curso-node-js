var express = require("express"),
    auth = require("./simpleauth"),
    app = express()

app.configure(function() {
  app.use(express.favicon())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser("secreto"))
  app.use(express.cookieSession({secret: "asdf"}))
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

/* Models */

var FakeModel = function(data) {
  extend(this, data)
}
extend(FakeModel, {
  initialize: function(klass) {
    extend(klass, {
      _models: [],
      _id: 0,
      find: function(id) {
        return this._models.filter(function(p) { return p.id == id })[0]
      },
      getAll: function() {
        return this._models
      }
    })
  }
})
extend(FakeModel.prototype, {
  save: function() {
    this.id = this.constructor._id++
    this.constructor._models.push(this)
  },
  update: function() {
    var models = this.constructor._models;
    for (var i=0,_len=models.length; i<_len; i++) if (models[i].id === this.id) {
      models.splice(i, 1, this)
      break
    }
  },
  delete: function() {
    var models = this.constructor._models;
    for (var i=0,_len=models.length; i<_len; i++) if (models[i].id === this.id) {
      models.splice(i, 1)
      break
    }
  }
})

var Post = function(data) {
  data = extend({}, {title: "", content: "", date: Date.now(), views: 0}, data)
  FakeModel.call(this, data)
}
FakeModel.initialize(Post)
extend(Post.prototype, FakeModel.prototype, {
})

var User = function(data) {
  data = extend({email: "", date: Date.now(), password: ""}, data)
  FakeModel.call(this, data)
}
FakeModel.initialize(User)
extend(User, {
  findByEmail: function(email) {
   return this._models.filter(function(u) {
     return u.email === email;
   })[0];
  }
})
extend(User.prototype, FakeModel.prototype, {
})

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
    return user.id
  },
  deserializeUser: function(id, cb) {
    cb(User.find(id))
  },
  checkCredentials: function(email, pass, done) {
    console.log(email)
    var user = User.findByEmail(email)
    console.log(user)
    if (user && user.password === pass) {
      done(null, user)
    } else {
      done(null, false)
    }
  },
  loginRoute: "/login"
})

/* Controllers */

var postsController = {
  index: function(req, res) {
    var posts = Post.getAll()
    res.render("post-list", {posts: posts})
  },
  new: function(req, res) {
    res.render("new-post", {post: {}})
  },
  create: function(req, res) {
    var post = new Post({title: req.body.title, content: req.body.content})
    post.save()
    res.redirect("/posts")
  },
  show: function(req, res) {
    if (!req.post) throw new Error("Not found!");
    res.render("post-detail", {post: req.post})
  },
  edit: function(req, res) {
    if (!req.post) throw new Error("Not found!");
    res.render("new-post", {post: req.post})
  },
  update: function(req, res) {
    extend(req.post, req.body)
    req.post.update()
    res.redirect("/posts/" + req.post.id)
  },
  delete: function(req, res) {
    req.post.delete()
    res.redirect("/posts")
  },
  param: function(req, res, next, postId) {
    req.post = Post.find(postId)
    next()
  }
}

var sessionsController = {
  new: function(req, res) {
    res.render("login")
  },
  delete: function(req, res) {
    res.redirect("/login")
  }
}

var usersController = {
  new: function(req, res) {
    res.render("register")
  },
  create: function(req, res) {
    if (req.body.password === req.body.passwordconfirm) {
      var user = new User({email: req.body.email, password: req.body.password})
      user.save()
      auth.login(req, user)
      res.redirect("/posts")
    } else {
      console.log("contraseña %s y confirmacion %s no coinciden!", req.body.password, req.body.passwordconfirm)
      res.redirect("/register")
    }
  }
}

/* Routing */

function resources(app, name, controller) {
  app.get("/"+name, controller.index)
  app.get("/"+name+"/new", controller.new)
  app.post("/"+name, controller.create)
  app.get("/"+name+"/:"+name+"id", controller.show)
  app.get("/"+name+"/:"+name+"id/edit", controller.edit)
  app.put("/"+name+"/:"+name+"id", controller.update)
  app.delete("/"+name+"/:"+name+"id", controller.delete)
  if (controller.param) { app.param(name + "id", controller.param) }
}

app.get("/login", sessionsController.new)
app.post("/session", auth.createSession({redirect: "/posts"}))
app.get("/logout", auth.destroySession, sessionsController.delete)

app.get("/register", usersController.new)
app.post("/register", usersController.create)

auth.withSession(app, function(app) {
  resources(app, "posts", postsController)
})

app.get("/", function(req, res) {
  res.redirect(req.user? "/posts" : "/login")
})

app.listen(3000)

/* Populate */
var post = new Post({title: "Prueba", content: "Esto es una prueba"})
post.save()

var admin = new User({email: "admin@asdf.com", password: "asdf"})
admin.save()

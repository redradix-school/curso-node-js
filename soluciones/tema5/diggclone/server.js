/* Dependencies */

var express = require("express")
  , http = require("http")
  , Q = require("q")
  , check = require("validator").check
  , env = process.env.NODE_ENV || "development"
  , auth = require("./simpleauth")
  , MongoClient = require("mongodb").MongoClient
  , ObjectID = require("mongodb").ObjectID

var client = Q.ninvoke(MongoClient,
                       "connect",
                       "mongodb://127.0.0.1:27017/diggclone");

client.fail(function(e) {
  console.log("ERROR conectando a Mongo: ", e)
})

function extend() {
  var args = [].slice.call(arguments)
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k] }
    return acc
  })
}

Q.longStackSupport = true

var app = express()

app.set('port', process.env.PORT || 3002)
app.use(require("body-parser").json());
app.use(require("method-override")());
app.use(require("cookie-parser")("secreto"));
app.use(require("cookie-session")({secret: "asdf"}));
app.use(require("morgan")("short"));

app.use(express.static(__dirname +  '/public'))


/* Models */

var Model = function(data) {
}
Model.initialize = function(collection, klass) {
  klass._collectionName = collection;
  klass._collection = client.then(function(db) {
    return db.collection(klass._collectionName);
  });
  return extend(klass, {
    op: function() {
      var args = [].slice.call(arguments);
      return klass._collection.then(function(col) {
        return Q.ninvoke.apply(Q, [col].concat(args))
      })
    },
    create: function(data) {
      return klass.op("save",
                      extend(data, this.defaults || {}, {date: Date.now()}))
    }
  })
}

var User = Model.initialize("users", {
  generateToken: function() {
    return (Date.now() + Math.random()).toString(36)
  }
});

var Post = Model.initialize("posts", {
  list: function(order) {
    return Post.op("find")
    .then(function(posts) {
      var params = {}
      params[order] = -1
      return Q.ninvoke(posts, "sort", params)
    })
    .then(function(posts) {
      return Q.ninvoke(posts, "toArray")
    })
    .then(function(posts) {
      return posts
    })
  }
});

var Comment = Model.initialize("comments", {
})

var VoteRegister = Model.initialize("voteregister", {
})

/* Auth */

auth.setStrategy({
  serializeUser: function(user) {
    return user.token
  },
  deserializeUser: function(userToken, cb) {
    User.op("findOne", {token: userToken}).then(function(user) {
      user? cb(user) : cb(false);
    })
    .fail(cb.bind({}, false))
    .done();
  },
  checkCredentials: function(username, pass, cb) {
    console.log("check credentials")
    User.op("findOne", {email: username}).then(function(user) {
      if (user !== undefined && user.password === pass) {
        cb(null, user);
      } else {
        cb(null, false);
      }
    })
    .fail(cb.bind({}, null, false))
    .done();
  }
})

/* Controllers */

var postsController = {
  index: function(req, res) {
    var order = (req.param("s") === "hottest") ? "votes" : "date"
    Post.list(order)
    .then(res.send.bind(res))
    .done()
  },
  show: function(req, res) {
    res.send(req.post)
  },
  create: function(req, res) {
    Q.fcall(function() {
      check(req.body.title).notEmpty()
      check(req.body.link).notEmpty()
      check(req.body.description).notEmpty()
    })
    .then(function() {
      return Post.create(extend(req.body, {user: {
        name: req.user.name,
        _id: req.user._id
      }}))
    })
    .then(res.send.bind(res, 200))
    .fail(res.send.bind(res, 500))
    .done()
  },
  update: function(req, res) {
    Post.op("save", extend(req.post, req.body, {user: {
      name: req.user.name,
      _id: req.user._id
    }}))
    .then(res.send.bind(res, 200))
    .fail(res.send.bind(res, 500))
    .done()
  },
  "delete": function(req, res) {
    Comment.op("remove", req.comment._id)
    .then(res.send.bind(res, 200))
    .then(res.send.bind(res, 500))
    .done()
  },
  vote: function(req, res) {
    VoteRegister.op("findOne", {
      post_id: req.post._id,
      user_id: req.user._id
    })
    .then(function(voted) {
      if (voted) throw new Error("Already voted!");
      var vote = req.param("vote") === "up" ? 1 : -1;
      req.post.votes || (req.post.votes = 0)
      req.post.votes += vote
      return Q.all([
        Post.op("save", req.post),
        VoteRegister.create({post_id: req.post._id, user_id: req.user._id})
      ])
    })
    .then(res.send.bind(res, 200))
    .fail(res.send.bind(res, 500))
    .done()
  },
  param: function(req, res, next, postId) {
    Post.op("findOne", new ObjectID(postId))
    .then(function(post) {
      req.post = post;
      next();
    })
    .fail(function() {
      next(new Error("Post no encontrado"))
    })
    .done()
  }
}

var commentsController = {
  index: function(req, res) {
    var postId = req.param("post_id")
    Comment.op("find", {post_id: new ObjectID(postId)})
    .then(function(comments) {
      return Q.ninvoke(comments, "sort", {votes: -1})
    })
    .then(function(comments) {
      return Q.ninvoke(comments, "toArray")
    })
    .then(function(comments) {
      res.send(comments)
    })
    .fail(res.send.bind(res, 500))
  },
  show: function(req, res) {
    res.send(req.comment)
  },
  create: function(req, res) {
    var postId = req.param("post_id")
    Q.fcall(function() {
      check(req.body.text).notEmpty()
    })
    .then(function() {
      return Comment.create(extend(req.body, {
        user: {
          name: req.user.name,
          _id: req.user._id
        }},
        {post_id: ObjectID(postId)}
      ))
    })
    .then(function(comment) {
      res.send(comment)
    })
    .fail(res.send.bind(res, 500))
    .done()
  },
  update: function(req, res) {
    Comment.op("save", extend(req.comment, req.body, {
      user: {
        name: req.user.name,
        _id: req.user._id
      }},
      {post_id: new ObjectID(postId)}
    ))
    res.send("Ok")
  },
  "delete": function(req, res) {
    Comment.op("remove", req.comment._id)
    .then(res.send.bind(res, 200))
    .then(res.send.bind(res, 500))
    .done()
  },
  vote: function(req, res) {
    VoteRegister.op("findOne", {
      comment_id: req.comment._id,
      user_id: req.user._id
    })
    .then(function(voted) {
      if (voted) throw new Error("Already voted!");
      var vote = req.param("vote") === "up" ? 1 : -1;
      req.comment.votes || (req.comment.votes = 0)
      req.comment.votes += vote
      return Q.all([
        Comment.op("save", req.comment),
        VoteRegister.create({comment_id: req.comment._id, user_id: req.user._id})
      ])
    })
    .then(res.send.bind(res, 200))
    .fail(res.send.bind(res, 500))
    .done()
  },
  param: function(req, res, next, commentId) {
    Comment.op("findOne", new ObjectID(commentId))
    .then(function(comment) {
      req.comment = comment;
      next();
    })
    .fail(function() {
      next(new Error("Comentario no encontrado"))
    })
    .done()
  }
}

var usersController = {
  create: function(req, res) {
    console.log(req.body)
    Q.fcall(function() {
      check(req.body.username).notEmpty().len(4, 50)
      check(req.body.name).notEmpty().len(4, 50)
      check(req.body.password).notEmpty().len(4, 50)
      check(req.body.passwordconfirm).equals(req.body.password)
      return User.create({
        email: req.body.username,
        password: req.body.password,
        name: req.body.name
      })
    })
    .then(function(user) {
      req.user = user;
      usersController.login(req, res);
    })
    .fail(res.send.bind(res, 500))
    .done()
  },
  me: function(req, res) {
    res.send(200, req.user)
  },
  login: function(req, res) {
    req.user.token = User.generateToken();
    User.op("save", req.user)
    .then(usersController.me.bind(usersController, req, res))
    .fail(res.send.bind(res, 500))
    .done()
  }
}

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

app.post("/session", auth.createSession(), usersController.login)
app.post("/users", usersController.create)
app.get("/me", auth.requiresToken, usersController.me)

auth.withToken(app, function(app) {
  resources(app, "posts", postsController)
  app.post("/posts/:postsid/vote/:vote", postsController.vote)
  resources(app, "comments", commentsController)
  app.post("/comments/:commentsid/vote/:vote", commentsController.vote)
})

app.use(function(req, res, next) {
  res.send(404)
  // 404
})

app.use(function(err, req, res, next) {
  res.send(500)
  // 500
})

app.listen(3002)

/* Populate */

/*

User.op("findOne", {email: "asdf"})
.then(function(user) {
  return user? user : User.create({
    email: "asdf",
    password: "asdf",
    name: "Test User"
  })
})
.then(function(user) {
  return [user, Post.op("remove")]
})
.spread(function(user) {
  return [user, Post.create({
    title: "titulo",
    description: "asdf",
    link: "http://www.google.com",
    user: {name: user.name, _id: user._id },
    votes: 0
  }), Comment.op("remove"), VoteRegister.op("remove")]
})
.spread(function(user, post) {
  return Comment.create({
    text: "Comentario!",
    post_id: post._id,
    user: {name: user.name, _id: user._id},
    votes: 0
  })
})
.done()

*/

exports.app = app;

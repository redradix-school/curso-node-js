"use strict";

var express = require("express"),
    app = express();

app.use(require("static-favicon")());
app.use(require("body-parser")());
app.use(require("method-override")());
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

/* Models */

var Post = function(data) {
  data = extend({}, {title: "", content: "", date: Date.now(), views: 0}, data);
  extend(this, data);
}
extend(Post, {
  _posts: [],
  _id: 0,
  find: function(id) {
    return this._posts.filter(function(p) { return p.id == id })[0];
  },
  getAll: function() {
    return this._posts;
  }
});
extend(Post.prototype, {
  save: function() {
    this.id = Post._id++;
    Post._posts.push(this);
  },
  update: function() {
    var posts = Post._posts;
    for (var i=0,_len=posts.length; i<_len; i++) if (posts[i].id === this.id) {
      posts.splice(i, 1, this);
      break;
    }
  },
  delete: function() {
    var posts = Post._posts;
    for (var i=0,_len=posts.length; i<_len; i++) if (posts[i].id === this.id) {
      posts.splice(i, 1);
      break;
    }
  }
});

var postsController = {
  index: function(req, res) {
    res.render("post-list", {posts: Post.getAll()});
  },
  show: function(req, res) {
    res.render("post-detail", {post: req.post});
  },
  "new": function(req, res) {
    res.render("new-post", {post: {}});
  },
  create: function(req, res) {
    var post = new Post({title: req.body.title, content: req.body.content});
    post.save();
    res.render("post-detail", {post: post});
  },
  edit: function(req, res) {
    res.render("new-post", {post: req.post});
  },
  update: function(req, res) {
    req.post.title = req.body.title;
    req.post.content = req.body.content;
    req.post.update();
    res.render("post-detail", {post: post});
  },
  "delete": function(req, res) {
    req.post.delete();
    res.redirect("/posts");
  },
  param: function(req, res, next, postId) {
    req.post = Post.find(postId);
    next();
  }
};

function resources(app, name, controller) {
  app.get("/"+name, controller.index);
  app.get("/"+name+"/new", controller.new);
  app.post("/"+name, controller.create);
  app.get("/"+name+"/:"+name+"id", controller.show);
  app.get("/"+name+"/:"+name+"id/edit", controller.edit);
  app.put("/"+name+"/:"+name+"id", controller.update);
  app.delete("/"+name+"/:"+name+"id", controller.delete);
  if (controller.param) { app.param(name + "id", controller.param); }
}

resources(app, "posts", postsController);

app.use(express.static(__dirname + "/public"));
app.listen(3000);

/* Populate */

var post = new Post({title: "Prueba", content: "Esto es una prueba"});
post.save();

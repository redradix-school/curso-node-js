var express = require("express"),
    app = express();


app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser("secreto"));
app.use(express.cookieSession({secret: "asdf"}));
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


/* Tu código aquí! */



app.use(express.static(__dirname + "/public"));
app.listen(3000);

/* Populate */

var post = new Post({title: "Prueba", content: "Esto es una prueba"});
post.save();

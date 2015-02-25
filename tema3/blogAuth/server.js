var express = require("express")
    , app = express()  
    , logger = require("morgan")
    , bodyParser = require("body-parser")
    , cookieParser = require("cookie-parser")
    , cookieSession = require("cookie-session")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser("secreto"));
app.use(cookieSession({secret: "asdf"}));
app.set("views", "./views");
app.set("view engine", "jade");
app.use(express.static(__dirname + "/public"));

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc
  });
}

/* Models */

var FakeModel = function(data) {
  extend(this, data);
};
extend(FakeModel, {
  initialize: function(klass) {
    extend(klass, {
      _models: [],
      _id: 0,
      find: function(id) {
        return this._models.filter(function(p) { return p.id == id })[0];
      },
      getAll: function() {
        return this._models;
      }
    });
  }
});
extend(FakeModel.prototype, {
  save: function() {
    this.id = this.constructor._id++;
    this.constructor._models.push(this);
  },
  update: function() {
    var models = this.constructor._models;
    for (var i=0,_len=models.length; i<_len; i++) if (models[i].id === this.id) {
      models.splice(i, 1, this);
      break;
    }
  },
  delete: function() {
    var models = this.constructor._models;
    for (var i=0,_len=models.length; i<_len; i++) if (models[i].id === this.id) {
      models.splice(i, 1);
      break;
    }
  }
})

var Post = function(data) {
  data = extend({}, {title: "", content: "", date: Date.now(), views: 0}, data);
  FakeModel.call(this, data);
}
FakeModel.initialize(Post);
extend(Post.prototype, FakeModel.prototype);

var User = function(data) {
  data = extend({email: "", date: Date.now(), password: ""}, data);
  FakeModel.call(this, data);
}
FakeModel.initialize(User);
extend(User, {
  findByEmail: function(email) {
   return this._models.filter(function(u) {
     return u.email === email;
   })[0];
  }
});
extend(User.prototype, FakeModel.prototype);


/* Tu código AQUÍ */


app.listen(3000);

/* Populate */

var post = new Post({title: "Prueba", content: "Esto es una prueba"});
post.save();

var admin = new User({email: "node@redradix.com", password: "redradix"});
admin.save();

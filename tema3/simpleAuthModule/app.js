/* Dependencies */

var express = require("express")
  , env = process.env.NODE_ENV || "development"
  , auth = require("./simpleauth")
  , logger = require("morgan")
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , cookieSession = require("cookie-session")

var users = [
  {
    id: 0,
    username: "node@redradix.com",
    pass: "redradix"
  }
]

auth.setStrategy({
  serializeUser: function(user) {
    return user.username;
  },
  deserializeUser: function(userId, cb) {
    var user = users.map(function(u) {
      if (u.username === userId) {
        return u;
      }
    })[0];
    user ? cb(null, user) : cb(404);
  },
  checkCredentials: function(username, pass, cb) {
    var user = users.map(function(u) {
      console.log(u);
      if (u.username === username && u.pass === pass) {
        return u;
      }
    })[0];
    console.log('user', user)
    user ? cb(null, user) : cb(404);
  },
  loginRoute: "/login.html"
})

var app = express()

app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser('secret'))
app.use(cookieSession({keys: ['secret']}))

app.use(express.static(__dirname +  '/public'))

/* Rutas */

app.get('/', function(req, res) {
  res.redirect('/login.html');
})

app.post("/session", auth.createSession({ redirect: "/ok" }))

app.get("/ok", auth.requiresSession, function(req, res) {
  res.end("OK!")
})

app.get("/secret", auth.requiresSession, function(req, res) {
  res.end("Hola, " + req.user.username)
})

app.get("/logout", auth.requiresSession, function(req, res) {
  auth.destroySession(res)
  res.redirect("/login.html")
})

app.listen(3000);

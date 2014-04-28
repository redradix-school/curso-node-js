var express = require("express"),
    app = express(),
    crypto = require("crypto"),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server);

function extend() {
  var args = [].slice.call(arguments);
  return args.reduce(function(acc, el) {
    for (var k in el) { acc[k] = el[k]; }
    return acc;
  });
}

function gravatar(email, s) {
  var baseUrl = "http://www.gravatar.com/avatar/",
      parEmail = email.toLowerCase().trim(),
      hash = crypto.createHash("md5").update(parEmail).digest("hex");
  return baseUrl + hash + (s? "s="+s : "");
}

app.configure(function() {
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser("secreto"));
  app.use(express.cookieSession({secret: "asdf"}));

  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
})

/* Routas */

var userData = {}

app.post("/session", function(req, res) {
  req.session.nick = req.body.nick;
  req.session.avatar = gravatar(req.body.gravatar, 50);
  res.redirect("/chat.html")
});

app.get("/me", function(req, res) {
  res.send({name: req.session.nick, avatar: req.session.avatar})
})

app.use(function(req, res) { res.redirect("/login.html"); });

/* WebSockets */

io.sockets.on("connection", function(socket) {
  socket.on("send:message", function(user, msgData) {
    socket.broadcast.emit("posted:message", user, msgData)
  })
})

server.listen(3000);

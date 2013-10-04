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
      hash = crypto.createHash("md5").update(parEmail).digest("hex")
  return baseUrl + hash + (s? "s="+s : "")
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

app.post("/session", function(req, res) {

});


app.use(function(req, res) { res.redirect("/login.html"); });

/* WebSockets */

server.listen(3000);

var http = require("http")
  , url = require("url")
  , fs = require("fs")

function rand(a, b) {
  var top = b ? (b - a) : a,
      delta = b ? a : 0;
  return Math.floor(Math.random() * top + delta);
}

function randomString(length) {
  var base = 36;
  return rand(Math.pow(base, length)).toString(base);
}

var store = {},
    captchaServer = "http://localhost:3000";

function generateId() {
  var id = randomString(10);
  while (id in store) { id = randomString(10); }
  return id;
}

var routes = {
  "/form": function(req, res) {
    fs.readFile("./templates/form.html", function(err, template) {
      if (err) {
        res.writeHead(500);
        return res.end("Oops!");
      }
      var response = "";
      http.get(captchaServer + "/captcha", function(getResponse) {
        getResponse.on("data", function(data) {
          response += data;
        });
        getResponse.on("end", function() {
          var html, id;
          try {
            response = JSON.parse(response);
            id = generateId();
            store[id] = response;
            html = template.toString()
                        .replace("#captcha-url#", captchaServer + response.url)
                        .replace("#id#", id);
            res.end(html);
          } catch(e) {
            res.writeHead(500);
            res.end("Oops!");
          }
        })
      });
    })
  },
  "/validate": function(req, res, urlData) {
    var id = urlData.query.id,
        code = urlData.query.captcha,
        data = store[id];
    if (!data || data.code != code) {
      res.end("<html><body>No.. <a href='/form'>Otra vez</a></body></html>")
    } else {
      res.end("<html><body>OK! <a href='/form'>Otra vez</a></body></html>")
    }
  }
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url, true),
      path = urlData.pathname;
  if (path in routes) {
    return routes[path](req, res, urlData);
  } else {
    res.writeHead(404);
    res.end("No existe");
  }
});

server.listen(3001);

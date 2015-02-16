/* Leer y devolver un fichero */

var http = require("http")
  , url = require("url")
  , fs = require("fs");

var server = http.createServer(),
    routes = {
      "/miruta": function(req, res) {
        fs.readFile("./joust.jpg", function(err, data) {
          if (err) {
            res.writeHead(500);
            res.end("Ha ocurrido algo malo")
          }
          res.end(data)
        })
      }
    };

server.on("request", function(req, res) {
  var urlData = url.parse(req.url),
      path = urlData.pathname;
  if (path in routes) {
    return routes[path](req, res)
  } else {
    res.writeHead(404)
    res.end("Not found!")
  }
})

server.listen(3000)

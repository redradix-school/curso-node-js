var http = require("http")
  , url = require("url");

var server = http.createServer(),
    routes = {
      "/miruta": function(req, res) {
        res.end("Hola!")
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

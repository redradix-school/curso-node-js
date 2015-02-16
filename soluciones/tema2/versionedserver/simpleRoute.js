var url = require("url");

var routes = {};

module.exports = {
  get: function(route, cb) {
    routes[route] = cb;
  },
  listen: function(httpServer, port) {
    httpServer.on("request", function(req, res) {
      req.url = url.parse(req.url, true);
      if (req.url.pathname in routes) {
        routes[req.url.pathname](req, res);
      } else if ("default" in routes) {
        routes["default"](req, res);
      } else {
        res.writeHead(500);
        res.end("Error: La ruta " + req.url.pathname + " no está registrada");
      }
    });
    httpServer.listen(port);
  }
};

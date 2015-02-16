/* Leer y devolver un fichero */

var http = require("http")
  , url = require("url")
  , fs = require("fs");

var server = http.createServer();

server.on("request", function(req, res) {
  var urlData = url.parse(req.url),
      path = urlData.pathname,
      filePath = "./public" + path;
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile("./public" + path, function(err, data) {
        if (err) {
          res.writeHead(500);
          res.end("Ha ocurrido algo  malo");
        } else {
          res.end(data);
        }
      })
    } else {
      res.writeHead(404);
      res.end("No existe!")
    }
  })
})

server.listen(3000)

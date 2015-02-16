/* Leer y devolver un fichero */

var http = require("http")
  , url = require("url")
  , fs = require("fs");

var server = http.createServer(),
    cache = {};

server.on("request", function(req, res) {
  var urlData = url.parse(req.url),
      path = urlData.pathname,
      filePath = "./public" + path;
  if (filePath in cache) {
    console.log(" * cache hit: %s", filePath);
    res.end(cache[filePath])
  } else {
    fs.exists(filePath, function(exists) {
      if (exists) {
        console.log("-> %s existe! Leyendo el fichero...", filePath);
        fs.readFile("./public" + path, function(err, data) {
          if (err) {
            res.writeHead(500);
            res.end("Ha ocurrido algo  malo");
          } else {
            cache[filePath] = data;
            res.end(data);
          }
        })
      } else {
        res.writeHead(404);
        res.end("No existe!")
      }
    })
  }
})

server.listen(3000)

var http = require("http"),
    url = require("url"),
    fs = require("fs")

var publicPath = "./public";

http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname,
      filePath = publicPath + path;

  var log = fs.open("./access.log", "a", function(err, fd) {
    if (err) {
      // Error
    }
    var buffer = new Buffer("[" + Date.now() + "] " + req.connection.remoteAddress + " pidió " + path + "\n", "utf-8")
    fs.write(fd, buffer, 0, buffer.length, null, function(err, written, buf) {
      if (err) {
        // Error
      }
      if (written != buffer.length) {
        // Log Error
      }
      fs.exists(filePath, function(exists) {
        if (exists) {
          var buffer = new Buffer("[" + Date.now() + "] " + path + " servido correctamente\n", "utf-8");
          fs.write(fd, buffer, 0, buffer.length, null, function(err, written, buf) {
            fs.readFile(filePath, function(err, file) {
              if (err) {
                // Error
              }
              fs.close(fd, function(err) {
                if (err) {
                  // Error
                }
                res.end(file);
              })
            })
          })
        } else {
          // Error
          var buffer = new Buffer("[" + Date.now() + "] " + path + " no existe\n", "utf-8");
          fs.write(fd, buffer, 0, buffer.length, null, function(err, written, buf) {
            fs.close(fd, function(err) {
              if (err) {
                // Error
              }
              res.writeHead(404);
              res.end("No existe");
            })
          })
        }
      })
    });
  });
})
.listen(3000)

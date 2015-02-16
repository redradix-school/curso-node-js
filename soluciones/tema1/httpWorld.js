var http = require("http"),
  , server = http.createServer()

server.on("request", function(req, res) {
  res.end("Hello, world!")
})

server.listen(3000)

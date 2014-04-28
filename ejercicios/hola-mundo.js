var http = require("http"),
    url = require("url"),
    inspect = require("util").inspect;

var server = http.createServer();

server.on("request", function(req, res) {
  var urlData = url.parse(req.url, true);
  res.end(inspect(urlData, {colors: false}));
});

server.listen(3000);

var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    path = require("path"),
    Q = require("q"),
    format = require("util").format,
    routes = require("./simpleRoute");

/* Global state */

var version = 0,
    cache = [],
    baseDir = path.resolve(__dirname, process.argv[2] || "./");

/* FS Utils */

function listFiles(path) {
  // ???
}

var somethingChanged = (function() {
  var lastChange = 0;
  return function(fileList) {
    // ???
  };
}());

function readAllFiles(fileList) {
  // ???
}

/* Update */

setInterval(function() {
  // ???
}, 500);

/* Routes */

routes.get("/", function(req, res) {
  // ???
});

routes.get("/list", function(req, res) {
  // ???
});

routes.get("default", function(req, res) {
  // ???
});

routes.listen(http.createServer(), 3456);

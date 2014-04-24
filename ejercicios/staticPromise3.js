"use strict";

var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    Q = require("q");

var cache = {},
    maxAge = 2000;

function fileExistsPromise(path) {
  var defer = Q.defer();
  fs.exists(path, function(exists) {
    return exists? defer.resolve(true) : defer.reject(new Error("no existe!"));
  });
  return defer.promise;
}

function readFilePromise(path) {
  return fileExistsPromise(path)
    .then(function() {
      var defer = Q.defer();
      fs.readFile(path, function(err, data) {
        return err? defer.reject(err) : defer.resolve(data);
      });
      return defer.promise;
    });
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url),
      filePath = "./public" + urlData.pathname;

  readFilePromise(filePath)
  .then(function(data) {
    res.writeHead(200);
    res.end(data.toString());
  })
  .fail(function(err) {
    res.writeHead(404);
    res.end(err.message);
  });
});

server.listen(3000);

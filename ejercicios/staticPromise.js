"use strict";

var http = require("http"),
    url = require("url"),
    fs = require("fs");

var cache = {},
    maxAge = 2000;

function fileExistsPromise(path) {
  var defer = Q.defer();
  fs.exists(path, function(exists) {
    return exists? defer.resolve(true) : defer.reject(new Error("no existe!"));
  });
  return defer.promise();
}

function readFilePromise(path) {
  return fileExistsPromise(path)
    .then(function() {
      fs.readFile(path, function(err, data) {
        if (err) throw err;
        return data;
      });
    });
}

function getFile(path) {
  var defer = Q.defer(),
      promise = defer.promise,
      cachedFile = cache[path];

  if (cachedFile && (Date.now() - cachedFile.stamp) < maxAge) {
    defer.resolve(cachedFile.data);
  } else {
    pormise = readFilePromise(path)
      .then(function(data) {
        cache[path]  = { data: data, stamp: Date.now() };
        return data;
      });
  }
  return promise;
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url),
      filePath = "./public" + urlData.pathname;

  getFile(path)
    .then(function(data) {
    })
    .fail(function(err) {
    });
});

server.listen(3000);

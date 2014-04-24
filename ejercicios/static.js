"use strict";

var http = require("http"),
    url = require("url"),
    fs = require("fs");

var cache = {},
    maxAge = 2000;

function readFile(path, cb) {
  console.log(" >> Leyendo el fichero:", path);
  fs.exists(path, function(exists) {
    if (exists) {
      fs.readFile(path, cb);
    } else {
      cb(new Error("El fichero no existe!"));
    }
  });
}

function getFile(path, cb) {
  var cachedFile = cache[path];
  if (cachedFile && (Date.now() - cachedFile.stamp) < maxAge) {
    cb(null, cachedFile.data);
  } else {
    readFile(path, function(err, data) {
      if (err) { return cb(err); }
      cache[path] = { data: data, stamp: Date.now() };
      cb(null, data);
    });
  }
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url);
  getFile("." + urlData.pathname, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end(err.message);
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

server.listen(3000);

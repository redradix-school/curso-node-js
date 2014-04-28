"use strict";

var fs = require("fs"),
    Q = require("q");

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

function readAllFiles() {
  var promises = Array.protoype.map.call(arguments, readFilePromise);
  return Q.all(promises);
}

var files = process.argv.slice(2);

readAllFiles.apply({}, files).then(function(contents) {
  console.log(contents.join("\n\n\n"));
});

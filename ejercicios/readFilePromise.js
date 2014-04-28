"use strict";

var Q = require("q"),
    fs = require("fs");

function readFilePromise(ruta) {
  var defer = Q.defer();

  fs.readFile(ruta, function(err, data) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(data);
    }
  });

  return defer.promise;
}

readFilePromise("./readFilePromise.js")
  .then(function(content) {
    console.log("Leido correctamente!");
    console.log(content.toString());
  }, function(err) {
    console.log("Error!!!");
    console.log(err);
  });

var fs = require("fs"),
    Q = require("q");

function fsReadDir(path) {
  var defer = Q.defer();
  fs.readdir(path, function(err, result) {
    return err? defer.reject(err) : defer.resolve(result);
  });
  return defer.promise;
}

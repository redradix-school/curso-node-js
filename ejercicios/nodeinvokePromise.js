var Promise = Promise || require('bluebird');
var fs = require("fs");

function nodefcall(fn) {
  //argumentos sin el primero (fn)
  var args = [].slice.call(arguments, 1);

  return new Promise(function(resolve, reject){
    fn.apply({}, args.concat(function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    }));
  });
}

function nodeinvoke(obj, method) {
  var args = [].slice.call(arguments, 2),
      fn = obj[method];
  return nodefcall(fn.bind.apply(fn, [obj].concat(args)));
  //return defer.promise;
}

nodeinvoke(fs, "readFile", "./nodeinvoke.js", "ascii")
  .then(function(content) {
    console.log(content);
  });

nodefcall(fs.readFile.bind(fs), "./nodeinvoke.js");

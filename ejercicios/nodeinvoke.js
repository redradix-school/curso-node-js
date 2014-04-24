var Q = require("q"),
    fs = require("fs");

function nodeinvoke(obj, method) {
  var args = [].slice.call(arguments, 2),
      fn = obj[method];
  return nodefcall(fn.bind.apply(fn, [obj].concat(args)));
  return defer.promise;
}

nodeinvoke(fs, "readFile", "./nodeinvoke.js")
  .then(function(content) {
    console.log(content);
  });

nodefcall(fs.readFile.bind(fs), "./nodeinvoke.js");

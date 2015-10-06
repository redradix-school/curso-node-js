var Promise = Promise || require('bluebird');
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


var fs = require('fs');

nodefcall(fs.readdir, '.')
  .then(function(res){
    console.log(res);
  });

nodefcall(fs.stat, '.')
  .then(console.log.bind(console));
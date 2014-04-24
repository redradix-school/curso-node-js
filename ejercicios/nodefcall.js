function nodefcall(fn) {
  var args = [].slice.call(arguments, 1),
      defer = Q.defer();

  fn.apply({}, args.concat(function(err) {
    var resultArgs = [].slice.call(arguments, 1);
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve.apply(defer, resultArgs);
    }
  }));

  return defer.promise;
}

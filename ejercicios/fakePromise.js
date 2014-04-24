var Q = require("q")

exports.gimmePromise = function() {
  var defer = Q.defer(),
      promise = defer.promise;
  promise.resolve = defer.resolve.bind(defer);
  promise.reject = defer.reject.bind(defer);
  return promise;
}

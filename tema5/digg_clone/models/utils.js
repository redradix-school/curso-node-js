var Q = require("q");

var client = null;

exports.setClient = function(mongoClient) {
  client = mongoClient;
};

exports.op = function op(colname) {
  var args = [].slice.call(arguments, 1);
  return client
    .then(function(db) {
      return Q.ninvoke.apply(Q, [db.collection(colname)].concat(args));
    })
    .fail(function(err) {
      console.log("[MongoDB]", err);
      throw err;
    });
};

exports.makeOp = function(col) {
  var args = [].slice.call(arguments, 1);
  return function () { return col.apply({}, args); };
};

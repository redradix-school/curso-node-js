var Q = require("q");

var client = null;

exports.setClient = function(mongoClient) {
  client = mongoClient;
};

exports.op = function op(colname) {
  var args = [].slice.call(arguments, 1);
  return client
    .then(function(db) {
      // 1) primero necesito el objeto db
      // 2) db.collection(colname) => el "puntero" a la coleccion
      // 3) args = algo como: ["findOne", {a: 1}]
      // 4) Al final, la llamada es equivalente a hacer:
      //    Q.ninvoke(col, "findOne", {a: 1})
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

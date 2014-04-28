var fakePromise = require("./fakePromise");

var promise = fakePromise.gimmePromise();

promise
  .then(function() {
    return "hola";
  })
  .then(function(msg) {
    console.log(msg);
    return "mundo";
  })
  .then(function(msg) {
    console.log(msg);
  });

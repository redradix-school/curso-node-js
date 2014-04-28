var start = Date.now();

setTimeout(function() {
  for (var i=Number.MAX_VALUE; i--;) {
    Math.pow(12345, 123455);
  }
}, 100);

setInterval(function() {
  var now = Date.now();
  console.log("Han pasado", now - start, "ms");
  start = now;
  console.log("Hola otra vez, Mundo del futuro!");
}, 1000);

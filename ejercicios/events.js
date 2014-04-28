var EventEmitter = require("events").EventEmitter,
    inherits = require("util").inherits;

function Tambor() {
  var self = this;
  setInterval(function() {
    self.emit("pom!");
  }, 1000);
};
inherits(Tambor, EventEmitter);

var tambor1 = new Tambor();

tambor1.on("pom!", function() {
  console.log("El tambor suena!");
});

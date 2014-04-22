var EventEmitter = require("events").EventEmitter,
    inherits = require("util").inherits;

function Reloj() {
  this.emit("segundo", new Date());
}
inherits(Reloj, EventEmitter);

exports.Reloj = Reloj;

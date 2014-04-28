var Reloj = require("./reloj").Reloj;
var reloj = new Reloj();

reloj.on("segundo", function(fecha) {
  console.log("Un segundo! son las:", fecha);
  reloj.removeAllListeners("segundo");
});

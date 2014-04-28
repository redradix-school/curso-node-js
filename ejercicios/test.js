function fcall(fn) {
  var args = [].slice.call(arguments, 1);
  return fn.apply({}, args);
}

function suma(a, b) {
  return a + b;
}

function siete() {
  return 7;
}

fcall(siete); // 7

fcall(suma, 1, 2); // 3

obj = {
  hola: function() {
    console.log(this.mensaje);
  },
  mensaje: "hola"
};

var metodo = obj.hola;
metodo.apply(obj, []);

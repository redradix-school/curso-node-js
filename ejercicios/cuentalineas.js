var fs = require("fs");

var readStream = fs.createReadStream(process.argv[2],
                                     { flags: "r",
                                       autoClose: true });

var contenido = "";

readStream.on("data", function(chunk) {
  contenido += chunk;
});

readStream.on("end", function() {
  console.log(contenido.split("\n").length - 1);
});

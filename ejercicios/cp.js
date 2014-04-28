var fs = require("fs");

var origen = process.argv[2],
    dest = process.argv[3];

var readStream = fs.createReadStream(origen, { flags: "r", autoClose: true});
var writeStream = fs.createWriteStream(dest, { flags: "w"});

// readStream.on("data", writeStream.write.bind(writeStream));
// readStream.on("end", writeStream.end.bind(writeStream));

readStream.on("data", function(chunk) {
  writeStream.write(chunk);
});

readStream.on("end", function() {
  writeStream.end();
});

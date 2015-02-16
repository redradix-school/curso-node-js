var Canvas = require("canvas")
  , Image = Canvas.Image
  , http = require("http")
  , url = require("url")
  , fs = require("fs");

function watermark(imageData, res) {
  var img = new Image,
      canvas,
      ctx;
  img.src = new Buffer(imageData, "binary");
  canvas = new Canvas(img.width, img.height);
  ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  fs.readFile("./public/mark.png", function(err, markData) {
    if (err) {
      res.writeHead(500);
      return res.end("Oops..");
    }
    var mark = new Image(),
        stream,
        timesH,
        thimesV;
    mark.src = new Buffer(markData, "binary");
    ctx.globalAlpha = 0.2;
    timesH = Math.ceil(img.width/mark.width);
    timesV = Math.ceil(img.height/mark.height);
    for (var i=0; i<timesV; i++) for (var j=0; j<timesH; j++) {
      ctx.drawImage(mark, j*mark.width, i*mark.height, mark.width, mark.height);
    }
    stream = canvas.pngStream();
    stream.on("data", function(data) {
      res.write(data)
    });
    stream.on("end", function() {
      res.end();
    });
  })
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url),
      path = urlData.pathname,
      filePath = "./public" + path;
  fs.exists(filePath, function(exists) {
    if (!exists) {
      res.writeHead(404);
      res.end("No existe!");
    } else {
      fs.readFile(filePath, function(err, data) {
        if (err) {
          res.writeHead(500);
          return res.end("Oops..");
        }
        if (path.match(/png$/)) {
          watermark(data, res);
        } else {
          res.end(data);
        }
      });
    }
  });
});

server.listen(3000);

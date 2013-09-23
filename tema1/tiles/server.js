var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    Canvas = require("canvas"),
    Image = Canvas.Image;

var publicDir = "./public",
    tileSize = 100,
    cache = {};

function extract_tile(imgData, coords, res, filePath) {
  var img,
      canvas,
      ctx,
      stream,
      origin;
  if (imgData === null) {
    img = cache[filePath];
  } else {
    img = new Image();
    img.src = new Buffer(imgData, "binary");
    cache[filePath] = img;
  }
  canvas = new Canvas(tileSize, tileSize);
  ctx = canvas.getContext("2d");
  origin = {
    x: Math.min(img.width-tileSize, Math.floor(coords.x/tileSize)*tileSize),
    y: Math.min(img.height-tileSize, Math.floor(coords.y/tileSize)*tileSize)
  };
  origin.x = Math.max(0, origin.x);
  origin.y = Math.max(0, origin.y);
  ctx.drawImage(img, origin.x, origin.y, tileSize, tileSize, 0, 0, tileSize, tileSize);
  stream = canvas.pngStream();
  stream.pipe(res)
  /*
  stream.on("data", res.write.bind(res));
  stream.on("end", res.end.bind(res));
  */
}

var server = http.createServer(function(req, res) {
  var urlData = url.parse(req.url, true),
      path = urlData.pathname,
      coords = {x: urlData.query.x || 0, y: urlData.query.y || 0},
      filePath = publicDir + path;
  if (cache[filePath]) {
    return extract_tile(null, coords, res, filePath);
  }
  fs.exists(filePath, function(exsits) {
    if (!exsits) {
      /* Error */
      res.writeHead(404);
      return res.end("No existe!");
    }
    fs.readFile(filePath, function(err, data) {
      if (err) { throw err; }
      if (path.match(/jpg$/)) {
        extract_tile(data, coords, res, filePath);
      } else {
        res.end(data);
      }
    });
  });
})
.listen(3000);

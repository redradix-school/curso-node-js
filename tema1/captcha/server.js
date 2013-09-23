var Canvas = require("canvas")
  , http = require("http")
  , url = require("url");

function rand(a, b) {
  var top = b ? (b - a) : a,
      delta = b ? a : 0;
  return Math.floor(Math.random() * top + delta);
}

function randomString(length) {
  var base = 36;
  return rand(Math.pow(base, length)).toString(base);
}

function CaptchaManager() {
  this.paths = {};
  this.maxDuration = 1000*60*2;
  this.canvas = new Canvas(200, 100);
  this.ctx = this.canvas.getContext("2d");
  this.fonts = ["Impact", "Verdana", "Arial", "Times"];
  setInterval(this.cleanup.bind(this), 1000*60)
}

CaptchaManager.prototype = {
  generateCaptcha: function() {
    var code = randomString(5),
        url = "/" + randomString(10),
        data;
    while (url in this.paths) { url = randomString(10); }
    data = {
      url: url,
      code: code,
      timestamp: Date.now()
    };
    this.paths[url] = data;
    return data;
  },
  randomNoise: function() {
    var times = rand(5, 100);
    while (--times) {
      this.ctx.strokeStyle = "rgb(" + rand(255) + "," + rand(255) + ", " + rand(255) + ")";
      this.ctx.beginPath()
      this.ctx.moveTo(rand(0, 200), rand(0, 100))
      this.ctx.lineTo(rand(0, 200), rand(0, 100))
      this.ctx.stroke();
    }
  },
  getImage: function(path, cb) {
    var data = this.paths[path];
    if (!data) return cb(new Error("No existe"), null);
    this.ctx.font = rand(30, 40) + "px " + this.fonts[rand(this.fonts.length)];
    this.ctx.clearRect(0, 0, 200, 100)
    this.randomNoise()
    this.ctx.save();
    this.ctx.rotate((0.5 - Math.random())/2)
    this.ctx.fillText(data.code, 50, 60);
    this.ctx.restore();
    cb(null, this.canvas.toBuffer());
  },
  cleanup: function() {
    var data, now = Date.now();
    console.log(" -> cleanup!");
    for (var path in this.paths) {
      data = this.paths[path];
      if ((now - data.timestamp) > this.maxDuration) {
        delete this.paths[path];
      }
    }
  }
}

var captchaManager = new CaptchaManager(),
    server = http.createServer(function(req, res) {
      var urlData = url.parse(req.url),
          path = urlData.pathname;
      switch(path) {
        case "/captcha":
          res.end(JSON.stringify(captchaManager.generateCaptcha()));
          break;
        default:
          captchaManager.getImage(path, function(err, data) {
          if (err) {
            res.writeHead(404);
            return res.end("No existe");
          }
          res.end(data);
        })
      }
    });

server.listen(3000);

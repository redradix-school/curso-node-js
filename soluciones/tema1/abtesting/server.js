var http = require("http")
  , url = require("url")
  , fs = require("fs")
  , config = require("./config");

var CaseManager = function(cases) {
  this.cases = cases;
  this.tracking = {};
}
CaseManager._userID = 0;

CaseManager.prototype = {
  getCaseFor: function(id) {
    var caseName;
    if (id in this.tracking) {
      return this.tracking[id].caseName;
    } else {
      caseName = this.getRandomCase();
      this.tracking[id] = {
        caseName: caseName,
        success: false
      };
      return caseName;
    }
  },
  getRandomCase: function() {
    return this.cases[(Math.random() * this.cases.length) << 0];
  },
  markAsSuccess: function(id) {
    if (id in this.tracking) {
      this.tracking[id].success = true;
    }
  },
  getSuccessImage: function(cb) {
    fs.readFile("./public/success.png", cb);
  },
  getStats: function() {
    return this.cases.reduce(function(acc, caseName) {
      var total = 0, successful = 0;
      for (var id in this.tracking) if (this.tracking[id].caseName === caseName) {
        ++total;
        if (this.tracking[id].success) ++successful;
      }
      acc[caseName] = {
        total: total,
        successful: successful
      };
      return acc;
    }.bind(this), {})
  }
}

function identify_client_ip(req) {
  return req.connection.remoteAddress;
}

function identify_client_cookie(req) {
  var cookies = (req.headers.cookie || "").split(";"),
      id;
  cookies.forEach(function(cookie) {
    if (cookie.indexOf("abtesting=") == 0) {
      id = cookie.split("=")[1];
    }
  });
  return (id)? id : CaseManager._userID++;
}

var identify_client = identify_client_ip;

function serveFile(path, caseName, req, res, id) {
  if(path === "/") {
    path = "/index.html";
  }
  var filePath = "./public/" + caseName + path;
  console.log(caseName, "PATH ", path, id);
  console.log(filePath)
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(err, data) {
        if (err) {
          res.writeHead(500);
          res.end("Ha ocurrido algo malo");
        } else {
          res.writeHead(200, {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          })
          res.end(data);
        }
      })
    } else {
      res.writeHead(404);
      res.end("No existe!")
    }
  })
}

var server = http.createServer(),
    caseManager = new CaseManager(config.cases);

server.on("request", function(req, res) {
  var urlData = url.parse(req.url),
      path = urlData.pathname,
      clientID = identify_client(req);

  switch(path) {
    case "/stats":
      res.end(JSON.stringify(caseManager.getStats()));
      break;
    case "/statsPage":
      serveFile("statsPage.html", "", req, res);
      break;
    case "/success.png":
      caseManager.markAsSuccess(clientID);
      caseManager.getSuccessImage(function(err, data) {
        if (err) return res.end("Oh, oh...");
        res.end(data);
      })
      break;
    default:
      serveFile(path, caseManager.getCaseFor(clientID), req, res, clientID);
  }
})

server.listen(3000)

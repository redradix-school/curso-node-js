var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    Mustache = require("mustache")

var publicPath = "./public",
    templatePath = "./templates",
    store = {
      tokens: {},
      getToken: function() {
        var token = randomString(10)
        while (token in this.tokens) token = randomString(10);
        this.tokens[token] = [];
        return token;
      },
      checkToken: function(token) {
        return (token in this.tokens);
      },
      removeToken: function(token) {
      },
      addClientToToken: function(client, token) {
        if (token in this.tokens) {
          console.log("New client in", token)
          this.tokens[token].push(client);
        }
      },
      removeClientFromToken: function(client, token) {
        if (!token in this.tokens) return;
        var clients = this.tokens[token];
        for (var i=0,_len=clients.length; i<_len; i++) {
          if (clients[i] == client) {
            clients.splice(i, 1);
            break;
          }
        }
        this.tokens[token] = clients;
      },
      getClientsFor: function(token) {
        if (token in this.tokens) {
          return this.tokens[token];
        } else {
          return [];
        }
      }
    };

function randomString(length) {
  var base = 36;
  return Math.floor(Math.random()*Math.pow(base, length)).toString(base);
}

function send_html(req, res, fileName) {
  var filePath = publicPath + fileName;
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(err, data) {
        if (err) {
          res.writeHead(500);
          return res.end("Oops!")
        }
        res.send(data);
      })
    } else {
      res.writeHead(404);
      res.end("No existe!")
    }
  })
}

function render(res, template, data) {
  var filePath = templatePath + template;
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(err, text) {
        if (err) {
          res.writeHead(500);
          return res.end("Oops!");
        }
        res.end(Mustache.render(text.toString(), data))
      })
    } else {
      res.writeHead(404);
      res.end("No existe!")
    }
  })
}

function source_waiting(req, res, token) {
  if (token === undefined || !store.checkToken(token)) {
    res.writeHead(301, {Location: "/transfer"});
    return res.end();
  }
  var clients = store.getClientsFor(token);
  console.log("*", token, ":", clients.length)
  render(res, "/waiting.html", {token: token, clients: clients.length});
}

function client_waiting(req, res, token) {
  if (token === undefined || !store.checkToken(token)) {
    res.writeHead(301, {Location: "/notFound.html"});
    return res.end();
  }
  store.addClientToToken(res, token);
  res.on("close", store.removeClientFromToken.bind(store, res, token));
  res.on("end", store.removeClientFromToken.bind(store, res, token));
  render(res, "/client-waiting.html", {token: token});
}

function download_file(req, res, token) {
  console.log(" -> waiting for download on", token)
}

function upload_file(req, res) {
  req.setBodyEncoding("binary");
  var stream = new multipart.Stream(req);
  stream.addListener("part", function(part) {
    part.addListener("body", function(chunk) {
      var progress = (stream.bytesReceived/stream.bytesTotal * 100).toFixed(2);
      var mb = (stream.bitesTotal / 1024 / 1024).toFixed(1);
      sys.print("Uploading "+mb+"mb ("+progress +"%)\015");
    });
  });
  stream.addListener("complete", function() {
    res.sendHeader(200, {"Content-Type": "text/plain"});
    res.sendBody("Thanks for playing!");
    res.finish();
    sys.puts("\n=> Done");
  });
}

http.createServer(function(req, res) {
  var urlData = url.parse(req.url, true)
  switch (urlData.pathname) {
    case "/client":
      // token=<token>
      client_waiting(req, res, urlData.query.token)
      break;
    case "/transfer":
      var token = store.getToken();
      res.writeHead(301, {
        Location: '/waiting?token='+token,
      });
      res.end();
      break;
    case "/waiting":
      // token=<token>
      source_waiting(req, res, urlData.query.token)
      break;
    case "/upload":
      upload_file(req, res);
      break;
    case "/download":
      download_file(req, res, urlData.query.token);
      break;
    default:
      send_html(req, res, urlData.pathname)
  }
})
.listen(3000)

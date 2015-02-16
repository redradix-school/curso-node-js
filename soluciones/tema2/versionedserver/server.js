var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    path = require("path"),
    Q = require("q"),
    format = require("util").format,
    inspect = require("util").inspect,
    routes = require("./simpleRoute");

/* Global state */

var version = 0,
    cache = [],
    baseDir = path.resolve(__dirname, process.argv[2] || "./");

/* FS Utils */

function assureSlash(string) {
  if (string.slice(-1) != "/") { string += "/"; }
  return string;
}

function listFiles(path) {
  return Q.ninvoke(fs, "readdir", path)
  .then(function(files) {
    return files.map(function(f) {
      var filePath = assureSlash(path) + f;
      return Q.ninvoke(fs, "stat", filePath)
      .then(function(stats) { return {path: filePath, stats: stats}; });
    });
  })
  .spread(function() {
    return [].map.call(arguments, function(fileInfo) {
      if (fileInfo.stats.isDirectory()) {
        return listFiles(fileInfo.path)
      } else {
        return [fileInfo]
      }
    })
  })
  .spread(function() {
    return [].concat.apply([], arguments)
  });
}

var somethingChanged = (function() {
  var lastChange = 0;
  return function(fileList) {
    var changed = false;
    return Q(fileList).then(function(list) {
      list || (list = [])
      list.forEach(function(fileInfo) {
        var mtime = fileInfo.stats.mtime.getTime();
        if (mtime > lastChange) {
          changed = true;
          lastChange = mtime;
        }
      });
      return changed;
    });
  };
}());

function readAllFiles(fileList) {
  return Q(fileList).then(function(list) {
    return Q.all(list.map(function(fileInfo) {
      return Q.ninvoke(fs, "readFile", fileInfo.path)
      .then(function(data) {
        fileInfo.data = data;
        return fileInfo;
      });
    }));
  });
}

/* Update */

setInterval(function() {
  listFiles(baseDir).then(function(listing) {
    return [listing, somethingChanged(listing)]
  })
  .spread(function(listing, changed) {
    if (changed) {
      readAllFiles(listing).then(function(allFiles) {
        allFiles.stamp = Date.now();
        cache[version] = allFiles;
        console.log("* [%s] new version: %s!", new Date(), version)
        version++;
      });
    }
  })
  .done()
}, 500);

/* Routes */

routes.get("/", function(req, res) {
  res.write("<html><body>");
  res.write("<a href='/list?version=latest'>Latest</a><br>");
  for (var i=0, _len=cache.length; i<_len; i++) {
    res.write(format("<a href='/list?version=%d'>Version %d (%s)</a><br>", i, i, new Date(cache[i].stamp)));
  }
  res.end("</body></html>");
});

routes.get("/list", function(req, res) {
  function ignoreFile(filePath) {
    return filePath.indexOf(".git") === 0
           || filePath.indexOf("node_modules") === 0
           || filePath.indexOf(".") === 0;
  }
  var version = req.url.query.version,
      // latest siempre apunta a la última versión
      index = (version === "latest") ? cache.length-1 : +version;
  res.write("<html><body>");
  (cache[index] || []).forEach(function(fileInfo) {
    var relativePath = path.relative(baseDir, fileInfo.path);
    if (!ignoreFile(relativePath)) {
      res.write(format("<a href='%s?version=%s'>%s</a><br>",  relativePath, version, relativePath));
    }
  });
  res.end("</body></html>");
});

routes.get("default", function(req, res) {
  var version = req.url.query.version,
      filePath = path.resolve(baseDir, "." + req.url.pathname),
      files,
      file;

  // latest siempre apunta a la última versión
  version = (version === "latest") ? cache.length-1 : +version;

  if (version >= 0 && version < cache.length) {
    files = cache[version];
    for (var i=files.length; i--;) {
      file = files[i];
      if (file.path === filePath) {
        return res.end(file.data);
      }
    }
    res.writeHead(404);
    res.end("No existe...")
  } else {
    res.writeHead(404);
    res.end("Gamberro!");
  }
});

routes.listen(http.createServer(), 3456);

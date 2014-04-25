var express = require("express"),
    app = express();

var stats = { times: 0, mean: 0, total: 0 };

app.use(function(req, res, next) {
  var stamp = Date.now();
  res.on("finish", function() {
    var time = Date.now() - stamp;
    stats.times++;
    stats.total += time;
    stats.mean = stats.total / stats.times;
    if (time - stats.mean > 300) {
      console.log(" --> ", Date.now() - stamp);
    }
  });
  next();
});


app.get("/fast", function(req, res) {
  res.send(200, "ok");
});

app.get("/slow", function(req, res) {
  setTimeout(function() {
    res.send(200, "ok");
  }, 1000);
});

app.listen(3000);

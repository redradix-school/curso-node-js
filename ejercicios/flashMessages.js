"use strict";

var express = require("express"),
    cookieParser = require("cookie-parser"),
    app = express();

app.use(cookieParser("asdfasdf"));
app.use(function(req, res, next) {
  var message = req.cookies.message;
  res.cookie("message", "");
  req.flash = {
    message: function(msg) {
      if (msg) {
        res.cookie("message", msg);
      } else {
        return message;
      }
    }
  };
  next();
});

// Esto es para Santiago:
app.use(function(req, res, next) {
  var realSend = res.send;
  res.send = function() {
    console.log(arguments);
    return realSend.apply(res, arguments);
  };
  next();
});

app.get("/test", function(req, res) {
  var random = Math.random();
  if (random > 0.5) {
    req.flash.message("Mayor!");
  } else {
    req.flash.message("Menor!");
  }
  res.redirect("/test2");
});

app.get("/test2", function(req, res) {
  var message = req.flash.message();
  res.send(200, req.flash.message());
});

app.listen(3000);

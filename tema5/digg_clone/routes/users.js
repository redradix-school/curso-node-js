var express = require('express');
var resources = require('./resources');
var auth = require('../simpleauth');

var usersController = {
  create: function(req, res) {
  },
  me: function(req, res) {
  },
  login: function(req, res) {
  }
};

var router = express.Router();
router.post('/session', auth.createSession(), usersController.login);
router.post('/users', usersController.create);
router.get('/me', auth.requiresToken, usersController.me);

module.exports = router;

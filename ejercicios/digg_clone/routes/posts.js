var express = require('express');
var resources = require('./resources');
var auth = require('../simpleauth');

var postsController = {
  index: function(req, res) {
  },
  show: function(req, res) {
  },
  create: function(req, res) {
  },
  update: function(req, res) {
  },
  "delete": function(req, res) {
  },
  vote: function(req, res) {
  },
  param: function(req, res, next, postId) {
  }
};

var router = express.Router();
router.use(auth.requiresToken);
resources(router, 'posts', postsController);
router.post('/:postsid/vote/:vote', postsController.vote);

module.exports = router;

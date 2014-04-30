var express = require('express');
var resources = require('./resources');
var auth = require('../simpleauth');

var commentsController = {
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
resources(router, 'comments', commentsController);
router.post('/:commentsid/vote/:vote', commentsController.vote);

module.exports = router;

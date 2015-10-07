var express = require('express');
var auth = require('../simpleauth');

var Comment = require('../models/comment');
var Post = require('../models/post');

var commentsController = {
  index: function(req, res) {
    var postId = req.query.post_id;
    Comment.getByPostId(postId).then(function(comments){
      res.send(comments);
    });
  },
  create: function(req, res) {
    console.log('Create comment', req.body);
    //cargar el post primero para ver si existe
    Post.getById(req.body.post_id).then(function(post){
      if(!post){
        return res.status(404).end();
      }
      var newComment = req.body;
      newComment.date = Date.now();
      newComment.user = {
        name: req.user.name,
        id: req.user.id
      }
      delete newComment.token;
      Comment.save(newComment).then(function(comment){
        //tengo que sumar comentario al post
        post.ncomments++;
        Post.save(post).then(function(post){
          res.status(201).send(comment);
        });
      })
      .catch(function(err){
        console.log('Error saving comment', err);
        res.status(400).end();
      });
    })
    .catch(function(err){
      res.status(404);
    })

  },
  vote: function(req, res) {
    req.comment.votes++;
    Comment.save(req.comment).then(function(comment){
      res.send(comment);
    });
  },
  param: function(req, res, next, commentId) {
    Comment.getById(commentsId).then(function(comment){
      if(comment){
        req.comment = comment;
        next();
      }
      else {
        res.status(404).end();
      }
    })
  }
};

var router = express.Router();
router.use(auth.requiresToken);
router.get('/', commentsController.index);
router.post('/', commentsController.create);
router.post('/:commentId/vote/:vote', commentsController.vote);
router.param('commentId', commentsController.param);

module.exports = router;

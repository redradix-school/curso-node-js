var express = require('express');
var auth = require('../simpleauth');

var Post = require('../models').post;

var postsController = {
  index: function(req, res) {
    Post.getPostsBySection(req.query.s, req.query.page).then(function(posts){
      res.send(posts);
    });
  },
  show: function(req, res) {
    res.send(req.post);
  },
  create: function(req, res) {
    var postData = req.body;
    //set the user who created it
    postData.user = req.user;
    postData.date = Date.now();

    Post.save(postData).then(function(newPost){
      res.status(201).send(newPost);
    });
  },
  update: function(req, res) {
    Post.save(req.body).then(function(post){
      console.log('Post updated', post);
      res.status(200).send(post);
    })
  },
  "delete": function(req, res) {
    //no implementado en la UI
  },
  vote: function(req, res) {
    //ya tenemos el post en req.post
    var updatedPost = req.post;
    console.log('Voting on', req.post);
    if(req.params.vote === 'up'){
      updatedPost.votes++;
    }
    if(req.params.vote === 'down'){
      updatedPost.votes--;
    }
    Post.save(updatedPost).then(function(post){
      res.status(200).send(post);
    });
  },
  param: function(req, res, next, postId) {
    Post.getById(postId).then(function(post){
      console.log('Post param', post);
      if(post){
        req.post = post;
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

router.param('postId', postsController.param);
router.get('/', postsController.index);
router.post('/', postsController.create);
router.get('/:postId', postsController.show);
router.put('/:postId', postsController.update);
router.delete('/:postId', postsController.delete);
router.post('/:postId/vote/:vote', postsController.vote);


module.exports = router;

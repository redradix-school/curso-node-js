var utils = require('./utils');
var ObjectID = require('mongodb').ObjectID;

var Comment = {
  getByPostId: function(postId){
    var collection = utils.collection('comments');
    //TODO: devolver los comentarios que tengan ese postId
  },
  getById: function(commentId){
    var collection = utils.collection('comments');
    //TODO: Devolver un único comentario a partir de su id
  },
  save: function(comment){
    //TODO: guardar un comentario
  }
}

module.exports = Comment;
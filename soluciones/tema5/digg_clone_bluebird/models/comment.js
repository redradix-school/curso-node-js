var utils = require('./utils');
var ObjectID = require('mongodb').ObjectID;

var Comment = {
  getByPostId: function(postId){
    var collection = utils.collection('comments');
    return collection.find({ 'post_id': postId })
      .sort([['date', 1]])
      .toArrayAsync();
  },
  getById: function(commentId){
    var collection = utils.collection('comments');
    return collection.findOneAsync({ _id: ObjectID(commentId )});
  },
  save: function(comment){
    var collection = utils.collection('comments');
    return collection.saveAsync(comment);
  }
}

module.exports = Comment;
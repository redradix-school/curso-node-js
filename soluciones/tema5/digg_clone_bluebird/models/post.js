var utils = require('./utils');
var ObjectID = require('mongodb').ObjectID;

var COLNAME = 'posts';
var PAGE_SIZE = 10;

var Post = {
  getPostsBySection: function(section, page){
    var page = page || 0;
    var collection = utils.collection(COLNAME);
    var cursor = collection.find({}).limit(PAGE_SIZE).skip(PAGE_SIZE*(page));
    switch(section){
    case 'hottest':
      cursor = cursor.sort([['votes', -1]]);
      break;
    case 'latest':
      cursor = cursor.sort([['date', -1]]);
    }
    return cursor.toArrayAsync();
  },
  getById: function(id){
    var collection = utils.collection(COLNAME);
    return collection.findOneAsync({ _id: ObjectID(id)});
  },
  save: function(post){
    var collection = utils.collection(COLNAME);
    return collection.saveAsync(post);
  },
}


module.exports = Post;


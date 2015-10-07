var utils = require('./utils');
var ObjectID = require('mongodb').ObjectID;

var COLNAME = 'posts';
var PAGE_SIZE = 10;

var Post = {
  getPostsBySection: function(section, page){
    var page = page || 0;
    var collection = utils.collection(COLNAME);
    // TODO: devolver los Posts correspondientes a la página y ordenados según la sección
    // limit(PAGE_SIZE).skip(PAGE_SIZE*page)
  },
  getById: function(id){
    var collection = utils.collection(COLNAME);
    //devolver un Post por su ID
    return collection.findOneAsync({ _id: ObjectID(id)});
  },
  save: function(post){
    //TODO: guardar un post
  },
}


module.exports = Post;


var Promise = require('bluebird');

var client = null;

exports.setClient = function(mongoClient) {
  client = mongoClient;
};

exports.getClient = function(){
  return client;
}

exports.collection = function(name){
  return client.collection(name);
}

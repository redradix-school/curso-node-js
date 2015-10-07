//Utilidades para Modelos

//referencia al cliente MongoDB
var client = null;

exports.setClient = function(mongoClient) {
  client = mongoClient;
};

exports.getClient = function(){
  return client;
}

//Devuelve una colección del cliente MongoDB
exports.collection = function(name){
  return client.collection(name);
}

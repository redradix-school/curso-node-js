var utils = require('./utils');

var User = {
  checkCredentials: function(email, password) {
    var collection = utils.collection('users');
    //TODO: encontrar un usuario con el email y password y devolver la promesa
  },
  getUserByToken: function(token){
    var collection = utils.collection('users');
    // TODO: encontrar un usuario a partir del token
  },
  save: function(userdata){
    var collection = utils.collection('users');
    userdata.token = Date.now().toString(16);
    return collection.saveAsync(userdata);
  }
}


module.exports = User;

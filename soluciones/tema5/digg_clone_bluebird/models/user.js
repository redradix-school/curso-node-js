var utils = require('./utils');

var User = {
  checkCredentials: function(email, password) {
    var collection = utils.collection('users');
    return collection.find({ email: email, password: password }).limit(1).toArrayAsync();
  },
  getUserByToken: function(token){
    var collection = utils.collection('users');
    return collection.findOneAsync({ token: token });
  },
  save: function(userdata){
    var collection = utils.collection('users');
    userdata.token = Date.now().toString(16);
    return collection.saveAsync(userdata);
  }
}


module.exports = User;

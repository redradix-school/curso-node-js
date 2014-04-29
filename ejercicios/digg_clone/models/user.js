var op = require('./utils').op;
var user = op.bind({}, "users");

// ejemplo
user.checkCredentials = function(email, password) {
  return user("findOne", {email: email, password: password});
};


module.exports = user;

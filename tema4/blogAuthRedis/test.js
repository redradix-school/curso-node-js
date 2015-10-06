var Promise = require('bluebird'),
    client = require('redis').createClient();


client.subscribeAsync('foo').then(function(msg){
  console.log('Mensaje!!!', msg);
});


client.publishAsync('foo', 'hola mundo');
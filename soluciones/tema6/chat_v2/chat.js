'use strict';
var request = require('request');

//Usamos una factoría para configurarlo todo
// server -> http.server instance
module.exports = function(server){
  //montamos socket.io sobre el servidor HTTP
  var io = require('socket.io').listen(server);

  io.on('connection', function(socket){
    var interval;

    //Atender mensaje "hello"
    socket.on('hello', function(client){
      console.log(client.name + ' se ha unido al chat');

      //mandar mensaje aleatorio cada 15 segundos
      interval = setInterval(function(){
        sendRandomJoke(socket, client.name);
      }, 15000);

      //mandar uno nada más conectar
      sendRandomJoke(socket, client.name);

    });

    //recibir mensajes
    socket.on('message', function(msg, cb){
      socket.broadcast.emit('message', msg);
      //callback, si existe
      if(typeof(cb)==='function'){
        cb();
      }
    });

    socket.on('disconnect', function(){
      console.log('client disconnected!');
      clearInterval(interval);
    });

  });
}

//Una función que nos envía una broma estilo Chuck Norris aleatoria
//al socket que recibe como argumento. En lugar de Chuck usará el nombre
//del cliente conectado
function sendRandomJoke(socket, name){
  var cappedName = name.charAt(0).toUpperCase() + name.slice(1);
  request.get('http://api.icndb.com/jokes/random?firstName=' + cappedName + '&lastName=', function(err,response,body){
    body = JSON.parse(body);
    socket.emit('message', {
        from: {
          name: 'Bot',
          avatar: '/assets/images/avatar.jpg'
        },
        message: {
          date: Date.now(),
          text: body.value.joke
        }
    });
  });


}
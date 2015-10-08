$(function() {
  var me;
  //lo primero, obtener mis datos enviados en el login
  $.get('/me').then(function(data){
    me = data;
    startChat();
  });

  function startChat(){
    //conectar socket
    var socket = io.connect('');
    socket.on('connect', function(){

      console.log('Conectado al servidor');
      socket.emit('hello', me);

      socket.on('message', function(msg){
        console.log('Recibido', msg);
        Chat.postMsg(msg.from, msg.message);

      });

      Chat.registerHandler(function(msg){
        if(msg.indexOf('/join') === 0){
          //it's a join command!
          var channel = msg.split(' ');
          if(channel.length !== 2){
            alert("Usa /join <canal>");
            return;
          }
          else {
            channel = channel[1];
            socket.join(channel);
            return;
          }
          // var payload = {
          //   from: me,
          //   channel: msg.split(' ')[1]
          // }
        }
        var payload = {
          from: me,
          message: { date: Date.now(), text: msg }
        };

        socket.emit('message', payload, function(){
          //mensaje recibido
          Chat.showMyMsg(payload.from, payload.message);
        });
      });
    });
  }

});

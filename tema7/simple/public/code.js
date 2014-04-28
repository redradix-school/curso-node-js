$(function() {

  var socket = io.connect("http://localhost:3000/"),
      me = $.get("/me");

  Chat.registerHandler(function(msg) {
    var msgData = {text: msg, date: new Date()}
    me.then(function(me) {
      socket.emit("send:message", me, msgData);
      Chat.showMyMsg(me, msgData);
    })
  })

  socket.on("posted:message", function(user, msgData) {
    Chat.postMsg(user, msgData);
  })

});

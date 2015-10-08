$(function(){
  $('.new').on('click', function(){
    $(this).parents('.actions').toggleClass('active');
  });
});

var Chat = {
  newMessage: function(msg) {
    if (this.handler) this.handler(msg);
  },
  registerHandler: function(fn) {
    this.handler = fn;
  },
  postMsg: function(from, msg) {
    var template = $("#other-message").html();
    var code = template
        .replace("%avatar%", from.avatar)
        .replace("%name%", from.name)
        .replace("%content%", msg.text)
        .replace("%time%", new Date(msg.date).toLocaleTimeString());
    var $messages = $(".messages").append(code);
    $("body").stop().animate({ scrollTop: $messages.height() }, 400);
  },
  showMyMsg: function(from, msg) {
    var template = $("#my-message").html();
    var code = template
        .replace("%avatar%", from.avatar)
        .replace("%name%", from.name)
        .replace("%content%", msg.text)
        .replace("%time%", new Date(msg.date).toLocaleTimeString());
    var $messages = $(".messages").append(code);
    $("body").stop().animate({ scrollTop: $messages.height() }, 400);
  }
};

//handles sending messages with <ENTER> key
$("textarea.js-input").keyup(function(e){
  if(e.keyCode === 13 && !e.shiftKey){
    e.preventDefault();
    $("form.new-message").submit();
  }
});


$("form.new-message").submit(function(e) {
  e.preventDefault();
  var textarea = $(this).find("textarea");
  Chat.newMessage(textarea.val());
  textarea.val("");
});
$(function(){
  $('.new').on('click', function(){
    $(this).parents('.actions').toggleClass('active');
  });
});

var Chat = {
  newMessage: function(msg) {
    if (this.handler) this.handler(msg)
  },
  registerHandler: function(fn) {
    this.handler = fn
  },
  postMsg: function(from, msg) {
    var template = $("#other-message").html(),
        code = template.replace("%avatar%", from.avatar)
                       .replace("%name%", from.name)
                       .replace("%content%", msg.text)
                       .replace("%time%", msg.date)
    $(".messages").append(code)
  },
  showMyMsg: function(from, msg) {
    var template = $("#my-message").html(),
        code = template.replace("%avatar%", from.avatar)
                       .replace("%name%", from.name)
                       .replace("%content%", msg.text)
                       .replace("%time%", msg.date)
    $(".messages").append(code)
  }
}

$("form.new-message").submit(function(e) {
  var textarea = $(this).find("textarea")
  e.preventDefault();
  Chat.newMessage(textarea.val())
  textarea.val("")
})

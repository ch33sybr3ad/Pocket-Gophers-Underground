// ##client sends information to server ##

var socket = io.connect('http://localhost:8000/')
$(document).ready(function() {

  checkPass();
  socket.emit('join', prompt('What is your name?'));

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    var message = $('#chat-box').val();
    socket.emit('messages', message);
  });

  // ##client receives information from server##

});

socket.on('messages', function(data) {
  data = JSON.parse(data);
  $('div.chatroom').append("<p>" +"<span class='muted'>" +data.date+ "</span></p><blockquote>" +data.name+ ": " +data.data+ "</blockquote>");
});

function checkPass() {
  var password = prompt("Who is our captain and leader?")
  if (password !== "Jordan") {
    checkPass();
  }
}

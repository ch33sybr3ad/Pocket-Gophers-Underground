// ##client sends information to server ##

var socket = io.connect('http://localhost:8000/')
var name;
$(document).ready(function() {

  socket.emit('join', (name = prompt('What is your name?')));

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    var message = $('#chat-box').val();
    socket.emit('messages', message);
  });

  // ##client receives information from server##

});

socket.on('messages', function(data) {
  console.log('receives' + data);
  $('div.chatroom').append("<p>" +data+ new Date.toUTCString()+ "</p>");
});

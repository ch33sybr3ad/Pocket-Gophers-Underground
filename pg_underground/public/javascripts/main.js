// ##client sends information to server ##

var socket = io.connect('http://localhost:8000/')

$(document).ready(function() {


  $('#chat').on('submit', function(e) {
    e.preventDefault();
    console.log('snet')
    var message = $('#chat-box').val();
    socket.emit('messages', message);
  });

  // ##client receives information from server##

});

socket.on('messages', function(data) {

  console.log('receives' + data);
  $('div.chatroom').append(data);
});

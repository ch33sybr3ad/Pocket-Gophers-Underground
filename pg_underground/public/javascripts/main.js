// ##client sents information to server ##

$(document).ready(function() {

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    console.log('snet')
    var message = $('#chat-box').val();
    socket.emit('messages', message);
  });

  // ##client receives information from server##

  var socket = io.connect('http://localhost:8000/')

  socket.on('messages', function(data) {
    // alert(data.hello);
  });

});

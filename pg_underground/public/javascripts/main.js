// ##client sends information to server ##

var socket = io.connect('http://localhost:8000/')
$(document).ready(function() {

  // checkPass();
  socket.emit('join', (name = prompt('What is your name?')));

  $('.container > p').append( ', '+ name);

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    var message = $('#chat-box').val();
    socket.emit('messages', message);
  });

  $('.start').on('click', function() {
    socket.emit('start');
    // $('.start').attr('disabled', 'disabled');
  });

  $('.ready').on('click', function() {
    socket.emit('ready');
    // $('.ready').attr('disabled', 'disabled');
  });

  // ##client receives information from server##

});

socket.on('messages', function(data) {
  data = JSON.parse(data);
  $('div.chatroom').append("<p>" +"<span class='muted'>" +data.date+ "</span></p><blockquote>" +data.name+ ": " +data.data+ "</blockquote>");
});

socket.on('deal', function(cards){
  console.log(cards);
  console.log(JSON.parse(cards));
  $('div.card-show').empty();

  JSON.parse(cards).forEach(function(card) {
    $('div.card-show').append("<p>" +card+ "</p>")
  });
});

socket.on('lose', function(name) {
  alert('sorry, you lost to ' + name);
});

socket.on('win', function() {
  alert('You win!!!!!')
});

socket.on('reset', function() {
  $('.start').removeAttr('disabled');
  $('div.card p').remove();
});

function checkPass() {
  var password = prompt("Who is our captain and leader?")
  if (password !== "Jordan") {
    checkPass();
  }
}

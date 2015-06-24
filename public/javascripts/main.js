var socket = io.connect(window.location.origin);

$(document).ready(function() {

  socket.emit('join', (name = prompt('What is your name?')));

  $('.container > p').append( ', '+ name);

  socket.on('allchatters', function(data) {
    console.log(data);
    $('.users').empty();
    data.forEach(function(name) {
      $('.users').append("<p>" +name+ "</p>");
    });
  });

  $('#chat').on('submit', function(e) {
    e.preventDefault();
    var message = $('#chat-box').val();
    $('#chat-box').val('');
    socket.emit('messages', message);
  });

  $('.start').on('click', function() {
    socket.emit('start');
  });

  $('.draw').on('click', function() {
    socket.emit('draw');
    // $('.start').attr('disabled', 'disabled');
  });

  $('.ready').on('click', function() {
    socket.emit('ready');
    // $('.ready').attr('disabled', 'disabled');
  });

  socket.on('busted', function() {
    socket.emit('ready');
    $('.ready').attr('disabled', 'disabled');
    $('.start').attr('disabled', 'disabled');
    $('.draw').attr('disabled', 'disabled');
    alert('YOU BUSTED SUCKA PAY UP');
  });

});

socket.on('messages', function(data) {
  data = JSON.parse(data);
  $('div.chatroom').append(
    "<p>" +
      "<span class='muted'>" +
        data.date +
      "</span>" +
    "</p>" +
    "<blockquote>" +
      data.name+ ": " +data.data+
    "</blockquote>");
});

socket.on('deal', function(cards) {
  console.log(cards);
  console.log(JSON.parse(cards));
  $('div.card-show').empty();
  JSON.parse(cards).forEach(function(card) {
    $('div.card-show').append(
      "<div class='card'><p>" +card+ "</p></div>"
    );
  });
});

socket.on('lose', function() {
  alert('sorry, you lost');
});

socket.on('win', function() {
  alert('You win!!!!!')
});

socket.on('reset', function() {
  $('.start').removeAttr('disabled');
  $('.draw').removeAttr('disabled');
  $('.ready').removeAttr('disabled');
  $('div.card').remove();
});

socket.on('loner', function() {
  alert('stop playing with yourself, loser')
});

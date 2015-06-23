var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// var server = require('http').createServer(app);
var io = require('socket.io')(server);


if(process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var redis = require('redis').createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(':')[1]);
} else {
  redisClient = redis.createClient();
}

var clients = {};
// deals with chats messages
io.on('connection', function(client) {

  clients[client.id] = client;
  console.log(Object.keys(clients).length + 'are logged in');
    var names = [];

  client.on('join', function(name) {
    client.name = name
    for (var i in clients) {
      names.push(clients[i].name);
    }
    io.sockets.emit('allchatters', names);
    console.log(names)
    console.log(client.name + ' joined');
    redisClient.lrange('messages', 0, -1, function(err, messages) {
      messages.reverse().forEach(function(message) {
        client.emit('messages', message)
      });
    });
  });

  client.on('messages', function(data) {
    var stringy = JSON.stringify({ data: data, name: client.name, date: new Date().toUTCString()});
    redisClient.lpush('messages', stringy );
    redisClient.ltrim('messages', 0, 49);
    io.sockets.emit('messages', stringy );
  });

  client.on('disconnect', function() {
    delete clients[client.id];
    names.splice(names.indexOf(client.name));
    io.sockets.emit('allchatters', names);
    console.log('one user logged out' +Object.keys(clients).length + ' clients are still on');
  });
});

var cards = [
  1,2,3,4,5,6,7,8,9,10,10,10,10,
  1,2,3,4,5,6,7,8,9,10,10,10,10,
  1,2,3,4,5,6,7,8,9,10,10,10,10,
  1,2,3,4,5,6,7,8,9,10,10,10,10
]
// deals with playing card game
io.on('connection', function(client) {
  console.log('game function is connecting as well')
  client.cards = [];
  client.ready = false;
  client.playing = false;

  client.on('start',function() {
    console.log(client.name + " has started playing the game")
    client.playing = true;
  });

  client.on('draw', function(){
    if (client.playing === false) { return; }
    console.log(client.name + " has drawn a card");
    var rand = Math.floor(Math.random() * cards.length);
    client.cards.push(cards.splice(rand, 1)[0]);
    client.emit('deal', JSON.stringify(client.cards));
    if (count(client) > 21) {
      client.emit('busted')
      client.cards = []
      return;
    }
    console.log(client.cards);
    console.log(cards)
  });

  client.on('ready', function() {
    if (client.playing === false) { return; }
    console.log(client.name + " is ready to show his cards");
    client.ready = true
    if (checkEveryoneReady()) {
      console.log('everyone playing is ready');
      if (getPlayers().length > 1) {
        winCondition();
      } else {
        client.emit('loner');
        resetGame()
      }
    }
  });
});


function winCondition() {
  var max = 0;
  var winners = [];
  for (var i in clients) {
    if (count(clients[i]) > max) {
      max = count(clients[i]);
      winners = [clients[i]];
    } else if (count(clients[i]) === max) {
      winners.push(clients[i]);
    }
  }
  getPlayers().forEach(function(player) {
    if (winners.indexOf(player) >= 0) {
      player.emit('win');
    } else {
      player.emit('lose');
    }
  });
  resetGame()
}

function count(client) {
  return client.cards.reduce(function(sum, card) {
    return sum + card
  }, 0);
}

function getPlayers() {
  var players = [];
  for (var i in clients) {
    if (clients[i].playing === true) {
      players.push(clients[i]);
    }
  }
  return players;
}

function checkEveryoneReady() {
  if (!getPlayers()[0]) { return false }
  return getPlayers().every(function(player) {
    return player.ready;
  });
}

function resetGame() {
  getPlayers().forEach(function(player) {
    player.playing = false;
    player.ready = false;
    player.cards = [];
    player.emit('reset');
  });
  cards = [
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10
  ]
}

// server.listen(8000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

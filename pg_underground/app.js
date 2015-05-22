var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis')

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

redisClient = redis.createClient();

var clients = {};

io.on('connection', function(client) {

  clients[client.id] = client;
  console.log(Object.keys(clients).length + 'are logged in');

  client.on('join', function(name) {
    client.name = name
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
    console.log('one user logged out' +Object.keys(clients).length + ' clients are still on');
  });
});

var cards = [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]


io.on('connection', function(client) {
  client.cards = [];
  client.ready = false;

  console.log('game function is connecting as well')
  client.on('start', function(){
    console.log(client.name + "~~~~~~~");
    var rand = Math.floor(Math.random() * cards.length);
    client.cards.push(cards.splice(rand, 1)[0]);
    client.emit('deal', JSON.stringify(client.cards));
    console.log(client.cards);
    console.log(cards)
  });

  client.on('ready', function() {
    client.ready = true

  });


});

//not valid yet (works for single high/low game)
function winCondition() {
  var max = 0;
  var winner;
  for (var i in clients) {
    if (clients[i].card > max) {
      max = clients[i].card;
      winner = clients[i];
    }
  }
  console.log(winner.name)
  winner.broadcast.emit('lose', winner.name);
  winner.emit('win');
  io.sockets.emit('reset')
}
server.listen(8000);
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

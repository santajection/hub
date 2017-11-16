var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

var game = require('./game');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.initSocketIO = function(io) {
  io.sockets.on('connection', function (socket) {
    console.log('connected');
    socket.on('msg send', function (msg) {
      socket.emit('msg push', msg);
      socket.broadcast.emit('msg push', msg);
    });
  });

  var mobile = io.of('/mobile').on('connection', function(socket) {
    game.join(socket.id);
    socket.on('proj', function (msg) {
      game.move(socket.id, 1);
    });
  });

  var proj = io.of('/proj').on('connection', function(socket) {
    game.connect(socket);
  });

  var unnei = io
    .of('/unnei')
    .on('connection', function(socket) {
      console.log('news connected');
      socket.on('msg send', function (msg) {
        unnei.emit('msg push', msg + ' from news');
      });
      socket.on('game initialize', function (msg) {
        game.initialize();
        unnei.emit('msg push', msg + ' from news');
      });
      socket.on('game start', function (msg) {
        game.start();
        unnei.emit('msg push', msg + ' from news');
      });
      socket.on('game stop', function (msg) {
        game.end();
        unnei.emit('msg push', msg + ' from news');
      });
    });
};
game.initialize();

module.exports = app;

/***
SERVER
***/

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    hbs = require('hbs'),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// set view engine to hbs (handlebars)
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// connect to mongodb
mongoose.connect('mongodb://localhost/draw_together');

// require models
var db = require('./models');
// var Game = require('./models/game');
// var Draw = require('./models/draw');

// middleware for auth
app.use(cookieParser());
app.use(session({
  secret: 'kpoprock',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// passport config
passport.use(new LocalStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());


/***
ROUTES
***/

app.get('/', function(req, res) {
  // console.log(req.user);
  res.render('index');
});

app.get('/start', function(req, res) {
  db.Game.findOne({open: true}, function(err, game) {
    if(err) { return console.log('ERROR:', err);}
    if(!game) {
      db.Game.create({}, function(err, newGame) {
        if(err) { return console.log('ERROR:', err);}
        // go to the new create game play
        res.redirect('/games/' + newGame._id);
      });
      return console.log('new game on');
    } else {
      res.redirect('/games/' + game._id);
    }
  });
});

app.get('/games/:id', function(req, res) {
  var id = req.params.id;
  var username = req.user || 'guest'; //TODO: find username req.user.username
  var room;
  var spot;
  db.Game.findOne({_id: id}, function(err, game) {
    if(err) { return console.log('ERROR:', err);}
    if(!game.open) { res.redirect('/start'); }
    if(!game.player1) {
      spot = 1;
      game.player1 = username || 'guest_1';
      game.save();
    } else if(!game.player2) {
      spot = 2;
      game.player2 = username || 'guest_2';
      game.save();
    } else {
      spot = 3;
      game.player3 = username || 'guest_3';
      game.open = false;
      game.save();
    }
    rooms.forEach(function(ele, index) {
      if(ele.name === id) room = ele;
    });
    if(!room) {
      room = new Room(id);
      rooms.push(room);
    }
    console.log("receive", spot);
    res.render('game', {socket_id: id, spot: spot});
  });
});

/***
API
***/


/***
ROOMS
***/

var rooms = [];

// Create a new room
function Room(name) {
  this.name = name;
  this.time = Date.now();
  this.state = 'wait';
  // this.wait();
}

// Room.prototype.wait = function() {
//   var rm = this;
//   setTimeout(function(){
//     rm.state = 'start';
//   }, 50000);
// };

/***
SOCKET.IO
***/

io.on('connection', function(socket) {
  console.log('one user in');

  socket.on('newUser', function(data) {
    rooms.forEach(function(ele) { if(ele.name == data.id) socket.room = ele; });
    console.log(socket.room);
    socket.join(socket.room.name);
    socket.emit('setUser', {user: "", spot: data.num});
  });

  // socket.on('setUser', function(data) {
  //   console.log('setuser');
  // });

  setTimeout(function(){
    socket.room['state'] = 'start';
    socket.emit('gameFlow', {state: socket.room.state});
    console.log('Game start in room', socket.room.name);
  }, 10000);


  socket.on('drawClick', function(data) {
    socket.broadcast.to(socket.room).emit('draw', data);
  });

  socket.on('disconnect', function() {
    console.log('one user disconnected');
  });

});


// listen on port 3000
http.listen(3000, function() {
  console.log('server started, port 3000');
});

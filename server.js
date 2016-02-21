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
      console.log('in create game');
      db.Game.create({}, function(err, newGame) {
        if(err) { return console.log('ERROR:', err);}
        // go to the new create game play
        res.redirect('/games/' + newGame._id);
      });
      return console.log('new game on');
    } else {
      res.redirect('/games/' + game._id);
      return console.log('join old game');
    }
  });
});

app.get('/games/:id', function(req, res) {
  var id = req.params.id;
  var room;
  rooms.forEach(function(ele, index) {
    if(ele.name === id) room = ele;
  });
  if(!room) {
    room = new Room(id);
    rooms.push(room);
  }
  console.log(rooms);
  res.render('game');
});

// app.get('/games', function(req, res) {
//   res.render('game');
// });


/***
API
***/


/***
SOCKET.IO
***/

var rooms = [];

// Create a new room
function Room(name) {
  this.name = name;
}

Room.prototype.init = function() {
  this.nsp = io.of('/' + this.name);
  this.nsp.on('connection', function(socket) {
    console.log('one in the room', this.name);
  });
};

io.on('connection', function(socket) {
  console.log('one user in');

  //TODO: emit to other player

  socket.on('setUser', function(data) {

  });

  socket.on('gameFlow', function(data) {

  });

  socket.on('drawClick', function(data) {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', function() {
    console.log('one user disconnected');
  });

});


// listen on port 3000
http.listen(3000, function() {
  console.log('server started, port 3000');
});

/*********
SERVER
***/

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    hbs = require('hbs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./models');

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// set view engine to hbs (handlebars)
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

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


/*********
ROUTES
***/


var routes = require('./routes/index_controller'),
    start = require('./routes/index_controller'),
    user = require('./routes/user_controller'),
    api = require('./routes/api_controller');

routes(app);
start(app);
user(app, passport);
api(app);

app.get('/games/:id', function game_page(req, res) {
  var id = req.params.id;
  var userName = req.user ? req.user.username : null;
  var room;
  var spot;
  db.Game.findOne({_id: id}, function(err, game) {
    if(err) { return console.log('ERROR:', err);}

    // if the game is not open, redirect player to a new game
    if(!game.open) res.redirect('/start');

    // find the room and in the rooms list and check if it's still waiting
    rooms.forEach(function(ele, index) {
      if(ele.id === id) {
        // redirect player if the game is already start
        if(ele.state !== 'wait') res.redirect('/start');
        room = ele;
      }
    });

    // create a new room if it's a new game
    if(!room) {
      room = new Room(id);
      rooms.push(room);
    }

    // assign player to empty spot
    if(!game._player1) {
      spot = 1;
      game._player1 = userName || 'guest_1';
      room.wait();
    } else if(!game._player2) {
      spot = 2;
      game._player2 = userName || 'guest_2';
    } else {
      spot = 3;
      game._player3 = userName || 'guest_3';
      game.open = false;
      room.state = 'start';
      room.count();
    }

    // save the player id and condition
    game.save();

    // send the room id (aka socket id) and which spot to user
    console.log("receive", spot);
    res.render('game', {socket_id: id, spot: spot});
  });
});

/*********
ROOMS
***/

// rooms list that contain games for gameflow and socket.io
var rooms = [];

// Create a new room
function Room(id) {
  this.id = id;
  this.startTime = Date.now();
  this.countTime = 61;
  this.waitTime = 11;
  this.state = 'wait';
}

Room.prototype.wait = function() {
  var rm = this;
  // set every second
  setTimeout(function(){
    if(rm.waitTime && rm.state === 'wait') {
      io.sockets.to(rm.id).emit('gameFlow', {state: 'wait', time: rm.waitTime});
      rm.waitTime--;
      rm.wait();
    } else if(rm.state == 'wait') { // start the game but prevent double start
      // start the game and start countdown
      rm.count();
      // set false to game data
      db.Game.findOne({_id: rm.id}, function(err, game) {
        game.open = false;
        game.save();
      });
    }
  }, 1000);
};

Room.prototype.count = function() {
  var rm = this;
  // set every second
  setTimeout(function(){
    if(rm.countTime) {
      io.sockets.to(rm.id).emit('gameFlow', {state: 'start', time: rm.countTime});
      rm.countTime--;
      rm.count();
    } else {
      io.sockets.to(rm.id).emit('gameFlow', {state: 'finish', time: 0});
      rooms.splice(rooms.indexOf(rm), 1);
    }
  }, 1000);
};

/*********
SOCKET.IO
***/

io.on('connection', function(socket) {
  console.log('one user in');

  // set new player to the room base on id
  socket.on('newUser', function(data) {
    rooms.forEach(function(ele) { if(ele.id == data.id) socket.room = ele; });
    // console.log(socket.room);
    socket.join(socket.room.id);
  });

  // broadcast every movements to other player
  socket.on('drawClick', function(data) {
    socket.broadcast.to(socket.room.id).emit('draw', data);
  });

  socket.on('disconnect', function() {
    console.log('one user out');
  });

});


// listen on port 3000
http.listen(process.env.PORT || 3000, function() {
  console.log('server started, port 3000');
});

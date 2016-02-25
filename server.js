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

app.get('/', function home_page(req, res) {
  // console.log(req.user);
  res.render('index');
});

app.get('/signup', function signup_page(req, res) {
  if(req.user) {
    res.redirect('/profile');
  }
  res.render('signup');
});

app.get('/login', function login_page(req, res) {
  if(req.user) {
    res.redirect('/profile');
  }
  res.render('login');
});

app.get('/start', function start_a_game(req, res) {
  var id;
  db.Game.findOne({open: true}, function(err, game) {
    if(err) { return console.log('ERROR:', err);}

    // if there's no open game then create one
    if(!game) {
      db.Game.create({}, function(err, newGame) {
        if(err) { return console.log('ERROR:', err);}
        id = newGame.id;
        // go to the game play by id
        res.redirect('/games/' + id);
      });
      return console.log('new game on');
    } else {
      id = game.id;
      // go to the game play by id
      res.redirect('/games/' + id);
    }
  });
});

app.get('/games/:id', function game_page(req, res) {
  var id = req.params.id;
  var userName = req.user ? req.user.username : null;
  var room;
  var spot;
  db.Game.findOne({_id: id}, function(err, game) {
    if(err) { return console.log('ERROR:', err);}

    // find the room and in the rooms list and check if it's still waiting
    rooms.forEach(function(ele, index) {
      if(ele.id === id) {
        room = ele;
      }
    });

    // create a new room if it's a new game
    if(!room) {
      room = new Room(id);
      rooms.push(room);
    }

    // if the game is not open, redirect player to a new game
    // redirect player if the game is already start
    if(!game.open || room.state !== 'wait') {
      res.redirect('/start');
      return true;
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

    // render the game page plus the spot
    res.render('game', {socket_id: id, spot: spot});
  });
});

app.get('/profile', function profile_page(req, res) {
  if (req.user) {
    res.render('profile', req.user);
    console.log(req.user);
  } else {
    res.redirect('/login');
  }
});

app.get('/gallery', function gallery_page(req, res) {
  res.render('gallery');
});

/*********
AUTH
***/

// Sign up new user, then log them in
app.post('/signup', function(req, res) {
  // if user is logged in, don't let them sign up again
  if (req.user) {
    res.redirect('/profile');
  } else {
    // Check if the username has used before
    db.User.findOne({username: req.body.username}, function(err, user) {
      if(user) {
        res.send("duplicate");
      } else {
        // Create user
        db.User.register(new db.User({ username: req.body.username}), req.body.password,
          function (err, newUser) {
            passport.authenticate('local')(req, res, function () {
              res.send("User created");
            });
          }
        );
      }
    });
  }
});

// log in user
app.post('/login', passport.authenticate('local'), function (req, res) {
  res.send('Logged in');
});

// log out user
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


/*********
API
***/

app.get('/api/games', function api_get_all_games(req, res) {
  db.Game
    .find({})
    .populate('_draw')
    .exec(function(err, games) {
      if(err) {return console.log("ERROR:", err);}
      res.json({games: games});
    });
});

app.get('/api/profile', function api_user_games(req, res) {
  db.User
    .findById(req.user.id)
    .populate('games')
    .deepPopulate('games._draw')
    .exec(function(err, user) {
      res.json(user);
    });
});

app.post('/api/user/draws/save/:id', function api_save_user_draw(req, res) {
  if(req.user) {
    db.User.findOne({_id: req.user._id}, function(err, user) {
      db.Game.findOne({_id: req.params.id}, function(err, game) {
        user.games.push(game);
        user.save(function(err, user) {
          res.send("save draw to user");
        });
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/api/draws/save', function api_save_draw(req, res) {
  var pngData = req.body.pngData;
  var gameID = req.body.game_id;
  db.Game.findOne({_id: gameID}, function(err, game) {
    if(!game._draw) {
      db.Draw.create(pngData, function(err, draw) {
        game._draw = draw._id;
        game.save(function(err, game) {
          res.send("save draw");
        });
      });
    }
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

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
var User = require('./models/user');
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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/***
ROUTES
***/

app.get('/', function(req, res) {
  // console.log(req.user);
  res.render('index');
});

app.get('/games', function(req, res) {
  res.render('game');
});

// listen on port 3000
http.listen(3000, function() {
  console.log('server started, port 3000');
});

/***
API
***/


/***
SOCKET.IO
***/

io.on('connection', function(socket) {
  console.log('one user in');

  socket.on('drawClick', function(data) {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', function() {
    console.log('one user disconnected');
  });

});

var mongoose = require("mongoose");
mongoose.connect( process.env.MONGOLAB_URI ||
                  process.env.MONGOHQ_URL ||
                  'mongodb://localhost/draw_together');

var User = require('./user');
var Game = require('./game');
var Draw = require('./draw');


module.exports.User = User;
module.exports.Game = Game;
module.exports.Draw = Draw;

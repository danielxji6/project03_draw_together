var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./user");
var Draw = require("./draw");


var GameSchema = new Schema({
  player1: User.schema,
  player2: User.schema,
  player3: User.schema,
  open: { "type": Boolean, "default": true },
  draw_id: Draw.schema,
});

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;

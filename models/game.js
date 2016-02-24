var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./user");
var Draw = require("./draw");


var GameSchema = new Schema({
  player1: User.schema,
  player2: User.schema,
  player3: User.schema,
  open: { type: Boolean, default: true },
  _draw: { type: Schema.Types.ObjectId, ref: 'Draw' },
});

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;

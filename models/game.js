var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./user");
var Draw = require("./draw");


var GameSchema = new Schema({
  _player1: User.schema,
  _player2: User.schema,
  _player3: User.schema,
  open: { type: Boolean, default: true },
  _draw: { type: Schema.Types.ObjectId, ref: 'Draw' },
});

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;

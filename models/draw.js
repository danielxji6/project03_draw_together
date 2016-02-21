var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var DrawSchema = new Schema({
  pngD_1: String,
  pngD_2: String,
  pngD_3: String,
});

var Draw = mongoose.model('Draw', DrawSchema);
module.exports = Draw;

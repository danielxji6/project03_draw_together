var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  username: String,
  password: String,
  games: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }]
});

UserSchema.plugin(passportLocalMongoose, {
  populateFields: 'games'
});

var User = mongoose.model('User', UserSchema);
module.exports = User;

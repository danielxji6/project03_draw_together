var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var UserSchema = new Schema({
  username: String,
  password: String,
  games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  _profile: { type: Schema.Types.ObjectId, ref: 'Game' }
});

UserSchema.plugin(passportLocalMongoose, {
  populateFields: 'games'
});

UserSchema.plugin(deepPopulate);

var User = mongoose.model('User', UserSchema);
module.exports = User;

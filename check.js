var db = require('./models');

// db.User
// .find({})
// .populate('games')
// .exec(function (err, users) {
//   if(err) { return console.log("ERROR: ", err);}
//   console.log("Created", users.length, " users");
//   console.log("All user: \n", users);
// });


db.User
.find({})
// .populate('_draw')
.exec(function(err, games) {
  console.log(games);
  process.exit();
});



console.log("loded");

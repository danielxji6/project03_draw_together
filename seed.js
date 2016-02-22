var db = require('./models');

db.Game.find({}, function(err, games) {
  console.log(games);
  db.Game.remove({}, function (err, games) {
    if(err) { return console.log("ERROR: ", err);}
    console.log("Delete all games!!");
    process.exit();
  });

});

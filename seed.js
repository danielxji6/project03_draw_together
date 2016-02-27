var db = require('./models');

db.Game.find({}, function(err, games) {
  console.log(games);
  db.Game.remove({}, function (err, games) {
    if(err) { return console.log("ERROR: ", err);}
    console.log("Delete all games!!");
  });
});

db.Draw.find({}, function(err, draws) {
  console.log(draws);
  db.Draw.remove({}, function (err, draws) {
    if(err) { return console.log("ERROR: ", err);}
    console.log("Delete all draws!!");
    process.exit();
  });
});

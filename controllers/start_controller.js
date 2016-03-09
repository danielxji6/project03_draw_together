var db = require('../models');

module.exports = function(app) {

  app.get('/start', function start_a_game(req, res) {
    var id;
    db.Game.findOne({open: true}, function(err, game) {
      if(err) { return console.log('ERROR:', err);}

      // if there's no open game then create one
      if(!game) {
        db.Game.create({}, function(err, newGame) {
          if(err) { return console.log('ERROR:', err);}
          id = newGame.id;
          // go to the game play by id
          res.redirect('/games/' + id);
        });
        return console.log('new game on');
      } else {
        id = game.id;
        // go to the game play by id
        res.redirect('/games/' + id);
      }
    });
    console.log('redirect should work bitch');
    console.log(id);
  });

};

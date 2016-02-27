var db = require('../models');

module.exports = function(app) {

  app.get('/api/games', function api_get_all_games(req, res) {
    db.Game
      .find({})
      .populate('_draw')
      .exec(function(err, games) {
        if(err) {return console.log("ERROR:", err);}
        res.json({games: games});
      });
  });

  app.get('/api/profile', function api_user_games(req, res) {
    db.User
      .findById(req.user.id)
      .populate('games')
      .deepPopulate('games._draw')
      .exec(function(err, user) {
        res.json(user);
      });
  });

  app.post('/api/user/draws/save/:id', function api_save_user_draw(req, res) {
    if(req.user) {
      db.User.findOne({_id: req.user._id}, function(err, user) {
        db.Game.findOne({_id: req.params.id}, function(err, game) {
          user.games.push(game);
          user.save(function(err, user) {
            res.send("save draw to user");
          });
        });
      });
    } else {
      res.redirect('/login');
    }
  });

  app.post('/api/draws/save', function api_save_draw(req, res) {
    var pngData = req.body.pngData;
    var gameID = req.body.game_id;
    db.Game.findOne({_id: gameID}, function(err, game) {
      if(!game._draw) {
        db.Draw.create(pngData, function(err, draw) {
          game._draw = draw._id;
          game.save(function(err, game) {
            res.send("save draw");
          });
        });
      }
    });
  });

};

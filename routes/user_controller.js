var db = require('../models');

module.exports = function(app, passport) {

  // Sign up new user, then log them in
  app.post('/signup', function(req, res) {
    // if user is logged in, don't let them sign up again
    if (req.user) {
      res.redirect('/profile');
    } else {
      // Check if the username has used before
      db.User.findOne({username: req.body.username}, function(err, user) {
        if(user) {
          res.send("duplicate");
        } else {
          // Create user
          db.User.register(new db.User({ username: req.body.username}), req.body.password,
            function (err, newUser) {
              passport.authenticate('local')(req, res, function () {
                res.send("User created");
              });
            }
          );
        }
      });
    }
  });

  // log in user
  app.post('/login', passport.authenticate('local'), function (req, res) {
    res.send('Logged in');
  });

  // log out user
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

};

module.exports = function(app) {

  app.get('/', function home_page(req, res) {
    // console.log(req.user);
    res.render('index');
  });

  app.get('/signup', function signup_page(req, res) {
    if (req.user) {
      res.redirect('/profile');
    }
    res.render('signup');
  });

  app.get('/login', function login_page(req, res) {
    if (req.user) {
      res.redirect('/profile');
    }
    res.render('login');
  });

  app.get('/profile', function profile_page(req, res) {
    if (req.user) {
      res.render('profile', req.user);
      console.log(req.user);
    } else {
      res.redirect('/login');
    }
  });

  app.get('/gallery', function gallery_page(req, res) {
    res.render('gallery');
  });

};

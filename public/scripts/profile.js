console.log('gallery.js load');

var sourceGame = $("#game-template").html();
var templateGame = Handlebars.compile(sourceGame);

Handlebars.registerHelper('ifDraw', function(v1, v2, v3, options) {
  if(v1) { // if(v1 && v2 && v3) {
    return options.fn(this);
  }
  return options.inverse(this);
});

$.get('/api/profile', function(user) {
  var gameHtml = templateGame({games: user.games});
  $('#game-list').append(gameHtml);
});

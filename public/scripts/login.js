console.log("login.js load");

$('#login-form').on('submit', function handleLogin(event) {
  event.preventDefault();
  var data = $('#login-form').serialize();
  $.post('/login', data)
    .success(function(response) {
      window.location.href = '/profile';
    })
    .error(function(err) {
      console.log(err);
      $('#wrongLogin').show();
    });

});

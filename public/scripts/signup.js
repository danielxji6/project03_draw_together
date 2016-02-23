console.log("signup.js load");

$('#signup-form').on('submit', function handleSignup(event) {
  event.preventDefault();
  var data = $('#signup-form').serialize();
  $.post('/signup', data, function(response) {
    // console.log(response);
    if (response == "duplicate") {
      $('#duplicate').show();
    } else {
      window.location.href = '/profile';
    }
  });
});

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
  .findOne({username: 'daniel'})
  .populate('games')
  .deepPopulate('games._draw')
  .exec(function(err, user) {
    // res.json(user);
    console.log(user);
    process.exit();
  });


  // Post.deepPopulate(posts, 'comments.user', function (err, _posts) {
  //   // _posts is the same instance as posts and provided for convenience
  //   posts.forEach(function (post) {
  //     // post.comments and post.comments.user are fully populated
  //   });
  // });


console.log("loded");

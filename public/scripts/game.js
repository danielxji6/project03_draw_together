// game.js
console.log('game.js load!');

// setup socket
socket = io.connect();

// canvas setup
function Play(user) {
  this.user = user;
  this.canvas = document.createElement('canvas');
  this.canvas.height = 200;
  this.canvas.width = 300;
  this.canvas.id = this.user;
  // this.canvas.attr('data-user', this.user);
  $('#canvasDiv').append(this.canvas);
  this.ctx = this.canvas.getContext("2d");
  this.ctx.fillStyle = "solid";
  this.ctx.strokeStyle = "bule";
  this.ctx.lineWidth = 2;
  this.ctx.lineCap = "round";
  this.paint = false;
}
// draw on canvas
Play.prototype.draw = function(x, y, type) {
  if (type === 'mousedown') {
    this.paint = true;
    this.ctx.moveTo(x, y);
    this.ctx.beginPath();
  } else if (type === 'mousemove' && this.paint) {
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  } else {
    this.paint = false;
    this.ctx.closePath();
  }
};

// trigger init
var Players =[];
Players.push(new Play('aaa'));
Players.push(new Play('bbb'));
Players.push(new Play('ccc'));

// var c3 = new Play('c');

// draw event
$('canvas').on('mousedown mousemove mouseup mouseout', function(event) {
  var type = event.handleObj.type;
  var x = event.offsetX;
  var y = event.offsetY;
  var user = this.id;

  var data = {
    x: x,
    y: y,
    type: type,
    user: user,
  };
  // console.log(data);
  find_draw(data);
  socket.emit('drawClick', data);

});

socket.on('draw', function(data) {
  return find_draw(data);
});

function find_draw(data) {
  Players.forEach(function(ele) {
    if(ele.user === data.user) {
      ele.draw(data.x, data.y, data.type);
    }
  });
}

// game.js
console.log('game.js load!');

// setup socket
socket = io.connect();
socket.on('draw', function(data) {
  return Play.draw(data.x, data.y, data.type);
});

// canvas setup
function Play(user) {
  this.user = user;
  this.canvas = document.createElement('canvas');
  this.canvas.height = 200;
  this.canvas.width = 300;
  this.canvas.id = 'c_' + this.user;
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
    console.log(this.ctx);
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
var c1 = new Play('aaa');
var c2 = new Play('bbb');
// var c3 = new Play('c');

// draw event
$('canvas').on('mousedown mousemove mouseup mouseout', function(event) {
  var type = event.handleObj.type;
  var x = event.offsetX;
  var y = event.offsetY;
  // console.log(x, y, type);

  // draw by user or socket
  c1.draw(x, y, type);
  // Play.socket.emit('drawClick', {
  //   x: x,
  //   y: y,
  //   type: type,
  // });
});

/***
SETUP
***/

var id = $('#canvasDiv').data('socket-id');
var spot = $('#canvasDiv').data('spot');
var socket = io();
var state = '';


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

var Players =[];
Players.push(new Play('guest_1'));
Players.push(new Play('guest_2'));
Players.push(new Play('guest_3'));

/***
EVENTS
***/

$('canvas').on('mousedown mousemove mouseup mouseout', function(event) {
  if(state == 'start') {
    if(this.id == ('guest_'+ spot)) {
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
      find_draw(data);
      // send draw emit to server
      socket.emit('drawClick', data);
    }
  }
});

/***
FUNCTION
***/

function find_draw(data) {
  Players.forEach(function(ele) {
    if(ele.user === data.user) {
      ele.draw(data.x, data.y, data.type);
    }
  });
}

// Countdown
function shoot(callback) {
  console.log("ha");
  callback();
}

function wait10sec(){
    setTimeout(function(){
        shoot(wait10sec);
    }, 1000);
}
// shoot(wait10sec);

/***
SOCKET
***/

socket.emit('newUser', {id: id});

socket.on('gameFlow', function(data) {
  state = data.state;
});

socket.on('draw', function(data) {
  find_draw(data);
});

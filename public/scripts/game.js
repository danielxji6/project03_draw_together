$(function() {

  var App = {};

  // canvas setup
  App.init = function() {
    App.canvas = document.createElement('canvas');
    App.canvas.height = 700;
    App.canvas.width = 300;
    App.canvas.id = 'canvas';
    $('#canvasDiv').append(App.canvas);
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = "bule";
    App.ctx.lineWidth = 2;
    App.ctx.lineCap = "round";
    App.paint = false;
    App.socket = io.connect();
    App.socket.on('draw', function(data) {
      return App.draw(data.x, data.y, data.type);
    });
    // draw on canvas
    App.draw = function(x, y, type) {
      if (type === 'mousedown') {
        App.paint = true;
        App.ctx.moveTo(x, y);
        App.ctx.beginPath();
      } else if (type === 'mousemove' && App.paint) {
        App.ctx.lineTo(x, y);
        App.ctx.stroke();
      } else {
        App.paint = false;
        App.ctx.closePath();
      }
    };
  };
  // trigger init
  App.init();

  // draw event
  $('#canvas').on('mousedown mousemove mouseup mouseout', function(event) {
    var type = event.handleObj.type;
    // console.log(type);
    var x = event.offsetX;
    var y = event.offsetY;
    // console.log(x, y, type);
    // console.log(event);

    // draw by user or socket
    App.draw(x, y, type);
    App.socket.emit('drawClick', {
      x: x,
      y: y,
      type: type,
    });
  });


});

AXIS.CanvasRenderer = function(canvas, width, height) {
  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');

  this.resize(width, height);
};

AXIS.CanvasRenderer.prototype = {
  clear: function(width, height) {
    this._ctx.clearRect(0, 0, width, height);
  },
  drawRect: function(x, y, width, height, color) {
    var ctx = this._ctx;

    ctx.fillStyle = 'rgba('+color+', 0.3)';
    ctx.strokeStyle = 'rgb('+color+')';

    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  },
  resize: function(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  },
  scaleTo: function(windowWidth, windowHeight) {
    var canvas = this._canvas,
        cw = canvas.width,
        ch = canvas.height,
        windowRatio = windowWidth / windowHeight,
        canvasRatio = cw / ch,
        newRatio = windowRatio - canvasRatio,
        widthCalc = windowHeight / ch * cw,
        heightCalc = windowWidth / cw * ch;

    canvas.style.width = newRatio <= 0 ? windowWidth+'px' : widthCalc+'px';
    canvas.style.height = newRatio > 0 ? windowHeight+'px' : heightCalc+'px';
  }
};

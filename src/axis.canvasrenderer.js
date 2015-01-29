AXIS.CanvasRenderer = function(canvas, width, height) {
  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');
  this._width = width;
  this._height = height;

  this.resize(width, height);
};

AXIS.CanvasRenderer.prototype = {
  clear: function() {
    this._ctx.clearRect(0, 0, this._width, this._height);
  },
  setColor: function(red, green, blue, alpha) {
    alpha = alpha || 1.0;
    var rgba = 'rgba('+red+','+green+','+blue+','+alpha+')';
    this._ctx.fillStyle = rgba;
    this._ctx.strokeStyle = rgba;
  },
  fillRect: function(x, y, width, height) {
    this._ctx.fillRect(x, y, width, height);
  },
  strokeRect: function(x, y, width, height) {
    this._ctx.strokeRect(x, y, width, height);
  },
  fillCircle: function(x, y, radius) {
    var ctx = this._ctx;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.closePath();
  },
  strokeCircle: function(x, y, radius) {
    var ctx = this._ctx;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.closePath();
  },
  resize: function(width, height) {
    this._width = width;
    this._height = height;
    this._canvas.width = width;
    this._canvas.height = height;
  },
  scaleTo: function(windowWidth, windowHeight) {
    var canvas = this._canvas,
        cw = canvas.width,
        ch = canvas.height,
        canvasRatio = cw / ch,
        windowRatio = windowWidth / windowHeight,
        newRatio = windowRatio - canvasRatio,
        widthCalc = windowHeight / ch * cw,
        heightCalc = windowWidth / cw * ch;

    canvas.style.width = newRatio <= 0 ? windowWidth+'px' : widthCalc+'px';
    canvas.style.height = newRatio > 0 ? windowHeight+'px' : heightCalc+'px';
  }
};

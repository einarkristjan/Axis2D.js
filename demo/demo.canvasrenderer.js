var DEMO = DEMO || {};

DEMO.CanvasRenderer = function(canvas, width, height) {
  this._canvas = canvas || document.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');
  this._width = width || this._canvas.width;
  this._height = height || this._canvas.height;
  this._scaledWidth = this._width;
  this._scaledHeight = this._height;
  this._scaleRatio = 0;

  // first run to set the canvas width and height
  this.resize(this._width, this._height);
};

DEMO.CanvasRenderer.prototype = {
  clear: function() {
    this._ctx.clearRect(0, 0, this._width, this._height);
  },
  setFont: function(font, size, textAlign, textBaseline) {
    var ctx = this._ctx;
    ctx.font = size + 'px ' + font;
    ctx.textAlign = textAlign || ctx.textAlign;
    ctx.textBaseline = textBaseline || ctx.textBaseline;
  },
  fillText: function(text, x, y) {
    this._ctx.fillText(text, x, y);
  },
  strokeText: function(text, x, y) {
    this._ctx.strokeText(text, x, y);
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
        widthCalc = windowHeight / ch * cw,
        heightCalc = windowWidth / cw * ch,
        newRatio = windowRatio - canvasRatio;

    this._scaledWidth = newRatio <= 0 ? windowWidth : widthCalc;
    this._scaledHeight = newRatio > 0 ? windowHeight : heightCalc;

    this._scaleRatio = this._scaledWidth / canvas.width;

    canvas.style.width = this._scaledWidth + 'px';
    canvas.style.height = this._scaledHeight + 'px';
  }
};

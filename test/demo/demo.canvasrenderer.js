DEMO.CanvasRenderer = function(canvas) {
  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');
};

DEMO.CanvasRenderer.prototype = {
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
  scale: function(width, height) {
    var canvas = this._canvas,
        winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        windowRatio = winWidth / winHeight,
        canvasRatio = width / height,
        newRatio = windowRatio - canvasRatio,
        widthCalc = winHeight / canvas.height * canvas.width,
        heightCalc = winWidth / canvas.width * canvas.height;

    canvas.style.width = newRatio <= 0 ? winWidth+'px' : widthCalc+'px';
    canvas.style.height = newRatio > 0 ? winHeight+'px' : heightCalc+'px';
  }
};

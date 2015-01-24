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
    var windowRatio = window.innerWidth / window.innerHeight,
        canvasRatio = width / height,
        newRatio = windowRatio - canvasRatio,
        canvas = this._canvas;

    this.resize(width, height);

    canvas.style.width = newRatio <= 0 ? window.innerWidth+'px' : 'auto';
    canvas.style.height = newRatio > 0 ? window.innerHeight+'px' : 'auto';
  }
};

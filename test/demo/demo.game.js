DEMO.Game = function(params) {
  var that = this;

  params = params || {};

  this._mapManager = params.mapManager || new DEMO.TileManager(64);
  this._width = params.width || 768;
  this._height = params.height || 576;
  this._renderer = params.renderer;

  this._colliderWorld = new AXIS.World(64);
  this._entityManager = new DEMO.EntityManager();

  if(!this._renderer) {
    // create default renderer
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    this._renderer = new DEMO.CanvasRenderer(canvas);
  }

  // Paul Irish shim
  var requestAnimFrame = (function() {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function(callback) {
             window.setTimeout(callback, 1000/60);
           };
  })();

  // first run
  this.onWindowResize();
  window.addEventListener('resize', function(){
    that.onWindowResize();
  });

  (function loop() {
    requestAnimFrame(loop);
    that.update();
    that.draw();
  })();
};

DEMO.Game.prototype = {
  update: function() {
    this._colliderWorld.update();
    this._entityManager.update();
  },
  draw: function() {
    this._renderer.clear(this._width, this._height);
    this._mapManager.draw(this._renderer);
    this._entityManager.draw(this._renderer);
  },
  onWindowResize: function() {
    this._renderer.scale(this._width, this._height);
  }
};

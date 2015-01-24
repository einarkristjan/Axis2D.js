DEMO.Game = function(params) {
  var that = this;

  params = params || {};

  this._width = params.width || 768;
  this._height = params.height || 576;
  this._renderer = params.renderer;
  this._cellSize = params.cellSize || 64;

  this._colliderWorld = new AXIS.World(this._cellSize);
  this._tileManager = new DEMO.TileManager(this._cellSize);
  this._entityManager = new DEMO.EntityManager();

  this._frameCount = 0;

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
    this._frameCount++;
  },
  draw: function() {
    this._renderer.clear(this._width, this._height);
    this._tileManager.draw(this._renderer);
    this._entityManager.draw(this._renderer);
  },
  onWindowResize: function() {
    this._renderer.scale(this._width, this._height);
  },
  createEntity: function(x, y, z) {
    var entity = new DEMO.Entity(x, y, z);
    return this._entityManager.addEntity(entity);
  }
};

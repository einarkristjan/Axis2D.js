DEMO.GameWorld = function(params) {
  params = params || {};

  var that = this;

  this._frameCount = 0;
  this._width = params.width || 768;
  this._height = params.height || 576;
  this._cellSize = params.cellSize || 64;
  this._scaleRenderer = params.scaleRenderer || true;

  this._collisionManager = params.collisionManager;
  this._renderer = params.renderer;
  this._tileManager = params.tileManager;
  this._entityManager = params.entityManager;

  if(!params.collisionManager) {
    this._collisionManager = new AXIS.World(this._cellSize);
  }

  if(!params.tileManager) {
    this._tileManager = new DEMO.TileManager(this._cellSize);
  }

  if(!params.entityManager) {
    this._entityManager = new DEMO.EntityManager();
  }

  if(!this._renderer) {
    // create default <canvas> renderer
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    this._renderer = new DEMO.CanvasRenderer(canvas);
  }

  // first run
  this.onWindowResize();

  window.addEventListener('resize', function(){
    that.onWindowResize();
  });

  (function loop() {
    DEMO.requestAnimFrame(loop);
    that.update();
    that.draw();
  })();
};

DEMO.GameWorld.prototype = {
  update: function() {
    this._collisionManager.update();
    this._entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    this._renderer.clear(this._width, this._height);
    this._tileManager.draw(this._renderer);
    this._entityManager.draw(this._renderer);
  },
  onWindowResize: function() {
    this._renderer.resize(this._width, this._height);
    if(this._scaleRenderer) {
      this._renderer.scale(this._width, this._height);
    }
  },
  createEntity: function(x, y, z) {
    var entity = new DEMO.Entity(this, x, y, z);
    this._entityManager.addEntity(entity);
    return entity;
  },
  createTileMap: function(map) {
    this._collisionManager.addTiles(map);
    this._tileManager.addTiles(map);
    return map;
  }
};

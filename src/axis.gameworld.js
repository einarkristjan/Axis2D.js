AXIS.GameWorld = function(params) {
  params = params || {};

  this._frameCount = 0;

  this._cellSize = params.cellSize || 64;
  this._debug = params.debug || false;

  this._renderer = params.renderer;
  this._entityManager = params.entityManager;
  this._collisionManager = params.collisionManager;

  if(!params.collisionManager) {
    this._collisionManager = new AXIS.CollisionManager(this._cellSize);
  }

  if(!params.entityManager) {
    this._entityManager = new AXIS.EntityManager();
  }
};

AXIS.GameWorld.prototype = {
  update: function() {
    this._collisionManager.update();
    this._entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    if(this._debug) {
      this._collisionManager.debugDraw(this._renderer);
    }
  }
};

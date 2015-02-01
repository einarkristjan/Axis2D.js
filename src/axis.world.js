AXIS.World = function(params) {
  params = params || {};

  this._uid = new Date().getTime();
  this._frameCount = 0;

  this.debug = params.debug || false;
  this.renderer = params.renderer;
  this.entityManager = params.entityManager;
  this.collisionManager = params.collisionManager;

  if(!params.collisionManager) {
    this.collisionManager = new AXIS.CollisionManager(params.cellSize);
  }

  if(!params.entityManager) {
    this.entityManager = new AXIS.EntityManager();
  }
};

AXIS.World.prototype = {
  update: function() {
    this.collisionManager.update();
    this.entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    var cc = this.collisionManager._cellSize;
    if(this.renderer && this.debug) {
      this.collisionManager.debugDraw(this.renderer);
      this.entityManager.debugDraw(this.renderer, cc);
    }
  },
  setCellSize: function(cellSize) {
    this.collisionManager.setCellSize(cellSize);
  },
  createEntity: function(x, y, z) {
    return new AXIS.Entity(x, y, z, this);
  },
  createCollisionMap: function(map, offsetX, offsetY) {
    return new AXIS.CollisionMap(map, offsetX, offsetY, this);
  }
};

AXIS.World = function(params) {
  params = params || {};

  // private
  this._frameCount = 0;

  // public
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
    if(this.debug) {
      this.collisionManager.debugDraw(this.renderer);
    }
  }
};

AXIS.World = function(params) {
  params = params || {};

  this._uid = new Date().getTime();
  this._frameCount = 0;

  this.cellSize = params.cellSize || 64;
  this.debug = params.debug || false;
  this.renderer = params.renderer;
  this.entityManager = params.entityManager;
  this.collisionManager = params.collisionManager;

  if(!params.collisionManager) {
    this.collisionManager = new AXIS.CollisionManager(this);
  }

  if(!params.entityManager) {
    this.entityManager = new AXIS.EntityManager(this);
  }
};

AXIS.World.prototype = {
  update: function() {
    this.entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    if(this.renderer && this.debug) {
      this.collisionManager.debugDraw();
      this.entityManager.debugDraw();
    }
  },
  createEntity: function(x, y, z) {
    return new AXIS.Entity(x, y, z, this);
  },
  createCollisionMap: function(map, offsetX, offsetY) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    var x, y, ent, posX, posY,
        cellSize = this.cellSize,
        entities = [];

    for(y = 0; y < map.length; y++) {
      for(x = 0; x < map[y].length; x++) {
        if(map[y][x]) {
          posX = (x + offsetX) * cellSize;
          posY = (y + offsetY) * cellSize;

          ent = new AXIS.Entity(posX, posY, 0, this);
          ent.setCollider(cellSize - 1, cellSize - 1);

          entities.push(ent);
        }
      }
    }
    return entities;
  }
};

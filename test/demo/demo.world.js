var DEMO = DEMO || {};

DEMO.World = function(params) {
  params = params || {};

  // this._uid = new Date().getTime();
  this._frameCount = 0;

  this.cellSize = params.cellSize || 64;
  this.debug = params.debug || false;
  this.renderer = params.renderer;
  this.entityManager = params.entityManager;
  this.collisionManager = params.collisionManager;

  if(!params.collisionManager) {
    this.collisionManager = new AXIS.World(this.cellSize, this);
  }

  if(!params.entityManager) {
    this.entityManager = new DEMO.EntityManager(this);
  }
};

DEMO.World.prototype = {
  update: function() {
    this.entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    var r = this.renderer,
        cellSize = this.cellSize;

    if(r && this.debug) {

      this.collisionManager.debugDrawColliders(
        function(x, y, width, height, centerX, centerY, isDynamic) {
          r.setColor(255, 0, 0, 0.3);
          if(isDynamic) {
            r.setColor(0, 255, 0, 0.3);
          }
          r.fillRect(x, y, width, height);

          r.setColor(255, 0, 0);
          if(isDynamic) {
            r.setColor(0, 255, 0);
          }
          r.strokeCircle(centerX, centerY, cellSize/4);
          r.strokeRect(x, y, width, height);
        }
      );

      r.setFont('Arial', this.cellSize/4, 'center', 'middle');
      r.setColor(150, 150, 150);

      this.collisionManager.debugDrawGrid(
        function(x, y, width, height, colliderCount) {
          r.fillText(colliderCount, x + width/2, y + height/2);
          r.strokeRect(x, y, width, height);
        }
      );

    }
  },
  createEntity: function(x, y, z) {
    return new DEMO.Entity(this, x, y, z);
  },
  createCollisionMap: function(map, offsetX, offsetY) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    var ent, centerX, centerY,
        cellSize = this.cellSize,
        entities = [];

    map.forEach(function(row, y){
      row.forEach(function(col, x){
        if(col) {
          centerX = (x + offsetX + 0.5) * cellSize;
          centerY = (y + offsetY + 0.5) * cellSize;

          ent = new DEMO.Entity(this, centerX, centerY);
          ent.setCollider(cellSize - 1, cellSize - 1);

          entities.push(ent);
        }
      }, this);
    }, this);
    return entities;
  }
};

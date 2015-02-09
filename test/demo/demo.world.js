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
    var renderer = this.renderer,
        cellSize = this.cellSize;

    if(renderer && this.debug) {
      renderer.setFont('Arial', this.cellSize/4, 'center', 'middle');
      renderer.setColor(127, 127, 127);

      this.collisionManager.debugDrawGrid(
        function(x, y, width, height, colliderCount) {
          renderer.fillText(colliderCount, x + width/2, y + height/2);
          renderer.strokeRect(x, y, width, height);
        }
      );

      this.collisionManager.debugDrawColliders(
        function(x, y, width, height, offsetX, offsetY) {
          renderer.setColor(200, 200, 200, 0.5);
          renderer.fillCircle(x, y, cellSize/8);
          renderer.setColor(200, 200, 200);
          renderer.strokeCircle(x, y, cellSize/8);

          renderer.setColor(0, 255, 0, 0.3);
          renderer.fillRect(x + offsetX, y + offsetY, width, height);
          renderer.setColor(0, 255, 0);
          renderer.strokeRect(x + offsetX, y + offsetY, width, height);
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

    var ent, posX, posY,
        cellSize = this.cellSize,
        entities = [];

    map.forEach(function(row, y){
      row.forEach(function(col, x){
        if(col) {
          posX = (x + offsetX) * cellSize;
          posY = (y + offsetY) * cellSize;

          ent = new DEMO.Entity(this, posX, posY);
          ent.setCollider(cellSize - 1, cellSize - 1);

          entities.push(ent);
        }
      }, this);
    }, this);
    return entities;
  }
};

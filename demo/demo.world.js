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
    this.debugDraw = this.collisionManager.createDebugDraw();
  }

  if(!params.entityManager) {
    this.entityManager = new DEMO.EntityManager(this);
  }
};

DEMO.World.prototype = {
  createEntity: function(x, y, z) {
    return new DEMO.Entity(this, x, y, z);
  },
  update: function() {
    this.entityManager.update();
    this._frameCount++;
  },
  draw: function() {
    var renderer = this.renderer;

    renderer.setFont('Arial', this.cellSize/4, 'center', 'middle');

    if(renderer && this.debug) {
      renderer.setColor(175, 175, 175);
      this.debugDraw.getGrid(
        function(x, y, width, height, colliderCount) {
          renderer.fillText(colliderCount, x + width/2, y + height/2);
          renderer.strokeRect(x, y, width, height);
        }
      );

      this.debugDraw.getColliders(
        function(x, y, width, height, isDynamic, isSensor) {
          var r = isDynamic ? 0 : 255,
              g = isDynamic ? 255 : 0,
              b = isDynamic ? 0: 0;

          if(isSensor) {
            g = 255;
            b = 255;
          }

          renderer.setColor(r, g, b, 0.25);
          renderer.fillRect(x, y, width, height);

          renderer.setColor(r, g, b);
          renderer.strokeRect(x, y, width, height);
        }
      );
    }
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

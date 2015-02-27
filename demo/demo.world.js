var DEMO = DEMO || {};

DEMO.World = function(params) {
  var that = this;

  params = params || {};

  // this._uid = new Date().getTime();
  this._frameCount = 0;

  this.cellSize = params.cellSize || 64;
  this.debug = params.debug || false;
  this.renderer = params.renderer;
  this.entityManager = params.entityManager;
  this.collisionManager = params.collisionManager;

  if(!params.collisionManager) {
    this.collisionManager = new Axis2D.World(this.cellSize, this);
    this.debugDraw = this.collisionManager.createDebugDraw();

    this.debugDraw.addGridCallback(
      function(x, y, width, height, colliderCount) {
        var rend = that.renderer;
        rend.setColor(175, 175, 175);
        rend.fillText(colliderCount, x + width/2, y + height/2);
        rend.strokeRect(x, y, width, height);
      }
    );

    this.debugDraw.addColliderCallback(
      function(x, y, width, height, collisionType) {
        var rend = that.renderer,
            r = collisionType === 'sensor' ? 255 : 0,
            g = 255,
            b = 255;

        rend.setFont('Arial', that.cellSize/4, 'center', 'middle');

        rend.setColor(r, g, b, 0.25);
        rend.fillRect(x, y, width, height);

        rend.setColor(r, g, b);
        rend.strokeRect(x, y, width, height);
      }
    );
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
    this.collisionManager.update();
    this._frameCount++;
  },
  draw: function() {
    if(this.renderer && this.debug) {
      this.collisionManager.debugDraw();
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

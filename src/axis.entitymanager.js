AXIS.EntityManager = function(world) {
  this._entities = [];

  this._world = world;
};

AXIS.EntityManager.prototype = {
  update: function() {
    var i, e, s, key, scripts, collider, velX, velY;

    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      scripts = e.scripts;
      collider = e.collider;

      if(collider) {
        velX = collider._newPosition.x - e._position.x;
        velY = collider._newPosition.y - e._position.y;
        // collisions solved so fix pos

        if(velX || velY) {
          this._world.collisionManager.resolve(collider);
          e.setPosition(collider._newPosition.x, collider._newPosition.y);
        }
      }

      for(key in scripts) {
        s = scripts[key];
        s['script' + this._world._uid].call(s, e);
      }
    }
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  },
  debugDraw: function(renderer) {
    var i, e, x, y, w, h, collider,
        cellSize = this._world._cellSize;

    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      x = e._position.x;
      y = e._position.y;
      collider = e.collider;

      renderer.setColor(200, 200, 200, 0.5);
      renderer.fillCircle(x, y, cellSize/8);
      renderer.setColor(200, 200, 200);
      renderer.strokeCircle(x, y, cellSize/8);

      if(collider) {
        w = collider.width;
        h = collider.height;

        renderer.setColor(0, 255, 0, 0.3);
        renderer.fillRect(x, y, w, h);
        renderer.setColor(0, 255, 0);
        renderer.strokeRect(x, y, w, h);
      }
    }
  }
};

AXIS.EntityManager = function() {
  this._entities = [];
};

AXIS.EntityManager.prototype = {
  update: function() {
    var i, e, s, key, scripts, collider;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      scripts = e.scripts;
      collider = e.collider;

      if(collider) {
        // collisions solved so fix pos
        e.setPosition(collider._newPosition.x, collider._newPosition.y);
      }

      for(key in scripts) {
        s = scripts[key];
        s['script' + e.world._uid].call(s, e);
      }
    }
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  },
  debugDraw: function(renderer, cellSize) {
    var i, e, x, y;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      x = e._position.x;
      y = e._position.y;
      renderer.setColor(200, 200, 200, 0.5);
      renderer.fillCircle(x, y, cellSize / 8);
      renderer.setColor(200, 200, 200);
      renderer.strokeCircle(x, y, cellSize / 8);
    }
  }
};

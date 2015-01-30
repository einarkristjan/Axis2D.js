AXIS.EntityManager = function() {
  this._entities = [];
};

AXIS.EntityManager.prototype = {
  update: function() {
    var i, j, e, s, comps, scripts, collider;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      comps = e.components;
      scripts = comps.scripts;
      collider = comps.collider;

      if(collider) {
        // collisions solved so fix pos
        e.setPosition(collider._newPosition.x, collider._newPosition.y);
      }

      if(scripts.length) {
        for(j = 0; j < scripts.length; j++) {
          s = scripts[j];
          s.script.call(e, s.vars);
        }
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

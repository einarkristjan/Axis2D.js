AXIS.EntityManager = function() {
  this._entities = [];
};

AXIS.EntityManager.prototype = {
  update: function() {
    var i, j, e, s;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];

      if(e.scripts.length) {
        for(j = 0; j < e.scripts.length; j++) {
          s = e.scripts[j];
          s.call(e);
        }
      }

      if(e.collider) {
        // set entity pos the same as collider pos?
        e.setPosition(e.collider._position.x, e.collider._position.y);
      }
    }
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  }
};

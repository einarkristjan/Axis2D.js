var DEMO = DEMO || {};

DEMO.EntityManager = function(world) {
  this._entities = [];

  this._world = world;
};

DEMO.EntityManager.prototype = {
  update: function() {
    var loop, collider;

    this._entities.forEach(function(entity){
      loop = entity._loop;
      collider = entity.collider;

      if(collider) {
        entity._position.x = collider.getX();
        entity._position.y = collider.getY();
      }

      if(loop) {
        loop.call(entity);
      }
    }, this);
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  }
};

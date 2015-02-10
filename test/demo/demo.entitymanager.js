var DEMO = DEMO || {};

DEMO.EntityManager = function(world) {
  this._entities = [];

  this._world = world;
};

DEMO.EntityManager.prototype = {
  update: function() {
    var loop, collider;

    this._world.collisionManager.update();

    this._entities.forEach(function(entity){
      loop = entity._loop;
      collider = entity.collider;

      if(collider) {
        entity._position.set(collider._AABB.pos.x, collider._AABB.pos.y);
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

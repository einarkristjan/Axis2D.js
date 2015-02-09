var DEMO = DEMO || {};

DEMO.EntityManager = function(world) {
  this._entities = [];

  this._world = world;
};

DEMO.EntityManager.prototype = {
  update: function() {
    var i, e, loop, collider;

    this._world.collisionManager.update();

    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      loop = e._loop;
      collider = e.collider;

      if(collider) {
        e._position.set(collider._position.x, collider._position.y);
      }

      if(loop) {
        loop.call(e);
      }
    }
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  }
};

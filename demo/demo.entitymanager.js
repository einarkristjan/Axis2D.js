var DEMO = DEMO || {};

DEMO.EntityManager = function(world) {
  this._entities = [];

  this._world = world;
};

DEMO.EntityManager.prototype = {
  update: function() {
    this._entities.forEach(function(entity){
      var loop = entity._loop,
          collider = entity.collider,
          cPos;

      if(collider) {
        cPos = collider.getPosition();
        entity._position.x = cPos.x;
        entity._position.y = cPos.y;
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

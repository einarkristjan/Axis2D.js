AXIS.Entity = function(x, y, zIndex, world) {
  this._position = new AXIS.Vector2(x || 0, y || 0);

  this.zIndex = zIndex || 0;

  this.components = {
    collider: undefined,
    scripts: []
  };

  // world reference used for components
  this.world = world;
  world.entityManager.addEntity(this);
};

AXIS.Entity.prototype = {
  setPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;
  },
  moveTo: function(x, y) {
    var collider = this.components.collider;

    if(collider) {
      collider.moveTo(x, y);
      // entity x, y will be fixed to collider inside the collision manager
    }
    else {
      setPosition(x, y);
    }
  },
  setCollider: function(width, height) {
    var collider = new AXIS.Entity.Collider(width, height, this);

    this.world.collisionManager.addCollider(collider);
    this.components.collider = collider;

    // for chaining API
    return this;
  },
  addScript: function(script) {
    this.components.scripts.push(script);

    // for chaining API
    return this;
  }
};

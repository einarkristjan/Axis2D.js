AXIS.Entity = function(x, y, zIndex, world) {
  world.entityManager.addEntity(this);

  // # public
  this.zIndex = zIndex || 0;

  this.components = {
    scripts: [],
  };

  // world reference used for components
  this.world = world;

  // # private
  this._position = new AXIS.Vector2(x || 0, y || 0);
};

AXIS.Entity.prototype = {
  setPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;
  },
  moveTo: function(x, y) {
    var collider = this.components.collider;
    this.setPosition(x, y);

    if(collider) {
      collider.moveTo(x, y);
      // entity x, y will be fixed to collider inside the collision manager
    }
  },
  setCollider: function(width, height) {
    var x = this._position.x,
        y = this._position.y,
        collider = new AXIS.Entity.Collider(x, y, width, height);

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

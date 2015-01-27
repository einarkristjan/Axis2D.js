AXIS.Entity = function(axisWorld, x, y, zIndex) {
  axisWorld.entityManager.addEntity(this);

  // public
  this.zIndex = zIndex || 0;
  this.scripts = [];

  // private
  this._position = new AXIS.Vector2(x || 0, y || 0);
  // world reference used for components
  this._axisWorld = axisWorld;
};

AXIS.Entity.prototype = {
  setPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;
  },
  moveTo: function(x, y) {
    this.setPosition(x, y);

    if(this.collider) {
      this.collider.moveTo(x, y);
      // entity x, y will be fixed to collider inside the collision manager
    }
  },
  setCollider: function(width, height) {
    var x = this._position.x,
        y = this._position.y;

    this.collider = new AXIS.Entity.Collider(x, y, width, height);
    this._axisWorld.collisionManager.addCollider(this.collider);

    // for chaining API
    return this;
  },
  addScript: function(script) {
    this.scripts.push(script);

    // for chaining API
    return this;
  }
};

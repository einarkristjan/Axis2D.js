var DEMO = DEMO || {};

DEMO.Entity = function(x, y, zIndex, world) {
  this._position = new DEMO.Vector2(x || 0, y || 0);

  this.zIndex = zIndex || 0;

  // world reference used for components
  this.world = world;

  if(world) {
    world.entityManager.addEntity(this);
  }
};

DEMO.Entity.prototype = {
  moveTo: function(x, y) {
    if(this.collider) {
      this.collider.setPosition(x, y);
    }
    else {
      this._position.set(x, y);
    }
  },
  setUserData: function(data) {
    this.userData = data;

    return this;
  },
  setCollider: function(width, height, offsetX, offsetY) {
    var cm = this.world.collisionManager,
        x = this._position.x,
        y = this._position.y,
        collider = cm.createCollider(x, y, width, height, offsetX, offsetY);

    this.collider = collider;

    return this;
  },
  setLoop: function(script) {
    this._loop = script;

    return this;
  },
  onCollision: function(callback) {
    this._collisionCallback = callback;

    return this;
  }
};

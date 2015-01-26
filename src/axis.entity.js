AXIS.Entity = function(gameWorld, x, y, z) {
  // world reference used for components
  this._gameWorld = gameWorld;

  this._position = {
    _x: x || 0,
    _y: y || 0,
    _z: z || 0
  };

  this._scripts = [];

  gameWorld._entityManager.addEntity(this);
};

AXIS.Entity.prototype = {
  moveTo: function(x, y) {
    if(this._collider) {
      this._collider.moveTo(x, y);
      x = this._collider._position._x;
      y = this._collider._position._y;
    }

    this._position._x = x;
    this._position._y = y;
  },
  setCollider: function(width, height) {
    var x = this._position._x,
        y = this._position._y;

    this._collider = new AXIS.Entity.Collider(x, y, width, height);
    this._gameWorld._collisionManager.addCollider(this._collider);

    // for chaining API
    return this;
  },
  addScript: function(script) {
    this._scripts.push(script);

    // for chaining API
    return this;
  }
};

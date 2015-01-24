DEMO.Entity = function(x, y, z) {
  this._position = {
    _x: x,
    _y: y,
    _z: z
  };

  this._scripts = [];
};

DEMO.Entity.prototype = {
  setCollider: function(width, height) {
    var x = this._position._x,
        y = this._position._y;

    this._collider = new AXIS.Collider(x, y, width, height);

    return this;
  },
  addScript: function(script) {
    this._scripts.push(script);

    return this;
  },
  moveTo: function(x, y) {
    if(this._collider) {
      this._collider.moveTo(x, y);
      x = this._collider._position._x;
      y = this._collider._position._y;
    }

    this._position._x = x;
    this._position._y = y;
  }
};

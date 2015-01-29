AXIS.Entity.Collider = function(x, y, width, height) {
  // # public
  this.width = width;
  this.height = height;

  // # private
  this._position = new AXIS.Vector2(x, y);
  this._nextPosition = new AXIS.Vector2(x, y);
  this._velocity = new AXIS.Vector2(0, 0);
};

AXIS.Entity.Collider.prototype = {
  moveTo: function(x, y) {
    this._nextPosition.x = x;
    this._nextPosition.y = y;

    this._velocity.x = x - this._position.x;
    this._velocity.y = y - this._position.y;
  },
  setNewPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;

    this._velocity.x = 0;
    this._velocity.y = 0;
  }
};

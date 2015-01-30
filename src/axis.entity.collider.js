AXIS.Entity.Collider = function(width, height, entity) {
  this.width = width;
  this.height = height;

  this._newPosition = new AXIS.Vector2(entity._position.x, entity._position.y);

  this._entity = entity;
};

AXIS.Entity.Collider.prototype = {
  moveTo: function(x, y) {
    this._newPosition.x = x;
    this._newPosition.y = y;
  }
};

AXIS.Entity.Collider = function(width, height, entity) {
  this.width = width;
  this.height = height;

  this._newPosition = new AXIS.Vector2();

  this._entity = entity;

  if(entity) {
    this._newPosition.x = entity._position.x;
    this._newPosition.y = entity._position.y;
  }
};

AXIS.Entity.Collider.prototype = {
  moveTo: function(x, y) {
    this._newPosition.x = x;
    this._newPosition.y = y;
  }
};

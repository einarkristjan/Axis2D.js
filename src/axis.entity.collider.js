AXIS.Entity.Collider = function(width, height, entity) {
  this.width = width;
  this.height = height;

  this.contacts = [];

  this._entity = entity;
  this._position = new AXIS.Vector2();
  this._positionInGridKeys = [];

  if(entity) {
    this._position.set(entity._position.x, entity._position.y);
  }
};

AXIS.Entity.Collider.prototype = {
  _moveTo: function(x, y) {
    this._position.set(x, y);
    this._entity.world.collisionManager._placeInGrid(this);
  },
  _addContact: function(collider) {
    var i, c,
        needle = false;

    for(i = 0; i < this.contacts.length; i++) {
      c = this.contacts[i];
      if(c === collider) {
        needle = true;
      }
    }

    if(!needle) {
      this.contacts.push(collider);
    }
  }
};

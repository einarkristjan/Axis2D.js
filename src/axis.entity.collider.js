AXIS.Entity.Collider = function(width, height, entity) {
  this.width = width;
  this.height = height;

  this._moved = false;
  this._entity = entity;
  this._newPosition = new AXIS.Vector2();

  this.contacts = [];

  if(entity) {
    this._newPosition.x = entity._position.x;
    this._newPosition.y = entity._position.y;
  }
};

AXIS.Entity.Collider.prototype = {
  moveTo: function(x, y) {
    // TODO: set new position in grid

    this._newPosition.x = x;
    this._newPosition.y = y;

    this._moved = true;
  },
  resolved: function() {
    this._moved = false;
  },
  addContact: function(collider) {
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

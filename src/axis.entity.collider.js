AXIS.Entity.Collider = function(width, height, entity) {
  this.width = width;
  this.height = height;

  this.contacts = [];

  this._moved = false;
  this._entity = entity;
  this._newPosition = new AXIS.Vector2();
  this._grid = [];

  if(entity) {
    this._newPosition.x = entity._position.x;
    this._newPosition.y = entity._position.y;
  }
};

AXIS.Entity.Collider.prototype = {
  moveTo: function(x, y) {
    this._entity.world.collisionManager.placeInGrid(this, x , y);

    this._newPosition.x = x;
    this._newPosition.y = y;

    this._moved = true;
  },
  resolved: function() {
    var x = this._newPosition.x,
        y = this._newPosition.y;

    this._entity.world.collisionManager.placeInGrid(this, x , y);
    this._moved = false;
  },
  resolveCollisions: function() {
    this._entity.world.collisionManager.resolve(this);
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
  },
  resetGrid: function() {
    this._grid = [];
  },
  addToGrid: function(key) {
    this._grid.push(key);
  }
};

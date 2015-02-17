AXIS.Collider = function(axisWorld, x, y, width, height, isDynamic) {
  if(!axisWorld) {
    throw TypeError('axisWorld not defined');
  }

  this._axisWorld = axisWorld;

  this._AABB = new intersect.AABB({},{});
  this._AABB.pos.x = x || 0;
  this._AABB.pos.y = y || 0;
  this._AABB.half.x = (width || axisWorld._cellSize - 1) / 2;
  this._AABB.half.y = (height || axisWorld._cellSize - 1) / 2;

  this._delta = new intersect.Point(0, 0);

  this._collisionType = 'slide';

  this._positionInGridKeys = [];
  this._contacts = [];

  this._userData = undefined;
  this._collisionCallback = undefined;

  this._isDynamic = isDynamic || false;
  this.setDynamic(this._isDynamic);

  this._axisWorld._placeInGrid(this);
  this._axisWorld._colliders.push(this);
};

AXIS.Collider.prototype = {
  moveTo: function(x, y) {
    var hW = this._AABB.half.x,
        hH = this._AABB.half.y,
        posX = this._AABB.pos.x,
        posY = this._AABB.pos.y;

    this._delta.x = x - posX;
    this._delta.y = y - posY;

    if(this._delta.x || this._delta.y) {
      // To find out the grid the collider has to sweep:
      // 1. move collider to the middle/center position
      // 2. make the collider take upp all the space it moved in
      // 3. place collider in the grid
      // 4. resize collider back and place it in the new coords

      this._AABB.pos.x = (posX + x) / 2;
      this._AABB.pos.y = (posY + y) / 2;

      this._AABB.half.x = Math.abs(this._delta.x) / 2 + hW;
      this._AABB.half.y = Math.abs(this._delta.y) / 2 + hH;

      this._axisWorld._placeInGrid(this);

      this._AABB.pos.x = posX;
      this._AABB.pos.y = posY;
      this._AABB.half.x = hW;
      this._AABB.half.y = hH;
    }
  },
  setSize: function(width, height) {
    this._AABB.half.x = width/2;
    this._AABB.half.y = height/2;

    if(!this._delta.x || !this._delta.y) {
      this._axisWorld._placeInGrid(this);
    }
  },
  setDynamic: function(bool) {
    var dcs = this._axisWorld._dynamicColliders;
    this._isDynamic = bool;

    if(bool) {
      dcs.push(this);
    }
    else {
      dcs.splice(dcs.indexOf(this), 1);
    }
  },
  setCollisionType: function(type) {
    this._collisionType = type;
  },
  setUserData: function(data) {
    this._userData = data;
  },
  getUserData: function() {
    return this._userData;
  },
  setCollisionCallback: function(callback) {
    this._collisionCallback = callback;
  }
};

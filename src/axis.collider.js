AXIS.Collider = function(axisWorld, x, y, width, height) {
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

  this._isDynamic = false;
  this._isSensor = false;

  this._axisWorld._placeColliderInGrid(this);
  this._axisWorld._colliders.push(this);

  // find collisions on create
  this._setAsDynamic();
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

      this._axisWorld._placeColliderInGrid(this);

      this._AABB.pos.x = posX;
      this._AABB.pos.y = posY;
      this._AABB.half.x = hW;
      this._AABB.half.y = hH;

      this._setAsDynamic();
    }
  },
  resize: function(width, height) {
    this._AABB.half.x = width/2;
    this._AABB.half.y = height/2;

    if(!this._delta.x || !this._delta.y) {
      this._axisWorld._placeColliderInGrid(this);
    }

    this._setAsDynamic();
  },
  getDelta: function() {
    return this._delta;
  },
  setSensor: function(bool) {
    this._isSensor = bool;
  },
  isSensor: function() {
    return this._isSensor;
  },
  isDynamic: function() {
    return this._isDynamic;
  },
  setCollisionType: function(type) {
    this._collisionType = type;
  },
  getCollisionType: function() {
    return this._collisionType;
  },
  setUserData: function(data) {
    this._userData = data;
  },
  getUserData: function() {
    return this._userData;
  },
  setCollisionCallback: function(callback) {
    this._collisionCallback = callback;
  },
  getWidth: function() {
    return this._AABB.half.x * 2;
  },
  getHeight: function() {
    return this._AABB.half.y * 2;
  },
  _setAsDynamic: function() {
    if(!this._isDynamic) {
      this._isDynamic = true;
      this._axisWorld._dynamicColliders.push(this);
    }
  },
  _addContact: function(contact) {
    var needle = false;
    for(var i = 0; i < this._contacts.length; i++) {
      // prevent from adding another hit to contacts that contains same collider
      if(contact.collider === this._contacts[i].collider) {
        needle = true;
        return;
      }
    }
    this._contacts.push(contact);
  }
};

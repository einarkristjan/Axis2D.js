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

  this._velocity = {
    x: 0,
    y: 0
  };

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
  setPosition: function(x, y) {
    this._velocity.x = x - this._AABB.pos.x;
    this._velocity.y = y - this._AABB.pos.y;

    this._AABB.pos.x = x;
    this._AABB.pos.y = y;

    this._changed();
  },
  setSize: function(width, height) {
    this._AABB.half.x = width/2;
    this._AABB.half.y = height/2;

    this._changed();
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
  _changed: function() {
    this._axisWorld._placeInGrid(this);
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

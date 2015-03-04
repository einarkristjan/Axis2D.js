Axis2D.Collider = function(axisWorld, x, y, width, height) {
  Axis2D.typeCheck(axisWorld, 'axisWorld', Axis2D.World);
  Axis2D.typeCheck(x, 'x', 'Number');
  Axis2D.typeCheck(y, 'y', 'Number');
  Axis2D.typeCheck(width, 'width', 'Number');
  Axis2D.typeCheck(height, 'height', 'Number');

  this._axisWorld = axisWorld;

  this._AABB = new intersect.AABB({},{});
  this._AABB.pos.x = x || 0;
  this._AABB.pos.y = y || 0;
  this._AABB.half.x = (Math.abs(width) || axisWorld._grid._cellSize - 1) / 2;
  this._AABB.half.y = (Math.abs(height) || axisWorld._grid._cellSize - 1) / 2;

  this._delta = new intersect.Point(0, 0);

  this._responseType = 'slide';

  this._isTouching = {
    top: false,
    left: false,
    right: false,
    bottom: false
  };

  this._potentialHitColliders = [];

  this._isSensor = false;

  this._groupName = '';
  this._groupFilters = [];

  this._positionInGridKeys = [];
  this._hits = [];

  this.userData = undefined;
  this._collisionCallback = undefined;

  this._isDynamic = false;

  this._axisWorld._grid._placeColliderInGrid(this);
  this._axisWorld._colliders.push(this);

  // find collisions on create
  this._setAsDynamic();
};

Axis2D.Collider.prototype = {
  moveTo: function(x, y) {
    this._delta.x = x - this._AABB.pos.x;
    this._delta.y = y - this._AABB.pos.y;

    if(this._delta.x || this._delta.y) {
      this._placeInPotentialGrid();
      this._setAsDynamic();
    }
  },
  resize: function(width, height) {
    var hW = width / 2,
        hH = height / 2;

    // only if collider resizes up... else it's in same grid
    if(this._AABB.half.x !== hW && this._AABB.half.y !== hH) {
      this._AABB.half.x = width / 2;
      this._AABB.half.y = height / 2;
      this._placeInPotentialGrid();
      this._setAsDynamic();
    }
  },
  setGroupName: function(name) {
    Axis2D.typeCheck(name, 'name', 'String');
    this._groupName = name;
  },
  setGroupFilters: function(names) {
    Axis2D.typeCheck(names, 'names', 'Array');
    this._groupFilters = names;
  },
  setResponseType: function(type) {
    Axis2D.typeCheck(type, 'type', 'String');

    var needle = false;
    for(var key in this._axisWorld._responses) {
      if(key === type) {
        needle = true;
      }
    }

    if(!needle) {
      throw Error('response type does not exist in Axis2D World');
    }

    this._responseType = type;
  },
  getResponseType: function() {
    return this._responseType;
  },
  setCollisionCallback: function(callback) {
    Axis2D.typeCheck(callback, 'callback', 'Function');
    this._collisionCallback = callback;
  },
  getPosition: function() {
    return this._AABB.pos;
  },
  getWidth: function() {
    return this._AABB.half.x * 2;
  },
  getHeight: function() {
    return this._AABB.half.y * 2;
  },
  getHits: function() {
    return this._hits;
  },
  getTouches: function() {
    return this._isTouching;
  },
  setSensor: function(bool) {
    Axis2D.typeCheck(bool, 'bool', 'Boolean');
    this._isSensor = bool;
  },
  isSensor: function() {
    return this._isSensor;
  },
  _placeInPotentialGrid: function() {
    // 1. move collider to the middle/center position
    // 2. make the collider take upp all the space it moved in
    // 3. place collider in the grid
    // 4. find potential hit colliders
    // 5. resize collider back and place it in the new coords
    var hW = this._AABB.half.x,
        hH = this._AABB.half.y,
        posX = this._AABB.pos.x,
        posY = this._AABB.pos.y;

    this._AABB.pos.x += this._delta.x / 2;
    this._AABB.pos.y += this._delta.y / 2;

    this._AABB.half.x = Math.abs(this._delta.x) / 2 + hW;
    this._AABB.half.y = Math.abs(this._delta.y) / 2 + hH;

    this._axisWorld._grid._placeColliderInGrid(this);

    this._positionInGridKeys.forEach(function(key){
      this._axisWorld._grid._cells[key].forEach(function(oc){
        if(this !== oc && this._potentialHitColliders.indexOf(oc) === -1) {
          this._potentialHitColliders.push(oc);
        }
      }, this);
    }, this);

    this._AABB.pos.x = posX;
    this._AABB.pos.y = posY;
    this._AABB.half.x = hW;
    this._AABB.half.y = hH;
  },
  _calculateTouches: function() {
    if(!this.isSensor()) {
      this._hits.forEach(function(hit){
        var oc = hit.collider,
            rf = this._groupFilters,
            otherNotInFilter = rf.indexOf(oc._groupName) === -1;

        if(!oc.isSensor() && otherNotInFilter) {
          if(hit.normal.x > 0) {
            this._isTouching.left = true;
          }
          else if(hit.normal.x < 0) {
            this._isTouching.right = true;
          }
          if(hit.normal.y > 0) {
            this._isTouching.top = true;
          }
          else if(hit.normal.y < 0) {
            this._isTouching.bottom = true;
          }
        }
      }, this);
    }
  },
  _setAsDynamic: function() {
    if(!this._isDynamic) {
      this._isDynamic = true;
      this._axisWorld._dynamicColliders.push(this);
    }
  },
  _addHit: function(hit) {
    for(var i = 0; i < this._hits.length; i++) {
      // prevent from adding another hit that contains same collider
      if(hit.collider === this._hits[i].collider) {
        return;
      }
    }
    this._hits.push(hit);
  }
};

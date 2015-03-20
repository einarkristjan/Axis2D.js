Axis2D.Collider = function(axisWorld, centerX, centerY, width, height) {
  Axis2D.typeCheck(axisWorld, 'axisWorld', Axis2D.World);
  Axis2D.typeCheck(centerX, 'centerX', 'Number');
  Axis2D.typeCheck(centerY, 'centerY', 'Number');
  Axis2D.typeCheck(width, 'width', 'Number');
  Axis2D.typeCheck(height, 'height', 'Number');

  this._axisWorld = axisWorld;

  this._AABB = new intersect.AABB({},{});
  this._AABB.pos.x = centerX || 0;
  this._AABB.pos.y = centerY || 0;
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

  this._collides = {
    top: true,
    left: true,
    right: true,
    bottom: true
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
};

Axis2D.Collider.prototype = {
  moveTo: function(x, y) {
    this._delta.x = x - this._AABB.pos.x;
    this._delta.y = y - this._AABB.pos.y;

    if(this._delta.x || this._delta.y) {
      this.setAsDynamic();
    }
  },
  resize: function(width, height) {
    var hW = width / 2,
        hH = height / 2;

    // only if collider resizes up... else it's in same grid
    if(this._AABB.half.x !== hW && this._AABB.half.y !== hH) {
      this._AABB.half.x = width / 2;
      this._AABB.half.y = height / 2;
      this.setAsDynamic();
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

    if(Object.keys(this._axisWorld._responses).indexOf(type) === -1) {
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
  setAsDynamic: function() {
    // Could be used on static colliders to push them from each other and
    // add hits.
    if(!this._isDynamic) {
      this._isDynamic = true;
      this._axisWorld._dynamicColliders.push(this);
    }
  },
  setCollides: function(top, left, right, bottom) {
    Axis2D.typeCheck(top, 'top', 'Boolean');
    Axis2D.typeCheck(left, 'left', 'Boolean');
    Axis2D.typeCheck(right, 'right', 'Boolean');
    Axis2D.typeCheck(bottom, 'bottom', 'Boolean');
    this._collides = {
      top: top,
      left: left,
      right: right,
      bottom: bottom
    };
  },
  getCollides: function() {
    return this._collides;
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
        var c = this,
            oc = hit.collider,
            rf = this._groupFilters,
            otherNotInFilter = rf.indexOf(oc._groupName) === -1;

        if(!oc.isSensor() && otherNotInFilter) {

          if(hit.normal.x > 0 && c._collides.left && oc._collides.right) {
            this._isTouching.left = true;
          }
          else if(hit.normal.x < 0 && c._collides.right && oc._collides.left) {
            this._isTouching.right = true;
          }

          if(hit.normal.y > 0 && c._collides.top && oc._collides.bottom) {
            this._isTouching.top = true;
          }
          else if(hit.normal.y < 0 && c._collides.bottom && oc._collides.top) {
            this._isTouching.bottom = true;
          }

        }
      }, this);
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
  },
  _sweepToDelta: function() {
    var cAABB = this._AABB,
        cDelta = this._delta,
        nearest = new intersect.Sweep(),
        otherColliders = this._potentialHitColliders;

    nearest.time = 1;
    nearest.pos.x = cAABB.pos.x + cDelta.x;
    nearest.pos.y = cAABB.pos.y + cDelta.y;

    this._placeInPotentialGrid();

    otherColliders.forEach(function(oc) {
      var sweep = oc._AABB.sweepAABB(cAABB, cDelta),
          crf = this._groupFilters,
          ocrf = oc._groupFilters,
          cFilterFound = ocrf.indexOf(this._groupName) !== -1,
          ocFilterFound = crf.indexOf(oc._groupName) !== -1,
          disabledCollisionsAxis = false;

      if(sweep.hit) {
        // 0.99 = bug in intersect?
        sweep.hit.delta.x += sweep.hit.normal.x * 0.99;
        sweep.hit.delta.y += sweep.hit.normal.y * 0.99;

        if((!this._collides.left && sweep.hit.normal.x > 0) ||
           (!this._collides.right && sweep.hit.normal.x < 0) ||
           (!this._collides.top && sweep.hit.normal.y > 0) ||
           (!this._collides.bottom && sweep.hit.normal.y < 0)) {
          disabledCollisionsAxis = true;
        }

        // sensor/filter check - ignore nearest
        if(this.isSensor() || cFilterFound || disabledCollisionsAxis) {
          this._addHits(sweep.hit, [oc]);

          // move all the way back for next sweep
          this._AABB.pos.x -= sweep.hit.delta.x;
          this._AABB.pos.y -= sweep.hit.delta.y;
        }
        else if (sweep.time < nearest.time) {

          if((!oc._collides.left && sweep.hit.normal.x < 0) ||
             (!oc._collides.right && sweep.hit.normal.x > 0) ||
             (!oc._collides.top && sweep.hit.normal.y < 0) ||
             (!oc._collides.bottom && sweep.hit.normal.y > 0)) {
            disabledCollisionsAxis = true;
          }

          // other sensor/filter check - ignore nearest
          if(oc.isSensor() || ocFilterFound || disabledCollisionsAxis) {
            this._addHits(sweep.hit, [oc]);

            // move all the way back for next sweep
            this._AABB.pos.x -= sweep.hit.delta.x;
            this._AABB.pos.y -= sweep.hit.delta.y;
          }
          else {
            sweep.hit.collider = oc;
            nearest = sweep;
          }
        }
      }
    }, this);

    if(nearest.hit) {
      this._addHits(nearest.hit, otherColliders);
    }

    return nearest;
  },
  _addHits: function(sweepHit, otherColliders) {
    // add a little to the delta for adding all colliders hitting,
    // because sweep can only hit one collider at a time
    this._AABB.pos.x += sweepHit.delta.x - sweepHit.normal.x;
    this._AABB.pos.y += sweepHit.delta.y - sweepHit.normal.y;

    otherColliders.forEach(function(colliderB){
      var hitA,
          hitB = this._AABB.intersectAABB(colliderB._AABB);

      if(hitB) {
        hitA = colliderB._AABB.intersectAABB(this._AABB);

        // we already got right delta
        hitA.delta = sweepHit.delta;

        // overwrite for collision callbacks to access collider
        hitA.collider = colliderB;
        hitB.collider = this;

        // colliderA was moved by adding a normal. so hitB delta will be wrong.
        // if colliderB is dynamic and moves into colliderA next, it should
        // be ok to set deltas to zero. _addHit will not create second
        // hit with same collider
        hitB.delta.x = 0;
        hitB.delta.y = 0;

        this._addHit(hitA);
        colliderB._addHit(hitB);

        if(this._axisWorld._collidersHit.indexOf(this) === -1) {
          this._axisWorld._collidersHit.push(this);
        }

        if(this._axisWorld._collidersHit.indexOf(colliderB) === -1) {
          this._axisWorld._collidersHit.push(colliderB);
        }
      }
    }, this);

    // fix position back to first hit
    this._AABB.pos.x += sweepHit.normal.x;
    this._AABB.pos.y += sweepHit.normal.y;
  }
};

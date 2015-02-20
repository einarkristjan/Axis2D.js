Axis2D.World = function(cellSize) {
  this._cellSize = cellSize || 64;

  this._grid = {};

  this._colliders = [];

  // dynamic colliders are colliders that have moved or be resized
  this._dynamicColliders = [];

  this._collidersHitPerUpdate = [];
};

Axis2D.World.prototype = {
  createCollider: function(x, y, width, height, isDynamic) {
    return new Axis2D.Collider(this, x, y, width, height, isDynamic);
  },
  createDebugDraw: function() {
    return new Axis2D.DebugDraw(this);
  },
  update: function() {
    // first pass - sweep dynamic colliders into other colliders + add contacts
    this._dynamicColliders.forEach(function(collider){
      var otherColliders = [];

      // find potential hit colliders in the grid
      collider._positionInGridKeys.forEach(function(key){
        this._grid[key].forEach(function(oc){
          if(collider !== oc && otherColliders.indexOf(oc) === -1) {
            otherColliders.push(oc);
          }
        }, this);
      }, this);

      this._sweepCollisionsFixes(collider, otherColliders);

      this._placeColliderInGrid(collider);

    }, this);

    // second pass - return contacts for static and dynamic
    this._collidersHitPerUpdate.forEach(function(c){
      if(c._collisionCallback) {
        c._collisionCallback(c._contacts);
        // cleanup for next round
        c._contacts = [];
      }
    }, this);
    this._collidersHitPerUpdate = [];

    // dynamic clean ups
    this._dynamicColliders.forEach(function(c){
      c._isDynamic = false;
      c._delta.x = 0;
      c._delta.y = 0;
    }, this);
    this._dynamicColliders = [];
  },
  _sweepCollisionsFixes: function(collider, otherColliders) {
    var cType,
        sweep = this._sweepInto(collider, otherColliders);

    if(sweep.hit && !collider._isSensor) {
      cType = collider._collisionType;

      this._sweepMoveFowardBackCheck(sweep, collider, otherColliders);

      if(cType === 'slide' || cType === 'bounce') {
        if(cType === 'slide') {
          // undo the normal hit delta before slide
          if(sweep.hit.normal.x) {
            collider._delta.x = 0;
          }
          if(sweep.hit.normal.y) {
            collider._delta.y = 0;
          }
        }

        if(cType === 'bounce') {
          // mirror the delta before next sweep
          if(sweep.hit.normal.x) {
            collider._delta.x = -collider._delta.x;
          }
          if(sweep.hit.normal.y) {
            collider._delta.y = -collider._delta.y;
          }
        }

        // sweep again (slide or bounce)
        sweep = this._sweepInto(collider, otherColliders);

        if(sweep.hit) {
          this._sweepMoveFowardBackCheck(sweep, collider, otherColliders);
        }
      }
    }
    // hit nothing or is a sensor
    else {
      collider._AABB.pos.x += collider._delta.x;
      collider._AABB.pos.y += collider._delta.y;
    }
  },
  _addToCollidersHitPerUpdate: function(colliderA, colliderB) {
    var hitA,
        hitB = colliderA._AABB.intersectAABB(colliderB._AABB);

    if(hitB) {
      hitA = colliderB._AABB.intersectAABB(colliderA._AABB);

      // overwrite for collision callbacks to access collider
      hitA.collider = colliderB;
      hitB.collider = colliderA;

      colliderA._addContact(hitA);
      colliderB._addContact(hitB);

      if(this._collidersHitPerUpdate.indexOf(colliderA) === -1) {
        this._collidersHitPerUpdate.push(colliderA);
      }

      if(this._collidersHitPerUpdate.indexOf(colliderB) === -1) {
        this._collidersHitPerUpdate.push(colliderB);
      }
    }
  },
  _sweepMoveFowardBackCheck: function(sweep, collider, otherColliders) {
    var pushFrac = 1.001;
    // set first hit position before sweeping again
    // add a little to the delta for collision callbacks
    collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
    collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

    // add slide-end contacts
    otherColliders.forEach(function(otherCollider){
      this._addToCollidersHitPerUpdate(collider, otherCollider);
    }, this);

    // fix position (push away from collider with fraction)
    collider._AABB.pos.x += sweep.hit.normal.x * pushFrac;
    collider._AABB.pos.y += sweep.hit.normal.y * pushFrac;
  },
  _sweepSensorMoveForwardBackCheck: function(sweep, colliderA, colliderB) {
    colliderA._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
    colliderA._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

    this._addToCollidersHitPerUpdate(colliderA, colliderB);

    // move back for next move
    colliderA._AABB.pos.x -= sweep.hit.delta.x - sweep.hit.normal.x;
    colliderA._AABB.pos.y -= sweep.hit.delta.y - sweep.hit.normal.y;
  },
  _sweepInto: function(collider, otherColliders) {
    var sweep,
        cAABB = collider._AABB,
        cDelta = collider._delta,
        nearest = new intersect.Sweep();

    nearest.time = 1;
    nearest.pos.x = cAABB.pos.x + cDelta.x;
    nearest.pos.y = cAABB.pos.y + cDelta.y;

    otherColliders.forEach(function(oc) {
      sweep = oc._AABB.sweepAABB(cAABB, cDelta);

      if(sweep.hit) {
        // sensor check
        if(collider._isSensor) {
          this._sweepSensorMoveForwardBackCheck(sweep, collider, oc);
        }
        else if (sweep.time < nearest.time) {
          // other sensor check
          if(oc._isSensor) {
            this._sweepSensorMoveForwardBackCheck(sweep, collider, oc);
          }
          else {
            nearest = sweep;
          }
        }
      }
    }, this);

    return nearest;
  },
  _placeColliderInGrid: function(collider) {
    // delete from last main grid position
    this._clearColliderFromGrid(collider);

    this._getColliderKeysInGrid(collider).forEach(function(key){
      if(!this._grid[key]) {
        this._grid[key] = [];
      }

      if(this._grid[key].indexOf(collider) === -1) {
        collider._positionInGridKeys.push(key);
        this._grid[key].push(collider);
      }
    }, this);
  },
  _clearColliderFromGrid: function(collider) {
    var gKey;

    collider._positionInGridKeys.forEach(function(cgKey){
      gKey = this._grid[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._grid[cgKey];
      }
    }, this);
    // reset collider grid keys after deleting from main grid
    collider._positionInGridKeys = [];
  },
  _getColliderKeysInGrid: function(collider) {
    var keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._AABB.pos.x - collider._AABB.half.x,
        posY = collider._AABB.pos.y - collider._AABB.half.y,
        cWidth = collider._AABB.half.x * 2,
        cHeight = collider._AABB.half.y * 2,
        cellSize = this._cellSize,
        keys = [];

    for(;;) {
      keyX = Math.floor((x+posX) / cellSize);
      keyY = Math.floor((y+posY) / cellSize);

      keys.push('x'+keyX+'y'+keyY);

      if(x === cWidth && y === cHeight) {
        break;
      }

      if(x === cWidth) {
        x = 0;
        y += cellSize;
        if(y > cHeight) {
          y = cHeight;
        }
      }
      else {
        x += cellSize;
      }

      if(x > cWidth) {
        x = cWidth;
      }
    }
    return keys;
  }
};

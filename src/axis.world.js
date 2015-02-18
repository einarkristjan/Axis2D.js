AXIS.World = function(cellSize) {
  this._cellSize = cellSize || 64;

  this._grid = {};

  this._colliders = [];
  this._dynamicColliders = [];

  this._collidersHit = [];
};

AXIS.World.prototype = {
  createCollider: function(x, y, width, height, isDynamic) {
    return new AXIS.Collider(this, x, y, width, height, isDynamic);
  },
  createDebugDraw: function() {
    return new AXIS.DebugDraw(this);
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

      if(collider._isSensor) {
        collider._AABB.pos.x += collider._delta.x;
        collider._AABB.pos.y += collider._delta.y;

        otherColliders.forEach(function(otherCollider){
          this._addToCollidersHit(collider, otherCollider);
        }, this);
      }
      else {
        this._sweepCollisionsFixes(collider, otherColliders);
      }

      this._placeColliderInGrid(collider);

    }, this);

    // second pass - return contacts / cleanup
    this._collidersHit.forEach(function(c){
      if(c._collisionCallback) {
        c._collisionCallback(c._contacts);
        // cleanup for next round
        c._contacts = [];
      }
    }, this);
    this._collidersHit = [];

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
        pushFrac = 1.001,
        ocs = otherColliders,
        sweep = this._sweepInto(collider, ocs);

    if(sweep.hit) {
      cType = collider._collisionType;

      // first contact - add a little to the delta for collision callbacks
      collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
      collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

      // add first hit contacts
      ocs.forEach(function(otherCollider){
        this._addToCollidersHit(collider, otherCollider);
      }, this);

      // fix position before sweeping again (push away with fraction)
      collider._AABB.pos.x += sweep.hit.normal.x * pushFrac;
      collider._AABB.pos.y += sweep.hit.normal.y * pushFrac;

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
        sweep = this._sweepInto(collider, ocs);

        if(sweep.hit) {
          // set first hit position before sweeping again
          // add a little to the delta for collision callbacks
          collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
          collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

          // add slide-end contacts
          ocs.forEach(function(otherCollider){
            this._addToCollidersHit(collider, otherCollider);
          }, this);

          // fix position (push away from collider with fraction)
          collider._AABB.pos.x += sweep.hit.normal.x * pushFrac;
          collider._AABB.pos.y += sweep.hit.normal.y * pushFrac;
        }
      }
    }
    // hit nothing
    else {
      collider._AABB.pos.x += collider._delta.x;
      collider._AABB.pos.y += collider._delta.y;
    }
  },
  _addToCollidersHit: function(colliderA, colliderB) {
    var hitA,
        hitB = colliderA._AABB.intersectAABB(colliderB._AABB);

    if(hitB) {
      hitA = colliderB._AABB.intersectAABB(colliderA._AABB);

      // overwrite for collision callbacks to access collider
      hitA.collider = colliderB;
      hitB.collider = colliderA;

      colliderA._contacts.push(hitA);
      colliderB._contacts.push(hitB);

      if(this._collidersHit.indexOf(colliderA) === -1) {
        this._collidersHit.push(colliderA);
      }

      if(this._collidersHit.indexOf(colliderB) === -1) {
        this._collidersHit.push(colliderB);
      }
    }
  },
  _sweepInto: function(collider, otherColliders) {
    var sweep,
        nearest = new intersect.Sweep();

    nearest.time = 1;
    nearest.pos.x = collider._AABB.pos.x + collider._delta.x;
    nearest.pos.y = collider._AABB.pos.y + collider._delta.y;

    otherColliders.forEach(function(otherCollider) {
      sweep = otherCollider._AABB.sweepAABB(collider._AABB, collider._delta);
      if (sweep.time < nearest.time) {
        if(otherCollider._isSensor) {
          // TODO: better way to create contacts
        }
        else {
          nearest = sweep;
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

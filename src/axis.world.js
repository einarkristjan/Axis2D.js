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
  update: function() {
    // first pass - sweep dynamic colliders into static colliders + add contacts
    this._dynamicColliders.forEach(function(collider){
      var sweep,
          cType,
          AABBs = [],
          staticColliders = [];

      // find potential static hit colliders in the grid
      collider._positionInGridKeys.forEach(function(key){
        this._grid[key].forEach(function(otherCollider){
          if(collider !== otherCollider && !otherCollider._isDynamic) {
            staticColliders.push(otherCollider);
          }
        }, this);
      }, this);

      AABBs = staticColliders.map(function(collider){
        return collider._AABB;
      });
      sweep = collider._AABB.sweepInto(AABBs, collider._delta);

      // move collider to new position
      if(sweep.hit) {
        cType = collider._collisionType;

        // first contact - add a little to the delta for collision callbacks
        collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
        collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

        // add first hit contacts
        staticColliders.forEach(function(staticCollider){
          this._addToCollidersHit(collider, staticCollider);
        }, this);

        // fix position before sweeping again
        collider._AABB.pos.x += sweep.hit.normal.x * 1.1;
        collider._AABB.pos.y += sweep.hit.normal.y * 1.1;

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

        if(cType === 'slide' || cType === 'bounce') {
          // sweep again (slide)
          sweep = collider._AABB.sweepInto(AABBs, collider._delta);

          if(sweep.hit) {
            // set first hit position before sweeping again
            // add a little to the delta for collision callbacks
            collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
            collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

            // add slide-end contacts
            staticColliders.forEach(function(staticCollider){
              this._addToCollidersHit(collider, staticCollider);
            }, this);

            collider._AABB.pos.x += sweep.hit.normal.x * 1.1;
            collider._AABB.pos.y += sweep.hit.normal.y * 1.1;
          }
        }
      }
      // hit nothing
      else {
        collider._AABB.pos.x += collider._delta.x;
        collider._AABB.pos.y += collider._delta.y;
      }

      this._placeInGrid(collider);

      // reset for next round
      collider._delta.x = 0;
      collider._delta.y = 0;
    }, this);

    // second pass - collision checks against dynamic + add contacts
    this._dynamicColliders.forEach(function(colliderA){
      colliderA._positionInGridKeys.forEach(function(key){
        this._grid[key].forEach(function(colliderB){
          if(colliderA !== colliderB && colliderB.isDynamic) {
            this._addToCollidersHit(colliderA, colliderB);
          }
        }, this);
      }, this);
    }, this);

    // third pass - return contacts / cleanup
    this._collidersHit.forEach(function(c){
      if(c._collisionCallback) {
        c._collisionCallback(c._contacts);

        // cleanup for next round
        c._contacts = [];
      }
    }, this);

    // reset for next round
    this._collidersHit = [];
  },
  debugDrawGrid: function(callback) {
    var g, key, x, y, split,
        cellSize = this._cellSize;

    for(key in this._grid) {
      g = this._grid[key];
      split = key.split(/(\-?\d*)/);
      x = split[1] * cellSize;
      y = split[3] * cellSize;

      callback(x, y, cellSize, cellSize, g.length);
    }
  },
  debugDrawColliders: function(callback) {
    var x, y, cX, cY, w, h, isDyn;

    this._colliders.forEach(function(c){
      x = c._AABB.pos.x - c._AABB.half.x;
      y = c._AABB.pos.y - c._AABB.half.y;
      cX = x + c._AABB.half.x;
      cY = y + c._AABB.half.y;
      w = c._AABB.half.x*2;
      h = c._AABB.half.y*2;
      isDyn = c._isDynamic;

      callback(x, y, w, h, cX, cY, isDyn);
    }, this);
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
  _addToGrid: function(x, y, collider) {
    var key = 'x'+x+'y'+y;

    if(!this._grid[key]) {
      this._grid[key] = [];
    }

    if(this._grid[key].indexOf(collider) === -1) {
      collider._positionInGridKeys.push(key);
      this._grid[key].push(collider);
    }
  },
  _placeInGrid: function(collider) {
    var gKey, keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._AABB.pos.x - collider._AABB.half.x,
        posY = collider._AABB.pos.y - collider._AABB.half.y,
        cWidth = collider._AABB.half.x * 2,
        cHeight = collider._AABB.half.y * 2,
        cellSize = this._cellSize;

    // delete from last main grid position
    collider._positionInGridKeys.forEach(function(cgKey){
      gKey = this._grid[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._grid[cgKey];
      }
    }, this);
    // reset collider grid keys after deleting from main grid
    collider._positionInGridKeys = [];

    for(;;) {
      keyX = Math.floor((x+posX) / cellSize);
      keyY = Math.floor((y+posY) / cellSize);

      this._addToGrid(keyX, keyY, collider);

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
  }
};

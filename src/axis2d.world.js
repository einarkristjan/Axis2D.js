Axis2D.World = function World(cellSize) {
  Axis2D.typeCheck(cellSize, 'cellSize', 'Number');

  this._cellSize = Math.abs(cellSize) || 64;
  this._grid = {};
  this._colliders = [];
  this._collidersHitPerUpdate = [];
  this._responses = [];
  this._debugDraw = undefined;

  // dynamic colliders are colliders that have moved or be resized
  this._dynamicColliders = [];
};

Axis2D.World.prototype = {
  createCollider: function(x, y, width, height) {
    return new Axis2D.Collider(this, x, y, width, height);
  },
  removeCollider: function(collider) {
    Axis2D.typeCheck(collider, 'collider', Axis2D.Collider);
    var collidersIndex = this._colliders.indexOf(collider),
        dynamicCollidersIndex = this._dynamicColliders.indexOf(collider);

    this._clearColliderFromGrid(collider);

    if(collidersIndex !== -1) {
      this._colliders.splice(collidersIndex, 1);
    }
    if(dynamicCollidersIndex !== -1) {
      this._dynamicColliders.splice(dynamicCollidersIndex, 1);
    }
  },
  createDebugDraw: function() {
    var d = new Axis2D.DebugDraw(this);
    this._debugDraw = d;
    return d;
  },
  update: function() {
    // first pass - sweep dynamic colliders into other colliders + add hits
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

      this._collisionResponses(collider, otherColliders);
      this._placeColliderInGrid(collider);

      // cleanups
      collider._isDynamic = false;
      collider._delta.x = 0;
      collider._delta.y = 0;
    }, this);
    this._dynamicColliders = [];

    // second pass - return hits for static and dynamic
    this._collidersHitPerUpdate.forEach(function(c){
      c._calculateTouches();
      if(c._collisionCallback) {
        c._collisionCallback(c.getHits(), c.getTouches());
      }
    }, this);
    this._collidersHitPerUpdate = [];
  },
  debugDraw: function() {
    if(this._debugDraw) {
      this._debugDraw._draw();
    }
  },
  createCollisionType: function(name, response, secondSweep) {
    Axis2D.typeCheck(name, 'name', 'String');
    Axis2D.typeCheck(response, 'response', 'Function');
    Axis2D.typeCheck(secondSweep, 'secondSweep', 'Boolean');

    // TODO: finish it ! :P

  },
  _collisionResponses: function(collider, otherColliders) {
    var cType = collider.getCollisionType(),
        sweep = this._sweepDeltaResponse(collider, otherColliders);

    if(sweep.hit) {
      // first hit, set last position for scripting
      collider._lastHitPosition.x = collider._AABB.pos.x;
      collider._lastHitPosition.y = collider._AABB.pos.y;

      if(cType === 'touch') {
        collider._delta.x = 0;
        collider._delta.y = 0;
      }

      if(cType === 'slide') {
        // undo the normal hit delta before slide
        if(sweep.hit.normal.x) {
          collider._delta.x = 0;
        }
        else if(sweep.hit.normal.y) {
          collider._delta.y = 0;
        }

        // second sweep
        sweep = this._sweepDeltaResponse(collider, otherColliders);

        if(sweep.hit) {
          // if we got a hit on second run.. moveForwardAddHits has fixed pos
          collider._delta.x = 0;
          collider._delta.y = 0;
        }
      }

      if(cType === 'bounce') {
        // mirror the delta before next sweep
        if(sweep.hit.normal.x) {
          collider._delta.x = -collider._delta.x;
        }
        else if(sweep.hit.normal.y) {
          collider._delta.y = -collider._delta.y;
        }

        // second sweep
        sweep = this._sweepDeltaResponse(collider, otherColliders);

        if(sweep.hit) {
          // if we got a hit on second run.. moveForwardAddHits has fixed pos
          collider._delta.x = 0;
          collider._delta.y = 0;
        }
      }
    }

    // fix position
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  },
  _sweepDeltaResponse: function(collider, otherColliders) {
    var sweep = this._sweepInto(collider, otherColliders);

    if(sweep.hit) {
      this._moveForwardAddHits(sweep, collider, otherColliders);

      // move back for next move (add fraction cuz of a bug in intersect-lib?)
      collider._AABB.pos.x += sweep.hit.normal.x * 1.001;
      collider._AABB.pos.y += sweep.hit.normal.y * 1.001;
    }

    return sweep;
  },
  _addToCollidersHitPerUpdate: function(colliderA, colliderB) {
    var hitA,
        hitB = colliderA._AABB.intersectAABB(colliderB._AABB);

    if(hitB) {
      hitA = colliderB._AABB.intersectAABB(colliderA._AABB);

      // overwrite for collision callbacks to access collider
      hitA.collider = colliderB;
      hitB.collider = colliderA;

      colliderA._addHit(hitA);
      colliderB._addHit(hitB);

      if(this._collidersHitPerUpdate.indexOf(colliderA) === -1) {
        this._collidersHitPerUpdate.push(colliderA);
      }

      if(this._collidersHitPerUpdate.indexOf(colliderB) === -1) {
        this._collidersHitPerUpdate.push(colliderB);
      }
    }
  },
  _moveForwardAddHits: function(sweep, collider, otherColliders) {
    // set first hit position before sweeping again
    // add a little to the delta for adding all colliders hitting
    collider._AABB.pos.x += sweep.hit.delta.x - sweep.hit.normal.x;
    collider._AABB.pos.y += sweep.hit.delta.y - sweep.hit.normal.y;

    otherColliders.forEach(function(otherCollider){
      this._addToCollidersHitPerUpdate(collider, otherCollider);
    }, this);
  },
  _sweepInto: function(collider, otherColliders) {
    var cAABB = collider._AABB,
        cDelta = collider._delta,
        nearest = new intersect.Sweep();

    nearest.time = 1;
    nearest.pos.x = cAABB.pos.x + cDelta.x;
    nearest.pos.y = cAABB.pos.y + cDelta.y;

    otherColliders.forEach(function(oc) {
      var sweep = oc._AABB.sweepAABB(cAABB, cDelta),
          crf = collider._responseFilters,
          ocrf = oc._responseFilters,
          cFound = ocrf.indexOf(collider._responseName) !== -1,
          ocFound = crf.indexOf(oc._responseName) !== -1;

      if(sweep.hit) {
        // sensor/filter check
        if(collider.getCollisionType() === 'sensor' || cFound) {
          this._moveForwardAddHits(sweep, collider, [oc]);

          // move back for next move
          collider._AABB.pos.x -= sweep.hit.delta.x - sweep.hit.normal.x;
          collider._AABB.pos.y -= sweep.hit.delta.y - sweep.hit.normal.y;
        }
        else if (sweep.time < nearest.time) {
          // other sensor/filter check
          if(oc.getCollisionType() === 'sensor' || ocFound) {
            this._moveForwardAddHits(sweep, collider, [oc]);

            // move back for next move
            collider._AABB.pos.x -= sweep.hit.delta.x - sweep.hit.normal.x;
            collider._AABB.pos.y -= sweep.hit.delta.y - sweep.hit.normal.y;
          }
          else {
            sweep.hit.collider = oc;
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
    // delete from main grid
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

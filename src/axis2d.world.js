Axis2D.World = function World(cellSize) {
  Axis2D.typeCheck(cellSize, 'cellSize', 'Number');

  this._grid = new Axis2D.Grid(this, cellSize);

  this._colliders = [];
  this._collidersHit = [];
  this._responses = {};
  this._debugDraw = undefined;
  this._collisionCallback = undefined;

  // dynamic colliders are colliders that have moved or be resized
  this._dynamicColliders = [];

  this.createResponseType('touch', function(collider, otherColliders){
    var sweep = this._sweepInto(collider, otherColliders);

    if(sweep.hit) {
      this._moveForwardAddHits(sweep.hit, collider, otherColliders);

      // hard stop on hit
      collider._delta.x = 0;
      collider._delta.y = 0;
    }

    // fix position if any delta is left after responses
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  });

  this.createResponseType('slide', function(collider, otherColliders){
    var sweep = this._sweepInto(collider, otherColliders);

    if(sweep.hit) {
      this._moveForwardAddHits(sweep.hit, collider, otherColliders);

      // slide - undo the normal hit delta
      if(sweep.hit.normal.x) {
        collider._delta.x = 0;
      }
      else if(sweep.hit.normal.y) {
        collider._delta.y = 0;
      }

      // second sweep
      sweep = this._sweepInto(collider, otherColliders);

      if(sweep.hit) {
        this._moveForwardAddHits(sweep.hit, collider, otherColliders);

        // if we got a hit on second run.. moveForwardAddHits has fixed pos
        collider._delta.x = 0;
        collider._delta.y = 0;
      }
    }

    // fix position if any delta is left after responses
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  });

  this.createResponseType('bounce', function(collider, otherColliders){
    var sweep = this._sweepInto(collider, otherColliders);

    if(sweep.hit) {
      this._moveForwardAddHits(sweep.hit, collider, otherColliders);

      // bounce - mirror the delta before next sweep
      if(sweep.hit.normal.x) {
        collider._delta.x = -collider._delta.x;
      }
      if(sweep.hit.normal.y) {
        collider._delta.y = -collider._delta.y;
      }

      // because inverted deltas, otherColliders could be outside of
      // the collider potential grid for next sweep
      collider._placeInPotentialGrid();

      // second sweep
      sweep = this._sweepInto(collider, otherColliders);

      if(sweep.hit) {
        this._moveForwardAddHits(sweep.hit, collider, otherColliders);

        // if we got a hit on second run.. moveForwardAddHits has fixed pos
        collider._delta.x = 0;
        collider._delta.y = 0;
      }
    }

    // fix position if any delta is left after responses
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  });

};

Axis2D.World.prototype = {
  update: function() {
    // first pass - clear last hits - beginning of update for scripting
    // outside of Axis2D.
    this._collidersHit.forEach(function(c){
      c._hits = [];
      c._lastHitPositions = [];
      c._isTouching.top = false;
      c._isTouching.left = false;
      c._isTouching.right = false;
      c._isTouching.bottom = false;
    }, this);
    this._collidersHit = [];

    // second pass - sweep dynamic colliders into other colliders + add hits
    this._dynamicColliders.forEach(function(collider){
      var cType,
          otherColliders = collider._potentialHitColliders;

      // sensor is a hard-coded response type that overwrites other types
      if(collider.isSensor()) {
        // hits added in sweepInto because sensors move through many colliders
        sweep = this._sweepInto(collider, otherColliders);

        // sensors always move forward
        collider._AABB.pos.x += collider._delta.x;
        collider._AABB.pos.y += collider._delta.y;
      }
      else {
        cType = collider.getResponseType();
        this._responses[cType].call(this, collider, otherColliders);
      }

      this._grid._placeColliderInGrid(collider);

      // cleanups
      collider._potentialHitColliders = [];
      collider._isDynamic = false;
      collider._delta.x = 0;
      collider._delta.y = 0;
    }, this);
    this._dynamicColliders = [];

    // third pass - return hits for static and dynamic
    this._collidersHit.forEach(function(c){
      c._calculateTouches();
      if(c._collisionCallback) {
        c._collisionCallback(c.getHits(), c.getTouches());
      }
    }, this);

    if(this._collisionCallback && this._collidersHit.length) {
      this._collisionCallback(this._collidersHit);
    }
  },
  createCollider: function(x, y, width, height) {
    return new Axis2D.Collider(this, x, y, width, height);
  },
  removeCollider: function(collider) {
    Axis2D.typeCheck(collider, 'collider', Axis2D.Collider);
    var collidersIndex = this._colliders.indexOf(collider),
        dynamicCollidersIndex = this._dynamicColliders.indexOf(collider);

    this._grid._clearColliderFromGrid(collider);

    if(collidersIndex !== -1) {
      this._colliders.splice(collidersIndex, 1);
    }
    if(dynamicCollidersIndex !== -1) {
      this._dynamicColliders.splice(dynamicCollidersIndex, 1);
    }
  },
  createDebugDraw: function() {
    return new Axis2D.DebugDraw(this);
  },
  debugDraw: function() {
    Axis2D.typeCheck(this._debugDraw, 'this._debugDraw', Axis2D.DebugDraw);
    this._debugDraw._draw();
  },
  createResponseType: function(name, response) {
    Axis2D.typeCheck(name, 'name', 'String');
    Axis2D.typeCheck(response, 'response', 'Function');

    this._responses[name] = response;
  },
  getCollidersHit: function() {
    return this._collidersHit;
  },
  setCollisionCallback: function(callback) {
    Axis2D.typeCheck(callback, 'callback', 'Function');
    this._collisionCallback = callback;
  },
  getColliders: function() {
    return this._colliders;
  },
  countColliders: function() {
    return this._colliders.length;
  },
  countGridCells: function() {
    return Object.keys(this._grid._cells).length;
  },
  queryPoint: function(x, y) {
    var colliders = [],
        keyX = Math.floor(x/this._grid._cellSize),
        keyY = Math.floor(y/this._grid._cellSize),
        key = 'x'+keyX+'y'+keyY;

    if(this._grid._cells[key]) {
      this._grid._cells[key].forEach(function(collider){
        if(collider._AABB.intersectPoint(new intersect.Point(x, y))) {
          colliders.push(collider);
        }
      }, this);
    }

    return colliders;
  },
  queryRect: function(x, y, width, height) {
    var colliders = [];

    return colliders;
  },
  querySegment: function(x1, y1, x2, y2, width, height, groupFilter) {
    var colliders = [];

    return colliders;
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
          crf = collider._groupFilters,
          ocrf = oc._groupFilters,
          cFilterFound = ocrf.indexOf(collider._groupName) !== -1,
          ocFilterFound = crf.indexOf(oc._groupName) !== -1;

      if(sweep.hit) {
        // bug in intersect?
        sweep.hit.delta.x += sweep.hit.normal.x * 0.99;
        sweep.hit.delta.y += sweep.hit.normal.y * 0.99;

        // sensor/filter check - ignore nearest
        if(collider.isSensor() || cFilterFound) {
          this._moveForwardAddHits(sweep.hit, collider, [oc]);

          // move all the way back for next sweep
          collider._AABB.pos.x -= sweep.hit.delta.x;
          collider._AABB.pos.y -= sweep.hit.delta.y;
        }
        else if (sweep.time < nearest.time) {
          // other sensor/filter check - ignore nearest
          if(oc.isSensor() || ocFilterFound) {
            this._moveForwardAddHits(sweep.hit, collider, [oc]);

            // move all the way back for next sweep
            collider._AABB.pos.x -= sweep.hit.delta.x;
            collider._AABB.pos.y -= sweep.hit.delta.y;
          }
          else {
            nearest = sweep;
          }
        }
      }
    }, this);

    return nearest;
  },
  _moveForwardAddHits: function(sweepHit, collider, otherColliders) {
    // add a little to the delta for adding all colliders hitting,
    // because sweep can only hit one collider at a time
    collider._AABB.pos.x += sweepHit.delta.x - sweepHit.normal.x;
    collider._AABB.pos.y += sweepHit.delta.y - sweepHit.normal.y;

    otherColliders.forEach(function(otherCollider){
      this._addToCollidersHit(sweepHit, collider, otherCollider);
    }, this);

    // fix position back to first hit
    collider._AABB.pos.x += sweepHit.normal.x;
    collider._AABB.pos.y += sweepHit.normal.y;
  },
  _addToCollidersHit: function(sweepHit, colliderA, colliderB) {
    var hitA,
        hitB = colliderA._AABB.intersectAABB(colliderB._AABB);

    if(hitB) {
      hitA = colliderB._AABB.intersectAABB(colliderA._AABB);

      // overwrite for collision callbacks to access collider
      hitA.collider = colliderB;
      hitB.collider = colliderA;

      // set original fix delta + fraction
      hitA.delta.x = sweepHit.delta.x;
      hitA.delta.y = sweepHit.delta.y;

      // sweepHit was moved by normal. so hitB delta will be wrong.
      // if colliderB is dynamic and moves into colliderA, it should
      // be ok to set deltas to zero. _addHit will not create second
      // hit with same collider
      hitB.delta.x = 0;
      hitB.delta.y = 0;

      colliderA._addHit(hitA);
      colliderB._addHit(hitB);

      if(this._collidersHit.indexOf(colliderA) === -1) {
        this._collidersHit.push(colliderA);
      }

      if(this._collidersHit.indexOf(colliderB) === -1) {
        this._collidersHit.push(colliderB);
      }
    }
  }
};

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

  // create default responses

  this.createResponseType('touch', function(collider){
    var sweep = collider._sweepForward();

    if(sweep.hit) {
      // hard stop on hit
      collider._delta.x = 0;
      collider._delta.y = 0;
    }

    // fix position if any delta is left after hits
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  });

  this.createResponseType('slide', function(collider){
    var sweep = collider._sweepForward();

    if(sweep.hit) {
      // slide - undo the normal hit delta
      if(sweep.hit.normal.x) {
        collider._delta.x = 0;
      }
      else if(sweep.hit.normal.y) {
        collider._delta.y = 0;
      }

      // second sweep
      sweep = collider._sweepForward();

      if(sweep.hit) {
        // if we got a hit on second run.. _sweepForward has fixed pos
        collider._delta.x = 0;
        collider._delta.y = 0;
      }
    }

    // fix position if any delta is left after hits
    collider._AABB.pos.x += collider._delta.x;
    collider._AABB.pos.y += collider._delta.y;
  });

  this.createResponseType('bounce', function(collider){
    var sweep = collider._sweepForward();

    if(sweep.hit) {
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
      sweep = collider._sweepForward();

      if(sweep.hit) {
        // if we got a hit on second run.. _sweepForward has fixed pos
        collider._delta.x = 0;
        collider._delta.y = 0;
      }
    }

    // fix position if any delta is left after hits
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
      // sensor is a hard-coded response type that overwrites other types
      if(collider.isSensor()) {
        // sensor hits added in sweepForward,
        // because sensors move through many colliders
        sweep = collider._sweepForward();

        // sensors always move forward to it's delta
        collider._AABB.pos.x += collider._delta.x;
        collider._AABB.pos.y += collider._delta.y;
      }
      else {
        this._responses[collider.getResponseType()].call(this, collider);
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
  }
};

Axis2D.DebugDraw = function DebugDraw(axisWorld) {
  Axis2D.typeCheck(axisWorld, 'axisWorld', Axis2D.World);

  this._axisWorld = axisWorld;

  this._colliderCallback = undefined;
  this._gridCallback = undefined;

  this._axisWorld._debugDraw = this;
};

Axis2D.DebugDraw.prototype = {
  setColliderCallback: function(callback) {
    Axis2D.typeCheck(callback, 'callback', 'Function');
    this._colliderCallback = callback;
  },
  setGridCallback: function(callback) {
    Axis2D.typeCheck(callback, 'callback', 'Function');
    this._gridCallback = callback;
  },
  _draw: function() {
    if(this._colliderCallback) {
      this._getColliders(this._colliderCallback);
    }
    if(this._gridCallback) {
      this._getGrid(this._gridCallback);
    }
  },
  _getColliders: function(callback) {
    var x, y, w, h,
        world = this._axisWorld;

    world._colliders.forEach(function(c){
      x = c._AABB.pos.x - c._AABB.half.x;
      y = c._AABB.pos.y - c._AABB.half.y;
      w = c._AABB.half.x * 2;
      h = c._AABB.half.y * 2;

      callback(c, x, y, w, h);
    }, this);
  },
  _getGrid: function(callback) {
    var g, key, x, y, split,
        world = this._axisWorld,
        cellSize = world._grid._cellSize;

    for(key in world._grid._cells) {
      g = world._grid._cells[key];
      split = key.split(/(\-?\d*)/);
      x = split[1] * cellSize;
      y = split[3] * cellSize;

      callback(x, y, cellSize, cellSize, g.length);
    }
  }
};

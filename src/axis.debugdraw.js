AXIS.DebugDraw = function(axisWorld) {
  if(!axisWorld) {
    throw TypeError('axisWorld not defined');
  }

  this._axisWorld = axisWorld;
};

AXIS.DebugDraw.prototype = {
  getColliders: function(callback) {
    var x, y, cX, cY, w, h,
        world = this._axisWorld;

    world._colliders.forEach(function(c){
      x = c._AABB.pos.x - c._AABB.half.x;
      y = c._AABB.pos.y - c._AABB.half.y;
      cX = x + c._AABB.half.x;
      cY = y + c._AABB.half.y;
      w = c._AABB.half.x * 2;
      h = c._AABB.half.y * 2;

      callback(x, y, w, h, c._isDynamic, c._isSensor);
    }, this);
  },
  getGrid: function(callback) {
    var g, key, x, y, split,
        world = this._axisWorld,
        cellSize = world._cellSize;

    for(key in world._grid) {
      g = world._grid[key];
      split = key.split(/(\-?\d*)/);
      x = split[1] * cellSize;
      y = split[3] * cellSize;

      callback(x, y, cellSize, cellSize, g.length);
    }
  }
};

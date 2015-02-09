var DEMO = DEMO || {};

DEMO.Vector2 = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

DEMO.Vector2.prototype = {
  set: function(x, y) {
    this.x = x;
    this.y = y;
  }
};

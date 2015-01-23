AXIS.Body = function(x, y, width, height) {
  var AABB = {
    x: x,
    y: y,
    width: width,
    height: height
  };

  var velocity = {
    x: 0,
    y: 0
  };

  this.move = function(x, y) {

  };

  this.getVelocity = function() {
    return velocity;
  };

  this.getAABB = function() {
    return AABB;
  };

  this.getWidth = function() {
    return AABB.width;
  };

  this.getHeight = function() {
    return AABB.height;
  };
};

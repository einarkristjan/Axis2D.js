AXIS.CollisionMap = function(map, offsetX, offsetY, world) {
  if(world) {
    world.collisionManager.addCollisionMap(map);
  }
};

AXIS.CollisionMap.prototype = {

};

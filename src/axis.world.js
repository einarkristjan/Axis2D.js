AXIS.World = function(cellSize) {
  cellSize = cellSize || 32;
  var bodies = [],
      tiles = [];

  this.addTiles = function(array) {
    tiles = array;
  };

  this.add = function(body) {
    bodies.push(body);
  };

  this.remove = function(body) {
    var index = bodies.indexOf(body);
    if(index > -1) {
      bodies.splice(index, 1);
    }
  };

  this.update = function() {
    var i, b, vel;
    for(i = 0; i < bodies.length; i++) {
      b = bodies[i];
      vel = b.getVelocity();

      if(vel.x || vel.y) {
        tileCollision(b);
      }
    }
  };

  function tileCollision(body, verticalCheck) {
    verticalCheck = verticalCheck || false;
    var x1, x2, y1, y2, part,
        AABB = body.getAABB(),
        velocity = body.getVelocity(),
        nextPosX = AABB.x + velocity.x,
        nextPosY = AABB.y + velocity.y;

    // horizontal
    part = AABB.height > cellSize ? cellSize : AABB.height;

    y1 = AXIS.toInt(AABB.y / cellSize);

    for(;;) {
      y2 = AXIS.toInt((AABB.y+part-1) / cellSize);

      if(velocity.x < 0) {
        x1 = AXIS.toInt(nextPosX / cellSize);
        // trying to move left
        if(tiles[y1][x1] || tiles[y2][x1]) {
          // place the body as close to the solid tile as possible
          /* entity.position.x = (x1 + 1) * cellSize;
          entity.velocity.x = 0; */
          console.log('hit-left');
        }
      }
      else if(velocity.x > 0) {
        x2 = AXIS.toInt((nextPosX+AABB.width-1) / cellSize);
        // trying to move right
        if(tiles[y1][x2] || tiles[y2][x2]) {
          // Place the body as close to the solid tile as possible
          /* entity.position.x = x2 * cellSize;
          entity.position.x -= AABB.width + 1;
          entity.velocity.x = 0; */
          console.log('hit-right');
        }
      }

      if(part === AABB.height) {
        break;
      }

      part += cellSize;

      if(part > AABB.height) {
        part = AABB.height;
      }
    }

    // vertical
    part = AABB.width > cellSize ? cellSize : AABB.width;

    x1 = AXIS.toInt(AABB.x / cellSize);

    for(;;) {
      x2 = AXIS.toInt((AABB.x+part-1) / cellSize);

      if(velocity.y < 0) {
        y1 = AXIS.toInt(nextPosY / cellSize);
        // trying to move down
        if (tiles[y1][x1] || tiles[y1][x2]) {
          // place the body as close to the solid tile as possible
          /* entity.position.y = (y1 + 1) * cellSize;
          entity.velocity.y = 0; */
          console.log('hit-down');
        }
      }
      else if(velocity.y > 0) {
        y2 = AXIS.toInt((nextPosY+AABB.height-1) / cellSize);
        // trying to move up
        if (tiles[y2][x1] || tiles[y2][x2]) {
          // place the body as close to the solid tile as possible
          /* entity.position.y = y2 * cellSize;
          entity.position.y -= AABB.height + 1;
          entity.velocity.y = 0; */
          console.log('hit-up');
        }
      }

      if(part === AABB.width) {
        break;
      }

      part += cellSize;

      if(part > AABB.width) {
        part = AABB.width;
      }
    }
  }
};

AXIS.World = function(cellSize) {
  this._cellSize = cellSize || 32;
  this._colliders = [];
  this._tiles = [];
};

AXIS.World.prototype = {
  addTiles: function(array) {
    this._tiles = array;
  },
  addCollider: function(collider) {
    this._colliders.push(collider);
  },
  removeCollider: function(body) {
    var index = this._colliders.indexOf(body);
    if(index > -1) {
      this._colliders.splice(index, 1);
    }
  },
  update: function() {
    var i, coll, vel,
        colliders = this._colliders;

    for(i = 0; i < colliders.length; i++) {
      coll = colliders[i];
      vel = coll._velocity;

      if(vel._x || vel._y) {
        this._tileCollision(coll);

        coll.setNewPosition();
      }
    }
  },
  _tileCollision: function(collider, verticalCheck) {
    verticalCheck = verticalCheck || false;
    var x1, x2, y1, y2, part,
        width = collider._width,
        height = collider._height,
        posX = collider._position._x,
        posY = collider._position._y,
        nextPosX = collider._nextPosition._x,
        nextPosY = collider._nextPosition._y,
        velX = collider._velocity._x,
        velY = collider._velocity._y,
        cellSize = this._cellSize,
        tiles = this._tiles;

    // horizontal
    part = height > cellSize ? cellSize : height;

    y1 = AXIS.toInt(posY / cellSize);

    for(;;) {
      y2 = AXIS.toInt((posY + part - 1) / cellSize);

      if(velX < 0) {
        x1 = AXIS.toInt(nextPosX / cellSize);

        // trying to move left
        if(tiles[y1][x1] || tiles[y2][x1]) {
          // place the body as close to the solid tile as possible
          /* entity.position.x = (x1 + 1) * cellSize;
          entity.velocity.x = 0; */
          console.log('hit-left');
        }
      }
      else if(velX > 0) {
        x2 = AXIS.toInt((nextPosX + width - 1) / cellSize);
        // trying to move right

        console.log('tiles['+y1+']['+x2+'] || tiles['+y2+']['+x2+']');

        if(tiles[y1][x2] || tiles[y2][x2]) {
          // Place the body as close to the solid tile as possible
          /* entity.position.x = x2 * cellSize;
          entity.position.x -= AABB.width + 1;
          entity.velocity.x = 0; */
          console.log('hit-right');
        }
      }

      if(part === height) {
        break;
      }

      part += cellSize;

      if(part > height) {
        part = height;
      }
    }

    // vertical
    part = width > cellSize ? cellSize : width;

    x1 = AXIS.toInt(posX / cellSize);

    for(;;) {
      x2 = AXIS.toInt((posX + part - 1) / cellSize);

      if(velY < 0) {
        y1 = AXIS.toInt(nextPosY / cellSize);

        // trying to move up
        if (tiles[y1][x1] || tiles[y1][x2]) {
          // place the body as close to the solid tile as possible
          /* entity.position.y = (y1 + 1) * cellSize;
          entity.velocity.y = 0; */
          console.log('hit-down');
        }
      }
      else if(velY > 0) {
        y2 = AXIS.toInt((nextPosY + height - 1) / cellSize);

        console.log('tiles['+y2+']['+x1+'] || tiles['+y2+']['+x2+']');

        // trying to move down
        if (tiles[y2][x1] || tiles[y2][x2]) {
          // place the body as close to the solid tile as possible
          /* entity.position.y = y2 * cellSize;
          entity.position.y -= AABB.height + 1;
          entity.velocity.y = 0; */
          console.log('hit-up');
        }
      }

      if(part === width) {
        break;
      }

      part += cellSize;

      if(part > width) {
        part = width;
      }
    }
  }
};

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
    var xJump, yJump, xLeft, xRight, yTop, yBottom,
        width = collider._width,
        height = collider._height,
        nextPosX = collider._nextPosition._x,
        nextPosY = collider._nextPosition._y,
        velX = collider._velocity._x,
        velY = collider._velocity._y,
        cellSize = this._cellSize,
        tiles = this._tiles;

    // horizontal
    yJump = AXIS.toInt(nextPosY / cellSize);
    xLeft = AXIS.toInt(nextPosX / cellSize);
    xRight = AXIS.toInt((nextPosX + width) / cellSize);

    for(;;) {
      if(velX < 0) {
        // trying to move left
        if(tiles[yJump][xLeft]) {
          console.log('hit-left');
        }
      }
      else if(velX > 0) {
        // trying to move right
        if(tiles[yJump][xRight]) {
          console.log('hit-right');
        }
      }

      if(yJump === AXIS.toInt((nextPosY + height) / cellSize)) {
        break;
      }

      yJump++;
    }

    // vertical
    xJump = AXIS.toInt(nextPosX / cellSize);
    yTop = AXIS.toInt(nextPosY / cellSize);
    yBottom = AXIS.toInt((nextPosY + height) / cellSize);

    for(;;) {
      if(velY < 0) {
        // trying to move up
        if (tiles[yTop][xJump]) {
          console.log('hit-up');
        }
      }
      else if(velY > 0) {
        // trying to move down
        if (tiles[yBottom][xJump]) {
          console.log('hit-down');
        }
      }

      if(xJump === AXIS.toInt((nextPosX + width) / cellSize)) {
        break;
      }

      xJump++;
    }
  }
};

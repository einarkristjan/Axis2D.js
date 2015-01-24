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
    var jump, xLeft, xRight, yTop, yBottom, end,
        width = collider._width,
        height = collider._height,
        nextPosX = collider._nextPosition._x,
        nextPosY = collider._nextPosition._y,
        cellSize = this._cellSize,
        tiles = this._tiles;

    // horizontal
    jump = AXIS.toInt(nextPosY / cellSize);
    xLeft = AXIS.toInt(nextPosX / cellSize);
    xRight = AXIS.toInt((nextPosX + width) / cellSize);
    end = AXIS.toInt((nextPosY + height) / cellSize);

    for(;;) {
      if(tiles[jump][xLeft]) {
        console.log('hit-left');
      }
      if(tiles[jump][xRight]) {
        console.log('hit-right');
      }
      if(jump === end) {
        break;
      }
      jump++;
    }

    // vertical
    jump = AXIS.toInt(nextPosX / cellSize);
    yTop = AXIS.toInt(nextPosY / cellSize);
    yBottom = AXIS.toInt((nextPosY + height) / cellSize);
    end = AXIS.toInt((nextPosX + width) / cellSize);

    for(;;) {
      if (tiles[yTop][jump]) {
        console.log('hit-up');
      }
      if (tiles[yBottom][jump]) {
        console.log('hit-down');
      }
      if(jump === end) {
        break;
      }
      jump++;
    }
  }
};

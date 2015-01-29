AXIS.CollisionManager = function(cellSize) {
  this._grid = [];
  this._colliders = [];
  this._collisionMaps = [];
  this._cellSize = cellSize;

  this.setCellSize(cellSize || 64);
};

AXIS.CollisionManager.prototype = {
  update: function() {
    var i, coll, velX, velY,
        colliders = this._colliders;

    // first pass - collision detection
    for(i = 0; i < colliders.length; i++) {
      coll = colliders[i];
      velX = coll._entity._position.x - coll._nextPosition.x;
      velY = coll._entity._position.y - coll._nextPosition.y;

      if(velX || velY) {
        this._tileCollision(coll);
      }
    }

    // second pass - resolve collisions
    for(i = 0; i < colliders.length; i++) {
      coll = colliders[i];

      // TODO: resolve collisions before setting new position
      coll._entity.setPosition(coll._nextPosition.x, coll._nextPosition.y);
    }
  },
  setCellSize: function(cellSize) {
    this._cellSize = cellSize;

    // move colliders inside grid
    this._grid = [];
  },
  addCollisionMap: function(collisionMap) {
    this._collisionMaps.push(collisionMap);
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
  debugDraw: function(renderer) {
    this._debugDrawCollisionMaps(renderer);
    this._debugDrawColliders(renderer);
  },
  _debugDrawCollisionMaps: function(renderer) {
    var i, j, row, cell, map,
        cs = this._cellSize,
        cmaps = this._collisionMaps;

    for(c = 0; c < cmaps.length; c++) {
      map = cmaps[c];
      for(i = 0; i < map.length; i++) {
        row = map[i];
        for(j = 0; j < row.length; j++) {
          cell = row[j];
          if(cell) {
            renderer.setColor(255, 0, 0, 0.3);
            renderer.fillRect(j*cs, i*cs, cs, cs);

            renderer.setColor(255, 0, 0);
            renderer.strokeRect(j*cs, i*cs, cs, cs);
          }
        }
      }
    }
  },
  _debugDrawColliders: function(renderer) {
    var i, c, x, y, w, h;
    for(i = 0; i < this._colliders.length; i++) {
      c = this._colliders[i];

      x = c._entity._position.x;
      y = c._entity._position.y;

      w = c.width;
      h = c.height;

      renderer.setColor(0, 255, 0, 0.3);
      renderer.fillRect(x, y, w, h);

      renderer.setColor(0, 255, 0);
      renderer.strokeRect(x, y, w, h);
    }
  },
  _tileCollision: function(collider) {
    for(var i = 0; i < this._collisionMaps.length; i++) {
      var jump, xLeft, xRight, yTop, yBottom, end,
          width = collider.width,
          height = collider.height,
          nextPosX = collider._nextPosition.x,
          nextPosY = collider._nextPosition.y,
          cellSize = this._cellSize,
          tiles = this._collisionMaps[i];

      // horizontal
      jump = AXIS.toInt(nextPosY / cellSize);
      xLeft = AXIS.toInt(nextPosX / cellSize);
      xRight = AXIS.toInt((nextPosX + width) / cellSize);
      end = AXIS.toInt((nextPosY + height) / cellSize);

      for(;;) {
        if(tiles[jump] && tiles[jump][xLeft]) {
          console.log('hit-left');
        }
        if(tiles[jump] && tiles[jump][xRight]) {
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
        if(tiles[yTop] && tiles[yTop][jump]) {
          console.log('hit-up');
        }
        if(tiles[yBottom] && tiles[yBottom][jump]) {
          console.log('hit-down');
        }
        if(jump === end) {
          break;
        }
        jump++;
      }
    }
  }
};

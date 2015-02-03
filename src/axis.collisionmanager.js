AXIS.CollisionManager = function(world) {
  this._grid = {};
  this._colliders = [];

  this._world = world;
};

AXIS.CollisionManager.prototype = {
  resolve: function(collider) {

    // TODO: resolve collisions
    

    this._placeInGrid(collider);
  },
  setCellSize: function() {
    var i;
    for(i = 0; i < this._colliders.length; i++) {
      this._placeInGrid(this._colliders[i]);
    }
  },
  addCollisionMap: function(collisionMap) {
    var i, j, col, row;

    this._collisionMaps.push(collisionMap);

    for(i = 0; i < collisionMap.length; i++) {
      row = collisionMap[i];
      for(j = 0; j < row.length; j++) {
        col = row[j];
        if(col) {
          this._grid['y'+i+'x'+j] = col;
        }
      }
    }
  },
  addCollider: function(collider) {
    // this._placeInGrid(collider);

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
  _addToGrid: function(key, collider) {
    var i,
        needle = false;

    if(!this._grid[key]) {
      this._grid[key] = [];
    }

    for(i = 0; i < this._grid[key].length; i++) {
      if(this._grid[key][i] === collider) {
        needle = true;
      }
    }

    if(!needle) {
      this._grid[key].push(collider);
    }
  },
  _placeInGrid: function(collider) {
    var jump, xLeft, xRight, yTop, yBot, end,
        width = collider.width,
        height = collider.height,
        posX = collider._entity._position.x,
        posY = collider._entity._position.y,
        cellSize = this._world._cellSize;

    // horizontal
    jump = AXIS.toInt(posY / cellSize);
    xLeft = AXIS.toInt(posX / cellSize);
    xRight = AXIS.toInt((posX + width) / cellSize);
    end = AXIS.toInt((posY + height) / cellSize);

    for(;;) {
      this._addToGrid('y'+jump+'x'+xLeft, collider);
      this._addToGrid('y'+jump+'x'+xRight, collider);
      if(jump === end) {
        break;
      }
      jump++;
    }

    // vertical
    jump = AXIS.toInt(posX / cellSize);
    yTop = AXIS.toInt(posY / cellSize);
    yBot = AXIS.toInt((posY + height) / cellSize);
    end = AXIS.toInt((posX + width) / cellSize);

    for(;;) {
      this._addToGrid('y'+yTop+'x'+jump, collider);
      this._addToGrid('y'+yBot+'x'+jump, collider);
      if(jump === end) {
        break;
      }
      jump++;
    }
  }
};

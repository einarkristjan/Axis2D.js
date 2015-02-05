AXIS.CollisionManager = function(world) {
  this._grid = {};

  this._world = world;
};

AXIS.CollisionManager.prototype = {
  resolve: function(collider) {
    // TODO: resolve collisions

    collider.resolved();

    // this._placeInGrid(collider);

    console.log(this._grid);
  },
  setCellSize: function() {
    var i;
    for(i = 0; i < this._colliders.length; i++) {
      this._placeInGrid(this._colliders[i]);
    }
  },
  debugDraw: function() {
    var g, key, x, y, split,
        cellSize = this._world.cellSize,
        renderer = this._world.renderer;

    renderer.setFont('Arial', cellSize/2, 'center', 'middle');

    for(key in this._grid) {
      g = this._grid[key];
      split = key.split(/(\d*)/);
      x = split[1] * cellSize;
      y = split[3] * cellSize;

      renderer.setColor(127, 127, 127);
      renderer.fillText(g.length, x + cellSize/2, y + cellSize/2);
      renderer.strokeRect(x, y, cellSize, cellSize);
    }
  },
  addCollider: function(collider) {
    this._placeInGrid(collider);
  },
  /*
  removeCollider: function(body) {
    var index = this._colliders.indexOf(body);
    if(index > -1) {
      this._colliders.splice(index, 1);
    }
  },
  */
  _addToGrid: function(x, y, collider) {
    var i,
        key = 'x'+x+'y'+y,
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
        width = collider.width - 1,
        height = collider.height - 1,
        posX = collider._entity._position.x,
        posY = collider._entity._position.y,
        cellSize = this._world.cellSize;

    // horizontal
    jump = AXIS.toInt(posY / cellSize);
    xLeft = AXIS.toInt(posX / cellSize);
    xRight = AXIS.toInt((posX + width) / cellSize);
    end = AXIS.toInt((posY + height) / cellSize);

    for(;;) {
      this._addToGrid(xLeft, jump, collider);
      this._addToGrid(xRight, jump, collider);
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
      this._addToGrid(jump, yTop, collider);
      this._addToGrid(jump, yBot, collider);
      if(jump === end) {
        break;
      }
      jump++;
    }
  }
};

AXIS.CollisionManager = function(world) {
  this._grid = {};

  this._world = world;
};

AXIS.CollisionManager.prototype = {
  resolve: function(collider) {
    // TODO: resolve collisions


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

    renderer.setFont('Arial', cellSize/4, 'center', 'middle');

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
    var x = collider._entity._position.x,
        y = collider._entity._position.y;
    this.placeInGrid(collider, x, y);
  },
  _aabbIntersection: function(collider1, collider2) {
    var col1X = collider1._entity._position.x,
        col1Y = collider1._entity._position.y,
        col1W = collider1.width,
        col1H = collider1.height,
        col2X = collider2._entity._position.x,
        col2Y = collider2._entity._position.y,
        col2W = collider2.width,
        col2H = collider2.height;

    if(col1X > col2W || col1Y > col2H || col1W < col2X || col1H < col2Y) {
      return false;
    }
    return true;
  },
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
      collider.addToGrid(key);
      this._grid[key].push(collider);
    }
  },
  placeInGrid: function(collider, posX, posY) {
    var i, cgKey, gKey, keyX, keyY,
        x = 0,
        y = 0,
        cWidth = collider.width,
        cHeight = collider.height,
        cellSize = this._world.cellSize;

    // delete from last grid position
    for(i = 0; i < collider._grid.length; i++) {
      cgKey = collider._grid[i];
      gKey = this._grid[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._grid[cgKey];
      }
    }
    collider.resetGrid();

    for(;;) {
      keyX = AXIS.toInt((x+posX) / cellSize);
      keyY = AXIS.toInt((y+posY) / cellSize);

      this._addToGrid(keyX, keyY, collider);

      if(x === cWidth && y === cHeight) {
        break;
      }

      if(x === cWidth) {
        x = 0;
        y += cellSize;
        if(y > cHeight) {
          y = cHeight;
        }
      }
      else {
        x += cellSize;
      }

      if(x > cWidth) {
        x = cWidth;
      }
    }
  }
};

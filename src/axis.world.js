AXIS.World = function(cellSize) {
  this._cellSize = cellSize || 64;

  this._grid = {};

  this._colliders = [];
  this._dynamicColliders = [];
};

AXIS.World.prototype = {
  update: function() {
    var collider, c, i, j, key, otherCollider, x, y;

    for(c = 0; c < this._dynamicColliders.length; c++) {
      collider = this._dynamicColliders[c];

      // add contacts before resolving collision
      for(i = 0; i < collider._positionInGridKeys.length; i++) {
        key = collider._positionInGridKeys[i];
        for(j = 0; j < this._grid[key].length; j++) {
          otherCollider = this._grid[key][j];
          if(otherCollider !== collider) {
            if(this._aabbIntersection(collider, otherCollider)) {
              collider._addContact(otherCollider);
              otherCollider._addContact(collider);
            }
          }
        }
      }

      // TODO: resolve collisions and set new collider position

      x = collider._position.x + collider._offset.x;
      y = collider._position.y + collider._offset.y;

      console.log(this._grid);
    }

    // assume no dynamic colliders next update for performance
    this._dynamicColliders = [];
  },
  debugDrawGrid: function(callback) {
    var g, key, x, y, split,
        cellSize = this._cellSize;

    for(key in this._grid) {
      g = this._grid[key];
      split = key.split(/(\-?\d*)/);
      x = split[1] * cellSize;
      y = split[3] * cellSize;

      callback(x, y, cellSize, cellSize, g.length);
    }
  },
  debugDrawColliders: function(callback) {
    var i, x, y, c;

    for(i = 0; i < this._colliders.length; i++) {
      c = this._colliders[i];
      x = c._position.x;
      y = c._position.y;

      callback(x, y, c._width, c._height, c._offset.x, c._offset.y);
    }
  },
  createCollider: function(x, y, width, height, offsetX, offsetY) {
    var coll = new AXIS.Collider(x, y, width, height, offsetX, offsetY, this);
    this._colliders.push(coll);
    return coll;
  },
  _aabbIntersection: function(colliderA, colliderB) {
    var aX = colliderA._position.x + colliderA._offset.x,
        aY = colliderA._position.y + colliderA._offset.y,
        aW = aX + colliderA._width,
        aH = aY + colliderA._height,
        bX = colliderB._position.x + colliderB._offset.x,
        bY = colliderB._position.y + colliderB._offset.y,
        bW = bX + colliderB._width,
        bH = bY + colliderB._height;

    return !(bX > aW || bW < aX || bY > aH || bH < aY);
  },
  _setDynamicCollider: function(collider) {
    this._dynamicColliders.push(collider);
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
        break;
      }
    }

    if(!needle) {
      collider._positionInGridKeys.push(key);
      this._grid[key].push(collider);
    }
  },
  _placeInGrid: function(collider) {
    var i, cgKey, gKey, keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._position.x + collider._offset.x,
        posY = collider._position.y + collider._offset.y,
        cWidth = collider._width,
        cHeight = collider._height,
        cellSize = this._cellSize;

    // delete from last main grid position
    for(i = 0; i < collider._positionInGridKeys.length; i++) {
      cgKey = collider._positionInGridKeys[i];
      gKey = this._grid[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._grid[cgKey];
      }
    }
    // reset collider grid keys after deleting from main grid
    collider._positionInGridKeys = [];

    for(;;) {
      keyX = Math.floor((x+posX) / cellSize);
      keyY = Math.floor((y+posY) / cellSize);

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

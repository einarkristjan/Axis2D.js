AXIS.CollisionManager = function(world) {
  this._grid = {};

  this._world = world;
};

AXIS.CollisionManager.prototype = {
  resolve: function(collider) {
    var i, j, key, otherCollider;

    // add contacts before resolving collision
    for(i = 0; i < collider._positionInGridKeys.length; i++) {
      key = collider._positionInGridKeys[i];
      for(j = 0; j < this._grid[key].length; j++) {
        otherCollider = this._grid[key][j];
        if(otherCollider !== collider) {
          if(this._aabbIntersection(collider, otherCollider)) {
            collider._addContact(otherCollider);
          }
        }
      }
    }

    // TODO: resolve collisions and set new collider position

    collider._moveTo(collider._position.x, collider._position.y);
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

    this._placeInGrid(collider, x, y);
  },
  _aabbIntersection: function(colliderA, colliderB) {
    var aX = colliderA._position.x,
        aY = colliderA._position.y,
        aW = aX + colliderA.width,
        aH = aY + colliderA.height,
        bX = colliderB._position.x,
        bY = colliderB._position.y,
        bW = bX + colliderB.width,
        bH = bY + colliderB.height;

    return !(bX > aW || bW < aX || bY > aH || bH < aY);
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
      collider._positionInGridKeys.push(key);
      this._grid[key].push(collider);
    }
  },
  _placeInGrid: function(collider) {
    var i, cgKey, gKey, keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._position.x,
        posY = collider._position.y,
        cWidth = collider.width,
        cHeight = collider.height,
        cellSize = this._world.cellSize;

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

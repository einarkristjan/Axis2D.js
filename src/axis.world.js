AXIS.World = function(cellSize) {
  this._cellSize = cellSize || 64;

  this._grid = {};

  this._colliders = [];
  this._dynamicColliders = [];
};

AXIS.World.prototype = {
  update: function() {
    var collidersHit = [];

    // first pass - collision checks / add contacts
    this._dynamicColliders.forEach(function(colliderA){
      colliderA._positionInGridKeys.forEach(function(key){
        this._grid[key].forEach(function(colliderB){

          if(colliderA !== colliderB) {

            if(this._aabbIntersection(colliderA, colliderB)) {

              colliderA._addContact(colliderB);
              colliderB._addContact(colliderA);

              if(collidersHit.indexOf(colliderA) === -1) {
                collidersHit.push(colliderA);
              }

              if(collidersHit.indexOf(colliderB) === -1) {
                collidersHit.push(colliderB);
              }

            }

          }

        }, this);
      }, this);
    }, this);

    // TODO: second pass - resolve collisions


    // third pass - return contacts
    collidersHit.forEach(function(ch){
      if(ch._collisionCallback) {
        ch._collisionCallback(ch._contacts);

        // cleanup for next round
        ch._contacts = [];
      }
    }, this);

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
    var x, y;

    this._colliders.forEach(function(c){
      x = c._position.x;
      y = c._position.y;

      callback(x, y, c._width, c._height, c._offset.x, c._offset.y);
    }, this);
  },
  createCollider: function(x, y, width, height, offsetX, offsetY) {
    return new AXIS.Collider(this, x, y, width, height, offsetX, offsetY);
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
    var key = 'x'+x+'y'+y;

    if(!this._grid[key]) {
      this._grid[key] = [];
    }

    if(this._grid[key].indexOf(collider) === -1) {
      collider._positionInGridKeys.push(key);
      this._grid[key].push(collider);
    }
  },
  _placeInGrid: function(collider) {
    var gKey, keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._position.x + collider._offset.x,
        posY = collider._position.y + collider._offset.y,
        cWidth = collider._width,
        cHeight = collider._height,
        cellSize = this._cellSize;

    // delete from last main grid position
    collider._positionInGridKeys.forEach(function(cgKey){
      gKey = this._grid[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._grid[cgKey];
      }
    }, this);
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

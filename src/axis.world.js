AXIS.World = function(cellSize) {
  this._cellSize = cellSize || 64;

  this._grid = {};

  this._colliders = [];
  this._dynamicColliders = [];
};

AXIS.World.prototype = {
  update: function() {
    var hitA, hitB,
        collidersHit = [];

    // first pass - collision checks / add contacts
    this._dynamicColliders.forEach(function(colliderA){
      colliderA._positionInGridKeys.forEach(function(key){
        this._grid[key].forEach(function(colliderB){

          if(colliderA !== colliderB) {
            hitB = colliderB._AABB.intersectAABB(colliderA._AABB);

            if(hitB) {
              hitA = colliderA._AABB.intersectAABB(colliderB._AABB);

              // overwrite for collision callbacks to access collider
              hitA.collider = colliderB;
              hitB.collider = colliderA;

              colliderA._contacts.push(hitA);
              colliderB._contacts.push(hitB);

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
    this._dynamicColliders.forEach(function(collider){
      var xFix = 0,
          yFix = 0;

      collider._contacts.forEach(function(contact){

        // fix only against static colliders
        if(!contact._isDynamic) {

          if(collider._velocity.x < 0 && contact.normal.x < 0) {
            xFix = contact.delta.x < xFix ? contact.delta.x : xFix;
          }
          else if(collider._velocity.x > 0 && contact.normal.x > 0) {
            xFix = contact.delta.x > xFix ? contact.delta.x : xFix;
          }

          if(collider._velocity.y < 0 && contact.normal.y < 0) {
            yFix = contact.delta.y < yFix ? contact.delta.y : yFix;
          }
          else if(collider._velocity.y > 0 && contact.normal.y > 0) {
            yFix = contact.delta.y > yFix ? contact.delta.y : yFix;
          }

        }
      });

      collider._AABB.pos.x -= xFix;
      collider._AABB.pos.y -= yFix;

      this._placeInGrid(collider);

      // reset velocity for next round
      collider._velocity.x = 0;
      collider._velocity.y = 0;
    }, this);

    // third pass - return contacts / cleanup
    collidersHit.forEach(function(c){
      if(c._collisionCallback) {
        c._collisionCallback(c._contacts);

        // cleanup for next round
        c._contacts = [];
      }
    }, this);
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
    var x, y, cX, cY, w, h, isDyn;

    this._colliders.forEach(function(c){
      x = c._AABB.pos.x - c._AABB.half.x;
      y = c._AABB.pos.y - c._AABB.half.y;
      cX = x + c._AABB.half.x;
      cY = y + c._AABB.half.y;
      w = c._AABB.half.x*2;
      h = c._AABB.half.y*2;
      isDyn = c._isDynamic;

      callback(x, y, w, h, cX, cY, isDyn);
    }, this);
  },
  createCollider: function(x, y, width, height, isDynamic) {
    return new AXIS.Collider(this, x, y, width, height, isDynamic);
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
        posX = collider._AABB.pos.x - collider._AABB.half.x,
        posY = collider._AABB.pos.y - collider._AABB.half.y,
        cWidth = collider._AABB.half.x * 2,
        cHeight = collider._AABB.half.y * 2,
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

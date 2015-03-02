Axis2D.Grid = function World(axisWorld, cellSize) {
  Axis2D.typeCheck(axisWorld, 'axisWorld', Axis2D.World);
  Axis2D.typeCheck(cellSize, 'cellSize', 'Number');

  this._cellSize = Math.abs(cellSize) || 64;
  this._cells = {};

  // dynamic colliders are colliders that have moved or be resized
  this._dynamicColliders = [];
};

Axis2D.Grid.prototype = {
  _placeColliderInGrid: function(collider) {
    // delete from last main grid position
    this._clearColliderFromGrid(collider);

    this._getColliderKeysInGrid(collider).forEach(function(key){
      if(!this._cells[key]) {
        this._cells[key] = [];
      }

      if(this._cells[key].indexOf(collider) === -1) {
        collider._positionInGridKeys.push(key);
        this._cells[key].push(collider);
      }
    }, this);
  },
  _clearColliderFromGrid: function(collider) {
    var gKey;
    // delete from main grid
    collider._positionInGridKeys.forEach(function(cgKey){
      gKey = this._cells[cgKey];

      gKey.splice(gKey.indexOf(collider), 1);

      if(!gKey.length) {
        delete this._cells[cgKey];
      }
    }, this);
    // reset collider grid keys after deleting from main grid
    collider._positionInGridKeys = [];
  },
  _getColliderKeysInGrid: function(collider) {
    var keyX, keyY,
        x = 0,
        y = 0,
        posX = collider._AABB.pos.x - collider._AABB.half.x,
        posY = collider._AABB.pos.y - collider._AABB.half.y,
        cWidth = collider._AABB.half.x * 2,
        cHeight = collider._AABB.half.y * 2,
        cellSize = this._cellSize,
        keys = [];

    for(;;) {
      keyX = Math.floor((x+posX) / cellSize);
      keyY = Math.floor((y+posY) / cellSize);

      keys.push('x'+keyX+'y'+keyY);

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
    return keys;
  }
};

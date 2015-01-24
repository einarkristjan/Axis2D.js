AXIS.Collider = function(x, y, width, height) {
  this._width = width;
  this._height = height;

  this._position = {
    _x: x,
    _y: y
  };

  this._nextPosition = {
    _x: x,
    _y: y
  };

  this._velocity = {
    _x: 0,
    _y: 0
  };
};

AXIS.Collider.prototype = {
  moveTo: function(x, y) {
    this._nextPosition._x = x;
    this._nextPosition._y = y;

    this._velocity._x = x - this._position._x;
    this._velocity._y = y - this._position._y;
  },
  resize: function(width, height) {
    this._width = width;
    this._height = height;
  },
  setNewPosition: function() {
    this._position._x = this._nextPosition._x;
    this._position._y = this._nextPosition._y;

    this._velocity._x = 0;
    this._velocity._y = 0;
  }
};

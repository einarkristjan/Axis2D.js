AXIS.Collider = function(x, y, width, height, offsetX, offsetY, axisWorld) {
  this._position = {
    x: x || 0,
    y: y || 0
  };

  this._width = width || 1;
  this._height = height || 1;

  this._offset = {
    x: offsetX || 0,
    y: offsetY || 0
  };

  this._positionInGridKeys = [];
  this._contacts = [];

  this._userData = undefined;

  this._axisWorld = axisWorld;
  this._axisWorld._placeInGrid(this);
};

AXIS.Collider.prototype = {
  setPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;

    this._changed();
  },
  setOffset: function(x, y) {
    this._offset.x = x;
    this._offset.y = y;

    this._changed();
  },
  setSize: function(width, height) {
    this._width = width;
    this._height = height;

    this._changed();
  },
  _changed: function() {
    this._axisWorld._setDynamicCollider(this);
    this._axisWorld._placeInGrid(this);
  },
  _addContact: function(collider) {
    var i, c,
        cs = this._contacts,
        needle = false;

    for(i = 0; i < cs.length; i++) {
      c = cs[i];
      if(c === collider) {
        needle = true;
        break;
      }
    }

    if(!needle) {
      cs.push(collider);
    }
  },
  getContacts: function() {
    return this._contacts;
  },
  setUserData: function(data) {
    this._userData = data;
  },
  getUserData: function() {
    return this._userData;
  }
};

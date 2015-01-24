DEMO.EntityManager = function() {
  this._entities = [];
};

DEMO.EntityManager.prototype = {
  update: function() {
    var i, j, e, s;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      if(e._scripts.length) {
        for(j = 0; j < e._scripts.length; j++) {
          s = e._scripts[j];
          s.call(e);
        }
      }
    }
  },
  draw: function(renderer) {
    var i, e, x, y, w, h;
    for(i = 0; i < this._entities.length; i++) {
      e = this._entities[i];
      if(e._collider) {
        x = e._position._x;
        y = e._position._y;

        w = e._collider._width;
        h = e._collider._height;

        renderer.drawRect(x, y, w, h, '255, 0, 255');
      }
    }
  },
  addEntity: function(entity) {
    this._entities.push(entity);
  }
};

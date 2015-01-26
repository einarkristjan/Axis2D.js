AXIS.EntityManager = function() {
  this._entities = [];
};

AXIS.EntityManager.prototype = {
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
  addEntity: function(entity) {
    this._entities.push(entity);
  }
};

AXIS.Entity = function(x, y, zIndex, world) {
  this._position = new AXIS.Vector2(x || 0, y || 0);

  this.zIndex = zIndex || 0;

  // world reference used for components
  this.world = world;

  if(world) {
    world.entityManager.addEntity(this);
  }
};

AXIS.Entity.prototype = {
  moveTo: function(x, y) {
    if(this.collider) {
      this.collider._moveTo(x, y);
    }
    else {
      this._position.set(x, y);
    }
  },
  setCollider: function(width, height) {
    var collider = new AXIS.Entity.Collider(width, height, this);

    this.world.collisionManager.addCollider(collider);
    this.collider = collider;

    // for chaining API
    return this;
  },
  addScript: function(name, vars, scriptFunction) {
    /*
    For the shortest reference to variables between scripts:
    'vars' object should not be nested when added to the 'scripts' object.
    to minimize the possibility on a key collision with the 'vars' object,
    we need to add the 'scriptFunction' with an unique id.
    */

    if(!this.scripts) {
      this.scripts = {};
    }

    vars['script' + this.world._uid] = scriptFunction;
    this.scripts[name] = vars;

    // for chaining API
    return this;
  }
};

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
  setPosition: function(x, y) {
    this._position.x = x;
    this._position.y = y;
  },
  moveTo: function(x, y) {
    var collider = this.collider;

    if(collider) {
      collider.moveTo(x, y);
    }
    else {
      setPosition(x, y);
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

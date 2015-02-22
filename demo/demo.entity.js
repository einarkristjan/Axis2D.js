var DEMO = DEMO || {};

DEMO.Entity = function(world, x, y, zIndex) {
  this._position = {
    x: x || 0,
    y: y || 0
  };

  this.zIndex = zIndex || 0;

  this._isDynamic = false;

  // world reference used for components
  this.world = world;

  if(world) {
    world.entityManager.addEntity(this);
  }
};

DEMO.Entity.prototype = {
  moveTo: function(x, y) {
    if(this.collider) {
      this.collider.moveTo(x, y);
    }
    else {
      this._position.set(x, y);
    }
  },
  setUserData: function(data) {
    this.userData = data;

    return this;
  },
  setColliderGroup: function(groupName, groupFilter) {
    if(this.collider) {
      this.collider.setGroup(groupName);
      this.collider.setGroupFilter(groupFilter);
    }

    return this;
  },
  setCollider: function(width, height, sensor) {
    var cm = this.world.collisionManager,
        x = this._position.x,
        y = this._position.y,
        w = width,
        h = height,
        collider = cm.createCollider(x, y, w, h);

    if(sensor) {
      collider.setSensor(true);
    }

    // for access to entities on collisions
    collider.userData = this;

    this.collider = collider;

    return this;
  },
  setLoop: function(script) {
    this._loop = script;

    return this;
  },
  onCollision: function(callback) {
    var entity = this;

    function entityCallback(hits) {
      var allHits = hits.map(function(hit){
        // add entity for quick access in callback
        hit.entity = hit.collider.userData;
        return hit;
      });

      callback.call(entity, allHits);
    }

    if(this.collider) {
      this.collider.setCollisionCallback(entityCallback);
    }

    return this;
  }
};

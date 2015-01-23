var DEMO = {};

// -----------------------------------------------------------------------------

DEMO.init = function() {
  var renderer = new DEMO.CanvasRenderer(document.querySelector('canvas')),
      gameManager = new DEMO.GameManager(),
      mapManager = gameManager.getMapManager(),
      entityManager = gameManager.getEntityManager(),
      width = 768,
      height = 576;

  // Paul Irish shim
  var requestAnimFrame = (function() {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function(callback) {
             window.setTimeout(callback, 1000/60);
           };
  })();

  // first run
  renderer.scale(width, height);

  window.addEventListener('resize', function(){
    renderer.scale(width, height);
  });

  mapManager.addTiles([
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1]
  ]);

  var ent = new DEMO.Entity(70, 140, 100, 120);
  ent.addCollider(100, 100);
  entityManager.addEntity(ent);

  (function loop() {
    requestAnimFrame(loop);

    renderer.clear(width, height);

    // update
    gameManager.update(width, height);

    // draw
    gameManager.draw(renderer);
  })(); // start loop
};

// -----------------------------------------------------------------------------

DEMO.GameManager = function() {
  var world = new AXIS.World(64),
      entityManager = new DEMO.EntityManager(),
      mapManager = new DEMO.MapManager(64);

  this.getMapManager = function() {
    return mapManager;
  };

  this.getEntityManager = function() {
    return entityManager;
  };

  this.update = function(width, height) {
    world.update();

    entityManager.update();
  };

  this.draw = function(renderer) {
    var i, a, pos, w, h;

    mapManager.draw(renderer);

    entityManager.draw(renderer);
  };
};

// -----------------------------------------------------------------------------

DEMO.MapManager = function(cellSize) {
  var _tiles = [];

  this.addTiles = function(tiles) {
    _tiles = tiles;
  };

  this.draw = function(renderer) {
    var i, j, row, cell, cs = cellSize;
    for(i = 0; i < _tiles.length; i++) {
      row = _tiles[i];
      for(j = 0; j < row.length; j++) {
        cell = row[j];
        if(cell) {
          renderer.drawRect(j*cs, i*cs, cs, cs, '0, 255, 0');
        }
      }
    }
  };
};

// -----------------------------------------------------------------------------

DEMO.CanvasRenderer = function(canvas) {
  var that = this,
      ctx = canvas.getContext("2d");

  this.clear = function(width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  this.drawRect = function(x, y, width, height, color) {
    ctx.fillStyle = 'rgba('+color+', 0.3)';
    ctx.strokeStyle = 'rgb('+color+')';

    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  };

  this.resize = function(width, height) {
    canvas.width = width;
    canvas.height = height;
  };

  this.scale = function(width, height) {
    var windowRatio = window.innerWidth / window.innerHeight,
        canvasRatio = width / height,
        newRatio = windowRatio - canvasRatio;

    that.resize(width, height);

    canvas.style.width = newRatio <= 0 ? window.innerWidth + 'px' : 'auto';
    canvas.style.height = newRatio > 0 ? window.innerHeight + 'px' : 'auto';
  };
};

// -----------------------------------------------------------------------------

DEMO.EntityManager = function() {
  var entities = [];

  this.addEntity = function(entity) {
    entities.push(entity);
  };

  this.update = function() {
    var i, j, e, pos, w, h, s;
    for(i = 0; i < entities.length; i++) {
      e = entities[i];
      if(e._scripts.length) {
        for(j = 0; j < e._scripts.length; j++) {
          s = e._scripts[j];
          s();
        }
      }
    }
  };

  this.draw = function(renderer) {
    var i, e, pos, w, h;
    for(i = 0; i < entities.length; i++) {
      e = entities[i];
      pos = e.getPosition();
      if(e.collider) {
        w = e.collider.getWidth();
        h = e.collider.getHeight();
        renderer.drawRect(pos.x, pos.y, w, h, '255, 0, 255');
      }
    }
  };
};

// -----------------------------------------------------------------------------

DEMO.Entity = function(x, y, z) {
  var that = this;
  this._scripts = [];

  this.getPosition = function() {
    return {
      x: x,
      y: y,
      z: z
    };
  };

  this.addCollider = function(width, height) {
    that.collider = new AXIS.Body(x, y, width, height);
  };

  this.addScript = function(script) {
    that._scripts.push(script);
  };
};

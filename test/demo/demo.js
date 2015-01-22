var DEMO = {};

// -----------------------------------------------------------------------------

DEMO.init = function(renderer) {
  var gameManager = new DEMO.GameManager(),
      width = 640,
      height = 480;

      // Paul Irish shim
  var requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback){
              window.setTimeout(callback, 1000/60);
            };
  })();

  window.addEventListener('resize', function(){
    renderer.scale(width, height);
  });

  // first run
  renderer.resize(width, height);
  renderer.scale(width, height);

  gameManager.addActor(new DEMO.Actor(20, 20, 100, 120));
  gameManager.addActor(new DEMO.Actor(320, 170, 250, 220));

  (function loop() {
    requestAnimFrame(loop);

    // update
    gameManager.update(width, height);

    // draw
    gameManager.draw(renderer);
  })(); // start loop
};

// -----------------------------------------------------------------------------

DEMO.CanvasRenderer = function(canvas) {
  var ctx = canvas.getContext("2d");

  this.clear = function(width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  this.setColor = function(color) {
    ctx.fillStyle = color;
  };

  this.drawRect = function(x, y, width, height) {
    ctx.fillRect(x, y, width, height);
  };

  this.resize = function(width, height) {
    canvas.width = width;
    canvas.height = height;
  };

  this.scale = function(width, height) {
    // Minimum scale to fit whole canvas
    var windowRatio = window.innerWidth / window.innerHeight,
        canvasRatio = width / height,
        newRatio = windowRatio - canvasRatio;

    canvas.style.width = newRatio <= 0 ? window.innerWidth + 'px' : 'auto';
    canvas.style.height = newRatio > 0 ? window.innerHeight + 'px' : 'auto';
  };
};

// -----------------------------------------------------------------------------

DEMO.GameManager = function() {
  var actors = [], i, a, pos, w, h,
      world = new AXIS.World();

  this.addActor = function(actor) {
    actors.push(actor);
  };

  this.update = function(width, height) {
    world.update();
  };

  this.draw = function(renderer) {
    for(i = 0; i < actors.length; i++) {
      a = actors[i];
      pos = a.getPosition();
      w = a.getWidth();
      h = a.getHeight();

      renderer.setColor('#c0c');
      renderer.drawRect(pos.x, pos.y, w, h);
    }
  };
};

DEMO.Actor = function(x, y, width, height) {
  var body = new AXIS.Body(x, y, width, height);

  this.getPosition = function() {
    return {x: x, y: y};
  };

  this.getWidth = function() {
    return width;
  };

  this.getHeight = function() {
    return height;
  };
};

// -----------------------------------------------------------------------------

DEMO.init(new DEMO.CanvasRenderer(document.querySelector('canvas')));

var DEMO = DEMO || {};

DEMO.Inputs = function(demoWorld) {
  var that = this;

  this.key = {};
  this.mouse = { x: 0, y: 0 };

  window.onkeydown = function(e) {
    that.key[e.keyCode] = true;
  };

  window.onkeyup = function(e) {
    that.key[e.keyCode] = false;
  };

  if(demoWorld.renderer) {
    demoWorld.renderer._element.addEventListener('mousemove', function(e){
      that.mouse.x = e.offsetX / demoWorld.renderer._scaleRatio;
      that.mouse.y = e.offsetY / demoWorld.renderer._scaleRatio;
    });
  }
};

var DEMO = DEMO || {};

DEMO.inputs = (function() {
  var key = {},
      mouse = { x: 0, y: 0 };

  window.onkeydown = function(e) {
    key[e.keyCode] = true;
  };

  window.onkeyup = function(e) {
    key[e.keyCode] = false;
  };

  window.onmousemove = function(e) {
    mouse.x = e.x;
    mouse.y = e.y;
  };

  return {
    key: key,
    mouse: mouse
  };
})();

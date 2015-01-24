// -----------------------------------------------------------------------------
// namespace

var DEMO = DEMO || {};

// -----------------------------------------------------------------------------

DEMO.requestAnimFrame = function(callback) {
  function raf(callback) {
    window.setTimeout(callback, 1000/60);
  }

  if(window.requestAnimationFrame) {
    window.requestAnimationFrame(callback);
  }
  else if(window.webkitRequestAnimationFrame) {
    window.webkitRequestAnimationFrame(callback);
  }
  else if(window.mozRequestAnimationFrame) {
    window.mozRequestAnimationFrame(callback);
  }
  else {
    raf(callback);
  }
};

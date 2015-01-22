AXIS.World = function(cellSize) {
  var bodies = [];

  this.add = function(body) {
    bodies.push(body);
  };

  this.remove = function(body) {
    var index = bodies.indexOf(body);
    if(index > -1) {
      bodies.splice(index, 1);
    }
  };

  this.update = function() {

  };
};

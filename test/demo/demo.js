// -----------------------------------------------------------------------------
// namespace

var DEMO = DEMO || {};

// -----------------------------------------------------------------------------

DEMO.init = function() {
  var renderer = new DEMO.CanvasRenderer(document.querySelector('canvas')),
      game = new DEMO.Game({ renderer: renderer });

  var map = [
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1]
  ];

  var ent = new DEMO.Entity(70, 140, 100, 120)
    .setCollider(100, 100)
    .addScript(function(){
      var that = this;
      setTimeout(function(){
        that.moveTo(250, 200);
      }, 500);
    });


  // TODO: find better way to add to worlds

  game._colliderWorld.addCollider(ent._collider);
  game._colliderWorld.addTiles(map);

  game._entityManager.addEntity(ent);
  game._tileManager.addTiles(map);

};

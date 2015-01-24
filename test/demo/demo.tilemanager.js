DEMO.TileManager = function(cellSize) {
  this._tiles = [];
  this._cellSize = cellSize;
};

DEMO.TileManager.prototype = {
  addTiles: function(tiles) {
    this._tiles = tiles;
  },
  draw: function(renderer) {
    var i, j, row, cell,
        cs = this._cellSize,
        tiles = this._tiles;

    for(i = 0; i < tiles.length; i++) {
      row = tiles[i];
      for(j = 0; j < row.length; j++) {
        cell = row[j];
        if(cell) {
          renderer.drawRect(j*cs, i*cs, cs, cs, '0, 255, 0');
        }
      }
    }
  }
};

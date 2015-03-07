# Axis2D.js

A simple AABB collision / response library inspired by bump.lua and Box2D.

![collisions/queries](https://raw.githubusercontent.com/einarkristjan/Axis2D.js/dev/img/collisions-queries.png)

## API

### Axis2D.World(cellSize)
* update: function() : void
* createCollider: function(centerX, centerY, width, height) : Axis2D.Collider
* removeCollider: function({collider}) : void
* createDebugDraw: function() : Axis2D.DebugDraw
* debugDraw: function() : void
* createResponseType: function("name", response()) : void
* getCollidersHit: function() : [Axis2D.Collider]
* setCollisionCallback: function(callback([collidersHit])) : void
* getColliders: function() : [Axis2D.Collider]
* countColliders: function() : Number
* countGridCells: function() : Number
* setCellSize: function(cellSize) : void
* queryPoint: function(x, y) : [Axis2D.Collider]
* queryRect: function(centerX, centerY, width, height) : [Axis2D.Collider]
* rayCast: function(callback({endPoint}, [hits]), x1, y1, x2, y2, [groupFilter]) : void

### Axis2D.Collider({axisWorld}, centerX, centerY, width, height)
* moveTo: function(x, y) : void
* resize: function(width, height) : void
* setGroupName: function("name") : void
* setGroupFilters: function(["names"]) : void
* setResponseType: function("type") : void
* getResponseType: function() : String
* setCollisionCallback: function(callback([hits], {touches})) : void
* getPosition: function() : Point
* getWidth: function() : Number
* getHeight: function() : Number
* getHits: function() : [{Hits}]
* getTouches: function() : {touches}
* setSensor: function(bool) : void
* isSensor: function() : bool

### Axis2D.DebugDraw
* addColliderCallback: function(callback(x, y, width, height, isSensor) : void
* addGridCallback: function(callback(x, y, width, height, count)) : void

## License

MIT license.

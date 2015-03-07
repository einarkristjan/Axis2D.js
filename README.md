# Axis2D.js

A simple AABB collision / response library inspired by bump.lua and Box2D.

![collisions/queries](https://raw.githubusercontent.com/einarkristjan/Axis2D.js/dev/img/collisions-queries.png)

## API

Axis2D.World(cellSize)
* update: function()
* createCollider: function(centerX, centerY, width, height)
* removeCollider: function({collider})
* createDebugDraw: function()
* debugDraw: function()
* createResponseType: function("name", response())
* getCollidersHit: function()
* setCollisionCallback: function(callback([collidersHit]))
* getColliders: function()
* countColliders: function()
* countGridCells: function()
* setCellSize: function(cellSize)
* queryPoint: function(x, y)
* queryRect: function(centerX, centerY, width, height)
* rayCast: function(callback({endPoint}, [hits]), x1, y1, x2, y2, [groupFilter])

Axis2D.Collider({axisWorld}, centerX, centerY, width, height)
* moveTo: function(x, y)
* resize: function(width, height)
* setGroupName: function("name")
* setGroupFilters: function(["names"])
* setResponseType: function("type")
* getResponseType: function()
* setCollisionCallback: function(callback([hits], {touches}))
* getPosition: function()
* getWidth: function()
* getHeight: function()
* getHits: function()
* getTouches: function()
* setSensor: function(bool)
* isSensor: function()

Axis2D.DebugDraw
* addColliderCallback: function(callback(x, y, width, height, isSensor)
* addGridCallback: function(callback(x, y, width, height, count))

## License

MIT license.

# Axis2D.js

A simple AABB collision / response library inspired by bump.lua and Box2D.

## Responses

![collisions/queries](https://raw.githubusercontent.com/einarkristjan/Axis2D.js/dev/img/collisions-queries.png)

### Axis2D built in types
* "slide" (default) - example: Platform characters
* "touch" - example: Arrows
* "bounce" - example: Arkanoid ball

### Filtering

Filter responses using sensors, groupFilters or collidesX/collidesY.

    collider.setSensor(true);

    collider1.setGroupName('player');
    collider2.setGroupFilters(['player']);

    collider3.setCollidesX(false);

(sensors and groupFilters ignore all touches)

### Create custom type

example:

      axisWorld.createResponseType('fast-slide', function(collider){
        var sweep = collider._sweepToDelta();

        if(sweep.hit) {
          if(sweep.hit.normal.x) {
            collider._delta.x = 0;
            collider._delta.y *= 2;
          }
          else if(sweep.hit.normal.y) {
            collider._delta.x *= 2;
            collider._delta.y = 0;
          }

          sweep = collider._sweepToDelta();

          if(sweep.hit) {
            collider._delta.x = 0;
            collider._delta.y = 0;
          }
        }
      });

(the initial delta is created with the collider.moveTo(x, y) function)

## Dynamic vs. Static Colliders

When colliders are moved or resized, they are marked as dynamic colliders. At the end of the update function, dynamic colliders are set back as static colliders. This is done for performance.

If you need to push static colliders from each other without moving, use the .setAsDynamic() function.

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
* setAsDynamic: function() : void
* setCollidesX: function(bool) : void
* getCollidesX: function() : bool
* setCollidesX: function(bool) : void
* getCollidesY: function() : bool

### Axis2D.DebugDraw({axisWorld})
* setColliderCallback: function(callback(collider, x, y, width, height) : void
* setGridCallback: function(callback(x, y, width, height, count)) : void

## Build

* install node.js
* npm install -g grunt-cli
* open project folder
* npm install
* grunt

## intersect.js submodule

To include submodule after fork/clone, run command:

    git submodule update --init --recursive

Also, GitHub currently doesn't include submodules in Downloads/Source code.

## Version numbering

This library follows [Semantic Versioning](http://semver.org/)

## License

MIT license.

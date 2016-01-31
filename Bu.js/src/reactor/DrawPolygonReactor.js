// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.DrawPolygonReactor = (function(superClass) {
  extend(DrawPolygonReactor, superClass);

  function DrawPolygonReactor(renderer1) {
    var mouseButton, mouseDownPos, mousePos, polygon, renderer;
    this.renderer = renderer1;
    DrawPolygonReactor.__super__.constructor.call(this);
    renderer = this.renderer;
    mouseButton = Bu.MOUSE_BUTTON_NONE;
    mousePos = new Bu.Point;
    mouseDownPos = new Bu.Vector;
    polygon = null;
    this.onMouseDown = function(e) {
      mouseDownPos.set(e.offsetX, e.offsetY);
      mouseButton = e.button;
      if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
        if (polygon == null) {
          polygon = new Bu.Polygon;
          polygon.fill(Bu.DEFAULT_FILL_STYLE_HOVER);
          renderer.append(polygon);
        }
        return polygon.addPoint(mousePos.clone());
      } else if (mouseButton === Bu.MOUSE_BUTTON_RIGHT) {
        polygon.fill();
        return polygon = null;
      }
    };
    this.onMouseMove = function(e) {
      var points;
      mousePos.set(e.offsetX, e.offsetY);
      if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
        points = polygon.vertices;
        return points[points.length - 1].set(mousePos.x, mousePos.y);
      } else if (mouseButton === Bu.MOUSE_BUTTON_NONE && (polygon != null)) {
        if (polygon.containsPoint(mousePos)) {
          return polygon.fill('yellow');
        } else {
          return polygon.fill(Bu.DEFAULT_FILL_STYLE_HOVER);
        }
      }
    };
    this.onMouseUp = function() {
      return mouseButton = Bu.MOUSE_BUTTON_NONE;
    };
  }

  return DrawPolygonReactor;

})(Bu.ReactorBase);

//# sourceMappingURL=DrawPolygonReactor.js.map

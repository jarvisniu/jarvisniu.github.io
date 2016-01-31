// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.DrawPolylineReactor = (function(superClass) {
  extend(DrawPolylineReactor, superClass);

  function DrawPolylineReactor(renderer1) {
    var mouseButton, mouseDownPos, mousePos, polyline, renderer;
    this.renderer = renderer1;
    DrawPolylineReactor.__super__.constructor.call(this);
    renderer = this.renderer;
    mouseButton = Bu.MOUSE_BUTTON_NONE;
    mousePos = new Bu.Point;
    mouseDownPos = new Bu.Vector;
    polyline = null;
    this.onMouseDown = function(e) {
      mouseDownPos.set(e.offsetX, e.offsetY);
      mouseButton = e.button;
      if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
        if (polyline == null) {
          polyline = new Bu.Polyline;
          polyline.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
          renderer.append(polyline);
        }
        return polyline.addPoint(mousePos.clone());
      } else if (mouseButton === Bu.MOUSE_BUTTON_RIGHT) {
        polyline.stroke();
        return polyline = null;
      }
    };
    this.onMouseMove = function(e) {
      var points;
      mousePos.set(e.offsetX, e.offsetY);
      if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
        points = polyline.vertices;
        return points[points.length - 1].set(mousePos.x, mousePos.y);
      }
    };
    this.onMouseUp = function() {
      return mouseButton = Bu.MOUSE_BUTTON_NONE;
    };
  }

  return DrawPolylineReactor;

})(Bu.ReactorBase);

//# sourceMappingURL=DrawPolylineReactor.js.map

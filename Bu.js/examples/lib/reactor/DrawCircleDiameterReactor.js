// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.DrawCircleDiameterReactor = (function(superClass) {
  extend(DrawCircleDiameterReactor, superClass);

  function DrawCircleDiameterReactor(bu) {
    var circle, isConfirmed, line, mouseButton, mousePos, mousePosDown;
    this.bu = bu;
    DrawCircleDiameterReactor.__super__.constructor.call(this);
    mouseButton = Bu.MOUSE_BUTTON_NONE;
    mousePos = new Bu.Point;
    mousePosDown = new Bu.Point;
    isConfirmed = true;
    circle = null;
    line = null;
    this.onMouseDown = (function(_this) {
      return function(e) {
        if (!isConfirmed) {
          circle = null;
          isConfirmed = true;
        } else {
          mousePosDown.set(e.offsetX, e.offsetY);
          circle = new Bu.Circle(mousePosDown.x, mousePosDown.y, 1);
          _this.bu.append(circle);
          line = new Bu.Line(mousePosDown, mousePosDown);
          line.stroke('#f44');
          _this.bu.append(line);
          isConfirmed = false;
        }
        return mouseButton = e.button;
      };
    })(this);
    this.onMouseMove = function(e) {
      mousePos.set(e.offsetX, e.offsetY);
      if ((!isConfirmed) || (mouseButton === Bu.MOUSE_BUTTON_LEFT && (circle != null))) {
        line.setPoint2(mousePos);
        circle.radius = mousePos.distanceTo(mousePosDown) / 2;
        return circle.center = line.midpoint;
      }
    };
    this.onMouseUp = function() {
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
    };
  }

  return DrawCircleDiameterReactor;

})(Bu.ReactorBase);

//# sourceMappingURL=DrawCircleDiameterReactor.js.map

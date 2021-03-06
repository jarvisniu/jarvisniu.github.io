// Generated by CoffeeScript 2.1.0
(function() {
  // Draw circle by dragging out a radius
  Bu.DrawCircleDiameterReactor = class DrawCircleDiameterReactor extends Bu.ReactorBase {
    constructor(bu) {
      var circle, isConfirmed, line, mousePos, mousePosDown;
      super();
      this.bu = bu;
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Point;
      isConfirmed = true;
      circle = null;
      line = null;
      // create new circles every time
      this.onMouseDown = (ev) => {
        if (!isConfirmed) {
          circle = null;
          return isConfirmed = true;
        } else {
          mousePosDown.set(ev.offsetX, ev.offsetY);
          circle = new Bu.Circle(1, mousePosDown.x, mousePosDown.y);
          this.bu.scene.addChild(circle);
          line = new Bu.Line(mousePosDown, mousePosDown);
          line.stroke('#f44');
          this.bu.scene.addChild(line);
          return isConfirmed = false;
        }
      };
      // change radius
      this.onMouseMove = function(ev) {
        mousePos.set(ev.offsetX, ev.offsetY);
        if ((!isConfirmed) || (ev.buttons === Bu.MOUSE.LEFT && (circle != null))) {
          line.setPoint2(mousePos);
          circle.radius = mousePos.distanceTo(mousePosDown) / 2;
          return circle.center = line.midpoint;
        }
      };
      this.onMouseUp = function() {
        return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
      };
    }

  };

}).call(this);

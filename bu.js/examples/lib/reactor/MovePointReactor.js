// Generated by CoffeeScript 2.1.0
(function() {
  // move a point by dragging it
  Bu.MovePointReactor = class MovePointReactor extends Bu.ReactorBase {
    constructor(bu) {
      var hoveredPoint, mousePos, mousePosDown, mousePosDownDelta;
      super();
      this.bu = bu;
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Vector;
      mousePosDownDelta = new Bu.Vector;
      hoveredPoint = null;
      // record the delta
      this.onMouseDown = function(ev) {
        mousePosDown.set(ev.offsetX, ev.offsetY);
        if (hoveredPoint != null) {
          return mousePosDownDelta.set(mousePosDown.x - hoveredPoint.x, mousePosDown.y - hoveredPoint.y);
        }
      };
      // change x, y
      this.onMouseMove = (ev) => {
        var i, len, ref, results, shape;
        mousePos.set(ev.offsetX, ev.offsetY);
        if (ev.buttons === Bu.MOUSE.LEFT) {
          if (hoveredPoint != null) {
            return hoveredPoint.set(mousePos.x - mousePosDownDelta.x, mousePos.y - mousePosDownDelta.y);
          }
        } else {
          if (hoveredPoint != null) {
            if (!hoveredPoint.isNear(mousePos)) {
              hoveredPoint.lineWidth = 0.5;
              hoveredPoint.fill();
              return hoveredPoint = null;
            }
          } else {
            ref = this.bu.scene.children;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              shape = ref[i];
              if (shape.type === 'Point' && shape.isNear(mousePos)) {
                hoveredPoint = shape;
                hoveredPoint.lineWidth = 1;
                hoveredPoint.fill('#f80');
                break;
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        }
      };
    }

  };

}).call(this);

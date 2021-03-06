// Generated by CoffeeScript 2.1.0
(function() {
  // click to draw a point
  Bu.DrawPointReactor = class DrawPointReactor extends Bu.ReactorBase {
    constructor(bu) {
      var drawingPoint, mouseDownPos, mousePos;
      super();
      this.bu = bu;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      drawingPoint = null;
      this.onMouseDown = (ev) => {
        mouseDownPos.set(ev.offsetX, ev.offsetY);
        drawingPoint = new Bu.Point(ev.offsetX, ev.offsetY);
        return this.bu.scene.addChild(drawingPoint);
      };
      this.onMouseMove = (ev) => {
        mousePos.set(ev.offsetX, ev.offsetY);
        if (ev.buttons === Bu.MOUSE.LEFT) {
          return drawingPoint.set(mousePos.x, mousePos.y);
        }
      };
      this.onMouseUp = () => {
        return drawingPoint = null;
      };
    }

  };

}).call(this);

// Generated by CoffeeScript 2.1.0
(function() {
  // drag to draw a freeline
  Bu.DrawFreelineReactor = class DrawFreelineReactor extends Bu.ReactorBase {
    constructor(bu, curvify = false) {
      var mouseDownPos, mousePos, polyline;
      super();
      this.bu = bu;
      this.curvify = curvify;
      this.lineSplitThresh = 8;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Point;
      polyline = null;
      this.onMouseDown = (ev) => {
        mouseDownPos.set(ev.offsetX, ev.offsetY);
        if (ev.buttons === Bu.MOUSE.LEFT) {
          polyline = new Bu.Polyline;
          polyline.style('line');
          return this.bu.scene.addChild(polyline);
        }
      };
      this.onMouseMove = (ev) => {
        mousePos.set(ev.offsetX, ev.offsetY);
        if (ev.buttons === Bu.MOUSE.LEFT) {
          if (mousePos.distanceTo(mouseDownPos) > this.lineSplitThresh || polyline.vertices.length < 2) {
            polyline.addPoint(mousePos.clone());
            return mouseDownPos.copy(mousePos);
          } else {
            return polyline.vertices[polyline.vertices.length - 1].copy(mousePos);
          }
        }
      };
      this.onMouseUp = () => {
        var spline;
        if (polyline != null) {
          polyline.style();
          if (this.curvify) {
            polyline.compress(0.5);
            spline = new Bu.Spline(polyline);
            spline.smoothFactor = 0.1;
            this.bu.scene.children[this.bu.scene.children.length - 1] = spline;
          } else {
            polyline.compress(0.2);
          }
          return polyline = null;
        }
      };
    }

  };

}).call(this);

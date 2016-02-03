// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Fan = (function(superClass) {
  extend(Fan, superClass);

  function Fan(cx, cy, radius, aFrom, aTo) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.aFrom = aFrom;
    this.aTo = aTo;
    Fan.__super__.constructor.call(this);
    this.type = 'Fan';
    this.center = new Bu.Point(this.cx, this.cy);
    this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
    this.keyPoints = this.string.points;
  }

  Fan.prototype._containsPoint = function(p) {
    var a, dx, dy;
    dx = p.x - this.cx;
    dy = p.y - this.cy;
    a = Math.atan2(p.y - this.cy, p.x - this.cx);
    while (a < this.aFrom) {
      a += Math.PI * 2;
    }
    return Bu.bevel(dx, dy) < this.radius && a > this.aFrom && a < this.aTo;
  };

  return Fan;

})(Bu.Object2D);

//# sourceMappingURL=Fan.js.map

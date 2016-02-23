// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Bow = (function(superClass) {
  extend(Bow, superClass);

  function Bow(cx, cy, radius, aFrom, aTo) {
    var ref;
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.aFrom = aFrom;
    this.aTo = aTo;
    Bow.__super__.constructor.call(this);
    this.type = 'Bow';
    if (this.aFrom > this.aTo) {
      ref = [this.aTo, this.aFrom], this.aFrom = ref[0], this.aTo = ref[1];
    }
    this.center = new Bu.Point(this.cx, this.cy);
    this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
    this.keyPoints = this.string.points;
  }

  Bow.prototype.clone = function() {
    return new Bu.Bow(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
  };

  Bow.prototype._containsPoint = function(point) {
    var sameSide, smallThanHalfCircle;
    if (Bu.bevel(this.cx - point.x, this.cy - point.y) < this.radius) {
      sameSide = this.string.isTwoPointsSameSide(this.center, point);
      smallThanHalfCircle = this.aTo - this.aFrom < Math.PI;
      return sameSide ^ smallThanHalfCircle;
    } else {
      return false;
    }
  };

  return Bow;

})(Bu.Object2D);

//# sourceMappingURL=Bow.js.map

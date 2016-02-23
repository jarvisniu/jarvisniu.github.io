// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Triangle = (function(superClass) {
  extend(Triangle, superClass);

  function Triangle(p1, p2, p3) {
    this.clone = bind(this.clone, this);
    var x1, x2, x3, y1, y2, y3;
    Triangle.__super__.constructor.call(this);
    this.type = 'Triangle';
    if (arguments.length === 6) {
      x1 = arguments[0], y1 = arguments[1], x2 = arguments[2], y2 = arguments[3], x3 = arguments[4], y3 = arguments[5];
      p1 = new Bu.Point(x1, y1);
      p2 = new Bu.Point(x2, y2);
      p3 = new Bu.Point(x3, y3);
    }
    this.lines = [new Bu.Line(p1, p2), new Bu.Line(p2, p3), new Bu.Line(p3, p1)];
    this.points = [p1, p2, p3];
    this.keyPoints = this.points;
  }

  Triangle.prototype.clone = function() {
    return new Bu.Triangle(this.points[0], this.points[1], this.points[2]);
  };

  Triangle.prototype.area = function() {
    var a, b, c, ref;
    ref = this.points, a = ref[0], b = ref[1], c = ref[2];
    return Math.abs(((b.x - a.x) * (c.y - a.y)) - ((c.x - a.x) * (b.y - a.y))) / 2;
  };

  Triangle.prototype._containsPoint = function(p) {
    return this.lines[0].isTwoPointsSameSide(p, this.points[2]) && this.lines[1].isTwoPointsSameSide(p, this.points[0]) && this.lines[2].isTwoPointsSameSide(p, this.points[1]);
  };

  return Triangle;

})(Bu.Object2D);

//# sourceMappingURL=Triangle.js.map

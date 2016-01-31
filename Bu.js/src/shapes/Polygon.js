// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Polygon = (function(superClass) {
  extend(Polygon, superClass);


  /*
     constructors
     1. Polygon(points)
     2. Polygon(x, y, n, options): to generate regular polygon
     	options: radius, angle
   */

  function Polygon(points) {
    var i, k, l, n, options, ref, ref1, x, y;
    Polygon.__super__.constructor.call(this);
    this.type = 'Polygon';
    this.vertices = [];
    this.lines = [];
    this.triangles = [];
    options = Bu.combineOptions(arguments, {
      radius: 100,
      angle: 0
    });
    if (points instanceof Array) {
      if (points != null) {
        this.vertices = points;
      }
    } else {
      x = arguments[0];
      y = arguments[1];
      n = arguments[2];
      this.vertices = Bu.Polygon.generateRegularPoints(x, y, n, options);
    }
    if (this.vertices.length > 1) {
      for (i = k = 0, ref = this.vertices.length - 1; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        this.lines.push(new Bu.Line(this.vertices[i], this.vertices[i + 1]));
      }
      this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
    }
    if (this.vertices.length > 2) {
      for (i = l = 1, ref1 = this.vertices.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
        this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[i], this.vertices[i + 1]));
      }
    }
    this.keyPoints = this.vertices;
  }

  Polygon.prototype.isSimple = function() {
    var i, j, k, l, len, ref, ref1, ref2;
    len = this.lines.length;
    for (i = k = 0, ref = len; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      for (j = l = ref1 = i + 1, ref2 = len; ref1 <= ref2 ? l < ref2 : l > ref2; j = ref1 <= ref2 ? ++l : --l) {
        if (this.lines[i].isCrossWithLine(this.lines[j])) {
          return false;
        }
      }
    }
    return true;
  };

  Polygon.prototype.addPoint = function(point, insertIndex) {
    if (insertIndex == null) {
      this.vertices.push(point);
      if (this.vertices.length > 1) {
        this.lines[this.lines.length - 1].points[1] = point;
      }
      if (this.vertices.length > 0) {
        this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
      }
      if (this.vertices.length > 2) {
        return this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
      }
    } else {
      return this.vertices.splice(insertIndex, 0, point);
    }
  };

  Polygon.prototype._containsPoint = function(p) {
    var k, len1, ref, triangle;
    ref = this.triangles;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      triangle = ref[k];
      if (triangle.containsPoint(p)) {
        return true;
      }
    }
    return false;
  };

  Polygon.generateRegularPoints = function(cx, cy, n, options) {
    var a, angleDelta, angleSection, i, k, points, r, ref, x, y;
    angleDelta = options.angle;
    r = options.radius;
    points = [];
    angleSection = Math.PI * 2 / n;
    for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      a = i * angleSection + angleDelta;
      x = cx + r * Math.cos(a);
      y = cy + r * Math.sin(a);
      points[i] = new Bu.Point(x, y);
    }
    return points;
  };

  return Polygon;

})(Bu.Object2D);

//# sourceMappingURL=Polygon.js.map

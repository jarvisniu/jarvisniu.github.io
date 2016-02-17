// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Bounds = (function(superClass) {
  extend(Bounds, superClass);

  function Bounds(target) {
    var i, j, len, len1, ref, ref1, v;
    this.target = target;
    Bounds.__super__.constructor.call(this);
    this.type = 'Bounds';
    this.x1 = this.y1 = this.x2 = this.y2 = 0;
    this.isEmpty = true;
    this.point1 = new Bu.Point;
    this.point2 = new Bu.Point;
    this.strokeStyle = Bu.DEFAULT_BOUND_STROKE_STYLE;
    this.dashStyle = Bu.DEFAULT_BOUND_DASH_STYLE;
    this.dashOffset = 0;
    switch (this.target.type) {
      case 'Line':
      case 'Triangle':
      case 'Rectangle':
        ref = this.target.points;
        for (i = 0, len = ref.length; i < len; i++) {
          v = ref[i];
          this.expandByPoint(v);
        }
        break;
      case 'Circle':
      case 'Bow':
      case 'Fan':
        this.expandByCircle(this.target);
        this.target.on('centerChanged', (function(_this) {
          return function() {
            _this.clear();
            return _this.expandByCircle(_this.target);
          };
        })(this));
        this.target.on('radiusChanged', (function(_this) {
          return function() {
            _this.clear();
            return _this.expandByCircle(_this.target);
          };
        })(this));
        break;
      case 'Polyline':
      case 'Polygon':
        ref1 = this.target.vertices;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          v = ref1[j];
          this.expandByPoint(v);
        }
        break;
      default:
        console.warn('Bounds: not support shape type "' + this.target.type + '"');
    }
  }

  Bounds.prototype.containsPoint = function(p) {
    return this.x1 < p.x && this.x2 > p.x && this.y1 < p.y && this.y2 > p.y;
  };

  Bounds.prototype.clear = function() {
    this.x1 = this.y1 = this.x2 = this.y2 = 0;
    return this.isEmpty = true;
  };

  Bounds.prototype.expandByPoint = function(v) {
    if (this.isEmpty) {
      this.isEmpty = false;
      this.x1 = this.x2 = v.x;
      return this.y1 = this.y2 = v.y;
    } else {
      if (v.x < this.x1) {
        this.x1 = v.x;
      }
      if (v.x > this.x2) {
        this.x2 = v.x;
      }
      if (v.y < this.y1) {
        this.y1 = v.y;
      }
      if (v.y > this.y2) {
        return this.y2 = v.y;
      }
    }
  };

  Bounds.prototype.expandByCircle = function(c) {
    var cp, r;
    cp = c.center;
    r = c.radius;
    if (this.isEmpty) {
      this.isEmpty = false;
      this.x1 = cp.x - r;
      this.x2 = cp.x + r;
      this.y1 = cp.y - r;
      return this.y2 = cp.y + r;
    } else {
      if (cp.x - r < this.x1) {
        this.x1 = cp.x - r;
      }
      if (cp.x + r > this.x2) {
        this.x2 = cp.x + r;
      }
      if (cp.y - r < this.y1) {
        this.y1 = cp.y - r;
      }
      if (cp.y + r > this.y2) {
        return this.y2 = cp.y + r;
      }
    }
  };

  return Bounds;

})(Bu.Object2D);

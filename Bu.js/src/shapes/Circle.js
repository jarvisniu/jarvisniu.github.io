// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Circle = (function(superClass) {
  extend(Circle, superClass);

  function Circle(cx, cy, _radius) {
    if (cx == null) {
      cx = 0;
    }
    if (cy == null) {
      cy = 0;
    }
    this._radius = _radius != null ? _radius : 1;
    Circle.__super__.constructor.call(this);
    this.type = 'Circle';
    this._center = new Bu.Point(cx, cy);
    this.bounds = null;
    this.keyPoints = [this._center];
  }

  Circle.property('cx', {
    get: function() {
      return this._center.x;
    },
    set: function(val) {
      this._center.x = val;
      return this.trigger('centerChanged', this);
    }
  });

  Circle.property('cy', {
    get: function() {
      return this._center.y;
    },
    set: function(val) {
      this._center.y = val;
      return this.trigger('centerChanged', this);
    }
  });

  Circle.property('center', {
    get: function() {
      return this._center;
    },
    set: function(val) {
      this._center = val;
      this.cx = val.x;
      this.cy = val.y;
      this.keyPoints[0] = val;
      return this.trigger('centerChanged', this);
    }
  });

  Circle.property('radius', {
    get: function() {
      return this._radius;
    },
    set: function(val) {
      this._radius = val;
      this.trigger('radiusChanged', this);
      return this;
    }
  });

  Circle.prototype._containsPoint = function(p) {
    var dx, dy;
    dx = p.x - this.cx;
    dy = p.y - this.cy;
    return Math.bevel(dx, dy) < this.radius;
  };

  return Circle;

})(Bu.Object2D);

//# sourceMappingURL=Circle.js.map

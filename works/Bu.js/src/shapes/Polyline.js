// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Polyline = (function(superClass) {
  var onPointChange, set;

  extend(Polyline, superClass);

  function Polyline(points1) {
    this.points = points1 != null ? points1 : [];
    this.calcLength = bind(this.calcLength, this);
    this.updateLines = bind(this.updateLines, this);
    Polyline.__super__.constructor.call(this);
    this.type = "Polyline";
    this.lines = [];
    this.length = 0;
    this.pointNormalizedPos = [];
    onPointChange(this);
  }

  onPointChange = function(self) {
    if (self.points.length > 1) {
      self.updateLines();
      self.calcLength();
      return self.calcPointNormalizedPos();
    }
  };

  Polyline.prototype.updateLines = function() {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.points.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (this.lines[i] != null) {
        results.push(this.lines[i].set(this.points[i], this.points[i + 1]));
      } else {
        results.push(this.lines[i] = new Bu.Line(this.points[i], this.points[i + 1]));
      }
    }
    return results;
  };

  Polyline.prototype.calcLength = function() {
    var i, j, len, ref;
    if (this.points.length < 2) {
      return this.length = 0;
    } else {
      len = 0;
      for (i = j = 1, ref = this.points.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        len += this.points[i].distanceTo(this.points[i - 1]);
      }
      return this.length = len;
    }
  };

  Polyline.prototype.calcPointNormalizedPos = function() {
    var currPos, i, j, ref, results;
    currPos = 0;
    this.pointNormalizedPos[0] = 0;
    results = [];
    for (i = j = 1, ref = this.points.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
      currPos += this.points[i].distanceTo(this.points[i - 1]) / this.length;
      results.push(this.pointNormalizedPos[i] = currPos);
    }
    return results;
  };

  Polyline.prototype.getNormalizedPos = function(index) {
    if (index != null) {
      return this.pointNormalizedPos[index];
    } else {
      return this.pointNormalizedPos;
    }
  };

  set = function(points) {
    var i, j, ref;
    for (i = j = 0, ref = this.points.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.points[i].copy(points[i]);
    }
    if (this.points.length > points.length) {
      this.points.splice(points.length);
    }
    return onPointChange(this);
  };

  Polyline.prototype.addPoint = function(point, insertIndex) {
    if (insertIndex == null) {
      this.points.push(point);
      if (this.points.length > 1) {
        this.lines.push(new Bu.Line(this.points[this.points.length - 2], this.points[this.points.length - 1]));
      }
    } else {
      this.points.splice(insertIndex, 0, point);
    }
    return onPointChange(this);
  };

  return Polyline;

})(Bu.Object2D);

//# sourceMappingURL=Polyline.js.map

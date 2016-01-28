// Generated by CoffeeScript 1.10.0
Bu.Bounds = (function() {
  function Bounds(target) {
    var self;
    this.target = target;
    this.type = "Bounds";
    this.x1 = this.y1 = this.x2 = this.y2 = 0;
    this.isEmpty = true;
    this.point1 = new Bu.Point;
    this.point2 = new Bu.Point;
    this.strokeStyle = Bu.DEFAULT_BOUND_STROKE_STYLE;
    this.dashStyle = Bu.DEFAULT_BOUND_DASH_STYLE;
    this.dashDelta = 0;
    self = this;
    switch (this.target.type) {
      case "Circle":
        this.expandByCircle(this.target);
        this.target.on("centerChanged", function() {
          self.clear();
          return self.expandByCircle(self.target);
        });
        this.target.on("radiusChanged", function() {
          self.clear();
          return self.expandByCircle(self.target);
        });
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

})();

//# sourceMappingURL=Bounds.js.map

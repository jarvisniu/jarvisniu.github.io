// Generated by CoffeeScript 1.10.0
Bu.Colorful = function() {
  this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
  this.fillStyle = Bu.DEFAULT_FILL_STYLE;
  this.dashStyle = false;
  this.lineWidth = 1;
  this.dashDelta = 0;
  this.stroke = function(v) {
    if (v == null) {
      v = true;
    }
    switch (v) {
      case true:
        this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
        break;
      case false:
        this.strokeStyle = null;
        break;
      default:
        this.strokeStyle = v;
    }
    return this;
  };
  this.fill = function(v) {
    if (v == null) {
      v = true;
    }
    switch (v) {
      case false:
        this.fillStyle = null;
        break;
      case true:
        this.fillStyle = Bu.DEFAULT_FILL_STYLE;
        break;
      default:
        this.fillStyle = v;
    }
    return this;
  };
  return this.dash = function(v) {
    if (v == null) {
      v = true;
    }
    if (typeof v === "number") {
      v = [v, v];
    }
    switch (v) {
      case false:
        this.dashStyle = null;
        break;
      case true:
        this.dashStyle = Bu.DEFAULT_DASH_STYLE;
        break;
      default:
        this.dashStyle = v;
    }
    return this;
  };
};

//# sourceMappingURL=Colorful.js.map
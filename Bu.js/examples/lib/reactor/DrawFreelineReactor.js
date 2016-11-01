(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawFreelineReactor = (function(superClass) {
    extend(DrawFreelineReactor, superClass);

    function DrawFreelineReactor(bu, curvify) {
      var mouseButton, mouseDownPos, mousePos, polyline;
      this.bu = bu;
      this.curvify = curvify != null ? curvify : false;
      DrawFreelineReactor.__super__.constructor.call(this);
      this.lineSplitThresh = 8;
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Point;
      polyline = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          mouseButton = e.button;
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            polyline = new Bu.Polyline;
            polyline.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
            return _this.bu.add(polyline);
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            if (mousePos.distanceTo(mouseDownPos) > _this.lineSplitThresh || polyline.vertices.length < 2) {
              polyline.addPoint(mousePos.clone());
              return mouseDownPos.copy(mousePos);
            } else {
              return polyline.vertices[polyline.vertices.length - 1].copy(mousePos);
            }
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          var spline;
          mouseButton = Bu.MOUSE_BUTTON_NONE;
          if (polyline != null) {
            polyline.stroke(Bu.DEFAULT_STROKE_STYLE);
            if (_this.curvify) {
              polyline.compress(0.5);
              spline = new Bu.Spline(polyline);
              spline.smoothFactor = 0.1;
              _this.bu.shapes[_this.bu.shapes.length - 1] = spline;
            } else {
              polyline.compress(0.2);
            }
            return polyline = null;
          }
        };
      })(this);
    }

    return DrawFreelineReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0ZyZWVsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQsRUFBTSxPQUFOO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLDRCQUFELFVBQVc7TUFDN0IsbURBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUVuQixXQUFBLEdBQWMsRUFBRSxDQUFDO01BQ2pCLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsUUFBQSxHQUFXO01BRVgsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1VBRWhCLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBckI7WUFDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsRUFBRSxDQUFDLDBCQUFuQjttQkFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBSEQ7O1FBSmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BU2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLElBQUcsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQyxLQUFDLENBQUEsZUFBckMsSUFBd0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixHQUEyQixDQUF0RjtjQUNDLFFBQVEsQ0FBQyxRQUFULENBQWtCLFFBQVEsQ0FBQyxLQUFULENBQUEsQ0FBbEI7cUJBQ0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsUUFBbEIsRUFGRDthQUFBLE1BQUE7cUJBSUMsUUFBUSxDQUFDLFFBQVMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQWxCLEdBQTJCLENBQTNCLENBQTZCLENBQUMsSUFBaEQsQ0FBcUQsUUFBckQsRUFKRDthQUREOztRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVNmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1osY0FBQTtVQUFBLFdBQUEsR0FBYyxFQUFFLENBQUM7VUFDakIsSUFBRyxnQkFBSDtZQUNDLFFBQVEsQ0FBQyxNQUFULENBQWdCLEVBQUUsQ0FBQyxvQkFBbkI7WUFFQSxJQUFHLEtBQUMsQ0FBQSxPQUFKO2NBQ0MsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7Y0FDQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLFFBQVY7Y0FDYixNQUFNLENBQUMsWUFBUCxHQUFzQjtjQUN0QixLQUFDLENBQUEsRUFBRSxDQUFDLE1BQU8sQ0FBQSxLQUFDLENBQUEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFYLEdBQW9CLENBQXBCLENBQVgsR0FBb0MsT0FKckM7YUFBQSxNQUFBO2NBTUMsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFORDs7bUJBUUEsUUFBQSxHQUFXLEtBWFo7O1FBRlk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBN0JEOzs7O0tBRnVCLEVBQUUsQ0FBQztBQUF4QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdGcmVlbGluZVJlYWN0b3IuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIGRyYWcgdG8gZHJhdyBhIGZyZWVsaW5lXHJcblxyXG5jbGFzcyBCdS5EcmF3RnJlZWxpbmVSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUsIEBjdXJ2aWZ5ID0gbm8pIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0QGxpbmVTcGxpdFRocmVzaCA9IDhcclxuXHJcblx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRtb3VzZVBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cdFx0bW91c2VEb3duUG9zID0gbmV3IEJ1LlBvaW50XHJcblxyXG5cdFx0cG9seWxpbmUgPSBudWxsXHJcblxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdG1vdXNlRG93blBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0bW91c2VCdXR0b24gPSBlLmJ1dHRvblxyXG5cclxuXHRcdFx0aWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlRcclxuXHRcdFx0XHRwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZVxyXG5cdFx0XHRcdHBvbHlsaW5lLnN0cm9rZSBCdS5ERUZBVUxUX1NUUk9LRV9TVFlMRV9IT1ZFUlxyXG5cdFx0XHRcdEBidS5hZGQgcG9seWxpbmVcclxuXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgPT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0aWYgbW91c2VQb3MuZGlzdGFuY2VUbyhtb3VzZURvd25Qb3MpID4gQGxpbmVTcGxpdFRocmVzaCBvciBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGggPCAyXHJcblx0XHRcdFx0XHRwb2x5bGluZS5hZGRQb2ludCBtb3VzZVBvcy5jbG9uZSgpXHJcblx0XHRcdFx0XHRtb3VzZURvd25Qb3MuY29weSBtb3VzZVBvc1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvbHlsaW5lLnZlcnRpY2VzW3BvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCAtIDFdLmNvcHkgbW91c2VQb3NcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gPT5cclxuXHRcdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRwb2x5bGluZS5zdHJva2UgQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVcclxuXHJcblx0XHRcdFx0aWYgQGN1cnZpZnlcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmNvbXByZXNzIDAuNVxyXG5cdFx0XHRcdFx0c3BsaW5lID0gbmV3IEJ1LlNwbGluZSBwb2x5bGluZVxyXG5cdFx0XHRcdFx0c3BsaW5lLnNtb290aEZhY3RvciA9IDAuMVxyXG5cdFx0XHRcdFx0QGJ1LnNoYXBlc1tAYnUuc2hhcGVzLmxlbmd0aCAtIDFdID0gc3BsaW5lXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cG9seWxpbmUuY29tcHJlc3MgMC4yXHJcblxyXG5cdFx0XHRcdHBvbHlsaW5lID0gbnVsbFxyXG4iXX0=

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
            polyline.style('line');
            return _this.bu.scene.addChild(polyline);
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
            polyline.style();
            if (_this.curvify) {
              polyline.compress(0.5);
              spline = new Bu.Spline(polyline);
              spline.smoothFactor = 0.1;
              _this.bu.scene.children[_this.bu.scene.children.length - 1] = spline;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0ZyZWVsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQsRUFBTSxPQUFOO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLDRCQUFELFVBQVc7TUFDN0IsbURBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUVuQixXQUFBLEdBQWMsRUFBRSxDQUFDO01BQ2pCLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsUUFBQSxHQUFXO01BRVgsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1VBRWhCLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBckI7WUFDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQVQsQ0FBZSxNQUFmO21CQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsRUFIRDs7UUFKYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFTZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFDLENBQUMsT0FBZixFQUF3QixDQUFDLENBQUMsT0FBMUI7VUFDQSxJQUFHLFdBQUEsS0FBZSxFQUFFLENBQUMsaUJBQXJCO1lBQ0MsSUFBRyxRQUFRLENBQUMsVUFBVCxDQUFvQixZQUFwQixDQUFBLEdBQW9DLEtBQUMsQ0FBQSxlQUFyQyxJQUF3RCxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQWxCLEdBQTJCLENBQXRGO2NBQ0MsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsUUFBUSxDQUFDLEtBQVQsQ0FBQSxDQUFsQjtxQkFDQSxZQUFZLENBQUMsSUFBYixDQUFrQixRQUFsQixFQUZEO2FBQUEsTUFBQTtxQkFJQyxRQUFRLENBQUMsUUFBUyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBbEIsR0FBMkIsQ0FBM0IsQ0FBNkIsQ0FBQyxJQUFoRCxDQUFxRCxRQUFyRCxFQUpEO2FBREQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BU2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWixjQUFBO1VBQUEsV0FBQSxHQUFjLEVBQUUsQ0FBQztVQUNqQixJQUFHLGdCQUFIO1lBQ0MsUUFBUSxDQUFDLEtBQVQsQ0FBQTtZQUVBLElBQUcsS0FBQyxDQUFBLE9BQUo7Y0FDQyxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtjQUNBLE1BQUEsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsUUFBVjtjQUNiLE1BQU0sQ0FBQyxZQUFQLEdBQXNCO2NBQ3RCLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbkIsR0FBNEIsQ0FBNUIsQ0FBbkIsR0FBb0QsT0FKckQ7YUFBQSxNQUFBO2NBTUMsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFORDs7bUJBUUEsUUFBQSxHQUFXLEtBWFo7O1FBRlk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBN0JEOzs7O0tBRnVCLEVBQUUsQ0FBQztBQUF4QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdGcmVlbGluZVJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIGRyYWcgdG8gZHJhdyBhIGZyZWVsaW5lXHJcblxyXG5jbGFzcyBCdS5EcmF3RnJlZWxpbmVSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUsIEBjdXJ2aWZ5ID0gbm8pIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0QGxpbmVTcGxpdFRocmVzaCA9IDhcclxuXHJcblx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRtb3VzZVBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cdFx0bW91c2VEb3duUG9zID0gbmV3IEJ1LlBvaW50XHJcblxyXG5cdFx0cG9seWxpbmUgPSBudWxsXHJcblxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdG1vdXNlRG93blBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0bW91c2VCdXR0b24gPSBlLmJ1dHRvblxyXG5cclxuXHRcdFx0aWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlRcclxuXHRcdFx0XHRwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZVxyXG5cdFx0XHRcdHBvbHlsaW5lLnN0eWxlICdsaW5lJ1xyXG5cdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBwb2x5bGluZVxyXG5cclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlRcclxuXHRcdFx0XHRpZiBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlRG93blBvcykgPiBAbGluZVNwbGl0VGhyZXNoIG9yIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCA8IDJcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKClcclxuXHRcdFx0XHRcdG1vdXNlRG93blBvcy5jb3B5IG1vdXNlUG9zXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cG9seWxpbmUudmVydGljZXNbcG9seWxpbmUudmVydGljZXMubGVuZ3RoIC0gMV0uY29weSBtb3VzZVBvc1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRcdGlmIHBvbHlsaW5lP1xyXG5cdFx0XHRcdHBvbHlsaW5lLnN0eWxlKClcclxuXHJcblx0XHRcdFx0aWYgQGN1cnZpZnlcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmNvbXByZXNzIDAuNVxyXG5cdFx0XHRcdFx0c3BsaW5lID0gbmV3IEJ1LlNwbGluZSBwb2x5bGluZVxyXG5cdFx0XHRcdFx0c3BsaW5lLnNtb290aEZhY3RvciA9IDAuMVxyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmNoaWxkcmVuW0BidS5zY2VuZS5jaGlsZHJlbi5sZW5ndGggLSAxXSA9IHNwbGluZVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmNvbXByZXNzIDAuMlxyXG5cclxuXHRcdFx0XHRwb2x5bGluZSA9IG51bGxcclxuIl19

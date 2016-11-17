(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPolylineReactor = (function(superClass) {
    extend(DrawPolylineReactor, superClass);

    function DrawPolylineReactor(bu) {
      var line, mouseDownPos, mousePos, polyline;
      this.bu = bu;
      DrawPolylineReactor.__super__.constructor.call(this);
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      polyline = null;
      line = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
            if (polyline == null) {
              polyline = new Bu.Polyline;
              polyline.style('selected');
              _this.bu.scene.addChild(polyline);
            }
            if (line == null) {
              line = new Bu.Line(mousePos, mousePos);
              line.style('dash');
              _this.bu.scene.addChild(line);
            } else if (line.visible === false) {
              line.setPoint1(mousePos);
              line.setPoint2(mousePos);
              line.visible = true;
            }
            line.setPoint1(line.points[1]);
            return polyline.addPoint(mousePos.clone());
          } else if (e.buttons === Bu.MOUSE.RIGHT) {
            polyline.style();
            polyline = null;
            return line.visible = false;
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (polyline != null) {
            return line.setPoint2(mousePos);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          var len, points;
          if (polyline != null) {
            line.setPoint2(line.points[0]);
            line.setPoint1(mousePos);
            points = polyline.vertices;
            len = mousePos.distanceTo(points[points.length - 1]);
            if (len > Bu.POINT_RENDER_SIZE) {
              return polyline.addPoint(mousePos.clone());
            }
          }
        };
      })(this);
    }

    return DrawPolylineReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixtREFBQTtNQUVBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsUUFBQSxHQUFXO01BQ1gsSUFBQSxHQUFPO01BRVAsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFFQSxJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF6QjtZQUNDLElBQU8sZ0JBQVA7Y0FDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7Y0FDbEIsUUFBUSxDQUFDLEtBQVQsQ0FBZSxVQUFmO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixRQUFuQixFQUhEOztZQUtBLElBQU8sWUFBUDtjQUNDLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsUUFBUixFQUFrQixRQUFsQjtjQUNYLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBWDtjQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsSUFBbkIsRUFIRDthQUFBLE1BSUssSUFBRyxJQUFJLENBQUMsT0FBTCxLQUFnQixLQUFuQjtjQUNKLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtjQUNBLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtjQUNBLElBQUksQ0FBQyxPQUFMLEdBQWUsS0FIWDs7WUFLTCxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQjttQkFDQSxRQUFRLENBQUMsUUFBVCxDQUFrQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWxCLEVBaEJEO1dBQUEsTUFpQkssSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBekI7WUFDSixRQUFRLENBQUMsS0FBVCxDQUFBO1lBQ0EsUUFBQSxHQUFXO21CQUNYLElBQUksQ0FBQyxPQUFMLEdBQWUsTUFIWDs7UUFwQlM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BeUJmLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsZ0JBQUg7bUJBQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmLEVBREQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWixjQUFBO1VBQUEsSUFBRyxnQkFBSDtZQUNDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNCO1lBQ0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmO1lBQ0EsTUFBQSxHQUFTLFFBQVEsQ0FBQztZQUNsQixHQUFBLEdBQU0sUUFBUSxDQUFDLFVBQVQsQ0FBb0IsTUFBTyxDQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWhCLENBQTNCO1lBQ04sSUFBc0MsR0FBQSxHQUFNLEVBQUUsQ0FBQyxpQkFBL0M7cUJBQUEsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsUUFBUSxDQUFDLEtBQVQsQ0FBQSxDQUFsQixFQUFBO2FBTEQ7O1FBRFk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBdkNEOzs7O0tBRnVCLEVBQUUsQ0FBQztBQUF4QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdQb2x5bGluZVJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIGxlZnQgY2xpY2sgdG8gYWRkIHBvaW50IHRvIHBvbHlsaW5lXHJcbiMgcmlnaHQgY2xpY2sgdG8gZmluaXNoIHRoZSBjdXJyZW50IHBvbHlsaW5lXHJcblxyXG5jbGFzcyBCdS5EcmF3UG9seWxpbmVSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0bW91c2VQb3MgPSBuZXcgQnUuUG9pbnRcclxuXHRcdG1vdXNlRG93blBvcyA9IG5ldyBCdS5WZWN0b3JcclxuXHJcblx0XHRwb2x5bGluZSA9IG51bGxcclxuXHRcdGxpbmUgPSBudWxsXHJcblxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdG1vdXNlRG93blBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHJcblx0XHRcdGlmIGUuYnV0dG9ucyA9PSBCdS5NT1VTRS5MRUZUXHJcblx0XHRcdFx0aWYgbm90IHBvbHlsaW5lP1xyXG5cdFx0XHRcdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdFx0XHRcdHBvbHlsaW5lLnN0eWxlICdzZWxlY3RlZCdcclxuXHRcdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBwb2x5bGluZVxyXG5cclxuXHRcdFx0XHRpZiBub3QgbGluZT9cclxuXHRcdFx0XHRcdGxpbmUgPSBuZXcgQnUuTGluZSBtb3VzZVBvcywgbW91c2VQb3NcclxuXHRcdFx0XHRcdGxpbmUuc3R5bGUgJ2Rhc2gnXHJcblx0XHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgbGluZVxyXG5cdFx0XHRcdGVsc2UgaWYgbGluZS52aXNpYmxlID09IG9mZlxyXG5cdFx0XHRcdFx0bGluZS5zZXRQb2ludDEgbW91c2VQb3NcclxuXHRcdFx0XHRcdGxpbmUuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRsaW5lLnZpc2libGUgPSBvblxyXG5cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0XHRcdHBvbHlsaW5lLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKClcclxuXHRcdFx0ZWxzZSBpZiBlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuUklHSFRcclxuXHRcdFx0XHRwb2x5bGluZS5zdHlsZSgpXHJcblx0XHRcdFx0cG9seWxpbmUgPSBudWxsXHJcblx0XHRcdFx0bGluZS52aXNpYmxlID0gb2ZmXHJcblxyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MiBtb3VzZVBvc1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MiBsaW5lLnBvaW50c1swXVxyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblx0XHRcdFx0cG9pbnRzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0XHRsZW4gPSBtb3VzZVBvcy5kaXN0YW5jZVRvIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRwb2x5bGluZS5hZGRQb2ludCBtb3VzZVBvcy5jbG9uZSgpIGlmIGxlbiA+IEJ1LlBPSU5UX1JFTkRFUl9TSVpFXHJcbiJdfQ==

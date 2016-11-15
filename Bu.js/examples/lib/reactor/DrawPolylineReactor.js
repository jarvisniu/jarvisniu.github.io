(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPolylineReactor = (function(superClass) {
    extend(DrawPolylineReactor, superClass);

    function DrawPolylineReactor(bu) {
      var line, mouseButton, mouseDownPos, mousePos, polyline;
      this.bu = bu;
      DrawPolylineReactor.__super__.constructor.call(this);
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      polyline = null;
      line = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          mouseButton = e.button;
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
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
          } else if (mouseButton === Bu.MOUSE_BUTTON_RIGHT) {
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
          mouseButton = Bu.MOUSE_BUTTON_NONE;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixtREFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixRQUFBLEdBQVc7TUFDWCxJQUFBLEdBQU87TUFFUCxJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLE9BQW5CLEVBQTRCLENBQUMsQ0FBQyxPQUE5QjtVQUNBLFdBQUEsR0FBYyxDQUFDLENBQUM7VUFFaEIsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLElBQU8sZ0JBQVA7Y0FDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7Y0FDbEIsUUFBUSxDQUFDLEtBQVQsQ0FBZSxVQUFmO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixRQUFuQixFQUhEOztZQUtBLElBQU8sWUFBUDtjQUNDLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsUUFBUixFQUFrQixRQUFsQjtjQUNYLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBWDtjQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsSUFBbkIsRUFIRDthQUFBLE1BSUssSUFBRyxJQUFJLENBQUMsT0FBTCxLQUFnQixLQUFuQjtjQUNKLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtjQUNBLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtjQUNBLElBQUksQ0FBQyxPQUFMLEdBQWUsS0FIWDs7WUFLTCxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQjttQkFDQSxRQUFRLENBQUMsUUFBVCxDQUFrQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWxCLEVBaEJEO1dBQUEsTUFpQkssSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGtCQUFyQjtZQUNKLFFBQVEsQ0FBQyxLQUFULENBQUE7WUFDQSxRQUFBLEdBQVc7bUJBQ1gsSUFBSSxDQUFDLE9BQUwsR0FBZSxNQUhYOztRQXJCUztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUEwQmYsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxnQkFBSDttQkFDQyxJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWYsRUFERDs7UUFGYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLZixJQUFDLENBQUEsU0FBRCxHQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNaLGNBQUE7VUFBQSxXQUFBLEdBQWMsRUFBRSxDQUFDO1VBQ2pCLElBQUcsZ0JBQUg7WUFDQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQjtZQUNBLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtZQUNBLE1BQUEsR0FBUyxRQUFRLENBQUM7WUFDbEIsR0FBQSxHQUFNLFFBQVEsQ0FBQyxVQUFULENBQW9CLE1BQU8sQ0FBQSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFoQixDQUEzQjtZQUNOLElBQXNDLEdBQUEsR0FBTSxFQUFFLENBQUMsaUJBQS9DO3FCQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLFFBQVEsQ0FBQyxLQUFULENBQUEsQ0FBbEIsRUFBQTthQUxEOztRQUZZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQXpDRDs7OztLQUZ1QixFQUFFLENBQUM7QUFBeEMiLCJmaWxlIjoicmVhY3Rvci9EcmF3UG9seWxpbmVSZWFjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyBsZWZ0IGNsaWNrIHRvIGFkZCBwb2ludCB0byBwb2x5bGluZVxyXG4jIHJpZ2h0IGNsaWNrIHRvIGZpbmlzaCB0aGUgY3VycmVudCBwb2x5bGluZVxyXG5cclxuY2xhc3MgQnUuRHJhd1BvbHlsaW5lUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZURvd25Qb3MgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0cG9seWxpbmUgPSBudWxsXHJcblx0XHRsaW5lID0gbnVsbFxyXG5cclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZURvd25Qb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0aWYgbm90IHBvbHlsaW5lP1xyXG5cdFx0XHRcdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdFx0XHRcdHBvbHlsaW5lLnN0eWxlICdzZWxlY3RlZCdcclxuXHRcdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBwb2x5bGluZVxyXG5cclxuXHRcdFx0XHRpZiBub3QgbGluZT9cclxuXHRcdFx0XHRcdGxpbmUgPSBuZXcgQnUuTGluZSBtb3VzZVBvcywgbW91c2VQb3NcclxuXHRcdFx0XHRcdGxpbmUuc3R5bGUgJ2Rhc2gnXHJcblx0XHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgbGluZVxyXG5cdFx0XHRcdGVsc2UgaWYgbGluZS52aXNpYmxlID09IG9mZlxyXG5cdFx0XHRcdFx0bGluZS5zZXRQb2ludDEgbW91c2VQb3NcclxuXHRcdFx0XHRcdGxpbmUuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRsaW5lLnZpc2libGUgPSBvblxyXG5cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0XHRcdHBvbHlsaW5lLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKClcclxuXHRcdFx0ZWxzZSBpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fUklHSFRcclxuXHRcdFx0XHRwb2x5bGluZS5zdHlsZSgpXHJcblx0XHRcdFx0cG9seWxpbmUgPSBudWxsXHJcblx0XHRcdFx0bGluZS52aXNpYmxlID0gb2ZmXHJcblxyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MiBtb3VzZVBvc1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRcdGlmIHBvbHlsaW5lP1xyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQyIGxpbmUucG9pbnRzWzBdXHJcblx0XHRcdFx0bGluZS5zZXRQb2ludDEgbW91c2VQb3NcclxuXHRcdFx0XHRwb2ludHMgPSBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0XHRcdGxlbiA9IG1vdXNlUG9zLmRpc3RhbmNlVG8gcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXVxyXG5cdFx0XHRcdHBvbHlsaW5lLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKCkgaWYgbGVuID4gQnUuUE9JTlRfUkVOREVSX1NJWkVcclxuIl19

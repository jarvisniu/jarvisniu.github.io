(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPolygonReactor = (function(superClass) {
    extend(DrawPolygonReactor, superClass);

    function DrawPolygonReactor(bu) {
      var guideLineEnd, guideLineStart, mouseButton, mouseDownPos, mousePos, polygon;
      this.bu = bu;
      DrawPolygonReactor.__super__.constructor.call(this);
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      polygon = null;
      guideLineEnd = null;
      guideLineStart = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          mouseButton = e.button;
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            if (polygon == null) {
              polygon = new Bu.Polygon;
              polygon.fill(Bu.DEFAULT_FILL_STYLE_HOVER);
              _this.bu.add(polygon);
            }
            if (guideLineEnd == null) {
              guideLineEnd = new Bu.Line(mousePos, mousePos);
              guideLineEnd.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
              guideLineEnd.dash();
              _this.bu.add(guideLineEnd);
              guideLineStart = new Bu.Line(mousePos, mousePos);
              guideLineStart.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
              guideLineStart.dash();
              _this.bu.add(guideLineStart);
            } else if (guideLineEnd.visible === false) {
              guideLineEnd.setPoint1(mousePos);
              guideLineEnd.setPoint2(mousePos);
              guideLineEnd.visible = true;
              guideLineStart.setPoint1(mousePos);
              guideLineStart.setPoint2(mousePos);
              guideLineStart.visible = true;
            }
            guideLineEnd.setPoint1(guideLineEnd.points[1]);
            return polygon.addPoint(mousePos.clone());
          } else if (mouseButton === Bu.MOUSE_BUTTON_RIGHT) {
            polygon.fill();
            polygon = null;
            guideLineEnd.visible = false;
            return guideLineStart.visible = false;
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          var points;
          mousePos.set(e.offsetX, e.offsetY);
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            points = polygon.vertices;
          } else if (mouseButton === Bu.MOUSE_BUTTON_NONE && (polygon != null)) {
            if (polygon.containsPoint(mousePos)) {
              polygon.fill('yellow');
            } else {
              polygon.fill(Bu.DEFAULT_FILL_STYLE_HOVER);
            }
          }
          if (polygon) {
            guideLineEnd.setPoint2(mousePos);
            return guideLineStart.setPoint2(mousePos);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          var len, points;
          mouseButton = Bu.MOUSE_BUTTON_NONE;
          if (polygon != null) {
            guideLineEnd.setPoint2(guideLineEnd.points[0]);
            guideLineEnd.setPoint1(mousePos);
            points = polygon.vertices;
            len = mousePos.distanceTo(points[points.length - 1]);
            if (len > Bu.POINT_RENDER_SIZE) {
              return polygon.addPoint(mousePos.clone());
            }
          }
        };
      })(this);
    }

    return DrawPolygonReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlnb25SZWFjdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQzs7O0lBRUssNEJBQUMsRUFBRDtBQUNaLFVBQUE7TUFEYSxJQUFDLENBQUEsS0FBRDtNQUNiLGtEQUFBO01BRUEsV0FBQSxHQUFjLEVBQUUsQ0FBQztNQUNqQixRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7TUFDbEIsWUFBQSxHQUFlLElBQUksRUFBRSxDQUFDO01BRXRCLE9BQUEsR0FBVTtNQUNWLFlBQUEsR0FBZTtNQUNmLGNBQUEsR0FBaUI7TUFFakIsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1VBRWhCLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBckI7WUFDQyxJQUFPLGVBQVA7Y0FDQyxPQUFBLEdBQVUsSUFBSSxFQUFFLENBQUM7Y0FDakIsT0FBTyxDQUFDLElBQVIsQ0FBYSxFQUFFLENBQUMsd0JBQWhCO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxHQUFKLENBQVEsT0FBUixFQUhEOztZQUtBLElBQU8sb0JBQVA7Y0FDQyxZQUFBLEdBQW1CLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxRQUFSLEVBQWtCLFFBQWxCO2NBQ25CLFlBQVksQ0FBQyxNQUFiLENBQW9CLEVBQUUsQ0FBQywwQkFBdkI7Y0FDQSxZQUFZLENBQUMsSUFBYixDQUFBO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxHQUFKLENBQVEsWUFBUjtjQUVBLGNBQUEsR0FBcUIsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFFBQVIsRUFBa0IsUUFBbEI7Y0FDckIsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsRUFBRSxDQUFDLDBCQUF6QjtjQUNBLGNBQWMsQ0FBQyxJQUFmLENBQUE7Y0FDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxjQUFSLEVBVEQ7YUFBQSxNQVVLLElBQUcsWUFBWSxDQUFDLE9BQWIsS0FBd0IsS0FBM0I7Y0FDSixZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjtjQUNBLFlBQVksQ0FBQyxTQUFiLENBQXVCLFFBQXZCO2NBQ0EsWUFBWSxDQUFDLE9BQWIsR0FBdUI7Y0FFdkIsY0FBYyxDQUFDLFNBQWYsQ0FBeUIsUUFBekI7Y0FDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QjtjQUNBLGNBQWMsQ0FBQyxPQUFmLEdBQXlCLEtBUHJCOztZQVNMLFlBQVksQ0FBQyxTQUFiLENBQXVCLFlBQVksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQzttQkFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWpCLEVBMUJEO1dBQUEsTUEyQkssSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGtCQUFyQjtZQUNKLE9BQU8sQ0FBQyxJQUFSLENBQUE7WUFDQSxPQUFBLEdBQVU7WUFDVixZQUFZLENBQUMsT0FBYixHQUF1QjttQkFDdkIsY0FBYyxDQUFDLE9BQWYsR0FBeUIsTUFKckI7O1FBL0JTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQXFDZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2QsY0FBQTtVQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLE1BQUEsR0FBUyxPQUFPLENBQUMsU0FEbEI7V0FBQSxNQUdLLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBbEIsSUFBd0MsaUJBQTNDO1lBQ0osSUFBRyxPQUFPLENBQUMsYUFBUixDQUFzQixRQUF0QixDQUFIO2NBQ0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxRQUFiLEVBREQ7YUFBQSxNQUFBO2NBR0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxFQUFFLENBQUMsd0JBQWhCLEVBSEQ7YUFESTs7VUFNTCxJQUFHLE9BQUg7WUFDQyxZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjttQkFDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QixFQUZEOztRQVhjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWVmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1osY0FBQTtVQUFBLFdBQUEsR0FBYyxFQUFFLENBQUM7VUFDakIsSUFBRyxlQUFIO1lBQ0MsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsWUFBWSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNDO1lBQ0EsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsUUFBdkI7WUFFQSxNQUFBLEdBQVMsT0FBTyxDQUFDO1lBQ2pCLEdBQUEsR0FBTSxRQUFRLENBQUMsVUFBVCxDQUFvQixNQUFPLENBQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FBM0I7WUFDTixJQUFxQyxHQUFBLEdBQU0sRUFBRSxDQUFDLGlCQUE5QztxQkFBQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWpCLEVBQUE7YUFORDs7UUFGWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUEvREQ7Ozs7S0FGc0IsRUFBRSxDQUFDO0FBQXZDIiwiZmlsZSI6InJlYWN0b3IvRHJhd1BvbHlnb25SZWFjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyBsZWZ0IGNsaWNrIHRvIGFkZCBwb2ludCB0byBwb2x5Z29uXHJcbiMgcmlnaHQgY2xpY2sgdG8gZmluaXNoIHRoZSBjdXJyZW50IHBvbHlnb25cclxuXHJcbmNsYXNzIEJ1LkRyYXdQb2x5Z29uUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZURvd25Qb3MgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0cG9seWdvbiA9IG51bGxcclxuXHRcdGd1aWRlTGluZUVuZCA9IG51bGxcclxuXHRcdGd1aWRlTGluZVN0YXJ0ID0gbnVsbFxyXG5cclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZURvd25Qb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0aWYgbm90IHBvbHlnb24/XHJcblx0XHRcdFx0XHRwb2x5Z29uID0gbmV3IEJ1LlBvbHlnb25cclxuXHRcdFx0XHRcdHBvbHlnb24uZmlsbChCdS5ERUZBVUxUX0ZJTExfU1RZTEVfSE9WRVIpXHJcblx0XHRcdFx0XHRAYnUuYWRkIHBvbHlnb25cclxuXHJcblx0XHRcdFx0aWYgbm90IGd1aWRlTGluZUVuZD9cclxuXHRcdFx0XHRcdGd1aWRlTGluZUVuZCA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zLCBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLnN0cm9rZSBCdS5ERUZBVUxUX1NUUk9LRV9TVFlMRV9IT1ZFUlxyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLmRhc2goKVxyXG5cdFx0XHRcdFx0QGJ1LmFkZCBndWlkZUxpbmVFbmRcclxuXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydCA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zLCBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQuc3Ryb2tlIEJ1LkRFRkFVTFRfU1RST0tFX1NUWUxFX0hPVkVSXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydC5kYXNoKClcclxuXHRcdFx0XHRcdEBidS5hZGQgZ3VpZGVMaW5lU3RhcnRcclxuXHRcdFx0XHRlbHNlIGlmIGd1aWRlTGluZUVuZC52aXNpYmxlID09IG9mZlxyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLnNldFBvaW50MSBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLnNldFBvaW50MiBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLnZpc2libGUgPSBvblxyXG5cclxuXHRcdFx0XHRcdGd1aWRlTGluZVN0YXJ0LnNldFBvaW50MSBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydC52aXNpYmxlID0gb25cclxuXHJcblx0XHRcdFx0Z3VpZGVMaW5lRW5kLnNldFBvaW50MSBndWlkZUxpbmVFbmQucG9pbnRzWzFdXHJcblx0XHRcdFx0cG9seWdvbi5hZGRQb2ludCBtb3VzZVBvcy5jbG9uZSgpXHJcblx0XHRcdGVsc2UgaWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX1JJR0hUXHJcblx0XHRcdFx0cG9seWdvbi5maWxsKClcclxuXHRcdFx0XHRwb2x5Z29uID0gbnVsbFxyXG5cdFx0XHRcdGd1aWRlTGluZUVuZC52aXNpYmxlID0gb2ZmXHJcblx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQudmlzaWJsZSA9IG9mZlxyXG5cclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlRcclxuXHRcdFx0XHRwb2ludHMgPSBwb2x5Z29uLnZlcnRpY2VzXHJcbiNcdFx0XHRcdHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0uc2V0IG1vdXNlUG9zLngsIG1vdXNlUG9zLnlcclxuXHRcdFx0ZWxzZSBpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fTk9ORSBhbmQgcG9seWdvbj9cclxuXHRcdFx0XHRpZiBwb2x5Z29uLmNvbnRhaW5zUG9pbnQgbW91c2VQb3NcclxuXHRcdFx0XHRcdHBvbHlnb24uZmlsbCAneWVsbG93J1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvbHlnb24uZmlsbCBCdS5ERUZBVUxUX0ZJTExfU1RZTEVfSE9WRVJcclxuXHJcblx0XHRcdGlmIHBvbHlnb25cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblxyXG5cdFx0QG9uTW91c2VVcCA9ID0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0aWYgcG9seWdvbj9cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIGd1aWRlTGluZUVuZC5wb2ludHNbMF1cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblxyXG5cdFx0XHRcdHBvaW50cyA9IHBvbHlnb24udmVydGljZXNcclxuXHRcdFx0XHRsZW4gPSBtb3VzZVBvcy5kaXN0YW5jZVRvIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRwb2x5Z29uLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKCkgaWYgbGVuID4gQnUuUE9JTlRfUkVOREVSX1NJWkUiXX0=

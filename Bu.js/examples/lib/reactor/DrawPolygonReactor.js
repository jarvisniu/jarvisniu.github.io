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
              polygon.style('hover');
              _this.bu.scene.addChild(polygon);
            }
            if (guideLineEnd == null) {
              guideLineEnd = new Bu.Line(mousePos, mousePos);
              guideLineEnd.style('dash');
              _this.bu.scene.addChild(guideLineEnd);
              guideLineStart = new Bu.Line(mousePos, mousePos);
              guideLineStart.style('dash');
              _this.bu.scene.addChild(guideLineStart);
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
            polygon.style();
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
              polygon.fill('hover');
            } else {
              polygon.fill('selected');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlnb25SZWFjdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQzs7O0lBRUssNEJBQUMsRUFBRDtBQUNaLFVBQUE7TUFEYSxJQUFDLENBQUEsS0FBRDtNQUNiLGtEQUFBO01BRUEsV0FBQSxHQUFjLEVBQUUsQ0FBQztNQUNqQixRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7TUFDbEIsWUFBQSxHQUFlLElBQUksRUFBRSxDQUFDO01BRXRCLE9BQUEsR0FBVTtNQUNWLFlBQUEsR0FBZTtNQUNmLGNBQUEsR0FBaUI7TUFFakIsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1VBRWhCLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBckI7WUFDQyxJQUFPLGVBQVA7Y0FDQyxPQUFBLEdBQVUsSUFBSSxFQUFFLENBQUM7Y0FDakIsT0FBTyxDQUFDLEtBQVIsQ0FBYyxPQUFkO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixPQUFuQixFQUhEOztZQUtBLElBQU8sb0JBQVA7Y0FDQyxZQUFBLEdBQW1CLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxRQUFSLEVBQWtCLFFBQWxCO2NBQ25CLFlBQVksQ0FBQyxLQUFiLENBQW1CLE1BQW5CO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixZQUFuQjtjQUVBLGNBQUEsR0FBcUIsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFFBQVIsRUFBa0IsUUFBbEI7Y0FDckIsY0FBYyxDQUFDLEtBQWYsQ0FBcUIsTUFBckI7Y0FDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLGNBQW5CLEVBUEQ7YUFBQSxNQVFLLElBQUcsWUFBWSxDQUFDLE9BQWIsS0FBd0IsS0FBM0I7Y0FDSixZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjtjQUNBLFlBQVksQ0FBQyxTQUFiLENBQXVCLFFBQXZCO2NBQ0EsWUFBWSxDQUFDLE9BQWIsR0FBdUI7Y0FFdkIsY0FBYyxDQUFDLFNBQWYsQ0FBeUIsUUFBekI7Y0FDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QjtjQUNBLGNBQWMsQ0FBQyxPQUFmLEdBQXlCLEtBUHJCOztZQVNMLFlBQVksQ0FBQyxTQUFiLENBQXVCLFlBQVksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQzttQkFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWpCLEVBeEJEO1dBQUEsTUF5QkssSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGtCQUFyQjtZQUNKLE9BQU8sQ0FBQyxLQUFSLENBQUE7WUFDQSxPQUFBLEdBQVU7WUFDVixZQUFZLENBQUMsT0FBYixHQUF1QjttQkFDdkIsY0FBYyxDQUFDLE9BQWYsR0FBeUIsTUFKckI7O1FBN0JTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQW1DZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2QsY0FBQTtVQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLE1BQUEsR0FBUyxPQUFPLENBQUMsU0FEbEI7V0FBQSxNQUdLLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBbEIsSUFBd0MsaUJBQTNDO1lBQ0osSUFBRyxPQUFPLENBQUMsYUFBUixDQUFzQixRQUF0QixDQUFIO2NBQ0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFiLEVBREQ7YUFBQSxNQUFBO2NBR0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxVQUFiLEVBSEQ7YUFESTs7VUFNTCxJQUFHLE9BQUg7WUFDQyxZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjttQkFDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QixFQUZEOztRQVhjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWVmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1osY0FBQTtVQUFBLFdBQUEsR0FBYyxFQUFFLENBQUM7VUFDakIsSUFBRyxlQUFIO1lBQ0MsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsWUFBWSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNDO1lBQ0EsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsUUFBdkI7WUFFQSxNQUFBLEdBQVMsT0FBTyxDQUFDO1lBQ2pCLEdBQUEsR0FBTSxRQUFRLENBQUMsVUFBVCxDQUFvQixNQUFPLENBQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FBM0I7WUFDTixJQUFxQyxHQUFBLEdBQU0sRUFBRSxDQUFDLGlCQUE5QztxQkFBQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWpCLEVBQUE7YUFORDs7UUFGWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUE3REQ7Ozs7S0FGc0IsRUFBRSxDQUFDO0FBQXZDIiwiZmlsZSI6InJlYWN0b3IvRHJhd1BvbHlnb25SZWFjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyBsZWZ0IGNsaWNrIHRvIGFkZCBwb2ludCB0byBwb2x5Z29uXHJcbiMgcmlnaHQgY2xpY2sgdG8gZmluaXNoIHRoZSBjdXJyZW50IHBvbHlnb25cclxuXHJcbmNsYXNzIEJ1LkRyYXdQb2x5Z29uUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZURvd25Qb3MgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0cG9seWdvbiA9IG51bGxcclxuXHRcdGd1aWRlTGluZUVuZCA9IG51bGxcclxuXHRcdGd1aWRlTGluZVN0YXJ0ID0gbnVsbFxyXG5cclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZURvd25Qb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0aWYgbm90IHBvbHlnb24/XHJcblx0XHRcdFx0XHRwb2x5Z29uID0gbmV3IEJ1LlBvbHlnb25cclxuXHRcdFx0XHRcdHBvbHlnb24uc3R5bGUgJ2hvdmVyJ1xyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIHBvbHlnb25cclxuXHJcblx0XHRcdFx0aWYgbm90IGd1aWRlTGluZUVuZD9cclxuXHRcdFx0XHRcdGd1aWRlTGluZUVuZCA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zLCBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kLnN0eWxlICdkYXNoJ1xyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGd1aWRlTGluZUVuZFxyXG5cclxuXHRcdFx0XHRcdGd1aWRlTGluZVN0YXJ0ID0gbmV3IEJ1LkxpbmUgbW91c2VQb3MsIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydC5zdHlsZSAnZGFzaCdcclxuXHRcdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBndWlkZUxpbmVTdGFydFxyXG5cdFx0XHRcdGVsc2UgaWYgZ3VpZGVMaW5lRW5kLnZpc2libGUgPT0gb2ZmXHJcblx0XHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVFbmQudmlzaWJsZSA9IG9uXHJcblxyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydC5zZXRQb2ludDIgbW91c2VQb3NcclxuXHRcdFx0XHRcdGd1aWRlTGluZVN0YXJ0LnZpc2libGUgPSBvblxyXG5cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQxIGd1aWRlTGluZUVuZC5wb2ludHNbMV1cclxuXHRcdFx0XHRwb2x5Z29uLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKClcclxuXHRcdFx0ZWxzZSBpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fUklHSFRcclxuXHRcdFx0XHRwb2x5Z29uLnN0eWxlKClcclxuXHRcdFx0XHRwb2x5Z29uID0gbnVsbFxyXG5cdFx0XHRcdGd1aWRlTGluZUVuZC52aXNpYmxlID0gb2ZmXHJcblx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQudmlzaWJsZSA9IG9mZlxyXG5cclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlRcclxuXHRcdFx0XHRwb2ludHMgPSBwb2x5Z29uLnZlcnRpY2VzXHJcbiNcdFx0XHRcdHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0uc2V0IG1vdXNlUG9zLngsIG1vdXNlUG9zLnlcclxuXHRcdFx0ZWxzZSBpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fTk9ORSBhbmQgcG9seWdvbj9cclxuXHRcdFx0XHRpZiBwb2x5Z29uLmNvbnRhaW5zUG9pbnQgbW91c2VQb3NcclxuXHRcdFx0XHRcdHBvbHlnb24uZmlsbCAnaG92ZXInXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cG9seWdvbi5maWxsICdzZWxlY3RlZCdcclxuXHJcblx0XHRcdGlmIHBvbHlnb25cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblxyXG5cdFx0QG9uTW91c2VVcCA9ID0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0aWYgcG9seWdvbj9cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIGd1aWRlTGluZUVuZC5wb2ludHNbMF1cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblxyXG5cdFx0XHRcdHBvaW50cyA9IHBvbHlnb24udmVydGljZXNcclxuXHRcdFx0XHRsZW4gPSBtb3VzZVBvcy5kaXN0YW5jZVRvIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRwb2x5Z29uLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKCkgaWYgbGVuID4gQnUuUE9JTlRfUkVOREVSX1NJWkVcclxuIl19

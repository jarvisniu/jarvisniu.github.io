(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPolygonReactor = (function(superClass) {
    extend(DrawPolygonReactor, superClass);

    function DrawPolygonReactor(bu) {
      var guideLineEnd, guideLineStart, mouseDownPos, mousePos, polygon;
      this.bu = bu;
      DrawPolygonReactor.__super__.constructor.call(this);
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      polygon = null;
      guideLineEnd = null;
      guideLineStart = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
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
          } else if (e.buttons === Bu.MOUSE.RIGHT) {
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
          if (e.buttons === Bu.MOUSE.LEFT) {
            points = polygon.vertices;
          } else if (e.buttons === Bu.MOUSE.NONE && (polygon != null)) {
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
        return function(e) {
          var len, points;
          e.buttons = Bu.MOUSE.NONE;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlnb25SZWFjdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQzs7O0lBRUssNEJBQUMsRUFBRDtBQUNaLFVBQUE7TUFEYSxJQUFDLENBQUEsS0FBRDtNQUNiLGtEQUFBO01BRUEsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixPQUFBLEdBQVU7TUFDVixZQUFBLEdBQWU7TUFDZixjQUFBLEdBQWlCO01BRWpCLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1VBRUEsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBekI7WUFDQyxJQUFPLGVBQVA7Y0FDQyxPQUFBLEdBQVUsSUFBSSxFQUFFLENBQUM7Y0FDakIsT0FBTyxDQUFDLEtBQVIsQ0FBYyxPQUFkO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixPQUFuQixFQUhEOztZQUtBLElBQU8sb0JBQVA7Y0FDQyxZQUFBLEdBQW1CLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxRQUFSLEVBQWtCLFFBQWxCO2NBQ25CLFlBQVksQ0FBQyxLQUFiLENBQW1CLE1BQW5CO2NBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixZQUFuQjtjQUVBLGNBQUEsR0FBcUIsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFFBQVIsRUFBa0IsUUFBbEI7Y0FDckIsY0FBYyxDQUFDLEtBQWYsQ0FBcUIsTUFBckI7Y0FDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLGNBQW5CLEVBUEQ7YUFBQSxNQVFLLElBQUcsWUFBWSxDQUFDLE9BQWIsS0FBd0IsS0FBM0I7Y0FDSixZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjtjQUNBLFlBQVksQ0FBQyxTQUFiLENBQXVCLFFBQXZCO2NBQ0EsWUFBWSxDQUFDLE9BQWIsR0FBdUI7Y0FFdkIsY0FBYyxDQUFDLFNBQWYsQ0FBeUIsUUFBekI7Y0FDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QjtjQUNBLGNBQWMsQ0FBQyxPQUFmLEdBQXlCLEtBUHJCOztZQVNMLFlBQVksQ0FBQyxTQUFiLENBQXVCLFlBQVksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQzttQkFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWpCLEVBeEJEO1dBQUEsTUF5QkssSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBekI7WUFDSixPQUFPLENBQUMsS0FBUixDQUFBO1lBQ0EsT0FBQSxHQUFVO1lBQ1YsWUFBWSxDQUFDLE9BQWIsR0FBdUI7bUJBQ3ZCLGNBQWMsQ0FBQyxPQUFmLEdBQXlCLE1BSnJCOztRQTVCUztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFrQ2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtBQUNkLGNBQUE7VUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsQ0FBQyxDQUFDLE9BQUYsS0FBYSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQXpCO1lBQ0MsTUFBQSxHQUFTLE9BQU8sQ0FBQyxTQURsQjtXQUFBLE1BR0ssSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBdEIsSUFBK0IsaUJBQWxDO1lBQ0osSUFBRyxPQUFPLENBQUMsYUFBUixDQUFzQixRQUF0QixDQUFIO2NBQ0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFiLEVBREQ7YUFBQSxNQUFBO2NBR0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxVQUFiLEVBSEQ7YUFESTs7VUFNTCxJQUFHLE9BQUg7WUFDQyxZQUFZLENBQUMsU0FBYixDQUF1QixRQUF2QjttQkFDQSxjQUFjLENBQUMsU0FBZixDQUF5QixRQUF6QixFQUZEOztRQVhjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWVmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7QUFDWixjQUFBO1VBQUEsQ0FBQyxDQUFDLE9BQUYsR0FBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1VBQ3JCLElBQUcsZUFBSDtZQUNDLFlBQVksQ0FBQyxTQUFiLENBQXVCLFlBQVksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQztZQUNBLFlBQVksQ0FBQyxTQUFiLENBQXVCLFFBQXZCO1lBRUEsTUFBQSxHQUFTLE9BQU8sQ0FBQztZQUNqQixHQUFBLEdBQU0sUUFBUSxDQUFDLFVBQVQsQ0FBb0IsTUFBTyxDQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWhCLENBQTNCO1lBQ04sSUFBcUMsR0FBQSxHQUFNLEVBQUUsQ0FBQyxpQkFBOUM7cUJBQUEsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBUSxDQUFDLEtBQVQsQ0FBQSxDQUFqQixFQUFBO2FBTkQ7O1FBRlk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBM0REOzs7O0tBRnNCLEVBQUUsQ0FBQztBQUF2QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdQb2x5Z29uUmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgbGVmdCBjbGljayB0byBhZGQgcG9pbnQgdG8gcG9seWdvblxyXG4jIHJpZ2h0IGNsaWNrIHRvIGZpbmlzaCB0aGUgY3VycmVudCBwb2x5Z29uXHJcblxyXG5jbGFzcyBCdS5EcmF3UG9seWdvblJlYWN0b3IgZXh0ZW5kcyBCdS5SZWFjdG9yQmFzZVxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBidSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRtb3VzZVBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cdFx0bW91c2VEb3duUG9zID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdHBvbHlnb24gPSBudWxsXHJcblx0XHRndWlkZUxpbmVFbmQgPSBudWxsXHJcblx0XHRndWlkZUxpbmVTdGFydCA9IG51bGxcclxuXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgPT5cclxuXHRcdFx0bW91c2VEb3duUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cclxuXHRcdFx0aWYgZS5idXR0b25zID09IEJ1Lk1PVVNFLkxFRlRcclxuXHRcdFx0XHRpZiBub3QgcG9seWdvbj9cclxuXHRcdFx0XHRcdHBvbHlnb24gPSBuZXcgQnUuUG9seWdvblxyXG5cdFx0XHRcdFx0cG9seWdvbi5zdHlsZSAnaG92ZXInXHJcblx0XHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgcG9seWdvblxyXG5cclxuXHRcdFx0XHRpZiBub3QgZ3VpZGVMaW5lRW5kP1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lRW5kID0gbmV3IEJ1LkxpbmUgbW91c2VQb3MsIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRndWlkZUxpbmVFbmQuc3R5bGUgJ2Rhc2gnXHJcblx0XHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgZ3VpZGVMaW5lRW5kXHJcblxyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQgPSBuZXcgQnUuTGluZSBtb3VzZVBvcywgbW91c2VQb3NcclxuXHRcdFx0XHRcdGd1aWRlTGluZVN0YXJ0LnN0eWxlICdkYXNoJ1xyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGd1aWRlTGluZVN0YXJ0XHJcblx0XHRcdFx0ZWxzZSBpZiBndWlkZUxpbmVFbmQudmlzaWJsZSA9PSBvZmZcclxuXHRcdFx0XHRcdGd1aWRlTGluZUVuZC5zZXRQb2ludDEgbW91c2VQb3NcclxuXHRcdFx0XHRcdGd1aWRlTGluZUVuZC5zZXRQb2ludDIgbW91c2VQb3NcclxuXHRcdFx0XHRcdGd1aWRlTGluZUVuZC52aXNpYmxlID0gb25cclxuXHJcblx0XHRcdFx0XHRndWlkZUxpbmVTdGFydC5zZXRQb2ludDEgbW91c2VQb3NcclxuXHRcdFx0XHRcdGd1aWRlTGluZVN0YXJ0LnNldFBvaW50MiBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0Z3VpZGVMaW5lU3RhcnQudmlzaWJsZSA9IG9uXHJcblxyXG5cdFx0XHRcdGd1aWRlTGluZUVuZC5zZXRQb2ludDEgZ3VpZGVMaW5lRW5kLnBvaW50c1sxXVxyXG5cdFx0XHRcdHBvbHlnb24uYWRkUG9pbnQgbW91c2VQb3MuY2xvbmUoKVxyXG5cdFx0XHRlbHNlIGlmIGUuYnV0dG9ucyA9PSBCdS5NT1VTRS5SSUdIVFxyXG5cdFx0XHRcdHBvbHlnb24uc3R5bGUoKVxyXG5cdFx0XHRcdHBvbHlnb24gPSBudWxsXHJcblx0XHRcdFx0Z3VpZGVMaW5lRW5kLnZpc2libGUgPSBvZmZcclxuXHRcdFx0XHRndWlkZUxpbmVTdGFydC52aXNpYmxlID0gb2ZmXHJcblxyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiBlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuTEVGVFxyXG5cdFx0XHRcdHBvaW50cyA9IHBvbHlnb24udmVydGljZXNcclxuI1x0XHRcdFx0cG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXS5zZXQgbW91c2VQb3MueCwgbW91c2VQb3MueVxyXG5cdFx0XHRlbHNlIGlmIGUuYnV0dG9ucyA9PSBCdS5NT1VTRS5OT05FIGFuZCBwb2x5Z29uP1xyXG5cdFx0XHRcdGlmIHBvbHlnb24uY29udGFpbnNQb2ludCBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0cG9seWdvbi5maWxsICdob3ZlcidcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRwb2x5Z29uLmZpbGwgJ3NlbGVjdGVkJ1xyXG5cclxuXHRcdFx0aWYgcG9seWdvblxyXG5cdFx0XHRcdGd1aWRlTGluZUVuZC5zZXRQb2ludDIgbW91c2VQb3NcclxuXHRcdFx0XHRndWlkZUxpbmVTdGFydC5zZXRQb2ludDIgbW91c2VQb3NcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gKGUpID0+XHJcblx0XHRcdGUuYnV0dG9ucyA9IEJ1Lk1PVVNFLk5PTkVcclxuXHRcdFx0aWYgcG9seWdvbj9cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQyIGd1aWRlTGluZUVuZC5wb2ludHNbMF1cclxuXHRcdFx0XHRndWlkZUxpbmVFbmQuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblxyXG5cdFx0XHRcdHBvaW50cyA9IHBvbHlnb24udmVydGljZXNcclxuXHRcdFx0XHRsZW4gPSBtb3VzZVBvcy5kaXN0YW5jZVRvIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRwb2x5Z29uLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKCkgaWYgbGVuID4gQnUuUE9JTlRfUkVOREVSX1NJWkVcclxuIl19

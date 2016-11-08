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
              polyline.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
              _this.bu.scene.addChild(polyline);
            }
            if (line == null) {
              line = new Bu.Line(mousePos, mousePos);
              line.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
              line.dash();
              _this.bu.scene.addChild(line);
            } else if (line.visible === false) {
              line.setPoint1(mousePos);
              line.setPoint2(mousePos);
              line.visible = true;
            }
            line.setPoint1(line.points[1]);
            return polyline.addPoint(mousePos.clone());
          } else if (mouseButton === Bu.MOUSE_BUTTON_RIGHT) {
            polyline.stroke();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvbHlsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixtREFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixRQUFBLEdBQVc7TUFDWCxJQUFBLEdBQU87TUFFUCxJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLE9BQW5CLEVBQTRCLENBQUMsQ0FBQyxPQUE5QjtVQUNBLFdBQUEsR0FBYyxDQUFDLENBQUM7VUFFaEIsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLElBQU8sZ0JBQVA7Y0FDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7Y0FDbEIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsRUFBRSxDQUFDLDBCQUFuQjtjQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsRUFIRDs7WUFLQSxJQUFPLFlBQVA7Y0FDQyxJQUFBLEdBQVcsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFFBQVIsRUFBa0IsUUFBbEI7Y0FDWCxJQUFJLENBQUMsTUFBTCxDQUFZLEVBQUUsQ0FBQywwQkFBZjtjQUNBLElBQUksQ0FBQyxJQUFMLENBQUE7Y0FDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLElBQW5CLEVBSkQ7YUFBQSxNQUtLLElBQUcsSUFBSSxDQUFDLE9BQUwsS0FBZ0IsS0FBbkI7Y0FDSixJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWY7Y0FDQSxJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWY7Y0FDQSxJQUFJLENBQUMsT0FBTCxHQUFlLEtBSFg7O1lBS0wsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0I7bUJBQ0EsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsUUFBUSxDQUFDLEtBQVQsQ0FBQSxDQUFsQixFQWpCRDtXQUFBLE1Ba0JLLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxrQkFBckI7WUFDSixRQUFRLENBQUMsTUFBVCxDQUFBO1lBQ0EsUUFBQSxHQUFXO21CQUNYLElBQUksQ0FBQyxPQUFMLEdBQWUsTUFIWDs7UUF0QlM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BMkJmLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsZ0JBQUg7bUJBQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmLEVBREQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWixjQUFBO1VBQUEsV0FBQSxHQUFjLEVBQUUsQ0FBQztVQUNqQixJQUFHLGdCQUFIO1lBQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0I7WUFDQSxJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWY7WUFDQSxNQUFBLEdBQVMsUUFBUSxDQUFDO1lBQ2xCLEdBQUEsR0FBTSxRQUFRLENBQUMsVUFBVCxDQUFvQixNQUFPLENBQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FBM0I7WUFDTixJQUFzQyxHQUFBLEdBQU0sRUFBRSxDQUFDLGlCQUEvQztxQkFBQSxRQUFRLENBQUMsUUFBVCxDQUFrQixRQUFRLENBQUMsS0FBVCxDQUFBLENBQWxCLEVBQUE7YUFMRDs7UUFGWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUExQ0Q7Ozs7S0FGdUIsRUFBRSxDQUFDO0FBQXhDIiwiZmlsZSI6InJlYWN0b3IvRHJhd1BvbHlsaW5lUmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgbGVmdCBjbGljayB0byBhZGQgcG9pbnQgdG8gcG9seWxpbmVcclxuIyByaWdodCBjbGljayB0byBmaW5pc2ggdGhlIGN1cnJlbnQgcG9seWxpbmVcclxuXHJcbmNsYXNzIEJ1LkRyYXdQb2x5bGluZVJlYWN0b3IgZXh0ZW5kcyBCdS5SZWFjdG9yQmFzZVxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBidSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRtb3VzZVBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cdFx0bW91c2VEb3duUG9zID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdHBvbHlsaW5lID0gbnVsbFxyXG5cdFx0bGluZSA9IG51bGxcclxuXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgPT5cclxuXHRcdFx0bW91c2VEb3duUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IGUuYnV0dG9uXHJcblxyXG5cdFx0XHRpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fTEVGVFxyXG5cdFx0XHRcdGlmIG5vdCBwb2x5bGluZT9cclxuXHRcdFx0XHRcdHBvbHlsaW5lID0gbmV3IEJ1LlBvbHlsaW5lXHJcblx0XHRcdFx0XHRwb2x5bGluZS5zdHJva2UgQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVfSE9WRVJcclxuXHRcdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBwb2x5bGluZVxyXG5cclxuXHRcdFx0XHRpZiBub3QgbGluZT9cclxuXHRcdFx0XHRcdGxpbmUgPSBuZXcgQnUuTGluZSBtb3VzZVBvcywgbW91c2VQb3NcclxuXHRcdFx0XHRcdGxpbmUuc3Ryb2tlIEJ1LkRFRkFVTFRfU1RST0tFX1NUWUxFX0hPVkVSXHJcblx0XHRcdFx0XHRsaW5lLmRhc2goKVxyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGxpbmVcclxuXHRcdFx0XHRlbHNlIGlmIGxpbmUudmlzaWJsZSA9PSBvZmZcclxuXHRcdFx0XHRcdGxpbmUuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblx0XHRcdFx0XHRsaW5lLnNldFBvaW50MiBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0bGluZS52aXNpYmxlID0gb25cclxuXHJcblx0XHRcdFx0bGluZS5zZXRQb2ludDEgbGluZS5wb2ludHNbMV1cclxuXHRcdFx0XHRwb2x5bGluZS5hZGRQb2ludCBtb3VzZVBvcy5jbG9uZSgpXHJcblx0XHRcdGVsc2UgaWYgbW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX1JJR0hUXHJcblx0XHRcdFx0cG9seWxpbmUuc3Ryb2tlKClcclxuXHRcdFx0XHRwb2x5bGluZSA9IG51bGxcclxuXHRcdFx0XHRsaW5lLnZpc2libGUgPSBvZmZcclxuXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgPT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIHBvbHlsaW5lP1xyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQyIG1vdXNlUG9zXHJcblxyXG5cdFx0QG9uTW91c2VVcCA9ID0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0aWYgcG9seWxpbmU/XHJcblx0XHRcdFx0bGluZS5zZXRQb2ludDIgbGluZS5wb2ludHNbMF1cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MSBtb3VzZVBvc1xyXG5cdFx0XHRcdHBvaW50cyA9IHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdFx0bGVuID0gbW91c2VQb3MuZGlzdGFuY2VUbyBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0cG9seWxpbmUuYWRkUG9pbnQgbW91c2VQb3MuY2xvbmUoKSBpZiBsZW4gPiBCdS5QT0lOVF9SRU5ERVJfU0laRVxyXG4iXX0=

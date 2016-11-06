(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.MovePointReactor = (function(superClass) {
    extend(MovePointReactor, superClass);

    function MovePointReactor(bu) {
      var hoveredPoint, mouseButton, mousePos, mousePosDown, mousePosDownDelta;
      this.bu = bu;
      MovePointReactor.__super__.constructor.call(this);
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Vector;
      mousePosDownDelta = new Bu.Vector;
      hoveredPoint = null;
      this.onMouseDown = function(e) {
        mousePosDown.set(e.offsetX, e.offsetY);
        if (hoveredPoint != null) {
          mousePosDownDelta.set(mousePosDown.x - hoveredPoint.x, mousePosDown.y - hoveredPoint.y);
        }
        return mouseButton = e.button;
      };
      this.onMouseMove = (function(_this) {
        return function(e) {
          var i, len, ref, results, shape;
          mousePos.set(e.offsetX, e.offsetY);
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            if (hoveredPoint != null) {
              return hoveredPoint.set(mousePos.x - mousePosDownDelta.x, mousePos.y - mousePosDownDelta.y);
            }
          } else {
            if (hoveredPoint != null) {
              if (!hoveredPoint.isNear(mousePos)) {
                hoveredPoint.lineWidth = 0.5;
                hoveredPoint.fill();
                return hoveredPoint = null;
              }
            } else {
              ref = _this.bu.shapes;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                shape = ref[i];
                if (shape.type === 'Point' && shape.isNear(mousePos)) {
                  hoveredPoint = shape;
                  hoveredPoint.lineWidth = 1;
                  hoveredPoint.fill('#f80');
                  break;
                } else {
                  results.push(void 0);
                }
              }
              return results;
            }
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          return mouseButton = Bu.MOUSE_BUTTON_NONE;
        };
      })(this);
    }

    return MovePointReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvTW92ZVBvaW50UmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDBCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixnREFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUN0QixpQkFBQSxHQUFvQixJQUFJLEVBQUUsQ0FBQztNQUUzQixZQUFBLEdBQWU7TUFHZixJQUFDLENBQUEsV0FBRCxHQUFlLFNBQUMsQ0FBRDtRQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7UUFFQSxJQUFHLG9CQUFIO1VBQ0MsaUJBQWlCLENBQUMsR0FBbEIsQ0FDRSxZQUFZLENBQUMsQ0FBYixHQUFpQixZQUFZLENBQUMsQ0FEaEMsRUFFRSxZQUFZLENBQUMsQ0FBYixHQUFpQixZQUFZLENBQUMsQ0FGaEMsRUFERDs7ZUFLQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO01BUkY7TUFXZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2QsY0FBQTtVQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLElBR0ssb0JBSEw7cUJBQUEsWUFBWSxDQUFDLEdBQWIsQ0FDRSxRQUFRLENBQUMsQ0FBVCxHQUFhLGlCQUFpQixDQUFDLENBRGpDLEVBRUUsUUFBUSxDQUFDLENBQVQsR0FBYSxpQkFBaUIsQ0FBQyxDQUZqQyxFQUFBO2FBREQ7V0FBQSxNQUFBO1lBTUMsSUFBRyxvQkFBSDtjQUNDLElBQUcsQ0FBSSxZQUFZLENBQUMsTUFBYixDQUFvQixRQUFwQixDQUFQO2dCQUNDLFlBQVksQ0FBQyxTQUFiLEdBQXlCO2dCQUN6QixZQUFZLENBQUMsSUFBYixDQUFBO3VCQUNBLFlBQUEsR0FBZSxLQUhoQjtlQUREO2FBQUEsTUFBQTtBQU1DO0FBQUE7bUJBQUEscUNBQUE7O2dCQUNDLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxPQUFkLElBQTBCLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUE3QjtrQkFDQyxZQUFBLEdBQWU7a0JBQ2YsWUFBWSxDQUFDLFNBQWIsR0FBeUI7a0JBQ3pCLFlBQVksQ0FBQyxJQUFiLENBQWtCLE1BQWxCO0FBQ0Esd0JBSkQ7aUJBQUEsTUFBQTt1Q0FBQTs7QUFERDs2QkFORDthQU5EOztRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQXFCZixJQUFDLENBQUEsU0FBRCxHQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDWixXQUFBLEdBQWMsRUFBRSxDQUFDO1FBREw7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBM0NEOzs7O0tBRm9CLEVBQUUsQ0FBQztBQUFyQyIsImZpbGUiOiJyZWFjdG9yL01vdmVQb2ludFJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIG1vdmUgYSBwb2ludCBieSBkcmFnZ2luZyBpdFxyXG5cclxuY2xhc3MgQnUuTW92ZVBvaW50UmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuVmVjdG9yXHJcblx0XHRtb3VzZVBvc0Rvd25EZWx0YSA9IG5ldyBCdS5WZWN0b3JcclxuXHJcblx0XHRob3ZlcmVkUG9pbnQgPSBudWxsXHJcblxyXG5cdFx0IyByZWNvcmQgdGhlIGRlbHRhXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgLT5cclxuXHRcdFx0bW91c2VQb3NEb3duLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cclxuXHRcdFx0aWYgaG92ZXJlZFBvaW50P1xyXG5cdFx0XHRcdG1vdXNlUG9zRG93bkRlbHRhLnNldChcclxuXHRcdFx0XHRcdFx0bW91c2VQb3NEb3duLnggLSBob3ZlcmVkUG9pbnQueFxyXG5cdFx0XHRcdFx0XHRtb3VzZVBvc0Rvd24ueSAtIGhvdmVyZWRQb2ludC55XHJcblx0XHRcdFx0KVxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IGUuYnV0dG9uXHJcblxyXG5cdFx0IyBjaGFuZ2UgeCwgeVxyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiBtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fTEVGVFxyXG5cdFx0XHRcdGhvdmVyZWRQb2ludC5zZXQoXHJcblx0XHRcdFx0XHRcdG1vdXNlUG9zLnggLSBtb3VzZVBvc0Rvd25EZWx0YS54XHJcblx0XHRcdFx0XHRcdG1vdXNlUG9zLnkgLSBtb3VzZVBvc0Rvd25EZWx0YS55XHJcblx0XHRcdFx0KSBpZiBob3ZlcmVkUG9pbnQ/XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRpZiBob3ZlcmVkUG9pbnQ/XHJcblx0XHRcdFx0XHRpZiBub3QgaG92ZXJlZFBvaW50LmlzTmVhcihtb3VzZVBvcylcclxuXHRcdFx0XHRcdFx0aG92ZXJlZFBvaW50LmxpbmVXaWR0aCA9IDAuNVxyXG5cdFx0XHRcdFx0XHRob3ZlcmVkUG9pbnQuZmlsbCgpXHJcblx0XHRcdFx0XHRcdGhvdmVyZWRQb2ludCA9IG51bGxcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRmb3Igc2hhcGUgaW4gQGJ1LnNoYXBlc1xyXG5cdFx0XHRcdFx0XHRpZiBzaGFwZS50eXBlIGlzICdQb2ludCcgYW5kIHNoYXBlLmlzTmVhciBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0XHRcdGhvdmVyZWRQb2ludCA9IHNoYXBlXHJcblx0XHRcdFx0XHRcdFx0aG92ZXJlZFBvaW50LmxpbmVXaWR0aCA9IDFcclxuXHRcdFx0XHRcdFx0XHRob3ZlcmVkUG9pbnQuZmlsbCAnI2Y4MCdcclxuXHRcdFx0XHRcdFx0XHRicmVha1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FIl19

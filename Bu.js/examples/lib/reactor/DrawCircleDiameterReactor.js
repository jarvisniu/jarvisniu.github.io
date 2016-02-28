(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawCircleDiameterReactor = (function(superClass) {
    extend(DrawCircleDiameterReactor, superClass);

    function DrawCircleDiameterReactor(bu) {
      var circle, isConfirmed, line, mouseButton, mousePos, mousePosDown;
      this.bu = bu;
      DrawCircleDiameterReactor.__super__.constructor.call(this);
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Point;
      isConfirmed = true;
      circle = null;
      line = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          if (!isConfirmed) {
            circle = null;
            isConfirmed = true;
          } else {
            mousePosDown.set(e.offsetX, e.offsetY);
            circle = new Bu.Circle(mousePosDown.x, mousePosDown.y, 1);
            _this.bu.append(circle);
            line = new Bu.Line(mousePosDown, mousePosDown);
            line.stroke('#f44');
            _this.bu.append(line);
            isConfirmed = false;
          }
          return mouseButton = e.button;
        };
      })(this);
      this.onMouseMove = function(e) {
        mousePos.set(e.offsetX, e.offsetY);
        if ((!isConfirmed) || (mouseButton === Bu.MOUSE_BUTTON_LEFT && (circle != null))) {
          line.setPoint2(mousePos);
          circle.radius = mousePos.distanceTo(mousePosDown) / 2;
          return circle.center = line.midpoint;
        }
      };
      this.onMouseUp = function() {
        mouseButton = Bu.MOUSE_BUTTON_NONE;
        return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
      };
    }

    return DrawCircleDiameterReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLG1DQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYix5REFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixXQUFBLEdBQWM7TUFFZCxNQUFBLEdBQVM7TUFDVCxJQUFBLEdBQU87TUFHUCxJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsSUFBRyxDQUFJLFdBQVA7WUFDQyxNQUFBLEdBQVM7WUFDVCxXQUFBLEdBQWMsS0FGZjtXQUFBLE1BQUE7WUFJQyxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1lBQ0EsTUFBQSxHQUFhLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxZQUFZLENBQUMsQ0FBdkIsRUFBMEIsWUFBWSxDQUFDLENBQXZDLEVBQTBDLENBQTFDO1lBQ2IsS0FBQyxDQUFBLEVBQUUsQ0FBQyxNQUFKLENBQVcsTUFBWDtZQUVBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsWUFBUixFQUFzQixZQUF0QjtZQUNYLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWjtZQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLElBQVg7WUFDQSxXQUFBLEdBQWMsTUFYZjs7aUJBWUEsV0FBQSxHQUFjLENBQUMsQ0FBQztRQWJGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWdCZixJQUFDLENBQUEsV0FBRCxHQUFlLFNBQUMsQ0FBRDtRQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1FBQ0EsSUFBRyxDQUFDLENBQUksV0FBTCxDQUFBLElBQXFCLENBQUMsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBbEIsSUFBd0MsZ0JBQXpDLENBQXhCO1VBQ0MsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmO1VBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQztpQkFDcEQsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLFNBSHRCOztNQUZjO01BT2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUFBO1FBQ1osV0FBQSxHQUFjLEVBQUUsQ0FBQztlQUNqQixXQUFBLEdBQWMsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQyxFQUFFLENBQUM7TUFGekM7SUFwQ0Q7Ozs7S0FGNkIsRUFBRSxDQUFDO0FBQTlDIiwiZmlsZSI6InJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgRHJhdyBjaXJjbGUgYnkgZHJhZ2dpbmcgb3V0IGEgcmFkaXVzXHJcblxyXG5jbGFzcyBCdS5EcmF3Q2lyY2xlRGlhbWV0ZXJSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0bW91c2VQb3MgPSBuZXcgQnUuUG9pbnRcclxuXHRcdG1vdXNlUG9zRG93biA9IG5ldyBCdS5Qb2ludFxyXG5cclxuXHRcdGlzQ29uZmlybWVkID0gdHJ1ZVxyXG5cclxuXHRcdGNpcmNsZSA9IG51bGxcclxuXHRcdGxpbmUgPSBudWxsXHJcblxyXG5cdFx0IyBjcmVhdGUgbmV3IGNpcmNsZXMgZXZlcnkgdGltZVxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdGlmIG5vdCBpc0NvbmZpcm1lZFxyXG5cdFx0XHRcdGNpcmNsZSA9IG51bGxcclxuXHRcdFx0XHRpc0NvbmZpcm1lZCA9IHllc1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0bW91c2VQb3NEb3duLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRcdGNpcmNsZSA9IG5ldyBCdS5DaXJjbGUgbW91c2VQb3NEb3duLngsIG1vdXNlUG9zRG93bi55LCAxXHJcblx0XHRcdFx0QGJ1LmFwcGVuZCBjaXJjbGVcclxuXHJcblx0XHRcdFx0bGluZSA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zRG93biwgbW91c2VQb3NEb3duXHJcblx0XHRcdFx0bGluZS5zdHJva2UgJyNmNDQnXHJcblx0XHRcdFx0QGJ1LmFwcGVuZCBsaW5lXHJcblx0XHRcdFx0aXNDb25maXJtZWQgPSBub1xyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IGUuYnV0dG9uXHJcblxyXG5cdFx0IyBjaGFuZ2UgcmFkaXVzXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgLT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIChub3QgaXNDb25maXJtZWQpIG9yIChtb3VzZUJ1dHRvbiA9PSBCdS5NT1VTRV9CVVRUT05fTEVGVCBhbmQgY2lyY2xlPylcclxuXHRcdFx0XHRsaW5lLnNldFBvaW50Mihtb3VzZVBvcylcclxuXHRcdFx0XHRjaXJjbGUucmFkaXVzID0gbW91c2VQb3MuZGlzdGFuY2VUbyhtb3VzZVBvc0Rvd24pIC8gMlxyXG5cdFx0XHRcdGNpcmNsZS5jZW50ZXIgPSBsaW5lLm1pZHBvaW50XHJcblxyXG5cdFx0QG9uTW91c2VVcCA9IC0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0aXNDb25maXJtZWQgPSBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlUG9zRG93bikgPiBCdS5QT0lOVF9SRU5ERVJfU0laRVxyXG4iXX0=

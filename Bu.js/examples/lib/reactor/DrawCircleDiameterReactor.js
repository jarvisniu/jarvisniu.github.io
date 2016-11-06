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
            circle = new Bu.Circle(1, mousePosDown.x, mousePosDown.y);
            _this.bu.add(circle);
            line = new Bu.Line(mousePosDown, mousePosDown);
            line.stroke('#f44');
            _this.bu.add(line);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLG1DQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYix5REFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixXQUFBLEdBQWM7TUFFZCxNQUFBLEdBQVM7TUFDVCxJQUFBLEdBQU87TUFHUCxJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsSUFBRyxDQUFJLFdBQVA7WUFDQyxNQUFBLEdBQVM7WUFDVCxXQUFBLEdBQWMsS0FGZjtXQUFBLE1BQUE7WUFJQyxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1lBQ0EsTUFBQSxHQUFhLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFWLEVBQWEsWUFBWSxDQUFDLENBQTFCLEVBQTZCLFlBQVksQ0FBQyxDQUExQztZQUNiLEtBQUMsQ0FBQSxFQUFFLENBQUMsR0FBSixDQUFRLE1BQVI7WUFFQSxJQUFBLEdBQVcsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFlBQVIsRUFBc0IsWUFBdEI7WUFDWCxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7WUFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxJQUFSO1lBQ0EsV0FBQSxHQUFjLE1BWGY7O2lCQVlBLFdBQUEsR0FBYyxDQUFDLENBQUM7UUFiRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFnQmYsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUFDLENBQUQ7UUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtRQUNBLElBQUcsQ0FBQyxDQUFJLFdBQUwsQ0FBQSxJQUFxQixDQUFDLFdBQUEsS0FBZSxFQUFFLENBQUMsaUJBQWxCLElBQXdDLGdCQUF6QyxDQUF4QjtVQUNDLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtVQUNBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0M7aUJBQ3BELE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxTQUh0Qjs7TUFGYztNQU9mLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBQTtRQUNaLFdBQUEsR0FBYyxFQUFFLENBQUM7ZUFDakIsV0FBQSxHQUFjLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0MsRUFBRSxDQUFDO01BRnpDO0lBcENEOzs7O0tBRjZCLEVBQUUsQ0FBQztBQUE5QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdDaXJjbGVEaWFtZXRlclJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIERyYXcgY2lyY2xlIGJ5IGRyYWdnaW5nIG91dCBhIHJhZGl1c1xyXG5cclxuY2xhc3MgQnUuRHJhd0NpcmNsZURpYW1ldGVyUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuUG9pbnRcclxuXHJcblx0XHRpc0NvbmZpcm1lZCA9IHRydWVcclxuXHJcblx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRsaW5lID0gbnVsbFxyXG5cclxuXHRcdCMgY3JlYXRlIG5ldyBjaXJjbGVzIGV2ZXJ5IHRpbWVcclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRpZiBub3QgaXNDb25maXJtZWRcclxuXHRcdFx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRcdFx0aXNDb25maXJtZWQgPSB5ZXNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG1vdXNlUG9zRG93bi5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0XHRjaXJjbGUgPSBuZXcgQnUuQ2lyY2xlIDEsIG1vdXNlUG9zRG93bi54LCBtb3VzZVBvc0Rvd24ueVxyXG5cdFx0XHRcdEBidS5hZGQgY2lyY2xlXHJcblxyXG5cdFx0XHRcdGxpbmUgPSBuZXcgQnUuTGluZSBtb3VzZVBvc0Rvd24sIG1vdXNlUG9zRG93blxyXG5cdFx0XHRcdGxpbmUuc3Ryb2tlICcjZjQ0J1xyXG5cdFx0XHRcdEBidS5hZGQgbGluZVxyXG5cdFx0XHRcdGlzQ29uZmlybWVkID0gbm9cclxuXHRcdFx0bW91c2VCdXR0b24gPSBlLmJ1dHRvblxyXG5cclxuXHRcdCMgY2hhbmdlIHJhZGl1c1xyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpIC0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiAobm90IGlzQ29uZmlybWVkKSBvciAobW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlQgYW5kIGNpcmNsZT8pXHJcblx0XHRcdFx0bGluZS5zZXRQb2ludDIobW91c2VQb3MpXHJcblx0XHRcdFx0Y2lyY2xlLnJhZGl1cyA9IG1vdXNlUG9zLmRpc3RhbmNlVG8obW91c2VQb3NEb3duKSAvIDJcclxuXHRcdFx0XHRjaXJjbGUuY2VudGVyID0gbGluZS5taWRwb2ludFxyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSAtPlxyXG5cdFx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRcdGlzQ29uZmlybWVkID0gbW91c2VQb3MuZGlzdGFuY2VUbyhtb3VzZVBvc0Rvd24pID4gQnUuUE9JTlRfUkVOREVSX1NJWkVcclxuIl19

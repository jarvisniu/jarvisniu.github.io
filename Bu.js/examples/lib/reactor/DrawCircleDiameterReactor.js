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
            _this.bu.scene.addChild(circle);
            line = new Bu.Line(mousePosDown, mousePosDown);
            line.stroke('#f44');
            _this.bu.scene.addChild(line);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLG1DQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYix5REFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixXQUFBLEdBQWM7TUFFZCxNQUFBLEdBQVM7TUFDVCxJQUFBLEdBQU87TUFHUCxJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsSUFBRyxDQUFJLFdBQVA7WUFDQyxNQUFBLEdBQVM7WUFDVCxXQUFBLEdBQWMsS0FGZjtXQUFBLE1BQUE7WUFJQyxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1lBQ0EsTUFBQSxHQUFhLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFWLEVBQWEsWUFBWSxDQUFDLENBQTFCLEVBQTZCLFlBQVksQ0FBQyxDQUExQztZQUNiLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsTUFBbkI7WUFFQSxJQUFBLEdBQVcsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFlBQVIsRUFBc0IsWUFBdEI7WUFDWCxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7WUFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLElBQW5CO1lBQ0EsV0FBQSxHQUFjLE1BWGY7O2lCQVlBLFdBQUEsR0FBYyxDQUFDLENBQUM7UUFiRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFnQmYsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUFDLENBQUQ7UUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtRQUNBLElBQUcsQ0FBQyxDQUFJLFdBQUwsQ0FBQSxJQUFxQixDQUFDLFdBQUEsS0FBZSxFQUFFLENBQUMsaUJBQWxCLElBQXdDLGdCQUF6QyxDQUF4QjtVQUNDLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtVQUNBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0M7aUJBQ3BELE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxTQUh0Qjs7TUFGYztNQU9mLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBQTtRQUNaLFdBQUEsR0FBYyxFQUFFLENBQUM7ZUFDakIsV0FBQSxHQUFjLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0MsRUFBRSxDQUFDO01BRnpDO0lBcENEOzs7O0tBRjZCLEVBQUUsQ0FBQztBQUE5QyIsImZpbGUiOiJyZWFjdG9yL0RyYXdDaXJjbGVEaWFtZXRlclJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIERyYXcgY2lyY2xlIGJ5IGRyYWdnaW5nIG91dCBhIHJhZGl1c1xyXG5cclxuY2xhc3MgQnUuRHJhd0NpcmNsZURpYW1ldGVyUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuUG9pbnRcclxuXHJcblx0XHRpc0NvbmZpcm1lZCA9IHRydWVcclxuXHJcblx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRsaW5lID0gbnVsbFxyXG5cclxuXHRcdCMgY3JlYXRlIG5ldyBjaXJjbGVzIGV2ZXJ5IHRpbWVcclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRpZiBub3QgaXNDb25maXJtZWRcclxuXHRcdFx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRcdFx0aXNDb25maXJtZWQgPSB5ZXNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG1vdXNlUG9zRG93bi5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0XHRjaXJjbGUgPSBuZXcgQnUuQ2lyY2xlIDEsIG1vdXNlUG9zRG93bi54LCBtb3VzZVBvc0Rvd24ueVxyXG5cdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBjaXJjbGVcclxuXHJcblx0XHRcdFx0bGluZSA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zRG93biwgbW91c2VQb3NEb3duXHJcblx0XHRcdFx0bGluZS5zdHJva2UgJyNmNDQnXHJcblx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGxpbmVcclxuXHRcdFx0XHRpc0NvbmZpcm1lZCA9IG5vXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHQjIGNoYW5nZSByYWRpdXNcclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSAtPlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgKG5vdCBpc0NvbmZpcm1lZCkgb3IgKG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUIGFuZCBjaXJjbGU/KVxyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQyKG1vdXNlUG9zKVxyXG5cdFx0XHRcdGNpcmNsZS5yYWRpdXMgPSBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlUG9zRG93bikgLyAyXHJcblx0XHRcdFx0Y2lyY2xlLmNlbnRlciA9IGxpbmUubWlkcG9pbnRcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gLT5cclxuXHRcdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0XHRpc0NvbmZpcm1lZCA9IG1vdXNlUG9zLmRpc3RhbmNlVG8obW91c2VQb3NEb3duKSA+IEJ1LlBPSU5UX1JFTkRFUl9TSVpFXHJcbiJdfQ==

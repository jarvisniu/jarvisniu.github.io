(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawCircleReactor = (function(superClass) {
    extend(DrawCircleReactor, superClass);

    function DrawCircleReactor(bu) {
      var circle, isConfirmed, line, mouseButton, mousePos, mousePosDown;
      this.bu = bu;
      DrawCircleReactor.__super__.constructor.call(this);
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
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if ((!isConfirmed) || (mouseButton === Bu.MOUSE_BUTTON_LEFT && (circle != null))) {
            circle.radius = mousePos.distanceTo(mousePosDown);
            return line.setPoint1(mousePos);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          mouseButton = Bu.MOUSE_BUTTON_NONE;
          return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
        };
      })(this);
    }

    return DrawCircleReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZVJlYWN0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7SUFFSywyQkFBQyxFQUFEO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQ2IsaURBQUE7TUFFQSxXQUFBLEdBQWMsRUFBRSxDQUFDO01BQ2pCLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsV0FBQSxHQUFjO01BRWQsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPO01BR1AsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLElBQUcsQ0FBSSxXQUFQO1lBQ0MsTUFBQSxHQUFTO1lBQ1QsV0FBQSxHQUFjLEtBRmY7V0FBQSxNQUFBO1lBSUMsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLE9BQW5CLEVBQTRCLENBQUMsQ0FBQyxPQUE5QjtZQUNBLE1BQUEsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsQ0FBVixFQUFhLFlBQVksQ0FBQyxDQUExQixFQUE2QixZQUFZLENBQUMsQ0FBMUM7WUFDYixLQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxNQUFSO1lBRUEsSUFBQSxHQUFXLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxZQUFSLEVBQXNCLFlBQXRCO1lBQ1gsSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaO1lBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxHQUFKLENBQVEsSUFBUjtZQUNBLFdBQUEsR0FBYyxNQVhmOztpQkFZQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1FBYkY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BZ0JmLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsQ0FBQyxDQUFJLFdBQUwsQ0FBQSxJQUFxQixDQUFDLFdBQUEsS0FBZSxFQUFFLENBQUMsaUJBQWxCLElBQXdDLGdCQUF6QyxDQUF4QjtZQUNDLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCO21CQUNoQixJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWYsRUFGRDs7UUFGYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFNZixJQUFDLENBQUEsU0FBRCxHQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNaLFdBQUEsR0FBYyxFQUFFLENBQUM7aUJBQ2pCLFdBQUEsR0FBYyxRQUFRLENBQUMsVUFBVCxDQUFvQixZQUFwQixDQUFBLEdBQW9DLEVBQUUsQ0FBQztRQUZ6QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFuQ0Q7Ozs7S0FGcUIsRUFBRSxDQUFDO0FBQXRDIiwiZmlsZSI6InJlYWN0b3IvRHJhd0NpcmNsZVJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIERyYXcgY2lyY2xlIGJ5IGRyYWdnaW5nIG91dCBhIHJhZGl1c1xyXG5cclxuY2xhc3MgQnUuRHJhd0NpcmNsZVJlYWN0b3IgZXh0ZW5kcyBCdS5SZWFjdG9yQmFzZVxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBidSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRtb3VzZUJ1dHRvbiA9IEJ1Lk1PVVNFX0JVVFRPTl9OT05FXHJcblx0XHRtb3VzZVBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cdFx0bW91c2VQb3NEb3duID0gbmV3IEJ1LlBvaW50XHJcblxyXG5cdFx0aXNDb25maXJtZWQgPSB0cnVlXHJcblxyXG5cdFx0Y2lyY2xlID0gbnVsbFxyXG5cdFx0bGluZSA9IG51bGxcclxuXHJcblx0XHQjIGNyZWF0ZSBuZXcgY2lyY2xlcyBldmVyeSB0aW1lXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgPT5cclxuXHRcdFx0aWYgbm90IGlzQ29uZmlybWVkXHJcblx0XHRcdFx0Y2lyY2xlID0gbnVsbFxyXG5cdFx0XHRcdGlzQ29uZmlybWVkID0geWVzXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRtb3VzZVBvc0Rvd24uc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdFx0Y2lyY2xlID0gbmV3IEJ1LkNpcmNsZSAxLCBtb3VzZVBvc0Rvd24ueCwgbW91c2VQb3NEb3duLnlcclxuXHRcdFx0XHRAYnUuYWRkIGNpcmNsZVxyXG5cclxuXHRcdFx0XHRsaW5lID0gbmV3IEJ1LkxpbmUgbW91c2VQb3NEb3duLCBtb3VzZVBvc0Rvd25cclxuXHRcdFx0XHRsaW5lLnN0cm9rZSAnI2Y0NCdcclxuXHRcdFx0XHRAYnUuYWRkIGxpbmVcclxuXHRcdFx0XHRpc0NvbmZpcm1lZCA9IG5vXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHQjIGNoYW5nZSByYWRpdXNcclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgKG5vdCBpc0NvbmZpcm1lZCkgb3IgKG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUIGFuZCBjaXJjbGU/KVxyXG5cdFx0XHRcdGNpcmNsZS5yYWRpdXMgPSBtb3VzZVBvcy5kaXN0YW5jZVRvIG1vdXNlUG9zRG93blxyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQxIG1vdXNlUG9zXHJcblxyXG5cdFx0QG9uTW91c2VVcCA9ID0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0aXNDb25maXJtZWQgPSBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlUG9zRG93bikgPiBCdS5QT0lOVF9SRU5ERVJfU0laRVxyXG4iXX0=

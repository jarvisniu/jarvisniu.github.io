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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZVJlYWN0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7SUFFSywyQkFBQyxFQUFEO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQ2IsaURBQUE7TUFFQSxXQUFBLEdBQWMsRUFBRSxDQUFDO01BQ2pCLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsV0FBQSxHQUFjO01BRWQsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPO01BR1AsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLElBQUcsQ0FBSSxXQUFQO1lBQ0MsTUFBQSxHQUFTO1lBQ1QsV0FBQSxHQUFjLEtBRmY7V0FBQSxNQUFBO1lBSUMsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLE9BQW5CLEVBQTRCLENBQUMsQ0FBQyxPQUE5QjtZQUNBLE1BQUEsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsWUFBWSxDQUFDLENBQXZCLEVBQTBCLFlBQVksQ0FBQyxDQUF2QyxFQUEwQyxDQUExQztZQUNiLEtBQUMsQ0FBQSxFQUFFLENBQUMsTUFBSixDQUFXLE1BQVg7WUFFQSxJQUFBLEdBQVcsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFlBQVIsRUFBc0IsWUFBdEI7WUFDWCxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7WUFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLE1BQUosQ0FBVyxJQUFYO1lBQ0EsV0FBQSxHQUFjLE1BWGY7O2lCQVlBLFdBQUEsR0FBYyxDQUFDLENBQUM7UUFiRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFnQmYsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxDQUFDLENBQUksV0FBTCxDQUFBLElBQXFCLENBQUMsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBbEIsSUFBd0MsZ0JBQXpDLENBQXhCO1lBQ0MsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEI7bUJBQ2hCLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZixFQUZEOztRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQU1mLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1osV0FBQSxHQUFjLEVBQUUsQ0FBQztpQkFDakIsV0FBQSxHQUFjLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0MsRUFBRSxDQUFDO1FBRnpDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQW5DRDs7OztLQUZxQixFQUFFLENBQUM7QUFBdEMiLCJmaWxlIjoicmVhY3Rvci9EcmF3Q2lyY2xlUmVhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgRHJhdyBjaXJjbGUgYnkgZHJhZ2dpbmcgb3V0IGEgcmFkaXVzXHJcblxyXG5jbGFzcyBCdS5EcmF3Q2lyY2xlUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuUG9pbnRcclxuXHJcblx0XHRpc0NvbmZpcm1lZCA9IHRydWVcclxuXHJcblx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRsaW5lID0gbnVsbFxyXG5cclxuXHRcdCMgY3JlYXRlIG5ldyBjaXJjbGVzIGV2ZXJ5IHRpbWVcclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRpZiBub3QgaXNDb25maXJtZWRcclxuXHRcdFx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRcdFx0aXNDb25maXJtZWQgPSB5ZXNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG1vdXNlUG9zRG93bi5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0XHRjaXJjbGUgPSBuZXcgQnUuQ2lyY2xlIG1vdXNlUG9zRG93bi54LCBtb3VzZVBvc0Rvd24ueSwgMVxyXG5cdFx0XHRcdEBidS5hcHBlbmQgY2lyY2xlXHJcblxyXG5cdFx0XHRcdGxpbmUgPSBuZXcgQnUuTGluZSBtb3VzZVBvc0Rvd24sIG1vdXNlUG9zRG93blxyXG5cdFx0XHRcdGxpbmUuc3Ryb2tlICcjZjQ0J1xyXG5cdFx0XHRcdEBidS5hcHBlbmQgbGluZVxyXG5cdFx0XHRcdGlzQ29uZmlybWVkID0gbm9cclxuXHRcdFx0bW91c2VCdXR0b24gPSBlLmJ1dHRvblxyXG5cclxuXHRcdCMgY2hhbmdlIHJhZGl1c1xyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiAobm90IGlzQ29uZmlybWVkKSBvciAobW91c2VCdXR0b24gPT0gQnUuTU9VU0VfQlVUVE9OX0xFRlQgYW5kIGNpcmNsZT8pXHJcblx0XHRcdFx0Y2lyY2xlLnJhZGl1cyA9IG1vdXNlUG9zLmRpc3RhbmNlVG8gbW91c2VQb3NEb3duXHJcblx0XHRcdFx0bGluZS5zZXRQb2ludDEgbW91c2VQb3NcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gPT5cclxuXHRcdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0XHRpc0NvbmZpcm1lZCA9IG1vdXNlUG9zLmRpc3RhbmNlVG8obW91c2VQb3NEb3duKSA+IEJ1LlBPSU5UX1JFTkRFUl9TSVpFXHJcbiJdfQ==

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawCircleReactor = (function(superClass) {
    extend(DrawCircleReactor, superClass);

    function DrawCircleReactor(bu) {
      var circle, isConfirmed, line, mousePos, mousePosDown;
      this.bu = bu;
      DrawCircleReactor.__super__.constructor.call(this);
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Point;
      isConfirmed = true;
      circle = null;
      line = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          if (!isConfirmed) {
            circle = null;
            return isConfirmed = true;
          } else {
            mousePosDown.set(e.offsetX, e.offsetY);
            circle = new Bu.Circle(1, mousePosDown.x, mousePosDown.y);
            _this.bu.scene.addChild(circle);
            line = new Bu.Line(mousePosDown, mousePosDown);
            line.stroke('#f44');
            _this.bu.scene.addChild(line);
            return isConfirmed = false;
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if ((!isConfirmed) || (e.buttons === Bu.MOUSE.LEFT && (circle != null))) {
            circle.radius = mousePos.distanceTo(mousePosDown);
            return line.setPoint1(mousePos);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
        };
      })(this);
    }

    return DrawCircleReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZVJlYWN0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7SUFFSywyQkFBQyxFQUFEO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQ2IsaURBQUE7TUFFQSxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7TUFDbEIsWUFBQSxHQUFlLElBQUksRUFBRSxDQUFDO01BRXRCLFdBQUEsR0FBYztNQUVkLE1BQUEsR0FBUztNQUNULElBQUEsR0FBTztNQUdQLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxJQUFHLENBQUksV0FBUDtZQUNDLE1BQUEsR0FBUzttQkFDVCxXQUFBLEdBQWMsS0FGZjtXQUFBLE1BQUE7WUFJQyxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1lBQ0EsTUFBQSxHQUFhLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFWLEVBQWEsWUFBWSxDQUFDLENBQTFCLEVBQTZCLFlBQVksQ0FBQyxDQUExQztZQUNiLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsTUFBbkI7WUFFQSxJQUFBLEdBQVcsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLFlBQVIsRUFBc0IsWUFBdEI7WUFDWCxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7WUFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLElBQW5CO21CQUNBLFdBQUEsR0FBYyxNQVhmOztRQURjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWVmLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsQ0FBQyxDQUFJLFdBQUwsQ0FBQSxJQUFxQixDQUFDLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF0QixJQUErQixnQkFBaEMsQ0FBeEI7WUFDQyxNQUFNLENBQUMsTUFBUCxHQUFnQixRQUFRLENBQUMsVUFBVCxDQUFvQixZQUFwQjttQkFDaEIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmLEVBRkQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BTWYsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1osV0FBQSxHQUFjLFFBQVEsQ0FBQyxVQUFULENBQW9CLFlBQXBCLENBQUEsR0FBb0MsRUFBRSxDQUFDO1FBRHpDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQWpDRDs7OztLQUZxQixFQUFFLENBQUM7QUFBdEMiLCJmaWxlIjoicmVhY3Rvci9EcmF3Q2lyY2xlUmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgRHJhdyBjaXJjbGUgYnkgZHJhZ2dpbmcgb3V0IGEgcmFkaXVzXHJcblxyXG5jbGFzcyBCdS5EcmF3Q2lyY2xlUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuUG9pbnRcclxuXHJcblx0XHRpc0NvbmZpcm1lZCA9IHRydWVcclxuXHJcblx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRsaW5lID0gbnVsbFxyXG5cclxuXHRcdCMgY3JlYXRlIG5ldyBjaXJjbGVzIGV2ZXJ5IHRpbWVcclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRpZiBub3QgaXNDb25maXJtZWRcclxuXHRcdFx0XHRjaXJjbGUgPSBudWxsXHJcblx0XHRcdFx0aXNDb25maXJtZWQgPSB5ZXNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG1vdXNlUG9zRG93bi5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0XHRjaXJjbGUgPSBuZXcgQnUuQ2lyY2xlIDEsIG1vdXNlUG9zRG93bi54LCBtb3VzZVBvc0Rvd24ueVxyXG5cdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBjaXJjbGVcclxuXHJcblx0XHRcdFx0bGluZSA9IG5ldyBCdS5MaW5lIG1vdXNlUG9zRG93biwgbW91c2VQb3NEb3duXHJcblx0XHRcdFx0bGluZS5zdHJva2UgJyNmNDQnXHJcblx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGxpbmVcclxuXHRcdFx0XHRpc0NvbmZpcm1lZCA9IG5vXHJcblxyXG5cdFx0IyBjaGFuZ2UgcmFkaXVzXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgPT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIChub3QgaXNDb25maXJtZWQpIG9yIChlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuTEVGVCBhbmQgY2lyY2xlPylcclxuXHRcdFx0XHRjaXJjbGUucmFkaXVzID0gbW91c2VQb3MuZGlzdGFuY2VUbyBtb3VzZVBvc0Rvd25cclxuXHRcdFx0XHRsaW5lLnNldFBvaW50MSBtb3VzZVBvc1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRpc0NvbmZpcm1lZCA9IG1vdXNlUG9zLmRpc3RhbmNlVG8obW91c2VQb3NEb3duKSA+IEJ1LlBPSU5UX1JFTkRFUl9TSVpFXHJcbiJdfQ==

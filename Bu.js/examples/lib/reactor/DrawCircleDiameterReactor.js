(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawCircleDiameterReactor = (function(superClass) {
    extend(DrawCircleDiameterReactor, superClass);

    function DrawCircleDiameterReactor(bu) {
      var circle, isConfirmed, line, mousePos, mousePosDown;
      this.bu = bu;
      DrawCircleDiameterReactor.__super__.constructor.call(this);
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
      this.onMouseMove = function(e) {
        mousePos.set(e.offsetX, e.offsetY);
        if ((!isConfirmed) || (e.buttons === Bu.MOUSE.LEFT && (circle != null))) {
          line.setPoint2(mousePos);
          circle.radius = mousePos.distanceTo(mousePosDown) / 2;
          return circle.center = line.midpoint;
        }
      };
      this.onMouseUp = function() {
        return isConfirmed = mousePos.distanceTo(mousePosDown) > Bu.POINT_RENDER_SIZE;
      };
    }

    return DrawCircleDiameterReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLG1DQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYix5REFBQTtNQUVBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsV0FBQSxHQUFjO01BRWQsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPO01BR1AsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLElBQUcsQ0FBSSxXQUFQO1lBQ0MsTUFBQSxHQUFTO21CQUNULFdBQUEsR0FBYyxLQUZmO1dBQUEsTUFBQTtZQUlDLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7WUFDQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxZQUFZLENBQUMsQ0FBMUIsRUFBNkIsWUFBWSxDQUFDLENBQTFDO1lBQ2IsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBVixDQUFtQixNQUFuQjtZQUVBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsWUFBUixFQUFzQixZQUF0QjtZQUNYLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWjtZQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsSUFBbkI7bUJBQ0EsV0FBQSxHQUFjLE1BWGY7O1FBRGM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BZWYsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUFDLENBQUQ7UUFDZCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtRQUNBLElBQUcsQ0FBQyxDQUFJLFdBQUwsQ0FBQSxJQUFxQixDQUFDLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF0QixJQUErQixnQkFBaEMsQ0FBeEI7VUFDQyxJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWY7VUFDQSxNQUFNLENBQUMsTUFBUCxHQUFnQixRQUFRLENBQUMsVUFBVCxDQUFvQixZQUFwQixDQUFBLEdBQW9DO2lCQUNwRCxNQUFNLENBQUMsTUFBUCxHQUFnQixJQUFJLENBQUMsU0FIdEI7O01BRmM7TUFPZixJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUE7ZUFDWixXQUFBLEdBQWMsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQyxFQUFFLENBQUM7TUFEekM7SUFsQ0Q7Ozs7S0FGNkIsRUFBRSxDQUFDO0FBQTlDIiwiZmlsZSI6InJlYWN0b3IvRHJhd0NpcmNsZURpYW1ldGVyUmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgRHJhdyBjaXJjbGUgYnkgZHJhZ2dpbmcgb3V0IGEgcmFkaXVzXHJcblxyXG5jbGFzcyBCdS5EcmF3Q2lyY2xlRGlhbWV0ZXJSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0bW91c2VQb3MgPSBuZXcgQnUuUG9pbnRcclxuXHRcdG1vdXNlUG9zRG93biA9IG5ldyBCdS5Qb2ludFxyXG5cclxuXHRcdGlzQ29uZmlybWVkID0gdHJ1ZVxyXG5cclxuXHRcdGNpcmNsZSA9IG51bGxcclxuXHRcdGxpbmUgPSBudWxsXHJcblxyXG5cdFx0IyBjcmVhdGUgbmV3IGNpcmNsZXMgZXZlcnkgdGltZVxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdGlmIG5vdCBpc0NvbmZpcm1lZFxyXG5cdFx0XHRcdGNpcmNsZSA9IG51bGxcclxuXHRcdFx0XHRpc0NvbmZpcm1lZCA9IHllc1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0bW91c2VQb3NEb3duLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRcdGNpcmNsZSA9IG5ldyBCdS5DaXJjbGUgMSwgbW91c2VQb3NEb3duLngsIG1vdXNlUG9zRG93bi55XHJcblx0XHRcdFx0QGJ1LnNjZW5lLmFkZENoaWxkIGNpcmNsZVxyXG5cclxuXHRcdFx0XHRsaW5lID0gbmV3IEJ1LkxpbmUgbW91c2VQb3NEb3duLCBtb3VzZVBvc0Rvd25cclxuXHRcdFx0XHRsaW5lLnN0cm9rZSAnI2Y0NCdcclxuXHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgbGluZVxyXG5cdFx0XHRcdGlzQ29uZmlybWVkID0gbm9cclxuXHJcblx0XHQjIGNoYW5nZSByYWRpdXNcclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSAtPlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgKG5vdCBpc0NvbmZpcm1lZCkgb3IgKGUuYnV0dG9ucyA9PSBCdS5NT1VTRS5MRUZUIGFuZCBjaXJjbGU/KVxyXG5cdFx0XHRcdGxpbmUuc2V0UG9pbnQyKG1vdXNlUG9zKVxyXG5cdFx0XHRcdGNpcmNsZS5yYWRpdXMgPSBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlUG9zRG93bikgLyAyXHJcblx0XHRcdFx0Y2lyY2xlLmNlbnRlciA9IGxpbmUubWlkcG9pbnRcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gLT5cclxuXHRcdFx0aXNDb25maXJtZWQgPSBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlUG9zRG93bikgPiBCdS5QT0lOVF9SRU5ERVJfU0laRVxyXG4iXX0=

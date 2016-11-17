(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPointReactor = (function(superClass) {
    extend(DrawPointReactor, superClass);

    function DrawPointReactor(bu) {
      var drawingPoint, mouseDownPos, mousePos;
      this.bu = bu;
      DrawPointReactor.__super__.constructor.call(this);
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      drawingPoint = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          drawingPoint = new Bu.Point(e.offsetX, e.offsetY);
          return _this.bu.scene.addChild(drawingPoint);
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
            return drawingPoint.set(mousePos.x, mousePos.y);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          return drawingPoint = null;
        };
      })(this);
    }

    return DrawPointReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvaW50UmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDBCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixnREFBQTtNQUVBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsWUFBQSxHQUFlO01BRWYsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxZQUFBLEdBQW1CLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFDLENBQUMsT0FBWCxFQUFvQixDQUFDLENBQUMsT0FBdEI7aUJBQ25CLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsWUFBbkI7UUFIYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFDLENBQUMsT0FBZixFQUF3QixDQUFDLENBQUMsT0FBMUI7VUFDQSxJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF6QjttQkFDQyxZQUFZLENBQUMsR0FBYixDQUFpQixRQUFRLENBQUMsQ0FBMUIsRUFBNkIsUUFBUSxDQUFDLENBQXRDLEVBREQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1osWUFBQSxHQUFlO1FBREg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBbEJEOzs7O0tBRm9CLEVBQUUsQ0FBQztBQUFyQyIsImZpbGUiOiJyZWFjdG9yL0RyYXdQb2ludFJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIGNsaWNrIHRvIGRyYXcgYSBwb2ludFxyXG5cclxuY2xhc3MgQnUuRHJhd1BvaW50UmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZURvd25Qb3MgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0ZHJhd2luZ1BvaW50ID0gbnVsbFxyXG5cclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZURvd25Qb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGRyYXdpbmdQb2ludCA9IG5ldyBCdS5Qb2ludCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgZHJhd2luZ1BvaW50XHJcblxyXG5cdFx0QG9uTW91c2VNb3ZlID0gKGUpID0+XHJcblx0XHRcdG1vdXNlUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cdFx0XHRpZiBlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuTEVGVFxyXG5cdFx0XHRcdGRyYXdpbmdQb2ludC5zZXQgbW91c2VQb3MueCwgbW91c2VQb3MueVxyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRkcmF3aW5nUG9pbnQgPSBudWxsXHJcbiJdfQ==

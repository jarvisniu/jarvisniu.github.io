(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawPointReactor = (function(superClass) {
    extend(DrawPointReactor, superClass);

    function DrawPointReactor(bu) {
      var drawingPoint, mouseButton, mouseDownPos, mousePos;
      this.bu = bu;
      DrawPointReactor.__super__.constructor.call(this);
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Vector;
      drawingPoint = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          mouseButton = e.button;
          drawingPoint = new Bu.Point(e.offsetX, e.offsetY);
          return _this.bu.scene.addChild(drawingPoint);
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            return drawingPoint.set(mousePos.x, mousePos.y);
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          mouseButton = Bu.MOUSE_BUTTON_NONE;
          return drawingPoint = null;
        };
      })(this);
    }

    return DrawPointReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd1BvaW50UmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDBCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixnREFBQTtNQUVBLFdBQUEsR0FBYyxFQUFFLENBQUM7TUFDakIsUUFBQSxHQUFXLElBQUksRUFBRSxDQUFDO01BQ2xCLFlBQUEsR0FBZSxJQUFJLEVBQUUsQ0FBQztNQUV0QixZQUFBLEdBQWU7TUFFZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLE9BQW5CLEVBQTRCLENBQUMsQ0FBQyxPQUE5QjtVQUNBLFdBQUEsR0FBYyxDQUFDLENBQUM7VUFFaEIsWUFBQSxHQUFtQixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBQyxDQUFDLE9BQVgsRUFBb0IsQ0FBQyxDQUFDLE9BQXRCO2lCQUNuQixLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLFlBQW5CO1FBTGM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BT2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjttQkFDQyxZQUFZLENBQUMsR0FBYixDQUFpQixRQUFRLENBQUMsQ0FBMUIsRUFBNkIsUUFBUSxDQUFDLENBQXRDLEVBREQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS2YsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDWixXQUFBLEdBQWMsRUFBRSxDQUFDO2lCQUNqQixZQUFBLEdBQWU7UUFGSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFyQkQ7Ozs7S0FGb0IsRUFBRSxDQUFDO0FBQXJDIiwiZmlsZSI6InJlYWN0b3IvRHJhd1BvaW50UmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgY2xpY2sgdG8gZHJhdyBhIHBvaW50XHJcblxyXG5jbGFzcyBCdS5EcmF3UG9pbnRSZWFjdG9yIGV4dGVuZHMgQnUuUmVhY3RvckJhc2VcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0bW91c2VQb3MgPSBuZXcgQnUuUG9pbnRcclxuXHRcdG1vdXNlRG93blBvcyA9IG5ldyBCdS5WZWN0b3JcclxuXHJcblx0XHRkcmF3aW5nUG9pbnQgPSBudWxsXHJcblxyXG5cdFx0QG9uTW91c2VEb3duID0gKGUpID0+XHJcblx0XHRcdG1vdXNlRG93blBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0bW91c2VCdXR0b24gPSBlLmJ1dHRvblxyXG5cclxuXHRcdFx0ZHJhd2luZ1BvaW50ID0gbmV3IEJ1LlBvaW50IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBkcmF3aW5nUG9pbnRcclxuXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgPT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0ZHJhd2luZ1BvaW50LnNldCBtb3VzZVBvcy54LCBtb3VzZVBvcy55XHJcblxyXG5cdFx0QG9uTW91c2VVcCA9ID0+XHJcblx0XHRcdG1vdXNlQnV0dG9uID0gQnUuTU9VU0VfQlVUVE9OX05PTkVcclxuXHRcdFx0ZHJhd2luZ1BvaW50ID0gbnVsbFxyXG4iXX0=

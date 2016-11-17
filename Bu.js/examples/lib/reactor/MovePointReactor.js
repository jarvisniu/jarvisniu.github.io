(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.MovePointReactor = (function(superClass) {
    extend(MovePointReactor, superClass);

    function MovePointReactor(bu) {
      var hoveredPoint, mousePos, mousePosDown, mousePosDownDelta;
      this.bu = bu;
      MovePointReactor.__super__.constructor.call(this);
      mousePos = new Bu.Point;
      mousePosDown = new Bu.Vector;
      mousePosDownDelta = new Bu.Vector;
      hoveredPoint = null;
      this.onMouseDown = function(e) {
        mousePosDown.set(e.offsetX, e.offsetY);
        if (hoveredPoint != null) {
          return mousePosDownDelta.set(mousePosDown.x - hoveredPoint.x, mousePosDown.y - hoveredPoint.y);
        }
      };
      this.onMouseMove = (function(_this) {
        return function(e) {
          var i, len, ref, results, shape;
          mousePos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
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
              ref = _this.bu.scene.children;
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
    }

    return MovePointReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvTW92ZVBvaW50UmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDBCQUFDLEVBQUQ7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFDYixnREFBQTtNQUVBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFDdEIsaUJBQUEsR0FBb0IsSUFBSSxFQUFFLENBQUM7TUFFM0IsWUFBQSxHQUFlO01BR2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUFDLENBQUQ7UUFDZCxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1FBRUEsSUFBRyxvQkFBSDtpQkFDQyxpQkFBaUIsQ0FBQyxHQUFsQixDQUNFLFlBQVksQ0FBQyxDQUFiLEdBQWlCLFlBQVksQ0FBQyxDQURoQyxFQUVFLFlBQVksQ0FBQyxDQUFiLEdBQWlCLFlBQVksQ0FBQyxDQUZoQyxFQUREOztNQUhjO01BVWYsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtBQUNkLGNBQUE7VUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUMsQ0FBQyxPQUFmLEVBQXdCLENBQUMsQ0FBQyxPQUExQjtVQUNBLElBQUcsQ0FBQyxDQUFDLE9BQUYsS0FBYSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQXpCO1lBQ0MsSUFHSyxvQkFITDtxQkFBQSxZQUFZLENBQUMsR0FBYixDQUNFLFFBQVEsQ0FBQyxDQUFULEdBQWEsaUJBQWlCLENBQUMsQ0FEakMsRUFFRSxRQUFRLENBQUMsQ0FBVCxHQUFhLGlCQUFpQixDQUFDLENBRmpDLEVBQUE7YUFERDtXQUFBLE1BQUE7WUFNQyxJQUFHLG9CQUFIO2NBQ0MsSUFBRyxDQUFJLFlBQVksQ0FBQyxNQUFiLENBQW9CLFFBQXBCLENBQVA7Z0JBQ0MsWUFBWSxDQUFDLFNBQWIsR0FBeUI7Z0JBQ3pCLFlBQVksQ0FBQyxJQUFiLENBQUE7dUJBQ0EsWUFBQSxHQUFlLEtBSGhCO2VBREQ7YUFBQSxNQUFBO0FBTUM7QUFBQTttQkFBQSxxQ0FBQTs7Z0JBQ0MsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLE9BQWQsSUFBMEIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLENBQTdCO2tCQUNDLFlBQUEsR0FBZTtrQkFDZixZQUFZLENBQUMsU0FBYixHQUF5QjtrQkFDekIsWUFBWSxDQUFDLElBQWIsQ0FBa0IsTUFBbEI7QUFDQSx3QkFKRDtpQkFBQSxNQUFBO3VDQUFBOztBQUREOzZCQU5EO2FBTkQ7O1FBRmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBcEJIOzs7O0tBRm9CLEVBQUUsQ0FBQztBQUFyQyIsImZpbGUiOiJyZWFjdG9yL01vdmVQb2ludFJlYWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIG1vdmUgYSBwb2ludCBieSBkcmFnZ2luZyBpdFxyXG5cclxuY2xhc3MgQnUuTW92ZVBvaW50UmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZVBvc0Rvd24gPSBuZXcgQnUuVmVjdG9yXHJcblx0XHRtb3VzZVBvc0Rvd25EZWx0YSA9IG5ldyBCdS5WZWN0b3JcclxuXHJcblx0XHRob3ZlcmVkUG9pbnQgPSBudWxsXHJcblxyXG5cdFx0IyByZWNvcmQgdGhlIGRlbHRhXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgLT5cclxuXHRcdFx0bW91c2VQb3NEb3duLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cclxuXHRcdFx0aWYgaG92ZXJlZFBvaW50P1xyXG5cdFx0XHRcdG1vdXNlUG9zRG93bkRlbHRhLnNldChcclxuXHRcdFx0XHRcdFx0bW91c2VQb3NEb3duLnggLSBob3ZlcmVkUG9pbnQueFxyXG5cdFx0XHRcdFx0XHRtb3VzZVBvc0Rvd24ueSAtIGhvdmVyZWRQb2ludC55XHJcblx0XHRcdFx0KVxyXG5cclxuXHRcdCMgY2hhbmdlIHgsIHlcclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgZS5idXR0b25zID09IEJ1Lk1PVVNFLkxFRlRcclxuXHRcdFx0XHRob3ZlcmVkUG9pbnQuc2V0KFxyXG5cdFx0XHRcdFx0XHRtb3VzZVBvcy54IC0gbW91c2VQb3NEb3duRGVsdGEueFxyXG5cdFx0XHRcdFx0XHRtb3VzZVBvcy55IC0gbW91c2VQb3NEb3duRGVsdGEueVxyXG5cdFx0XHRcdCkgaWYgaG92ZXJlZFBvaW50P1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0aWYgaG92ZXJlZFBvaW50P1xyXG5cdFx0XHRcdFx0aWYgbm90IGhvdmVyZWRQb2ludC5pc05lYXIobW91c2VQb3MpXHJcblx0XHRcdFx0XHRcdGhvdmVyZWRQb2ludC5saW5lV2lkdGggPSAwLjVcclxuXHRcdFx0XHRcdFx0aG92ZXJlZFBvaW50LmZpbGwoKVxyXG5cdFx0XHRcdFx0XHRob3ZlcmVkUG9pbnQgPSBudWxsXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0Zm9yIHNoYXBlIGluIEBidS5zY2VuZS5jaGlsZHJlblxyXG5cdFx0XHRcdFx0XHRpZiBzaGFwZS50eXBlIGlzICdQb2ludCcgYW5kIHNoYXBlLmlzTmVhciBtb3VzZVBvc1xyXG5cdFx0XHRcdFx0XHRcdGhvdmVyZWRQb2ludCA9IHNoYXBlXHJcblx0XHRcdFx0XHRcdFx0aG92ZXJlZFBvaW50LmxpbmVXaWR0aCA9IDFcclxuXHRcdFx0XHRcdFx0XHRob3ZlcmVkUG9pbnQuZmlsbCAnI2Y4MCdcclxuXHRcdFx0XHRcdFx0XHRicmVha1xyXG4iXX0=

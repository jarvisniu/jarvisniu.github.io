(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawFreelineReactor = (function(superClass) {
    extend(DrawFreelineReactor, superClass);

    function DrawFreelineReactor(bu, curvify) {
      var mouseDownPos, mousePos, polyline;
      this.bu = bu;
      this.curvify = curvify != null ? curvify : false;
      DrawFreelineReactor.__super__.constructor.call(this);
      this.lineSplitThresh = 8;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Point;
      polyline = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
            polyline = new Bu.Polyline;
            polyline.style('line');
            return _this.bu.scene.addChild(polyline);
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (e.buttons === Bu.MOUSE.LEFT) {
            if (mousePos.distanceTo(mouseDownPos) > _this.lineSplitThresh || polyline.vertices.length < 2) {
              polyline.addPoint(mousePos.clone());
              return mouseDownPos.copy(mousePos);
            } else {
              return polyline.vertices[polyline.vertices.length - 1].copy(mousePos);
            }
          }
        };
      })(this);
      this.onMouseUp = (function(_this) {
        return function() {
          var spline;
          if (polyline != null) {
            polyline.style();
            if (_this.curvify) {
              polyline.compress(0.5);
              spline = new Bu.Spline(polyline);
              spline.smoothFactor = 0.1;
              _this.bu.scene.children[_this.bu.scene.children.length - 1] = spline;
            } else {
              polyline.compress(0.2);
            }
            return polyline = null;
          }
        };
      })(this);
    }

    return DrawFreelineReactor;

  })(Bu.ReactorBase);

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0ZyZWVsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQsRUFBTSxPQUFOO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLDRCQUFELFVBQVc7TUFDN0IsbURBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUVuQixRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7TUFDbEIsWUFBQSxHQUFlLElBQUksRUFBRSxDQUFDO01BRXRCLFFBQUEsR0FBVztNQUVYLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDZCxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFDLENBQUMsT0FBbkIsRUFBNEIsQ0FBQyxDQUFDLE9BQTlCO1VBRUEsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBekI7WUFDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQVQsQ0FBZSxNQUFmO21CQUNBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsRUFIRDs7UUFIYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFRZixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFDLENBQUMsT0FBZixFQUF3QixDQUFDLENBQUMsT0FBMUI7VUFDQSxJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF6QjtZQUNDLElBQUcsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQyxLQUFDLENBQUEsZUFBckMsSUFBd0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixHQUEyQixDQUF0RjtjQUNDLFFBQVEsQ0FBQyxRQUFULENBQWtCLFFBQVEsQ0FBQyxLQUFULENBQUEsQ0FBbEI7cUJBQ0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsUUFBbEIsRUFGRDthQUFBLE1BQUE7cUJBSUMsUUFBUSxDQUFDLFFBQVMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQWxCLEdBQTJCLENBQTNCLENBQTZCLENBQUMsSUFBaEQsQ0FBcUQsUUFBckQsRUFKRDthQUREOztRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVNmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1osY0FBQTtVQUFBLElBQUcsZ0JBQUg7WUFDQyxRQUFRLENBQUMsS0FBVCxDQUFBO1lBRUEsSUFBRyxLQUFDLENBQUEsT0FBSjtjQUNDLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCO2NBQ0EsTUFBQSxHQUFhLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWO2NBQ2IsTUFBTSxDQUFDLFlBQVAsR0FBc0I7Y0FDdEIsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUyxDQUFBLEtBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixDQUE1QixDQUFuQixHQUFvRCxPQUpyRDthQUFBLE1BQUE7Y0FNQyxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQixFQU5EOzttQkFRQSxRQUFBLEdBQVcsS0FYWjs7UUFEWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUEzQkQ7Ozs7S0FGdUIsRUFBRSxDQUFDO0FBQXhDIiwiZmlsZSI6InJlYWN0b3IvRHJhd0ZyZWVsaW5lUmVhY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgZHJhZyB0byBkcmF3IGEgZnJlZWxpbmVcclxuXHJcbmNsYXNzIEJ1LkRyYXdGcmVlbGluZVJlYWN0b3IgZXh0ZW5kcyBCdS5SZWFjdG9yQmFzZVxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBidSwgQGN1cnZpZnkgPSBubykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAbGluZVNwbGl0VGhyZXNoID0gOFxyXG5cclxuXHRcdG1vdXNlUG9zID0gbmV3IEJ1LlBvaW50XHJcblx0XHRtb3VzZURvd25Qb3MgPSBuZXcgQnUuUG9pbnRcclxuXHJcblx0XHRwb2x5bGluZSA9IG51bGxcclxuXHJcblx0XHRAb25Nb3VzZURvd24gPSAoZSkgPT5cclxuXHRcdFx0bW91c2VEb3duUG9zLnNldCBlLm9mZnNldFgsIGUub2Zmc2V0WVxyXG5cclxuXHRcdFx0aWYgZS5idXR0b25zID09IEJ1Lk1PVVNFLkxFRlRcclxuXHRcdFx0XHRwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZVxyXG5cdFx0XHRcdHBvbHlsaW5lLnN0eWxlICdsaW5lJ1xyXG5cdFx0XHRcdEBidS5zY2VuZS5hZGRDaGlsZCBwb2x5bGluZVxyXG5cclxuXHRcdEBvbk1vdXNlTW92ZSA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZVBvcy5zZXQgZS5vZmZzZXRYLCBlLm9mZnNldFlcclxuXHRcdFx0aWYgZS5idXR0b25zID09IEJ1Lk1PVVNFLkxFRlRcclxuXHRcdFx0XHRpZiBtb3VzZVBvcy5kaXN0YW5jZVRvKG1vdXNlRG93blBvcykgPiBAbGluZVNwbGl0VGhyZXNoIG9yIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCA8IDJcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmFkZFBvaW50IG1vdXNlUG9zLmNsb25lKClcclxuXHRcdFx0XHRcdG1vdXNlRG93blBvcy5jb3B5IG1vdXNlUG9zXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0cG9seWxpbmUudmVydGljZXNbcG9seWxpbmUudmVydGljZXMubGVuZ3RoIC0gMV0uY29weSBtb3VzZVBvc1xyXG5cclxuXHRcdEBvbk1vdXNlVXAgPSA9PlxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRwb2x5bGluZS5zdHlsZSgpXHJcblxyXG5cdFx0XHRcdGlmIEBjdXJ2aWZ5XHJcblx0XHRcdFx0XHRwb2x5bGluZS5jb21wcmVzcyAwLjVcclxuXHRcdFx0XHRcdHNwbGluZSA9IG5ldyBCdS5TcGxpbmUgcG9seWxpbmVcclxuXHRcdFx0XHRcdHNwbGluZS5zbW9vdGhGYWN0b3IgPSAwLjFcclxuXHRcdFx0XHRcdEBidS5zY2VuZS5jaGlsZHJlbltAYnUuc2NlbmUuY2hpbGRyZW4ubGVuZ3RoIC0gMV0gPSBzcGxpbmVcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRwb2x5bGluZS5jb21wcmVzcyAwLjJcclxuXHJcblx0XHRcdFx0cG9seWxpbmUgPSBudWxsXHJcbiJdfQ==

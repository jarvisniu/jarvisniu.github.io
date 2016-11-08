(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.DrawFreelineReactor = (function(superClass) {
    extend(DrawFreelineReactor, superClass);

    function DrawFreelineReactor(bu, curvify) {
      var mouseButton, mouseDownPos, mousePos, polyline;
      this.bu = bu;
      this.curvify = curvify != null ? curvify : false;
      DrawFreelineReactor.__super__.constructor.call(this);
      this.lineSplitThresh = 8;
      mouseButton = Bu.MOUSE_BUTTON_NONE;
      mousePos = new Bu.Point;
      mouseDownPos = new Bu.Point;
      polyline = null;
      this.onMouseDown = (function(_this) {
        return function(e) {
          mouseDownPos.set(e.offsetX, e.offsetY);
          mouseButton = e.button;
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
            polyline = new Bu.Polyline;
            polyline.stroke(Bu.DEFAULT_STROKE_STYLE_HOVER);
            return _this.bu.scene.addChild(polyline);
          }
        };
      })(this);
      this.onMouseMove = (function(_this) {
        return function(e) {
          mousePos.set(e.offsetX, e.offsetY);
          if (mouseButton === Bu.MOUSE_BUTTON_LEFT) {
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
          mouseButton = Bu.MOUSE_BUTTON_NONE;
          if (polyline != null) {
            polyline.stroke(Bu.DEFAULT_STROKE_STYLE);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvRHJhd0ZyZWVsaW5lUmVhY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLDZCQUFDLEVBQUQsRUFBTSxPQUFOO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLDRCQUFELFVBQVc7TUFDN0IsbURBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUVuQixXQUFBLEdBQWMsRUFBRSxDQUFDO01BQ2pCLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztNQUNsQixZQUFBLEdBQWUsSUFBSSxFQUFFLENBQUM7TUFFdEIsUUFBQSxHQUFXO01BRVgsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxPQUFuQixFQUE0QixDQUFDLENBQUMsT0FBOUI7VUFDQSxXQUFBLEdBQWMsQ0FBQyxDQUFDO1VBRWhCLElBQUcsV0FBQSxLQUFlLEVBQUUsQ0FBQyxpQkFBckI7WUFDQyxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsRUFBRSxDQUFDLDBCQUFuQjttQkFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFWLENBQW1CLFFBQW5CLEVBSEQ7O1FBSmM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BU2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsQ0FBQyxDQUFDLE9BQWYsRUFBd0IsQ0FBQyxDQUFDLE9BQTFCO1VBQ0EsSUFBRyxXQUFBLEtBQWUsRUFBRSxDQUFDLGlCQUFyQjtZQUNDLElBQUcsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsWUFBcEIsQ0FBQSxHQUFvQyxLQUFDLENBQUEsZUFBckMsSUFBd0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixHQUEyQixDQUF0RjtjQUNDLFFBQVEsQ0FBQyxRQUFULENBQWtCLFFBQVEsQ0FBQyxLQUFULENBQUEsQ0FBbEI7cUJBQ0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsUUFBbEIsRUFGRDthQUFBLE1BQUE7cUJBSUMsUUFBUSxDQUFDLFFBQVMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQWxCLEdBQTJCLENBQTNCLENBQTZCLENBQUMsSUFBaEQsQ0FBcUQsUUFBckQsRUFKRDthQUREOztRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVNmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1osY0FBQTtVQUFBLFdBQUEsR0FBYyxFQUFFLENBQUM7VUFDakIsSUFBRyxnQkFBSDtZQUNDLFFBQVEsQ0FBQyxNQUFULENBQWdCLEVBQUUsQ0FBQyxvQkFBbkI7WUFFQSxJQUFHLEtBQUMsQ0FBQSxPQUFKO2NBQ0MsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7Y0FDQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLFFBQVY7Y0FDYixNQUFNLENBQUMsWUFBUCxHQUFzQjtjQUN0QixLQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFTLENBQUEsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLENBQTVCLENBQW5CLEdBQW9ELE9BSnJEO2FBQUEsTUFBQTtjQU1DLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCLEVBTkQ7O21CQVFBLFFBQUEsR0FBVyxLQVhaOztRQUZZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQTdCRDs7OztLQUZ1QixFQUFFLENBQUM7QUFBeEMiLCJmaWxlIjoicmVhY3Rvci9EcmF3RnJlZWxpbmVSZWFjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyBkcmFnIHRvIGRyYXcgYSBmcmVlbGluZVxyXG5cclxuY2xhc3MgQnUuRHJhd0ZyZWVsaW5lUmVhY3RvciBleHRlbmRzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGJ1LCBAY3VydmlmeSA9IG5vKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEBsaW5lU3BsaXRUaHJlc2ggPSA4XHJcblxyXG5cdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0bW91c2VQb3MgPSBuZXcgQnUuUG9pbnRcclxuXHRcdG1vdXNlRG93blBvcyA9IG5ldyBCdS5Qb2ludFxyXG5cclxuXHRcdHBvbHlsaW5lID0gbnVsbFxyXG5cclxuXHRcdEBvbk1vdXNlRG93biA9IChlKSA9PlxyXG5cdFx0XHRtb3VzZURvd25Qb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdG1vdXNlQnV0dG9uID0gZS5idXR0b25cclxuXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdFx0XHRwb2x5bGluZS5zdHJva2UgQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVfSE9WRVJcclxuXHRcdFx0XHRAYnUuc2NlbmUuYWRkQ2hpbGQgcG9seWxpbmVcclxuXHJcblx0XHRAb25Nb3VzZU1vdmUgPSAoZSkgPT5cclxuXHRcdFx0bW91c2VQb3Muc2V0IGUub2Zmc2V0WCwgZS5vZmZzZXRZXHJcblx0XHRcdGlmIG1vdXNlQnV0dG9uID09IEJ1Lk1PVVNFX0JVVFRPTl9MRUZUXHJcblx0XHRcdFx0aWYgbW91c2VQb3MuZGlzdGFuY2VUbyhtb3VzZURvd25Qb3MpID4gQGxpbmVTcGxpdFRocmVzaCBvciBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGggPCAyXHJcblx0XHRcdFx0XHRwb2x5bGluZS5hZGRQb2ludCBtb3VzZVBvcy5jbG9uZSgpXHJcblx0XHRcdFx0XHRtb3VzZURvd25Qb3MuY29weSBtb3VzZVBvc1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvbHlsaW5lLnZlcnRpY2VzW3BvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCAtIDFdLmNvcHkgbW91c2VQb3NcclxuXHJcblx0XHRAb25Nb3VzZVVwID0gPT5cclxuXHRcdFx0bW91c2VCdXR0b24gPSBCdS5NT1VTRV9CVVRUT05fTk9ORVxyXG5cdFx0XHRpZiBwb2x5bGluZT9cclxuXHRcdFx0XHRwb2x5bGluZS5zdHJva2UgQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVcclxuXHJcblx0XHRcdFx0aWYgQGN1cnZpZnlcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmNvbXByZXNzIDAuNVxyXG5cdFx0XHRcdFx0c3BsaW5lID0gbmV3IEJ1LlNwbGluZSBwb2x5bGluZVxyXG5cdFx0XHRcdFx0c3BsaW5lLnNtb290aEZhY3RvciA9IDAuMVxyXG5cdFx0XHRcdFx0QGJ1LnNjZW5lLmNoaWxkcmVuW0BidS5zY2VuZS5jaGlsZHJlbi5sZW5ndGggLSAxXSA9IHNwbGluZVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHBvbHlsaW5lLmNvbXByZXNzIDAuMlxyXG5cclxuXHRcdFx0XHRwb2x5bGluZSA9IG51bGxcclxuIl19

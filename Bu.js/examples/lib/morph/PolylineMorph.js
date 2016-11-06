(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bu.PolylineMorph = (function() {
    function PolylineMorph(polylineA, polylineB) {
      this.polylineA = polylineA;
      this.polylineB = polylineB;
      this.update = bind(this.update, this);
      this.type = 'PolylineMorph';
      this.polyline = new Bu.Polyline();
      this.hPointsA = [];
      this.hPointsB = [];
      this.update();
    }

    PolylineMorph.prototype.setTime = function(time) {
      var i, j, ref;
      for (i = j = 0, ref = this.hPointsA.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        Bu.Point.interpolate(this.hPointsA[i], this.hPointsB[i], time, this.polyline.vertices[i]);
      }
      return this.polyline.trigger('pointChange', this.polyline);
    };

    PolylineMorph.prototype.update = function() {
      var i, indexA, indexB, j, pointsA, pointsB, posA, posAPrev, posB, posBPrev, ref, secPosA, secPosB;
      this.hPointsA = [];
      this.hPointsB = [];
      pointsA = this.polylineA.vertices;
      pointsB = this.polylineB.vertices;
      indexA = 0;
      indexB = 0;
      while (indexA < pointsA.length && indexB < pointsB.length) {
        posA = this.polylineA.getNormalizedPos(indexA);
        posB = this.polylineB.getNormalizedPos(indexB);
        posAPrev = this.polylineA.getNormalizedPos(indexA - 1);
        posBPrev = this.polylineB.getNormalizedPos(indexB - 1);
        if (posA < posB) {
          secPosB = (posA - posBPrev) / (posB - posBPrev);
          this.hPointsA.push(pointsA[indexA]);
          this.hPointsB.push(Bu.Point.interpolate(pointsB[indexB - 1], pointsB[indexB], secPosB));
          indexA += 1;
        } else if (posA > posB) {
          secPosA = (posB - posAPrev) / (posA - posAPrev);
          this.hPointsA.push(Bu.Point.interpolate(pointsA[indexA - 1], pointsA[indexA], secPosA));
          this.hPointsB.push(pointsB[indexB]);
          indexB += 1;
        } else {
          this.hPointsA.push(pointsA[indexA]);
          this.hPointsB.push(pointsB[indexB]);
          indexA += 1;
          indexB += 1;
        }
      }
      for (i = j = 0, ref = this.hPointsA.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.polyline.vertices[i] != null) {
          this.polyline.vertices[i].set(this.hPointsA[i].x, this.hPointsA[i].y);
        } else {
          this.polyline.vertices[i] = new Bu.Point(this.hPointsA[i].x, this.hPointsA[i].y);
        }
      }
      if (this.polyline.vertices.length < this.hPointsA.length) {
        this.polyline.vertices.splice(this.hPointsA.length);
      }
      return this.polyline.trigger('pointChange', this.polyline);
    };

    return PolylineMorph;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vcnBoL1BvbHlsaW5lTW9ycGguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBQUEsTUFBQTs7RUFBTSxFQUFFLENBQUM7SUFFSyx1QkFBQyxTQUFELEVBQWEsU0FBYjtNQUFDLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLFlBQUQ7O01BQ3pCLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxRQUFILENBQUE7TUFFaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFFWixJQUFDLENBQUEsTUFBRCxDQUFBO0lBUFk7OzRCQVNiLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDUixVQUFBO0FBQUEsV0FBUyw2RkFBVDtRQUNDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVCxDQUFxQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBL0IsRUFBbUMsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQTdDLEVBQWlELElBQWpELEVBQXVELElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBMUU7QUFERDthQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixhQUFsQixFQUFpQyxJQUFDLENBQUEsUUFBbEM7SUFIUTs7NEJBS1QsTUFBQSxHQUFRLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFFWixPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQztNQUNyQixPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQztNQUVyQixNQUFBLEdBQVM7TUFDVCxNQUFBLEdBQVM7QUFFVCxhQUFNLE1BQUEsR0FBUyxPQUFPLENBQUMsTUFBakIsSUFBNEIsTUFBQSxHQUFTLE9BQU8sQ0FBQyxNQUFuRDtRQUNDLElBQUEsR0FBTyxJQUFDLENBQUEsU0FBUyxDQUFDLGdCQUFYLENBQTRCLE1BQTVCO1FBQ1AsSUFBQSxHQUFPLElBQUMsQ0FBQSxTQUFTLENBQUMsZ0JBQVgsQ0FBNEIsTUFBNUI7UUFDUCxRQUFBLEdBQVcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixNQUFBLEdBQVMsQ0FBckM7UUFDWCxRQUFBLEdBQVcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixNQUFBLEdBQVMsQ0FBckM7UUFFWCxJQUFHLElBQUEsR0FBTyxJQUFWO1VBQ0MsT0FBQSxHQUFVLENBQUMsSUFBQSxHQUFPLFFBQVIsQ0FBQSxHQUFvQixDQUFDLElBQUEsR0FBTyxRQUFSO1VBQzlCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQVEsQ0FBQSxNQUFBLENBQXZCO1VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFULENBQXFCLE9BQVEsQ0FBQSxNQUFBLEdBQVMsQ0FBVCxDQUE3QixFQUEwQyxPQUFRLENBQUEsTUFBQSxDQUFsRCxFQUEyRCxPQUEzRCxDQUFmO1VBQ0EsTUFBQSxJQUFVLEVBSlg7U0FBQSxNQUtLLElBQUcsSUFBQSxHQUFPLElBQVY7VUFDSixPQUFBLEdBQVUsQ0FBQyxJQUFBLEdBQU8sUUFBUixDQUFBLEdBQW9CLENBQUMsSUFBQSxHQUFPLFFBQVI7VUFDOUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFULENBQXFCLE9BQVEsQ0FBQSxNQUFBLEdBQVMsQ0FBVCxDQUE3QixFQUEwQyxPQUFRLENBQUEsTUFBQSxDQUFsRCxFQUEyRCxPQUEzRCxDQUFmO1VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBUSxDQUFBLE1BQUEsQ0FBdkI7VUFDQSxNQUFBLElBQVUsRUFKTjtTQUFBLE1BQUE7VUFNSixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxPQUFRLENBQUEsTUFBQSxDQUF2QjtVQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQVEsQ0FBQSxNQUFBLENBQXZCO1VBQ0EsTUFBQSxJQUFVO1VBQ1YsTUFBQSxJQUFVLEVBVE47O01BWE47QUFzQkEsV0FBUyw2RkFBVDtRQUNDLElBQUcsaUNBQUg7VUFDQyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUF0QixDQUEwQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQXZDLEVBQTBDLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBdkQsRUFERDtTQUFBLE1BQUE7VUFHQyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQW5CLEdBQTRCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQXRCLEVBQXlCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBdEMsRUFIN0I7O0FBREQ7TUFNQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBekM7UUFDQyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFuQixDQUEwQixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQXBDLEVBREQ7O2FBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLGFBQWxCLEVBQWlDLElBQUMsQ0FBQSxRQUFsQztJQXhDTzs7Ozs7QUFoQlQiLCJmaWxlIjoibW9ycGgvUG9seWxpbmVNb3JwaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgcG9seWxpbmUgbW9ycGhcclxuXHJcbmNsYXNzIEJ1LlBvbHlsaW5lTW9ycGhcclxuXHJcblx0Y29uc3RydWN0b3I6IChAcG9seWxpbmVBLCBAcG9seWxpbmVCKSAtPlxyXG5cdFx0QHR5cGUgPSAnUG9seWxpbmVNb3JwaCdcclxuXHRcdEBwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZSgpXHJcblxyXG5cdFx0QGhQb2ludHNBID0gW11cclxuXHRcdEBoUG9pbnRzQiA9IFtdXHJcblxyXG5cdFx0QHVwZGF0ZSgpXHJcblxyXG5cdHNldFRpbWU6ICh0aW1lKSAtPlxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEBoUG9pbnRzQS5sZW5ndGhdXHJcblx0XHRcdEJ1LlBvaW50LmludGVycG9sYXRlKEBoUG9pbnRzQVtpXSwgQGhQb2ludHNCW2ldLCB0aW1lLCBAcG9seWxpbmUudmVydGljZXNbaV0pXHJcblx0XHRAcG9seWxpbmUudHJpZ2dlciAncG9pbnRDaGFuZ2UnLCBAcG9seWxpbmVcclxuXHJcblx0dXBkYXRlOiA9PlxyXG5cdFx0QGhQb2ludHNBID0gW11cclxuXHRcdEBoUG9pbnRzQiA9IFtdXHJcblxyXG5cdFx0cG9pbnRzQSA9IEBwb2x5bGluZUEudmVydGljZXNcclxuXHRcdHBvaW50c0IgPSBAcG9seWxpbmVCLnZlcnRpY2VzXHJcblxyXG5cdFx0aW5kZXhBID0gMFxyXG5cdFx0aW5kZXhCID0gMFxyXG5cclxuXHRcdHdoaWxlIGluZGV4QSA8IHBvaW50c0EubGVuZ3RoIGFuZCBpbmRleEIgPCBwb2ludHNCLmxlbmd0aFxyXG5cdFx0XHRwb3NBID0gQHBvbHlsaW5lQS5nZXROb3JtYWxpemVkUG9zKGluZGV4QSlcclxuXHRcdFx0cG9zQiA9IEBwb2x5bGluZUIuZ2V0Tm9ybWFsaXplZFBvcyhpbmRleEIpXHJcblx0XHRcdHBvc0FQcmV2ID0gQHBvbHlsaW5lQS5nZXROb3JtYWxpemVkUG9zKGluZGV4QSAtIDEpXHJcblx0XHRcdHBvc0JQcmV2ID0gQHBvbHlsaW5lQi5nZXROb3JtYWxpemVkUG9zKGluZGV4QiAtIDEpXHJcblxyXG5cdFx0XHRpZiBwb3NBIDwgcG9zQlxyXG5cdFx0XHRcdHNlY1Bvc0IgPSAocG9zQSAtIHBvc0JQcmV2KSAvIChwb3NCIC0gcG9zQlByZXYpXHJcblx0XHRcdFx0QGhQb2ludHNBLnB1c2ggcG9pbnRzQVtpbmRleEFdXHJcblx0XHRcdFx0QGhQb2ludHNCLnB1c2ggQnUuUG9pbnQuaW50ZXJwb2xhdGUocG9pbnRzQltpbmRleEIgLSAxXSwgcG9pbnRzQltpbmRleEJdLCBzZWNQb3NCKVxyXG5cdFx0XHRcdGluZGV4QSArPSAxXHJcblx0XHRcdGVsc2UgaWYgcG9zQSA+IHBvc0JcclxuXHRcdFx0XHRzZWNQb3NBID0gKHBvc0IgLSBwb3NBUHJldikgLyAocG9zQSAtIHBvc0FQcmV2KVxyXG5cdFx0XHRcdEBoUG9pbnRzQS5wdXNoIEJ1LlBvaW50LmludGVycG9sYXRlKHBvaW50c0FbaW5kZXhBIC0gMV0sIHBvaW50c0FbaW5kZXhBXSwgc2VjUG9zQSlcclxuXHRcdFx0XHRAaFBvaW50c0IucHVzaCBwb2ludHNCW2luZGV4Ql1cclxuXHRcdFx0XHRpbmRleEIgKz0gMVxyXG5cdFx0XHRlbHNlICMgcG9zQSA9PSBwb3NCXHJcblx0XHRcdFx0QGhQb2ludHNBLnB1c2ggcG9pbnRzQVtpbmRleEFdXHJcblx0XHRcdFx0QGhQb2ludHNCLnB1c2ggcG9pbnRzQltpbmRleEJdXHJcblx0XHRcdFx0aW5kZXhBICs9IDFcclxuXHRcdFx0XHRpbmRleEIgKz0gMVxyXG5cclxuXHRcdGZvciBpIGluIFsgMCAuLi4gQGhQb2ludHNBLmxlbmd0aCBdXHJcblx0XHRcdGlmIEBwb2x5bGluZS52ZXJ0aWNlc1tpXT9cclxuXHRcdFx0XHRAcG9seWxpbmUudmVydGljZXNbaV0uc2V0IEBoUG9pbnRzQVtpXS54LCBAaFBvaW50c0FbaV0ueVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QHBvbHlsaW5lLnZlcnRpY2VzW2ldID0gbmV3IEJ1LlBvaW50KEBoUG9pbnRzQVtpXS54LCBAaFBvaW50c0FbaV0ueSlcclxuXHJcblx0XHRpZiBAcG9seWxpbmUudmVydGljZXMubGVuZ3RoIDwgQGhQb2ludHNBLmxlbmd0aFxyXG5cdFx0XHRAcG9seWxpbmUudmVydGljZXMuc3BsaWNlIEBoUG9pbnRzQS5sZW5ndGhcclxuXHRcdEBwb2x5bGluZS50cmlnZ2VyICdwb2ludENoYW5nZScsIEBwb2x5bGluZVxyXG4iXX0=

// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

Bu.Renderer = (function() {
  function Renderer() {
    this.drawShape = bind(this.drawShape, this);
    this.drawShapes = bind(this.drawShapes, this);
    var onResize, options, ref, tick;
    Bu.Event.apply(this);
    this.type = 'Renderer';
    options = Bu.combineOptions(arguments, {
      width: 800,
      height: 600,
      fps: 60,
      fillParent: false,
      showKeyPoints: false,
      border: false
    });
    this.width = options.width;
    this.height = options.height;
    this.fps = options.fps;
    this.container = options.container;
    this.fillParent = options.fillParent;
    this.isShowKeyPoints = options.showKeyPoints;
    this.tickCount = 0;
    this.isRunning = false;
    this.pixelRatio = (typeof window !== "undefined" && window !== null ? window.devicePixelRatio : void 0) || 1;
    this.dom = document.createElement('canvas');
    this.context = this.dom.getContext('2d');
    this.context.textBaseline = 'top';
    if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
      this.clipMeter = new ClipMeter();
    }
    this.shapes = [];
    if (!this.fillParent) {
      this.dom.style.width = Math.floor(this.width / this.pixelRatio) + 'px';
      this.dom.style.height = Math.floor(this.height / this.pixelRatio) + 'px';
      this.dom.width = this.width;
      this.dom.height = this.height;
    }
    if ((options.border != null) && options.border) {
      this.dom.style.border = 'solid 1px gray';
    }
    this.dom.style.cursor = 'crosshair';
    this.dom.style.boxSizing = 'content-box';
    this.dom.style.background = '#eee';
    this.dom.oncontextmenu = function() {
      return false;
    };
    window.canvas = this.dom;
    if ((ref = Bu.animationRunner) != null) {
      ref.hookUp(this);
    }
    onResize = (function(_this) {
      return function() {
        var canvasRatio, containerRatio, height, width;
        canvasRatio = _this.dom.height / _this.dom.width;
        containerRatio = _this.container.clientHeight / _this.container.clientWidth;
        if (containerRatio < canvasRatio) {
          height = _this.container.clientHeight;
          width = height / containerRatio;
        } else {
          width = _this.container.clientWidth;
          height = width * containerRatio;
        }
        _this.width = _this.dom.width = width * _this.pixelRatio;
        _this.height = _this.dom.height = height * _this.pixelRatio;
        _this.dom.style.width = width + 'px';
        _this.dom.style.height = height + 'px';
        return _this.render();
      };
    })(this);
    if (this.fillParent) {
      window.addEventListener('resize', onResize);
      this.dom.addEventListener('DOMNodeInserted', onResize);
    }
    tick = (function(_this) {
      return function() {
        if (_this.isRunning) {
          if (_this.clipMeter != null) {
            _this.clipMeter.start();
          }
          _this.render();
          _this.trigger('update', {
            'tickCount': _this.tickCount
          });
          _this.tickCount += 1;
          if (_this.clipMeter != null) {
            _this.clipMeter.tick();
          }
        }
        return requestAnimationFrame(tick);
      };
    })(this);
    tick();
    if (this.container != null) {
      if (typeof this.container === 'string') {
        this.container = document.querySelector(this.container);
      }
      setTimeout((function(_this) {
        return function() {
          return _this.container.appendChild(_this.dom);
        };
      })(this), 100);
    }
    this.isRunning = true;
  }

  Renderer.prototype.pause = function() {
    return this.isRunning = false;
  };

  Renderer.prototype["continue"] = function() {
    return this.isRunning = true;
  };

  Renderer.prototype.toggle = function() {
    return this.isRunning = !this.isRunning;
  };

  Renderer.prototype.processArgs = function(e) {
    return {
      offsetX: e.offsetX * this.pixelRatio,
      offsetY: e.offsetY * this.pixelRatio,
      button: e.button
    };
  };

  Renderer.prototype.append = function(shape) {
    var j, len1, s;
    if (shape instanceof Array) {
      for (j = 0, len1 = shape.length; j < len1; j++) {
        s = shape[j];
        this.shapes.push(s);
      }
    } else {
      this.shapes.push(shape);
    }
    return this;
  };

  Renderer.prototype.render = function() {
    this.clearCanvas();
    this.drawShapes(this.shapes);
    return this;
  };

  Renderer.prototype.clearCanvas = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    return this;
  };

  Renderer.prototype.drawShapes = function(shapes) {
    var j, len1, shape;
    if (shapes != null) {
      for (j = 0, len1 = shapes.length; j < len1; j++) {
        shape = shapes[j];
        this.context.save();
        this.drawShape(shape);
        this.context.restore();
      }
    }
    return this;
  };

  Renderer.prototype.drawShape = function(shape) {
    var sx, sy;
    if (!shape.visible) {
      return this;
    }
    this.context.translate(shape.translate.x, shape.translate.y);
    this.context.rotate(shape.rotation);
    if (typeof shape.scale === 'number') {
      sx = shape.scale;
      sy = shape.scale;
    } else {
      sx = shape.scale.x;
      sy = shape.scale.y;
    }
    if (sx / sy > 100 || sx / sy < 0.01) {
      if (Math.abs(sx) < 0.02) {
        sx = 0;
      }
      if (Math.abs(sy) < 0.02) {
        sy = 0;
      }
    }
    this.context.scale(sx, sy);
    this.context.globalAlpha = shape.opacity;
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      if (shape.lineCap != null) {
        this.context.lineCap = shape.lineCap;
      }
      if (shape.lineJoin != null) {
        this.context.lineJoin = shape.lineJoin;
      }
    }
    switch (shape.type) {
      case 'Point':
        this.drawPoint(shape);
        break;
      case 'Line':
        this.drawLine(shape);
        break;
      case 'Circle':
        this.drawCircle(shape);
        break;
      case 'Triangle':
        this.drawTriangle(shape);
        break;
      case 'Rectangle':
        this.drawRectangle(shape);
        break;
      case 'Fan':
        this.drawFan(shape);
        break;
      case 'Bow':
        this.drawBow(shape);
        break;
      case 'Polygon':
        this.drawPolygon(shape);
        break;
      case 'Polyline':
        this.drawPolyline(shape);
        break;
      case 'Spline':
        this.drawSpline(shape);
        break;
      case 'PointText':
        this.drawPointText(shape);
        break;
      case 'Image':
        this.drawImage(shape);
        break;
      case 'Bounds':
        this.drawBounds(shape);
        break;
      default:
        console.log('drawShapes(): unknown shape: ', shape);
    }
    if (shape.children != null) {
      this.drawShapes(shape.children);
    }
    if (this.isShowKeyPoints) {
      this.drawShapes(shape.keyPoints);
    }
    return this;
  };

  Renderer.prototype.drawPoint = function(shape) {
    this.context.globalAlpha = shape.opacity;
    this.context.beginPath();
    this.context.arc(shape.x, shape.y, Bu.POINT_RENDER_SIZE, 0, Math.PI * 2);
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawLine = function(shape) {
    if (shape.strokeStyle != null) {
      this.context.beginPath();
      if (shape.dashStyle) {
        this.context.dashedLine(shape.points[0].x, shape.points[0].y, shape.points[1].x, shape.points[1].y, shape.dashStyle, shape.dashOffset);
      } else {
        this.context.moveTo(shape.points[0].x, shape.points[0].y);
        this.context.lineTo(shape.points[1].x, shape.points[1].y);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawCircle = function(shape) {
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      if (shape.dashStyle) {
        this.context.beginPath();
        this.context.dashedArc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2, shape.dashStyle, shape.dashOffset);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawTriangle = function(shape) {
    var pts;
    this.context.beginPath();
    this.context.lineTo(shape.points[0].x, shape.points[0].y);
    this.context.lineTo(shape.points[1].x, shape.points[1].y);
    this.context.lineTo(shape.points[2].x, shape.points[2].y);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      if (shape.dashStyle) {
        this.context.beginPath();
        pts = shape.points;
        this.context.dashedLine(pts[0].x, pts[0].y, pts[1].x, pts[1].y, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(pts[1].x, pts[1].y, pts[2].x, pts[2].y, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(pts[2].x, pts[2].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashOffset);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawRectangle = function(shape) {
    var xL, xR, yB, yT;
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fillRect(shape.position.x, shape.position.y, shape.size.width, shape.size.height);
    }
    if (shape.strokeStyle != null) {
      if (!shape.dashStyle) {
        this.context.strokeRect(shape.position.x, shape.position.y, shape.size.width, shape.size.height);
      } else {
        this.context.beginPath();
        xL = shape.position.x;
        xR = shape.pointRB.x;
        yT = shape.position.y;
        yB = shape.pointRB.y;
        this.context.dashedLine(xL, yT, xR, yT, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(xR, yT, xR, yB, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(xR, yB, xL, yB, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(xL, yB, xL, yT, shape.dashStyle, shape.dashOffset);
        this.context.stroke();
      }
    }
    return this;
  };

  Renderer.prototype.drawFan = function(shape) {
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
    this.context.lineTo(shape.cx, shape.cy);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      if (shape.dashStyle) {
        this.context.beginPath();
        this.context.dashedArc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(shape.cx, shape.cy, shape.cx + shape.radius * Math.cos(shape.aFrom), shape.cy + shape.radius * Math.sin(shape.aFrom), shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(shape.cx + shape.radius * Math.cos(shape.aTo), shape.cy + shape.radius * Math.sin(shape.aTo), shape.cx, shape.cy, shape.dashStyle, shape.dashOffset);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawBow = function(shape) {
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      if (shape.dashStyle) {
        this.context.beginPath();
        this.context.dashedArc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo, shape.dashStyle, shape.dashOffset);
        this.context.dashedLine(shape.string.points[1].x, shape.string.points[1].y, shape.string.points[0].x, shape.string.points[0].y, shape.dashStyle, shape.dashOffset);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawPolygon = function(shape) {
    var i, j, k, len, len1, point, pts, ref, ref1;
    this.context.beginPath();
    ref = shape.vertices;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      point = ref[j];
      this.context.lineTo(point.x, point.y);
    }
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      len = shape.vertices.length;
      if (shape.dashStyle && len > 0) {
        this.context.beginPath();
        pts = shape.vertices;
        for (i = k = 0, ref1 = len - 1; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          this.context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashOffset);
        }
        this.context.dashedLine(pts[len - 1].x, pts[len - 1].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashOffset);
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawPolyline = function(shape) {
    var i, j, k, len1, point, pts, ref, ref1;
    if (shape.strokeStyle != null) {
      this.context.beginPath();
      if (!shape.dashStyle) {
        ref = shape.vertices;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          point = ref[j];
          this.context.lineTo(point.x, point.y);
        }
      } else {
        pts = shape.vertices;
        for (i = k = 0, ref1 = pts.length - 1; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          this.context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashOffset);
        }
      }
      this.context.stroke();
    }
    return this;
  };

  Renderer.prototype.drawSpline = function(shape) {
    var i, j, len, ref;
    if (shape.strokeStyle != null) {
      this.context.beginPath();
      len = shape.vertices.length;
      if (len === 2) {
        this.context.moveTo(shape.vertices[0].x, shape.vertices[0].y);
        this.context.lineTo(shape.vertices[1].x, shape.vertices[1].y);
      } else if (len > 2) {
        this.context.moveTo(shape.vertices[0].x, shape.vertices[0].y);
        for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          this.context.bezierCurveTo(shape.controlPointsBehind[i - 1].x, shape.controlPointsBehind[i - 1].y, shape.controlPointsAhead[i].x, shape.controlPointsAhead[i].y, shape.vertices[i].x, shape.vertices[i].y);
        }
      }
      if (shape.dashStyle && (this.context.setLineDash != null)) {
        this.context.setLineDash(shape.dashStyle);
        this.context.stroke();
        this.context.setLineDash([]);
      } else {
        this.context.stroke();
      }
    }
    return this;
  };

  Renderer.prototype.drawPointText = function(shape) {
    this.context.textAlign = shape.textAlign;
    this.context.textBaseline = shape.textBaseline;
    this.context.font = shape.font;
    if (shape.strokeStyle != null) {
      this.context.strokeText(shape.text, shape.x, shape.y);
    }
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fillText(shape.text, shape.x, shape.y);
    }
    return this;
  };

  Renderer.prototype.drawImage = function(shape) {
    var dx, dy, h, w;
    if (shape.loaded) {
      w = shape.size.width;
      h = shape.size.height;
      dx = -w * shape.pivot.x;
      dy = -h * shape.pivot.y;
      this.context.drawImage(shape.image, dx, dy, w, h);
    }
    return this;
  };

  Renderer.prototype.drawBounds = function(bounds) {
    this.context.strokeStyle = bounds.strokeStyle;
    this.context.beginPath();
    this.context.dashedLine(bounds.x1, bounds.y1, bounds.x2, bounds.y1, bounds.dashStyle, bounds.dashOffset);
    this.context.dashedLine(bounds.x2, bounds.y1, bounds.x2, bounds.y2, bounds.dashStyle, bounds.dashOffset);
    this.context.dashedLine(bounds.x2, bounds.y2, bounds.x1, bounds.y2, bounds.dashStyle, bounds.dashOffset);
    this.context.dashedLine(bounds.x1, bounds.y2, bounds.x1, bounds.y1, bounds.dashStyle, bounds.dashOffset);
    this.context.stroke();
    return this;
  };

  return Renderer;

})();

((function(_this) {
  return function() {
    var CP;
    CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    CP.dashedLine = function(x, y, x2, y2, dashStyle, offset) {
      var dc, di, draw, dx, dy, i, j, len, len1, lenU, rot;
      if (dashStyle == null) {
        dashStyle = Bu.DEFAULT_DASH_STYLE;
      }
      if (offset == null) {
        offset = 0;
      }
      this.save();
      dx = x2 - x;
      dy = y2 - y;
      len = Bu.bevel(dx, dy);
      rot = Math.atan2(dy, dx);
      this.translate(x, y);
      this.rotate(rot);
      dc = dashStyle.length;
      lenU = 0;
      for (j = 0, len1 = dashStyle.length; j < len1; j++) {
        i = dashStyle[j];
        lenU += i;
      }
      offset %= lenU;
      di = 0;
      x = offset;
      draw = false;
      while (x > 0) {
        di -= 1;
        x -= dashStyle[modulo(di, dc)];
        if (x < 0) {
          x = 0;
        }
        if (draw) {
          this.lineTo(x, 0);
        } else {
          this.moveTo(x, 0);
        }
        draw = !draw;
      }
      di = 0;
      x = offset;
      draw = true;
      this.moveTo(offset, 0);
      while (len > x) {
        x += dashStyle[di % dc];
        if (x > len) {
          x = len;
        }
        if (draw) {
          this.lineTo(x, 0);
        } else {
          this.moveTo(x, 0);
        }
        draw = !draw;
        di += 1;
      }
      this.restore();
      return this;
    };
    return CP.dashedArc = function(x, y, radius, startAngle, endAngle, dashStyle, offset) {
      var arcStyle, dc, di, draw, i, j, len, len1, lenU, xAngle;
      if (dashStyle == null) {
        dashStyle = Bu.DEFAULT_DASH_STYLE;
      }
      if (offset == null) {
        offset = 0;
      }
      arcStyle = dashStyle.map(function(x) {
        return x / radius;
      });
      offset /= radius;
      len = Math.abs(endAngle - startAngle);
      dc = arcStyle.length;
      lenU = 0;
      for (j = 0, len1 = arcStyle.length; j < len1; j++) {
        i = arcStyle[j];
        lenU += i;
      }
      offset %= lenU;
      di = 0;
      xAngle = offset;
      draw = false;
      while (xAngle > 0) {
        di -= 1;
        xAngle -= arcStyle[modulo(di, dc)];
        if (xAngle < 0) {
          xAngle = 0;
        }
        if (draw) {
          this.lineTo(x + radius * Math.cos(startAngle + xAngle), y + radius * Math.sin(startAngle + xAngle));
        } else {
          this.moveTo(x + radius * Math.cos(startAngle + xAngle), y + radius * Math.sin(startAngle + xAngle));
        }
        draw = !draw;
      }
      di = 0;
      xAngle = offset;
      draw = true;
      this.moveTo(x + radius * Math.cos(startAngle + offset), y + radius * Math.sin(startAngle + offset));
      while (len > xAngle) {
        xAngle += arcStyle[di % dc];
        if (xAngle > len) {
          xAngle = len;
        }
        if (draw) {
          this.lineTo(x + radius * Math.cos(startAngle + xAngle), y + radius * Math.sin(startAngle + xAngle));
        } else {
          this.moveTo(x + radius * Math.cos(startAngle + xAngle), y + radius * Math.sin(startAngle + xAngle));
        }
        draw = !draw;
        di += 1;
      }
      return this;
    };
  };
})(this))();

//# sourceMappingURL=Renderer.js.map

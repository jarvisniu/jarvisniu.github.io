// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Bu.Renderer = (function() {
  function Renderer() {
    this.drawShape = bind(this.drawShape, this);
    this.drawShapes = bind(this.drawShapes, this);
    this.toggle = bind(this.toggle, this);
    this["continue"] = bind(this["continue"], this);
    this.pause = bind(this.pause, this);
    var clearCanvas, onResize, options, tick, tickCount;
    Za.EventListenerPattern.apply(this);
    this.type = 'Renderer';
    options = Bu.combineOptions(arguments, {
      width: 800,
      height: 600,
      fps: 60,
      fillParent: false,
      border: true
    });
    this.width = options.width;
    this.height = options.height;
    this.fps = options.fps;
    this.container = options.container;
    this.isDrawKeyPoints = true;
    this.dom = document.createElement('canvas');
    this.context = this.dom.getContext('2d');
    this.context.textBaseline = 'top';
    if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
      this.clipMeter = new ClipMeter();
    }
    this.shapes = [];
    if (!options.fillParent) {
      this.dom.width = this.width;
      this.dom.height = this.height;
      this.dom.style.width = this.width + 'px';
      this.dom.style.height = this.height + 'px';
    }
    if ((options.border != null) && options.border) {
      this.dom.style.border = 'solid 1px gray';
    }
    this.dom.style.cursor = 'crosshair';
    this.dom.style.background = '#eee';
    this.dom.oncontextmenu = function() {
      return false;
    };
    window.canvas = this.dom;
    onResize = (function(_this) {
      return function(e) {
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
        _this.width = _this.dom.width = width;
        _this.height = _this.dom.height = height;
        _this.dom.style.width = width + 'px';
        return _this.dom.style.height = height + 'px';
      };
    })(this);
    window.addEventListener('resize', onResize);
    this.dom.addEventListener('DOMNodeInserted', onResize);
    tick = (function(_this) {
      return function() {
        if (!_this.isRunning) {
          return;
        }
        if (_this.clipMeter != null) {
          _this.clipMeter.start();
        }
        tickCount += 1;
        _this.triggerEvent('update', {
          'tickCount': tickCount
        });
        clearCanvas();
        _this.drawShapes(_this.shapes);
        if (_this.clipMeter != null) {
          return _this.clipMeter.tick();
        }
      };
    })(this);
    setInterval(tick, 1000 / this.fps);
    clearCanvas = (function(_this) {
      return function() {
        return _this.context.clearRect(0, 0, _this.width, _this.height);
      };
    })(this);
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
    tickCount = 0;
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

  Renderer.prototype.append = function(shape) {
    return this.shapes.push(shape);
  };

  Renderer.prototype.drawShapes = function(shapes) {
    var j, len1, shape;
    if (shapes != null) {
      for (j = 0, len1 = shapes.length; j < len1; j++) {
        shape = shapes[j];
        this.drawShape(shape);
      }
    }
    return this;
  };

  Renderer.prototype.drawShape = function(shape) {
    if (!shape.visible) {
      return this;
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
    if (this.isDrawKeyPoints) {
      this.drawShapes(shape.keyPoints);
    }
    return this;
  };

  Renderer.prototype.drawPoint = function(shape) {
    this.context.globalAlpha = shape.opacity;
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fillRect(shape.x - Bu.POINT_RENDER_SIZE / 2, shape.y - Bu.POINT_RENDER_SIZE / 2, Bu.POINT_RENDER_SIZE, Bu.POINT_RENDER_SIZE);
    }
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      return this.context.strokeRect(shape.x - Bu.POINT_RENDER_SIZE / 2, shape.y - Bu.POINT_RENDER_SIZE / 2, Bu.POINT_RENDER_SIZE, Bu.POINT_RENDER_SIZE);
    }
  };

  Renderer.prototype.drawLine = function(shape) {
    this.context.globalAlpha = shape.opacity;
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      if (shape.dashStyle) {
        this.context.dashedLine(shape.points[0].x, shape.points[0].y, shape.points[1].x, shape.points[1].y, shape.dashStyle, shape.dashDelta);
      } else {
        this.context.beginPath();
        this.context.lineTo(shape.points[0].x, shape.points[0].y);
        this.context.lineTo(shape.points[1].x, shape.points[1].y);
        this.context.closePath();
      }
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawCircle = function(shape) {
    this.context.globalAlpha = shape.opacity;
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawTriangle = function(shape) {
    var pts;
    this.context.globalAlpha = shape.opacity;
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
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      if (shape.dashStyle) {
        this.context.beginPath();
        pts = shape.points;
        this.context.dashedLine(pts[0].x, pts[0].y, pts[1].x, pts[1].y, shape.dashStyle, shape.dashDelta);
        this.context.dashedLine(pts[1].x, pts[1].y, pts[2].x, pts[2].y, shape.dashStyle, shape.dashDelta);
        this.context.dashedLine(pts[2].x, pts[2].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashDelta);
      }
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawRectangle = function(shape) {
    var xL, xR, yB, yT;
    this.context.globalAlpha = shape.opacity;
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fillRect(shape.position.x, shape.position.y, shape.size.width, shape.size.height);
    }
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      if (!shape.dashStyle) {
        return this.context.strokeRect(shape.position.x, shape.position.y, shape.size.width, shape.size.height);
      } else {
        this.context.beginPath();
        xL = shape.position.x;
        xR = shape.pointRB.x;
        yT = shape.position.y;
        yB = shape.pointRB.y;
        this.context.dashedLine(xL, yT, xR, yT, shape.dashStyle, shape.dashDelta);
        this.context.dashedLine(xR, yT, xR, yB, shape.dashStyle, shape.dashDelta);
        this.context.dashedLine(xR, yB, xL, yB, shape.dashStyle, shape.dashDelta);
        this.context.dashedLine(xL, yB, xL, yT, shape.dashStyle, shape.dashDelta);
        return this.context.stroke();
      }
    }
  };

  Renderer.prototype.drawFan = function(shape) {
    this.context.globalAlpha = shape.opacity;
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
    this.context.lineTo(shape.cx, shape.cy);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawBow = function(shape) {
    this.context.globalAlpha = shape.opacity;
    this.context.beginPath();
    this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
    this.context.closePath();
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      this.context.fill();
    }
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawPolygon = function(shape) {
    var i, j, k, len, len1, point, pts, ref, ref1;
    this.context.globalAlpha = shape.opacity;
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
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      len = shape.vertices.length;
      if (shape.dashStyle && len > 0) {
        this.context.beginPath();
        pts = shape.vertices;
        for (i = k = 0, ref1 = len - 1; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          this.context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashDelta);
        }
        this.context.dashedLine(pts[len - 1].x, pts[len - 1].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashDelta);
        this.context.stroke();
      }
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawPolyline = function(shape) {
    var i, j, k, len1, point, pts, ref, ref1;
    if (shape.strokeStyle != null) {
      this.context.globalAlpha = shape.opacity;
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
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
          this.context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashDelta);
        }
      }
      return this.context.stroke();
    }
  };

  Renderer.prototype.drawPointText = function(shape) {
    this.context.globalAlpha = shape.opacity;
    this.context.textAlign = shape.textAlign;
    this.context.textBaseline = shape.textBaseline;
    this.context.font = shape.font;
    if (shape.strokeStyle != null) {
      this.context.strokeStyle = shape.strokeStyle;
      this.context.lineWidth = shape.lineWidth;
      this.context.strokeText(shape.text, shape.x, shape.y);
    }
    if (shape.fillStyle != null) {
      this.context.fillStyle = shape.fillStyle;
      return this.context.fillText(shape.text, shape.x, shape.y);
    }
  };

  Renderer.prototype.drawImage = function(shape) {
    var dx, dy, h, w;
    if (shape.loaded) {
      this.context.save();
      this.context.globalAlpha = shape.opacity;
      w = shape.size.width * shape.scale.x;
      h = shape.size.height * shape.scale.y;
      dx = -w * shape.pivot.x;
      dy = -h * shape.pivot.y;
      this.context.translate(shape.position.x, shape.position.y);
      this.context.rotate(shape.rotation);
      this.context.drawImage(shape.image, dx, dy, w, h);
      return this.context.restore();
    }
  };

  Renderer.prototype.drawBounds = function(bounds) {
    this.context.strokeStyle = bounds.strokeStyle;
    this.context.beginPath();
    this.context.dashedLine(bounds.x1, bounds.y1, bounds.x2, bounds.y1, bounds.dashStyle, bounds.dashDelta);
    this.context.dashedLine(bounds.x2, bounds.y1, bounds.x2, bounds.y2, bounds.dashStyle, bounds.dashDelta);
    this.context.dashedLine(bounds.x2, bounds.y2, bounds.x1, bounds.y2, bounds.dashStyle, bounds.dashDelta);
    this.context.dashedLine(bounds.x1, bounds.y2, bounds.x1, bounds.y1, bounds.dashStyle, bounds.dashDelta);
    return this.context.stroke();
  };

  return Renderer;

})();

((function(_this) {
  return function() {
    var CP;
    CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (CP.lineTo != null) {
      return CP.dashedLine = function(x, y, x2, y2, da, delta) {
        var dc, di, draw, dx, dy, i, j, len, len1, lenU, rot;
        if (da == null) {
          da = Bu.DEFAULT_DASH_STYLE;
        }
        if (delta == null) {
          delta = 0;
        }
        this.save();
        dx = x2 - x;
        dy = y2 - y;
        len = Math.bevel(dx, dy);
        rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.rotate(rot);
        dc = da.length;
        di = 0;
        draw = true;
        lenU = 0;
        for (j = 0, len1 = da.length; j < len1; j++) {
          i = da[j];
          lenU += i;
        }
        delta %= lenU;
        x = delta;
        this.moveTo(0, 0);
        while (len > x) {
          di += 1;
          x += da[di % dc];
          if (x > len) {
            x = len;
          }
          if (draw) {
            this.lineTo(x, 0);
          } else {
            this.moveTo(x, 0);
          }
          draw = !draw;
        }
        this.restore();
        return this;
      };
    }
  };
})(this))();

//# sourceMappingURL=Renderer.js.map

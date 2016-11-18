// Bu.js v0.4.0 - https://github.com/jarvisniu/Bu.js
(function() {
  var base, base1, currentTime, global, lastTime,
    hasProp = {}.hasOwnProperty;

  global = window || this;

  global.Bu = {
    global: global
  };

  Bu.VERSION = '0.4.0';

  Bu.BROWSER_VENDOR_PREFIXES = ['webkit', 'moz', 'ms'];

  Bu.HALF_PI = Math.PI / 2;

  Bu.TWO_PI = Math.PI * 2;

  Bu.DEFAULT_FONT_FAMILY = 'Verdana';

  Bu.DEFAULT_FONT_SIZE = 11;

  Bu.DEFAULT_FONT = '11px Verdana';

  Bu.POINT_RENDER_SIZE = 2.25;

  Bu.POINT_LABEL_OFFSET = 5;

  Bu.DEFAULT_SPLINE_SMOOTH = 0.25;

  Bu.DEFAULT_NEAR_DIST = 5;

  Bu.MOUSE = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    MIDDLE: 4
  };

  Bu.average = function() {
    var i, j, len, ns, sum;
    ns = arguments;
    if (typeof arguments[0] === 'object') {
      ns = arguments[0];
    }
    sum = 0;
    for (j = 0, len = ns.length; j < len; j++) {
      i = ns[j];
      sum += i;
    }
    return sum / ns.length;
  };

  Bu.bevel = function(x, y) {
    return Math.sqrt(x * x + y * y);
  };

  Bu.clamp = function(x, min, max) {
    if (x < min) {
      x = min;
    }
    if (x > max) {
      x = max;
    }
    return x;
  };

  Bu.rand = function(from, to) {
    if (to == null) {
      to = from;
      from = 0;
    }
    return Math.random() * (to - from) + from;
  };

  Bu.r2d = function(r) {
    return (r * 180 / Math.PI).toFixed(1);
  };

  Bu.d2r = function(r) {
    return r * Math.PI / 180;
  };

  Bu.now = Bu.global.performance != null ? function() {
    return Bu.global.performance.now();
  } : function() {
    return Date.now();
  };

  Bu.combineOptions = function(args, defaultOptions) {
    var givenOptions, i;
    if (defaultOptions == null) {
      defaultOptions = {};
    }
    givenOptions = args[args.length - 1];
    if (Bu.isPlainObject(givenOptions)) {
      for (i in givenOptions) {
        if (givenOptions[i] != null) {
          defaultOptions[i] = givenOptions[i];
        }
      }
    }
    return defaultOptions;
  };

  Bu.isNumber = function(o) {
    return typeof o === 'number';
  };

  Bu.isString = function(o) {
    return typeof o === 'string';
  };

  Bu.isPlainObject = function(o) {
    return o instanceof Object && o.constructor.name === 'Object';
  };

  Bu.isFunction = function(o) {
    return o instanceof Object && o.constructor.name === 'Function';
  };

  Bu.isArray = function(o) {
    return o instanceof Array;
  };

  Bu.clone = function(target) {
    var clone, i;
    if (typeof target !== 'object' || target === null || Bu.isFunction(target)) {
      return target;
    } else {
      if (target.clone != null) {
        return target.clone();
      }
      if (Bu.isArray(target)) {
        clone = [];
      } else if (Bu.isPlainObject(target)) {
        clone = {};
      } else {
        clone = Object.create(target.constructor.prototype);
      }
      for (i in target) {
        if (!hasProp.call(target, i)) continue;
        clone[i] = Bu.clone(target[i]);
      }
      return clone;
    }
  };

  Bu.data = function(key, value) {
    if (value != null) {
      return localStorage['Bu.' + key] = JSON.stringify(value);
    } else {
      value = localStorage['Bu.' + key];
      if (value != null) {
        return JSON.parse(value);
      } else {
        return null;
      }
    }
  };

  Bu.ready = function(cb, context, args) {
    if (document.readyState === 'complete') {
      return cb.apply(context, args);
    } else {
      return document.addEventListener('DOMContentLoaded', function() {
        return cb.apply(context, args);
      });
    }
  };

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  Function.prototype.throttle = function(limit) {
    var currTime, lastTime;
    if (limit == null) {
      limit = 0.5;
    }
    currTime = 0;
    lastTime = 0;
    return (function(_this) {
      return function() {
        currTime = Date.now();
        if (currTime - lastTime > limit * 1000) {
          _this.apply(null, arguments);
          return lastTime = currTime;
        }
      };
    })(this);
  };

  Function.prototype.debounce = function(delay) {
    var args, later, timeout;
    if (delay == null) {
      delay = 0.5;
    }
    args = null;
    timeout = null;
    later = (function(_this) {
      return function() {
        return _this.apply(null, args);
      };
    })(this);
    return function() {
      args = arguments;
      clearTimeout(timeout);
      return timeout = setTimeout(later, delay * 1000);
    };
  };

  (base = Array.prototype).each || (base.each = function(fn) {
    var i;
    i = 0;
    while (i < this.length) {
      fn(this[i]);
      i++;
    }
    return this;
  });

  (base1 = Array.prototype).map || (base1.map = function(fn) {
    var arr, i;
    arr = [];
    i = 0;
    while (i < this.length) {
      arr.push(fn(this[i]));
      i++;
    }
    return this;
  });

  currentTime = Date.now();

  lastTime = Bu.data('version.timestamp');

  if (!((lastTime != null) && currentTime - lastTime < 60 * 1000)) {
    if (typeof console.info === "function") {
      console.info('Bu.js v' + Bu.VERSION + ' - [https://github.com/jarvisniu/Bu.js]');
    }
    Bu.data('version.timestamp', currentTime);
  }

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bu.Bounds = (function() {
    function Bounds(target) {
      this.target = target;
      this.update = bind(this.update, this);
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      this.isEmpty = true;
      this.point1 = new Bu.Vector;
      this.point2 = new Bu.Vector;
      this.update();
      this.bindEvent();
    }

    Bounds.prototype.containsPoint = function(p) {
      return this.x1 < p.x && this.x2 > p.x && this.y1 < p.y && this.y2 > p.y;
    };

    Bounds.prototype.update = function() {
      var i, j, len, len1, ref, ref1, results, results1, v;
      this.clear();
      switch (this.target.type) {
        case 'Line':
        case 'Triangle':
        case 'Rectangle':
          ref = this.target.points;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            v = ref[i];
            results.push(this.expandByPoint(v));
          }
          return results;
          break;
        case 'Circle':
        case 'Bow':
        case 'Fan':
          return this.expandByCircle(this.target);
        case 'Polyline':
        case 'Polygon':
          ref1 = this.target.vertices;
          results1 = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            v = ref1[j];
            results1.push(this.expandByPoint(v));
          }
          return results1;
          break;
        case 'Ellipse':
          this.x1 = -this.target.radiusX;
          this.x2 = this.target.radiusX;
          this.y1 = -this.target.radiusY;
          return this.y2 = this.target.radiusY;
        default:
          return console.warn("Bounds: not support shape type " + this.target.type);
      }
    };

    Bounds.prototype.bindEvent = function() {
      switch (this.target.type) {
        case 'Circle':
        case 'Bow':
        case 'Fan':
          this.target.on('centerChanged', this.update);
          return this.target.on('radiusChanged', this.update);
        case 'Ellipse':
          return this.target.on('changed', this.update);
      }
    };

    Bounds.prototype.clear = function() {
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      this.isEmpty = true;
      return this;
    };

    Bounds.prototype.expandByPoint = function(v) {
      if (this.isEmpty) {
        this.isEmpty = false;
        this.x1 = this.x2 = v.x;
        this.y1 = this.y2 = v.y;
      } else {
        if (v.x < this.x1) {
          this.x1 = v.x;
        }
        if (v.x > this.x2) {
          this.x2 = v.x;
        }
        if (v.y < this.y1) {
          this.y1 = v.y;
        }
        if (v.y > this.y2) {
          this.y2 = v.y;
        }
      }
      return this;
    };

    Bounds.prototype.expandByCircle = function(c) {
      var cp, r;
      cp = c.center;
      r = c.radius;
      if (this.isEmpty) {
        this.isEmpty = false;
        this.x1 = cp.x - r;
        this.x2 = cp.x + r;
        this.y1 = cp.y - r;
        this.y2 = cp.y + r;
      } else {
        if (cp.x - r < this.x1) {
          this.x1 = cp.x - r;
        }
        if (cp.x + r > this.x2) {
          this.x2 = cp.x + r;
        }
        if (cp.y - r < this.y1) {
          this.y1 = cp.y - r;
        }
        if (cp.y + r > this.y2) {
          this.y2 = cp.y + r;
        }
      }
      return this;
    };

    return Bounds;

  })();

}).call(this);

(function() {
  Bu.Color = (function() {
    var CSS3_COLORS, RE_HEX3, RE_HEX6, RE_RGB, RE_RGBA, RE_RGBA_PER, RE_RGB_PER, clampAlpha;

    function Color() {
      var arg;
      this.r = this.g = this.b = 255;
      this.a = 1;
      if (arguments.length === 1) {
        arg = arguments[0];
        if (Bu.isString(arg)) {
          this.parse(arg);
          this.a = clampAlpha(this.a);
        } else if (arg instanceof Bu.Color) {
          this.copy(arg);
        }
      } else {
        this.r = arguments[0];
        this.g = arguments[1];
        this.b = arguments[2];
        this.a = arguments[3] || 1;
      }
    }

    Color.prototype.parse = function(str) {
      var found, hex;
      if (found = str.match(RE_RGBA)) {
        this.r = parseInt(found[1]);
        this.g = parseInt(found[2]);
        this.b = parseInt(found[3]);
        this.a = parseFloat(found[4]);
      } else if (found = str.match(RE_RGB)) {
        this.r = parseInt(found[1]);
        this.g = parseInt(found[2]);
        this.b = parseInt(found[3]);
        this.a = 1;
      } else if (found = str.match(RE_RGBA_PER)) {
        this.r = parseInt(found[1] * 255 / 100);
        this.g = parseInt(found[2] * 255 / 100);
        this.b = parseInt(found[3] * 255 / 100);
        this.a = parseFloat(found[4]);
      } else if (found = str.match(RE_RGB_PER)) {
        this.r = parseInt(found[1] * 255 / 100);
        this.g = parseInt(found[2] * 255 / 100);
        this.b = parseInt(found[3] * 255 / 100);
        this.a = 1;
      } else if (found = str.match(RE_HEX3)) {
        hex = found[1];
        this.r = parseInt(hex[0], 16);
        this.r = this.r * 16 + this.r;
        this.g = parseInt(hex[1], 16);
        this.g = this.g * 16 + this.g;
        this.b = parseInt(hex[2], 16);
        this.b = this.b * 16 + this.b;
        this.a = 1;
      } else if (found = str.match(RE_HEX6)) {
        hex = found[1];
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);
        this.a = 1;
      } else if (CSS3_COLORS[str = str.toLowerCase().trim()] != null) {
        this.r = CSS3_COLORS[str][0];
        this.g = CSS3_COLORS[str][1];
        this.b = CSS3_COLORS[str][2];
        this.a = CSS3_COLORS[str][3];
        if (this.a == null) {
          this.a = 1;
        }
      } else {
        console.error("Bu.Color.parse(\"" + str + "\") error.");
      }
      return this;
    };

    Color.prototype.clone = function() {
      return (new Bu.Color).copy(this);
    };

    Color.prototype.copy = function(color) {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      this.a = color.a;
      return this;
    };

    Color.prototype.setRGB = function(r, g, b) {
      this.r = parseInt(r);
      this.g = parseInt(g);
      this.b = parseInt(b);
      this.a = 1;
      return this;
    };

    Color.prototype.setRGBA = function(r, g, b, a) {
      this.r = parseInt(r);
      this.g = parseInt(g);
      this.b = parseInt(b);
      this.a = clampAlpha(parseFloat(a));
      return this;
    };

    Color.prototype.toRGB = function() {
      return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    };

    Color.prototype.toRGBA = function() {
      return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    };

    clampAlpha = function(a) {
      return Bu.clamp(a, 0, 1);
    };

    RE_RGB = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i;

    RE_RGBA = /rgba\(\s*(\d+),\s*(\d+),\s*(\d+)\s*,\s*([.\d]+)\s*\)/i;

    RE_RGB_PER = /rgb\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\s*\)/i;

    RE_RGBA_PER = /rgba\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\s*,\s*([.\d]+)\s*\)/i;

    RE_HEX3 = /#([0-9A-F]{3})\s*$/i;

    RE_HEX6 = /#([0-9A-F]{6})\s*$/i;

    CSS3_COLORS = {
      transparent: [0, 0, 0, 0],
      aliceblue: [240, 248, 255],
      antiquewhite: [250, 235, 215],
      aqua: [0, 255, 255],
      aquamarine: [127, 255, 212],
      azure: [240, 255, 255],
      beige: [245, 245, 220],
      bisque: [255, 228, 196],
      black: [0, 0, 0],
      blanchedalmond: [255, 235, 205],
      blue: [0, 0, 255],
      blueviolet: [138, 43, 226],
      brown: [165, 42, 42],
      burlywood: [222, 184, 135],
      cadetblue: [95, 158, 160],
      chartreuse: [127, 255, 0],
      chocolate: [210, 105, 30],
      coral: [255, 127, 80],
      cornflowerblue: [100, 149, 237],
      cornsilk: [255, 248, 220],
      crimson: [220, 20, 60],
      cyan: [0, 255, 255],
      darkblue: [0, 0, 139],
      darkcyan: [0, 139, 139],
      darkgoldenrod: [184, 134, 11],
      darkgray: [169, 169, 169],
      darkgreen: [0, 100, 0],
      darkgrey: [169, 169, 169],
      darkkhaki: [189, 183, 107],
      darkmagenta: [139, 0, 139],
      darkolivegreen: [85, 107, 47],
      darkorange: [255, 140, 0],
      darkorchid: [153, 50, 204],
      darkred: [139, 0, 0],
      darksalmon: [233, 150, 122],
      darkseagreen: [143, 188, 143],
      darkslateblue: [72, 61, 139],
      darkslategray: [47, 79, 79],
      darkslategrey: [47, 79, 79],
      darkturquoise: [0, 206, 209],
      darkviolet: [148, 0, 211],
      deeppink: [255, 20, 147],
      deepskyblue: [0, 191, 255],
      dimgray: [105, 105, 105],
      dimgrey: [105, 105, 105],
      dodgerblue: [30, 144, 255],
      firebrick: [178, 34, 34],
      floralwhite: [255, 250, 240],
      forestgreen: [34, 139, 34],
      fuchsia: [255, 0, 255],
      gainsboro: [220, 220, 220],
      ghostwhite: [248, 248, 255],
      gold: [255, 215, 0],
      goldenrod: [218, 165, 32],
      gray: [128, 128, 128],
      green: [0, 128, 0],
      greenyellow: [173, 255, 47],
      grey: [128, 128, 128],
      honeydew: [240, 255, 240],
      hotpink: [255, 105, 180],
      indianred: [205, 92, 92],
      indigo: [75, 0, 130],
      ivory: [255, 255, 240],
      khaki: [240, 230, 140],
      lavender: [230, 230, 250],
      lavenderblush: [255, 240, 245],
      lawngreen: [124, 252, 0],
      lemonchiffon: [255, 250, 205],
      lightblue: [173, 216, 230],
      lightcoral: [240, 128, 128],
      lightcyan: [224, 255, 255],
      lightgoldenrodyellow: [250, 250, 210],
      lightgray: [211, 211, 211],
      lightgreen: [144, 238, 144],
      lightgrey: [211, 211, 211],
      lightpink: [255, 182, 193],
      lightsalmon: [255, 160, 122],
      lightseagreen: [32, 178, 170],
      lightskyblue: [135, 206, 250],
      lightslategray: [119, 136, 153],
      lightslategrey: [119, 136, 153],
      lightsteelblue: [176, 196, 222],
      lightyellow: [255, 255, 224],
      lime: [0, 255, 0],
      limegreen: [50, 205, 50],
      linen: [250, 240, 230],
      magenta: [255, 0, 255],
      maroon: [128, 0, 0],
      mediumaquamarine: [102, 205, 170],
      mediumblue: [0, 0, 205],
      mediumorchid: [186, 85, 211],
      mediumpurple: [147, 112, 219],
      mediumseagreen: [60, 179, 113],
      mediumslateblue: [123, 104, 238],
      mediumspringgreen: [0, 250, 154],
      mediumturquoise: [72, 209, 204],
      mediumvioletred: [199, 21, 133],
      midnightblue: [25, 25, 112],
      mintcream: [245, 255, 250],
      mistyrose: [255, 228, 225],
      moccasin: [255, 228, 181],
      navajowhite: [255, 222, 173],
      navy: [0, 0, 128],
      oldlace: [253, 245, 230],
      olive: [128, 128, 0],
      olivedrab: [107, 142, 35],
      orange: [255, 165, 0],
      orangered: [255, 69, 0],
      orchid: [218, 112, 214],
      palegoldenrod: [238, 232, 170],
      palegreen: [152, 251, 152],
      paleturquoise: [175, 238, 238],
      palevioletred: [219, 112, 147],
      papayawhip: [255, 239, 213],
      peachpuff: [255, 218, 185],
      peru: [205, 133, 63],
      pink: [255, 192, 203],
      plum: [221, 160, 221],
      powderblue: [176, 224, 230],
      purple: [128, 0, 128],
      red: [255, 0, 0],
      rosybrown: [188, 143, 143],
      royalblue: [65, 105, 225],
      saddlebrown: [139, 69, 19],
      salmon: [250, 128, 114],
      sandybrown: [244, 164, 96],
      seagreen: [46, 139, 87],
      seashell: [255, 245, 238],
      sienna: [160, 82, 45],
      silver: [192, 192, 192],
      skyblue: [135, 206, 235],
      slateblue: [106, 90, 205],
      slategray: [112, 128, 144],
      slategrey: [112, 128, 144],
      snow: [255, 250, 250],
      springgreen: [0, 255, 127],
      steelblue: [70, 130, 180],
      tan: [210, 180, 140],
      teal: [0, 128, 128],
      thistle: [216, 191, 216],
      tomato: [255, 99, 71],
      turquoise: [64, 224, 208],
      violet: [238, 130, 238],
      wheat: [245, 222, 179],
      white: [255, 255, 255],
      whitesmoke: [245, 245, 245],
      yellow: [255, 255, 0],
      yellowgreen: [154, 205, 50]
    };

    return Color;

  })();

}).call(this);

(function() {
  Bu.Size = (function() {
    function Size(width, height) {
      this.width = width;
      this.height = height;
      this.type = 'Size';
    }

    Size.prototype.set = function(width, height) {
      this.width = width;
      this.height = height;
    };

    return Size;

  })();

}).call(this);

(function() {
  Bu.Vector = (function() {
    function Vector(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
    }

    Vector.prototype.clone = function() {
      return new Bu.Vector(this.x, this.y);
    };

    Vector.prototype.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    };

    Vector.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    };

    Vector.prototype.offset = function(dx, dy) {
      this.x += dx;
      this.y += dy;
      return this;
    };

    Vector.prototype.copy = function(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    };

    Vector.prototype.multiplyScalar = function(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    };

    Vector.prototype.project = function(obj) {
      var a, len;
      this.x *= obj.scale.x;
      this.y *= obj.scale.y;
      len = Bu.bevel(this.x, this.y);
      a = Math.atan2(this.y, this.x) + obj.rotation;
      this.x = len * Math.cos(a);
      this.y = len * Math.sin(a);
      this.x += obj.position.x;
      this.y += obj.position.y;
      return this;
    };

    Vector.prototype.unProject = function(obj) {
      var a, len;
      this.x -= obj.position.x;
      this.y -= obj.position.y;
      len = Bu.bevel(this.x, this.y);
      a = Math.atan2(this.y, this.x) - obj.rotation;
      this.x = len * Math.cos(a);
      this.y = len * Math.sin(a);
      this.x /= obj.scale.x;
      this.y /= obj.scale.y;
      return this;
    };

    return Vector;

  })();

}).call(this);

(function() {
  Bu.Event = function() {
    var types;
    types = {};
    this.on = function(type, listener) {
      var listeners;
      listeners = types[type] || (types[type] = []);
      if (listeners.indexOf(listener === -1)) {
        return listeners.push(listener);
      }
    };
    this.once = function(type, listener) {
      listener.once = true;
      return this.on(type, listener);
    };
    this.off = function(type, listener) {
      var index, listeners;
      listeners = types[type];
      if (listener != null) {
        if (listeners != null) {
          index = listeners.indexOf(listener);
          if (index > -1) {
            return listeners.splice(index, 1);
          }
        }
      } else {
        if (listeners != null) {
          return listeners.length = 0;
        }
      }
    };
    return this.trigger = function(type, eventData) {
      var i, len, listener, listeners, results;
      listeners = types[type];
      if (listeners != null) {
        eventData || (eventData = {});
        eventData.target = this;
        results = [];
        for (i = 0, len = listeners.length; i < len; i++) {
          listener = listeners[i];
          listener.call(this, eventData);
          if (listener.once) {
            results.push(listeners.splice(listeners.indexOf(listener), 1));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };
  };

}).call(this);

(function() {
  (function(global) {
    var jQuery;
    global.$ = function(selector) {
      var selections;
      selections = [];
      if (typeof selector === 'string') {
        selections = [].slice.call(document.querySelectorAll(selector));
      } else if (selector instanceof HTMLElement) {
        selections.push(selector);
      }
      jQuery.apply(selections);
      return selections;
    };
    jQuery = function() {
      var SVG_TAGS;
      this.on = (function(_this) {
        return function(type, callback) {
          _this.each(function(dom) {
            return dom.addEventListener(type, callback);
          });
          return _this;
        };
      })(this);
      this.off = (function(_this) {
        return function(type, callback) {
          _this.each(function(dom) {
            return dom.removeEventListener(type, callback);
          });
          return _this;
        };
      })(this);
      SVG_TAGS = 'svg line rect circle ellipse polyline polygon path text';
      this.append = (function(_this) {
        return function(tag) {
          _this.each(function(dom, i) {
            var newDom, tagIndex;
            tagIndex = SVG_TAGS.indexOf(tag.toLowerCase());
            if (tagIndex > -1) {
              newDom = document.createElementNS('http://www.w3.org/2000/svg', tag);
            } else {
              newDom = document.createElement(tag);
            }
            return _this[i] = dom.appendChild(newDom);
          });
          return _this;
        };
      })(this);
      this.text = (function(_this) {
        return function(str) {
          _this.each(function(dom) {
            return dom.textContent = str;
          });
          return _this;
        };
      })(this);
      this.html = (function(_this) {
        return function(str) {
          _this.each(function(dom) {
            return dom.innerHTML = str;
          });
          return _this;
        };
      })(this);
      this.width = (function(_this) {
        return function(w) {
          if (w != null) {
            _this.each(function(dom) {
              return dom.style.width = w + 'px';
            });
            return _this;
          } else {
            return parseFloat(getComputedStyle(_this[0]).width);
          }
        };
      })(this);
      this.height = (function(_this) {
        return function(h) {
          if (h != null) {
            _this.each(function(dom) {
              return dom.style.height = h + 'px';
            });
            return _this;
          } else {
            return parseFloat(getComputedStyle(_this[0]).height);
          }
        };
      })(this);
      this.style = (function(_this) {
        return function(name, value) {
          _this.each(function(dom) {
            var i, styleText, styles;
            styleText = dom.getAttribute('style');
            styles = {};
            if (styleText) {
              styleText.split(';').each(function(n) {
                var nv;
                nv = n.split(':');
                return styles[nv[0]] = nv[1];
              });
            }
            styles[name] = value;
            styleText = '';
            for (i in styles) {
              styleText += i + ': ' + styles[i] + '; ';
            }
            return dom.setAttribute('style', styleText);
          });
          return _this;
        };
      })(this);
      this.hasClass = (function(_this) {
        return function(name) {
          var classText, classes, i;
          if (_this.length === 0) {
            return false;
          }
          i = 0;
          while (i < _this.length) {
            classText = _this[i].getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (!classes.contains(name)) {
              return false;
            }
            i++;
          }
          return _this;
        };
      })(this);
      this.addClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (!classes.contains(name)) {
              classes.push(name);
              return dom.setAttribute('class', classes.join(' '));
            }
          });
          return _this;
        };
      })(this);
      this.removeClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class') || '';
            classes = classText.split(RegExp(' +'));
            if (classes.contains(name)) {
              classes.remove(name);
              if (classes.length > 0) {
                return dom.setAttribute('class', classes.join(' '));
              } else {
                return dom.removeAttribute('class');
              }
            }
          });
          return _this;
        };
      })(this);
      this.toggleClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (classes.contains(name)) {
              classes.remove(name);
            } else {
              classes.push(name);
            }
            if (classes.length > 0) {
              return dom.setAttribute('class', classes.join(' '));
            } else {
              return dom.removeAttribute('class');
            }
          });
          return _this;
        };
      })(this);
      this.attr = (function(_this) {
        return function(name, value) {
          if (value != null) {
            _this.each(function(dom) {
              return dom.setAttribute(name, value);
            });
            return _this;
          } else {
            return _this[0].getAttribute(name);
          }
        };
      })(this);
      this.hasAttr = (function(_this) {
        return function(name) {
          var i;
          if (_this.length === 0) {
            return false;
          }
          i = 0;
          while (i < _this.length) {
            if (!_this[i].hasAttribute(name)) {
              return false;
            }
            i++;
          }
          return _this;
        };
      })(this);
      this.removeAttr = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            return dom.removeAttribute(name);
          });
          return _this;
        };
      })(this);
      return this.val = (function(_this) {
        return function() {
          var ref;
          return (ref = _this[0]) != null ? ref.value : void 0;
        };
      })(this);
    };
    global.$.ready = function(onLoad) {
      return document.addEventListener('DOMContentLoaded', onLoad);
    };
    return global.$.ajax = function(url, ops) {
      var xhr;
      if (!ops) {
        if (typeof url === 'object') {
          ops = url;
          url = ops.url;
        } else {
          ops = {};
        }
      }
      ops.method || (ops.method = 'GET');
      if (ops.async == null) {
        ops.async = true;
      }
      xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            if (ops.success != null) {
              return ops.success(xhr.responseText, xhr.status, xhr);
            }
          } else {
            if (ops.error != null) {
              ops.error(xhr, xhr.status);
            }
            if (ops.complete != null) {
              return ops.complete(xhr, xhr.status);
            }
          }
        }
      };
      xhr.open(ops.method, url, ops.async, ops.username, ops.password);
      return xhr.send(null);
    };
  })(Bu.global);

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.Object2D = (function() {
    function Object2D() {
      Bu.Styled.apply(this);
      Bu.Event.apply(this);
      this.visible = true;
      this.opacity = 1;
      this.position = new Bu.Vector;
      this.rotation = 0;
      this._scale = new Bu.Vector(1, 1);
      this.skew = new Bu.Vector;
      this.bounds = null;
      this.keyPoints = null;
      this.children = [];
      this.parent = null;
    }

    Object2D.property('scale', {
      get: function() {
        return this._scale;
      },
      set: function(val) {
        if (Bu.isNumber(val)) {
          return this._scale.x = this._scale.y = val;
        } else {
          return this._scale = val;
        }
      }
    });

    Object2D.prototype.translate = function(dx, dy) {
      this.position.x += dx;
      this.position.y += dy;
      return this;
    };

    Object2D.prototype.rotate = function(da) {
      this.rotation += da;
      return this;
    };

    Object2D.prototype.scaleBy = function(ds) {
      this.scale *= ds;
      return this;
    };

    Object2D.prototype.scaleTo = function(s) {
      this.scale = s;
      return this;
    };

    Object2D.prototype.getScene = function() {
      var node;
      node = this;
      while (true) {
        if (node instanceof Bu.Scene) {
          break;
        }
        node = node.parent;
      }
      return node;
    };

    Object2D.prototype.addChild = function(shape) {
      var j, len, s;
      if (Bu.isArray(shape)) {
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          this.children.push(s);
          s.parent = this;
        }
      } else {
        this.children.push(shape);
        shape.parent = this;
      }
      return this;
    };

    Object2D.prototype.removeChild = function(shape) {
      var index;
      index = this.children.indexOf(shape);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      return this;
    };

    Object2D.prototype.animate = function(anim, args) {
      var i;
      if (!Bu.isArray(args)) {
        args = [args];
      }
      if (Bu.isString(anim)) {
        if (anim in Bu.animations) {
          Bu.animations[anim].applyTo(this, args);
        } else {
          console.warn("Bu.animations[\"" + anim + "\"] doesn't exists.");
        }
      } else if (Bu.isArray(anim)) {
        for (i in anim) {
          if (!hasProp.call(anim, i)) continue;
          this.animate(anim[i], args);
        }
      } else {
        anim.applyTo(this, args);
      }
      return this;
    };

    Object2D.prototype.createBounds = function() {
      this.bounds = new Bu.Bounds(this);
      return this;
    };

    Object2D.prototype.hitTest = function(v) {
      var renderer;
      renderer = this.getScene().renderer;
      if (renderer.originAtCenter) {
        v.offset(-renderer.width / 2, -renderer.height / 2);
      }
      v.project(renderer.camera);
      v.unProject(this);
      return this.containsPoint(v);
    };

    Object2D.prototype.containsPoint = function(p) {
      if ((this.bounds != null) && !this.bounds.containsPoint(p)) {
        return false;
      } else if (this._containsPoint) {
        return this._containsPoint(p);
      } else {
        return false;
      }
    };

    return Object2D;

  })();

}).call(this);

(function() {
  Bu.Styled = function() {
    this.strokeStyle = Bu.Styled.DEFAULT_STROKE_STYLE;
    this.fillStyle = Bu.Styled.DEFAULT_FILL_STYLE;
    this.dashStyle = false;
    this.dashFlowSpeed = 0;
    this.lineWidth = 1;
    this.dashOffset = 0;
    this.style = function(style) {
      var i, k, len, ref;
      if (Bu.isString(style)) {
        style = Bu.styles[style];
        if (style == null) {
          style = Bu.styles["default"];
          console.warn("Bu.Styled: Bu.styles." + style + " doesn't exists, fell back to default.");
        }
      } else if (style == null) {
        style = Bu.styles['default'];
      }
      ref = ['strokeStyle', 'fillStyle', 'dashStyle', 'dashFlowSpeed', 'lineWidth'];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        this[k] = style[k];
      }
      return this;
    };
    this.stroke = function(v) {
      if (v == null) {
        v = true;
      }
      if ((Bu.styles != null) && v in Bu.styles) {
        v = Bu.styles[v].strokeStyle;
      }
      switch (v) {
        case true:
          this.strokeStyle = Bu.Styled.DEFAULT_STROKE_STYLE;
          break;
        case false:
          this.strokeStyle = null;
          break;
        default:
          this.strokeStyle = v;
      }
      return this;
    };
    this.fill = function(v) {
      if (v == null) {
        v = true;
      }
      if ((Bu.styles != null) && v in Bu.styles) {
        v = Bu.styles[v].fillStyle;
      }
      switch (v) {
        case false:
          this.fillStyle = null;
          break;
        case true:
          this.fillStyle = Bu.Styled.DEFAULT_FILL_STYLE;
          break;
        default:
          this.fillStyle = v;
      }
      return this;
    };
    this.dash = function(v) {
      if (v == null) {
        v = true;
      }
      if ((Bu.styles != null) && v in Bu.styles) {
        v = Bu.styles[v].dashStyle;
      }
      if (Bu.isNumber(v)) {
        v = [v, v];
      }
      switch (v) {
        case false:
          this.dashStyle = null;
          break;
        case true:
          this.dashStyle = Bu.Styled.DEFAULT_DASH_STYLE;
          break;
        default:
          this.dashStyle = v;
      }
      return this;
    };
    this.dashFlow = function(speed) {
      if (speed === true || (speed == null)) {
        speed = 1;
      }
      if (speed === false) {
        speed = 0;
      }
      Bu.dashFlowManager.setSpeed(this, speed);
      return this;
    };
    this.setLineWidth = function(w) {
      this.lineWidth = w;
      return this;
    };
    return this;
  };

  Bu.Styled.DEFAULT_STROKE_STYLE = '#048';

  Bu.Styled.DEFAULT_FILL_STYLE = 'rgba(64, 128, 192, 0.5)';

  Bu.Styled.DEFAULT_DASH_STYLE = [8, 4];

  Bu.styles = {
    "default": new Bu.Styled().stroke().fill(),
    hover: new Bu.Styled().stroke('hsla(0, 100%, 40%, 0.75)').fill('hsla(0, 100%, 75%, 0.5)'),
    text: new Bu.Styled().stroke(false).fill('black'),
    line: new Bu.Styled().fill(false),
    selected: new Bu.Styled().setLineWidth(3),
    dash: new Bu.Styled().dash()
  };

}).call(this);


/*=================================================================##
All supported constructor options:
(The appearance sequence is the process sequence.)
{
    renderer: # settings to the renderer
    	container: '#container' # css selector of the container dom or itself
        cursor: 'crosshand' # the default cursor style on the <canvas>
        background: 'pink' # the default background of the <canvas>
    	showKeyPoints: true # whether to show the key points of shapes (if they have).
    data: { var } # variables of this Bu.js app, will be copied to the app object
    methods: { function }# functions of this Bu.js app, will be copied to the app object
    objects: {} or function that returns {} # all the renderable objects
	hierarchy: # an tree that represent the object hierarchy of the scene, the keys are in `objects`
    events: # event listeners, 'mousedown', 'mousemove', 'mouseup' will automatically be bound to <canvas>
    init: function # called when the document is ready
    update: function # called every frame
}
##=================================================================
 */

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.App = (function() {
    function App($options) {
      var base, i, k, len, ref;
      this.$options = $options != null ? $options : {};
      ref = ["renderer", "data", "objects", "hierarchy", "methods", "events"];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        (base = this.$options)[k] || (base[k] = {});
      }
      this.$objects = {};
      this.$inputManager = new Bu.InputManager;
      Bu.ready(this.init, this);
    }

    App.prototype.init = function() {
      var assembleObjects, k, name, ref;
      this.$renderer = new Bu.Renderer(this.$options.renderer);
      if (Bu.isFunction(this.$options.data)) {
        this.$options.data = this.$options.data.apply(this);
      }
      for (k in this.$options.data) {
        this[k] = this.$options.data[k];
      }
      for (k in this.$options.methods) {
        this[k] = this.$options.methods[k];
      }
      if (Bu.isFunction(this.$options.objects)) {
        this.$objects = this.$options.objects.apply(this);
      } else {
        for (name in this.$options.objects) {
          this.$objects[name] = this.$options.objects[name];
        }
      }
      assembleObjects = (function(_this) {
        return function(children, parent) {
          var results;
          results = [];
          for (name in children) {
            if (!hasProp.call(children, name)) continue;
            parent.addChild(_this.$objects[name]);
            results.push(assembleObjects(children[name], _this.$objects[name]));
          }
          return results;
        };
      })(this);
      assembleObjects(this.$options.hierarchy, this.$renderer.scene);
      if ((ref = this.$options.init) != null) {
        ref.call(this);
      }
      this.$inputManager.handleAppEvents(this, this.$options.events);
      if (this.$options.update != null) {
        return this.$renderer.on('update', (function(_this) {
          return function() {
            return _this.$options.update.apply(_this, arguments);
          };
        })(this));
      }
    };

    return App;

  })();

}).call(this);

(function() {
  Bu.Audio = (function() {
    function Audio(url) {
      this.audio = document.createElement('audio');
      this.url = '';
      this.ready = false;
      if (url) {
        this.load(url);
      }
    }

    Audio.prototype.load = function(url) {
      this.url = url;
      this.audio.addEventListener('canplay', (function(_this) {
        return function() {
          return _this.ready = true;
        };
      })(this));
      return this.audio.src = url;
    };

    Audio.prototype.play = function() {
      if (this.ready) {
        return this.audio.play();
      } else {
        return console.warn("The audio file " + this.url + " hasn't been ready.");
      }
    };

    return Audio;

  })();

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Camera = (function(superClass) {
    extend(Camera, superClass);

    function Camera() {
      Camera.__super__.constructor.call(this);
      this.type = 'Camera';
    }

    return Camera;

  })(Bu.Object2D);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bu.Renderer = (function() {
    function Renderer() {
      this.drawShape = bind(this.drawShape, this);
      this.drawShapes = bind(this.drawShapes, this);
      var appendDom, j, len1, name, onResize, options, ref, tick;
      Bu.Event.apply(this);
      this.type = 'Renderer';
      this.scene = new Bu.Scene(this);
      this.camera = new Bu.Camera;
      this.tickCount = 0;
      this.isRunning = true;
      this.pixelRatio = Bu.global.devicePixelRatio || 1;
      if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
        this.clipMeter = new ClipMeter();
      }
      options = Bu.combineOptions(arguments, {
        container: 'body',
        background: '#eee',
        fps: 60,
        showKeyPoints: false,
        showBounds: false,
        originAtCenter: false,
        imageSmoothing: true
      });
      ref = ['container', 'background', 'width', 'height', 'fps', 'showKeyPoints', 'showBounds', 'originAtCenter'];
      for (j = 0, len1 = ref.length; j < len1; j++) {
        name = ref[j];
        this[name] = options[name];
      }
      this.fillParent = !Bu.isNumber(options.width);
      this.width *= this.pixelRatio;
      this.height *= this.pixelRatio;
      this.dom = document.createElement('canvas');
      this.dom.style.cursor = options.cursor || 'default';
      this.dom.style.boxSizing = 'content-box';
      this.dom.style.background = this.background;
      this.dom.oncontextmenu = function() {
        return false;
      };
      this.context = this.dom.getContext('2d');
      this.context.textBaseline = 'top';
      this.context.imageSmoothingEnabled = options.imageSmoothing;
      if (Bu.isString(this.container)) {
        this.container = document.querySelector(this.container);
      }
      if (this.fillParent && this.container === document.body) {
        $('body').style('margin', 0).style('overflow', 'hidden');
        $('html, body').style('width', '100%').style('height', '100%');
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
      if (!this.fillParent) {
        this.dom.style.width = (this.width / this.pixelRatio) + 'px';
        this.dom.style.height = (this.height / this.pixelRatio) + 'px';
        this.dom.width = this.width;
        this.dom.height = this.height;
      } else {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        Bu.global.window.addEventListener('resize', onResize);
        this.dom.addEventListener('DOMNodeInserted', onResize);
      }
      tick = (function(_this) {
        return function() {
          if (_this.isRunning) {
            if (_this.clipMeter != null) {
              _this.clipMeter.start();
            }
            _this.render();
            _this.trigger('update', _this);
            _this.tickCount += 1;
            if (_this.clipMeter != null) {
              _this.clipMeter.tick();
            }
          }
          return requestAnimationFrame(tick);
        };
      })(this);
      tick();
      appendDom = (function(_this) {
        return function() {
          return _this.container.appendChild(_this.dom);
        };
      })(this);
      setTimeout(appendDom, 1);
      Bu.animationRunner.hookUp(this);
      Bu.dashFlowManager.hookUp(this);
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

    Renderer.prototype.render = function() {
      this.context.save();
      this.clearCanvas();
      if (this.originAtCenter) {
        this.context.translate(this.width / 2, this.height / 2);
      }
      this.context.scale(this.pixelRatio, this.pixelRatio);
      this.context.scale(1 / this.camera.scale.x, 1 / this.camera.scale.y);
      this.context.rotate(-this.camera.rotation);
      this.context.translate(-this.camera.position.x, -this.camera.position.y);
      this.drawShape(this.scene);
      this.context.restore();
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
      var base, sx, sy;
      if (!shape.visible) {
        return this;
      }
      this.context.translate(shape.position.x, shape.position.y);
      this.context.rotate(shape.rotation);
      sx = shape.scale.x;
      sy = shape.scale.y;
      if (sx / sy > 100 || sx / sy < 0.01) {
        if (Math.abs(sx) < 0.02) {
          sx = 0;
        }
        if (Math.abs(sy) < 0.02) {
          sy = 0;
        }
      }
      this.context.scale(sx, sy);
      this.context.globalAlpha *= shape.opacity;
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
      this.context.beginPath();
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
        case 'Ellipse':
          this.drawEllipse(shape);
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
        case 'Object2D':
        case 'Scene':
          break;
        default:
          console.log('drawShapes(): unknown shape: ', shape.type, shape);
      }
      if ((shape.fillStyle != null) && shape.fillable) {
        this.context.fillStyle = shape.fillStyle;
        this.context.fill();
      }
      if (shape.dashStyle) {
        this.context.lineDashOffset = shape.dashOffset;
        if (typeof (base = this.context).setLineDash === "function") {
          base.setLineDash(shape.dashStyle);
        }
        this.context.stroke();
        this.context.setLineDash([]);
      } else if (shape.strokeStyle != null) {
        this.context.stroke();
      }
      if (shape.children != null) {
        this.drawShapes(shape.children);
      }
      if (this.showKeyPoints) {
        this.drawShapes(shape.keyPoints);
      }
      if (this.showBounds && (shape.bounds != null)) {
        this.drawBounds(shape.bounds);
      }
      return this;
    };

    Renderer.prototype.drawPoint = function(shape) {
      this.context.arc(shape.x, shape.y, Bu.POINT_RENDER_SIZE, 0, Bu.TWO_PI);
      return this;
    };

    Renderer.prototype.drawLine = function(shape) {
      this.context.moveTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      return this;
    };

    Renderer.prototype.drawCircle = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, 0, Bu.TWO_PI);
      return this;
    };

    Renderer.prototype.drawEllipse = function(shape) {
      this.context.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, Bu.TWO_PI, false);
      return this;
    };

    Renderer.prototype.drawTriangle = function(shape) {
      this.context.lineTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      this.context.lineTo(shape.points[2].x, shape.points[2].y);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawRectangle = function(shape) {
      if (shape.cornerRadius !== 0) {
        return this.drawRoundRectangle(shape);
      }
      this.context.rect(shape.pointLT.x, shape.pointLT.y, shape.size.width, shape.size.height);
      return this;
    };

    Renderer.prototype.drawRoundRectangle = function(shape) {
      var base, r, x1, x2, y1, y2;
      x1 = shape.pointLT.x;
      x2 = shape.pointRB.x;
      y1 = shape.pointLT.y;
      y2 = shape.pointRB.y;
      r = shape.cornerRadius;
      this.context.moveTo(x1, y1 + r);
      this.context.arcTo(x1, y1, x1 + r, y1, r);
      this.context.lineTo(x2 - r, y1);
      this.context.arcTo(x2, y1, x2, y1 + r, r);
      this.context.lineTo(x2, y2 - r);
      this.context.arcTo(x2, y2, x2 - r, y2, r);
      this.context.lineTo(x1 + r, y2);
      this.context.arcTo(x1, y2, x1, y2 - r, r);
      this.context.closePath();
      if ((shape.strokeStyle != null) && shape.dashStyle) {
        if (typeof (base = this.context).setLineDash === "function") {
          base.setLineDash(shape.dashStyle);
        }
      }
      return this;
    };

    Renderer.prototype.drawFan = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.lineTo(shape.cx, shape.cy);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawBow = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawPolygon = function(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawPolyline = function(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      return this;
    };

    Renderer.prototype.drawSpline = function(shape) {
      var i, j, len, ref;
      if (shape.strokeStyle != null) {
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
      }
      return this;
    };

    Renderer.prototype.drawPointText = function(shape) {
      var char, charBitmap, font, i, j, ref, textWidth, xOffset, yOffset;
      font = shape.font || Bu.DEFAULT_FONT;
      if (Bu.isString(font)) {
        this.context.textAlign = shape.textAlign;
        this.context.textBaseline = shape.textBaseline;
        this.context.font = font;
        if (shape.strokeStyle != null) {
          this.context.strokeText(shape.text, shape.x, shape.y);
        }
        if (shape.fillStyle != null) {
          this.context.fillStyle = shape.fillStyle;
          this.context.fillText(shape.text, shape.x, shape.y);
        }
      } else if (font instanceof Bu.SpriteSheet && font.ready) {
        textWidth = font.measureTextWidth(shape.text);
        xOffset = (function() {
          switch (shape.textAlign) {
            case 'left':
              return 0;
            case 'center':
              return -textWidth / 2;
            case 'right':
              return -textWidth;
          }
        })();
        yOffset = (function() {
          switch (shape.textBaseline) {
            case 'top':
              return 0;
            case 'middle':
              return -font.height / 2;
            case 'bottom':
              return -font.height;
          }
        })();
        for (i = j = 0, ref = shape.text.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          char = shape.text[i];
          charBitmap = font.getFrameImage(char);
          if (charBitmap != null) {
            this.context.drawImage(charBitmap, shape.x + xOffset, shape.y + yOffset);
            xOffset += charBitmap.width;
          } else {
            xOffset += 10;
          }
        }
      }
      return this;
    };

    Renderer.prototype.drawImage = function(shape) {
      var dx, dy, h, w;
      if (shape.ready) {
        w = shape.size.width;
        h = shape.size.height;
        dx = -w * shape.pivot.x;
        dy = -h * shape.pivot.y;
        this.context.drawImage(shape.image, dx, dy, w, h);
      }
      return this;
    };

    Renderer.prototype.drawBounds = function(bounds) {
      var base;
      this.context.beginPath();
      this.context.strokeStyle = Bu.Renderer.BOUNDS_STROKE_STYLE;
      if (typeof (base = this.context).setLineDash === "function") {
        base.setLineDash(Bu.Renderer.BOUNDS_DASH_STYLE);
      }
      this.context.rect(bounds.x1, bounds.y1, bounds.x2 - bounds.x1, bounds.y2 - bounds.y1);
      this.context.stroke();
      return this;
    };

    return Renderer;

  })();

  Bu.Renderer.BOUNDS_STROKE_STYLE = 'red';

  Bu.Renderer.BOUNDS_DASH_STYLE = [6, 6];

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Scene = (function(superClass) {
    extend(Scene, superClass);

    function Scene(renderer) {
      this.renderer = renderer;
      Scene.__super__.constructor.call(this);
      this.type = 'Scene';
    }

    return Scene;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Bow = (function(superClass) {
    extend(Bow, superClass);

    Bow.prototype.type = 'Bow';

    Bow.prototype.fillable = true;

    function Bow(cx, cy, radius, aFrom, aTo) {
      var ref;
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Bow.__super__.constructor.call(this);
      if (this.aFrom > this.aTo) {
        ref = [this.aTo, this.aFrom], this.aFrom = ref[0], this.aTo = ref[1];
      }
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
      this.updateKeyPoints();
      this.on('changed', this.updateKeyPoints);
      this.on('changed', (function(_this) {
        return function() {
          var ref1;
          return (ref1 = _this.bounds) != null ? ref1.update() : void 0;
        };
      })(this));
    }

    Bow.prototype.clone = function() {
      return new Bu.Bow(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    Bow.prototype.updateKeyPoints = function() {
      this.center.set(this.cx, this.cy);
      this.string.points[0].copy(this.center.arcTo(this.radius, this.aFrom));
      this.string.points[1].copy(this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
      return this;
    };

    return Bow;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Circle = (function(superClass) {
    extend(Circle, superClass);

    Circle.prototype.type = 'Circle';

    Circle.prototype.fillable = true;

    function Circle(_radius, cx, cy) {
      this._radius = _radius != null ? _radius : 1;
      if (cx == null) {
        cx = 0;
      }
      if (cy == null) {
        cy = 0;
      }
      Circle.__super__.constructor.call(this);
      this._center = new Bu.Point(cx, cy);
      this.bounds = null;
      this.keyPoints = [this._center];
      this.on('centerChanged', this.updateKeyPoints);
    }

    Circle.prototype.clone = function() {
      return new Bu.Circle(this.radius, this.cx, this.cy);
    };

    Circle.prototype.updateKeyPoints = function() {
      return this.keyPoints[0].set(this.cx, this.cy);
    };

    Circle.property('cx', {
      get: function() {
        return this._center.x;
      },
      set: function(val) {
        this._center.x = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('cy', {
      get: function() {
        return this._center.y;
      },
      set: function(val) {
        this._center.y = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('center', {
      get: function() {
        return this._center;
      },
      set: function(val) {
        this._center = val;
        this.cx = val.x;
        this.cy = val.y;
        this.keyPoints[0] = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('radius', {
      get: function() {
        return this._radius;
      },
      set: function(val) {
        this._radius = val;
        this.trigger('radiusChanged', this);
        return this;
      }
    });

    return Circle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Ellipse = (function(superClass) {
    extend(Ellipse, superClass);

    Ellipse.prototype.type = 'Ellipse';

    Ellipse.prototype.fillable = true;

    function Ellipse(_radiusX, _radiusY) {
      this._radiusX = _radiusX != null ? _radiusX : 20;
      this._radiusY = _radiusY != null ? _radiusY : 10;
      Ellipse.__super__.constructor.call(this);
    }

    Ellipse.property('radiusX', {
      get: function() {
        return this._radiusX;
      },
      set: function(val) {
        this._radiusX = val;
        return this.trigger('changed', this);
      }
    });

    Ellipse.property('radiusY', {
      get: function() {
        return this._radiusY;
      },
      set: function(val) {
        this._radiusY = val;
        return this.trigger('changed', this);
      }
    });

    return Ellipse;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Fan = (function(superClass) {
    extend(Fan, superClass);

    Fan.prototype.type = 'Fan';

    Fan.prototype.fillable = true;

    function Fan(cx, cy, radius, aFrom, aTo) {
      var ref;
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Fan.__super__.constructor.call(this);
      if (this.aFrom > this.aTo) {
        ref = [this.aTo, this.aFrom], this.aFrom = ref[0], this.aTo = ref[1];
      }
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = [this.string.points[0], this.string.points[1], this.center];
      this.on('changed', this.updateKeyPoints);
      this.on('changed', (function(_this) {
        return function() {
          var ref1;
          return (ref1 = _this.bounds) != null ? ref1.update() : void 0;
        };
      })(this));
    }

    Fan.prototype.clone = function() {
      return new Bu.Fan(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    Fan.prototype.updateKeyPoints = function() {
      this.center.set(this.cx, this.cy);
      this.string.points[0].copy(this.center.arcTo(this.radius, this.aFrom));
      this.string.points[1].copy(this.center.arcTo(this.radius, this.aTo));
      return this;
    };

    return Fan;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Line = (function(superClass) {
    extend(Line, superClass);

    Line.prototype.type = 'Line';

    Line.prototype.fillable = false;

    function Line(p1, p2, p3, p4) {
      Line.__super__.constructor.call(this);
      if (arguments.length < 2) {
        this.points = [new Bu.Point(), new Bu.Point()];
      } else if (arguments.length < 4) {
        this.points = [p1.clone(), p2.clone()];
      } else {
        this.points = [new Bu.Point(p1, p2), new Bu.Point(p3, p4)];
      }
      this.length = 0;
      this.midpoint = new Bu.Point();
      this.keyPoints = this.points;
      this.on("changed", (function(_this) {
        return function() {
          _this.length = _this.points[0].distanceTo(_this.points[1]);
          return _this.midpoint.set((_this.points[0].x + _this.points[1].x) / 2, (_this.points[0].y + _this.points[1].y) / 2);
        };
      })(this));
      this.trigger("changed");
    }

    Line.prototype.clone = function() {
      return new Bu.Line(this.points[0], this.points[1]);
    };

    Line.prototype.set = function(a1, a2, a3, a4) {
      if (typeof p4 !== "undefined" && p4 !== null) {
        this.points[0].set(a1, a2);
        this.points[1].set(a3, a4);
      } else {
        this.points[0] = a1;
        this.points[1] = a2;
      }
      this.trigger("changed");
      return this;
    };

    Line.prototype.setPoint1 = function(a1, a2) {
      if (a2 != null) {
        this.points[0].set(a1, a2);
      } else {
        this.points[0].copy(a1);
      }
      this.trigger("changed");
      return this;
    };

    Line.prototype.setPoint2 = function(a1, a2) {
      if (a2 != null) {
        this.points[1].set(a1, a2);
      } else {
        this.points[1].copy(a1);
      }
      this.trigger("changed");
      return this;
    };

    return Line;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Point = (function(superClass) {
    extend(Point, superClass);

    Point.prototype.type = 'Point';

    Point.prototype.fillable = true;

    function Point(x1, y1) {
      this.x = x1 != null ? x1 : 0;
      this.y = y1 != null ? y1 : 0;
      Point.__super__.constructor.call(this);
      this.lineWidth = 0.5;
      this._labelIndex = -1;
    }

    Point.prototype.clone = function() {
      return new Bu.Point(this.x, this.y);
    };

    Point.property('label', {
      get: function() {
        if (this._labelIndex > -1) {
          return this.children[this._labelIndex].text;
        } else {
          return '';
        }
      },
      set: function(val) {
        var pointText;
        if (this._labelIndex === -1) {
          pointText = new Bu.PointText(val, this.x + Bu.POINT_LABEL_OFFSET, this.y, {
            align: '+0'
          });
          this.children.push(pointText);
          return this._labelIndex = this.children.length - 1;
        } else {
          return this.children[this._labelIndex].text = val;
        }
      }
    });

    Point.prototype.arcTo = function(radius, arc) {
      return new Bu.Point(this.x + Math.cos(arc) * radius, this.y + Math.sin(arc) * radius);
    };

    Point.prototype.copy = function(point) {
      this.x = point.x;
      this.y = point.y;
      return this.updateLabel();
    };

    Point.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
      return this.updateLabel();
    };

    Point.prototype.updateLabel = function() {
      if (this._labelIndex > -1) {
        this.children[this._labelIndex].x = this.x + Bu.POINT_LABEL_OFFSET;
        return this.children[this._labelIndex].y = this.y;
      }
    };

    return Point;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Polygon = (function(superClass) {
    extend(Polygon, superClass);

    Polygon.prototype.type = 'Polygon';

    Polygon.prototype.fillable = true;


    /*
       constructors
       1. Polygon(points)
       2. Polygon(x, y, radius, n, options): to generate regular polygon
       	options: angle - start angle of regular polygon
     */

    function Polygon(points) {
      var n, options, radius, x, y;
      Polygon.__super__.constructor.call(this);
      this.vertices = [];
      this.lines = [];
      this.triangles = [];
      options = Bu.combineOptions(arguments, {
        angle: 0
      });
      if (Bu.isArray(points)) {
        if (points != null) {
          this.vertices = points;
        }
      } else {
        if (arguments.length < 4) {
          x = 0;
          y = 0;
          radius = arguments[0];
          n = arguments[1];
        } else {
          x = arguments[0];
          y = arguments[1];
          radius = arguments[2];
          n = arguments[3];
        }
        this.vertices = Bu.Polygon.generateRegularPoints(x, y, radius, n, options);
      }
      this.onVerticesChanged();
      this.on('changed', this.onVerticesChanged);
      this.on('changed', (function(_this) {
        return function() {
          var ref;
          return (ref = _this.bounds) != null ? ref.update() : void 0;
        };
      })(this));
      this.keyPoints = this.vertices;
    }

    Polygon.prototype.clone = function() {
      return new Bu.Polygon(this.vertices);
    };

    Polygon.prototype.onVerticesChanged = function() {
      var i, k, l, ref, ref1, results;
      this.lines = [];
      this.triangles = [];
      if (this.vertices.length > 1) {
        for (i = k = 0, ref = this.vertices.length - 1; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          this.lines.push(new Bu.Line(this.vertices[i], this.vertices[i + 1]));
        }
        this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
      }
      if (this.vertices.length > 2) {
        results = [];
        for (i = l = 1, ref1 = this.vertices.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
          results.push(this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[i], this.vertices[i + 1])));
        }
        return results;
      }
    };

    Polygon.prototype.isSimple = function() {
      var i, j, k, l, len, ref, ref1, ref2;
      len = this.lines.length;
      for (i = k = 0, ref = len; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        for (j = l = ref1 = i + 1, ref2 = len; ref1 <= ref2 ? l < ref2 : l > ref2; j = ref1 <= ref2 ? ++l : --l) {
          if (this.lines[i].isCrossWithLine(this.lines[j])) {
            return false;
          }
        }
      }
      return true;
    };

    Polygon.prototype.addPoint = function(point, insertIndex) {
      if (insertIndex == null) {
        this.vertices.push(point);
        if (this.vertices.length > 1) {
          this.lines[this.lines.length - 1].points[1] = point;
        }
        if (this.vertices.length > 0) {
          this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
        }
        if (this.vertices.length > 2) {
          return this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        return this.vertices.splice(insertIndex, 0, point);
      }
    };

    Polygon.generateRegularPoints = function(cx, cy, radius, n, options) {
      var a, angleDelta, angleSection, i, k, points, r, ref, x, y;
      angleDelta = options.angle;
      r = radius;
      points = [];
      angleSection = Bu.TWO_PI / n;
      for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        a = i * angleSection + angleDelta;
        x = cx + r * Math.cos(a);
        y = cy + r * Math.sin(a);
        points[i] = new Bu.Point(x, y);
      }
      return points;
    };

    return Polygon;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Polyline = (function(superClass) {
    var set;

    extend(Polyline, superClass);

    Polyline.prototype.type = 'Polyline';

    Polyline.prototype.fillable = false;

    function Polyline(vertices1) {
      var i, j, ref, vertices;
      this.vertices = vertices1 != null ? vertices1 : [];
      Polyline.__super__.constructor.call(this);
      if (arguments.length > 1) {
        vertices = [];
        for (i = j = 0, ref = arguments.length / 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          vertices.push(new Bu.Point(arguments[i * 2], arguments[i * 2 + 1]));
        }
        this.vertices = vertices;
      }
      this.lines = [];
      this.keyPoints = this.vertices;
      this.fill(false);
      this.on("changed", (function(_this) {
        return function() {
          if (_this.vertices.length > 1) {
            _this.updateLines();
            if (typeof _this.calcLength === "function") {
              _this.calcLength();
            }
            return typeof _this.calcPointNormalizedPos === "function" ? _this.calcPointNormalizedPos() : void 0;
          }
        };
      })(this));
      this.trigger("changed");
    }

    Polyline.prototype.clone = function() {
      var polyline;
      polyline = new Bu.Polyline(this.vertices);
      polyline.strokeStyle = this.strokeStyle;
      polyline.fillStyle = this.fillStyle;
      polyline.dashStyle = this.dashStyle;
      polyline.lineWidth = this.lineWidth;
      polyline.dashOffset = this.dashOffset;
      return polyline;
    };

    Polyline.prototype.updateLines = function() {
      var i, j, ref;
      for (i = j = 0, ref = this.vertices.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.lines[i] != null) {
          this.lines[i].set(this.vertices[i], this.vertices[i + 1]);
        } else {
          this.lines[i] = new Bu.Line(this.vertices[i], this.vertices[i + 1]);
        }
      }
      return this;
    };

    set = function(points) {
      var i, j, ref;
      for (i = j = 0, ref = this.vertices.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.vertices[i].copy(points[i]);
      }
      if (this.vertices.length > points.length) {
        this.vertices.splice(points.length);
      }
      this.trigger("changed");
      return this;
    };

    Polyline.prototype.addPoint = function(point, insertIndex) {
      if (insertIndex == null) {
        this.vertices.push(point);
        if (this.vertices.length > 1) {
          this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        this.vertices.splice(insertIndex, 0, point);
      }
      this.trigger("changed");
      return this;
    };

    return Polyline;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Rectangle = (function(superClass) {
    extend(Rectangle, superClass);

    Rectangle.prototype.type = 'Rectangle';

    Rectangle.prototype.fillable = true;

    function Rectangle(x, y, width, height, cornerRadius) {
      if (cornerRadius == null) {
        cornerRadius = 0;
      }
      Rectangle.__super__.constructor.call(this);
      this.center = new Bu.Point(x + width / 2, y + height / 2);
      this.size = new Bu.Size(width, height);
      this.pointLT = new Bu.Point(x, y);
      this.pointRT = new Bu.Point(x + width, y);
      this.pointRB = new Bu.Point(x + width, y + height);
      this.pointLB = new Bu.Point(x, y + height);
      this.points = [this.pointLT, this.pointRT, this.pointRB, this.pointLB];
      this.cornerRadius = cornerRadius;
      this.on('changed', (function(_this) {
        return function() {
          var ref;
          return (ref = _this.bounds) != null ? ref.update() : void 0;
        };
      })(this));
    }

    Rectangle.property('cornerRadius', {
      get: function() {
        return this._cornerRadius;
      },
      set: function(val) {
        this._cornerRadius = val;
        return this.keyPoints = val > 0 ? [] : this.points;
      }
    });

    Rectangle.prototype.clone = function() {
      return new Bu.Rectangle(this.pointLT.x, this.pointLT.y, this.size.width, this.size.height);
    };

    Rectangle.prototype.set = function(x, y, width, height) {
      this.center.set(x + width / 2, y + height / 2);
      this.size.set(width, height);
      this.pointLT.set(x, y);
      this.pointRT.set(x + width, y);
      this.pointRB.set(x + width, y + height);
      return this.pointLB.set(x, y + height);
    };

    return Rectangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Spline = (function(superClass) {
    var calcControlPoints;

    extend(Spline, superClass);

    Spline.prototype.type = 'Spline';

    Spline.prototype.fillable = false;

    function Spline(vertices) {
      var polyline;
      Spline.__super__.constructor.call(this);
      if (vertices instanceof Bu.Polyline) {
        polyline = vertices;
        this.vertices = polyline.vertices;
        polyline.on('pointChange', (function(_this) {
          return function(polyline) {
            _this.vertices = polyline.vertices;
            return calcControlPoints(_this);
          };
        })(this));
      } else {
        this.vertices = Bu.clone(vertices);
      }
      this.keyPoints = this.vertices;
      this.controlPointsAhead = [];
      this.controlPointsBehind = [];
      this.fill(false);
      this.smoothFactor = Bu.DEFAULT_SPLINE_SMOOTH;
      this._smoother = false;
      calcControlPoints(this);
    }

    Spline.property('smoother', {
      get: function() {
        return this._smoother;
      },
      set: function(val) {
        var oldVal;
        oldVal = this._smoother;
        this._smoother = val;
        if (oldVal !== this._smoother) {
          return calcControlPoints(this);
        }
      }
    });

    Spline.prototype.clone = function() {
      return new Bu.Spline(this.vertices);
    };

    Spline.prototype.addPoint = function(point) {
      this.vertices.push(point);
      return calcControlPoints(this);
    };

    calcControlPoints = function(spline) {
      var i, j, len, len1, len2, p, ref, results, theta, theta1, theta2, xA, xB, yA, yB;
      spline.keyPoints = spline.vertices;
      p = spline.vertices;
      len = p.length;
      if (len >= 1) {
        spline.controlPointsBehind[0] = p[0];
      }
      if (len >= 2) {
        spline.controlPointsAhead[len - 1] = p[len - 1];
      }
      if (len >= 3) {
        results = [];
        for (i = j = 1, ref = len - 1; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          theta1 = Math.atan2(p[i].y - p[i - 1].y, p[i].x - p[i - 1].x);
          theta2 = Math.atan2(p[i + 1].y - p[i].y, p[i + 1].x - p[i].x);
          len1 = Bu.bevel(p[i].y - p[i - 1].y, p[i].x - p[i - 1].x);
          len2 = Bu.bevel(p[i].y - p[i + 1].y, p[i].x - p[i + 1].x);
          theta = theta1 + (theta2 - theta1) * (spline._smoother ? len1 / (len1 + len2) : 0.5);
          if (Math.abs(theta - theta1) > Bu.HALF_PI) {
            theta += Math.PI;
          }
          xA = p[i].x - len1 * spline.smoothFactor * Math.cos(theta);
          yA = p[i].y - len1 * spline.smoothFactor * Math.sin(theta);
          xB = p[i].x + len2 * spline.smoothFactor * Math.cos(theta);
          yB = p[i].y + len2 * spline.smoothFactor * Math.sin(theta);
          spline.controlPointsAhead[i] = new Bu.Point(xA, yA);
          results.push(spline.controlPointsBehind[i] = new Bu.Point(xB, yB));
        }
        return results;
      }
    };

    return Spline;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Triangle = (function(superClass) {
    extend(Triangle, superClass);

    Triangle.prototype.type = 'Triangle';

    Triangle.prototype.fillable = true;

    function Triangle(p1, p2, p3) {
      var x1, x2, x3, y1, y2, y3;
      Triangle.__super__.constructor.call(this);
      if (arguments.length === 6) {
        x1 = arguments[0], y1 = arguments[1], x2 = arguments[2], y2 = arguments[3], x3 = arguments[4], y3 = arguments[5];
        p1 = new Bu.Point(x1, y1);
        p2 = new Bu.Point(x2, y2);
        p3 = new Bu.Point(x3, y3);
      }
      this.lines = [new Bu.Line(p1, p2), new Bu.Line(p2, p3), new Bu.Line(p3, p1)];
      this.points = [p1, p2, p3];
      this.keyPoints = this.points;
      this.on('changed', this.update);
      this.on('changed', (function(_this) {
        return function() {
          var ref;
          return (ref = _this.bounds) != null ? ref.update() : void 0;
        };
      })(this));
    }

    Triangle.prototype.clone = function() {
      return new Bu.Triangle(this.points[0], this.points[1], this.points[2]);
    };

    Triangle.prototype.update = function() {
      this.lines[0].points[0].copy(this.points[0]);
      this.lines[0].points[1].copy(this.points[1]);
      this.lines[1].points[0].copy(this.points[1]);
      this.lines[1].points[1].copy(this.points[2]);
      this.lines[2].points[0].copy(this.points[2]);
      return this.lines[2].points[1].copy(this.points[0]);
    };

    return Triangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Image = (function(superClass) {
    extend(Image, superClass);

    function Image(url, x, y, width, height) {
      this.url = url;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      Image.__super__.constructor.call(this);
      this.type = 'Image';
      this.autoSize = true;
      this.size = new Bu.Size;
      this.position = new Bu.Vector(x, y);
      this.center = new Bu.Vector(x + width / 2, y + height / 2);
      if (width != null) {
        this.size.set(width, height);
        this.autoSize = false;
      }
      this.pivot = new Bu.Vector(0.5, 0.5);
      this._image = new Bu.global.Image;
      this.ready = false;
      this._image.onload = (function(_this) {
        return function(e) {
          if (_this.autoSize) {
            _this.size.set(_this._image.width, _this._image.height);
          }
          return _this.ready = true;
        };
      })(this);
      if (this.url != null) {
        this._image.src = this.url;
      }
    }

    Image.property('image', {
      get: function() {
        return this._image;
      },
      set: function(val) {
        this._image = val;
        return this.ready = true;
      }
    });

    return Image;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.PointText = (function(superClass) {
    extend(PointText, superClass);


    /*
    	options.align:
    	----------------------
    	|   --    0-    +-   |
    	|         |↙00      |
    	|   -0  --+->   +0   |
    	|         ↓          |
    	|   -+    0+    ++   |
    	----------------------
    	for example: text is in the right top of the point, then align = "+-"
     */

    function PointText(text, x, y) {
      var options;
      this.text = text;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      PointText.__super__.constructor.call(this);
      this.type = 'PointText';
      this.strokeStyle = null;
      this.fillStyle = 'black';
      options = Bu.combineOptions(arguments, {
        align: '00'
      });
      this.align = options.align;
      if (options.font != null) {
        this.font = options.font;
      } else if ((options.fontFamily != null) || (options.fontSize != null)) {
        this._fontFamily = options.fontFamily || Bu.DEFAULT_FONT_FAMILY;
        this._fontSize = options.fontSize || Bu.DEFAULT_FONT_SIZE;
        this.font = this._fontSize + "px " + this._fontFamily;
      } else {
        this.font = null;
      }
    }

    PointText.property('align', {
      get: function() {
        return this._align;
      },
      set: function(val) {
        this._align = val;
        return this.setAlign(this._align);
      }
    });

    PointText.property('fontFamily', {
      get: function() {
        return this._fontFamily;
      },
      set: function(val) {
        this._fontFamily = val;
        return this.font = this._fontSize + "px " + this._fontFamily;
      }
    });

    PointText.property('fontSize', {
      get: function() {
        return this._fontSize;
      },
      set: function(val) {
        this._fontSize = val;
        return this.font = this._fontSize + "px " + this._fontFamily;
      }
    });

    PointText.prototype.setAlign = function(align) {
      var alignX, alignY;
      if (align.length === 1) {
        align = '' + align + align;
      }
      alignX = align.substring(0, 1);
      alignY = align.substring(1, 2);
      this.textAlign = (function() {
        switch (alignX) {
          case '-':
            return 'right';
          case '0':
            return 'center';
          case '+':
            return 'left';
        }
      })();
      this.textBaseline = (function() {
        switch (alignY) {
          case '-':
            return 'bottom';
          case '0':
            return 'middle';
          case '+':
            return 'top';
        }
      })();
      return this;
    };

    return PointText;

  })(Bu.Object2D);

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.Animation = (function() {
    function Animation(options) {
      this.from = options.from;
      this.to = options.to;
      this.duration = options.duration || 0.5;
      this.easing = options.easing || false;
      this.repeat = !!options.repeat;
      this.init = options.init;
      this.update = options.update;
      this.finish = options.finish;
    }

    Animation.prototype.applyTo = function(target, args) {
      var task;
      if (!Bu.isArray(args)) {
        args = [args];
      }
      task = new Bu.AnimationTask(this, target, args);
      Bu.animationRunner.add(task);
      return task;
    };

    Animation.prototype.isLegal = function() {
      var key, ref;
      if (!((this.from != null) && (this.to != null))) {
        return true;
      }
      if (Bu.isPlainObject(this.from)) {
        ref = this.from;
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          if (this.to[key] == null) {
            return false;
          }
        }
      } else {
        if (this.to == null) {
          return false;
        }
      }
      return true;
    };

    return Animation;

  })();

  Bu.animations = {
    fadeIn: new Bu.Animation({
      update: function(anim) {
        return this.opacity = anim.t;
      }
    }),
    fadeOut: new Bu.Animation({
      update: function(anim) {
        return this.opacity = 1 - anim.t;
      }
    }),
    spin: new Bu.Animation({
      update: function(anim) {
        return this.rotation = anim.t * Math.PI * 2;
      }
    }),
    spinIn: new Bu.Animation({
      init: function(anim) {
        return anim.data.desScale = anim.arg || 1;
      },
      update: function(anim) {
        this.opacity = anim.t;
        this.rotation = anim.t * Math.PI * 4;
        return this.scale = anim.t * anim.data.desScale;
      }
    }),
    spinOut: new Bu.Animation({
      update: function(anim) {
        this.opacity = 1 - anim.t;
        this.rotation = anim.t * Math.PI * 4;
        return this.scale = 1 - anim.t;
      }
    }),
    blink: new Bu.Animation({
      duration: 0.2,
      from: 0,
      to: 512,
      update: function(anim) {
        var d;
        d = Math.floor(Math.abs(anim.current - 256));
        return this.fillStyle = "rgb(" + d + ", " + d + ", " + d + ")";
      }
    }),
    shake: new Bu.Animation({
      init: function(anim) {
        anim.data.ox = this.position.x;
        return anim.data.range = anim.arg || 20;
      },
      update: function(anim) {
        return this.position.x = Math.sin(anim.t * Math.PI * 8) * anim.data.range + anim.data.ox;
      }
    }),
    jump: new Bu.Animation({
      init: function(anim) {
        anim.data.oy = this.position.y;
        return anim.data.height = anim.arg || 100;
      },
      update: function(anim) {
        return this.position.y = -anim.data.height * Math.sin(anim.t * Math.PI) + anim.data.oy;
      }
    }),
    puff: new Bu.Animation({
      duration: 0.15,
      init: function(anim) {
        anim.from = {
          opacity: this.opacity,
          scale: this.scale.x
        };
        return anim.to = this.opacity === 1 ? {
          opacity: 0,
          scale: this.scale.x * 1.5
        } : {
          opacity: 1,
          scale: this.scale.x / 1.5
        };
      },
      update: function(anim) {
        this.opacity = anim.current.opacity;
        return this.scale = anim.current.scale;
      }
    }),
    clip: new Bu.Animation({
      init: function(anim) {
        if (this.scale.y !== 0) {
          anim.from = this.scale.y;
          return anim.to = 0;
        } else {
          anim.from = this.scale.y;
          return anim.to = this.scale.x;
        }
      },
      update: function(anim) {
        return this.scale.y = anim.current;
      }
    }),
    flipX: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.x;
        return anim.to = -anim.from;
      },
      update: function(anim) {
        return this.scale.x = anim.current;
      }
    }),
    flipY: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.y;
        return anim.to = -anim.from;
      },
      update: function(anim) {
        return this.scale.y = anim.current;
      }
    }),
    moveTo: new Bu.Animation({
      init: function(anim) {
        if (anim.arg != null) {
          anim.from = this.position.x;
          return anim.to = parseFloat(anim.arg);
        } else {
          return console.error('Bu.animations.moveTo need an argument');
        }
      },
      update: function(anim) {
        return this.position.x = anim.current;
      }
    }),
    moveBy: new Bu.Animation({
      init: function(anim) {
        if (anim.args != null) {
          anim.from = this.position.x;
          return anim.to = this.position.x + parseFloat(anim.args);
        } else {
          return console.error('Bu.animations.moveBy need an argument');
        }
      },
      update: function(anim) {
        return this.position.x = anim.current;
      }
    }),
    discolor: new Bu.Animation({
      init: function(anim) {
        var desColor;
        desColor = anim.arg;
        if (Bu.isString(desColor)) {
          desColor = new Bu.Color(desColor);
        }
        anim.from = new Bu.Color(this.fillStyle);
        return anim.to = desColor;
      },
      update: function(anim) {
        return this.fillStyle = anim.current.toRGBA();
      }
    })
  };

}).call(this);

(function() {
  Bu.AnimationRunner = (function() {
    var DEFAULT_EASING_FUNCTION, easingFunctions;

    function AnimationRunner() {
      this.runningAnimations = [];
    }

    AnimationRunner.prototype.add = function(task) {
      task.init();
      if (task.animation.isLegal()) {
        task.startTime = Bu.now();
        return this.runningAnimations.push(task);
      } else {
        return console.error('Bu.AnimationRunner: animation setting is illegal: ', task.animation);
      }
    };

    AnimationRunner.prototype.update = function() {
      var anim, finish, i, len, now, ref, ref1, results, t, task;
      now = Bu.now();
      ref = this.runningAnimations;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        task = ref[i];
        if (task.finished) {
          continue;
        }
        anim = task.animation;
        t = (now - task.startTime) / (anim.duration * 1000);
        if (t > 1) {
          finish = true;
          if (anim.repeat) {
            t = 0;
            task.startTime = Bu.now();
          } else {
            t = 1;
            task.finished = true;
          }
        }
        if (anim.easing === true) {
          t = easingFunctions[DEFAULT_EASING_FUNCTION](t);
        } else if (easingFunctions[anim.easing] != null) {
          t = easingFunctions[anim.easing](t);
        }
        task.t = t;
        task.interpolate();
        anim.update.call(task.target, task);
        if (finish) {
          results.push((ref1 = anim.finish) != null ? ref1.call(task.target, task) : void 0);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    AnimationRunner.prototype.hookUp = function(renderer) {
      return renderer.on('update', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    DEFAULT_EASING_FUNCTION = 'quad';

    easingFunctions = {
      quadIn: function(t) {
        return t * t;
      },
      quadOut: function(t) {
        return t * (2 - t);
      },
      quad: function(t) {
        if (t < 0.5) {
          return 2 * t * t;
        } else {
          return -2 * t * t + 4 * t - 1;
        }
      },
      cubicIn: function(t) {
        return Math.pow(t, 3);
      },
      cubicOut: function(t) {
        return Math.pow(t - 1, 3) + 1;
      },
      cubic: function(t) {
        if (t < 0.5) {
          return 4 * Math.pow(t, 3);
        } else {
          return 4 * Math.pow(t - 1, 3) + 1;
        }
      },
      sineIn: function(t) {
        return Math.sin((t - 1) * Bu.HALF_PI) + 1;
      },
      sineOut: function(t) {
        return Math.sin(t * Bu.HALF_PI);
      },
      sine: function(t) {
        if (t < 0.5) {
          return (Math.sin((t * 2 - 1) * Bu.HALF_PI) + 1) / 2;
        } else {
          return Math.sin((t - 0.5) * Math.PI) / 2 + 0.5;
        }
      }
    };

    return AnimationRunner;

  })();

  Bu.animationRunner = new Bu.AnimationRunner;

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.AnimationTask = (function() {
    var interpolateColor, interpolateNum, interpolateVector;

    function AnimationTask(animation, target, args) {
      this.animation = animation;
      this.target = target;
      this.args = args != null ? args : [];
      this.startTime = 0;
      this.finished = false;
      this.from = Bu.clone(this.animation.from);
      this.current = Bu.clone(this.animation.from);
      this.to = Bu.clone(this.animation.to);
      this.data = {};
      this.t = 0;
      this.arg = this.args[0];
    }

    AnimationTask.prototype.init = function() {
      var ref;
      if ((ref = this.animation.init) != null) {
        ref.call(this.target, this);
      }
      return this.current = Bu.clone(this.from);
    };

    AnimationTask.prototype.restart = function() {
      this.startTime = Bu.now();
      return this.finished = false;
    };

    AnimationTask.prototype.interpolate = function() {
      var key, ref, results;
      if (this.from == null) {
        return;
      }
      if (Bu.isNumber(this.from)) {
        return this.current = interpolateNum(this.from, this.to, this.t);
      } else if (this.from instanceof Bu.Color) {
        return interpolateColor(this.from, this.to, this.t, this.current);
      } else if (this.from instanceof Bu.Vector) {
        return interpolateVector(this.from, this.to, this.t, this.current);
      } else if (Bu.isPlainObject(this.from)) {
        ref = this.from;
        results = [];
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          if (Bu.isNumber(this.from[key])) {
            results.push(this.current[key] = interpolateNum(this.from[key], this.to[key], this.t));
          } else {
            results.push(interpolateObject(this.from[key], this.to[key], this.t, this.current[key]));
          }
        }
        return results;
      } else {
        return console.error("Bu.Animation not support interpolate type: ", this.from);
      }
    };

    interpolateNum = function(a, b, t) {
      return b * t - a * (t - 1);
    };

    interpolateColor = function(a, b, t, c) {
      return c.setRGBA(interpolateNum(a.r, b.r, t), interpolateNum(a.g, b.g, t), interpolateNum(a.b, b.b, t), interpolateNum(a.a, b.a, t));
    };

    interpolateVector = function(a, b, t, c) {
      c.x = interpolateNum(a.x, b.x, t);
      return c.y = interpolateNum(a.y, b.y, t);
    };

    return AnimationTask;

  })();

}).call(this);

(function() {
  Bu.DashFlowManager = (function() {
    function DashFlowManager() {
      this.flowingObjects = [];
    }

    DashFlowManager.prototype.setSpeed = function(target, speed) {
      var i;
      target.dashFlowSpeed = speed;
      i = this.flowingObjects.indexOf(target);
      if (speed !== 0) {
        if (i === -1) {
          return this.flowingObjects.push(target);
        }
      } else {
        if (i > -1) {
          return this.flowingObjects.splice(i, 1);
        }
      }
    };

    DashFlowManager.prototype.update = function() {
      var j, len, o, ref, results;
      ref = this.flowingObjects;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        o = ref[j];
        results.push(o.dashOffset += o.dashFlowSpeed);
      }
      return results;
    };

    DashFlowManager.prototype.hookUp = function(renderer) {
      return renderer.on('update', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    return DashFlowManager;

  })();

  Bu.dashFlowManager = new Bu.DashFlowManager;

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.SpriteSheet = (function() {
    var canvas, clipImage, context;

    function SpriteSheet(url) {
      this.url = url;
      Bu.Event.apply(this);
      this.ready = false;
      this.height = 0;
      this.data = null;
      this.images = [];
      this.frameImages = [];
      $.ajax(this.url, {
        success: (function(_this) {
          return function(text) {
            var baseUrl, countLoaded, i, ref, results;
            _this.data = JSON.parse(text);
            if (_this.data.images == null) {
              _this.data.images = [_this.url.substring(_this.url.lastIndexOf('/'), _this.url.length - 5) + '.png'];
            }
            baseUrl = _this.url.substring(0, _this.url.lastIndexOf('/') + 1);
            ref = _this.data.images;
            results = [];
            for (i in ref) {
              if (!hasProp.call(ref, i)) continue;
              _this.data.images[i] = baseUrl + _this.data.images[i];
              countLoaded = 0;
              _this.images[i] = new Image;
              _this.images[i].onload = function() {
                countLoaded += 1;
                if (countLoaded === _this.data.images.length) {
                  return _this.parseData();
                }
              };
              results.push(_this.images[i].src = _this.data.images[i]);
            }
            return results;
          };
        })(this)
      });
    }

    SpriteSheet.prototype.parseData = function() {
      var frameIndex, frames, h, i, j, k, ref, w, x, y;
      frames = this.data.frames;
      for (i in frames) {
        if (!hasProp.call(frames, i)) continue;
        for (j = k = 0; k <= 4; j = ++k) {
          if (frames[i][j] == null) {
            frames[i][j] = ((ref = frames[i - 1]) != null ? ref[j] : void 0) != null ? frames[i - 1][j] : 0;
          }
        }
        x = frames[i][0];
        y = frames[i][1];
        w = frames[i][2];
        h = frames[i][3];
        frameIndex = frames[i][4];
        this.frameImages[i] = clipImage(this.images[frameIndex], x, y, w, h);
        if (this.height === 0) {
          this.height = h;
        }
      }
      this.ready = true;
      return this.trigger('loaded');
    };

    SpriteSheet.prototype.getFrameImage = function(key, index) {
      var animation;
      if (index == null) {
        index = 0;
      }
      if (!this.ready) {
        return null;
      }
      animation = this.data.animations[key];
      if (animation == null) {
        return null;
      }
      return this.frameImages[animation.frames[index]];
    };

    SpriteSheet.prototype.measureTextWidth = function(text) {
      var char, k, len, width;
      width = 0;
      for (k = 0, len = text.length; k < len; k++) {
        char = text[k];
        width += this.getFrameImage(char).width;
      }
      return width;
    };

    canvas = document.createElement('canvas');

    context = canvas.getContext('2d');

    clipImage = function(image, x, y, w, h) {
      var newImage;
      canvas.width = w;
      canvas.height = h;
      context.drawImage(image, x, y, w, h, 0, 0, w, h);
      newImage = new Image();
      newImage.src = canvas.toDataURL();
      return newImage;
    };

    return SpriteSheet;

  })();

}).call(this);

(function() {
  Bu.InputManager = (function() {
    function InputManager() {
      this.keyStates = [];
      window.addEventListener('keydown', (function(_this) {
        return function(e) {
          return _this.keyStates[e.keyCode] = true;
        };
      })(this));
      window.addEventListener('keyup', (function(_this) {
        return function(e) {
          return _this.keyStates[e.keyCode] = false;
        };
      })(this));
    }

    InputManager.prototype.isKeyDown = function(key) {
      var keyCode;
      keyCode = this.keyToKeyCode(key);
      return this.keyStates[keyCode];
    };

    InputManager.prototype.keyToKeyCode = function(key) {
      var keyCode;
      key = this.keyAliasToKeyMap[key] || key;
      return keyCode = this.keyToKeyCodeMap[key];
    };

    InputManager.prototype.handleAppEvents = function(app, events) {
      var key, keyCode, keydownListeners, keyupListeners, results, type;
      keydownListeners = {};
      keyupListeners = {};
      window.addEventListener('keydown', (function(_this) {
        return function(e) {
          var ref;
          return (ref = keydownListeners[e.keyCode]) != null ? ref.call(app, e) : void 0;
        };
      })(this));
      window.addEventListener('keyup', (function(_this) {
        return function(e) {
          var ref;
          return (ref = keyupListeners[e.keyCode]) != null ? ref.call(app, e) : void 0;
        };
      })(this));
      results = [];
      for (type in events) {
        if (type === 'mousedown' || type === 'mousemove' || type === 'mouseup' || type === 'mousewheel' || type === 'keydown' || type === 'keyup') {
          results.push(app.$renderer.dom.addEventListener(type, events[type].bind(app)));
        } else if (type.indexOf('keydown.') === 0) {
          key = type.substring(8);
          keyCode = this.keyToKeyCode(key);
          results.push(keydownListeners[keyCode] = events[type]);
        } else if (type.indexOf('keyup.') === 0) {
          key = type.substring(6);
          keyCode = this.keyToKeyCode(key);
          results.push(keyupListeners[keyCode] = events[type]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    InputManager.prototype.keyToKeyCodeMap = {
      Backspace: 8,
      Tab: 9,
      Enter: 13,
      Shift: 16,
      Control: 17,
      Alt: 18,
      CapsLock: 20,
      Escape: 27,
      ' ': 32,
      PageUp: 33,
      PageDown: 34,
      End: 35,
      Home: 36,
      ArrowLeft: 37,
      ArrowUp: 38,
      ArrowRight: 39,
      ArrowDown: 40,
      Delete: 46,
      1: 49,
      2: 50,
      3: 51,
      4: 52,
      5: 53,
      6: 54,
      7: 55,
      8: 56,
      9: 57,
      A: 65,
      B: 66,
      C: 67,
      D: 68,
      E: 69,
      F: 70,
      G: 71,
      H: 72,
      I: 73,
      J: 74,
      K: 75,
      L: 76,
      M: 77,
      N: 78,
      O: 79,
      P: 80,
      Q: 81,
      R: 82,
      S: 83,
      T: 84,
      U: 85,
      V: 86,
      W: 87,
      X: 88,
      Y: 89,
      Z: 90,
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123,
      '`': 192,
      '=': 187,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      ';': 186,
      "'": 222,
      '[': 219,
      ']': 221,
      '\\': 220
    };

    InputManager.prototype.keyAliasToKeyMap = {
      Ctrl: 'Control',
      Ctl: 'Control',
      Esc: 'Escape',
      Space: ' ',
      PgUp: 'PageUp',
      'Page Up': 'PageUp',
      PgDn: 'PageDown',
      'Page Down': 'PageDown',
      Left: 'ArrowLeft',
      Up: 'ArrowUp',
      Right: 'ArrowRight',
      Down: 'ArrowDown',
      Del: 'Delete'
    };

    return InputManager;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bu.MouseControl = (function() {
    var scaleAnimation, translateAnimation;

    scaleAnimation = new Bu.Animation({
      duration: 0.2,
      init: function(anim) {
        if (anim.arg == null) {
          anim.arg = 1;
        }
        anim.from = this.scale.clone();
        return anim.to = this.scale.clone().multiplyScalar(parseFloat(anim.arg));
      },
      update: function(anim) {
        return this.scale = anim.current;
      }
    });

    translateAnimation = new Bu.Animation({
      duration: 0.2,
      init: function(anim) {
        if (anim.arg == null) {
          anim.arg = new Bu.Vector;
        }
        anim.from = this.position.clone();
        return anim.to = this.position.clone().add(anim.arg);
      },
      update: function(anim) {
        return this.position.copy(anim.current);
      }
    });

    function MouseControl(camera, dom) {
      this.camera = camera;
      this.onMouseWheel = bind(this.onMouseWheel, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.zoomScaleAnim = scaleAnimation.applyTo(this.camera);
      this.zoomTransAnim = translateAnimation.applyTo(this.camera);
      this.smoothZooming = true;
      this.desScale = new Bu.Vector(1, 1);
      dom.addEventListener('mousemove', this.onMouseMove);
      dom.addEventListener('mousewheel', this.onMouseWheel);
    }

    MouseControl.prototype.onMouseMove = function(e) {
      var dx, dy, scale;
      if (e.buttons === Bu.MOUSE.LEFT) {
        scale = this.camera.scale.x;
        dx = -e.movementX * scale;
        dy = -e.movementY * scale;
        return this.camera.translate(dx, dy);
      }
    };

    MouseControl.prototype.onMouseWheel = function(e) {
      var deltaScaleAll, deltaScaleStep, dx, dy, mx, my;
      deltaScaleStep = Math.pow(1.25, -e.wheelDelta / 120);
      this.desScale.multiplyScalar(deltaScaleStep);
      deltaScaleAll = this.desScale.x / this.camera.scale.x;
      mx = e.offsetX - $(e.target).width() / 2;
      my = e.offsetY - $(e.target).height() / 2;
      dx = -mx * (deltaScaleAll - 1) * this.camera.scale.x;
      dy = -my * (deltaScaleAll - 1) * this.camera.scale.y;
      if (this.smoothZooming) {
        this.zoomScaleAnim.from.copy(this.camera.scale);
        this.zoomScaleAnim.to.copy(this.desScale);
        this.zoomScaleAnim.restart();
        this.zoomTransAnim.from.copy(this.camera.position);
        this.zoomTransAnim.to.set(this.camera.position.x + dx, this.camera.position.y + dy);
        return this.zoomTransAnim.restart();
      } else {
        this.camera.translate(dx, dy);
        return this.camera.scale.copy(this.desScale);
      }
    };

    return MouseControl;

  })();

}).call(this);

(function() {
  var G,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    hasProp = {}.hasOwnProperty;

  Bu.geometryAlgorithm = G = {
    inject: function() {
      return this.injectInto(['point', 'line', 'circle', 'ellipse', 'triangle', 'rectangle', 'fan', 'bow', 'polygon', 'polyline']);
    },
    injectInto: function(shapes) {
      if (Bu.isString(shapes)) {
        shapes = [shapes];
      }
      if (indexOf.call(shapes, 'point') >= 0) {
        Bu.Point.prototype.inCircle = function(circle) {
          return G.pointInCircle(this, circle);
        };
        Bu.Point.prototype.distanceTo = function(point) {
          return G.distanceFromPointToPoint(this, point);
        };
        Bu.Point.prototype.isNear = function(target, limit) {
          if (limit == null) {
            limit = Bu.DEFAULT_NEAR_DIST;
          }
          switch (target.type) {
            case 'Point':
              return G.pointNearPoint(this, target, limit);
            case 'Line':
              return G.pointNearLine(this, target, limit);
            case 'Polyline':
              return G.pointNearPolyline(this, target, limit);
          }
        };
        Bu.Point.interpolate = G.interpolateBetweenTwoPoints;
      }
      if (indexOf.call(shapes, 'line') >= 0) {
        Bu.Line.prototype.distanceTo = function(point) {
          return G.distanceFromPointToLine(point, this);
        };
        Bu.Line.prototype.isTwoPointsSameSide = function(p1, p2) {
          return G.twoPointsSameSideOfLine(p1, p2, this);
        };
        Bu.Line.prototype.footPointFrom = function(point, saveTo) {
          return G.footPointFromPointToLine(point, this, saveTo);
        };
        Bu.Line.prototype.getCrossPointWith = function(line) {
          return G.getCrossPointOfTwoLines(line, this);
        };
        Bu.Line.prototype.isCrossWithLine = function(line) {
          return G.isTwoLinesCross(line, this);
        };
      }
      if (indexOf.call(shapes, 'circle') >= 0) {
        Bu.Circle.prototype._containsPoint = function(point) {
          return G.pointInCircle(point, this);
        };
      }
      if (indexOf.call(shapes, 'ellipse') >= 0) {
        Bu.Ellipse.prototype._containsPoint = function(point) {
          return G.pointInEllipse(point, this);
        };
      }
      if (indexOf.call(shapes, 'triangle') >= 0) {
        Bu.Triangle.prototype._containsPoint = function(point) {
          return G.pointInTriangle(point, this);
        };
        Bu.Triangle.prototype.area = function() {
          return G.calcTriangleArea(this);
        };
      }
      if (indexOf.call(shapes, 'rectangle') >= 0) {
        Bu.Rectangle.prototype.containsPoint = function(point) {
          return G.pointInRectangle(point, this);
        };
      }
      if (indexOf.call(shapes, 'fan') >= 0) {
        Bu.Fan.prototype._containsPoint = function(point) {
          return G.pointInFan(point, this);
        };
      }
      if (indexOf.call(shapes, 'bow') >= 0) {
        Bu.Bow.prototype._containsPoint = function(point) {
          return G.pointInBow(point, this);
        };
      }
      if (indexOf.call(shapes, 'polygon') >= 0) {
        Bu.Polygon.prototype._containsPoint = function(point) {
          return G.pointInPolygon(point, this);
        };
      }
      if (indexOf.call(shapes, 'polyline') >= 0) {
        Bu.Polyline.prototype.length = 0;
        Bu.Polyline.prototype.pointNormalizedPos = [];
        Bu.Polyline.prototype.calcLength = function() {
          return this.length = G.calcPolylineLength(this);
        };
        Bu.Polyline.prototype.calcPointNormalizedPos = function() {
          return G.calcNormalizedVerticesPosOfPolyline(this);
        };
        Bu.Polyline.prototype.getNormalizedPos = function(index) {
          if (index != null) {
            return this.pointNormalizedPos[index];
          } else {
            return this.pointNormalizedPos;
          }
        };
        return Bu.Polyline.prototype.compress = function(strength) {
          if (strength == null) {
            strength = 0.8;
          }
          return G.compressPolyline(this, strength);
        };
      }
    },
    pointNearPoint: function(point, target, limit) {
      if (limit == null) {
        limit = Bu.DEFAULT_NEAR_DIST;
      }
      return point.distanceTo(target) < limit;
    },
    pointNearLine: function(point, line, limit) {
      var footPoint, isBetween1, isBetween2, verticalDist;
      if (limit == null) {
        limit = Bu.DEFAULT_NEAR_DIST;
      }
      verticalDist = line.distanceTo(point);
      footPoint = line.footPointFrom(point);
      isBetween1 = footPoint.distanceTo(line.points[0]) < line.length + limit;
      isBetween2 = footPoint.distanceTo(line.points[1]) < line.length + limit;
      return verticalDist < limit && isBetween1 && isBetween2;
    },
    pointNearPolyline: function(point, polyline, limit) {
      var j, len1, line, ref;
      if (limit == null) {
        limit = Bu.DEFAULT_NEAR_DIST;
      }
      ref = polyline.lines;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        line = ref[j];
        if (G.pointNearLine(point, line, limit)) {
          return true;
        }
      }
      return false;
    },
    pointInCircle: function(point, circle) {
      var dx, dy;
      dx = point.x - circle.cx;
      dy = point.y - circle.cy;
      return Bu.bevel(dx, dy) < circle.radius;
    },
    pointInEllipse: function(point, ellipse) {
      return Bu.bevel(point.x / ellipse.radiusX, point.y / ellipse.radiusY) < 1;
    },
    pointInRectangle: function(point, rectangle) {
      return point.x > rectangle.pointLT.x && point.y > rectangle.pointLT.y && point.x < rectangle.pointLT.x + rectangle.size.width && point.y < rectangle.pointLT.y + rectangle.size.height;
    },
    pointInTriangle: function(point, triangle) {
      return G.twoPointsSameSideOfLine(point, triangle.points[2], triangle.lines[0]) && G.twoPointsSameSideOfLine(point, triangle.points[0], triangle.lines[1]) && G.twoPointsSameSideOfLine(point, triangle.points[1], triangle.lines[2]);
    },
    pointInFan: function(point, fan) {
      var a, dx, dy;
      dx = point.x - fan.cx;
      dy = point.y - fan.cy;
      a = Math.atan2(point.y - fan.cy, point.x - fan.cx);
      while (a < fan.aFrom) {
        a += Bu.TWO_PI;
      }
      return Bu.bevel(dx, dy) < fan.radius && a > fan.aFrom && a < fan.aTo;
    },
    pointInBow: function(point, bow) {
      var sameSide, smallThanHalfCircle;
      if (Bu.bevel(bow.cx - point.x, bow.cy - point.y) < bow.radius) {
        sameSide = bow.string.isTwoPointsSameSide(bow.center, point);
        smallThanHalfCircle = bow.aTo - bow.aFrom < Math.PI;
        return sameSide ^ smallThanHalfCircle;
      } else {
        return false;
      }
    },
    pointInPolygon: function(point, polygon) {
      var j, len1, ref, triangle;
      ref = polygon.triangles;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        triangle = ref[j];
        if (triangle.containsPoint(point)) {
          return true;
        }
      }
      return false;
    },
    distanceFromPointToPoint: function(point1, point2) {
      return Bu.bevel(point1.x - point2.x, point1.y - point2.y);
    },
    distanceFromPointToLine: function(point, line) {
      var a, b, p1, p2;
      p1 = line.points[0];
      p2 = line.points[1];
      a = (p1.y - p2.y) / (p1.x - p2.x);
      b = p1.y - a * p1.x;
      return Math.abs(a * point.x + b - point.y) / Math.sqrt(a * a + 1);
    },
    interpolateBetweenTwoPoints: function(p1, p2, k, p3) {
      var x, y;
      x = p1.x + (p2.x - p1.x) * k;
      y = p1.y + (p2.y - p1.y) * k;
      if (p3 != null) {
        return p3.set(x, y);
      } else {
        return new Bu.Point(x, y);
      }
    },
    twoPointsSameSideOfLine: function(p1, p2, line) {
      var pA, pB, y01, y02;
      pA = line.points[0];
      pB = line.points[1];
      if (pA.x === pB.x) {
        return (p1.x - pA.x) * (p2.x - pA.x) > 0;
      } else {
        y01 = (pA.y - pB.y) * (p1.x - pA.x) / (pA.x - pB.x) + pA.y;
        y02 = (pA.y - pB.y) * (p2.x - pA.x) / (pA.x - pB.x) + pA.y;
        return (p1.y - y01) * (p2.y - y02) > 0;
      }
    },
    footPointFromPointToLine: function(point, line, saveTo) {
      var A, B, m, p1, p2, x, y;
      if (saveTo == null) {
        saveTo = new Bu.Point;
      }
      p1 = line.points[0];
      p2 = line.points[1];
      A = (p1.y - p2.y) / (p1.x - p2.x);
      B = p1.y - A * p1.x;
      m = point.x + A * point.y;
      x = (m - A * B) / (A * A + 1);
      y = A * x + B;
      saveTo.set(x, y);
      return saveTo;
    },
    getCrossPointOfTwoLines: function(line1, line2) {
      var a1, a2, b1, b2, c1, c2, det, p1, p2, q1, q2, ref, ref1;
      ref = line1.points, p1 = ref[0], p2 = ref[1];
      ref1 = line2.points, q1 = ref1[0], q2 = ref1[1];
      a1 = p2.y - p1.y;
      b1 = p1.x - p2.x;
      c1 = (a1 * p1.x) + (b1 * p1.y);
      a2 = q2.y - q1.y;
      b2 = q1.x - q2.x;
      c2 = (a2 * q1.x) + (b2 * q1.y);
      det = (a1 * b2) - (a2 * b1);
      return new Bu.Point(((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det);
    },
    isTwoLinesCross: function(line1, line2) {
      var d, x0, x1, x2, x3, x4, y0, y1, y2, y3, y4;
      x1 = line1.points[0].x;
      y1 = line1.points[0].y;
      x2 = line1.points[1].x;
      y2 = line1.points[1].y;
      x3 = line2.points[0].x;
      y3 = line2.points[0].y;
      x4 = line2.points[1].x;
      y4 = line2.points[1].y;
      d = (y2 - y1) * (x4 - x3) - (y4 - y3) * (x2 - x1);
      if (d === 0) {
        return false;
      } else {
        x0 = ((x2 - x1) * (x4 - x3) * (y3 - y1) + (y2 - y1) * (x4 - x3) * x1 - (y4 - y3) * (x2 - x1) * x3) / d;
        y0 = ((y2 - y1) * (y4 - y3) * (x3 - x1) + (x2 - x1) * (y4 - y3) * y1 - (x4 - x3) * (y2 - y1) * y3) / -d;
      }
      return (x0 - x1) * (x0 - x2) < 0 && (x0 - x3) * (x0 - x4) < 0 && (y0 - y1) * (y0 - y2) < 0 && (y0 - y3) * (y0 - y4) < 0;
    },
    calcPolylineLength: function(polyline) {
      var i, j, len, ref;
      len = 0;
      if (polyline.vertices.length >= 2) {
        for (i = j = 1, ref = polyline.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          len += polyline.vertices[i].distanceTo(polyline.vertices[i - 1]);
        }
      }
      return len;
    },
    calcNormalizedVerticesPosOfPolyline: function(polyline) {
      var currPos, i, j, ref, results;
      currPos = 0;
      polyline.pointNormalizedPos[0] = 0;
      results = [];
      for (i = j = 1, ref = polyline.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        currPos += polyline.vertices[i].distanceTo(polyline.vertices[i - 1]) / polyline.length;
        results.push(polyline.pointNormalizedPos[i] = currPos);
      }
      return results;
    },
    compressPolyline: function(polyline, strength) {
      var compressed, i, obliqueAngle, pA, pB, pM, ref, ref1;
      compressed = [];
      ref = polyline.vertices;
      for (i in ref) {
        if (!hasProp.call(ref, i)) continue;
        if (i < 2) {
          compressed[i] = polyline.vertices[i];
        } else {
          ref1 = compressed.slice(-2), pA = ref1[0], pM = ref1[1];
          pB = polyline.vertices[i];
          obliqueAngle = Math.abs(Math.atan2(pA.y - pM.y, pA.x - pM.x) - Math.atan2(pM.y - pB.y, pM.x - pB.x));
          if (obliqueAngle < strength * strength * Bu.HALF_PI) {
            compressed[compressed.length - 1] = pB;
          } else {
            compressed.push(pB);
          }
        }
      }
      polyline.vertices = compressed;
      polyline.keyPoints = polyline.vertices;
      return polyline;
    },
    calcTriangleArea: function(triangle) {
      var a, b, c, ref;
      ref = triangle.points, a = ref[0], b = ref[1], c = ref[2];
      return Math.abs(((b.x - a.x) * (c.y - a.y)) - ((c.x - a.x) * (b.y - a.y))) / 2;
    }
  };

  G.inject();

}).call(this);

(function() {
  Bu.ShapeRandomizer = (function() {
    var MARGIN;

    MARGIN = 30;

    ShapeRandomizer.prototype.rangeX = 0;

    ShapeRandomizer.prototype.rangeY = 0;

    ShapeRandomizer.prototype.rangeWidth = 800;

    ShapeRandomizer.prototype.rangeHeight = 450;

    function ShapeRandomizer() {}

    ShapeRandomizer.prototype.randomX = function() {
      return Bu.rand(this.rangeX + MARGIN, this.rangeX + this.rangeWidth - MARGIN * 2);
    };

    ShapeRandomizer.prototype.randomY = function() {
      return Bu.rand(this.rangeY + MARGIN, this.rangeY + this.rangeHeight - MARGIN * 2);
    };

    ShapeRandomizer.prototype.randomRadius = function() {
      return Bu.rand(10, Math.min(this.rangeX + this.rangeWidth, this.rangeY + this.rangeHeight) / 2);
    };

    ShapeRandomizer.prototype.setRange = function(a, b, c, d) {
      if (c != null) {
        this.rangeX = a;
        this.rangeY = b;
        this.rangeWidth = c;
        this.rangeHeight = d;
      } else {
        this.rangeWidth = a;
        this.rangeHeight = b;
      }
      return this;
    };

    ShapeRandomizer.prototype.generate = function(type) {
      switch (type) {
        case 'circle':
          return this.generateCircle();
        case 'bow':
          return this.generateBow();
        case 'triangle':
          return this.generateTriangle();
        case 'rectangle':
          return this.generateRectangle();
        case 'fan':
          return this.generateFan();
        case 'polygon':
          return this.generatePolygon();
        case 'line':
          return this.generateLine();
        case 'polyline':
          return this.generatePolyline();
        default:
          return console.warn('not support shape: ' + type);
      }
    };

    ShapeRandomizer.prototype.randomize = function(shape) {
      var j, len, s;
      if (Bu.isArray(shape)) {
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          this.randomize(s);
        }
      } else {
        switch (shape.type) {
          case 'Circle':
            this.randomizeCircle(shape);
            break;
          case 'Ellipse':
            this.randomizeEllipse(shape);
            break;
          case 'Bow':
            this.randomizeBow(shape);
            break;
          case 'Triangle':
            this.randomizeTriangle(shape);
            break;
          case 'Rectangle':
            this.randomizeRectangle(shape);
            break;
          case 'Fan':
            this.randomizeFan(shape);
            break;
          case 'Polygon':
            this.randomizePolygon(shape);
            break;
          case 'Line':
            this.randomizeLine(shape);
            break;
          case 'Polyline':
            this.randomizePolyline(shape);
            break;
          default:
            console.warn('not support shape: ' + shape.type);
        }
      }
      return this;
    };

    ShapeRandomizer.prototype.randomizePosition = function(shape) {
      shape.position.x = this.randomX();
      shape.position.y = this.randomY();
      shape.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generateCircle = function() {
      var circle;
      circle = new Bu.Circle(this.randomRadius(), this.randomX(), this.randomY());
      circle.center.label = 'O';
      return circle;
    };

    ShapeRandomizer.prototype.randomizeCircle = function(circle) {
      circle.cx = this.randomX();
      circle.cy = this.randomY();
      circle.radius = this.randomRadius();
      return this;
    };

    ShapeRandomizer.prototype.generateEllipse = function() {
      var ellipse;
      ellipse = new Bu.Ellipse(this.randomRadius(), this.randomRadius());
      this.randomizePosition(ellipse);
      return ellipse;
    };

    ShapeRandomizer.prototype.randomizeEllipse = function(ellipse) {
      ellipse.radiusX = this.randomRadius();
      ellipse.radiusY = this.randomRadius();
      this.randomizePosition(ellipse);
      return this;
    };

    ShapeRandomizer.prototype.generateBow = function() {
      var aFrom, aTo, bow;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      bow = new Bu.Bow(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      bow.string.points[0].label = 'A';
      bow.string.points[1].label = 'B';
      return bow;
    };

    ShapeRandomizer.prototype.randomizeBow = function(bow) {
      var aFrom, aTo;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      bow.cx = this.randomX();
      bow.cy = this.randomY();
      bow.radius = this.randomRadius();
      bow.aFrom = aFrom;
      bow.aTo = aTo;
      bow.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generateFan = function() {
      var aFrom, aTo, fan;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      fan = new Bu.Fan(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      fan.center.label = 'O';
      fan.string.points[0].label = 'A';
      fan.string.points[1].label = 'B';
      return fan;
    };

    ShapeRandomizer.prototype.randomizeFan = ShapeRandomizer.prototype.randomizeBow;

    ShapeRandomizer.prototype.generateTriangle = function() {
      var i, j, points, triangle;
      points = [];
      for (i = j = 0; j <= 2; i = ++j) {
        points[i] = new Bu.Point(this.randomX(), this.randomY());
      }
      triangle = new Bu.Triangle(points[0], points[1], points[2]);
      triangle.points[0].label = 'A';
      triangle.points[1].label = 'B';
      triangle.points[2].label = 'C';
      return triangle;
    };

    ShapeRandomizer.prototype.randomizeTriangle = function(triangle) {
      var i, j;
      for (i = j = 0; j <= 2; i = ++j) {
        triangle.points[i].set(this.randomX(), this.randomY());
      }
      triangle.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generateRectangle = function() {
      var rect;
      rect = new Bu.Rectangle(Bu.rand(this.rangeWidth), Bu.rand(this.rangeHeight), Bu.rand(this.rangeWidth / 2), Bu.rand(this.rangeHeight / 2));
      rect.pointLT.label = 'A';
      rect.pointRT.label = 'B';
      rect.pointRB.label = 'C';
      rect.pointLB.label = 'D';
      return rect;
    };

    ShapeRandomizer.prototype.randomizeRectangle = function(rectangle) {
      rectangle.set(this.randomX(), this.randomY(), this.randomX(), this.randomY());
      rectangle.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generatePolygon = function() {
      var i, j, point, points;
      points = [];
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        points.push(point);
      }
      return new Bu.Polygon(points);
    };

    ShapeRandomizer.prototype.randomizePolygon = function(polygon) {
      var j, len, ref, vertex;
      ref = polygon.vertices;
      for (j = 0, len = ref.length; j < len; j++) {
        vertex = ref[j];
        vertex.set(this.randomX(), this.randomY());
      }
      polygon.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generateLine = function() {
      var line;
      line = new Bu.Line(this.randomX(), this.randomY(), this.randomX(), this.randomY());
      line.points[0].label = 'A';
      line.points[1].label = 'B';
      return line;
    };

    ShapeRandomizer.prototype.randomizeLine = function(line) {
      var j, len, point, ref;
      ref = line.points;
      for (j = 0, len = ref.length; j < len; j++) {
        point = ref[j];
        point.set(this.randomX(), this.randomY());
      }
      line.trigger('changed');
      return this;
    };

    ShapeRandomizer.prototype.generatePolyline = function() {
      var i, j, point, polyline;
      polyline = new Bu.Polyline;
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        polyline.addPoint(point);
      }
      return polyline;
    };

    ShapeRandomizer.prototype.randomizePolyline = function(polyline) {
      var j, len, ref, vertex;
      ref = polyline.vertices;
      for (j = 0, len = ref.length; j < len; j++) {
        vertex = ref[j];
        vertex.set(this.randomX(), this.randomY());
      }
      polyline.trigger('changed');
      return this;
    };

    return ShapeRandomizer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1LmNvZmZlZSIsIkJvdW5kcy5jb2ZmZWUiLCJDb2xvci5jb2ZmZWUiLCJTaXplLmNvZmZlZSIsIlZlY3Rvci5jb2ZmZWUiLCJFdmVudC5jb2ZmZWUiLCJNaWNyb0pRdWVyeS5jb2ZmZWUiLCJPYmplY3QyRC5jb2ZmZWUiLCJTdHlsZWQuY29mZmVlIiwiQXBwLmNvZmZlZSIsIkF1ZGlvLmNvZmZlZSIsIkNhbWVyYS5jb2ZmZWUiLCJSZW5kZXJlci5jb2ZmZWUiLCJTY2VuZS5jb2ZmZWUiLCJCb3cuY29mZmVlIiwiQ2lyY2xlLmNvZmZlZSIsIkVsbGlwc2UuY29mZmVlIiwiRmFuLmNvZmZlZSIsIkxpbmUuY29mZmVlIiwiUG9pbnQuY29mZmVlIiwiUG9seWdvbi5jb2ZmZWUiLCJQb2x5bGluZS5jb2ZmZWUiLCJSZWN0YW5nbGUuY29mZmVlIiwiU3BsaW5lLmNvZmZlZSIsIlRyaWFuZ2xlLmNvZmZlZSIsIkltYWdlLmNvZmZlZSIsIlBvaW50VGV4dC5jb2ZmZWUiLCJBbmltYXRpb24uY29mZmVlIiwiQW5pbWF0aW9uUnVubmVyLmNvZmZlZSIsIkFuaW1hdGlvblRhc2suY29mZmVlIiwiRGFzaEZsb3dNYW5hZ2VyLmNvZmZlZSIsIlNwcml0ZVNoZWV0LmNvZmZlZSIsIklucHV0TWFuYWdlci5jb2ZmZWUiLCJNb3VzZUNvbnRyb2wuY29mZmVlIiwiZ2VvbWV0cnlBbGdvcml0aG0uY29mZmVlIiwiU2hhcGVSYW5kb21pemVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUE7QUFBQSxNQUFBLDBDQUFBO0lBQUE7O0VBQUEsTUFBQSxHQUFTLE1BQUEsSUFBVTs7RUFDbkIsTUFBTSxDQUFDLEVBQVAsR0FBWTtJQUFDLFFBQUEsTUFBRDs7O0VBUVosRUFBRSxDQUFDLE9BQUgsR0FBYTs7RUFHYixFQUFFLENBQUMsdUJBQUgsR0FBNkIsQ0FBQyxRQUFELEVBQVcsS0FBWCxFQUFrQixJQUFsQjs7RUFHN0IsRUFBRSxDQUFDLE9BQUgsR0FBYSxJQUFJLENBQUMsRUFBTCxHQUFVOztFQUN2QixFQUFFLENBQUMsTUFBSCxHQUFZLElBQUksQ0FBQyxFQUFMLEdBQVU7O0VBR3RCLEVBQUUsQ0FBQyxtQkFBSCxHQUF5Qjs7RUFDekIsRUFBRSxDQUFDLGlCQUFILEdBQXVCOztFQUN2QixFQUFFLENBQUMsWUFBSCxHQUFrQjs7RUFHbEIsRUFBRSxDQUFDLGlCQUFILEdBQXVCOztFQUd2QixFQUFFLENBQUMsa0JBQUgsR0FBd0I7O0VBR3hCLEVBQUUsQ0FBQyxxQkFBSCxHQUEyQjs7RUFHM0IsRUFBRSxDQUFDLGlCQUFILEdBQXVCOztFQUd2QixFQUFFLENBQUMsS0FBSCxHQUNDO0lBQUEsSUFBQSxFQUFRLENBQVI7SUFDQSxJQUFBLEVBQVEsQ0FEUjtJQUVBLEtBQUEsRUFBTyxDQUZQO0lBR0EsTUFBQSxFQUFTLENBSFQ7OztFQVdELEVBQUUsQ0FBQyxPQUFILEdBQWEsU0FBQTtBQUNaLFFBQUE7SUFBQSxFQUFBLEdBQUs7SUFDTCxJQUFxQixPQUFPLFNBQVUsQ0FBQSxDQUFBLENBQWpCLEtBQXVCLFFBQTVDO01BQUEsRUFBQSxHQUFLLFNBQVUsQ0FBQSxDQUFBLEVBQWY7O0lBQ0EsR0FBQSxHQUFNO0FBQ04sU0FBQSxvQ0FBQTs7TUFDQyxHQUFBLElBQU87QUFEUjtXQUVBLEdBQUEsR0FBTSxFQUFFLENBQUM7RUFORzs7RUFTYixFQUFFLENBQUMsS0FBSCxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7V0FDVixJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBQSxHQUFJLENBQXRCO0VBRFU7O0VBSVgsRUFBRSxDQUFDLEtBQUgsR0FBVyxTQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsR0FBVDtJQUNWLElBQVcsQ0FBQSxHQUFJLEdBQWY7TUFBQSxDQUFBLEdBQUksSUFBSjs7SUFDQSxJQUFXLENBQUEsR0FBSSxHQUFmO01BQUEsQ0FBQSxHQUFJLElBQUo7O1dBQ0E7RUFIVTs7RUFNWCxFQUFFLENBQUMsSUFBSCxHQUFVLFNBQUMsSUFBRCxFQUFPLEVBQVA7SUFDVCxJQUFPLFVBQVA7TUFDQyxFQUFBLEdBQUs7TUFDTCxJQUFBLEdBQU8sRUFGUjs7V0FHQSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxFQUFBLEdBQUssSUFBTixDQUFoQixHQUE4QjtFQUpyQjs7RUFPVixFQUFFLENBQUMsR0FBSCxHQUFTLFNBQUMsQ0FBRDtXQUFPLENBQUMsQ0FBQSxHQUFJLEdBQUosR0FBVSxJQUFJLENBQUMsRUFBaEIsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QixDQUE1QjtFQUFQOztFQUdULEVBQUUsQ0FBQyxHQUFILEdBQVMsU0FBQyxDQUFEO1dBQU8sQ0FBQSxHQUFJLElBQUksQ0FBQyxFQUFULEdBQWM7RUFBckI7O0VBR1QsRUFBRSxDQUFDLEdBQUgsR0FBWSw2QkFBSCxHQUErQixTQUFBO1dBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBQTtFQUFILENBQS9CLEdBQW1FLFNBQUE7V0FBRyxJQUFJLENBQUMsR0FBTCxDQUFBO0VBQUg7O0VBRzVFLEVBQUUsQ0FBQyxjQUFILEdBQW9CLFNBQUMsSUFBRCxFQUFPLGNBQVA7QUFDbkIsUUFBQTtJQUFBLElBQTJCLHNCQUEzQjtNQUFBLGNBQUEsR0FBaUIsR0FBakI7O0lBQ0EsWUFBQSxHQUFlLElBQUssQ0FBQSxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWQ7SUFDcEIsSUFBRyxFQUFFLENBQUMsYUFBSCxDQUFpQixZQUFqQixDQUFIO0FBQ0MsV0FBQSxpQkFBQTtZQUEyQjtVQUMxQixjQUFlLENBQUEsQ0FBQSxDQUFmLEdBQW9CLFlBQWEsQ0FBQSxDQUFBOztBQURsQyxPQUREOztBQUdBLFdBQU87RUFOWTs7RUFTcEIsRUFBRSxDQUFDLFFBQUgsR0FBYyxTQUFDLENBQUQ7V0FDYixPQUFPLENBQVAsS0FBWTtFQURDOztFQUlkLEVBQUUsQ0FBQyxRQUFILEdBQWMsU0FBQyxDQUFEO1dBQ2IsT0FBTyxDQUFQLEtBQVk7RUFEQzs7RUFJZCxFQUFFLENBQUMsYUFBSCxHQUFtQixTQUFDLENBQUQ7V0FDbEIsQ0FBQSxZQUFhLE1BQWIsSUFBd0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFkLEtBQXNCO0VBRDVCOztFQUluQixFQUFFLENBQUMsVUFBSCxHQUFnQixTQUFDLENBQUQ7V0FDZixDQUFBLFlBQWEsTUFBYixJQUF3QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQWQsS0FBc0I7RUFEL0I7O0VBSWhCLEVBQUUsQ0FBQyxPQUFILEdBQWEsU0FBQyxDQUFEO1dBQ1osQ0FBQSxZQUFhO0VBREQ7O0VBSWIsRUFBRSxDQUFDLEtBQUgsR0FBVyxTQUFDLE1BQUQ7QUFDVixRQUFBO0lBQUEsSUFBRyxPQUFPLE1BQVAsS0FBa0IsUUFBbEIsSUFBOEIsTUFBQSxLQUFVLElBQXhDLElBQWdELEVBQUUsQ0FBQyxVQUFILENBQWMsTUFBZCxDQUFuRDthQUNDLE9BREQ7S0FBQSxNQUFBO01BR0MsSUFBeUIsb0JBQXpCO0FBQUEsZUFBTyxNQUFNLENBQUMsS0FBUCxDQUFBLEVBQVA7O01BR0EsSUFBRyxFQUFFLENBQUMsT0FBSCxDQUFXLE1BQVgsQ0FBSDtRQUNDLEtBQUEsR0FBUSxHQURUO09BQUEsTUFFSyxJQUFHLEVBQUUsQ0FBQyxhQUFILENBQWlCLE1BQWpCLENBQUg7UUFDSixLQUFBLEdBQVEsR0FESjtPQUFBLE1BQUE7UUFHSixLQUFBLEdBQVEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQWpDLEVBSEo7O0FBS0wsV0FBQSxXQUFBOztRQUNDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxFQUFFLENBQUMsS0FBSCxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCO0FBRFo7YUFHQSxNQWhCRDs7RUFEVTs7RUFvQlgsRUFBRSxDQUFDLElBQUgsR0FBVSxTQUFDLEdBQUQsRUFBTSxLQUFOO0lBQ1QsSUFBRyxhQUFIO2FBQ0MsWUFBYSxDQUFBLEtBQUEsR0FBUSxHQUFSLENBQWIsR0FBNEIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLEVBRDdCO0tBQUEsTUFBQTtNQUdDLEtBQUEsR0FBUSxZQUFhLENBQUEsS0FBQSxHQUFRLEdBQVI7TUFDckIsSUFBRyxhQUFIO2VBQWUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLEVBQWY7T0FBQSxNQUFBO2VBQXFDLEtBQXJDO09BSkQ7O0VBRFM7O0VBUVYsRUFBRSxDQUFDLEtBQUgsR0FBVyxTQUFDLEVBQUQsRUFBSyxPQUFMLEVBQWMsSUFBZDtJQUNWLElBQUcsUUFBUSxDQUFDLFVBQVQsS0FBdUIsVUFBMUI7YUFDQyxFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0IsSUFBbEIsRUFERDtLQUFBLE1BQUE7YUFHQyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFNBQUE7ZUFBRyxFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0IsSUFBbEI7TUFBSCxDQUE5QyxFQUhEOztFQURVOztFQXFCWCxRQUFRLENBQUEsU0FBRSxDQUFBLFFBQVYsR0FBcUIsU0FBQyxJQUFELEVBQU8sSUFBUDtXQUNwQixNQUFNLENBQUMsY0FBUCxDQUFzQixJQUFDLENBQUEsU0FBdkIsRUFBa0MsSUFBbEMsRUFBd0MsSUFBeEM7RUFEb0I7O0VBSXJCLFFBQVEsQ0FBQSxTQUFFLENBQUEsUUFBVixHQUFxQixTQUFDLEtBQUQ7QUFDcEIsUUFBQTs7TUFEcUIsUUFBUTs7SUFDN0IsUUFBQSxHQUFXO0lBQ1gsUUFBQSxHQUFXO0FBRVgsV0FBTyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDTixRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBQTtRQUNYLElBQUcsUUFBQSxHQUFXLFFBQVgsR0FBc0IsS0FBQSxHQUFRLElBQWpDO1VBQ0MsS0FBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQLEVBQWEsU0FBYjtpQkFDQSxRQUFBLEdBQVcsU0FGWjs7TUFGTTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7RUFKYTs7RUFZckIsUUFBUSxDQUFBLFNBQUUsQ0FBQSxRQUFWLEdBQXFCLFNBQUMsS0FBRDtBQUNwQixRQUFBOztNQURxQixRQUFROztJQUM3QixJQUFBLEdBQU87SUFDUCxPQUFBLEdBQVU7SUFFVixLQUFBLEdBQVEsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQ1AsS0FBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQLEVBQWEsSUFBYjtNQURPO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQUdSLFdBQU8sU0FBQTtNQUNOLElBQUEsR0FBTztNQUNQLFlBQUEsQ0FBYSxPQUFiO2FBQ0EsT0FBQSxHQUFVLFVBQUEsQ0FBVyxLQUFYLEVBQWtCLEtBQUEsR0FBUSxJQUExQjtJQUhKO0VBUGE7O1VBY3JCLEtBQUssQ0FBQSxVQUFFLENBQUEsYUFBQSxDQUFBLE9BQVMsU0FBQyxFQUFEO0FBQ2YsUUFBQTtJQUFBLENBQUEsR0FBSTtBQUNKLFdBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFYO01BQ0MsRUFBQSxDQUFHLElBQUUsQ0FBQSxDQUFBLENBQUw7TUFDQSxDQUFBO0lBRkQ7QUFHQSxXQUFPO0VBTFE7O1dBUWhCLEtBQUssQ0FBQSxVQUFFLENBQUEsYUFBQSxDQUFBLE1BQVEsU0FBQyxFQUFEO0FBQ2QsUUFBQTtJQUFBLEdBQUEsR0FBTTtJQUNOLENBQUEsR0FBSTtBQUNKLFdBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFYO01BQ0MsR0FBRyxDQUFDLElBQUosQ0FBUyxFQUFBLENBQUcsSUFBRSxDQUFBLENBQUEsQ0FBTCxDQUFUO01BQ0EsQ0FBQTtJQUZEO0FBR0EsV0FBTztFQU5POztFQVNmLFdBQUEsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFBOztFQUNkLFFBQUEsR0FBVyxFQUFFLENBQUMsSUFBSCxDQUFRLG1CQUFSOztFQUNYLElBQUEsQ0FBQSxDQUFPLGtCQUFBLElBQWMsV0FBQSxHQUFjLFFBQWQsR0FBeUIsRUFBQSxHQUFLLElBQW5ELENBQUE7O01BQ0MsT0FBTyxDQUFDLEtBQU0sU0FBQSxHQUFZLEVBQUUsQ0FBQyxPQUFmLEdBQXlCOztJQUN2QyxFQUFFLENBQUMsSUFBSCxDQUFRLG1CQUFSLEVBQTZCLFdBQTdCLEVBRkQ7O0FBbE5BOzs7QUNKQTtBQUFBLE1BQUE7O0VBQU0sRUFBRSxDQUFDO0lBRUssZ0JBQUMsTUFBRDtNQUFDLElBQUMsQ0FBQSxTQUFEOztNQUdiLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUMsQ0FBQSxFQUFELEdBQU07TUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUVYLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxFQUFFLENBQUM7TUFDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLEVBQUUsQ0FBQztNQUVqQixJQUFDLENBQUEsTUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQVZZOztxQkFZYixhQUFBLEdBQWUsU0FBQyxDQUFEO2FBQ2QsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsQ0FBUixJQUFhLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLENBQXJCLElBQTBCLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLENBQWxDLElBQXVDLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDO0lBRGpDOztxQkFHZixNQUFBLEdBQVEsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBO0FBQ0EsY0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWY7QUFBQSxhQUNNLE1BRE47QUFBQSxhQUNjLFVBRGQ7QUFBQSxhQUMwQixXQUQxQjtBQUVFO0FBQUE7ZUFBQSxxQ0FBQTs7eUJBQ0MsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmO0FBREQ7O0FBRHdCO0FBRDFCLGFBSU0sUUFKTjtBQUFBLGFBSWdCLEtBSmhCO0FBQUEsYUFJdUIsS0FKdkI7aUJBS0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCO0FBTEYsYUFNTSxVQU5OO0FBQUEsYUFNa0IsU0FObEI7QUFPRTtBQUFBO2VBQUEsd0NBQUE7OzBCQUNDLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtBQUREOztBQURnQjtBQU5sQixhQVNNLFNBVE47VUFVRSxJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQztVQUNmLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQztVQUNkLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDO2lCQUNmLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQztBQWJoQjtpQkFlRSxPQUFPLENBQUMsSUFBUixDQUFhLGlDQUFBLEdBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBeEQ7QUFmRjtJQUZPOztxQkFtQlIsU0FBQSxHQUFXLFNBQUE7QUFDVixjQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBZjtBQUFBLGFBQ00sUUFETjtBQUFBLGFBQ2dCLEtBRGhCO0FBQUEsYUFDdUIsS0FEdkI7VUFFRSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxlQUFYLEVBQTRCLElBQUMsQ0FBQSxNQUE3QjtpQkFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxlQUFYLEVBQTRCLElBQUMsQ0FBQSxNQUE3QjtBQUhGLGFBSU0sU0FKTjtpQkFLRSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLElBQUMsQ0FBQSxNQUF2QjtBQUxGO0lBRFU7O3FCQVFYLEtBQUEsR0FBTyxTQUFBO01BQ04sSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLEVBQUQsR0FBTTtNQUN4QixJQUFDLENBQUEsT0FBRCxHQUFXO2FBQ1g7SUFITTs7cUJBS1AsYUFBQSxHQUFlLFNBQUMsQ0FBRDtNQUNkLElBQUcsSUFBQyxDQUFBLE9BQUo7UUFDQyxJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsRUFBRCxHQUFNLENBQUMsQ0FBQztRQUNkLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsRUFIZjtPQUFBLE1BQUE7UUFLQyxJQUFhLENBQUMsQ0FBQyxDQUFGLEdBQU0sSUFBQyxDQUFBLEVBQXBCO1VBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsRUFBUjs7UUFDQSxJQUFhLENBQUMsQ0FBQyxDQUFGLEdBQU0sSUFBQyxDQUFBLEVBQXBCO1VBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsRUFBUjs7UUFDQSxJQUFhLENBQUMsQ0FBQyxDQUFGLEdBQU0sSUFBQyxDQUFBLEVBQXBCO1VBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsRUFBUjs7UUFDQSxJQUFhLENBQUMsQ0FBQyxDQUFGLEdBQU0sSUFBQyxDQUFBLEVBQXBCO1VBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUFDLENBQUMsRUFBUjtTQVJEOzthQVNBO0lBVmM7O3FCQVlmLGNBQUEsR0FBZ0IsU0FBQyxDQUFEO0FBQ2YsVUFBQTtNQUFBLEVBQUEsR0FBSyxDQUFDLENBQUM7TUFDUCxDQUFBLEdBQUksQ0FBQyxDQUFDO01BQ04sSUFBRyxJQUFDLENBQUEsT0FBSjtRQUNDLElBQUMsQ0FBQSxPQUFELEdBQVc7UUFDWCxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU87UUFDYixJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU87UUFDYixJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU87UUFDYixJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFMZDtPQUFBLE1BQUE7UUFPQyxJQUFrQixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQVAsR0FBVyxJQUFDLENBQUEsRUFBOUI7VUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBYjs7UUFDQSxJQUFrQixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQVAsR0FBVyxJQUFDLENBQUEsRUFBOUI7VUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBYjs7UUFDQSxJQUFrQixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQVAsR0FBVyxJQUFDLENBQUEsRUFBOUI7VUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBYjs7UUFDQSxJQUFrQixFQUFFLENBQUMsQ0FBSCxHQUFPLENBQVAsR0FBVyxJQUFDLENBQUEsRUFBOUI7VUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBYjtTQVZEOzthQVdBO0lBZGU7Ozs7O0FBN0RqQjs7O0FDQ0E7RUFBTSxFQUFFLENBQUM7QUFFTCxRQUFBOztJQUFhLGVBQUE7QUFDVCxVQUFBO01BQUEsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFELEdBQUs7TUFDZixJQUFDLENBQUEsQ0FBRCxHQUFLO01BRUwsSUFBRyxTQUFTLENBQUMsTUFBVixLQUFvQixDQUF2QjtRQUNJLEdBQUEsR0FBTSxTQUFVLENBQUEsQ0FBQTtRQUNoQixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixDQUFIO1VBQ0ksSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQO1VBQ0EsSUFBQyxDQUFBLENBQUQsR0FBSyxVQUFBLENBQVcsSUFBQyxDQUFBLENBQVosRUFGVDtTQUFBLE1BR0ssSUFBRyxHQUFBLFlBQWUsRUFBRSxDQUFDLEtBQXJCO1VBQ0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxHQUFOLEVBREM7U0FMVDtPQUFBLE1BQUE7UUFRSSxJQUFDLENBQUEsQ0FBRCxHQUFLLFNBQVUsQ0FBQSxDQUFBO1FBQ2YsSUFBQyxDQUFBLENBQUQsR0FBSyxTQUFVLENBQUEsQ0FBQTtRQUNmLElBQUMsQ0FBQSxDQUFELEdBQUssU0FBVSxDQUFBLENBQUE7UUFDZixJQUFDLENBQUEsQ0FBRCxHQUFLLFNBQVUsQ0FBQSxDQUFBLENBQVYsSUFBZ0IsRUFYekI7O0lBSlM7O29CQWlCYixLQUFBLEdBQU8sU0FBQyxHQUFEO0FBQ0gsVUFBQTtNQUFBLElBQUcsS0FBQSxHQUFRLEdBQUcsQ0FBQyxLQUFKLENBQVUsT0FBVixDQUFYO1FBQ0ksSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWY7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxVQUFBLENBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsRUFKVDtPQUFBLE1BS0ssSUFBRyxLQUFBLEdBQVEsR0FBRyxDQUFDLEtBQUosQ0FBVSxNQUFWLENBQVg7UUFDRCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWY7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLEVBSko7T0FBQSxNQUtBLElBQUcsS0FBQSxHQUFRLEdBQUcsQ0FBQyxLQUFKLENBQVUsV0FBVixDQUFYO1FBQ0QsSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEdBQVgsR0FBaUIsR0FBMUI7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsR0FBWCxHQUFpQixHQUExQjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFYLEdBQWlCLEdBQTFCO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxVQUFBLENBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsRUFKSjtPQUFBLE1BS0EsSUFBRyxLQUFBLEdBQVEsR0FBRyxDQUFDLEtBQUosQ0FBVSxVQUFWLENBQVg7UUFDRCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsR0FBWCxHQUFpQixHQUExQjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFYLEdBQWlCLEdBQTFCO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEdBQVgsR0FBaUIsR0FBMUI7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLEVBSko7T0FBQSxNQUtBLElBQUcsS0FBQSxHQUFRLEdBQUcsQ0FBQyxLQUFKLENBQVUsT0FBVixDQUFYO1FBQ0QsR0FBQSxHQUFNLEtBQU0sQ0FBQSxDQUFBO1FBQ1osSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsR0FBSSxDQUFBLENBQUEsQ0FBYixFQUFpQixFQUFqQjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssSUFBQyxDQUFBLENBQUQsR0FBSyxFQUFMLEdBQVUsSUFBQyxDQUFBO1FBQ2hCLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEdBQUksQ0FBQSxDQUFBLENBQWIsRUFBaUIsRUFBakI7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFELEdBQUssRUFBTCxHQUFVLElBQUMsQ0FBQTtRQUNoQixJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxHQUFJLENBQUEsQ0FBQSxDQUFiLEVBQWlCLEVBQWpCO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFDLENBQUEsQ0FBRCxHQUFLLEVBQUwsR0FBVSxJQUFDLENBQUE7UUFDaEIsSUFBQyxDQUFBLENBQUQsR0FBSyxFQVJKO09BQUEsTUFTQSxJQUFHLEtBQUEsR0FBUSxHQUFHLENBQUMsS0FBSixDQUFVLE9BQVYsQ0FBWDtRQUNELEdBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQTtRQUNaLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFULEVBQThCLEVBQTlCO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLENBQVQsRUFBOEIsRUFBOUI7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxHQUFHLENBQUMsU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBVCxFQUE4QixFQUE5QjtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssRUFMSjtPQUFBLE1BTUEsSUFBRyxtREFBSDtRQUNELElBQUMsQ0FBQSxDQUFELEdBQUssV0FBWSxDQUFBLEdBQUEsQ0FBSyxDQUFBLENBQUE7UUFDdEIsSUFBQyxDQUFBLENBQUQsR0FBSyxXQUFZLENBQUEsR0FBQSxDQUFLLENBQUEsQ0FBQTtRQUN0QixJQUFDLENBQUEsQ0FBRCxHQUFLLFdBQVksQ0FBQSxHQUFBLENBQUssQ0FBQSxDQUFBO1FBQ3RCLElBQUMsQ0FBQSxDQUFELEdBQUssV0FBWSxDQUFBLEdBQUEsQ0FBSyxDQUFBLENBQUE7UUFDdEIsSUFBYyxjQUFkO1VBQUEsSUFBQyxDQUFBLENBQUQsR0FBSyxFQUFMO1NBTEM7T0FBQSxNQUFBO1FBT0QsT0FBTyxDQUFDLEtBQVIsQ0FBYyxtQkFBQSxHQUFxQixHQUFyQixHQUEwQixZQUF4QyxFQVBDOzthQVFMO0lBNUNHOztvQkE4Q1AsS0FBQSxHQUFPLFNBQUE7YUFDSCxDQUFDLElBQUksRUFBRSxDQUFDLEtBQVIsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsSUFBcEI7SUFERzs7b0JBR1AsSUFBQSxHQUFNLFNBQUMsS0FBRDtNQUNGLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDO01BQ1gsSUFBQyxDQUFBLENBQUQsR0FBSyxLQUFLLENBQUM7TUFDWCxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQztNQUNYLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDO2FBQ1g7SUFMRTs7b0JBT04sTUFBQSxHQUFRLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO01BQ0osSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsQ0FBVDtNQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLENBQVQ7TUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxDQUFUO01BQ0wsSUFBQyxDQUFBLENBQUQsR0FBSzthQUNMO0lBTEk7O29CQU9SLE9BQUEsR0FBUyxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7TUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFFBQUEsQ0FBUyxDQUFUO01BQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxRQUFBLENBQVMsQ0FBVDtNQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssUUFBQSxDQUFTLENBQVQ7TUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLFVBQUEsQ0FBVyxVQUFBLENBQVcsQ0FBWCxDQUFYO2FBQ0w7SUFMSzs7b0JBT1QsS0FBQSxHQUFPLFNBQUE7YUFDSCxNQUFBLEdBQVEsSUFBQyxDQUFBLENBQVQsR0FBWSxJQUFaLEdBQWlCLElBQUMsQ0FBQSxDQUFsQixHQUFxQixJQUFyQixHQUEwQixJQUFDLENBQUEsQ0FBM0IsR0FBOEI7SUFEM0I7O29CQUdQLE1BQUEsR0FBUSxTQUFBO2FBQ0osT0FBQSxHQUFTLElBQUMsQ0FBQSxDQUFWLEdBQWEsSUFBYixHQUFrQixJQUFDLENBQUEsQ0FBbkIsR0FBc0IsSUFBdEIsR0FBMkIsSUFBQyxDQUFBLENBQTVCLEdBQStCLElBQS9CLEdBQW9DLElBQUMsQ0FBQSxDQUFyQyxHQUF3QztJQURwQzs7SUFNUixVQUFBLEdBQWEsU0FBQyxDQUFEO2FBQU8sRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7SUFBUDs7SUFLYixNQUFBLEdBQVM7O0lBQ1QsT0FBQSxHQUFVOztJQUNWLFVBQUEsR0FBYTs7SUFDYixXQUFBLEdBQWM7O0lBQ2QsT0FBQSxHQUFVOztJQUNWLE9BQUEsR0FBVTs7SUFDVixXQUFBLEdBQ0k7TUFBQSxXQUFBLEVBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQWI7TUFFQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FGWDtNQUdBLFlBQUEsRUFBYyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQUhkO01BSUEsSUFBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBSk47TUFLQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FMWjtNQU1BLEtBQUEsRUFBTyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQU5QO01BT0EsS0FBQSxFQUFPLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBUFA7TUFRQSxNQUFBLEVBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FSUjtNQVNBLEtBQUEsRUFBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVRQO01BVUEsY0FBQSxFQUFnQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQVZoQjtNQVdBLElBQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxDQVhOO01BWUEsVUFBQSxFQUFZLENBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxHQUFWLENBWlo7TUFhQSxLQUFBLEVBQU8sQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsQ0FiUDtNQWNBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQWRYO01BZUEsU0FBQSxFQUFXLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxHQUFWLENBZlg7TUFnQkEsVUFBQSxFQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxDQUFYLENBaEJaO01BaUJBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsRUFBWCxDQWpCWDtNQWtCQSxLQUFBLEVBQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEVBQVgsQ0FsQlA7TUFtQkEsY0FBQSxFQUFnQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQW5CaEI7TUFvQkEsUUFBQSxFQUFVLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBcEJWO01BcUJBLE9BQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsRUFBVixDQXJCVDtNQXNCQSxJQUFBLEVBQU0sQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEdBQVQsQ0F0Qk47TUF1QkEsUUFBQSxFQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLENBdkJWO01Bd0JBLFFBQUEsRUFBVSxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsR0FBVCxDQXhCVjtNQXlCQSxhQUFBLEVBQWUsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEVBQVgsQ0F6QmY7TUEwQkEsUUFBQSxFQUFVLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBMUJWO01BMkJBLFNBQUEsRUFBVyxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsQ0FBVCxDQTNCWDtNQTRCQSxRQUFBLEVBQVUsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0E1QlY7TUE2QkEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBN0JYO01BOEJBLFdBQUEsRUFBYSxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxDQTlCYjtNQStCQSxjQUFBLEVBQWdCLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxFQUFWLENBL0JoQjtNQWdDQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FoQ1o7TUFpQ0EsVUFBQSxFQUFZLENBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxHQUFWLENBakNaO01Ba0NBLE9BQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsQ0FBVCxDQWxDVDtNQW1DQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FuQ1o7TUFvQ0EsWUFBQSxFQUFjLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBcENkO01BcUNBLGFBQUEsRUFBZSxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsR0FBVCxDQXJDZjtNQXNDQSxhQUFBLEVBQWUsQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQsQ0F0Q2Y7TUF1Q0EsYUFBQSxFQUFlLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULENBdkNmO01Bd0NBLGFBQUEsRUFBZSxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsR0FBVCxDQXhDZjtNQXlDQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0F6Q1o7TUEwQ0EsUUFBQSxFQUFVLENBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxHQUFWLENBMUNWO01BMkNBLFdBQUEsRUFBYSxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsR0FBVCxDQTNDYjtNQTRDQSxPQUFBLEVBQVMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0E1Q1Q7TUE2Q0EsT0FBQSxFQUFTLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBN0NUO01BOENBLFVBQUEsRUFBWSxDQUFDLEVBQUQsRUFBSyxHQUFMLEVBQVUsR0FBVixDQTlDWjtNQStDQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsQ0EvQ1g7TUFnREEsV0FBQSxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBaERiO01BaURBLFdBQUEsRUFBYSxDQUFDLEVBQUQsRUFBSyxHQUFMLEVBQVUsRUFBVixDQWpEYjtNQWtEQSxPQUFBLEVBQVMsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0FsRFQ7TUFtREEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBbkRYO01Bb0RBLFVBQUEsRUFBWSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXBEWjtNQXFEQSxJQUFBLEVBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FyRE47TUFzREEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxFQUFYLENBdERYO01BdURBLElBQUEsRUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXZETjtNQXdEQSxLQUFBLEVBQU8sQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLENBQVQsQ0F4RFA7TUF5REEsV0FBQSxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxFQUFYLENBekRiO01BMERBLElBQUEsRUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTFETjtNQTJEQSxRQUFBLEVBQVUsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0EzRFY7TUE0REEsT0FBQSxFQUFTLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBNURUO01BNkRBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsRUFBVixDQTdEWDtNQThEQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxFQUFRLEdBQVIsQ0E5RFI7TUErREEsS0FBQSxFQUFPLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBL0RQO01BZ0VBLEtBQUEsRUFBTyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQWhFUDtNQWlFQSxRQUFBLEVBQVUsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FqRVY7TUFrRUEsYUFBQSxFQUFlLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBbEVmO01BbUVBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQW5FWDtNQW9FQSxZQUFBLEVBQWMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FwRWQ7TUFxRUEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBckVYO01Bc0VBLFVBQUEsRUFBWSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXRFWjtNQXVFQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0F2RVg7TUF3RUEsb0JBQUEsRUFBc0IsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0F4RXRCO01BeUVBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXpFWDtNQTBFQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0ExRVo7TUEyRUEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBM0VYO01BNEVBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTVFWDtNQTZFQSxXQUFBLEVBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0E3RWI7TUE4RUEsYUFBQSxFQUFlLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxHQUFWLENBOUVmO01BK0VBLFlBQUEsRUFBYyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQS9FZDtNQWdGQSxjQUFBLEVBQWdCLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBaEZoQjtNQWlGQSxjQUFBLEVBQWdCLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBakZoQjtNQWtGQSxjQUFBLEVBQWdCLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBbEZoQjtNQW1GQSxXQUFBLEVBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FuRmI7TUFvRkEsSUFBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxDQUFULENBcEZOO01BcUZBLFNBQUEsRUFBVyxDQUFDLEVBQUQsRUFBSyxHQUFMLEVBQVUsRUFBVixDQXJGWDtNQXNGQSxLQUFBLEVBQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0F0RlA7TUF1RkEsT0FBQSxFQUFTLENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFULENBdkZUO01Bd0ZBLE1BQUEsRUFBUSxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsQ0FBVCxDQXhGUjtNQXlGQSxnQkFBQSxFQUFrQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXpGbEI7TUEwRkEsVUFBQSxFQUFZLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLENBMUZaO01BMkZBLFlBQUEsRUFBYyxDQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsR0FBVixDQTNGZDtNQTRGQSxZQUFBLEVBQWMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0E1RmQ7TUE2RkEsY0FBQSxFQUFnQixDQUFDLEVBQUQsRUFBSyxHQUFMLEVBQVUsR0FBVixDQTdGaEI7TUE4RkEsZUFBQSxFQUFpQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTlGakI7TUErRkEsaUJBQUEsRUFBbUIsQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEdBQVQsQ0EvRm5CO01BZ0dBLGVBQUEsRUFBaUIsQ0FBQyxFQUFELEVBQUssR0FBTCxFQUFVLEdBQVYsQ0FoR2pCO01BaUdBLGVBQUEsRUFBaUIsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEdBQVYsQ0FqR2pCO01Ba0dBLFlBQUEsRUFBYyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsR0FBVCxDQWxHZDtNQW1HQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FuR1g7TUFvR0EsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBcEdYO01BcUdBLFFBQUEsRUFBVSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXJHVjtNQXNHQSxXQUFBLEVBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0F0R2I7TUF1R0EsSUFBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLENBdkdOO01Bd0dBLE9BQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXhHVDtNQXlHQSxLQUFBLEVBQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0F6R1A7TUEwR0EsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxFQUFYLENBMUdYO01BMkdBLE1BQUEsRUFBUSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQTNHUjtNQTRHQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLENBQVYsQ0E1R1g7TUE2R0EsTUFBQSxFQUFRLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBN0dSO01BOEdBLGFBQUEsRUFBZSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTlHZjtNQStHQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0EvR1g7TUFnSEEsYUFBQSxFQUFlLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBaEhmO01BaUhBLGFBQUEsRUFBZSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQWpIZjtNQWtIQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FsSFo7TUFtSEEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBbkhYO01Bb0hBLElBQUEsRUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsRUFBWCxDQXBITjtNQXFIQSxJQUFBLEVBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FySE47TUFzSEEsSUFBQSxFQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBdEhOO01BdUhBLFVBQUEsRUFBWSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXZIWjtNQXdIQSxNQUFBLEVBQVEsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0F4SFI7TUF5SEEsR0FBQSxFQUFLLENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxDQUFULENBekhMO01BMEhBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTFIWDtNQTJIQSxTQUFBLEVBQVcsQ0FBQyxFQUFELEVBQUssR0FBTCxFQUFVLEdBQVYsQ0EzSFg7TUE0SEEsV0FBQSxFQUFhLENBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxFQUFWLENBNUhiO01BNkhBLE1BQUEsRUFBUSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTdIUjtNQThIQSxVQUFBLEVBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEVBQVgsQ0E5SFo7TUErSEEsUUFBQSxFQUFVLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxFQUFWLENBL0hWO01BZ0lBLFFBQUEsRUFBVSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQWhJVjtNQWlJQSxNQUFBLEVBQVEsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsQ0FqSVI7TUFrSUEsTUFBQSxFQUFRLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBbElSO01BbUlBLE9BQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQW5JVDtNQW9JQSxTQUFBLEVBQVcsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEdBQVYsQ0FwSVg7TUFxSUEsU0FBQSxFQUFXLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBcklYO01Bc0lBLFNBQUEsRUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQXRJWDtNQXVJQSxJQUFBLEVBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0F2SU47TUF3SUEsV0FBQSxFQUFhLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBeEliO01BeUlBLFNBQUEsRUFBVyxDQUFDLEVBQUQsRUFBSyxHQUFMLEVBQVUsR0FBVixDQXpJWDtNQTBJQSxHQUFBLEVBQUssQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0ExSUw7TUEySUEsSUFBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBM0lOO01BNElBLE9BQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQTVJVDtNQTZJQSxNQUFBLEVBQVEsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsQ0E3SVI7TUE4SUEsU0FBQSxFQUFXLENBQUMsRUFBRCxFQUFLLEdBQUwsRUFBVSxHQUFWLENBOUlYO01BK0lBLE1BQUEsRUFBUSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQS9JUjtNQWdKQSxLQUFBLEVBQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FoSlA7TUFpSkEsS0FBQSxFQUFPLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBakpQO01Ba0pBLFVBQUEsRUFBWSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQWxKWjtNQW1KQSxNQUFBLEVBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FuSlI7TUFvSkEsV0FBQSxFQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxFQUFYLENBcEpiOzs7Ozs7QUE5R1I7OztBQ0RBO0VBQU0sRUFBRSxDQUFDO0lBQ0ssY0FBQyxLQUFELEVBQVMsTUFBVDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7TUFDckIsSUFBQyxDQUFBLElBQUQsR0FBUTtJQURJOzttQkFHYixHQUFBLEdBQUssU0FBQyxLQUFELEVBQVMsTUFBVDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7SUFBVDs7Ozs7QUFKTjs7O0FDQUE7RUFBTSxFQUFFLENBQUM7SUFFSyxnQkFBQyxDQUFELEVBQVMsQ0FBVDtNQUFDLElBQUMsQ0FBQSxnQkFBRCxJQUFLO01BQUcsSUFBQyxDQUFBLGdCQUFELElBQUs7SUFBZDs7cUJBRWIsS0FBQSxHQUFPLFNBQUE7YUFDRixJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsSUFBQyxDQUFBLENBQVgsRUFBYyxJQUFDLENBQUEsQ0FBZjtJQURFOztxQkFHUCxHQUFBLEdBQUssU0FBQyxDQUFEO01BQ0osSUFBQyxDQUFBLENBQUQsSUFBTSxDQUFDLENBQUM7TUFDUixJQUFDLENBQUEsQ0FBRCxJQUFNLENBQUMsQ0FBQzthQUNSO0lBSEk7O3FCQUtMLEdBQUEsR0FBSyxTQUFDLENBQUQsRUFBSyxDQUFMO01BQUMsSUFBQyxDQUFBLElBQUQ7TUFBSSxJQUFDLENBQUEsSUFBRDthQUNUO0lBREk7O3FCQUdMLE1BQUEsR0FBUSxTQUFDLEVBQUQsRUFBSyxFQUFMO01BQ1AsSUFBQyxDQUFBLENBQUQsSUFBTTtNQUNOLElBQUMsQ0FBQSxDQUFELElBQU07YUFDTjtJQUhPOztxQkFLUixJQUFBLEdBQU0sU0FBQyxDQUFEO01BQ0wsSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUM7TUFDUCxJQUFDLENBQUEsQ0FBRCxHQUFLLENBQUMsQ0FBQzthQUNQO0lBSEs7O3FCQUtOLGNBQUEsR0FBZ0IsU0FBQyxNQUFEO01BQ2YsSUFBQyxDQUFBLENBQUQsSUFBTTtNQUNOLElBQUMsQ0FBQSxDQUFELElBQU07YUFDTjtJQUhlOztxQkFLaEIsT0FBQSxHQUFTLFNBQUMsR0FBRDtBQUVSLFVBQUE7TUFBQSxJQUFDLENBQUEsQ0FBRCxJQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7TUFDaEIsSUFBQyxDQUFBLENBQUQsSUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO01BRWhCLEdBQUEsR0FBTSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxDQUFWLEVBQWEsSUFBQyxDQUFBLENBQWQ7TUFDTixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsQ0FBWixFQUFlLElBQUMsQ0FBQSxDQUFoQixDQUFBLEdBQXFCLEdBQUcsQ0FBQztNQUM3QixJQUFDLENBQUEsQ0FBRCxHQUFLLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQ7TUFDWCxJQUFDLENBQUEsQ0FBRCxHQUFLLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQ7TUFFWCxJQUFDLENBQUEsQ0FBRCxJQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUM7TUFDbkIsSUFBQyxDQUFBLENBQUQsSUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDO2FBQ25CO0lBWlE7O3FCQWNULFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFFVixVQUFBO01BQUEsSUFBQyxDQUFBLENBQUQsSUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDO01BQ25CLElBQUMsQ0FBQSxDQUFELElBQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQztNQUVuQixHQUFBLEdBQU0sRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsQ0FBVixFQUFhLElBQUMsQ0FBQSxDQUFkO01BQ04sQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLENBQVosRUFBZSxJQUFDLENBQUEsQ0FBaEIsQ0FBQSxHQUFxQixHQUFHLENBQUM7TUFDN0IsSUFBQyxDQUFBLENBQUQsR0FBSyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFUO01BQ1gsSUFBQyxDQUFBLENBQUQsR0FBSyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFUO01BRVgsSUFBQyxDQUFBLENBQUQsSUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO01BQ2hCLElBQUMsQ0FBQSxDQUFELElBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQzthQUNoQjtJQVpVOzs7OztBQTVDWjs7O0FDQUE7RUFBQSxFQUFFLENBQUMsS0FBSCxHQUFXLFNBQUE7QUFDVixRQUFBO0lBQUEsS0FBQSxHQUFRO0lBRVIsSUFBQyxDQUFBLEVBQUQsR0FBTSxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ0wsVUFBQTtNQUFBLFNBQUEsR0FBWSxLQUFNLENBQUEsSUFBQSxNQUFOLEtBQU0sQ0FBQSxJQUFBLElBQVU7TUFDNUIsSUFBMkIsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsUUFBQSxLQUFZLENBQUMsQ0FBL0IsQ0FBM0I7ZUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLFFBQWYsRUFBQTs7SUFGSztJQUlOLElBQUMsQ0FBQSxJQUFELEdBQVEsU0FBQyxJQUFELEVBQU8sUUFBUDtNQUNQLFFBQVEsQ0FBQyxJQUFULEdBQWdCO2FBQ2hCLElBQUMsQ0FBQSxFQUFELENBQUksSUFBSixFQUFVLFFBQVY7SUFGTztJQUlSLElBQUMsQ0FBQSxHQUFELEdBQU8sU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNOLFVBQUE7TUFBQSxTQUFBLEdBQVksS0FBTSxDQUFBLElBQUE7TUFDbEIsSUFBRyxnQkFBSDtRQUNDLElBQUcsaUJBQUg7VUFDQyxLQUFBLEdBQVEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsUUFBbEI7VUFDUixJQUE2QixLQUFBLEdBQVEsQ0FBQyxDQUF0QzttQkFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixLQUFqQixFQUF3QixDQUF4QixFQUFBO1dBRkQ7U0FERDtPQUFBLE1BQUE7UUFLQyxJQUF3QixpQkFBeEI7aUJBQUEsU0FBUyxDQUFDLE1BQVYsR0FBbUIsRUFBbkI7U0FMRDs7SUFGTTtXQVNQLElBQUMsQ0FBQSxPQUFELEdBQVcsU0FBQyxJQUFELEVBQU8sU0FBUDtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQVksS0FBTSxDQUFBLElBQUE7TUFFbEIsSUFBRyxpQkFBSDtRQUNDLGNBQUEsWUFBYztRQUNkLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO0FBQ25CO2FBQUEsMkNBQUE7O1VBQ0MsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLEVBQW9CLFNBQXBCO1VBQ0EsSUFBRyxRQUFRLENBQUMsSUFBWjt5QkFDQyxTQUFTLENBQUMsTUFBVixDQUFpQixTQUFTLENBQUMsT0FBVixDQUFrQixRQUFsQixDQUFqQixFQUE4QyxDQUE5QyxHQUREO1dBQUEsTUFBQTtpQ0FBQTs7QUFGRDt1QkFIRDs7SUFIVTtFQXBCRDtBQUFYOzs7QUN3QkE7RUFBQSxDQUFDLFNBQUMsTUFBRDtBQUdBLFFBQUE7SUFBQSxNQUFNLENBQUMsQ0FBUCxHQUFXLFNBQUMsUUFBRDtBQUNWLFVBQUE7TUFBQSxVQUFBLEdBQWE7TUFDYixJQUFHLE9BQU8sUUFBUCxLQUFtQixRQUF0QjtRQUNDLFVBQUEsR0FBYSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQVQsQ0FBYyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZCxFQURkO09BQUEsTUFFSyxJQUFHLFFBQUEsWUFBb0IsV0FBdkI7UUFDSixVQUFVLENBQUMsSUFBWCxDQUFnQixRQUFoQixFQURJOztNQUVMLE1BQU0sQ0FBQyxLQUFQLENBQWEsVUFBYjthQUNBO0lBUFU7SUFTWCxNQUFBLEdBQVMsU0FBQTtBQUdSLFVBQUE7TUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sUUFBUDtVQUNMLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO21CQUNMLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixJQUFyQixFQUEyQixRQUEzQjtVQURLLENBQU47aUJBRUE7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLTixJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sUUFBUDtVQUNOLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO21CQUNMLEdBQUcsQ0FBQyxtQkFBSixDQUF3QixJQUF4QixFQUE4QixRQUE5QjtVQURLLENBQU47aUJBRUE7UUFITTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFPUCxRQUFBLEdBQVc7TUFFWCxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO1VBQ1QsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFDLEdBQUQsRUFBTSxDQUFOO0FBQ0wsZ0JBQUE7WUFBQSxRQUFBLEdBQVcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBRyxDQUFDLFdBQUosQ0FBQSxDQUFqQjtZQUNYLElBQUcsUUFBQSxHQUFXLENBQUMsQ0FBZjtjQUNDLE1BQUEsR0FBUyxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBdUQsR0FBdkQsRUFEVjthQUFBLE1BQUE7Y0FHQyxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsRUFIVjs7bUJBSUEsS0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLEdBQUcsQ0FBQyxXQUFKLENBQWdCLE1BQWhCO1VBTkYsQ0FBTjtpQkFPQTtRQVJTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVVWLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDUCxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQUMsR0FBRDttQkFDTCxHQUFHLENBQUMsV0FBSixHQUFrQjtVQURiLENBQU47aUJBRUE7UUFITztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLUixJQUFDLENBQUEsSUFBRCxHQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO1VBQ1AsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFDLEdBQUQ7bUJBQ0wsR0FBRyxDQUFDLFNBQUosR0FBZ0I7VUFEWCxDQUFOO2lCQUVBO1FBSE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS1IsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNSLElBQUcsU0FBSDtZQUNDLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO3FCQUNMLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBVixHQUFrQixDQUFBLEdBQUk7WUFEakIsQ0FBTjttQkFFQSxNQUhEO1dBQUEsTUFBQTttQkFLQyxVQUFBLENBQVcsZ0JBQUEsQ0FBaUIsS0FBRSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxLQUFsQyxFQUxEOztRQURRO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVFULElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDVCxJQUFHLFNBQUg7WUFDQyxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQUMsR0FBRDtxQkFDTCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQVYsR0FBbUIsQ0FBQSxHQUFJO1lBRGxCLENBQU47bUJBRUEsTUFIRDtXQUFBLE1BQUE7bUJBS0MsVUFBQSxDQUFXLGdCQUFBLENBQWlCLEtBQUUsQ0FBQSxDQUFBLENBQW5CLENBQXNCLENBQUMsTUFBbEMsRUFMRDs7UUFEUztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFTVixJQUFDLENBQUEsS0FBRCxHQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sS0FBUDtVQUNSLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO0FBQ0wsZ0JBQUE7WUFBQSxTQUFBLEdBQVksR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakI7WUFDWixNQUFBLEdBQVM7WUFDVCxJQUFHLFNBQUg7Y0FDQyxTQUFTLENBQUMsS0FBVixDQUFnQixHQUFoQixDQUFvQixDQUFDLElBQXJCLENBQTBCLFNBQUMsQ0FBRDtBQUN6QixvQkFBQTtnQkFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLEtBQUYsQ0FBUSxHQUFSO3VCQUNMLE1BQU8sQ0FBQSxFQUFHLENBQUEsQ0FBQSxDQUFILENBQVAsR0FBZ0IsRUFBRyxDQUFBLENBQUE7Y0FGTSxDQUExQixFQUREOztZQUlBLE1BQU8sQ0FBQSxJQUFBLENBQVAsR0FBZTtZQUVmLFNBQUEsR0FBWTtBQUNaLGlCQUFBLFdBQUE7Y0FDQyxTQUFBLElBQWEsQ0FBQSxHQUFJLElBQUosR0FBVyxNQUFPLENBQUEsQ0FBQSxDQUFsQixHQUF1QjtBQURyQzttQkFFQSxHQUFHLENBQUMsWUFBSixDQUFpQixPQUFqQixFQUEwQixTQUExQjtVQVpLLENBQU47aUJBYUE7UUFkUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFnQlQsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUNYLGNBQUE7VUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFELEtBQVcsQ0FBZDtBQUNDLG1CQUFPLE1BRFI7O1VBR0EsQ0FBQSxHQUFJO0FBQ0osaUJBQU0sQ0FBQSxHQUFJLEtBQUMsQ0FBQSxNQUFYO1lBQ0MsU0FBQSxHQUFZLEtBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFMLENBQWtCLE9BQUEsSUFBVyxFQUE3QjtZQUVaLE9BQUEsR0FBVSxTQUFTLENBQUMsS0FBVixDQUFnQixNQUFBLENBQU8sSUFBUCxDQUFoQjtZQUNWLElBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUixDQUFpQixJQUFqQixDQUFKO0FBQ0MscUJBQU8sTUFEUjs7WUFFQSxDQUFBO1VBTkQ7aUJBT0E7UUFaVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFjWixJQUFDLENBQUEsUUFBRCxHQUFZLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ1gsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFDLEdBQUQ7QUFDTCxnQkFBQTtZQUFBLFNBQUEsR0FBWSxHQUFHLENBQUMsWUFBSixDQUFpQixPQUFBLElBQVcsRUFBNUI7WUFDWixPQUFBLEdBQVUsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsTUFBQSxDQUFPLElBQVAsQ0FBaEI7WUFDVixJQUFHLENBQUksT0FBTyxDQUFDLFFBQVIsQ0FBaUIsSUFBakIsQ0FBUDtjQUNDLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYjtxQkFDQSxHQUFHLENBQUMsWUFBSixDQUFpQixPQUFqQixFQUEwQixPQUFPLENBQUMsSUFBUixDQUFhLEdBQWIsQ0FBMUIsRUFGRDs7VUFISyxDQUFOO2lCQU1BO1FBUFc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BU1osSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNkLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO0FBQ0wsZ0JBQUE7WUFBQSxTQUFBLEdBQVksR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakIsQ0FBQSxJQUE2QjtZQUN6QyxPQUFBLEdBQVUsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsTUFBQSxDQUFPLElBQVAsQ0FBaEI7WUFDVixJQUFHLE9BQU8sQ0FBQyxRQUFSLENBQWlCLElBQWpCLENBQUg7Y0FDQyxPQUFPLENBQUMsTUFBUixDQUFlLElBQWY7Y0FDQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO3VCQUNDLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLEVBQTBCLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYixDQUExQixFQUREO2VBQUEsTUFBQTt1QkFHQyxHQUFHLENBQUMsZUFBSixDQUFvQixPQUFwQixFQUhEO2VBRkQ7O1VBSEssQ0FBTjtpQkFTQTtRQVZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVlmLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDZCxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQUMsR0FBRDtBQUNMLGdCQUFBO1lBQUEsU0FBQSxHQUFZLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQUEsSUFBVyxFQUE1QjtZQUNaLE9BQUEsR0FBVSxTQUFTLENBQUMsS0FBVixDQUFnQixNQUFBLENBQU8sSUFBUCxDQUFoQjtZQUNWLElBQUcsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsSUFBakIsQ0FBSDtjQUNDLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBZixFQUREO2FBQUEsTUFBQTtjQUdDLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixFQUhEOztZQUlBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7cUJBQ0MsR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakIsRUFBMEIsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiLENBQTFCLEVBREQ7YUFBQSxNQUFBO3FCQUdDLEdBQUcsQ0FBQyxlQUFKLENBQW9CLE9BQXBCLEVBSEQ7O1VBUEssQ0FBTjtpQkFXQTtRQVpjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQWNmLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQsRUFBTyxLQUFQO1VBQ1AsSUFBRyxhQUFIO1lBQ0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFDLEdBQUQ7cUJBQVMsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakIsRUFBdUIsS0FBdkI7WUFBVCxDQUFOO0FBQ0EsbUJBQU8sTUFGUjtXQUFBLE1BQUE7QUFJQyxtQkFBTyxLQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsWUFBTCxDQUFrQixJQUFsQixFQUpSOztRQURPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQU9SLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDVixjQUFBO1VBQUEsSUFBRyxLQUFDLENBQUEsTUFBRCxLQUFXLENBQWQ7QUFDQyxtQkFBTyxNQURSOztVQUVBLENBQUEsR0FBSTtBQUNKLGlCQUFNLENBQUEsR0FBSSxLQUFDLENBQUEsTUFBWDtZQUNDLElBQUcsQ0FBSSxLQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsWUFBTCxDQUFrQixJQUFsQixDQUFQO0FBQ0MscUJBQU8sTUFEUjs7WUFFQSxDQUFBO1VBSEQ7aUJBSUE7UUFSVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFVWCxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ2IsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFDLEdBQUQ7bUJBQ0wsR0FBRyxDQUFDLGVBQUosQ0FBb0IsSUFBcEI7VUFESyxDQUFOO2lCQUVBO1FBSGE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2FBS2QsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFBRyxjQUFBOytDQUFJLENBQUU7UUFBVDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUE3SUM7SUFnSlQsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFULEdBQWlCLFNBQUMsTUFBRDthQUNoQixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLE1BQTlDO0lBRGdCO1dBa0JqQixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQVQsR0FBZ0IsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUNmLFVBQUE7TUFBQSxJQUFHLENBQUMsR0FBSjtRQUNDLElBQUcsT0FBTyxHQUFQLEtBQWMsUUFBakI7VUFDQyxHQUFBLEdBQU07VUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLElBRlg7U0FBQSxNQUFBO1VBSUMsR0FBQSxHQUFNLEdBSlA7U0FERDs7TUFNQSxHQUFHLENBQUMsV0FBSixHQUFHLENBQUMsU0FBVztNQUNmLElBQXdCLGlCQUF4QjtRQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQVksS0FBWjs7TUFFQSxHQUFBLEdBQU0sSUFBSTtNQUNWLEdBQUcsQ0FBQyxrQkFBSixHQUF5QixTQUFBO1FBQ3hCLElBQUcsR0FBRyxDQUFDLFVBQUosS0FBa0IsQ0FBckI7VUFDQyxJQUFHLEdBQUcsQ0FBQyxNQUFKLEtBQWMsR0FBakI7WUFDQyxJQUFpRCxtQkFBakQ7cUJBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFHLENBQUMsWUFBaEIsRUFBOEIsR0FBRyxDQUFDLE1BQWxDLEVBQTBDLEdBQTFDLEVBQUE7YUFERDtXQUFBLE1BQUE7WUFHQyxJQUE2QixpQkFBN0I7Y0FBQSxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVYsRUFBZSxHQUFHLENBQUMsTUFBbkIsRUFBQTs7WUFDQSxJQUFnQyxvQkFBaEM7cUJBQUEsR0FBRyxDQUFDLFFBQUosQ0FBYSxHQUFiLEVBQWtCLEdBQUcsQ0FBQyxNQUF0QixFQUFBO2FBSkQ7V0FERDs7TUFEd0I7TUFRekIsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFHLENBQUMsTUFBYixFQUFxQixHQUFyQixFQUEwQixHQUFHLENBQUMsS0FBOUIsRUFBcUMsR0FBRyxDQUFDLFFBQXpDLEVBQW1ELEdBQUcsQ0FBQyxRQUF2RDthQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVDtJQXBCZTtFQTlLaEIsQ0FBRCxDQUFBLENBa01pQixFQUFFLENBQUMsTUFsTXBCO0FBQUE7OztBQ3hCQTtBQUFBLE1BQUE7O0VBQU0sRUFBRSxDQUFDO0lBRUssa0JBQUE7TUFDWixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQVYsQ0FBZ0IsSUFBaEI7TUFDQSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQVQsQ0FBZSxJQUFmO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFFWCxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksRUFBRSxDQUFDO01BQ25CLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFWLEVBQWEsQ0FBYjtNQUNkLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxFQUFFLENBQUM7TUFNZixJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUdiLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVO0lBckJFOztJQXVCYixRQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixDQUFIO2lCQUNDLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBUixHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBUixHQUFZLElBRHpCO1NBQUEsTUFBQTtpQkFHQyxJQUFDLENBQUEsTUFBRCxHQUFVLElBSFg7O01BREksQ0FETDtLQUREOzt1QkFTQSxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssRUFBTDtNQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixJQUFlO01BQ2YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLElBQWU7YUFDZjtJQUhVOzt1QkFNWCxNQUFBLEdBQVEsU0FBQyxFQUFEO01BQ1AsSUFBQyxDQUFBLFFBQUQsSUFBYTthQUNiO0lBRk87O3VCQUtSLE9BQUEsR0FBUyxTQUFDLEVBQUQ7TUFDUixJQUFDLENBQUEsS0FBRCxJQUFVO2FBQ1Y7SUFGUTs7dUJBS1QsT0FBQSxHQUFTLFNBQUMsQ0FBRDtNQUNSLElBQUMsQ0FBQSxLQUFELEdBQVM7YUFDVDtJQUZROzt1QkFLVCxRQUFBLEdBQVUsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFBLEdBQU87QUFDUCxhQUFBLElBQUE7UUFDQyxJQUFTLElBQUEsWUFBZ0IsRUFBRSxDQUFDLEtBQTVCO0FBQUEsZ0JBQUE7O1FBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQztNQUZiO2FBR0E7SUFMUzs7dUJBUVYsUUFBQSxHQUFVLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxJQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsS0FBWCxDQUFIO0FBQ0MsYUFBQSx1Q0FBQTs7VUFDQyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxDQUFmO1VBQ0EsQ0FBQyxDQUFDLE1BQUYsR0FBVztBQUZaLFNBREQ7T0FBQSxNQUFBO1FBS0MsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsS0FBZjtRQUNBLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FOaEI7O2FBT0E7SUFSUzs7dUJBV1YsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNaLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLEtBQWxCO01BQ1IsSUFBNkIsS0FBQSxHQUFRLENBQUMsQ0FBdEM7UUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsS0FBakIsRUFBd0IsQ0FBeEIsRUFBQTs7YUFDQTtJQUhZOzt1QkFVYixPQUFBLEdBQVMsU0FBQyxJQUFELEVBQU8sSUFBUDtBQUNSLFVBQUE7TUFBQSxJQUFBLENBQXFCLEVBQUUsQ0FBQyxPQUFILENBQVcsSUFBWCxDQUFyQjtRQUFBLElBQUEsR0FBTyxDQUFDLElBQUQsRUFBUDs7TUFDQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixDQUFIO1FBQ0MsSUFBRyxJQUFBLElBQVEsRUFBRSxDQUFDLFVBQWQ7VUFDQyxFQUFFLENBQUMsVUFBVyxDQUFBLElBQUEsQ0FBSyxDQUFDLE9BQXBCLENBQTRCLElBQTVCLEVBQStCLElBQS9CLEVBREQ7U0FBQSxNQUFBO1VBR0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxrQkFBQSxHQUFvQixJQUFwQixHQUEwQixxQkFBdkMsRUFIRDtTQUREO09BQUEsTUFLSyxJQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsSUFBWCxDQUFIO0FBQ0osYUFBQSxTQUFBOztVQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSyxDQUFBLENBQUEsQ0FBZCxFQUFrQixJQUFsQjtBQUFBLFNBREk7T0FBQSxNQUFBO1FBR0osSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQWdCLElBQWhCLEVBSEk7O2FBSUw7SUFYUTs7dUJBY1QsWUFBQSxHQUFjLFNBQUE7TUFDYixJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFWO2FBQ2Q7SUFGYTs7dUJBS2QsT0FBQSxHQUFTLFNBQUMsQ0FBRDtBQUNSLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUM7TUFDdkIsSUFBdUQsUUFBUSxDQUFDLGNBQWhFO1FBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFWLEdBQWtCLENBQTNCLEVBQThCLENBQUMsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBakQsRUFBQTs7TUFDQSxDQUFDLENBQUMsT0FBRixDQUFVLFFBQVEsQ0FBQyxNQUFuQjtNQUNBLENBQUMsQ0FBQyxTQUFGLENBQVksSUFBWjthQUNBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtJQUxROzt1QkFRVCxhQUFBLEdBQWUsU0FBQyxDQUFEO01BQ2QsSUFBRyxxQkFBQSxJQUFhLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQXNCLENBQXRCLENBQXBCO0FBQ0MsZUFBTyxNQURSO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxjQUFKO0FBQ0osZUFBTyxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQixFQURIO09BQUEsTUFBQTtBQUdKLGVBQU8sTUFISDs7SUFIUzs7Ozs7QUEvR2hCOzs7QUNDQTtFQUFBLEVBQUUsQ0FBQyxNQUFILEdBQVksU0FBQTtJQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUN6QixJQUFDLENBQUEsU0FBRCxHQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDdkIsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNiLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFFYixJQUFDLENBQUEsVUFBRCxHQUFjO0lBR2QsSUFBQyxDQUFBLEtBQUQsR0FBUyxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLEtBQVosQ0FBSDtRQUNDLEtBQUEsR0FBUSxFQUFFLENBQUMsTUFBTyxDQUFBLEtBQUE7UUFDbEIsSUFBTyxhQUFQO1VBQ0MsS0FBQSxHQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUMsT0FBRDtVQUNqQixPQUFPLENBQUMsSUFBUixDQUFhLHVCQUFBLEdBQXlCLEtBQXpCLEdBQWdDLHdDQUE3QyxFQUZEO1NBRkQ7T0FBQSxNQUtLLElBQU8sYUFBUDtRQUNKLEtBQUEsR0FBUSxFQUFFLENBQUMsTUFBTyxDQUFBLFNBQUEsRUFEZDs7QUFHTDtBQUFBLFdBQUEscUNBQUE7O1FBQ0MsSUFBRSxDQUFBLENBQUEsQ0FBRixHQUFPLEtBQU0sQ0FBQSxDQUFBO0FBRGQ7YUFFQTtJQVhRO0lBY1QsSUFBQyxDQUFBLE1BQUQsR0FBVSxTQUFDLENBQUQ7TUFDVCxJQUFnQixTQUFoQjtRQUFBLENBQUEsR0FBSSxLQUFKOztNQUNBLElBQWdDLG1CQUFBLElBQWUsQ0FBQSxJQUFLLEVBQUUsQ0FBQyxNQUF2RDtRQUFBLENBQUEsR0FBSSxFQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFlBQWpCOztBQUNBLGNBQU8sQ0FBUDtBQUFBLGFBQ00sSUFETjtVQUNnQixJQUFDLENBQUEsV0FBRCxHQUFlLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFBbkM7QUFETixhQUVNLEtBRk47VUFFaUIsSUFBQyxDQUFBLFdBQUQsR0FBZTtBQUExQjtBQUZOO1VBSUUsSUFBQyxDQUFBLFdBQUQsR0FBZTtBQUpqQjthQUtBO0lBUlM7SUFXVixJQUFDLENBQUEsSUFBRCxHQUFRLFNBQUMsQ0FBRDtNQUNQLElBQWdCLFNBQWhCO1FBQUEsQ0FBQSxHQUFJLEtBQUo7O01BQ0EsSUFBOEIsbUJBQUEsSUFBZSxDQUFBLElBQUssRUFBRSxDQUFDLE1BQXJEO1FBQUEsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBakI7O0FBQ0EsY0FBTyxDQUFQO0FBQUEsYUFDTSxLQUROO1VBQ2lCLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFBeEI7QUFETixhQUVNLElBRk47VUFFZ0IsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQWpDO0FBRk47VUFJRSxJQUFDLENBQUEsU0FBRCxHQUFhO0FBSmY7YUFLQTtJQVJPO0lBV1IsSUFBQyxDQUFBLElBQUQsR0FBUSxTQUFDLENBQUQ7TUFDUCxJQUFnQixTQUFoQjtRQUFBLENBQUEsR0FBSSxLQUFKOztNQUNBLElBQThCLG1CQUFBLElBQWUsQ0FBQSxJQUFLLEVBQUUsQ0FBQyxNQUFyRDtRQUFBLENBQUEsR0FBSSxFQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQWpCOztNQUNBLElBQWMsRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaLENBQWQ7UUFBQSxDQUFBLEdBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFKOztBQUNBLGNBQU8sQ0FBUDtBQUFBLGFBQ00sS0FETjtVQUNpQixJQUFDLENBQUEsU0FBRCxHQUFhO0FBQXhCO0FBRE4sYUFFTSxJQUZOO1VBRWdCLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUFqQztBQUZOO1VBSUUsSUFBQyxDQUFBLFNBQUQsR0FBYTtBQUpmO2FBS0E7SUFUTztJQVlSLElBQUMsQ0FBQSxRQUFELEdBQVksU0FBQyxLQUFEO01BQ1gsSUFBYSxLQUFBLEtBQVMsSUFBVCxJQUFxQixlQUFsQztRQUFBLEtBQUEsR0FBUSxFQUFSOztNQUNBLElBQWEsS0FBQSxLQUFTLEtBQXRCO1FBQUEsS0FBQSxHQUFRLEVBQVI7O01BQ0EsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFuQixDQUE0QixJQUE1QixFQUErQixLQUEvQjthQUNBO0lBSlc7SUFPWixJQUFDLENBQUEsWUFBRCxHQUFnQixTQUFDLENBQUQ7TUFDZixJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2I7SUFGZTtXQUloQjtFQXJFVzs7RUF1RVosRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBVixHQUFpQzs7RUFDakMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBVixHQUErQjs7RUFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBVixHQUErQixDQUFDLENBQUQsRUFBSSxDQUFKOztFQUUvQixFQUFFLENBQUMsTUFBSCxHQUNDO0lBQUEsQ0FBQSxPQUFBLENBQUEsRUFBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFvQixDQUFDLElBQXJCLENBQUEsQ0FBYjtJQUNBLEtBQUEsRUFBVyxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsMEJBQW5CLENBQThDLENBQUMsSUFBL0MsQ0FBb0QseUJBQXBELENBRFg7SUFFQSxJQUFBLEVBQVUsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFBLENBQVcsQ0FBQyxNQUFaLENBQW1CLEtBQW5CLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsT0FBL0IsQ0FGVjtJQUdBLElBQUEsRUFBVSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVyxDQUFDLElBQVosQ0FBaUIsS0FBakIsQ0FIVjtJQUlBLFFBQUEsRUFBYyxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVyxDQUFDLFlBQVosQ0FBeUIsQ0FBekIsQ0FKZDtJQUtBLElBQUEsRUFBVSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVyxDQUFDLElBQVosQ0FBQSxDQUxWOztBQTVFRDs7OztBQ0RBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsTUFBQTs7RUFtQk0sRUFBRSxDQUFDO0lBRUssYUFBQyxRQUFEO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSw4QkFBRCxXQUFZO0FBQ3pCO0FBQUEsV0FBQSxxQ0FBQTs7Z0JBQ0MsSUFBQyxDQUFBLFNBQVMsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQU87QUFEbEI7TUFHQSxJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxFQUFFLENBQUM7TUFFeEIsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsSUFBVixFQUFnQixJQUFoQjtJQVBZOztrQkFTYixJQUFBLEdBQU0sU0FBQTtBQUVMLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUF0QjtNQUdqQixJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUF4QixDQUFIO1FBQ0MsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQWYsQ0FBcUIsSUFBckIsRUFEbEI7O0FBRUEsV0FBQSx1QkFBQTtRQUFBLElBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUssQ0FBQSxDQUFBO0FBQXRCO0FBR0EsV0FBQSwwQkFBQTtRQUFBLElBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBO0FBQXpCO01BR0EsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBeEIsQ0FBSDtRQUNDLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEIsRUFEYjtPQUFBLE1BQUE7QUFHQyxhQUFBLDZCQUFBO1VBQUEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFBLENBQVYsR0FBa0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFRLENBQUEsSUFBQTtBQUFwQyxTQUhEOztNQU9BLGVBQUEsR0FBa0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQsRUFBVyxNQUFYO0FBQ2pCLGNBQUE7QUFBQTtlQUFBLGdCQUFBOztZQUNDLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxDQUExQjt5QkFDQSxlQUFBLENBQWdCLFFBQVMsQ0FBQSxJQUFBLENBQXpCLEVBQWdDLEtBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxDQUExQztBQUZEOztRQURpQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFJbEIsZUFBQSxDQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQTFCLEVBQXFDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBaEQ7O1dBR2MsQ0FBRSxJQUFoQixDQUFxQixJQUFyQjs7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLGVBQWYsQ0FBK0IsSUFBL0IsRUFBa0MsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUE1QztNQUdBLElBQUcsNEJBQUg7ZUFDQyxJQUFDLENBQUEsU0FBUyxDQUFDLEVBQVgsQ0FBYyxRQUFkLEVBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBakIsQ0FBdUIsS0FBdkIsRUFBNkIsU0FBN0I7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFERDs7SUFqQ0s7Ozs7O0FBOUJQOzs7QUNBQTtFQUFNLEVBQUUsQ0FBQztJQUVLLGVBQUMsR0FBRDtNQUNaLElBQUMsQ0FBQSxLQUFELEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkI7TUFDVCxJQUFDLENBQUEsR0FBRCxHQUFPO01BQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUVULElBQWEsR0FBYjtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sR0FBTixFQUFBOztJQUxZOztvQkFPYixJQUFBLEdBQU0sU0FBQyxHQUFEO01BQ0wsSUFBQyxDQUFBLEdBQUQsR0FBTztNQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNsQyxLQUFDLENBQUEsS0FBRCxHQUFTO1FBRHlCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQzthQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxHQUFhO0lBSlI7O29CQU1OLElBQUEsR0FBTSxTQUFBO01BQ0wsSUFBRyxJQUFDLENBQUEsS0FBSjtlQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLEVBREQ7T0FBQSxNQUFBO2VBR0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxpQkFBQSxHQUFtQixJQUFDLENBQUEsR0FBcEIsR0FBeUIscUJBQXRDLEVBSEQ7O0lBREs7Ozs7O0FBZlA7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7SUFFSyxnQkFBQTtNQUNaLHNDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUZJOzs7O0tBRlUsRUFBRSxDQUFDO0FBQTNCOzs7QUNBQTtBQUFBLE1BQUE7O0VBQU0sRUFBRSxDQUFDO0lBRUssa0JBQUE7OztBQUNaLFVBQUE7TUFBQSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQVQsQ0FBZSxJQUFmO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUdSLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQVQ7TUFDYixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksRUFBRSxDQUFDO01BQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFWLElBQThCO01BQzVDLElBQWdDLHNEQUFoQztRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFBLEVBQWpCOztNQUdBLE9BQUEsR0FBVSxFQUFFLENBQUMsY0FBSCxDQUFrQixTQUFsQixFQUNUO1FBQUEsU0FBQSxFQUFXLE1BQVg7UUFDQSxVQUFBLEVBQVksTUFEWjtRQUVBLEdBQUEsRUFBSyxFQUZMO1FBR0EsYUFBQSxFQUFlLEtBSGY7UUFJQSxVQUFBLEVBQVksS0FKWjtRQUtBLGNBQUEsRUFBZ0IsS0FMaEI7UUFNQSxjQUFBLEVBQWdCLElBTmhCO09BRFM7QUFVVjtBQUFBLFdBQUEsdUNBQUE7O1FBQ0MsSUFBRSxDQUFBLElBQUEsQ0FBRixHQUFVLE9BQVEsQ0FBQSxJQUFBO0FBRG5CO01BSUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFJLEVBQUUsQ0FBQyxRQUFILENBQVksT0FBTyxDQUFDLEtBQXBCO01BR2xCLElBQUMsQ0FBQSxLQUFELElBQVUsSUFBQyxDQUFBO01BQ1gsSUFBQyxDQUFBLE1BQUQsSUFBVyxJQUFDLENBQUE7TUFHWixJQUFDLENBQUEsR0FBRCxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO01BQ1AsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBWCxHQUFvQixPQUFPLENBQUMsTUFBUixJQUFrQjtNQUN0QyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFYLEdBQXVCO01BQ3ZCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0IsSUFBQyxDQUFBO01BQ3pCLElBQUMsQ0FBQSxHQUFHLENBQUMsYUFBTCxHQUFxQixTQUFBO2VBQUc7TUFBSDtNQUdyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFBTCxDQUFnQixJQUFoQjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxHQUF3QjtNQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLHFCQUFULEdBQWlDLE9BQU8sQ0FBQztNQUd6QyxJQUFrRCxFQUFFLENBQUMsUUFBSCxDQUFZLElBQUMsQ0FBQSxTQUFiLENBQWxEO1FBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUFDLENBQUEsU0FBeEIsRUFBYjs7TUFDQSxJQUFHLElBQUMsQ0FBQSxVQUFELElBQWdCLElBQUMsQ0FBQSxTQUFELEtBQWMsUUFBUSxDQUFDLElBQTFDO1FBQ0MsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsQ0FBMUIsQ0FBNEIsQ0FBQyxLQUE3QixDQUFtQyxVQUFuQyxFQUErQyxRQUEvQztRQUNBLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxLQUFoQixDQUFzQixPQUF0QixFQUErQixNQUEvQixDQUFzQyxDQUFDLEtBQXZDLENBQTZDLFFBQTdDLEVBQXVELE1BQXZELEVBRkQ7O01BS0EsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNWLGNBQUE7VUFBQSxXQUFBLEdBQWMsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLEdBQWMsS0FBQyxDQUFBLEdBQUcsQ0FBQztVQUNqQyxjQUFBLEdBQWlCLEtBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxHQUEwQixLQUFDLENBQUEsU0FBUyxDQUFDO1VBQ3RELElBQUcsY0FBQSxHQUFpQixXQUFwQjtZQUNDLE1BQUEsR0FBUyxLQUFDLENBQUEsU0FBUyxDQUFDO1lBQ3BCLEtBQUEsR0FBUSxNQUFBLEdBQVMsZUFGbEI7V0FBQSxNQUFBO1lBSUMsS0FBQSxHQUFRLEtBQUMsQ0FBQSxTQUFTLENBQUM7WUFDbkIsTUFBQSxHQUFTLEtBQUEsR0FBUSxlQUxsQjs7VUFNQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxHQUFhLEtBQUEsR0FBUSxLQUFDLENBQUE7VUFDL0IsS0FBQyxDQUFBLE1BQUQsR0FBVSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsR0FBYyxNQUFBLEdBQVMsS0FBQyxDQUFBO1VBQ2xDLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQVgsR0FBbUIsS0FBQSxHQUFRO1VBQzNCLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQVgsR0FBb0IsTUFBQSxHQUFTO2lCQUM3QixLQUFDLENBQUEsTUFBRCxDQUFBO1FBYlU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BZVgsSUFBRyxDQUFJLElBQUMsQ0FBQSxVQUFSO1FBQ0MsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBWCxHQUFtQixDQUFDLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLFVBQVgsQ0FBQSxHQUF5QjtRQUM1QyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsVUFBWixDQUFBLEdBQTBCO1FBQzlDLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQTtRQUNkLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxHQUFjLElBQUMsQ0FBQSxPQUpoQjtPQUFBLE1BQUE7UUFNQyxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUM7UUFDcEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFqQixDQUFrQyxRQUFsQyxFQUE0QyxRQUE1QztRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsZ0JBQUwsQ0FBc0IsaUJBQXRCLEVBQXlDLFFBQXpDLEVBVEQ7O01BWUEsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNOLElBQUcsS0FBQyxDQUFBLFNBQUo7WUFDQyxJQUFzQix1QkFBdEI7Y0FBQSxLQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxFQUFBOztZQUNBLEtBQUMsQ0FBQSxNQUFELENBQUE7WUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsS0FBbkI7WUFDQSxLQUFDLENBQUEsU0FBRCxJQUFjO1lBQ2QsSUFBcUIsdUJBQXJCO2NBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQUEsRUFBQTthQUxEOztpQkFNQSxxQkFBQSxDQUFzQixJQUF0QjtRQVBNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQVFQLElBQUEsQ0FBQTtNQUdBLFNBQUEsR0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1gsS0FBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLEtBQUMsQ0FBQSxHQUF4QjtRQURXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUVaLFVBQUEsQ0FBVyxTQUFYLEVBQXNCLENBQXRCO01BR0EsRUFBRSxDQUFDLGVBQWUsQ0FBQyxNQUFuQixDQUEwQixJQUExQjtNQUNBLEVBQUUsQ0FBQyxlQUFlLENBQUMsTUFBbkIsQ0FBMEIsSUFBMUI7SUFoR1k7O3VCQW9HYixLQUFBLEdBQU8sU0FBQTthQUFHLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFBaEI7O3dCQUNQLFVBQUEsR0FBVSxTQUFBO2FBQUcsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUFoQjs7dUJBQ1YsTUFBQSxHQUFRLFNBQUE7YUFBRyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUksSUFBQyxDQUFBO0lBQXJCOzt1QkFJUixNQUFBLEdBQVEsU0FBQTtNQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO01BR0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUdBLElBQThDLElBQUMsQ0FBQSxjQUEvQztRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixJQUFDLENBQUEsS0FBRCxHQUFTLENBQTVCLEVBQStCLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBekMsRUFBQTs7TUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBZSxJQUFDLENBQUEsVUFBaEIsRUFBNEIsSUFBQyxDQUFBLFVBQTdCO01BR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULENBQWUsQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQWpDLEVBQW9DLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUF0RDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBekI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFyQyxFQUF3QyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQTFEO01BR0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsS0FBWjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBO2FBQ0E7SUFwQk87O3VCQXVCUixXQUFBLEdBQWEsU0FBQTtNQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixJQUFDLENBQUEsS0FBMUIsRUFBaUMsSUFBQyxDQUFBLE1BQWxDO2FBQ0E7SUFGWTs7dUJBS2IsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQSxJQUFHLGNBQUg7QUFDQyxhQUFBLDBDQUFBOztVQUNDLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1VBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxLQUFYO1VBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUE7QUFIRCxTQUREOzthQUtBO0lBTlc7O3VCQVNaLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVixVQUFBO01BQUEsSUFBQSxDQUFnQixLQUFLLENBQUMsT0FBdEI7QUFBQSxlQUFPLEtBQVA7O01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBbEMsRUFBcUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFwRDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsUUFBdEI7TUFDQSxFQUFBLEdBQUssS0FBSyxDQUFDLEtBQUssQ0FBQztNQUNqQixFQUFBLEdBQUssS0FBSyxDQUFDLEtBQUssQ0FBQztNQUNqQixJQUFHLEVBQUEsR0FBSyxFQUFMLEdBQVUsR0FBVixJQUFpQixFQUFBLEdBQUssRUFBTCxHQUFVLElBQTlCO1FBQ0MsSUFBVSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQXpCO1VBQUEsRUFBQSxHQUFLLEVBQUw7O1FBQ0EsSUFBVSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsQ0FBQSxHQUFlLElBQXpCO1VBQUEsRUFBQSxHQUFLLEVBQUw7U0FGRDs7TUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBZSxFQUFmLEVBQW1CLEVBQW5CO01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULElBQXdCLEtBQUssQ0FBQztNQUM5QixJQUFHLHlCQUFIO1FBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLEtBQUssQ0FBQztRQUM3QixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsS0FBSyxDQUFDO1FBQzNCLElBQW9DLHFCQUFwQztVQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxHQUFtQixLQUFLLENBQUMsUUFBekI7O1FBQ0EsSUFBc0Msc0JBQXRDO1VBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEdBQW9CLEtBQUssQ0FBQyxTQUExQjtTQUpEOztNQU1BLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBO0FBRUEsY0FBTyxLQUFLLENBQUMsSUFBYjtBQUFBLGFBQ00sT0FETjtVQUNtQixJQUFDLENBQUEsU0FBRCxDQUFXLEtBQVg7QUFBYjtBQUROLGFBRU0sTUFGTjtVQUVrQixJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVY7QUFBWjtBQUZOLGFBR00sUUFITjtVQUdvQixJQUFDLENBQUEsVUFBRCxDQUFZLEtBQVo7QUFBZDtBQUhOLGFBSU0sU0FKTjtVQUlxQixJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWI7QUFBZjtBQUpOLGFBS00sVUFMTjtVQUtzQixJQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQ7QUFBaEI7QUFMTixhQU1NLFdBTk47VUFNdUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmO0FBQWpCO0FBTk4sYUFPTSxLQVBOO1VBT2lCLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVDtBQUFYO0FBUE4sYUFRTSxLQVJOO1VBUWlCLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVDtBQUFYO0FBUk4sYUFTTSxTQVROO1VBU3FCLElBQUMsQ0FBQSxXQUFELENBQWEsS0FBYjtBQUFmO0FBVE4sYUFVTSxVQVZOO1VBVXNCLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZDtBQUFoQjtBQVZOLGFBV00sUUFYTjtVQVdvQixJQUFDLENBQUEsVUFBRCxDQUFZLEtBQVo7QUFBZDtBQVhOLGFBWU0sV0FaTjtVQVl1QixJQUFDLENBQUEsYUFBRCxDQUFlLEtBQWY7QUFBakI7QUFaTixhQWFNLE9BYk47VUFhbUIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxLQUFYO0FBQWI7QUFiTixhQWNNLFVBZE47QUFBQSxhQWNrQixPQWRsQjtBQWNrQjtBQWRsQjtVQWdCRSxPQUFPLENBQUMsR0FBUixDQUFZLCtCQUFaLEVBQTZDLEtBQUssQ0FBQyxJQUFuRCxFQUF5RCxLQUF6RDtBQWhCRjtNQW1CQSxJQUFHLHlCQUFBLElBQXFCLEtBQUssQ0FBQyxRQUE5QjtRQUNDLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixLQUFLLENBQUM7UUFDM0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsRUFGRDs7TUFJQSxJQUFHLEtBQUssQ0FBQyxTQUFUO1FBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULEdBQTBCLEtBQUssQ0FBQzs7Y0FDeEIsQ0FBQyxZQUFhLEtBQUssQ0FBQzs7UUFDNUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7UUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsRUFBckIsRUFKRDtPQUFBLE1BS0ssSUFBRyx5QkFBSDtRQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBREk7O01BR0wsSUFBOEIsc0JBQTlCO1FBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFLLENBQUMsUUFBbEIsRUFBQTs7TUFDQSxJQUErQixJQUFDLENBQUEsYUFBaEM7UUFBQSxJQUFDLENBQUEsVUFBRCxDQUFZLEtBQUssQ0FBQyxTQUFsQixFQUFBOztNQUNBLElBQTRCLElBQUMsQ0FBQSxVQUFELElBQWdCLHNCQUE1QztRQUFBLElBQUMsQ0FBQSxVQUFELENBQVksS0FBSyxDQUFDLE1BQWxCLEVBQUE7O2FBQ0E7SUF2RFU7O3VCQTJEWCxTQUFBLEdBQVcsU0FBQyxLQUFEO01BQ1YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBSyxDQUFDLENBQW5CLEVBQXNCLEtBQUssQ0FBQyxDQUE1QixFQUErQixFQUFFLENBQUMsaUJBQWxDLEVBQXFELENBQXJELEVBQXdELEVBQUUsQ0FBQyxNQUEzRDthQUNBO0lBRlU7O3VCQUtYLFFBQUEsR0FBVSxTQUFDLEtBQUQ7TUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFoQyxFQUFtQyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQW5EO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBaEMsRUFBbUMsS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFuRDthQUNBO0lBSFM7O3VCQU1WLFVBQUEsR0FBWSxTQUFDLEtBQUQ7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxLQUFLLENBQUMsRUFBbkIsRUFBdUIsS0FBSyxDQUFDLEVBQTdCLEVBQWlDLEtBQUssQ0FBQyxNQUF2QyxFQUErQyxDQUEvQyxFQUFrRCxFQUFFLENBQUMsTUFBckQ7YUFDQTtJQUZXOzt1QkFLWixXQUFBLEdBQWEsU0FBQyxLQUFEO01BQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLENBQWpCLEVBQW9CLENBQXBCLEVBQXVCLEtBQUssQ0FBQyxPQUE3QixFQUFzQyxLQUFLLENBQUMsT0FBNUMsRUFBcUQsQ0FBckQsRUFBd0QsRUFBRSxDQUFDLE1BQTNELEVBQW1FLEtBQW5FO2FBQ0E7SUFGWTs7dUJBS2IsWUFBQSxHQUFjLFNBQUMsS0FBRDtNQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQWhDLEVBQW1DLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBbkQ7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFoQyxFQUFtQyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQW5EO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBaEMsRUFBbUMsS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFuRDtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBO2FBQ0E7SUFMYTs7dUJBUWQsYUFBQSxHQUFlLFNBQUMsS0FBRDtNQUNkLElBQW9DLEtBQUssQ0FBQyxZQUFOLEtBQXNCLENBQTFEO0FBQUEsZUFBTyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEIsRUFBUDs7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQTVCLEVBQStCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBN0MsRUFBZ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUEzRCxFQUFrRSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQTdFO2FBQ0E7SUFIYzs7dUJBTWYsa0JBQUEsR0FBb0IsU0FBQyxLQUFEO0FBQ25CLFVBQUE7TUFBQSxFQUFBLEdBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQztNQUNuQixFQUFBLEdBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQztNQUNuQixFQUFBLEdBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQztNQUNuQixFQUFBLEdBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQztNQUNuQixDQUFBLEdBQUksS0FBSyxDQUFDO01BRVYsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEVBQWhCLEVBQW9CLEVBQUEsR0FBSyxDQUF6QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUIsRUFBQSxHQUFLLENBQTVCLEVBQStCLEVBQS9CLEVBQW1DLENBQW5DO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEVBQUEsR0FBSyxDQUFyQixFQUF3QixFQUF4QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUIsRUFBdkIsRUFBMkIsRUFBQSxHQUFLLENBQWhDLEVBQW1DLENBQW5DO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEVBQWhCLEVBQW9CLEVBQUEsR0FBSyxDQUF6QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUIsRUFBQSxHQUFLLENBQTVCLEVBQStCLEVBQS9CLEVBQW1DLENBQW5DO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEVBQUEsR0FBSyxDQUFyQixFQUF3QixFQUF4QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUIsRUFBdkIsRUFBMkIsRUFBQSxHQUFLLENBQWhDLEVBQW1DLENBQW5DO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7TUFFQSxJQUF5QywyQkFBQSxJQUF1QixLQUFLLENBQUMsU0FBdEU7O2NBQVEsQ0FBQyxZQUFhLEtBQUssQ0FBQztTQUE1Qjs7YUFDQTtJQWxCbUI7O3VCQXFCcEIsT0FBQSxHQUFTLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLEtBQUssQ0FBQyxFQUFuQixFQUF1QixLQUFLLENBQUMsRUFBN0IsRUFBaUMsS0FBSyxDQUFDLE1BQXZDLEVBQStDLEtBQUssQ0FBQyxLQUFyRCxFQUE0RCxLQUFLLENBQUMsR0FBbEU7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBSyxDQUFDLEVBQXRCLEVBQTBCLEtBQUssQ0FBQyxFQUFoQztNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBO2FBQ0E7SUFKUTs7dUJBT1QsT0FBQSxHQUFTLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLEtBQUssQ0FBQyxFQUFuQixFQUF1QixLQUFLLENBQUMsRUFBN0IsRUFBaUMsS0FBSyxDQUFDLE1BQXZDLEVBQStDLEtBQUssQ0FBQyxLQUFyRCxFQUE0RCxLQUFLLENBQUMsR0FBbEU7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBQTthQUNBO0lBSFE7O3VCQU1ULFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWixVQUFBO0FBQUE7QUFBQSxXQUFBLHVDQUFBOztRQUNDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsQ0FBdEIsRUFBeUIsS0FBSyxDQUFDLENBQS9CO0FBREQ7TUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBQTthQUNBO0lBSlk7O3VCQU9iLFlBQUEsR0FBYyxTQUFDLEtBQUQ7QUFDYixVQUFBO0FBQUE7QUFBQSxXQUFBLHVDQUFBOztRQUNDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsQ0FBdEIsRUFBeUIsS0FBSyxDQUFDLENBQS9CO0FBREQ7YUFFQTtJQUhhOzt1QkFNZCxVQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1gsVUFBQTtNQUFBLElBQUcseUJBQUg7UUFDQyxHQUFBLEdBQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUNyQixJQUFHLEdBQUEsS0FBTyxDQUFWO1VBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUssQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBbEMsRUFBcUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUF2RDtVQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQWxDLEVBQXFDLEtBQUssQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBdkQsRUFGRDtTQUFBLE1BR0ssSUFBRyxHQUFBLEdBQU0sQ0FBVDtVQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQWxDLEVBQXFDLEtBQUssQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBdkQ7QUFDQSxlQUFTLGtGQUFUO1lBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQ0UsS0FBSyxDQUFDLG1CQUFvQixDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxDQURuQyxFQUVFLEtBQUssQ0FBQyxtQkFBb0IsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFNLENBQUMsQ0FGbkMsRUFHRSxLQUFLLENBQUMsa0JBQW1CLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FIOUIsRUFJRSxLQUFLLENBQUMsa0JBQW1CLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FKOUIsRUFLRSxLQUFLLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBTHBCLEVBTUUsS0FBSyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQU5wQjtBQURELFdBRkk7U0FMTjs7YUFnQkE7SUFqQlc7O3VCQW9CWixhQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2QsVUFBQTtNQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixJQUFjLEVBQUUsQ0FBQztNQUV4QixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixDQUFIO1FBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLEtBQUssQ0FBQztRQUMzQixJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsR0FBd0IsS0FBSyxDQUFDO1FBQzlCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxHQUFnQjtRQUVoQixJQUFHLHlCQUFIO1VBQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULENBQW9CLEtBQUssQ0FBQyxJQUExQixFQUFnQyxLQUFLLENBQUMsQ0FBdEMsRUFBeUMsS0FBSyxDQUFDLENBQS9DLEVBREQ7O1FBRUEsSUFBRyx1QkFBSDtVQUNDLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixLQUFLLENBQUM7VUFDM0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQWtCLEtBQUssQ0FBQyxJQUF4QixFQUE4QixLQUFLLENBQUMsQ0FBcEMsRUFBdUMsS0FBSyxDQUFDLENBQTdDLEVBRkQ7U0FQRDtPQUFBLE1BVUssSUFBRyxJQUFBLFlBQWdCLEVBQUUsQ0FBQyxXQUFuQixJQUFtQyxJQUFJLENBQUMsS0FBM0M7UUFDSixTQUFBLEdBQVksSUFBSSxDQUFDLGdCQUFMLENBQXNCLEtBQUssQ0FBQyxJQUE1QjtRQUNaLE9BQUE7QUFBVSxrQkFBTyxLQUFLLENBQUMsU0FBYjtBQUFBLGlCQUNKLE1BREk7cUJBQ1E7QUFEUixpQkFFSixRQUZJO3FCQUVVLENBQUMsU0FBRCxHQUFhO0FBRnZCLGlCQUdKLE9BSEk7cUJBR1MsQ0FBQztBQUhWOztRQUlWLE9BQUE7QUFBVSxrQkFBTyxLQUFLLENBQUMsWUFBYjtBQUFBLGlCQUNKLEtBREk7cUJBQ087QUFEUCxpQkFFSixRQUZJO3FCQUVVLENBQUMsSUFBSSxDQUFDLE1BQU4sR0FBZTtBQUZ6QixpQkFHSixRQUhJO3FCQUdVLENBQUMsSUFBSSxDQUFDO0FBSGhCOztBQUlWLGFBQVMsMEZBQVQ7VUFDQyxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQUssQ0FBQSxDQUFBO1VBQ2xCLFVBQUEsR0FBYSxJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFuQjtVQUNiLElBQUcsa0JBQUg7WUFDQyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsVUFBbkIsRUFBK0IsS0FBSyxDQUFDLENBQU4sR0FBVSxPQUF6QyxFQUFrRCxLQUFLLENBQUMsQ0FBTixHQUFVLE9BQTVEO1lBQ0EsT0FBQSxJQUFXLFVBQVUsQ0FBQyxNQUZ2QjtXQUFBLE1BQUE7WUFJQyxPQUFBLElBQVcsR0FKWjs7QUFIRCxTQVZJOzthQWtCTDtJQS9CYzs7dUJBa0NmLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxLQUFLLENBQUMsS0FBVDtRQUNDLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ2YsQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDZixFQUFBLEdBQUssQ0FBQyxDQUFELEdBQUssS0FBSyxDQUFDLEtBQUssQ0FBQztRQUN0QixFQUFBLEdBQUssQ0FBQyxDQUFELEdBQUssS0FBSyxDQUFDLEtBQUssQ0FBQztRQUN0QixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsS0FBSyxDQUFDLEtBQXpCLEVBQWdDLEVBQWhDLEVBQW9DLEVBQXBDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBTEQ7O2FBTUE7SUFQVTs7dUJBVVgsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxHQUF1QixFQUFFLENBQUMsUUFBUSxDQUFDOztZQUMzQixDQUFDLFlBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQzs7TUFDbEMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBTSxDQUFDLEVBQXJCLEVBQXlCLE1BQU0sQ0FBQyxFQUFoQyxFQUFvQyxNQUFNLENBQUMsRUFBUCxHQUFZLE1BQU0sQ0FBQyxFQUF2RCxFQUEyRCxNQUFNLENBQUMsRUFBUCxHQUFZLE1BQU0sQ0FBQyxFQUE5RTtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO2FBQ0E7SUFOVzs7Ozs7O0VBYWIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxtQkFBWixHQUFrQzs7RUFHbEMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBWixHQUFnQyxDQUFDLENBQUQsRUFBSSxDQUFKO0FBOVdoQzs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztJQUVLLGVBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ2IscUNBQUE7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBRkk7Ozs7S0FGUyxFQUFFLENBQUM7QUFBMUI7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7a0JBRVIsSUFBQSxHQUFNOztrQkFDTixRQUFBLEdBQVU7O0lBRUcsYUFBQyxFQUFELEVBQU0sRUFBTixFQUFXLE1BQVgsRUFBb0IsS0FBcEIsRUFBNEIsR0FBNUI7QUFDWixVQUFBO01BRGEsSUFBQyxDQUFBLEtBQUQ7TUFBSyxJQUFDLENBQUEsS0FBRDtNQUFLLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsTUFBRDtNQUN4QyxtQ0FBQTtNQUVBLElBQW1DLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEdBQTdDO1FBQUEsTUFBaUIsQ0FBQyxJQUFDLENBQUEsR0FBRixFQUFPLElBQUMsQ0FBQSxLQUFSLENBQWpCLEVBQUMsSUFBQyxDQUFBLGNBQUYsRUFBUyxJQUFDLENBQUEsYUFBVjs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsRUFBVixFQUFjLElBQUMsQ0FBQSxFQUFmO01BQ2QsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEtBQXhCLENBQVIsRUFBd0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEdBQXhCLENBQXhDO01BQ2QsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDO01BRXJCLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosRUFBZSxJQUFDLENBQUEsZUFBaEI7TUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosRUFBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFBRyxjQUFBO3FEQUFRLENBQUUsTUFBVixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7SUFYWTs7a0JBYWIsS0FBQSxHQUFPLFNBQUE7YUFBTyxJQUFBLEVBQUUsQ0FBQyxHQUFILENBQU8sSUFBQyxDQUFBLEVBQVIsRUFBWSxJQUFDLENBQUEsRUFBYixFQUFpQixJQUFDLENBQUEsTUFBbEIsRUFBMEIsSUFBQyxDQUFBLEtBQTNCLEVBQWtDLElBQUMsQ0FBQSxHQUFuQztJQUFQOztrQkFFUCxlQUFBLEdBQWlCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLEVBQWIsRUFBaUIsSUFBQyxDQUFBLEVBQWxCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBbEIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEtBQXhCLENBQXZCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBbEIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEdBQXhCLENBQXZCO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDO2FBQ3JCO0lBTGdCOzs7O0tBcEJHLEVBQUUsQ0FBQztBQUF4Qjs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztxQkFFUixJQUFBLEdBQU07O3FCQUNOLFFBQUEsR0FBVTs7SUFFRyxnQkFBQyxPQUFELEVBQWUsRUFBZixFQUF1QixFQUF2QjtNQUFDLElBQUMsQ0FBQSw0QkFBRCxVQUFXOztRQUFHLEtBQUs7OztRQUFHLEtBQUs7O01BQ3hDLHNDQUFBO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLEVBQWI7TUFDZixJQUFDLENBQUEsTUFBRCxHQUFVO01BRVYsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLElBQUMsQ0FBQSxPQUFGO01BQ2IsSUFBQyxDQUFBLEVBQUQsQ0FBSSxlQUFKLEVBQXFCLElBQUMsQ0FBQSxlQUF0QjtJQVBZOztxQkFTYixLQUFBLEdBQU8sU0FBQTthQUFVLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFDLENBQUEsTUFBWCxFQUFtQixJQUFDLENBQUEsRUFBcEIsRUFBd0IsSUFBQyxDQUFBLEVBQXpCO0lBQVY7O3FCQUVQLGVBQUEsR0FBaUIsU0FBQTthQUNoQixJQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLEVBQW5CLEVBQXVCLElBQUMsQ0FBQSxFQUF4QjtJQURnQjs7SUFLakIsTUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQ0M7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxPQUFPLENBQUM7TUFBWixDQUFMO01BQ0EsR0FBQSxFQUFLLFNBQUMsR0FBRDtRQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBVCxHQUFhO2VBQ2IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxlQUFULEVBQTBCLElBQTFCO01BRkksQ0FETDtLQUREOztJQU1BLE1BQUMsQ0FBQSxRQUFELENBQVUsSUFBVixFQUNDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDO01BQVosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLENBQVQsR0FBYTtlQUNiLElBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUEwQixJQUExQjtNQUZJLENBREw7S0FERDs7SUFNQSxNQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLEVBQUQsR0FBTSxHQUFHLENBQUM7UUFDVixJQUFDLENBQUEsRUFBRCxHQUFNLEdBQUcsQ0FBQztRQUNWLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFYLEdBQWdCO2VBQ2hCLElBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUEwQixJQUExQjtNQUxJLENBREw7S0FERDs7SUFTQSxNQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLE9BQUQsQ0FBUyxlQUFULEVBQTBCLElBQTFCO2VBQ0E7TUFISSxDQURMO0tBREQ7Ozs7S0ExQ3VCLEVBQUUsQ0FBQztBQUEzQjs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztzQkFFUixJQUFBLEdBQU07O3NCQUNOLFFBQUEsR0FBVTs7SUFFRyxpQkFBQyxRQUFELEVBQWlCLFFBQWpCO01BQUMsSUFBQyxDQUFBLDhCQUFELFdBQVk7TUFBSSxJQUFDLENBQUEsOEJBQUQsV0FBWTtNQUN6Qyx1Q0FBQTtJQURZOztJQUtiLE9BQUMsQ0FBQSxRQUFELENBQVUsU0FBVixFQUNDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUE7TUFBSixDQUFMO01BQ0EsR0FBQSxFQUFLLFNBQUMsR0FBRDtRQUNKLElBQUMsQ0FBQSxRQUFELEdBQVk7ZUFDWixJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsSUFBcEI7TUFGSSxDQURMO0tBREQ7O0lBT0EsT0FBQyxDQUFBLFFBQUQsQ0FBVSxTQUFWLEVBQ0M7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQTtNQUFKLENBQUw7TUFDQSxHQUFBLEVBQUssU0FBQyxHQUFEO1FBQ0osSUFBQyxDQUFBLFFBQUQsR0FBWTtlQUNaLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBVCxFQUFvQixJQUFwQjtNQUZJLENBREw7S0FERDs7OztLQWpCd0IsRUFBRSxDQUFDO0FBQTVCOzs7QUNBQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQzs7O2tCQUVSLElBQUEsR0FBTTs7a0JBQ04sUUFBQSxHQUFVOztJQUVHLGFBQUMsRUFBRCxFQUFNLEVBQU4sRUFBVyxNQUFYLEVBQW9CLEtBQXBCLEVBQTRCLEdBQTVCO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLEtBQUQ7TUFBSyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLE1BQUQ7TUFDeEMsbUNBQUE7TUFFQSxJQUFtQyxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxHQUE3QztRQUFBLE1BQWlCLENBQUMsSUFBQyxDQUFBLEdBQUYsRUFBTyxJQUFDLENBQUEsS0FBUixDQUFqQixFQUFDLElBQUMsQ0FBQSxjQUFGLEVBQVMsSUFBQyxDQUFBLGFBQVY7O01BRUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLEVBQVYsRUFBYyxJQUFDLENBQUEsRUFBZjtNQUNkLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLElBQUMsQ0FBQSxNQUFmLEVBQXVCLElBQUMsQ0FBQSxLQUF4QixDQUFSLEVBQXdDLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLElBQUMsQ0FBQSxNQUFmLEVBQXVCLElBQUMsQ0FBQSxHQUF4QixDQUF4QztNQUVkLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FDWixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBREgsRUFFWixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRkgsRUFHWixJQUFDLENBQUEsTUFIVztNQUtiLElBQUMsQ0FBQSxFQUFELENBQUksU0FBSixFQUFlLElBQUMsQ0FBQSxlQUFoQjtNQUNBLElBQUMsQ0FBQSxFQUFELENBQUksU0FBSixFQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUFHLGNBQUE7cURBQVEsQ0FBRSxNQUFWLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtJQWRZOztrQkFnQmIsS0FBQSxHQUFPLFNBQUE7YUFBTyxJQUFBLEVBQUUsQ0FBQyxHQUFILENBQU8sSUFBQyxDQUFBLEVBQVIsRUFBWSxJQUFDLENBQUEsRUFBYixFQUFpQixJQUFDLENBQUEsTUFBbEIsRUFBMEIsSUFBQyxDQUFBLEtBQTNCLEVBQWtDLElBQUMsQ0FBQSxHQUFuQztJQUFQOztrQkFFUCxlQUFBLEdBQWlCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLEVBQWIsRUFBaUIsSUFBQyxDQUFBLEVBQWxCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBbEIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEtBQXhCLENBQXZCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBbEIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBQyxDQUFBLE1BQWYsRUFBdUIsSUFBQyxDQUFBLEdBQXhCLENBQXZCO2FBQ0E7SUFKZ0I7Ozs7S0F2QkcsRUFBRSxDQUFDO0FBQXhCOzs7QUNBQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQzs7O21CQUVSLElBQUEsR0FBTTs7bUJBQ04sUUFBQSxHQUFVOztJQUVHLGNBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYjtNQUNaLG9DQUFBO01BRUEsSUFBRyxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF0QjtRQUNDLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBSyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQUEsQ0FBTCxFQUFxQixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQUEsQ0FBckIsRUFEWDtPQUFBLE1BRUssSUFBRyxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF0QjtRQUNKLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSCxDQUFBLENBQUQsRUFBYSxFQUFFLENBQUMsS0FBSCxDQUFBLENBQWIsRUFETjtPQUFBLE1BQUE7UUFHSixJQUFDLENBQUEsTUFBRCxHQUFVLENBQUssSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxFQUFiLENBQUwsRUFBMkIsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxFQUFiLENBQTNCLEVBSE47O01BS0wsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBQTtNQUNoQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQTtNQUVkLElBQUMsQ0FBQSxFQUFELENBQUksU0FBSixFQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNkLEtBQUMsQ0FBQSxNQUFELEdBQVUsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFYLENBQXNCLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUE5QjtpQkFDVixLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxDQUFDLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBWCxHQUFlLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBM0IsQ0FBQSxHQUFnQyxDQUE5QyxFQUFpRCxDQUFDLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBWCxHQUFlLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBM0IsQ0FBQSxHQUFnQyxDQUFqRjtRQUZjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO01BSUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFUO0lBbEJZOzttQkFvQmIsS0FBQSxHQUFPLFNBQUE7YUFBTyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQWhCLEVBQW9CLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUE1QjtJQUFQOzttQkFJUCxHQUFBLEdBQUssU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQsRUFBYSxFQUFiO01BQ0osSUFBRyx3Q0FBSDtRQUNDLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBWCxDQUFlLEVBQWYsRUFBbUIsRUFBbkI7UUFDQSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQVgsQ0FBZSxFQUFmLEVBQW1CLEVBQW5CLEVBRkQ7T0FBQSxNQUFBO1FBSUMsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVIsR0FBYTtRQUNiLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFSLEdBQWEsR0FMZDs7TUFNQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQ7YUFDQTtJQVJJOzttQkFVTCxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssRUFBTDtNQUNWLElBQUcsVUFBSDtRQUNDLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBWCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFERDtPQUFBLE1BQUE7UUFHQyxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVgsQ0FBZ0IsRUFBaEIsRUFIRDs7TUFJQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQ7YUFDQTtJQU5VOzttQkFRWCxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssRUFBTDtNQUNWLElBQUcsVUFBSDtRQUNDLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBWCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFERDtPQUFBLE1BQUE7UUFHQyxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVgsQ0FBZ0IsRUFBaEIsRUFIRDs7TUFJQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQ7YUFDQTtJQU5VOzs7O0tBL0NVLEVBQUUsQ0FBQztBQUF6Qjs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztvQkFFUixJQUFBLEdBQU07O29CQUNOLFFBQUEsR0FBVTs7SUFFRyxlQUFDLEVBQUQsRUFBUyxFQUFUO01BQUMsSUFBQyxDQUFBLGlCQUFELEtBQUs7TUFBRyxJQUFDLENBQUEsaUJBQUQsS0FBSztNQUMxQixxQ0FBQTtNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLENBQUM7SUFKSjs7b0JBTWIsS0FBQSxHQUFPLFNBQUE7YUFBTyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLENBQVYsRUFBYSxJQUFDLENBQUEsQ0FBZDtJQUFQOztJQUVQLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUNDO01BQUEsR0FBQSxFQUFLLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQyxDQUFuQjtpQkFBMEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUMsS0FBbEQ7U0FBQSxNQUFBO2lCQUE0RCxHQUE1RDs7TUFBSCxDQUFMO01BQ0EsR0FBQSxFQUFLLFNBQUMsR0FBRDtBQUNKLFlBQUE7UUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLENBQUMsQ0FBcEI7VUFDQyxTQUFBLEdBQWdCLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxHQUFiLEVBQWtCLElBQUMsQ0FBQSxDQUFELEdBQUssRUFBRSxDQUFDLGtCQUExQixFQUE4QyxJQUFDLENBQUEsQ0FBL0MsRUFBa0Q7WUFBQyxLQUFBLEVBQU8sSUFBUjtXQUFsRDtVQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxTQUFmO2lCQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLEVBSG5DO1NBQUEsTUFBQTtpQkFLQyxJQUFDLENBQUEsUUFBUyxDQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQyxJQUF4QixHQUErQixJQUxoQzs7TUFESSxDQURMO0tBREQ7O29CQVVBLEtBQUEsR0FBTyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ04sYUFBVyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQVQsQ0FBQSxHQUFnQixNQUE5QixFQUFzQyxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxDQUFBLEdBQWdCLE1BQTNEO0lBREw7O29CQUtQLElBQUEsR0FBTSxTQUFDLEtBQUQ7TUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUssQ0FBQztNQUNYLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBSyxDQUFDO2FBQ1gsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUhLOztvQkFNTixHQUFBLEdBQUssU0FBQyxDQUFELEVBQUksQ0FBSjtNQUNKLElBQUMsQ0FBQSxDQUFELEdBQUs7TUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLO2FBQ0wsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUhJOztvQkFLTCxXQUFBLEdBQWEsU0FBQTtNQUNaLElBQUcsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFDLENBQW5CO1FBQ0MsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUMsQ0FBeEIsR0FBNEIsSUFBQyxDQUFBLENBQUQsR0FBSyxFQUFFLENBQUM7ZUFDcEMsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUMsQ0FBeEIsR0FBNEIsSUFBQyxDQUFBLEVBRjlCOztJQURZOzs7O0tBdkNTLEVBQUUsQ0FBQztBQUExQjs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7OztzQkFFUixJQUFBLEdBQU07O3NCQUNOLFFBQUEsR0FBVTs7O0FBRVY7Ozs7Ozs7SUFNYSxpQkFBQyxNQUFEO0FBQ1osVUFBQTtNQUFBLHVDQUFBO01BRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsU0FBRCxHQUFhO01BRWIsT0FBQSxHQUFVLEVBQUUsQ0FBQyxjQUFILENBQWtCLFNBQWxCLEVBQ1Q7UUFBQSxLQUFBLEVBQU8sQ0FBUDtPQURTO01BR1YsSUFBRyxFQUFFLENBQUMsT0FBSCxDQUFXLE1BQVgsQ0FBSDtRQUNDLElBQXNCLGNBQXRCO1VBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFaO1NBREQ7T0FBQSxNQUFBO1FBR0MsSUFBRyxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF0QjtVQUNDLENBQUEsR0FBSTtVQUNKLENBQUEsR0FBSTtVQUNKLE1BQUEsR0FBUyxTQUFVLENBQUEsQ0FBQTtVQUNuQixDQUFBLEdBQUksU0FBVSxDQUFBLENBQUEsRUFKZjtTQUFBLE1BQUE7VUFNQyxDQUFBLEdBQUksU0FBVSxDQUFBLENBQUE7VUFDZCxDQUFBLEdBQUksU0FBVSxDQUFBLENBQUE7VUFDZCxNQUFBLEdBQVMsU0FBVSxDQUFBLENBQUE7VUFDbkIsQ0FBQSxHQUFJLFNBQVUsQ0FBQSxDQUFBLEVBVGY7O1FBVUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFYLENBQWlDLENBQWpDLEVBQW9DLENBQXBDLEVBQXVDLE1BQXZDLEVBQStDLENBQS9DLEVBQWtELE9BQWxELEVBYmI7O01BZUEsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosRUFBZSxJQUFDLENBQUEsaUJBQWhCO01BQ0EsSUFBQyxDQUFBLEVBQUQsQ0FBSSxTQUFKLEVBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQUcsY0FBQTttREFBUSxDQUFFLE1BQVYsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUE7SUE1QkY7O3NCQThCYixLQUFBLEdBQU8sU0FBQTthQUFPLElBQUEsRUFBRSxDQUFDLE9BQUgsQ0FBVyxJQUFDLENBQUEsUUFBWjtJQUFQOztzQkFFUCxpQkFBQSxHQUFtQixTQUFBO0FBQ2xCLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUViLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO0FBQ0MsYUFBUyxpR0FBVDtVQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFnQixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQWxCLEVBQXNCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBaEMsQ0FBaEI7QUFERDtRQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFnQixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsQ0FBbEIsRUFBeUMsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQW5ELENBQWhCLEVBSEQ7O01BTUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7QUFDQzthQUFTLHNHQUFUO3VCQUNDLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQXRCLEVBQTBCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFwQyxFQUF3QyxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsR0FBSSxDQUFKLENBQWxELENBQXBCO0FBREQ7dUJBREQ7O0lBVmtCOztzQkFnQm5CLFFBQUEsR0FBVSxTQUFBO0FBQ1QsVUFBQTtNQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsS0FBSyxDQUFDO0FBQ2IsV0FBUyw0RUFBVDtBQUNDLGFBQVMsa0dBQVQ7VUFDQyxJQUFHLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsZUFBVixDQUEwQixJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBakMsQ0FBSDtBQUNDLG1CQUFPLE1BRFI7O0FBREQ7QUFERDtBQUlBLGFBQU87SUFORTs7c0JBVVYsUUFBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLFdBQVI7TUFDVCxJQUFPLG1CQUFQO1FBRUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsS0FBZjtRQUdBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO1VBQ0MsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FBa0IsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFqQyxHQUFzQyxNQUR2Qzs7UUFFQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUF0QjtVQUNDLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFnQixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsQ0FBbEIsRUFBeUMsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQW5ELENBQWhCLEVBREQ7O1FBSUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7aUJBQ0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsRUFBRSxDQUFDLFFBQUgsQ0FDbEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBRFEsRUFFbEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsQ0FGUSxFQUdsQixJQUFDLENBQUEsUUFBUyxDQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUFuQixDQUhRLENBQXBCLEVBREQ7U0FYRDtPQUFBLE1BQUE7ZUFrQkMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFdBQWpCLEVBQThCLENBQTlCLEVBQWlDLEtBQWpDLEVBbEJEOztJQURTOztJQXNCVixPQUFDLENBQUEscUJBQUQsR0FBeUIsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLE1BQVQsRUFBaUIsQ0FBakIsRUFBb0IsT0FBcEI7QUFDeEIsVUFBQTtNQUFBLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsQ0FBQSxHQUFJO01BQ0osTUFBQSxHQUFTO01BQ1QsWUFBQSxHQUFlLEVBQUUsQ0FBQyxNQUFILEdBQVk7QUFDM0IsV0FBUywwRUFBVDtRQUNDLENBQUEsR0FBSSxDQUFBLEdBQUksWUFBSixHQUFtQjtRQUN2QixDQUFBLEdBQUksRUFBQSxHQUFLLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQ7UUFDYixDQUFBLEdBQUksRUFBQSxHQUFLLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQ7UUFDYixNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQWdCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBWjtBQUpqQjtBQUtBLGFBQU87SUFWaUI7Ozs7S0EzRkQsRUFBRSxDQUFDO0FBQTVCOzs7QUNBQTtBQUFBLE1BQUE7OztFQUFNLEVBQUUsQ0FBQztBQUVSLFFBQUE7Ozs7dUJBQUEsSUFBQSxHQUFNOzt1QkFDTixRQUFBLEdBQVU7O0lBRUcsa0JBQUMsU0FBRDtBQUNaLFVBQUE7TUFEYSxJQUFDLENBQUEsK0JBQUQsWUFBWTtNQUN6Qix3Q0FBQTtNQUVBLElBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7UUFDQyxRQUFBLEdBQVc7QUFDWCxhQUFTLDZGQUFUO1VBQ0MsUUFBUSxDQUFDLElBQVQsQ0FBa0IsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLFNBQVUsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFuQixFQUEyQixTQUFVLENBQUEsQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFSLENBQXJDLENBQWxCO0FBREQ7UUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLFNBSmI7O01BTUEsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBO01BRWQsSUFBQyxDQUFBLElBQUQsQ0FBTSxLQUFOO01BRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxTQUFKLEVBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2QsSUFBRyxLQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7WUFDQyxLQUFDLENBQUEsV0FBRCxDQUFBOztjQUNBLEtBQUMsQ0FBQTs7d0VBQ0QsS0FBQyxDQUFBLGtDQUhGOztRQURjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO01BS0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFUO0lBbkJZOzt1QkFxQmIsS0FBQSxHQUFPLFNBQUE7QUFDTixVQUFBO01BQUEsUUFBQSxHQUFlLElBQUEsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFDLENBQUEsUUFBYjtNQUNmLFFBQVEsQ0FBQyxXQUFULEdBQXVCLElBQUMsQ0FBQTtNQUN4QixRQUFRLENBQUMsU0FBVCxHQUFxQixJQUFDLENBQUE7TUFDdEIsUUFBUSxDQUFDLFNBQVQsR0FBcUIsSUFBQyxDQUFBO01BQ3RCLFFBQVEsQ0FBQyxTQUFULEdBQXFCLElBQUMsQ0FBQTtNQUN0QixRQUFRLENBQUMsVUFBVCxHQUFzQixJQUFDLENBQUE7YUFDdkI7SUFQTTs7dUJBU1AsV0FBQSxHQUFhLFNBQUE7QUFDWixVQUFBO0FBQUEsV0FBUyxpR0FBVDtRQUNDLElBQUcscUJBQUg7VUFDQyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBeEIsRUFBNEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUF0QyxFQUREO1NBQUEsTUFBQTtVQUdDLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFQLEdBQWdCLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBbEIsRUFBc0IsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFoQyxFQUhqQjs7QUFERDthQU1BO0lBUFk7O0lBV2IsR0FBQSxHQUFNLFNBQUMsTUFBRDtBQUVMLFVBQUE7QUFBQSxXQUFTLDZGQUFUO1FBQ0MsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFiLENBQWtCLE1BQU8sQ0FBQSxDQUFBLENBQXpCO0FBREQ7TUFJQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixNQUFNLENBQUMsTUFBN0I7UUFDQyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsTUFBTSxDQUFDLE1BQXhCLEVBREQ7O01BR0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFUO2FBQ0E7SUFWSzs7dUJBWU4sUUFBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLFdBQVI7TUFDVCxJQUFPLG1CQUFQO1FBRUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsS0FBZjtRQUVBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO1VBQ0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQWdCLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsUUFBUyxDQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUFuQixDQUFsQixFQUF5QyxJQUFDLENBQUEsUUFBUyxDQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUFuQixDQUFuRCxDQUFoQixFQUREO1NBSkQ7T0FBQSxNQUFBO1FBT0MsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFdBQWpCLEVBQThCLENBQTlCLEVBQWlDLEtBQWpDLEVBUEQ7O01BU0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFUO2FBQ0E7SUFYUzs7OztLQTFEZSxFQUFFLENBQUM7QUFBN0I7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7d0JBRVIsSUFBQSxHQUFNOzt3QkFDTixRQUFBLEdBQVU7O0lBRUcsbUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxLQUFQLEVBQWMsTUFBZCxFQUFzQixZQUF0Qjs7UUFBc0IsZUFBZTs7TUFDakQseUNBQUE7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFBLEdBQUksS0FBQSxHQUFRLENBQXJCLEVBQXdCLENBQUEsR0FBSSxNQUFBLEdBQVMsQ0FBckM7TUFDZCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxLQUFSLEVBQWUsTUFBZjtNQUVaLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLENBQVQsRUFBWSxDQUFaO01BQ2YsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBQSxHQUFJLEtBQWIsRUFBb0IsQ0FBcEI7TUFDZixJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFBLEdBQUksS0FBYixFQUFvQixDQUFBLEdBQUksTUFBeEI7TUFDZixJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBQSxHQUFJLE1BQWhCO01BRWYsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLElBQUMsQ0FBQSxPQUFGLEVBQVcsSUFBQyxDQUFBLE9BQVosRUFBcUIsSUFBQyxDQUFBLE9BQXRCLEVBQStCLElBQUMsQ0FBQSxPQUFoQztNQUVWLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxFQUFELENBQUksU0FBSixFQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUFHLGNBQUE7bURBQVEsQ0FBRSxNQUFWLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtJQWRZOztJQWdCYixTQUFDLENBQUEsUUFBRCxDQUFVLGNBQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsYUFBRCxHQUFpQjtlQUNqQixJQUFDLENBQUEsU0FBRCxHQUFnQixHQUFBLEdBQU0sQ0FBVCxHQUFnQixFQUFoQixHQUF3QixJQUFDLENBQUE7TUFGbEMsQ0FETDtLQUREOzt3QkFNQSxLQUFBLEdBQU8sU0FBQTthQUFPLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQXRCLEVBQXlCLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBbEMsRUFBcUMsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUEzQyxFQUFrRCxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQXhEO0lBQVA7O3dCQUVQLEdBQUEsR0FBSyxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sS0FBUCxFQUFjLE1BQWQ7TUFDSixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxDQUFBLEdBQUksS0FBQSxHQUFRLENBQXhCLEVBQTJCLENBQUEsR0FBSSxNQUFBLEdBQVMsQ0FBeEM7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FBYixFQUFnQixDQUFoQjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQUEsR0FBSSxLQUFqQixFQUF3QixDQUF4QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQUEsR0FBSSxLQUFqQixFQUF3QixDQUFBLEdBQUksTUFBNUI7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUFiLEVBQWdCLENBQUEsR0FBSSxNQUFwQjtJQVBJOzs7O0tBN0JxQixFQUFFLENBQUM7QUFBOUI7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDO0FBRVIsUUFBQTs7OztxQkFBQSxJQUFBLEdBQU07O3FCQUNOLFFBQUEsR0FBVTs7SUFFRyxnQkFBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLHNDQUFBO01BRUEsSUFBRyxRQUFBLFlBQW9CLEVBQUUsQ0FBQyxRQUExQjtRQUNDLFFBQUEsR0FBVztRQUNYLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDO1FBQ3JCLFFBQVEsQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFFBQUQ7WUFDMUIsS0FBQyxDQUFBLFFBQUQsR0FBWSxRQUFRLENBQUM7bUJBQ3JCLGlCQUFBLENBQWtCLEtBQWxCO1VBRjBCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQixFQUhEO09BQUEsTUFBQTtRQU9DLElBQUMsQ0FBQSxRQUFELEdBQVksRUFBRSxDQUFDLEtBQUgsQ0FBUyxRQUFULEVBUGI7O01BU0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUE7TUFDZCxJQUFDLENBQUEsa0JBQUQsR0FBc0I7TUFDdEIsSUFBQyxDQUFBLG1CQUFELEdBQXVCO01BRXZCLElBQUMsQ0FBQSxJQUFELENBQU0sS0FBTjtNQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBQUUsQ0FBQztNQUNuQixJQUFDLENBQUEsU0FBRCxHQUFhO01BRWIsaUJBQUEsQ0FBa0IsSUFBbEI7SUFwQlk7O0lBc0JiLE1BQUMsQ0FBQSxRQUFELENBQVUsVUFBVixFQUNDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUE7TUFBSixDQUFMO01BQ0EsR0FBQSxFQUFLLFNBQUMsR0FBRDtBQUNKLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBO1FBQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYTtRQUNiLElBQXVCLE1BQUEsS0FBVSxJQUFDLENBQUEsU0FBbEM7aUJBQUEsaUJBQUEsQ0FBa0IsSUFBbEIsRUFBQTs7TUFISSxDQURMO0tBREQ7O3FCQU9BLEtBQUEsR0FBTyxTQUFBO2FBQU8sSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLElBQUMsQ0FBQSxRQUFYO0lBQVA7O3FCQUVQLFFBQUEsR0FBVSxTQUFDLEtBQUQ7TUFDVCxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxLQUFmO2FBQ0EsaUJBQUEsQ0FBa0IsSUFBbEI7SUFGUzs7SUFJVixpQkFBQSxHQUFvQixTQUFDLE1BQUQ7QUFDbkIsVUFBQTtNQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQztNQUUxQixDQUFBLEdBQUksTUFBTSxDQUFDO01BQ1gsR0FBQSxHQUFNLENBQUMsQ0FBQztNQUNSLElBQUcsR0FBQSxJQUFPLENBQVY7UUFDQyxNQUFNLENBQUMsbUJBQW9CLENBQUEsQ0FBQSxDQUEzQixHQUFnQyxDQUFFLENBQUEsQ0FBQSxFQURuQzs7TUFFQSxJQUFHLEdBQUEsSUFBTyxDQUFWO1FBQ0MsTUFBTSxDQUFDLGtCQUFtQixDQUFBLEdBQUEsR0FBTSxDQUFOLENBQTFCLEdBQXFDLENBQUUsQ0FBQSxHQUFBLEdBQU0sQ0FBTixFQUR4Qzs7TUFFQSxJQUFHLEdBQUEsSUFBTyxDQUFWO0FBQ0M7YUFBUyxnRkFBVDtVQUNDLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFMLEdBQVMsQ0FBRSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxDQUE3QixFQUFnQyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBTCxHQUFTLENBQUUsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFNLENBQUMsQ0FBbEQ7VUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFFLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTSxDQUFDLENBQVQsR0FBYSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBN0IsRUFBZ0MsQ0FBRSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxDQUFULEdBQWEsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQWxEO1VBQ1QsSUFBQSxHQUFPLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQUwsR0FBUyxDQUFFLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTSxDQUFDLENBQTNCLEVBQThCLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFMLEdBQVMsQ0FBRSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxDQUFoRDtVQUNQLElBQUEsR0FBTyxFQUFFLENBQUMsS0FBSCxDQUFTLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFMLEdBQVMsQ0FBRSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxDQUEzQixFQUE4QixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBTCxHQUFTLENBQUUsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFNLENBQUMsQ0FBaEQ7VUFDUCxLQUFBLEdBQVEsTUFBQSxHQUFTLENBQUMsTUFBQSxHQUFTLE1BQVYsQ0FBQSxHQUFvQixDQUFHLE1BQU0sQ0FBQyxTQUFWLEdBQXlCLElBQUEsR0FBTyxDQUFDLElBQUEsR0FBTyxJQUFSLENBQWhDLEdBQW1ELEdBQW5EO1VBQ3JDLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBQSxHQUFRLE1BQWpCLENBQUEsR0FBMkIsRUFBRSxDQUFDLE9BQWxEO1lBQUEsS0FBQSxJQUFTLElBQUksQ0FBQyxHQUFkOztVQUNBLEVBQUEsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBTCxHQUFTLElBQUEsR0FBTyxNQUFNLENBQUMsWUFBZCxHQUE2QixJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQ7VUFDM0MsRUFBQSxHQUFLLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFMLEdBQVMsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFkLEdBQTZCLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVDtVQUMzQyxFQUFBLEdBQUssQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLENBQUwsR0FBUyxJQUFBLEdBQU8sTUFBTSxDQUFDLFlBQWQsR0FBNkIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFUO1VBQzNDLEVBQUEsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBTCxHQUFTLElBQUEsR0FBTyxNQUFNLENBQUMsWUFBZCxHQUE2QixJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQ7VUFDM0MsTUFBTSxDQUFDLGtCQUFtQixDQUFBLENBQUEsQ0FBMUIsR0FBbUMsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxFQUFiO3VCQUNuQyxNQUFNLENBQUMsbUJBQW9CLENBQUEsQ0FBQSxDQUEzQixHQUFvQyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLEVBQWI7QUFackM7dUJBREQ7O0lBVG1COzs7O0tBeENHLEVBQUUsQ0FBQztBQUEzQjs7O0FDQUE7QUFBQSxNQUFBOzs7RUFBTSxFQUFFLENBQUM7Ozt1QkFFUixJQUFBLEdBQU07O3VCQUNOLFFBQUEsR0FBVTs7SUFFRyxrQkFBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQ7QUFDWixVQUFBO01BQUEsd0NBQUE7TUFFQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO1FBQ0UsaUJBQUQsRUFBSyxpQkFBTCxFQUFTLGlCQUFULEVBQWEsaUJBQWIsRUFBaUIsaUJBQWpCLEVBQXFCO1FBQ3JCLEVBQUEsR0FBUyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLEVBQWI7UUFDVCxFQUFBLEdBQVMsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxFQUFiO1FBQ1QsRUFBQSxHQUFTLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxFQUFULEVBQWEsRUFBYixFQUpWOztNQU1BLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FDSixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsRUFBUixFQUFZLEVBQVosQ0FESSxFQUVKLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxFQUFSLEVBQVksRUFBWixDQUZJLEVBR0osSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLEVBQVIsRUFBWSxFQUFaLENBSEk7TUFNVCxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFUO01BQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUE7TUFDZCxJQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosRUFBZSxJQUFDLENBQUEsTUFBaEI7TUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLFNBQUosRUFBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFBRyxjQUFBO21EQUFRLENBQUUsTUFBVixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7SUFsQlk7O3VCQW9CYixLQUFBLEdBQU8sU0FBQTthQUFPLElBQUEsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBcEIsRUFBd0IsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQWhDLEVBQW9DLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUE1QztJQUFQOzt1QkFFUCxNQUFBLEdBQVEsU0FBQTtNQUNQLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQztNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQztNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQztNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQztNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQzthQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQztJQU5POzs7O0tBM0JpQixFQUFFLENBQUM7QUFBN0I7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7SUFFSyxlQUFDLEdBQUQsRUFBTyxDQUFQLEVBQWMsQ0FBZCxFQUFxQixLQUFyQixFQUE0QixNQUE1QjtNQUFDLElBQUMsQ0FBQSxNQUFEOztRQUFNLElBQUk7OztRQUFHLElBQUk7O01BQzlCLHFDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUVSLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksRUFBRSxDQUFDO01BQ2YsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxDQUFiO01BQ2hCLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLENBQUEsR0FBSSxLQUFBLEdBQVEsQ0FBdEIsRUFBeUIsQ0FBQSxHQUFJLE1BQUEsR0FBUyxDQUF0QztNQUNkLElBQUcsYUFBSDtRQUNDLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsTUFBakI7UUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLE1BRmI7O01BSUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsR0FBVixFQUFlLEdBQWY7TUFFYixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztNQUN4QixJQUFDLENBQUEsS0FBRCxHQUFTO01BRVQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO1VBQ2hCLElBQUcsS0FBQyxDQUFBLFFBQUo7WUFDQyxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxLQUFDLENBQUEsTUFBTSxDQUFDLEtBQWxCLEVBQXlCLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBakMsRUFERDs7aUJBRUEsS0FBQyxDQUFBLEtBQUQsR0FBUztRQUhPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUtqQixJQUFzQixnQkFBdEI7UUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsSUFBZjs7SUF0Qlk7O0lBd0JiLEtBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUNDO01BQUEsR0FBQSxFQUFLLFNBQUE7ZUFBRyxJQUFDLENBQUE7TUFBSixDQUFMO01BQ0EsR0FBQSxFQUFLLFNBQUMsR0FBRDtRQUNKLElBQUMsQ0FBQSxNQUFELEdBQVU7ZUFDVixJQUFDLENBQUEsS0FBRCxHQUFTO01BRkwsQ0FETDtLQUREOzs7O0tBMUJzQixFQUFFLENBQUM7QUFBMUI7OztBQ0FBO0FBQUEsTUFBQTs7O0VBQU0sRUFBRSxDQUFDOzs7O0FBRVI7Ozs7Ozs7Ozs7OztJQVdhLG1CQUFDLElBQUQsRUFBUSxDQUFSLEVBQWdCLENBQWhCO0FBQ1osVUFBQTtNQURhLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLGdCQUFELElBQUs7TUFBRyxJQUFDLENBQUEsZ0JBQUQsSUFBSztNQUNqQyx5Q0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUViLE9BQUEsR0FBVSxFQUFFLENBQUMsY0FBSCxDQUFrQixTQUFsQixFQUNUO1FBQUEsS0FBQSxFQUFPLElBQVA7T0FEUztNQUVWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO01BQ2pCLElBQUcsb0JBQUg7UUFDQyxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQyxLQURqQjtPQUFBLE1BRUssSUFBRyw0QkFBQSxJQUF1QiwwQkFBMUI7UUFDSixJQUFDLENBQUEsV0FBRCxHQUFlLE9BQU8sQ0FBQyxVQUFSLElBQXNCLEVBQUUsQ0FBQztRQUN4QyxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQyxRQUFSLElBQW9CLEVBQUUsQ0FBQztRQUNwQyxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUMsQ0FBQSxTQUFILEdBQWMsS0FBZCxHQUFvQixJQUFDLENBQUEsWUFIM0I7T0FBQSxNQUFBO1FBS0osSUFBQyxDQUFBLElBQUQsR0FBUSxLQUxKOztJQVhPOztJQWtCYixTQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1YsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsTUFBWDtNQUZJLENBREw7S0FERDs7SUFNQSxTQUFDLENBQUEsUUFBRCxDQUFVLFlBQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsV0FBRCxHQUFlO2VBQ2YsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFDLENBQUEsU0FBSCxHQUFjLEtBQWQsR0FBb0IsSUFBQyxDQUFBO01BRjNCLENBREw7S0FERDs7SUFNQSxTQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFDQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBO01BQUosQ0FBTDtNQUNBLEdBQUEsRUFBSyxTQUFDLEdBQUQ7UUFDSixJQUFDLENBQUEsU0FBRCxHQUFhO2VBQ2IsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFDLENBQUEsU0FBSCxHQUFjLEtBQWQsR0FBb0IsSUFBQyxDQUFBO01BRjNCLENBREw7S0FERDs7d0JBTUEsUUFBQSxHQUFVLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO1FBQ0MsS0FBQSxHQUFRLEVBQUEsR0FBSyxLQUFMLEdBQWEsTUFEdEI7O01BRUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO01BQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO01BQ1QsSUFBQyxDQUFBLFNBQUQ7QUFBYSxnQkFBTyxNQUFQO0FBQUEsZUFDUCxHQURPO21CQUNFO0FBREYsZUFFUCxHQUZPO21CQUVFO0FBRkYsZUFHUCxHQUhPO21CQUdFO0FBSEY7O01BSWIsSUFBQyxDQUFBLFlBQUQ7QUFBZ0IsZ0JBQU8sTUFBUDtBQUFBLGVBQ1YsR0FEVTttQkFDRDtBQURDLGVBRVYsR0FGVTttQkFFRDtBQUZDLGVBR1YsR0FIVTttQkFHRDtBQUhDOzthQUloQjtJQWJTOzs7O0tBakRnQixFQUFFLENBQUM7QUFBOUI7OztBQ0FBO0FBQUEsTUFBQTs7RUFBTSxFQUFFLENBQUM7SUFFSyxtQkFBQyxPQUFEO01BQ1osSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFPLENBQUM7TUFDaEIsSUFBQyxDQUFBLEVBQUQsR0FBTSxPQUFPLENBQUM7TUFDZCxJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQyxRQUFSLElBQW9CO01BQ2hDLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDLE1BQVIsSUFBa0I7TUFDNUIsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLENBQUMsT0FBTyxDQUFDO01BQ3BCLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDO01BQ2hCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO01BQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0lBUk47O3dCQVViLE9BQUEsR0FBUyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ1IsVUFBQTtNQUFBLElBQUEsQ0FBcUIsRUFBRSxDQUFDLE9BQUgsQ0FBVyxJQUFYLENBQXJCO1FBQUEsSUFBQSxHQUFPLENBQUMsSUFBRCxFQUFQOztNQUNBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQW9CLE1BQXBCLEVBQTRCLElBQTVCO01BQ1gsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFuQixDQUF1QixJQUF2QjthQUNBO0lBSlE7O3dCQU1ULE9BQUEsR0FBUyxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUEsQ0FBQSxDQUFtQixtQkFBQSxJQUFXLGlCQUE5QixDQUFBO0FBQUEsZUFBTyxLQUFQOztNQUVBLElBQUcsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBQyxDQUFBLElBQWxCLENBQUg7QUFDQztBQUFBLGFBQUEsVUFBQTs7VUFDQyxJQUFvQixvQkFBcEI7QUFBQSxtQkFBTyxNQUFQOztBQURELFNBREQ7T0FBQSxNQUFBO1FBSUMsSUFBb0IsZUFBcEI7QUFBQSxpQkFBTyxNQUFQO1NBSkQ7O2FBS0E7SUFSUTs7Ozs7O0VBWVYsRUFBRSxDQUFDLFVBQUgsR0FNQztJQUFBLE1BQUEsRUFBWSxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1g7TUFBQSxNQUFBLEVBQVEsU0FBQyxJQUFEO2VBQ1AsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUM7TUFEVCxDQUFSO0tBRFcsQ0FBWjtJQUlBLE9BQUEsRUFBYSxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1o7TUFBQSxNQUFBLEVBQVEsU0FBQyxJQUFEO2VBQ1AsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLEdBQUksSUFBSSxDQUFDO01BRGIsQ0FBUjtLQURZLENBSmI7SUFRQSxJQUFBLEVBQVUsSUFBQSxFQUFFLENBQUMsU0FBSCxDQUNUO01BQUEsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLENBQUwsR0FBUyxJQUFJLENBQUMsRUFBZCxHQUFtQjtNQUR4QixDQUFSO0tBRFMsQ0FSVjtJQVlBLE1BQUEsRUFBWSxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1g7TUFBQSxJQUFBLEVBQU0sU0FBQyxJQUFEO2VBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFWLEdBQXFCLElBQUksQ0FBQyxHQUFMLElBQVk7TUFENUIsQ0FBTjtNQUVBLE1BQUEsRUFBUSxTQUFDLElBQUQ7UUFDUCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxDQUFMLEdBQVMsSUFBSSxDQUFDLEVBQWQsR0FBbUI7ZUFDL0IsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsQ0FBTCxHQUFTLElBQUksQ0FBQyxJQUFJLENBQUM7TUFIckIsQ0FGUjtLQURXLENBWlo7SUFvQkEsT0FBQSxFQUFhLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FDWjtNQUFBLE1BQUEsRUFBUSxTQUFDLElBQUQ7UUFDUCxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsR0FBSSxJQUFJLENBQUM7UUFDcEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsQ0FBTCxHQUFTLElBQUksQ0FBQyxFQUFkLEdBQW1CO2VBQy9CLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQSxHQUFJLElBQUksQ0FBQztNQUhYLENBQVI7S0FEWSxDQXBCYjtJQTBCQSxLQUFBLEVBQVcsSUFBQSxFQUFFLENBQUMsU0FBSCxDQUNWO01BQUEsUUFBQSxFQUFVLEdBQVY7TUFDQSxJQUFBLEVBQU0sQ0FETjtNQUVBLEVBQUEsRUFBSSxHQUZKO01BR0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtBQUNQLFlBQUE7UUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxPQUFMLEdBQWUsR0FBeEIsQ0FBWDtlQUNKLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFBQSxHQUFRLENBQVIsR0FBVyxJQUFYLEdBQWdCLENBQWhCLEdBQW1CLElBQW5CLEdBQXdCLENBQXhCLEdBQTJCO01BRmpDLENBSFI7S0FEVSxDQTFCWDtJQWtDQSxLQUFBLEVBQVcsSUFBQSxFQUFFLENBQUMsU0FBSCxDQUNWO01BQUEsSUFBQSxFQUFNLFNBQUMsSUFBRDtRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBVixHQUFlLElBQUMsQ0FBQSxRQUFRLENBQUM7ZUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLEdBQWtCLElBQUksQ0FBQyxHQUFMLElBQVk7TUFGekIsQ0FBTjtNQUdBLE1BQUEsRUFBUSxTQUFDLElBQUQ7ZUFDUCxJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxDQUFMLEdBQVMsSUFBSSxDQUFDLEVBQWQsR0FBbUIsQ0FBNUIsQ0FBQSxHQUFpQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQTNDLEdBQW1ELElBQUksQ0FBQyxJQUFJLENBQUM7TUFEcEUsQ0FIUjtLQURVLENBbENYO0lBeUNBLElBQUEsRUFBVSxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1Q7TUFBQSxJQUFBLEVBQU0sU0FBQyxJQUFEO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFWLEdBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQztlQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQVYsR0FBbUIsSUFBSSxDQUFDLEdBQUwsSUFBWTtNQUYxQixDQUFOO01BR0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFaLEdBQXFCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLENBQUwsR0FBUyxJQUFJLENBQUMsRUFBdkIsQ0FBckIsR0FBa0QsSUFBSSxDQUFDLElBQUksQ0FBQztNQURuRSxDQUhSO0tBRFMsQ0F6Q1Y7SUFvREEsSUFBQSxFQUFVLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FDVDtNQUFBLFFBQUEsRUFBVSxJQUFWO01BQ0EsSUFBQSxFQUFNLFNBQUMsSUFBRDtRQUNMLElBQUksQ0FBQyxJQUFMLEdBQ0M7VUFBQSxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BQVY7VUFDQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxDQURkOztlQUVELElBQUksQ0FBQyxFQUFMLEdBQ0ksSUFBQyxDQUFBLE9BQUQsS0FBWSxDQUFmLEdBQ0M7VUFBQSxPQUFBLEVBQVMsQ0FBVDtVQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVyxHQURsQjtTQURELEdBSUM7VUFBQSxPQUFBLEVBQVMsQ0FBVDtVQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVyxHQURsQjs7TUFURyxDQUROO01BWUEsTUFBQSxFQUFRLFNBQUMsSUFBRDtRQUNQLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQztlQUN4QixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUM7TUFGZixDQVpSO0tBRFMsQ0FwRFY7SUFxRUEsSUFBQSxFQUFVLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FDVDtNQUFBLElBQUEsRUFBTSxTQUFDLElBQUQ7UUFDTCxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxLQUFZLENBQWY7VUFDQyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUM7aUJBQ25CLElBQUksQ0FBQyxFQUFMLEdBQVUsRUFGWDtTQUFBLE1BQUE7VUFJQyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUM7aUJBQ25CLElBQUksQ0FBQyxFQUFMLEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUxsQjs7TUFESyxDQUFOO01BT0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXLElBQUksQ0FBQztNQURULENBUFI7S0FEUyxDQXJFVjtJQWdGQSxLQUFBLEVBQVcsSUFBQSxFQUFFLENBQUMsU0FBSCxDQUNWO01BQUEsSUFBQSxFQUFNLFNBQUMsSUFBRDtRQUNMLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQztlQUNuQixJQUFJLENBQUMsRUFBTCxHQUFVLENBQUMsSUFBSSxDQUFDO01BRlgsQ0FBTjtNQUdBLE1BQUEsRUFBUSxTQUFDLElBQUQ7ZUFDUCxJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVyxJQUFJLENBQUM7TUFEVCxDQUhSO0tBRFUsQ0FoRlg7SUF1RkEsS0FBQSxFQUFXLElBQUEsRUFBRSxDQUFDLFNBQUgsQ0FDVjtNQUFBLElBQUEsRUFBTSxTQUFDLElBQUQ7UUFDTCxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUM7ZUFDbkIsSUFBSSxDQUFDLEVBQUwsR0FBVSxDQUFDLElBQUksQ0FBQztNQUZYLENBQU47TUFHQSxNQUFBLEVBQVEsU0FBQyxJQUFEO2VBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFQLEdBQVcsSUFBSSxDQUFDO01BRFQsQ0FIUjtLQURVLENBdkZYO0lBa0dBLE1BQUEsRUFBWSxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1g7TUFBQSxJQUFBLEVBQU0sU0FBQyxJQUFEO1FBQ0wsSUFBRyxnQkFBSDtVQUNDLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQztpQkFDdEIsSUFBSSxDQUFDLEVBQUwsR0FBVSxVQUFBLENBQVcsSUFBSSxDQUFDLEdBQWhCLEVBRlg7U0FBQSxNQUFBO2lCQUlDLE9BQU8sQ0FBQyxLQUFSLENBQWMsdUNBQWQsRUFKRDs7TUFESyxDQUFOO01BTUEsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLElBQUksQ0FBQztNQURaLENBTlI7S0FEVyxDQWxHWjtJQTRHQSxNQUFBLEVBQVksSUFBQSxFQUFFLENBQUMsU0FBSCxDQUNYO01BQUEsSUFBQSxFQUFNLFNBQUMsSUFBRDtRQUNMLElBQUcsaUJBQUg7VUFDQyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUMsQ0FBQSxRQUFRLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxFQUFMLEdBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsVUFBQSxDQUFXLElBQUksQ0FBQyxJQUFoQixFQUZ6QjtTQUFBLE1BQUE7aUJBSUMsT0FBTyxDQUFDLEtBQVIsQ0FBYyx1Q0FBZCxFQUpEOztNQURLLENBQU47TUFNQSxNQUFBLEVBQVEsU0FBQyxJQUFEO2VBQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsSUFBSSxDQUFDO01BRFosQ0FOUjtLQURXLENBNUdaO0lBc0hBLFFBQUEsRUFBYyxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ2I7TUFBQSxJQUFBLEVBQU0sU0FBQyxJQUFEO0FBQ0wsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUM7UUFDaEIsSUFBb0MsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFaLENBQXBDO1VBQUEsUUFBQSxHQUFlLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxRQUFULEVBQWY7O1FBQ0EsSUFBSSxDQUFDLElBQUwsR0FBZ0IsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxTQUFWO2VBQ2hCLElBQUksQ0FBQyxFQUFMLEdBQVU7TUFKTCxDQUFOO01BS0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFiLENBQUE7TUFETixDQUxSO0tBRGEsQ0F0SGQ7O0FBcENEOzs7QUNBQTtFQUFNLEVBQUUsQ0FBQztBQUVSLFFBQUE7O0lBQWEseUJBQUE7TUFDWixJQUFDLENBQUEsaUJBQUQsR0FBcUI7SUFEVDs7OEJBR2IsR0FBQSxHQUFLLFNBQUMsSUFBRDtNQUNKLElBQUksQ0FBQyxJQUFMLENBQUE7TUFDQSxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBZixDQUFBLENBQUg7UUFDQyxJQUFJLENBQUMsU0FBTCxHQUFpQixFQUFFLENBQUMsR0FBSCxDQUFBO2VBQ2pCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUZEO09BQUEsTUFBQTtlQUlDLE9BQU8sQ0FBQyxLQUFSLENBQWMsb0RBQWQsRUFBb0UsSUFBSSxDQUFDLFNBQXpFLEVBSkQ7O0lBRkk7OzhCQVFMLE1BQUEsR0FBUSxTQUFBO0FBQ1AsVUFBQTtNQUFBLEdBQUEsR0FBTSxFQUFFLENBQUMsR0FBSCxDQUFBO0FBQ047QUFBQTtXQUFBLHFDQUFBOztRQUNDLElBQVksSUFBSSxDQUFDLFFBQWpCO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxHQUFPLElBQUksQ0FBQztRQUNaLENBQUEsR0FBSSxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBWixDQUFBLEdBQXlCLENBQUMsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsSUFBakI7UUFDN0IsSUFBRyxDQUFBLEdBQUksQ0FBUDtVQUNDLE1BQUEsR0FBUztVQUNULElBQUcsSUFBSSxDQUFDLE1BQVI7WUFDQyxDQUFBLEdBQUk7WUFDSixJQUFJLENBQUMsU0FBTCxHQUFpQixFQUFFLENBQUMsR0FBSCxDQUFBLEVBRmxCO1dBQUEsTUFBQTtZQUtDLENBQUEsR0FBSTtZQUNKLElBQUksQ0FBQyxRQUFMLEdBQWdCLEtBTmpCO1dBRkQ7O1FBVUEsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLElBQWxCO1VBQ0MsQ0FBQSxHQUFJLGVBQWdCLENBQUEsdUJBQUEsQ0FBaEIsQ0FBeUMsQ0FBekMsRUFETDtTQUFBLE1BRUssSUFBRyxvQ0FBSDtVQUNKLENBQUEsR0FBSSxlQUFnQixDQUFBLElBQUksQ0FBQyxNQUFMLENBQWhCLENBQTZCLENBQTdCLEVBREE7O1FBR0wsSUFBSSxDQUFDLENBQUwsR0FBUztRQUNULElBQUksQ0FBQyxXQUFMLENBQUE7UUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUIsSUFBSSxDQUFDLE1BQXRCLEVBQThCLElBQTlCO1FBQ0EsSUFBRyxNQUFIOzBEQUEwQixDQUFFLElBQWIsQ0FBa0IsSUFBSSxDQUFDLE1BQXZCLEVBQStCLElBQS9CLFlBQWY7U0FBQSxNQUFBOytCQUFBOztBQXhCRDs7SUFGTzs7OEJBNkJSLE1BQUEsR0FBUSxTQUFDLFFBQUQ7YUFDUCxRQUFRLENBQUMsRUFBVCxDQUFZLFFBQVosRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFETzs7SUFPUix1QkFBQSxHQUEwQjs7SUFDMUIsZUFBQSxHQUNDO01BQUEsTUFBQSxFQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUEsR0FBSTtNQUFYLENBQVI7TUFDQSxPQUFBLEVBQVMsU0FBQyxDQUFEO2VBQU8sQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUw7TUFBWCxDQURUO01BRUEsSUFBQSxFQUFNLFNBQUMsQ0FBRDtRQUNMLElBQUcsQ0FBQSxHQUFJLEdBQVA7aUJBQ0MsQ0FBQSxHQUFJLENBQUosR0FBUSxFQURUO1NBQUEsTUFBQTtpQkFHQyxDQUFDLENBQUQsR0FBSyxDQUFMLEdBQVMsQ0FBVCxHQUFhLENBQUEsR0FBSSxDQUFqQixHQUFxQixFQUh0Qjs7TUFESyxDQUZOO01BUUEsT0FBQSxFQUFTLFNBQUMsQ0FBRDt3QkFBTyxHQUFLO01BQVosQ0FSVDtNQVNBLFFBQUEsRUFBVSxTQUFDLENBQUQ7d0JBQVEsQ0FBQSxHQUFJLEdBQU0sRUFBWCxHQUFlO01BQXRCLENBVFY7TUFVQSxLQUFBLEVBQU8sU0FBQyxDQUFEO1FBQ04sSUFBRyxDQUFBLEdBQUksR0FBUDtpQkFDQyxDQUFBLFlBQUksR0FBSyxHQURWO1NBQUEsTUFBQTtpQkFHQyxDQUFBLFlBQUssQ0FBQSxHQUFJLEdBQU0sRUFBZixHQUFtQixFQUhwQjs7TUFETSxDQVZQO01BZ0JBLE1BQUEsRUFBUSxTQUFDLENBQUQ7ZUFBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEVBQUUsQ0FBQyxPQUF0QixDQUFBLEdBQWlDO01BQXhDLENBaEJSO01BaUJBLE9BQUEsRUFBUyxTQUFDLENBQUQ7ZUFBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsR0FBSSxFQUFFLENBQUMsT0FBaEI7TUFBUCxDQWpCVDtNQWtCQSxJQUFBLEVBQU0sU0FBQyxDQUFEO1FBQ0wsSUFBRyxDQUFBLEdBQUksR0FBUDtpQkFDQyxDQUFDLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFBLEdBQUksQ0FBSixHQUFRLENBQVQsQ0FBQSxHQUFjLEVBQUUsQ0FBQyxPQUExQixDQUFBLEdBQXFDLENBQXRDLENBQUEsR0FBMkMsRUFENUM7U0FBQSxNQUFBO2lCQUdDLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFBLEdBQUksR0FBTCxDQUFBLEdBQVksSUFBSSxDQUFDLEVBQTFCLENBQUEsR0FBZ0MsQ0FBaEMsR0FBb0MsSUFIckM7O01BREssQ0FsQk47Ozs7Ozs7RUEyQkYsRUFBRSxDQUFDLGVBQUgsR0FBcUIsSUFBSSxFQUFFLENBQUM7QUE5RTVCOzs7QUNBQTtBQUFBLE1BQUE7O0VBQU0sRUFBRSxDQUFDO0FBRUwsUUFBQTs7SUFBYSx1QkFBQyxTQUFELEVBQWEsTUFBYixFQUFzQixJQUF0QjtNQUFDLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsc0JBQUQsT0FBUTtNQUN2QyxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQXBCO01BQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBcEI7TUFDWCxJQUFDLENBQUEsRUFBRCxHQUFNLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxFQUFwQjtNQUNOLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsQ0FBRCxHQUFLO01BQ0wsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFDLENBQUEsSUFBSyxDQUFBLENBQUE7SUFSSjs7NEJBVWIsSUFBQSxHQUFNLFNBQUE7QUFDRixVQUFBOztXQUFlLENBQUUsSUFBakIsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLElBQS9COzthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsSUFBVjtJQUZUOzs0QkFJTixPQUFBLEdBQVMsU0FBQTtNQUNMLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFBRSxDQUFDLEdBQUgsQ0FBQTthQUNiLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFGUDs7NEJBSVQsV0FBQSxHQUFhLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBYyxpQkFBZDtBQUFBLGVBQUE7O01BRUEsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQUMsQ0FBQSxJQUFiLENBQUg7ZUFDSSxJQUFDLENBQUEsT0FBRCxHQUFXLGNBQUEsQ0FBZSxJQUFDLENBQUEsSUFBaEIsRUFBc0IsSUFBQyxDQUFBLEVBQXZCLEVBQTJCLElBQUMsQ0FBQSxDQUE1QixFQURmO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxJQUFELFlBQWlCLEVBQUUsQ0FBQyxLQUF2QjtlQUNELGdCQUFBLENBQWlCLElBQUMsQ0FBQSxJQUFsQixFQUF3QixJQUFDLENBQUEsRUFBekIsRUFBNkIsSUFBQyxDQUFBLENBQTlCLEVBQWlDLElBQUMsQ0FBQSxPQUFsQyxFQURDO09BQUEsTUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFELFlBQWlCLEVBQUUsQ0FBQyxNQUF2QjtlQUNELGlCQUFBLENBQWtCLElBQUMsQ0FBQSxJQUFuQixFQUF5QixJQUFDLENBQUEsRUFBMUIsRUFBOEIsSUFBQyxDQUFBLENBQS9CLEVBQWtDLElBQUMsQ0FBQSxPQUFuQyxFQURDO09BQUEsTUFFQSxJQUFHLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUMsQ0FBQSxJQUFsQixDQUFIO0FBQ0Q7QUFBQTthQUFBLFVBQUE7O1VBQ0ksSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFsQixDQUFIO3lCQUNJLElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULEdBQWdCLGNBQUEsQ0FBZSxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBckIsRUFBMkIsSUFBQyxDQUFBLEVBQUcsQ0FBQSxHQUFBLENBQS9CLEVBQXFDLElBQUMsQ0FBQSxDQUF0QyxHQURwQjtXQUFBLE1BQUE7eUJBR0ksaUJBQUEsQ0FBa0IsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQXhCLEVBQThCLElBQUMsQ0FBQSxFQUFHLENBQUEsR0FBQSxDQUFsQyxFQUF3QyxJQUFDLENBQUEsQ0FBekMsRUFBNEMsSUFBQyxDQUFBLE9BQVEsQ0FBQSxHQUFBLENBQXJELEdBSEo7O0FBREo7dUJBREM7T0FBQSxNQUFBO2VBT0QsT0FBTyxDQUFDLEtBQVIsQ0FBYyw2Q0FBZCxFQUE2RCxJQUFDLENBQUEsSUFBOUQsRUFQQzs7SUFUSTs7SUFrQmIsY0FBQSxHQUFpQixTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDthQUFhLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUw7SUFBekI7O0lBRWpCLGdCQUFBLEdBQW1CLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVjthQUNmLENBQUMsQ0FBQyxPQUFGLENBQVUsY0FBQSxDQUFlLENBQUMsQ0FBQyxDQUFqQixFQUFvQixDQUFDLENBQUMsQ0FBdEIsRUFBeUIsQ0FBekIsQ0FBVixFQUF1QyxjQUFBLENBQWUsQ0FBQyxDQUFDLENBQWpCLEVBQW9CLENBQUMsQ0FBQyxDQUF0QixFQUF5QixDQUF6QixDQUF2QyxFQUFvRSxjQUFBLENBQWUsQ0FBQyxDQUFDLENBQWpCLEVBQW9CLENBQUMsQ0FBQyxDQUF0QixFQUF5QixDQUF6QixDQUFwRSxFQUFpRyxjQUFBLENBQWUsQ0FBQyxDQUFDLENBQWpCLEVBQW9CLENBQUMsQ0FBQyxDQUF0QixFQUF5QixDQUF6QixDQUFqRztJQURlOztJQUduQixpQkFBQSxHQUFvQixTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7TUFDaEIsQ0FBQyxDQUFDLENBQUYsR0FBTSxjQUFBLENBQWUsQ0FBQyxDQUFDLENBQWpCLEVBQW9CLENBQUMsQ0FBQyxDQUF0QixFQUF5QixDQUF6QjthQUNOLENBQUMsQ0FBQyxDQUFGLEdBQU0sY0FBQSxDQUFlLENBQUMsQ0FBQyxDQUFqQixFQUFvQixDQUFDLENBQUMsQ0FBdEIsRUFBeUIsQ0FBekI7SUFGVTs7Ozs7QUEzQ3hCOzs7QUNBQTtFQUFNLEVBQUUsQ0FBQztJQUVLLHlCQUFBO01BQ1osSUFBQyxDQUFBLGNBQUQsR0FBa0I7SUFETjs7OEJBR2IsUUFBQSxHQUFVLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDVCxVQUFBO01BQUEsTUFBTSxDQUFDLGFBQVAsR0FBdUI7TUFDdkIsQ0FBQSxHQUFJLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBd0IsTUFBeEI7TUFDSixJQUFHLEtBQUEsS0FBUyxDQUFaO1FBQ0MsSUFBK0IsQ0FBQSxLQUFLLENBQUMsQ0FBckM7aUJBQUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixNQUFyQixFQUFBO1NBREQ7T0FBQSxNQUFBO1FBR0MsSUFBZ0MsQ0FBQSxHQUFJLENBQUMsQ0FBckM7aUJBQUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixDQUF2QixFQUEwQixDQUExQixFQUFBO1NBSEQ7O0lBSFM7OzhCQVFWLE1BQUEsR0FBUSxTQUFBO0FBQ1AsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0MsQ0FBQyxDQUFDLFVBQUYsSUFBZ0IsQ0FBQyxDQUFDO0FBRG5COztJQURPOzs4QkFLUixNQUFBLEdBQVEsU0FBQyxRQUFEO2FBQ1AsUUFBUSxDQUFDLEVBQVQsQ0FBWSxRQUFaLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRE87Ozs7OztFQUlULEVBQUUsQ0FBQyxlQUFILEdBQXFCLElBQUksRUFBRSxDQUFDO0FBdEI1Qjs7O0FDQUE7QUFBQSxNQUFBOztFQUFNLEVBQUUsQ0FBQztBQUVSLFFBQUE7O0lBQWEscUJBQUMsR0FBRDtNQUFDLElBQUMsQ0FBQSxNQUFEO01BQ2IsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFULENBQWUsSUFBZjtNQUVBLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVO01BRVYsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsV0FBRCxHQUFlO01BR2YsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsR0FBUixFQUFhO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsSUFBRDtBQUNyQixnQkFBQTtZQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYO1lBRVIsSUFBTyx5QkFBUDtjQUNDLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLENBQUMsS0FBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsS0FBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLEdBQWpCLENBQWYsRUFBc0MsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLEdBQWMsQ0FBcEQsQ0FBQSxHQUF5RCxNQUExRCxFQURoQjs7WUFHQSxPQUFBLEdBQVUsS0FBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsQ0FBZixFQUFrQixLQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsR0FBakIsQ0FBQSxHQUF3QixDQUExQztBQUNWO0FBQUE7aUJBQUEsUUFBQTs7Y0FDQyxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQWIsR0FBa0IsT0FBQSxHQUFVLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUE7Y0FFekMsV0FBQSxHQUFjO2NBQ2QsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVIsR0FBYSxJQUFJO2NBQ2pCLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBWCxHQUFvQixTQUFBO2dCQUNuQixXQUFBLElBQWU7Z0JBQ2YsSUFBZ0IsV0FBQSxLQUFlLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQTVDO3lCQUFBLEtBQUMsQ0FBQSxTQUFELENBQUEsRUFBQTs7Y0FGbUI7MkJBR3BCLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBWCxHQUFpQixLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBO0FBUi9COztVQVBxQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtPQUFiO0lBWFk7OzBCQTRCYixTQUFBLEdBQVcsU0FBQTtBQUVWLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLElBQUksQ0FBQztBQUNmLFdBQUEsV0FBQTs7QUFDQyxhQUFTLDBCQUFUO1VBQ0MsSUFBTyxvQkFBUDtZQUNDLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVYsR0FBa0IseURBQUgsR0FBMkIsTUFBTyxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU8sQ0FBQSxDQUFBLENBQXpDLEdBQWlELEVBRGpFOztBQUREO1FBR0EsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO1FBQ2QsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO1FBQ2QsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO1FBQ2QsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO1FBQ2QsVUFBQSxHQUFhLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO1FBQ3ZCLElBQUMsQ0FBQSxXQUFZLENBQUEsQ0FBQSxDQUFiLEdBQWtCLFNBQUEsQ0FBVSxJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBbEIsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsRUFBd0MsQ0FBeEM7UUFDbEIsSUFBZSxJQUFDLENBQUEsTUFBRCxLQUFXLENBQTFCO1VBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFWOztBQVZEO01BWUEsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVDtJQWhCVTs7MEJBa0JYLGFBQUEsR0FBZSxTQUFDLEdBQUQsRUFBTSxLQUFOO0FBQ2QsVUFBQTs7UUFEb0IsUUFBUTs7TUFDNUIsSUFBQSxDQUFtQixJQUFDLENBQUEsS0FBcEI7QUFBQSxlQUFPLEtBQVA7O01BQ0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBVyxDQUFBLEdBQUE7TUFDN0IsSUFBbUIsaUJBQW5CO0FBQUEsZUFBTyxLQUFQOztBQUVBLGFBQU8sSUFBQyxDQUFBLFdBQVksQ0FBQSxTQUFTLENBQUMsTUFBTyxDQUFBLEtBQUEsQ0FBakI7SUFMTjs7MEJBT2YsZ0JBQUEsR0FBa0IsU0FBQyxJQUFEO0FBQ2pCLFVBQUE7TUFBQSxLQUFBLEdBQVE7QUFDUixXQUFBLHNDQUFBOztRQUNDLEtBQUEsSUFBUyxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsQ0FBb0IsQ0FBQztBQUQvQjthQUVBO0lBSmlCOztJQVVsQixNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7O0lBQ1QsT0FBQSxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCOztJQUVWLFNBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsQ0FBakI7QUFDWCxVQUFBO01BQUEsTUFBTSxDQUFDLEtBQVAsR0FBZTtNQUNmLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO01BQ2hCLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEtBQWxCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBQThDLENBQTlDO01BRUEsUUFBQSxHQUFlLElBQUEsS0FBQSxDQUFBO01BQ2YsUUFBUSxDQUFDLEdBQVQsR0FBZSxNQUFNLENBQUMsU0FBUCxDQUFBO0FBQ2YsYUFBTztJQVBJOzs7OztBQXBFYjs7O0FDQUE7RUFBTSxFQUFFLENBQUM7SUFFSyxzQkFBQTtNQUNaLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFFYixNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7aUJBQ2xDLEtBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBWCxHQUF3QjtRQURVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQztNQUVBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFDaEMsS0FBQyxDQUFBLFNBQVUsQ0FBQSxDQUFDLENBQUMsT0FBRixDQUFYLEdBQXdCO1FBRFE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO0lBTFk7OzJCQVNiLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxZQUFELENBQWMsR0FBZDthQUNWLElBQUMsQ0FBQSxTQUFVLENBQUEsT0FBQTtJQUZEOzsyQkFLWCxZQUFBLEdBQWMsU0FBQyxHQUFEO0FBQ2IsVUFBQTtNQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsZ0JBQWlCLENBQUEsR0FBQSxDQUFsQixJQUEwQjthQUNoQyxPQUFBLEdBQVUsSUFBQyxDQUFBLGVBQWdCLENBQUEsR0FBQTtJQUZkOzsyQkFLZCxlQUFBLEdBQWlCLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDaEIsVUFBQTtNQUFBLGdCQUFBLEdBQW1CO01BQ25CLGNBQUEsR0FBaUI7TUFFakIsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2xDLGNBQUE7a0VBQTJCLENBQUUsSUFBN0IsQ0FBa0MsR0FBbEMsRUFBdUMsQ0FBdkM7UUFEa0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DO01BRUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2hDLGNBQUE7Z0VBQXlCLENBQUUsSUFBM0IsQ0FBZ0MsR0FBaEMsRUFBcUMsQ0FBckM7UUFEZ0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO0FBR0E7V0FBQSxjQUFBO1FBQ0MsSUFBRyxJQUFBLEtBQVMsV0FBVCxJQUFBLElBQUEsS0FBc0IsV0FBdEIsSUFBQSxJQUFBLEtBQW1DLFNBQW5DLElBQUEsSUFBQSxLQUE4QyxZQUE5QyxJQUFBLElBQUEsS0FBNEQsU0FBNUQsSUFBQSxJQUFBLEtBQXVFLE9BQTFFO3VCQUNDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFsQixDQUFtQyxJQUFuQyxFQUF5QyxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsSUFBYixDQUFrQixHQUFsQixDQUF6QyxHQUREO1NBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixDQUFBLEtBQTRCLENBQS9CO1VBQ0osR0FBQSxHQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZjtVQUNOLE9BQUEsR0FBVSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQ7dUJBQ1YsZ0JBQWlCLENBQUEsT0FBQSxDQUFqQixHQUE0QixNQUFPLENBQUEsSUFBQSxHQUgvQjtTQUFBLE1BSUEsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBQSxLQUEwQixDQUE3QjtVQUNKLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7VUFDTixPQUFBLEdBQVUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkO3VCQUNWLGNBQWUsQ0FBQSxPQUFBLENBQWYsR0FBMEIsTUFBTyxDQUFBLElBQUEsR0FIN0I7U0FBQSxNQUFBOytCQUFBOztBQVBOOztJQVRnQjs7MkJBc0JqQixlQUFBLEdBQ0M7TUFBQSxTQUFBLEVBQWMsQ0FBZDtNQUNBLEdBQUEsRUFBYyxDQURkO01BRUEsS0FBQSxFQUFhLEVBRmI7TUFHQSxLQUFBLEVBQWEsRUFIYjtNQUlBLE9BQUEsRUFBYSxFQUpiO01BS0EsR0FBQSxFQUFhLEVBTGI7TUFNQSxRQUFBLEVBQWEsRUFOYjtNQU9BLE1BQUEsRUFBYSxFQVBiO01BUUEsR0FBQSxFQUFhLEVBUmI7TUFTQSxNQUFBLEVBQWEsRUFUYjtNQVVBLFFBQUEsRUFBYSxFQVZiO01BV0EsR0FBQSxFQUFhLEVBWGI7TUFZQSxJQUFBLEVBQWEsRUFaYjtNQWFBLFNBQUEsRUFBYSxFQWJiO01BY0EsT0FBQSxFQUFhLEVBZGI7TUFlQSxVQUFBLEVBQWEsRUFmYjtNQWdCQSxTQUFBLEVBQWEsRUFoQmI7TUFpQkEsTUFBQSxFQUFhLEVBakJiO01BbUJBLENBQUEsRUFBRyxFQW5CSDtNQW9CQSxDQUFBLEVBQUcsRUFwQkg7TUFxQkEsQ0FBQSxFQUFHLEVBckJIO01Bc0JBLENBQUEsRUFBRyxFQXRCSDtNQXVCQSxDQUFBLEVBQUcsRUF2Qkg7TUF3QkEsQ0FBQSxFQUFHLEVBeEJIO01BeUJBLENBQUEsRUFBRyxFQXpCSDtNQTBCQSxDQUFBLEVBQUcsRUExQkg7TUEyQkEsQ0FBQSxFQUFHLEVBM0JIO01BNEJBLENBQUEsRUFBRyxFQTVCSDtNQTZCQSxDQUFBLEVBQUcsRUE3Qkg7TUE4QkEsQ0FBQSxFQUFHLEVBOUJIO01BK0JBLENBQUEsRUFBRyxFQS9CSDtNQWdDQSxDQUFBLEVBQUcsRUFoQ0g7TUFpQ0EsQ0FBQSxFQUFHLEVBakNIO01Ba0NBLENBQUEsRUFBRyxFQWxDSDtNQW1DQSxDQUFBLEVBQUcsRUFuQ0g7TUFvQ0EsQ0FBQSxFQUFHLEVBcENIO01BcUNBLENBQUEsRUFBRyxFQXJDSDtNQXNDQSxDQUFBLEVBQUcsRUF0Q0g7TUF1Q0EsQ0FBQSxFQUFHLEVBdkNIO01Bd0NBLENBQUEsRUFBRyxFQXhDSDtNQXlDQSxDQUFBLEVBQUcsRUF6Q0g7TUEwQ0EsQ0FBQSxFQUFHLEVBMUNIO01BMkNBLENBQUEsRUFBRyxFQTNDSDtNQTRDQSxDQUFBLEVBQUcsRUE1Q0g7TUE2Q0EsQ0FBQSxFQUFHLEVBN0NIO01BOENBLENBQUEsRUFBRyxFQTlDSDtNQStDQSxDQUFBLEVBQUcsRUEvQ0g7TUFnREEsQ0FBQSxFQUFHLEVBaERIO01BaURBLENBQUEsRUFBRyxFQWpESDtNQWtEQSxDQUFBLEVBQUcsRUFsREg7TUFtREEsQ0FBQSxFQUFHLEVBbkRIO01Bb0RBLENBQUEsRUFBRyxFQXBESDtNQXFEQSxDQUFBLEVBQUcsRUFyREg7TUF1REEsRUFBQSxFQUFLLEdBdkRMO01Bd0RBLEVBQUEsRUFBSyxHQXhETDtNQXlEQSxFQUFBLEVBQUssR0F6REw7TUEwREEsRUFBQSxFQUFLLEdBMURMO01BMkRBLEVBQUEsRUFBSyxHQTNETDtNQTREQSxFQUFBLEVBQUssR0E1REw7TUE2REEsRUFBQSxFQUFLLEdBN0RMO01BOERBLEVBQUEsRUFBSyxHQTlETDtNQStEQSxFQUFBLEVBQUssR0EvREw7TUFnRUEsR0FBQSxFQUFLLEdBaEVMO01BaUVBLEdBQUEsRUFBSyxHQWpFTDtNQWtFQSxHQUFBLEVBQUssR0FsRUw7TUFvRUEsR0FBQSxFQUFLLEdBcEVMO01BcUVBLEdBQUEsRUFBSyxHQXJFTDtNQXNFQSxHQUFBLEVBQUssR0F0RUw7TUF1RUEsR0FBQSxFQUFLLEdBdkVMO01Bd0VBLEdBQUEsRUFBSyxHQXhFTDtNQXlFQSxHQUFBLEVBQUssR0F6RUw7TUEwRUEsR0FBQSxFQUFLLEdBMUVMO01BMkVBLEdBQUEsRUFBSyxHQTNFTDtNQTRFQSxHQUFBLEVBQUssR0E1RUw7TUE2RUEsR0FBQSxFQUFLLEdBN0VMO01BOEVBLElBQUEsRUFBTSxHQTlFTjs7OzJCQWlGRCxnQkFBQSxHQUNDO01BQUEsSUFBQSxFQUFhLFNBQWI7TUFDQSxHQUFBLEVBQWEsU0FEYjtNQUVBLEdBQUEsRUFBYSxRQUZiO01BR0EsS0FBQSxFQUFhLEdBSGI7TUFJQSxJQUFBLEVBQWEsUUFKYjtNQUtBLFNBQUEsRUFBYSxRQUxiO01BTUEsSUFBQSxFQUFhLFVBTmI7TUFPQSxXQUFBLEVBQWEsVUFQYjtNQVFBLElBQUEsRUFBYSxXQVJiO01BU0EsRUFBQSxFQUFhLFNBVGI7TUFVQSxLQUFBLEVBQWEsWUFWYjtNQVdBLElBQUEsRUFBYSxXQVhiO01BWUEsR0FBQSxFQUFhLFFBWmI7Ozs7OztBQTlIRjs7O0FDQ0E7QUFBQSxNQUFBOztFQUFNLEVBQUUsQ0FBQztBQUVSLFFBQUE7O0lBQUEsY0FBQSxHQUFxQixJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ3BCO01BQUEsUUFBQSxFQUFVLEdBQVY7TUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFEO1FBQ0wsSUFBb0IsZ0JBQXBCO1VBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxFQUFYOztRQUNBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7ZUFDWixJQUFJLENBQUMsRUFBTCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQWMsQ0FBQyxjQUFmLENBQThCLFVBQUEsQ0FBVyxJQUFJLENBQUMsR0FBaEIsQ0FBOUI7TUFITCxDQUROO01BS0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDO01BRFAsQ0FMUjtLQURvQjs7SUFTckIsa0JBQUEsR0FBeUIsSUFBQSxFQUFFLENBQUMsU0FBSCxDQUN4QjtNQUFBLFFBQUEsRUFBVSxHQUFWO01BQ0EsSUFBQSxFQUFNLFNBQUMsSUFBRDtRQUNMLElBQWdDLGdCQUFoQztVQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxFQUFFLENBQUMsT0FBbEI7O1FBQ0EsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQTtlQUNaLElBQUksQ0FBQyxFQUFMLEdBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUEsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixJQUFJLENBQUMsR0FBM0I7TUFITCxDQUROO01BS0EsTUFBQSxFQUFRLFNBQUMsSUFBRDtlQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUksQ0FBQyxPQUFwQjtNQURPLENBTFI7S0FEd0I7O0lBU1osc0JBQUMsTUFBRCxFQUFVLEdBQVY7TUFBQyxJQUFDLENBQUEsU0FBRDs7O01BQ2IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCO01BQ2pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLGtCQUFrQixDQUFDLE9BQW5CLENBQTJCLElBQUMsQ0FBQSxNQUE1QjtNQUVqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtNQUNqQixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsQ0FBVixFQUFhLENBQWI7TUFFaEIsR0FBRyxDQUFDLGdCQUFKLENBQXFCLFdBQXJCLEVBQWtDLElBQUMsQ0FBQSxXQUFuQztNQUNBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixZQUFyQixFQUFtQyxJQUFDLENBQUEsWUFBcEM7SUFSWTs7MkJBVWIsV0FBQSxHQUFhLFNBQUMsQ0FBRDtBQUNaLFVBQUE7TUFBQSxJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF6QjtRQUNDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN0QixFQUFBLEdBQUssQ0FBQyxDQUFDLENBQUMsU0FBSCxHQUFlO1FBQ3BCLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFILEdBQWU7ZUFFcEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBTEQ7O0lBRFk7OzJCQVFiLFlBQUEsR0FBYyxTQUFDLENBQUQ7QUFDYixVQUFBO01BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsRUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFILEdBQWdCLEdBQS9CO01BQ2pCLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBVixDQUF5QixjQUF6QjtNQUNBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFFNUMsRUFBQSxHQUFLLENBQUMsQ0FBQyxPQUFGLEdBQVksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxLQUFaLENBQUEsQ0FBQSxHQUFzQjtNQUN2QyxFQUFBLEdBQUssQ0FBQyxDQUFDLE9BQUYsR0FBWSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFBLEdBQXVCO01BQ3hDLEVBQUEsR0FBSyxDQUFDLEVBQUQsR0FBTSxDQUFDLGFBQUEsR0FBZ0IsQ0FBakIsQ0FBTixHQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUMvQyxFQUFBLEdBQUssQ0FBQyxFQUFELEdBQU0sQ0FBQyxhQUFBLEdBQWdCLENBQWpCLENBQU4sR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFFL0MsSUFBRyxJQUFDLENBQUEsYUFBSjtRQUNDLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBakM7UUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQUUsQ0FBQyxJQUFsQixDQUF1QixJQUFDLENBQUEsUUFBeEI7UUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtRQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQXBCLENBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBakM7UUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQUUsQ0FBQyxHQUFsQixDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFqQixHQUFxQixFQUEzQyxFQUErQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFqQixHQUFxQixFQUFwRTtlQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBUEQ7T0FBQSxNQUFBO1FBU0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFtQixJQUFJLENBQUMsUUFBeEIsRUFWRDs7SUFWYTs7Ozs7QUF0Q2Y7OztBQ0RBO0FBQUEsTUFBQSxDQUFBO0lBQUE7OztFQUFBLEVBQUUsQ0FBQyxpQkFBSCxHQUF1QixDQUFBLEdBRXRCO0lBQUEsTUFBQSxFQUFRLFNBQUE7YUFDUCxJQUFDLENBQUEsVUFBRCxDQUFZLENBQ1gsT0FEVyxFQUVYLE1BRlcsRUFHWCxRQUhXLEVBSVgsU0FKVyxFQUtYLFVBTFcsRUFNWCxXQU5XLEVBT1gsS0FQVyxFQVFYLEtBUlcsRUFTWCxTQVRXLEVBVVgsVUFWVyxDQUFaO0lBRE8sQ0FBUjtJQWNBLFVBQUEsRUFBWSxTQUFDLE1BQUQ7TUFDWCxJQUFxQixFQUFFLENBQUMsUUFBSCxDQUFZLE1BQVosQ0FBckI7UUFBQSxNQUFBLEdBQVMsQ0FBQyxNQUFELEVBQVQ7O01BRUEsSUFBRyxhQUFXLE1BQVgsRUFBQSxPQUFBLE1BQUg7UUFDQyxFQUFFLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxRQUFWLEdBQXFCLFNBQUMsTUFBRDtpQkFDcEIsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsSUFBaEIsRUFBbUIsTUFBbkI7UUFEb0I7UUFFckIsRUFBRSxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsVUFBVixHQUF1QixTQUFDLEtBQUQ7aUJBQ3RCLENBQUMsQ0FBQyx3QkFBRixDQUEyQixJQUEzQixFQUE4QixLQUE5QjtRQURzQjtRQUV2QixFQUFFLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxNQUFWLEdBQW1CLFNBQUMsTUFBRCxFQUFTLEtBQVQ7O1lBQVMsUUFBUSxFQUFFLENBQUM7O0FBQ3RDLGtCQUFPLE1BQU0sQ0FBQyxJQUFkO0FBQUEsaUJBQ00sT0FETjtxQkFFRSxDQUFDLENBQUMsY0FBRixDQUFpQixJQUFqQixFQUFvQixNQUFwQixFQUE0QixLQUE1QjtBQUZGLGlCQUdNLE1BSE47cUJBSUUsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsSUFBaEIsRUFBbUIsTUFBbkIsRUFBMkIsS0FBM0I7QUFKRixpQkFLTSxVQUxOO3FCQU1FLENBQUMsQ0FBQyxpQkFBRixDQUFvQixJQUFwQixFQUF1QixNQUF2QixFQUErQixLQUEvQjtBQU5GO1FBRGtCO1FBUW5CLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVCxHQUF1QixDQUFDLENBQUMsNEJBYjFCOztNQWVBLElBQUcsYUFBVSxNQUFWLEVBQUEsTUFBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLElBQUksQ0FBQSxTQUFFLENBQUEsVUFBVCxHQUFzQixTQUFDLEtBQUQ7aUJBQ3JCLENBQUMsQ0FBQyx1QkFBRixDQUEwQixLQUExQixFQUFpQyxJQUFqQztRQURxQjtRQUV0QixFQUFFLENBQUMsSUFBSSxDQUFBLFNBQUUsQ0FBQSxtQkFBVCxHQUErQixTQUFDLEVBQUQsRUFBSyxFQUFMO2lCQUM5QixDQUFDLENBQUMsdUJBQUYsQ0FBMEIsRUFBMUIsRUFBOEIsRUFBOUIsRUFBa0MsSUFBbEM7UUFEOEI7UUFFL0IsRUFBRSxDQUFDLElBQUksQ0FBQSxTQUFFLENBQUEsYUFBVCxHQUF5QixTQUFDLEtBQUQsRUFBUSxNQUFSO2lCQUN4QixDQUFDLENBQUMsd0JBQUYsQ0FBMkIsS0FBM0IsRUFBa0MsSUFBbEMsRUFBcUMsTUFBckM7UUFEd0I7UUFFekIsRUFBRSxDQUFDLElBQUksQ0FBQSxTQUFFLENBQUEsaUJBQVQsR0FBNkIsU0FBQyxJQUFEO2lCQUM1QixDQUFDLENBQUMsdUJBQUYsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBaEM7UUFENEI7UUFFN0IsRUFBRSxDQUFDLElBQUksQ0FBQSxTQUFFLENBQUEsZUFBVCxHQUEyQixTQUFDLElBQUQ7aUJBQzFCLENBQUMsQ0FBQyxlQUFGLENBQWtCLElBQWxCLEVBQXdCLElBQXhCO1FBRDBCLEVBVDVCOztNQVlBLElBQUcsYUFBWSxNQUFaLEVBQUEsUUFBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLE1BQU0sQ0FBQSxTQUFFLENBQUEsY0FBWCxHQUE0QixTQUFDLEtBQUQ7aUJBQzNCLENBQUMsQ0FBQyxhQUFGLENBQWdCLEtBQWhCLEVBQXVCLElBQXZCO1FBRDJCLEVBRDdCOztNQUlBLElBQUcsYUFBYSxNQUFiLEVBQUEsU0FBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLE9BQU8sQ0FBQSxTQUFFLENBQUEsY0FBWixHQUE2QixTQUFDLEtBQUQ7aUJBQzVCLENBQUMsQ0FBQyxjQUFGLENBQWlCLEtBQWpCLEVBQXdCLElBQXhCO1FBRDRCLEVBRDlCOztNQUlBLElBQUcsYUFBYyxNQUFkLEVBQUEsVUFBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLFFBQVEsQ0FBQSxTQUFFLENBQUEsY0FBYixHQUE4QixTQUFDLEtBQUQ7aUJBQzdCLENBQUMsQ0FBQyxlQUFGLENBQWtCLEtBQWxCLEVBQXlCLElBQXpCO1FBRDZCO1FBRTlCLEVBQUUsQ0FBQyxRQUFRLENBQUEsU0FBRSxDQUFBLElBQWIsR0FBb0IsU0FBQTtpQkFDbkIsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLElBQW5CO1FBRG1CLEVBSHJCOztNQU1BLElBQUcsYUFBZSxNQUFmLEVBQUEsV0FBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLFNBQVMsQ0FBQSxTQUFFLENBQUEsYUFBZCxHQUE4QixTQUFDLEtBQUQ7aUJBQzdCLENBQUMsQ0FBQyxnQkFBRixDQUFtQixLQUFuQixFQUEwQixJQUExQjtRQUQ2QixFQUQvQjs7TUFJQSxJQUFHLGFBQVMsTUFBVCxFQUFBLEtBQUEsTUFBSDtRQUNDLEVBQUUsQ0FBQyxHQUFHLENBQUEsU0FBRSxDQUFBLGNBQVIsR0FBeUIsU0FBQyxLQUFEO2lCQUN4QixDQUFDLENBQUMsVUFBRixDQUFhLEtBQWIsRUFBb0IsSUFBcEI7UUFEd0IsRUFEMUI7O01BSUEsSUFBRyxhQUFTLE1BQVQsRUFBQSxLQUFBLE1BQUg7UUFDQyxFQUFFLENBQUMsR0FBRyxDQUFBLFNBQUUsQ0FBQSxjQUFSLEdBQXlCLFNBQUMsS0FBRDtpQkFDeEIsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxLQUFiLEVBQW9CLElBQXBCO1FBRHdCLEVBRDFCOztNQUlBLElBQUcsYUFBYSxNQUFiLEVBQUEsU0FBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLE9BQU8sQ0FBQSxTQUFFLENBQUEsY0FBWixHQUE2QixTQUFDLEtBQUQ7aUJBQzVCLENBQUMsQ0FBQyxjQUFGLENBQWlCLEtBQWpCLEVBQXdCLElBQXhCO1FBRDRCLEVBRDlCOztNQUlBLElBQUcsYUFBYyxNQUFkLEVBQUEsVUFBQSxNQUFIO1FBQ0MsRUFBRSxDQUFDLFFBQVEsQ0FBQSxTQUFFLENBQUEsTUFBYixHQUFzQjtRQUN0QixFQUFFLENBQUMsUUFBUSxDQUFBLFNBQUUsQ0FBQSxrQkFBYixHQUFrQztRQUNsQyxFQUFFLENBQUMsUUFBUSxDQUFBLFNBQUUsQ0FBQSxVQUFiLEdBQTBCLFNBQUE7aUJBQ3pCLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLGtCQUFGLENBQXFCLElBQXJCO1FBRGU7UUFFMUIsRUFBRSxDQUFDLFFBQVEsQ0FBQSxTQUFFLENBQUEsc0JBQWIsR0FBc0MsU0FBQTtpQkFDckMsQ0FBQyxDQUFDLG1DQUFGLENBQXNDLElBQXRDO1FBRHFDO1FBRXRDLEVBQUUsQ0FBQyxRQUFRLENBQUEsU0FBRSxDQUFBLGdCQUFiLEdBQWdDLFNBQUMsS0FBRDtVQUMvQixJQUFHLGFBQUg7bUJBQWUsSUFBQyxDQUFBLGtCQUFtQixDQUFBLEtBQUEsRUFBbkM7V0FBQSxNQUFBO21CQUErQyxJQUFDLENBQUEsbUJBQWhEOztRQUQrQjtlQUVoQyxFQUFFLENBQUMsUUFBUSxDQUFBLFNBQUUsQ0FBQSxRQUFiLEdBQXdCLFNBQUMsUUFBRDs7WUFBQyxXQUFXOztpQkFDbkMsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLElBQW5CLEVBQXNCLFFBQXRCO1FBRHVCLEVBVHpCOztJQTVEVyxDQWRaO0lBd0ZBLGNBQUEsRUFBZ0IsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixLQUFoQjs7UUFBZ0IsUUFBUSxFQUFFLENBQUM7O2FBQzFDLEtBQUssQ0FBQyxVQUFOLENBQWlCLE1BQWpCLENBQUEsR0FBMkI7SUFEWixDQXhGaEI7SUEyRkEsYUFBQSxFQUFlLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkO0FBQ2QsVUFBQTs7UUFENEIsUUFBUSxFQUFFLENBQUM7O01BQ3ZDLFlBQUEsR0FBZSxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQjtNQUNmLFNBQUEsR0FBWSxJQUFJLENBQUMsYUFBTCxDQUFtQixLQUFuQjtNQUVaLFVBQUEsR0FBYSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBakMsQ0FBQSxHQUF1QyxJQUFJLENBQUMsTUFBTCxHQUFjO01BQ2xFLFVBQUEsR0FBYSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBakMsQ0FBQSxHQUF1QyxJQUFJLENBQUMsTUFBTCxHQUFjO0FBRWxFLGFBQU8sWUFBQSxHQUFlLEtBQWYsSUFBeUIsVUFBekIsSUFBd0M7SUFQakMsQ0EzRmY7SUFvR0EsaUJBQUEsRUFBbUIsU0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixLQUFsQjtBQUNsQixVQUFBOztRQURvQyxRQUFRLEVBQUUsQ0FBQzs7QUFDL0M7QUFBQSxXQUFBLHVDQUFBOztRQUNDLElBQWMsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsRUFBNkIsS0FBN0IsQ0FBZDtBQUFBLGlCQUFPLEtBQVA7O0FBREQ7YUFFQTtJQUhrQixDQXBHbkI7SUF5R0EsYUFBQSxFQUFlLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFDZCxVQUFBO01BQUEsRUFBQSxHQUFLLEtBQUssQ0FBQyxDQUFOLEdBQVUsTUFBTSxDQUFDO01BQ3RCLEVBQUEsR0FBSyxLQUFLLENBQUMsQ0FBTixHQUFVLE1BQU0sQ0FBQztBQUN0QixhQUFPLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLEVBQWIsQ0FBQSxHQUFtQixNQUFNLENBQUM7SUFIbkIsQ0F6R2Y7SUE4R0EsY0FBQSxFQUFnQixTQUFDLEtBQUQsRUFBUSxPQUFSO0FBQ2YsYUFBTyxFQUFFLENBQUMsS0FBSCxDQUFTLEtBQUssQ0FBQyxDQUFOLEdBQVUsT0FBTyxDQUFDLE9BQTNCLEVBQW9DLEtBQUssQ0FBQyxDQUFOLEdBQVUsT0FBTyxDQUFDLE9BQXRELENBQUEsR0FBaUU7SUFEekQsQ0E5R2hCO0lBaUhBLGdCQUFBLEVBQWtCLFNBQUMsS0FBRCxFQUFRLFNBQVI7YUFDakIsS0FBSyxDQUFDLENBQU4sR0FBVSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQTVCLElBQ0UsS0FBSyxDQUFDLENBQU4sR0FBVSxTQUFTLENBQUMsT0FBTyxDQUFDLENBRDlCLElBRUUsS0FBSyxDQUFDLENBQU4sR0FBVSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQWxCLEdBQXNCLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FGakQsSUFHRSxLQUFLLENBQUMsQ0FBTixHQUFVLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0IsU0FBUyxDQUFDLElBQUksQ0FBQztJQUpoQyxDQWpIbEI7SUF1SEEsZUFBQSxFQUFpQixTQUFDLEtBQUQsRUFBUSxRQUFSO2FBQ2hCLENBQUMsQ0FBQyx1QkFBRixDQUEwQixLQUExQixFQUFpQyxRQUFRLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBakQsRUFBcUQsUUFBUSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXBFLENBQUEsSUFDRSxDQUFDLENBQUMsdUJBQUYsQ0FBMEIsS0FBMUIsRUFBaUMsUUFBUSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQWpELEVBQXFELFFBQVEsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFwRSxDQURGLElBRUUsQ0FBQyxDQUFDLHVCQUFGLENBQTBCLEtBQTFCLEVBQWlDLFFBQVEsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFqRCxFQUFxRCxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBcEU7SUFIYyxDQXZIakI7SUE0SEEsVUFBQSxFQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDWCxVQUFBO01BQUEsRUFBQSxHQUFLLEtBQUssQ0FBQyxDQUFOLEdBQVUsR0FBRyxDQUFDO01BQ25CLEVBQUEsR0FBSyxLQUFLLENBQUMsQ0FBTixHQUFVLEdBQUcsQ0FBQztNQUNuQixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsQ0FBTixHQUFVLEdBQUcsQ0FBQyxFQUF6QixFQUE2QixLQUFLLENBQUMsQ0FBTixHQUFVLEdBQUcsQ0FBQyxFQUEzQztBQUNXLGFBQU0sQ0FBQSxHQUFJLEdBQUcsQ0FBQyxLQUFkO1FBQWYsQ0FBQSxJQUFLLEVBQUUsQ0FBQztNQUFPO0FBQ2YsYUFBTyxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxFQUFiLENBQUEsR0FBbUIsR0FBRyxDQUFDLE1BQXZCLElBQWlDLENBQUEsR0FBSSxHQUFHLENBQUMsS0FBekMsSUFBa0QsQ0FBQSxHQUFJLEdBQUcsQ0FBQztJQUx0RCxDQTVIWjtJQW1JQSxVQUFBLEVBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNYLFVBQUE7TUFBQSxJQUFHLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBRyxDQUFDLEVBQUosR0FBUyxLQUFLLENBQUMsQ0FBeEIsRUFBMkIsR0FBRyxDQUFDLEVBQUosR0FBUyxLQUFLLENBQUMsQ0FBMUMsQ0FBQSxHQUErQyxHQUFHLENBQUMsTUFBdEQ7UUFDQyxRQUFBLEdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBWCxDQUErQixHQUFHLENBQUMsTUFBbkMsRUFBMkMsS0FBM0M7UUFDWCxtQkFBQSxHQUFzQixHQUFHLENBQUMsR0FBSixHQUFVLEdBQUcsQ0FBQyxLQUFkLEdBQXNCLElBQUksQ0FBQztBQUNqRCxlQUFPLFFBQUEsR0FBVyxvQkFIbkI7T0FBQSxNQUFBO0FBS0MsZUFBTyxNQUxSOztJQURXLENBbklaO0lBMklBLGNBQUEsRUFBZ0IsU0FBQyxLQUFELEVBQVEsT0FBUjtBQUNmLFVBQUE7QUFBQTtBQUFBLFdBQUEsdUNBQUE7O1FBQ0MsSUFBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFIO0FBQ0MsaUJBQU8sS0FEUjs7QUFERDthQUdBO0lBSmUsQ0EzSWhCO0lBbUpBLHdCQUFBLEVBQTBCLFNBQUMsTUFBRCxFQUFTLE1BQVQ7YUFDekIsRUFBRSxDQUFDLEtBQUgsQ0FBUyxNQUFNLENBQUMsQ0FBUCxHQUFXLE1BQU0sQ0FBQyxDQUEzQixFQUE4QixNQUFNLENBQUMsQ0FBUCxHQUFXLE1BQU0sQ0FBQyxDQUFoRDtJQUR5QixDQW5KMUI7SUFzSkEsdUJBQUEsRUFBeUIsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUN4QixVQUFBO01BQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQTtNQUNqQixFQUFBLEdBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBO01BQ2pCLENBQUEsR0FBSSxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVgsQ0FBQSxHQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVg7TUFDcEIsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQSxHQUFJLEVBQUUsQ0FBQztBQUNsQixhQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQSxHQUFJLEtBQUssQ0FBQyxDQUFWLEdBQWMsQ0FBZCxHQUFrQixLQUFLLENBQUMsQ0FBakMsQ0FBQSxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBbEI7SUFMckIsQ0F0SnpCO0lBK0pBLDJCQUFBLEVBQTZCLFNBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxDQUFULEVBQVksRUFBWjtBQUM1QixVQUFBO01BQUEsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQUEsR0FBZ0I7TUFDM0IsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFILEdBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQUEsR0FBZ0I7TUFFM0IsSUFBRyxVQUFIO2VBQ0MsRUFBRSxDQUFDLEdBQUgsQ0FBTyxDQUFQLEVBQVUsQ0FBVixFQUREO09BQUEsTUFBQTtBQUdDLGVBQVcsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBSFo7O0lBSjRCLENBL0o3QjtJQTBLQSx1QkFBQSxFQUF5QixTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsSUFBVDtBQUN4QixVQUFBO01BQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQTtNQUNqQixFQUFBLEdBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBO01BQ2pCLElBQUcsRUFBRSxDQUFDLENBQUgsS0FBUSxFQUFFLENBQUMsQ0FBZDtBQUVDLGVBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQUEsR0FBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQWhCLEdBQWdDLEVBRnhDO09BQUEsTUFBQTtRQUlDLEdBQUEsR0FBTSxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVgsQ0FBQSxHQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQVgsQ0FBaEIsR0FBZ0MsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQWhDLEdBQWdELEVBQUUsQ0FBQztRQUN6RCxHQUFBLEdBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQUEsR0FBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQWhCLEdBQWdDLENBQUMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBWCxDQUFoQyxHQUFnRCxFQUFFLENBQUM7QUFDekQsZUFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFILEdBQU8sR0FBUixDQUFBLEdBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEdBQVIsQ0FBZixHQUE4QixFQU50Qzs7SUFId0IsQ0ExS3pCO0lBcUxBLHdCQUFBLEVBQTBCLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxNQUFkO0FBQ3pCLFVBQUE7O1FBRHVDLFNBQVMsSUFBSSxFQUFFLENBQUM7O01BQ3ZELEVBQUEsR0FBSyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUE7TUFDakIsRUFBQSxHQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQTtNQUNqQixDQUFBLEdBQUksQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYLENBQUEsR0FBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFYO01BQ3BCLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBSCxHQUFPLENBQUEsR0FBSSxFQUFFLENBQUM7TUFDbEIsQ0FBQSxHQUFJLEtBQUssQ0FBQyxDQUFOLEdBQVUsQ0FBQSxHQUFJLEtBQUssQ0FBQztNQUN4QixDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQVQsQ0FBQSxHQUFjLENBQUMsQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFUO01BQ2xCLENBQUEsR0FBSSxDQUFBLEdBQUksQ0FBSixHQUFRO01BRVosTUFBTSxDQUFDLEdBQVAsQ0FBVyxDQUFYLEVBQWMsQ0FBZDtBQUNBLGFBQU87SUFWa0IsQ0FyTDFCO0lBaU1BLHVCQUFBLEVBQXlCLFNBQUMsS0FBRCxFQUFRLEtBQVI7QUFDeEIsVUFBQTtNQUFBLE1BQVcsS0FBSyxDQUFDLE1BQWpCLEVBQUMsV0FBRCxFQUFLO01BQ0wsT0FBVyxLQUFLLENBQUMsTUFBakIsRUFBQyxZQUFELEVBQUs7TUFFTCxFQUFBLEdBQUssRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUM7TUFDZixFQUFBLEdBQUssRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUM7TUFDZixFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUssRUFBRSxDQUFDLENBQVQsQ0FBQSxHQUFjLENBQUMsRUFBQSxHQUFLLEVBQUUsQ0FBQyxDQUFUO01BQ25CLEVBQUEsR0FBSyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQztNQUNmLEVBQUEsR0FBSyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQztNQUNmLEVBQUEsR0FBSyxDQUFDLEVBQUEsR0FBSyxFQUFFLENBQUMsQ0FBVCxDQUFBLEdBQWMsQ0FBQyxFQUFBLEdBQUssRUFBRSxDQUFDLENBQVQ7TUFDbkIsR0FBQSxHQUFNLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU47QUFFbEIsYUFBVyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBQyxDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxDQUFDLEVBQUEsR0FBSyxFQUFOLENBQWIsQ0FBQSxHQUEwQixHQUFuQyxFQUF3QyxDQUFDLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBYixDQUFBLEdBQTBCLEdBQWxFO0lBWmEsQ0FqTXpCO0lBK01BLGVBQUEsRUFBaUIsU0FBQyxLQUFELEVBQVEsS0FBUjtBQUNoQixVQUFBO01BQUEsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFDckIsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7TUFFckIsQ0FBQSxHQUFJLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBWixHQUF3QixDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxDQUFDLEVBQUEsR0FBSyxFQUFOO01BRXhDLElBQUcsQ0FBQSxLQUFLLENBQVI7QUFDQyxlQUFPLE1BRFI7T0FBQSxNQUFBO1FBR0MsRUFBQSxHQUFLLENBQUMsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBeEIsR0FBb0MsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCLEVBQTVELEdBQWlFLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBWixHQUF3QixFQUExRixDQUFBLEdBQWdHO1FBQ3JHLEVBQUEsR0FBSyxDQUFDLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBWixHQUF3QixDQUFDLEVBQUEsR0FBSyxFQUFOLENBQXhCLEdBQW9DLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBWixHQUF3QixFQUE1RCxHQUFpRSxDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxDQUFDLEVBQUEsR0FBSyxFQUFOLENBQVosR0FBd0IsRUFBMUYsQ0FBQSxHQUFnRyxDQUFDLEVBSnZHOztBQUtBLGFBQU8sQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCLENBQXhCLElBQ0gsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCLENBRHJCLElBRUgsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCLENBRnJCLElBR0gsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFaLEdBQXdCO0lBcEJaLENBL01qQjtJQXVPQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQ7QUFDbkIsVUFBQTtNQUFBLEdBQUEsR0FBTTtNQUNOLElBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixJQUE0QixDQUEvQjtBQUNDLGFBQVMsaUdBQVQ7VUFDQyxHQUFBLElBQU8sUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFyQixDQUFnQyxRQUFRLENBQUMsUUFBUyxDQUFBLENBQUEsR0FBSSxDQUFKLENBQWxEO0FBRFIsU0FERDs7QUFHQSxhQUFPO0lBTFksQ0F2T3BCO0lBOE9BLG1DQUFBLEVBQXFDLFNBQUMsUUFBRDtBQUNwQyxVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsUUFBUSxDQUFDLGtCQUFtQixDQUFBLENBQUEsQ0FBNUIsR0FBaUM7QUFDakM7V0FBUyxpR0FBVDtRQUNDLE9BQUEsSUFBVyxRQUFRLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQXJCLENBQWdDLFFBQVEsQ0FBQyxRQUFTLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBbEQsQ0FBQSxHQUE0RCxRQUFRLENBQUM7cUJBQ2hGLFFBQVEsQ0FBQyxrQkFBbUIsQ0FBQSxDQUFBLENBQTVCLEdBQWlDO0FBRmxDOztJQUhvQyxDQTlPckM7SUFxUEEsZ0JBQUEsRUFBa0IsU0FBQyxRQUFELEVBQVcsUUFBWDtBQUNqQixVQUFBO01BQUEsVUFBQSxHQUFhO0FBQ2I7QUFBQSxXQUFBLFFBQUE7O1FBQ0MsSUFBRyxDQUFBLEdBQUksQ0FBUDtVQUNDLFVBQVcsQ0FBQSxDQUFBLENBQVgsR0FBZ0IsUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLEVBRG5DO1NBQUEsTUFBQTtVQUdDLE9BQVcsVUFBVyxVQUF0QixFQUFDLFlBQUQsRUFBSztVQUNMLEVBQUEsR0FBSyxRQUFRLENBQUMsUUFBUyxDQUFBLENBQUE7VUFDdkIsWUFBQSxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFyQixFQUF3QixFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFsQyxDQUFBLEdBQXVDLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBckIsRUFBd0IsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBbEMsQ0FBaEQ7VUFDZixJQUFHLFlBQUEsR0FBZSxRQUFBLEdBQVcsUUFBWCxHQUFzQixFQUFFLENBQUMsT0FBM0M7WUFDQyxVQUFXLENBQUEsVUFBVSxDQUFDLE1BQVgsR0FBb0IsQ0FBcEIsQ0FBWCxHQUFvQyxHQURyQztXQUFBLE1BQUE7WUFHQyxVQUFVLENBQUMsSUFBWCxDQUFnQixFQUFoQixFQUhEO1dBTkQ7O0FBREQ7TUFXQSxRQUFRLENBQUMsUUFBVCxHQUFvQjtNQUNwQixRQUFRLENBQUMsU0FBVCxHQUFxQixRQUFRLENBQUM7QUFDOUIsYUFBTztJQWZVLENBclBsQjtJQXdRQSxnQkFBQSxFQUFrQixTQUFDLFFBQUQ7QUFDakIsVUFBQTtNQUFBLE1BQVksUUFBUSxDQUFDLE1BQXJCLEVBQUMsVUFBRCxFQUFJLFVBQUosRUFBTztBQUNQLGFBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBVCxDQUFBLEdBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFULENBQWYsQ0FBQSxHQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUMsQ0FBVCxDQUFBLEdBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFULENBQWYsQ0FBdkMsQ0FBQSxHQUFzRTtJQUY1RCxDQXhRbEI7OztFQTRRRCxDQUFDLENBQUMsTUFBRixDQUFBO0FBOVFBOzs7QUNBQTtFQUFNLEVBQUUsQ0FBQztBQUVSLFFBQUE7O0lBQUEsTUFBQSxHQUFTOzs4QkFFVCxNQUFBLEdBQVE7OzhCQUNSLE1BQUEsR0FBUTs7OEJBQ1IsVUFBQSxHQUFZOzs4QkFDWixXQUFBLEdBQWE7O0lBRUEseUJBQUEsR0FBQTs7OEJBRWIsT0FBQSxHQUFTLFNBQUE7YUFDUixFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBbEIsRUFBMEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsVUFBWCxHQUF3QixNQUFBLEdBQVMsQ0FBM0Q7SUFEUTs7OEJBR1QsT0FBQSxHQUFTLFNBQUE7YUFDUixFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBbEIsRUFBMEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsV0FBWCxHQUF5QixNQUFBLEdBQVMsQ0FBNUQ7SUFEUTs7OEJBR1QsWUFBQSxHQUFjLFNBQUE7YUFDYixFQUFFLENBQUMsSUFBSCxDQUFRLEVBQVIsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFVBQXBCLEVBQWdDLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFdBQTNDLENBQUEsR0FBMEQsQ0FBdEU7SUFEYTs7OEJBR2QsUUFBQSxHQUFVLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVjtNQUNULElBQUcsU0FBSDtRQUNDLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFKaEI7T0FBQSxNQUFBO1FBTUMsSUFBQyxDQUFBLFVBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFQaEI7O2FBUUE7SUFUUzs7OEJBV1YsUUFBQSxHQUFVLFNBQUMsSUFBRDtBQUNULGNBQU8sSUFBUDtBQUFBLGFBQ00sUUFETjtpQkFDb0IsSUFBQyxDQUFBLGNBQUQsQ0FBQTtBQURwQixhQUVNLEtBRk47aUJBRWlCLElBQUMsQ0FBQSxXQUFELENBQUE7QUFGakIsYUFHTSxVQUhOO2lCQUdzQixJQUFDLENBQUEsZ0JBQUQsQ0FBQTtBQUh0QixhQUlNLFdBSk47aUJBSXVCLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0FBSnZCLGFBS00sS0FMTjtpQkFLaUIsSUFBQyxDQUFBLFdBQUQsQ0FBQTtBQUxqQixhQU1NLFNBTk47aUJBTXFCLElBQUMsQ0FBQSxlQUFELENBQUE7QUFOckIsYUFPTSxNQVBOO2lCQU9rQixJQUFDLENBQUEsWUFBRCxDQUFBO0FBUGxCLGFBUU0sVUFSTjtpQkFRc0IsSUFBQyxDQUFBLGdCQUFELENBQUE7QUFSdEI7aUJBU00sT0FBTyxDQUFDLElBQVIsQ0FBYSxxQkFBQSxHQUF3QixJQUFyQztBQVROO0lBRFM7OzhCQVlWLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxFQUFFLENBQUMsT0FBSCxDQUFXLEtBQVgsQ0FBSDtBQUNDLGFBQUEsdUNBQUE7O1VBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYO0FBQUEsU0FERDtPQUFBLE1BQUE7QUFHQyxnQkFBTyxLQUFLLENBQUMsSUFBYjtBQUFBLGVBQ00sUUFETjtZQUNvQixJQUFDLENBQUEsZUFBRCxDQUFpQixLQUFqQjtBQUFkO0FBRE4sZUFFTSxTQUZOO1lBRXFCLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQjtBQUFmO0FBRk4sZUFHTSxLQUhOO1lBR2lCLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZDtBQUFYO0FBSE4sZUFJTSxVQUpOO1lBSXNCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQjtBQUFoQjtBQUpOLGVBS00sV0FMTjtZQUt1QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEI7QUFBakI7QUFMTixlQU1NLEtBTk47WUFNaUIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkO0FBQVg7QUFOTixlQU9NLFNBUE47WUFPcUIsSUFBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCO0FBQWY7QUFQTixlQVFNLE1BUk47WUFRa0IsSUFBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmO0FBQVo7QUFSTixlQVNNLFVBVE47WUFTc0IsSUFBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CO0FBQWhCO0FBVE47WUFVTSxPQUFPLENBQUMsSUFBUixDQUFhLHFCQUFBLEdBQXdCLEtBQUssQ0FBQyxJQUEzQztBQVZOLFNBSEQ7O2FBY0E7SUFmVTs7OEJBaUJYLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtNQUNsQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNuQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNuQixLQUFLLENBQUMsT0FBTixDQUFjLFNBQWQ7YUFDQTtJQUprQjs7OEJBTW5CLGNBQUEsR0FBZ0IsU0FBQTtBQUNmLFVBQUE7TUFBQSxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBVixFQUEyQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQTNCLEVBQXVDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdkM7TUFDYixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWQsR0FBc0I7YUFDdEI7SUFIZTs7OEJBS2hCLGVBQUEsR0FBaUIsU0FBQyxNQUFEO01BQ2hCLE1BQU0sQ0FBQyxFQUFQLEdBQVksSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNaLE1BQU0sQ0FBQyxFQUFQLEdBQVksSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNaLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUMsQ0FBQSxZQUFELENBQUE7YUFDaEI7SUFKZ0I7OzhCQU1qQixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsVUFBQTtNQUFBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxPQUFILENBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFYLEVBQTRCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBNUI7TUFDZCxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsT0FBbkI7YUFDQTtJQUhnQjs7OEJBS2pCLGdCQUFBLEdBQWtCLFNBQUMsT0FBRDtNQUNqQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUEsWUFBRCxDQUFBO01BQ2xCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQSxZQUFELENBQUE7TUFDbEIsSUFBQyxDQUFBLGlCQUFELENBQW1CLE9BQW5CO2FBQ0E7SUFKaUI7OzhCQU1sQixXQUFBLEdBQWEsU0FBQTtBQUNaLFVBQUE7TUFBQSxLQUFBLEdBQVEsRUFBRSxDQUFDLElBQUgsQ0FBUSxFQUFFLENBQUMsTUFBWDtNQUNSLEdBQUEsR0FBTSxLQUFBLEdBQVEsRUFBRSxDQUFDLElBQUgsQ0FBUSxFQUFFLENBQUMsT0FBWCxFQUFvQixFQUFFLENBQUMsTUFBdkI7TUFFZCxHQUFBLEdBQVUsSUFBQSxFQUFFLENBQUMsR0FBSCxDQUFPLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBUCxFQUFtQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQW5CLEVBQStCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBL0IsRUFBZ0QsS0FBaEQsRUFBdUQsR0FBdkQ7TUFDVixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFyQixHQUE2QjtNQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFyQixHQUE2QjthQUM3QjtJQVBZOzs4QkFTYixZQUFBLEdBQWMsU0FBQyxHQUFEO0FBQ2IsVUFBQTtNQUFBLEtBQUEsR0FBUSxFQUFFLENBQUMsSUFBSCxDQUFRLEVBQUUsQ0FBQyxNQUFYO01BQ1IsR0FBQSxHQUFNLEtBQUEsR0FBUSxFQUFFLENBQUMsSUFBSCxDQUFRLEVBQUUsQ0FBQyxPQUFYLEVBQW9CLEVBQUUsQ0FBQyxNQUF2QjtNQUVkLEdBQUcsQ0FBQyxFQUFKLEdBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNULEdBQUcsQ0FBQyxFQUFKLEdBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBQTtNQUNULEdBQUcsQ0FBQyxNQUFKLEdBQWEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUNiLEdBQUcsQ0FBQyxLQUFKLEdBQVk7TUFDWixHQUFHLENBQUMsR0FBSixHQUFVO01BQ1YsR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaO2FBQ0E7SUFWYTs7OEJBWWQsV0FBQSxHQUFhLFNBQUE7QUFDWixVQUFBO01BQUEsS0FBQSxHQUFRLEVBQUUsQ0FBQyxJQUFILENBQVEsRUFBRSxDQUFDLE1BQVg7TUFDUixHQUFBLEdBQU0sS0FBQSxHQUFRLEVBQUUsQ0FBQyxJQUFILENBQVEsRUFBRSxDQUFDLE9BQVgsRUFBb0IsRUFBRSxDQUFDLE1BQXZCO01BRWQsR0FBQSxHQUFVLElBQUEsRUFBRSxDQUFDLEdBQUgsQ0FBTyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVAsRUFBbUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFuQixFQUErQixJQUFDLENBQUEsWUFBRCxDQUFBLENBQS9CLEVBQWdELEtBQWhELEVBQXVELEdBQXZEO01BQ1YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLEdBQW1CO01BQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQXJCLEdBQTZCO01BQzdCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQXJCLEdBQTZCO2FBQzdCO0lBUlk7OzhCQVViLFlBQUEsR0FBYyxlQUFDLENBQUEsU0FBRSxDQUFBOzs4QkFFakIsZ0JBQUEsR0FBa0IsU0FBQTtBQUNqQixVQUFBO01BQUEsTUFBQSxHQUFTO0FBQ1QsV0FBUywwQkFBVDtRQUNDLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBZ0IsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVCxFQUFxQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXJCO0FBRGpCO01BR0EsUUFBQSxHQUFlLElBQUEsRUFBRSxDQUFDLFFBQUgsQ0FBWSxNQUFPLENBQUEsQ0FBQSxDQUFuQixFQUF1QixNQUFPLENBQUEsQ0FBQSxDQUE5QixFQUFrQyxNQUFPLENBQUEsQ0FBQSxDQUF6QztNQUNmLFFBQVEsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBbkIsR0FBMkI7TUFDM0IsUUFBUSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFuQixHQUEyQjtNQUMzQixRQUFRLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQW5CLEdBQTJCO2FBQzNCO0lBVGlCOzs4QkFXbEIsaUJBQUEsR0FBbUIsU0FBQyxRQUFEO0FBQ2xCLFVBQUE7QUFBQSxXQUF1RCwwQkFBdkQ7UUFBQSxRQUFRLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQW5CLENBQXVCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdkIsRUFBbUMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFuQztBQUFBO01BQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBakI7YUFDQTtJQUhrQjs7OEJBS25CLGlCQUFBLEdBQW1CLFNBQUE7QUFDbEIsVUFBQTtNQUFBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxTQUFILENBQ1YsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsVUFBVCxDQURVLEVBRVYsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsV0FBVCxDQUZVLEVBR1YsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQXRCLENBSFUsRUFJVixFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBdkIsQ0FKVTtNQU1YLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBYixHQUFxQjtNQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQWIsR0FBcUI7TUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFiLEdBQXFCO01BQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBYixHQUFxQjthQUNyQjtJQVhrQjs7OEJBYW5CLGtCQUFBLEdBQW9CLFNBQUMsU0FBRDtNQUNuQixTQUFTLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBZCxFQUEwQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQTFCLEVBQXNDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdEMsRUFBa0QsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFsRDtNQUNBLFNBQVMsQ0FBQyxPQUFWLENBQWtCLFNBQWxCO2FBQ0E7SUFIbUI7OzhCQUtwQixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsVUFBQTtNQUFBLE1BQUEsR0FBUztBQUVULFdBQVMsMEJBQVQ7UUFDQyxLQUFBLEdBQVksSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVCxFQUFxQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXJCO1FBQ1osS0FBSyxDQUFDLEtBQU4sR0FBYyxHQUFBLEdBQU07UUFDcEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0FBSEQ7YUFLSSxJQUFBLEVBQUUsQ0FBQyxPQUFILENBQVcsTUFBWDtJQVJZOzs4QkFVakIsZ0JBQUEsR0FBa0IsU0FBQyxPQUFEO0FBQ2pCLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O1FBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVgsRUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtBQUFBO01BQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEI7YUFDQTtJQUhpQjs7OEJBS2xCLFlBQUEsR0FBYyxTQUFBO0FBQ2IsVUFBQTtNQUFBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFSLEVBQW9CLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBcEIsRUFBZ0MsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFoQyxFQUE0QyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQTVDO01BQ1gsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCO01BQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QjthQUN2QjtJQUphOzs4QkFNZCxhQUFBLEdBQWUsU0FBQyxJQUFEO0FBQ2QsVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVixFQUFzQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXRCO0FBQUE7TUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWI7YUFDQTtJQUhjOzs4QkFLZixnQkFBQSxHQUFrQixTQUFBO0FBQ2pCLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7QUFDbEIsV0FBUywwQkFBVDtRQUNDLEtBQUEsR0FBWSxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFULEVBQXFCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBckI7UUFDWixLQUFLLENBQUMsS0FBTixHQUFjLEdBQUEsR0FBTTtRQUNwQixRQUFRLENBQUMsUUFBVCxDQUFrQixLQUFsQjtBQUhEO2FBSUE7SUFOaUI7OzhCQVFsQixpQkFBQSxHQUFtQixTQUFDLFFBQUQ7QUFDbEIsVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBWCxFQUF1QixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXZCO0FBQUE7TUFDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFqQjthQUNBO0lBSGtCOzs7OztBQTdMcEIiLCJmaWxlIjoiYnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIE5hbWVzcGFjZSwgY29uc3RhbnRzLCB1dGlsaXR5IGZ1bmN0aW9ucyBhbmQgcG9seWZpbGxzXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIE5hbWVzcGFjZVxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZ2xvYmFsID0gd2luZG93IG9yIEBcclxuZ2xvYmFsLkJ1ID0ge2dsb2JhbH1cclxuXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENvbnN0YW50c1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBWZXJzaW9uIGluZm9cclxuQnUuVkVSU0lPTiA9ICcwLjQuMCdcclxuXHJcbiMgQnJvd3NlciB2ZW5kb3IgcHJlZml4ZXMsIHVzZWQgaW4gZXhwZXJpbWVudGFsIGZlYXR1cmVzXHJcbkJ1LkJST1dTRVJfVkVORE9SX1BSRUZJWEVTID0gWyd3ZWJraXQnLCAnbW96JywgJ21zJ11cclxuXHJcbiMgTWF0aFxyXG5CdS5IQUxGX1BJID0gTWF0aC5QSSAvIDJcclxuQnUuVFdPX1BJID0gTWF0aC5QSSAqIDJcclxuXHJcbiMgRGVmYXVsdCBmb250IGZvciB0aGUgdGV4dFxyXG5CdS5ERUZBVUxUX0ZPTlRfRkFNSUxZID0gJ1ZlcmRhbmEnXHJcbkJ1LkRFRkFVTFRfRk9OVF9TSVpFID0gMTFcclxuQnUuREVGQVVMVF9GT05UID0gJzExcHggVmVyZGFuYSdcclxuXHJcbiMgUG9pbnQgaXMgcmVuZGVyZWQgYXMgYSBzbWFsbCBjaXJjbGUgb24gc2NyZWVuLiBUaGlzIGlzIHRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZS5cclxuQnUuUE9JTlRfUkVOREVSX1NJWkUgPSAyLjI1XHJcblxyXG4jIFBvaW50IGNhbiBoYXZlIGEgbGFiZWwgYXR0YWNoZWQgbmVhciBpdC4gVGhpcyBpcyB0aGUgZ2FwIGRpc3RhbmNlIGJldHdlZW4gdGhlbS5cclxuQnUuUE9JTlRfTEFCRUxfT0ZGU0VUID0gNVxyXG5cclxuIyBEZWZhdWx0IHNtb290aCBmYWN0b3Igb2Ygc3BsaW5lLCByYW5nZSBpbiBbMCwgMV0gYW5kIDEgaXMgdGhlIHNtb290aGVzdFxyXG5CdS5ERUZBVUxUX1NQTElORV9TTU9PVEggPSAwLjI1XHJcblxyXG4jIEhvdyBjbG9zZSBhIHBvaW50IHRvIGEgbGluZSBpcyByZWdhcmRlZCB0aGF0IHRoZSBwb2ludCBpcyAqKk9OKiogdGhlIGxpbmUuXHJcbkJ1LkRFRkFVTFRfTkVBUl9ESVNUID0gNVxyXG5cclxuIyBFbnVtZXJhdGlvbiBvZiBtb3VzZSBidXR0b25zLCB1c2VkIHRvIGNvbXBhcmUgd2l0aCBgZS5idXR0b25zYCBvZiBtb3VzZSBldmVudHNcclxuQnUuTU9VU0UgPVxyXG5cdE5PTkU6ICAgMFxyXG5cdExFRlQ6ICAgMVxyXG5cdFJJR0hUOiAyXHJcblx0TUlERExFOiAgNFxyXG5cclxuXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgVXRpbGl0eSBmdW5jdGlvbnNcclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMgQ2FsY3VsYXRlIHRoZSBtZWFuIHZhbHVlIG9mIG51bWJlcnNcclxuQnUuYXZlcmFnZSA9ICgpLT5cclxuXHRucyA9IGFyZ3VtZW50c1xyXG5cdG5zID0gYXJndW1lbnRzWzBdIGlmIHR5cGVvZiBhcmd1bWVudHNbMF0gaXMgJ29iamVjdCdcclxuXHRzdW0gPSAwXHJcblx0Zm9yIGkgaW4gbnNcclxuXHRcdHN1bSArPSBpXHJcblx0c3VtIC8gbnMubGVuZ3RoXHJcblxyXG4jIENhbGN1bGF0ZSB0aGUgaHlwb3RlbnVzZSBmcm9tIHRoZSBjYXRoZXR1c2VzXHJcbkJ1LmJldmVsID0gKHgsIHkpIC0+XHJcblx0TWF0aC5zcXJ0IHggKiB4ICsgeSAqIHlcclxuXHJcbiMgTGltaXQgYSBudW1iZXIgYnkgbWluaW11bSB2YWx1ZSBhbmQgbWF4aW11bSB2YWx1ZVxyXG5CdS5jbGFtcCA9ICh4LCBtaW4sIG1heCkgLT5cclxuXHR4ID0gbWluIGlmIHggPCBtaW5cclxuXHR4ID0gbWF4IGlmIHggPiBtYXhcclxuXHR4XHJcblxyXG4jIEdlbmVyYXRlIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIHR3byBudW1iZXJzXHJcbkJ1LnJhbmQgPSAoZnJvbSwgdG8pIC0+XHJcblx0aWYgbm90IHRvP1xyXG5cdFx0dG8gPSBmcm9tXHJcblx0XHRmcm9tID0gMFxyXG5cdE1hdGgucmFuZG9tKCkgKiAodG8gLSBmcm9tKSArIGZyb21cclxuXHJcbiMgQ29udmVydCBhbiBhbmdsZSBmcm9tIHJhZGlhbiB0byBkZWdcclxuQnUucjJkID0gKHIpIC0+IChyICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCgxKVxyXG5cclxuIyBDb252ZXJ0IGFuIGFuZ2xlIGZyb20gZGVnIHRvIHJhZGlhblxyXG5CdS5kMnIgPSAocikgLT4gciAqIE1hdGguUEkgLyAxODBcclxuXHJcbiMgR2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcFxyXG5CdS5ub3cgPSBpZiBCdS5nbG9iYWwucGVyZm9ybWFuY2U/IHRoZW4gLT4gQnUuZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdygpIGVsc2UgLT4gRGF0ZS5ub3coKVxyXG5cclxuIyBDb21iaW5lIHRoZSBnaXZlbiBvcHRpb25zIChsYXN0IGl0ZW0gb2YgYXJndW1lbnRzKSB3aXRoIHRoZSBkZWZhdWx0IG9wdGlvbnNcclxuQnUuY29tYmluZU9wdGlvbnMgPSAoYXJncywgZGVmYXVsdE9wdGlvbnMpIC0+XHJcblx0ZGVmYXVsdE9wdGlvbnMgPSB7fSBpZiBub3QgZGVmYXVsdE9wdGlvbnM/XHJcblx0Z2l2ZW5PcHRpb25zID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXHJcblx0aWYgQnUuaXNQbGFpbk9iamVjdCBnaXZlbk9wdGlvbnNcclxuXHRcdGZvciBpIG9mIGdpdmVuT3B0aW9ucyB3aGVuIGdpdmVuT3B0aW9uc1tpXT9cclxuXHRcdFx0ZGVmYXVsdE9wdGlvbnNbaV0gPSBnaXZlbk9wdGlvbnNbaV1cclxuXHRyZXR1cm4gZGVmYXVsdE9wdGlvbnNcclxuXHJcbiMgQ2hlY2sgaWYgYW4gdmFyaWFibGUgaXMgYSBudW1iZXJcclxuQnUuaXNOdW1iZXIgPSAobykgLT5cclxuXHR0eXBlb2YgbyA9PSAnbnVtYmVyJ1xyXG5cclxuIyBDaGVjayBpZiBhbiB2YXJpYWJsZSBpcyBhIHN0cmluZ1xyXG5CdS5pc1N0cmluZyA9IChvKSAtPlxyXG5cdHR5cGVvZiBvID09ICdzdHJpbmcnXHJcblxyXG4jIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhbiBwbGFpbiBvYmplY3QsIG5vdCBpbnN0YW5jZSBvZiBjbGFzcy9mdW5jdGlvblxyXG5CdS5pc1BsYWluT2JqZWN0ID0gKG8pIC0+XHJcblx0byBpbnN0YW5jZW9mIE9iamVjdCBhbmQgby5jb25zdHJ1Y3Rvci5uYW1lID09ICdPYmplY3QnXHJcblxyXG4jIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhIGZ1bmN0aW9uXHJcbkJ1LmlzRnVuY3Rpb24gPSAobykgLT5cclxuXHRvIGluc3RhbmNlb2YgT2JqZWN0IGFuZCBvLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ0Z1bmN0aW9uJ1xyXG5cclxuIyBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBBcnJheVxyXG5CdS5pc0FycmF5ID0gKG8pIC0+XHJcblx0byBpbnN0YW5jZW9mIEFycmF5XHJcblxyXG4jIENsb25lIGFuIE9iamVjdCBvciBBcnJheVxyXG5CdS5jbG9uZSA9ICh0YXJnZXQpIC0+XHJcblx0aWYgdHlwZW9mKHRhcmdldCkgIT0gJ29iamVjdCcgb3IgdGFyZ2V0ID09IG51bGwgb3IgQnUuaXNGdW5jdGlvbiB0YXJnZXRcclxuXHRcdHRhcmdldFxyXG5cdGVsc2VcclxuXHRcdHJldHVybiB0YXJnZXQuY2xvbmUoKSBpZiB0YXJnZXQuY2xvbmU/XHJcblx0XHRcclxuXHRcdCMgRklYTUUgY2F1c2Ugc3RhY2sgb3ZlcmZsb3cgd2hlbiBpdHMgYSBjaXJjdWxhciBzdHJ1Y3R1cmVcclxuXHRcdGlmIEJ1LmlzQXJyYXkgdGFyZ2V0XHJcblx0XHRcdGNsb25lID0gW11cclxuXHRcdGVsc2UgaWYgQnUuaXNQbGFpbk9iamVjdCB0YXJnZXRcclxuXHRcdFx0Y2xvbmUgPSB7fVxyXG5cdFx0ZWxzZSAjIGluc3RhbmNlIG9mIGNsYXNzXHJcblx0XHRcdGNsb25lID0gT2JqZWN0LmNyZWF0ZSB0YXJnZXQuY29uc3RydWN0b3IucHJvdG90eXBlXHJcblxyXG5cdFx0Zm9yIG93biBpIG9mIHRhcmdldFxyXG5cdFx0XHRjbG9uZVtpXSA9IEJ1LmNsb25lIHRhcmdldFtpXVxyXG5cclxuXHRcdGNsb25lXHJcblxyXG4jIFVzZSBsb2NhbFN0b3JhZ2UgdG8gcGVyc2lzdCBkYXRhXHJcbkJ1LmRhdGEgPSAoa2V5LCB2YWx1ZSkgLT5cclxuXHRpZiB2YWx1ZT9cclxuXHRcdGxvY2FsU3RvcmFnZVsnQnUuJyArIGtleV0gPSBKU09OLnN0cmluZ2lmeSB2YWx1ZVxyXG5cdGVsc2VcclxuXHRcdHZhbHVlID0gbG9jYWxTdG9yYWdlWydCdS4nICsga2V5XVxyXG5cdFx0aWYgdmFsdWU/IHRoZW4gSlNPTi5wYXJzZSB2YWx1ZSBlbHNlIG51bGxcclxuXHJcbiMgRXhlY3V0ZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5XHJcbkJ1LnJlYWR5ID0gKGNiLCBjb250ZXh0LCBhcmdzKSAtPlxyXG5cdGlmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJ1xyXG5cdFx0Y2IuYXBwbHkgY29udGV4dCwgYXJnc1xyXG5cdGVsc2VcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ0RPTUNvbnRlbnRMb2FkZWQnLCAtPiBjYi5hcHBseSBjb250ZXh0LCBhcmdzXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFBvbHlmaWxsc1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBTaG9ydGN1dCB0byBkZWZpbmUgYSBwcm9wZXJ0eSBmb3IgYSBjbGFzcy4gVGhpcyBpcyB1c2VkIHRvIHNvbHZlIHRoZSBwcm9ibGVtXHJcbiMgdGhhdCBDb2ZmZWVTY3JpcHQgZGlkbid0IHN1cHBvcnQgZ2V0dGVycyBhbmQgc2V0dGVycy5cclxuIyBjbGFzcyBQZXJzb25cclxuIyAgIEBjb25zdHJ1Y3RvcjogKGFnZSkgLT5cclxuIyAgICAgQF9hZ2UgPSBhZ2VcclxuI1xyXG4jICAgQHByb3BlcnR5ICdhZ2UnLFxyXG4jICAgICBnZXQ6IC0+IEBfYWdlXHJcbiMgICAgIHNldDogKHZhbCkgLT5cclxuIyAgICAgICBAX2FnZSA9IHZhbFxyXG4jXHJcbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjXHJcblxyXG4jIE1ha2UgYSBjb3B5IG9mIHRoaXMgZnVuY3Rpb24gd2hpY2ggaGFzIGEgbGltaXRlZCBzaG9ydGVzdCBleGVjdXRpbmcgaW50ZXJ2YWwuXHJcbkZ1bmN0aW9uOjp0aHJvdHRsZSA9IChsaW1pdCA9IDAuNSkgLT5cclxuXHRjdXJyVGltZSA9IDBcclxuXHRsYXN0VGltZSA9IDBcclxuXHJcblx0cmV0dXJuICgpID0+XHJcblx0XHRjdXJyVGltZSA9IERhdGUubm93KClcclxuXHRcdGlmIGN1cnJUaW1lIC0gbGFzdFRpbWUgPiBsaW1pdCAqIDEwMDBcclxuXHRcdFx0QGFwcGx5IG51bGwsIGFyZ3VtZW50c1xyXG5cdFx0XHRsYXN0VGltZSA9IGN1cnJUaW1lXHJcblxyXG4jIE1ha2UgYSBjb3B5IG9mIHRoaXMgZnVuY3Rpb24gd2hvc2UgZXhlY3V0aW9uIHdpbGwgYmUgY29udGludW91c2x5IHB1dCBvZmZcclxuIyBhZnRlciBldmVyeSBjYWxsaW5nIG9mIHRoaXMgZnVuY3Rpb24uXHJcbkZ1bmN0aW9uOjpkZWJvdW5jZSA9IChkZWxheSA9IDAuNSkgLT5cclxuXHRhcmdzID0gbnVsbFxyXG5cdHRpbWVvdXQgPSBudWxsXHJcblxyXG5cdGxhdGVyID0gPT5cclxuXHRcdEBhcHBseSBudWxsLCBhcmdzXHJcblxyXG5cdHJldHVybiAoKSAtPlxyXG5cdFx0YXJncyA9IGFyZ3VtZW50c1xyXG5cdFx0Y2xlYXJUaW1lb3V0IHRpbWVvdXRcclxuXHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0IGxhdGVyLCBkZWxheSAqIDEwMDBcclxuXHJcblxyXG4jIEl0ZXJhdGUgdGhpcyBBcnJheSBhbmQgZG8gc29tZXRoaW5nIHdpdGggdGhlIGl0ZW1zLlxyXG5BcnJheTo6ZWFjaCBvcj0gKGZuKSAtPlxyXG5cdGkgPSAwXHJcblx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdGZuIEBbaV1cclxuXHRcdGkrK1xyXG5cdHJldHVybiBAXHJcblxyXG4jIEl0ZXJhdGUgdGhpcyBBcnJheSBhbmQgbWFwIHRoZSBpdGVtcyB0byBhIG5ldyBBcnJheS5cclxuQXJyYXk6Om1hcCBvcj0gKGZuKSAtPlxyXG5cdGFyciA9IFtdXHJcblx0aSA9IDBcclxuXHR3aGlsZSBpIDwgQGxlbmd0aFxyXG5cdFx0YXJyLnB1c2ggZm4oQFtpXSlcclxuXHRcdGkrK1xyXG5cdHJldHVybiBAXHJcblxyXG4jIE91dHB1dCB2ZXJzaW9uIGluZm8gdG8gdGhlIGNvbnNvbGUsIGF0IG1vc3Qgb25lIHRpbWUgaW4gYSBtaW51dGUuXHJcbmN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKVxyXG5sYXN0VGltZSA9IEJ1LmRhdGEgJ3ZlcnNpb24udGltZXN0YW1wJ1xyXG51bmxlc3MgbGFzdFRpbWU/IGFuZCBjdXJyZW50VGltZSAtIGxhc3RUaW1lIDwgNjAgKiAxMDAwXHJcblx0Y29uc29sZS5pbmZvPyAnQnUuanMgdicgKyBCdS5WRVJTSU9OICsgJyAtIFtodHRwczovL2dpdGh1Yi5jb20vamFydmlzbml1L0J1LmpzXSdcclxuXHRCdS5kYXRhICd2ZXJzaW9uLnRpbWVzdGFtcCcsIGN1cnJlbnRUaW1lXHJcbiIsIiMjIGF4aXMgYWxpZ25lZCBib3VuZGluZyBib3hcclxuXHJcbmNsYXNzIEJ1LkJvdW5kc1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB0YXJnZXQpIC0+XHJcblxyXG5cdFx0IyBUT0RPIHVzZSBtaW4sIG1heDogVmVjdG9yXHJcblx0XHRAeDEgPSBAeTEgPSBAeDIgPSBAeTIgPSAwXHJcblx0XHRAaXNFbXB0eSA9IHllc1xyXG5cclxuXHRcdEBwb2ludDEgPSBuZXcgQnUuVmVjdG9yXHJcblx0XHRAcG9pbnQyID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdEB1cGRhdGUoKVxyXG5cdFx0QGJpbmRFdmVudCgpXHJcblxyXG5cdGNvbnRhaW5zUG9pbnQ6IChwKSAtPlxyXG5cdFx0QHgxIDwgcC54ICYmIEB4MiA+IHAueCAmJiBAeTEgPCBwLnkgJiYgQHkyID4gcC55XHJcblxyXG5cdHVwZGF0ZTogPT5cclxuXHRcdEBjbGVhcigpXHJcblx0XHRzd2l0Y2ggQHRhcmdldC50eXBlXHJcblx0XHRcdHdoZW4gJ0xpbmUnLCAnVHJpYW5nbGUnLCAnUmVjdGFuZ2xlJ1xyXG5cdFx0XHRcdGZvciB2IGluIEB0YXJnZXQucG9pbnRzXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlQb2ludCh2KVxyXG5cdFx0XHR3aGVuICdDaXJjbGUnLCAnQm93JywgJ0ZhbidcclxuXHRcdFx0XHRAZXhwYW5kQnlDaXJjbGUgQHRhcmdldFxyXG5cdFx0XHR3aGVuICdQb2x5bGluZScsICdQb2x5Z29uJ1xyXG5cdFx0XHRcdGZvciB2IGluIEB0YXJnZXQudmVydGljZXNcclxuXHRcdFx0XHRcdEBleHBhbmRCeVBvaW50KHYpXHJcblx0XHRcdHdoZW4gJ0VsbGlwc2UnXHJcblx0XHRcdFx0QHgxID0gLUB0YXJnZXQucmFkaXVzWFxyXG5cdFx0XHRcdEB4MiA9IEB0YXJnZXQucmFkaXVzWFxyXG5cdFx0XHRcdEB5MSA9IC1AdGFyZ2V0LnJhZGl1c1lcclxuXHRcdFx0XHRAeTIgPSBAdGFyZ2V0LnJhZGl1c1lcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybiBcIkJvdW5kczogbm90IHN1cHBvcnQgc2hhcGUgdHlwZSAjeyBAdGFyZ2V0LnR5cGUgfVwiXHJcblxyXG5cdGJpbmRFdmVudDogLT5cclxuXHRcdHN3aXRjaCBAdGFyZ2V0LnR5cGVcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJywgJ0JvdycsICdGYW4nXHJcblx0XHRcdFx0QHRhcmdldC5vbiAnY2VudGVyQ2hhbmdlZCcsIEB1cGRhdGVcclxuXHRcdFx0XHRAdGFyZ2V0Lm9uICdyYWRpdXNDaGFuZ2VkJywgQHVwZGF0ZVxyXG5cdFx0XHR3aGVuICdFbGxpcHNlJ1xyXG5cdFx0XHRcdEB0YXJnZXQub24gJ2NoYW5nZWQnLCBAdXBkYXRlXHJcblxyXG5cdGNsZWFyOiAoKSAtPlxyXG5cdFx0QHgxID0gQHkxID0gQHgyID0gQHkyID0gMFxyXG5cdFx0QGlzRW1wdHkgPSB5ZXNcclxuXHRcdEBcclxuXHJcblx0ZXhwYW5kQnlQb2ludDogKHYpIC0+XHJcblx0XHRpZiBAaXNFbXB0eVxyXG5cdFx0XHRAaXNFbXB0eSA9IG5vXHJcblx0XHRcdEB4MSA9IEB4MiA9IHYueFxyXG5cdFx0XHRAeTEgPSBAeTIgPSB2LnlcclxuXHRcdGVsc2VcclxuXHRcdFx0QHgxID0gdi54IGlmIHYueCA8IEB4MVxyXG5cdFx0XHRAeDIgPSB2LnggaWYgdi54ID4gQHgyXHJcblx0XHRcdEB5MSA9IHYueSBpZiB2LnkgPCBAeTFcclxuXHRcdFx0QHkyID0gdi55IGlmIHYueSA+IEB5MlxyXG5cdFx0QFxyXG5cclxuXHRleHBhbmRCeUNpcmNsZTogKGMpIC0+XHJcblx0XHRjcCA9IGMuY2VudGVyXHJcblx0XHRyID0gYy5yYWRpdXNcclxuXHRcdGlmIEBpc0VtcHR5XHJcblx0XHRcdEBpc0VtcHR5ID0gbm9cclxuXHRcdFx0QHgxID0gY3AueCAtIHJcclxuXHRcdFx0QHgyID0gY3AueCArIHJcclxuXHRcdFx0QHkxID0gY3AueSAtIHJcclxuXHRcdFx0QHkyID0gY3AueSArIHJcclxuXHRcdGVsc2VcclxuXHRcdFx0QHgxID0gY3AueCAtIHIgaWYgY3AueCAtIHIgPCBAeDFcclxuXHRcdFx0QHgyID0gY3AueCArIHIgaWYgY3AueCArIHIgPiBAeDJcclxuXHRcdFx0QHkxID0gY3AueSAtIHIgaWYgY3AueSAtIHIgPCBAeTFcclxuXHRcdFx0QHkyID0gY3AueSArIHIgaWYgY3AueSArIHIgPiBAeTJcclxuXHRcdEBcclxuIiwiIyBQYXJzZSBhbmQgc2VyaWFsaXplIGNvbG9yXG4jIFRPRE8gU3VwcG9ydCBoc2woMCwgMTAwJSwgNTAlKSBmb3JtYXQuXG5cbmNsYXNzIEJ1LkNvbG9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgQHIgPSBAZyA9IEBiID0gMjU1XG4gICAgICAgIEBhID0gMVxuXG4gICAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgYXJnID0gYXJndW1lbnRzWzBdXG4gICAgICAgICAgICBpZiBCdS5pc1N0cmluZyBhcmdcbiAgICAgICAgICAgICAgICBAcGFyc2UgYXJnXG4gICAgICAgICAgICAgICAgQGEgPSBjbGFtcEFscGhhIEBhXG4gICAgICAgICAgICBlbHNlIGlmIGFyZyBpbnN0YW5jZW9mIEJ1LkNvbG9yXG4gICAgICAgICAgICAgICAgQGNvcHkgYXJnXG4gICAgICAgIGVsc2UgIyBpZiBhcmd1bWVudHMubGVuZ3RoID09IDMgb3IgNFxuICAgICAgICAgICAgQHIgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgICAgIEBnID0gYXJndW1lbnRzWzFdXG4gICAgICAgICAgICBAYiA9IGFyZ3VtZW50c1syXVxuICAgICAgICAgICAgQGEgPSBhcmd1bWVudHNbM10gb3IgMVxuXG4gICAgcGFyc2U6IChzdHIpIC0+XG4gICAgICAgIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX1JHQkFcbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgZm91bmRbMV1cbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgZm91bmRbMl1cbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgZm91bmRbM11cbiAgICAgICAgICAgIEBhID0gcGFyc2VGbG9hdCBmb3VuZFs0XVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX1JHQlxuICAgICAgICAgICAgQHIgPSBwYXJzZUludCBmb3VuZFsxXVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludCBmb3VuZFsyXVxuICAgICAgICAgICAgQGIgPSBwYXJzZUludCBmb3VuZFszXVxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfUkdCQV9QRVJcbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQoZm91bmRbMV0gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50KGZvdW5kWzJdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGIgPSBwYXJzZUludChmb3VuZFszXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBhID0gcGFyc2VGbG9hdCBmb3VuZFs0XVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX1JHQl9QRVJcbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQoZm91bmRbMV0gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50KGZvdW5kWzJdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGIgPSBwYXJzZUludChmb3VuZFszXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX0hFWDNcbiAgICAgICAgICAgIGhleCA9IGZvdW5kWzFdXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50IGhleFswXSwgMTZcbiAgICAgICAgICAgIEByID0gQHIgKiAxNiArIEByXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50IGhleFsxXSwgMTZcbiAgICAgICAgICAgIEBnID0gQGcgKiAxNiArIEBnXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50IGhleFsyXSwgMTZcbiAgICAgICAgICAgIEBiID0gQGIgKiAxNiArIEBiXG4gICAgICAgICAgICBAYSA9IDFcbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9IRVg2XG4gICAgICAgICAgICBoZXggPSBmb3VuZFsxXVxuICAgICAgICAgICAgQHIgPSBwYXJzZUludCBoZXguc3Vic3RyaW5nKDAsIDIpLCAxNlxuICAgICAgICAgICAgQGcgPSBwYXJzZUludCBoZXguc3Vic3RyaW5nKDIsIDQpLCAxNlxuICAgICAgICAgICAgQGIgPSBwYXJzZUludCBoZXguc3Vic3RyaW5nKDQsIDYpLCAxNlxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGVsc2UgaWYgQ1NTM19DT0xPUlNbc3RyID0gc3RyLnRvTG93ZXJDYXNlKCkudHJpbSgpXT9cbiAgICAgICAgICAgIEByID0gQ1NTM19DT0xPUlNbc3RyXVswXVxuICAgICAgICAgICAgQGcgPSBDU1MzX0NPTE9SU1tzdHJdWzFdXG4gICAgICAgICAgICBAYiA9IENTUzNfQ09MT1JTW3N0cl1bMl1cbiAgICAgICAgICAgIEBhID0gQ1NTM19DT0xPUlNbc3RyXVszXVxuICAgICAgICAgICAgQGEgPSAxIHVubGVzcyBAYT9cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS5lcnJvciBcIkJ1LkNvbG9yLnBhcnNlKFxcXCIjeyBzdHIgfVxcXCIpIGVycm9yLlwiXG4gICAgICAgIEBcblxuICAgIGNsb25lOiAtPlxuICAgICAgICAobmV3IEJ1LkNvbG9yKS5jb3B5IEBcblxuICAgIGNvcHk6IChjb2xvcikgLT5cbiAgICAgICAgQHIgPSBjb2xvci5yXG4gICAgICAgIEBnID0gY29sb3IuZ1xuICAgICAgICBAYiA9IGNvbG9yLmJcbiAgICAgICAgQGEgPSBjb2xvci5hXG4gICAgICAgIEBcblxuICAgIHNldFJHQjogKHIsIGcsIGIpIC0+XG4gICAgICAgIEByID0gcGFyc2VJbnQgclxuICAgICAgICBAZyA9IHBhcnNlSW50IGdcbiAgICAgICAgQGIgPSBwYXJzZUludCBiXG4gICAgICAgIEBhID0gMVxuICAgICAgICBAXG5cbiAgICBzZXRSR0JBOiAociwgZywgYiwgYSkgLT5cbiAgICAgICAgQHIgPSBwYXJzZUludCByXG4gICAgICAgIEBnID0gcGFyc2VJbnQgZ1xuICAgICAgICBAYiA9IHBhcnNlSW50IGJcbiAgICAgICAgQGEgPSBjbGFtcEFscGhhIHBhcnNlRmxvYXQgYVxuICAgICAgICBAXG5cbiAgICB0b1JHQjogLT5cbiAgICAgICAgXCJyZ2IoI3sgQHIgfSwgI3sgQGcgfSwgI3sgQGIgfSlcIlxuXG4gICAgdG9SR0JBOiAtPlxuICAgICAgICBcInJnYmEoI3sgQHIgfSwgI3sgQGcgfSwgI3sgQGIgfSwgI3sgQGEgfSlcIlxuXG5cbiAgICAjIFByaXZhdGUgZnVuY3Rpb25zXG5cbiAgICBjbGFtcEFscGhhID0gKGEpIC0+IEJ1LmNsYW1wIGEsIDAsIDFcblxuXG4gICAgIyBQcml2YXRlIHZhcmlhYmxlc1xuXG4gICAgUkVfUkdCID0gL3JnYlxcKFxccyooXFxkKyksXFxzKihcXGQrKSxcXHMqKFxcZCspXFxzKlxcKS9pXG4gICAgUkVfUkdCQSA9IC9yZ2JhXFwoXFxzKihcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXHMqLFxccyooWy5cXGRdKylcXHMqXFwpL2lcbiAgICBSRV9SR0JfUEVSID0gL3JnYlxcKFxccyooXFxkKyklLFxccyooXFxkKyklLFxccyooXFxkKyklXFxzKlxcKS9pXG4gICAgUkVfUkdCQV9QRVIgPSAvcmdiYVxcKFxccyooXFxkKyklLFxccyooXFxkKyklLFxccyooXFxkKyklXFxzKixcXHMqKFsuXFxkXSspXFxzKlxcKS9pXG4gICAgUkVfSEVYMyA9IC8jKFswLTlBLUZdezN9KVxccyokL2lcbiAgICBSRV9IRVg2ID0gLyMoWzAtOUEtRl17Nn0pXFxzKiQvaVxuICAgIENTUzNfQ09MT1JTID1cbiAgICAgICAgdHJhbnNwYXJlbnQ6IFswLCAwLCAwLCAwXVxuXG4gICAgICAgIGFsaWNlYmx1ZTogWzI0MCwgMjQ4LCAyNTVdXG4gICAgICAgIGFudGlxdWV3aGl0ZTogWzI1MCwgMjM1LCAyMTVdXG4gICAgICAgIGFxdWE6IFswLCAyNTUsIDI1NV1cbiAgICAgICAgYXF1YW1hcmluZTogWzEyNywgMjU1LCAyMTJdXG4gICAgICAgIGF6dXJlOiBbMjQwLCAyNTUsIDI1NV1cbiAgICAgICAgYmVpZ2U6IFsyNDUsIDI0NSwgMjIwXVxuICAgICAgICBiaXNxdWU6IFsyNTUsIDIyOCwgMTk2XVxuICAgICAgICBibGFjazogWzAsIDAsIDBdXG4gICAgICAgIGJsYW5jaGVkYWxtb25kOiBbMjU1LCAyMzUsIDIwNV1cbiAgICAgICAgYmx1ZTogWzAsIDAsIDI1NV1cbiAgICAgICAgYmx1ZXZpb2xldDogWzEzOCwgNDMsIDIyNl1cbiAgICAgICAgYnJvd246IFsxNjUsIDQyLCA0Ml1cbiAgICAgICAgYnVybHl3b29kOiBbMjIyLCAxODQsIDEzNV1cbiAgICAgICAgY2FkZXRibHVlOiBbOTUsIDE1OCwgMTYwXVxuICAgICAgICBjaGFydHJldXNlOiBbMTI3LCAyNTUsIDBdXG4gICAgICAgIGNob2NvbGF0ZTogWzIxMCwgMTA1LCAzMF1cbiAgICAgICAgY29yYWw6IFsyNTUsIDEyNywgODBdXG4gICAgICAgIGNvcm5mbG93ZXJibHVlOiBbMTAwLCAxNDksIDIzN11cbiAgICAgICAgY29ybnNpbGs6IFsyNTUsIDI0OCwgMjIwXVxuICAgICAgICBjcmltc29uOiBbMjIwLCAyMCwgNjBdXG4gICAgICAgIGN5YW46IFswLCAyNTUsIDI1NV1cbiAgICAgICAgZGFya2JsdWU6IFswLCAwLCAxMzldXG4gICAgICAgIGRhcmtjeWFuOiBbMCwgMTM5LCAxMzldXG4gICAgICAgIGRhcmtnb2xkZW5yb2Q6IFsxODQsIDEzNCwgMTFdXG4gICAgICAgIGRhcmtncmF5OiBbMTY5LCAxNjksIDE2OV1cbiAgICAgICAgZGFya2dyZWVuOiBbMCwgMTAwLCAwXVxuICAgICAgICBkYXJrZ3JleTogWzE2OSwgMTY5LCAxNjldXG4gICAgICAgIGRhcmtraGFraTogWzE4OSwgMTgzLCAxMDddXG4gICAgICAgIGRhcmttYWdlbnRhOiBbMTM5LCAwLCAxMzldXG4gICAgICAgIGRhcmtvbGl2ZWdyZWVuOiBbODUsIDEwNywgNDddXG4gICAgICAgIGRhcmtvcmFuZ2U6IFsyNTUsIDE0MCwgMF1cbiAgICAgICAgZGFya29yY2hpZDogWzE1MywgNTAsIDIwNF1cbiAgICAgICAgZGFya3JlZDogWzEzOSwgMCwgMF1cbiAgICAgICAgZGFya3NhbG1vbjogWzIzMywgMTUwLCAxMjJdXG4gICAgICAgIGRhcmtzZWFncmVlbjogWzE0MywgMTg4LCAxNDNdXG4gICAgICAgIGRhcmtzbGF0ZWJsdWU6IFs3MiwgNjEsIDEzOV1cbiAgICAgICAgZGFya3NsYXRlZ3JheTogWzQ3LCA3OSwgNzldXG4gICAgICAgIGRhcmtzbGF0ZWdyZXk6IFs0NywgNzksIDc5XVxuICAgICAgICBkYXJrdHVycXVvaXNlOiBbMCwgMjA2LCAyMDldXG4gICAgICAgIGRhcmt2aW9sZXQ6IFsxNDgsIDAsIDIxMV1cbiAgICAgICAgZGVlcHBpbms6IFsyNTUsIDIwLCAxNDddXG4gICAgICAgIGRlZXBza3libHVlOiBbMCwgMTkxLCAyNTVdXG4gICAgICAgIGRpbWdyYXk6IFsxMDUsIDEwNSwgMTA1XVxuICAgICAgICBkaW1ncmV5OiBbMTA1LCAxMDUsIDEwNV1cbiAgICAgICAgZG9kZ2VyYmx1ZTogWzMwLCAxNDQsIDI1NV1cbiAgICAgICAgZmlyZWJyaWNrOiBbMTc4LCAzNCwgMzRdXG4gICAgICAgIGZsb3JhbHdoaXRlOiBbMjU1LCAyNTAsIDI0MF1cbiAgICAgICAgZm9yZXN0Z3JlZW46IFszNCwgMTM5LCAzNF1cbiAgICAgICAgZnVjaHNpYTogWzI1NSwgMCwgMjU1XVxuICAgICAgICBnYWluc2Jvcm86IFsyMjAsIDIyMCwgMjIwXVxuICAgICAgICBnaG9zdHdoaXRlOiBbMjQ4LCAyNDgsIDI1NV1cbiAgICAgICAgZ29sZDogWzI1NSwgMjE1LCAwXVxuICAgICAgICBnb2xkZW5yb2Q6IFsyMTgsIDE2NSwgMzJdXG4gICAgICAgIGdyYXk6IFsxMjgsIDEyOCwgMTI4XVxuICAgICAgICBncmVlbjogWzAsIDEyOCwgMF1cbiAgICAgICAgZ3JlZW55ZWxsb3c6IFsxNzMsIDI1NSwgNDddXG4gICAgICAgIGdyZXk6IFsxMjgsIDEyOCwgMTI4XVxuICAgICAgICBob25leWRldzogWzI0MCwgMjU1LCAyNDBdXG4gICAgICAgIGhvdHBpbms6IFsyNTUsIDEwNSwgMTgwXVxuICAgICAgICBpbmRpYW5yZWQ6IFsyMDUsIDkyLCA5Ml1cbiAgICAgICAgaW5kaWdvOiBbNzUsIDAsIDEzMF1cbiAgICAgICAgaXZvcnk6IFsyNTUsIDI1NSwgMjQwXVxuICAgICAgICBraGFraTogWzI0MCwgMjMwLCAxNDBdXG4gICAgICAgIGxhdmVuZGVyOiBbMjMwLCAyMzAsIDI1MF1cbiAgICAgICAgbGF2ZW5kZXJibHVzaDogWzI1NSwgMjQwLCAyNDVdXG4gICAgICAgIGxhd25ncmVlbjogWzEyNCwgMjUyLCAwXVxuICAgICAgICBsZW1vbmNoaWZmb246IFsyNTUsIDI1MCwgMjA1XVxuICAgICAgICBsaWdodGJsdWU6IFsxNzMsIDIxNiwgMjMwXVxuICAgICAgICBsaWdodGNvcmFsOiBbMjQwLCAxMjgsIDEyOF1cbiAgICAgICAgbGlnaHRjeWFuOiBbMjI0LCAyNTUsIDI1NV1cbiAgICAgICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsIDI1MCwgMjEwXVxuICAgICAgICBsaWdodGdyYXk6IFsyMTEsIDIxMSwgMjExXVxuICAgICAgICBsaWdodGdyZWVuOiBbMTQ0LCAyMzgsIDE0NF1cbiAgICAgICAgbGlnaHRncmV5OiBbMjExLCAyMTEsIDIxMV1cbiAgICAgICAgbGlnaHRwaW5rOiBbMjU1LCAxODIsIDE5M11cbiAgICAgICAgbGlnaHRzYWxtb246IFsyNTUsIDE2MCwgMTIyXVxuICAgICAgICBsaWdodHNlYWdyZWVuOiBbMzIsIDE3OCwgMTcwXVxuICAgICAgICBsaWdodHNreWJsdWU6IFsxMzUsIDIwNiwgMjUwXVxuICAgICAgICBsaWdodHNsYXRlZ3JheTogWzExOSwgMTM2LCAxNTNdXG4gICAgICAgIGxpZ2h0c2xhdGVncmV5OiBbMTE5LCAxMzYsIDE1M11cbiAgICAgICAgbGlnaHRzdGVlbGJsdWU6IFsxNzYsIDE5NiwgMjIyXVxuICAgICAgICBsaWdodHllbGxvdzogWzI1NSwgMjU1LCAyMjRdXG4gICAgICAgIGxpbWU6IFswLCAyNTUsIDBdXG4gICAgICAgIGxpbWVncmVlbjogWzUwLCAyMDUsIDUwXVxuICAgICAgICBsaW5lbjogWzI1MCwgMjQwLCAyMzBdXG4gICAgICAgIG1hZ2VudGE6IFsyNTUsIDAsIDI1NV1cbiAgICAgICAgbWFyb29uOiBbMTI4LCAwLCAwXVxuICAgICAgICBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLCAyMDUsIDE3MF1cbiAgICAgICAgbWVkaXVtYmx1ZTogWzAsIDAsIDIwNV1cbiAgICAgICAgbWVkaXVtb3JjaGlkOiBbMTg2LCA4NSwgMjExXVxuICAgICAgICBtZWRpdW1wdXJwbGU6IFsxNDcsIDExMiwgMjE5XVxuICAgICAgICBtZWRpdW1zZWFncmVlbjogWzYwLCAxNzksIDExM11cbiAgICAgICAgbWVkaXVtc2xhdGVibHVlOiBbMTIzLCAxMDQsIDIzOF1cbiAgICAgICAgbWVkaXVtc3ByaW5nZ3JlZW46IFswLCAyNTAsIDE1NF1cbiAgICAgICAgbWVkaXVtdHVycXVvaXNlOiBbNzIsIDIwOSwgMjA0XVxuICAgICAgICBtZWRpdW12aW9sZXRyZWQ6IFsxOTksIDIxLCAxMzNdXG4gICAgICAgIG1pZG5pZ2h0Ymx1ZTogWzI1LCAyNSwgMTEyXVxuICAgICAgICBtaW50Y3JlYW06IFsyNDUsIDI1NSwgMjUwXVxuICAgICAgICBtaXN0eXJvc2U6IFsyNTUsIDIyOCwgMjI1XVxuICAgICAgICBtb2NjYXNpbjogWzI1NSwgMjI4LCAxODFdXG4gICAgICAgIG5hdmFqb3doaXRlOiBbMjU1LCAyMjIsIDE3M11cbiAgICAgICAgbmF2eTogWzAsIDAsIDEyOF1cbiAgICAgICAgb2xkbGFjZTogWzI1MywgMjQ1LCAyMzBdXG4gICAgICAgIG9saXZlOiBbMTI4LCAxMjgsIDBdXG4gICAgICAgIG9saXZlZHJhYjogWzEwNywgMTQyLCAzNV1cbiAgICAgICAgb3JhbmdlOiBbMjU1LCAxNjUsIDBdXG4gICAgICAgIG9yYW5nZXJlZDogWzI1NSwgNjksIDBdXG4gICAgICAgIG9yY2hpZDogWzIxOCwgMTEyLCAyMTRdXG4gICAgICAgIHBhbGVnb2xkZW5yb2Q6IFsyMzgsIDIzMiwgMTcwXVxuICAgICAgICBwYWxlZ3JlZW46IFsxNTIsIDI1MSwgMTUyXVxuICAgICAgICBwYWxldHVycXVvaXNlOiBbMTc1LCAyMzgsIDIzOF1cbiAgICAgICAgcGFsZXZpb2xldHJlZDogWzIxOSwgMTEyLCAxNDddXG4gICAgICAgIHBhcGF5YXdoaXA6IFsyNTUsIDIzOSwgMjEzXVxuICAgICAgICBwZWFjaHB1ZmY6IFsyNTUsIDIxOCwgMTg1XVxuICAgICAgICBwZXJ1OiBbMjA1LCAxMzMsIDYzXVxuICAgICAgICBwaW5rOiBbMjU1LCAxOTIsIDIwM11cbiAgICAgICAgcGx1bTogWzIyMSwgMTYwLCAyMjFdXG4gICAgICAgIHBvd2RlcmJsdWU6IFsxNzYsIDIyNCwgMjMwXVxuICAgICAgICBwdXJwbGU6IFsxMjgsIDAsIDEyOF1cbiAgICAgICAgcmVkOiBbMjU1LCAwLCAwXVxuICAgICAgICByb3N5YnJvd246IFsxODgsIDE0MywgMTQzXVxuICAgICAgICByb3lhbGJsdWU6IFs2NSwgMTA1LCAyMjVdXG4gICAgICAgIHNhZGRsZWJyb3duOiBbMTM5LCA2OSwgMTldXG4gICAgICAgIHNhbG1vbjogWzI1MCwgMTI4LCAxMTRdXG4gICAgICAgIHNhbmR5YnJvd246IFsyNDQsIDE2NCwgOTZdXG4gICAgICAgIHNlYWdyZWVuOiBbNDYsIDEzOSwgODddXG4gICAgICAgIHNlYXNoZWxsOiBbMjU1LCAyNDUsIDIzOF1cbiAgICAgICAgc2llbm5hOiBbMTYwLCA4MiwgNDVdXG4gICAgICAgIHNpbHZlcjogWzE5MiwgMTkyLCAxOTJdXG4gICAgICAgIHNreWJsdWU6IFsxMzUsIDIwNiwgMjM1XVxuICAgICAgICBzbGF0ZWJsdWU6IFsxMDYsIDkwLCAyMDVdXG4gICAgICAgIHNsYXRlZ3JheTogWzExMiwgMTI4LCAxNDRdXG4gICAgICAgIHNsYXRlZ3JleTogWzExMiwgMTI4LCAxNDRdXG4gICAgICAgIHNub3c6IFsyNTUsIDI1MCwgMjUwXVxuICAgICAgICBzcHJpbmdncmVlbjogWzAsIDI1NSwgMTI3XVxuICAgICAgICBzdGVlbGJsdWU6IFs3MCwgMTMwLCAxODBdXG4gICAgICAgIHRhbjogWzIxMCwgMTgwLCAxNDBdXG4gICAgICAgIHRlYWw6IFswLCAxMjgsIDEyOF1cbiAgICAgICAgdGhpc3RsZTogWzIxNiwgMTkxLCAyMTZdXG4gICAgICAgIHRvbWF0bzogWzI1NSwgOTksIDcxXVxuICAgICAgICB0dXJxdW9pc2U6IFs2NCwgMjI0LCAyMDhdXG4gICAgICAgIHZpb2xldDogWzIzOCwgMTMwLCAyMzhdXG4gICAgICAgIHdoZWF0OiBbMjQ1LCAyMjIsIDE3OV1cbiAgICAgICAgd2hpdGU6IFsyNTUsIDI1NSwgMjU1XVxuICAgICAgICB3aGl0ZXNtb2tlOiBbMjQ1LCAyNDUsIDI0NV1cbiAgICAgICAgeWVsbG93OiBbMjU1LCAyNTUsIDBdXG4gICAgICAgIHllbGxvd2dyZWVuOiBbMTU0LCAyMDUsIDUwXVxuIiwiIyB0aGUgc2l6ZSBvZiByZWN0YW5nbGUsIEJvdW5kcyBldGMuXHJcblxyXG5jbGFzcyBCdS5TaXplXHJcblx0Y29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQpIC0+XHJcblx0XHRAdHlwZSA9ICdTaXplJ1xyXG5cclxuXHRzZXQ6IChAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiIsIiMgMmQgdmVjdG9yXHJcblxyXG5jbGFzcyBCdS5WZWN0b3JcclxuXHJcblx0Y29uc3RydWN0b3I6IChAeCA9IDAsIEB5ID0gMCkgLT5cclxuXHJcblx0Y2xvbmU6IC0+XHJcblx0XHRuZXcgQnUuVmVjdG9yIEB4LCBAeVxyXG5cclxuXHRhZGQ6ICh2KSAtPlxyXG5cdFx0QHggKz0gdi54XHJcblx0XHRAeSArPSB2LnlcclxuXHRcdEBcclxuXHJcblx0c2V0OiAoQHgsIEB5KSAtPlxyXG5cdFx0QFxyXG5cclxuXHRvZmZzZXQ6IChkeCwgZHkpIC0+XHJcblx0XHRAeCArPSBkeFxyXG5cdFx0QHkgKz0gZHlcclxuXHRcdEBcclxuXHJcblx0Y29weTogKHYpIC0+XHJcblx0XHRAeCA9IHYueFxyXG5cdFx0QHkgPSB2LnlcclxuXHRcdEBcclxuXHJcblx0bXVsdGlwbHlTY2FsYXI6IChzY2FsYXIpIC0+XHJcblx0XHRAeCAqPSBzY2FsYXJcclxuXHRcdEB5ICo9IHNjYWxhclxyXG5cdFx0QFxyXG5cclxuXHRwcm9qZWN0OiAob2JqKSAtPlxyXG5cdFx0IyBzY2FsZVxyXG5cdFx0QHggKj0gb2JqLnNjYWxlLnhcclxuXHRcdEB5ICo9IG9iai5zY2FsZS55XHJcblx0XHQjIHJvdGF0aW9uXHJcblx0XHRsZW4gPSBCdS5iZXZlbChAeCwgQHkpXHJcblx0XHRhID0gTWF0aC5hdGFuMihAeSwgQHgpICsgb2JqLnJvdGF0aW9uXHJcblx0XHRAeCA9IGxlbiAqIE1hdGguY29zKGEpXHJcblx0XHRAeSA9IGxlbiAqIE1hdGguc2luKGEpXHJcblx0XHQjIHRyYW5zbGF0ZVxyXG5cdFx0QHggKz0gb2JqLnBvc2l0aW9uLnhcclxuXHRcdEB5ICs9IG9iai5wb3NpdGlvbi55XHJcblx0XHRAXHJcblxyXG5cdHVuUHJvamVjdDogKG9iaikgLT5cclxuXHRcdCMgdHJhbnNsYXRlXHJcblx0XHRAeCAtPSBvYmoucG9zaXRpb24ueFxyXG5cdFx0QHkgLT0gb2JqLnBvc2l0aW9uLnlcclxuXHRcdCMgcm90YXRpb25cclxuXHRcdGxlbiA9IEJ1LmJldmVsKEB4LCBAeSlcclxuXHRcdGEgPSBNYXRoLmF0YW4yKEB5LCBAeCkgLSBvYmoucm90YXRpb25cclxuXHRcdEB4ID0gbGVuICogTWF0aC5jb3MoYSlcclxuXHRcdEB5ID0gbGVuICogTWF0aC5zaW4oYSlcclxuXHRcdCMgc2NhbGVcclxuXHRcdEB4IC89IG9iai5zY2FsZS54XHJcblx0XHRAeSAvPSBvYmouc2NhbGUueVxyXG5cdFx0QFxyXG4iLCIjIEFkZCBldmVudCBsaXN0ZW5lciBmZWF0dXJlIHRvIGN1c3RvbSBvYmplY3RzXHJcblxyXG5CdS5FdmVudCA9IC0+XHJcblx0dHlwZXMgPSB7fVxyXG5cclxuXHRAb24gPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lcnMgPSB0eXBlc1t0eXBlXSBvcj0gW11cclxuXHRcdGxpc3RlbmVycy5wdXNoIGxpc3RlbmVyIGlmIGxpc3RlbmVycy5pbmRleE9mIGxpc3RlbmVyID09IC0xXHJcblxyXG5cdEBvbmNlID0gKHR5cGUsIGxpc3RlbmVyKSAtPlxyXG5cdFx0bGlzdGVuZXIub25jZSA9IHRydWVcclxuXHRcdEBvbiB0eXBlLCBsaXN0ZW5lclxyXG5cclxuXHRAb2ZmID0gKHR5cGUsIGxpc3RlbmVyKSAtPlxyXG5cdFx0bGlzdGVuZXJzID0gdHlwZXNbdHlwZV1cclxuXHRcdGlmIGxpc3RlbmVyP1xyXG5cdFx0XHRpZiBsaXN0ZW5lcnM/XHJcblx0XHRcdFx0aW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiBsaXN0ZW5lclxyXG5cdFx0XHRcdGxpc3RlbmVycy5zcGxpY2UgaW5kZXgsIDEgaWYgaW5kZXggPiAtMVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRsaXN0ZW5lcnMubGVuZ3RoID0gMCBpZiBsaXN0ZW5lcnM/XHJcblxyXG5cdEB0cmlnZ2VyID0gKHR5cGUsIGV2ZW50RGF0YSkgLT5cclxuXHRcdGxpc3RlbmVycyA9IHR5cGVzW3R5cGVdXHJcblxyXG5cdFx0aWYgbGlzdGVuZXJzP1xyXG5cdFx0XHRldmVudERhdGEgb3I9IHt9XHJcblx0XHRcdGV2ZW50RGF0YS50YXJnZXQgPSBAXHJcblx0XHRcdGZvciBsaXN0ZW5lciBpbiBsaXN0ZW5lcnNcclxuXHRcdFx0XHRsaXN0ZW5lci5jYWxsIHRoaXMsIGV2ZW50RGF0YVxyXG5cdFx0XHRcdGlmIGxpc3RlbmVyLm9uY2VcclxuXHRcdFx0XHRcdGxpc3RlbmVycy5zcGxpY2UgbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpLCAxXHJcbiIsIiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgTWljcm9KUXVlcnkgLSBBIG1pY3JvIHZlcnNpb24gb2YgalF1ZXJ5XHJcbiNcclxuIyBTdXBwb3J0ZWQgZmVhdHVyZXM6XHJcbiMgICAkLiAtIHN0YXRpYyBtZXRob2RzXHJcbiMgICAgIC5yZWFkeShjYikgLSBjYWxsIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBhZnRlciB0aGUgcGFnZSBpcyBsb2FkZWRcclxuIyAgICAgLmFqYXgoW3VybCxdIG9wdGlvbnMpIC0gcGVyZm9ybSBhbiBhamF4IHJlcXVlc3RcclxuIyAgICQoc2VsZWN0b3IpIC0gc2VsZWN0IGVsZW1lbnQocylcclxuIyAgICAgLm9uKHR5cGUsIGNhbGxiYWNrKSAtIGFkZCBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAub2ZmKHR5cGUsIGNhbGxiYWNrKSAtIHJlbW92ZSBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAuYXBwZW5kKHRhZ05hbWUpIC0gYXBwZW5kIGEgdGFnXHJcbiMgICAgIC50ZXh0KHRleHQpIC0gc2V0IHRoZSBpbm5lciB0ZXh0XHJcbiMgICAgIC5odG1sKGh0bWxUZXh0KSAtIHNldCB0aGUgaW5uZXIgSFRNTFxyXG4jICAgICAuc3R5bGUobmFtZSwgdmFsdWUpIC0gc2V0IHN0eWxlIChhIGNzcyBhdHRyaWJ1dGUpXHJcbiMgICAgICMuY3NzKG9iamVjdCkgLSBzZXQgc3R5bGVzIChtdWx0aXBsZSBjc3MgYXR0cmlidXRlKVxyXG4jICAgICAuaGFzQ2xhc3MoY2xhc3NOYW1lKSAtIGRldGVjdCB3aGV0aGVyIGEgY2xhc3MgZXhpc3RzXHJcbiMgICAgIC5hZGRDbGFzcyhjbGFzc05hbWUpIC0gYWRkIGEgY2xhc3NcclxuIyAgICAgLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSkgLSByZW1vdmUgYSBjbGFzc1xyXG4jICAgICAudG9nZ2xlQ2xhc3MoY2xhc3NOYW1lKSAtIHRvZ2dsZSBhIGNsYXNzXHJcbiMgICAgIC5hdHRyKG5hbWUsIHZhbHVlKSAtIHNldCBhbiBhdHRyaWJ1dGVcclxuIyAgICAgLmhhc0F0dHIobmFtZSkgLSBkZXRlY3Qgd2hldGhlciBhbiBhdHRyaWJ1dGUgZXhpc3RzXHJcbiMgICAgIC5yZW1vdmVBdHRyKG5hbWUpIC0gcmVtb3ZlIGFuIGF0dHJpYnV0ZVxyXG4jICAgTm90ZXM6XHJcbiMgICAgICAgICMgaXMgcGxhbm5lZCBidXQgbm90IGltcGxlbWVudGVkXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oKGdsb2JhbCkgLT5cclxuXHJcblx0IyBzZWxlY3RvclxyXG5cdGdsb2JhbC4kID0gKHNlbGVjdG9yKSAtPlxyXG5cdFx0c2VsZWN0aW9ucyA9IFtdXHJcblx0XHRpZiB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZydcclxuXHRcdFx0c2VsZWN0aW9ucyA9IFtdLnNsaWNlLmNhbGwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCBzZWxlY3RvclxyXG5cdFx0ZWxzZSBpZiBzZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XHJcblx0XHRcdHNlbGVjdGlvbnMucHVzaCBzZWxlY3RvclxyXG5cdFx0alF1ZXJ5LmFwcGx5IHNlbGVjdGlvbnNcclxuXHRcdHNlbGVjdGlvbnNcclxuXHJcblx0alF1ZXJ5ID0gLT5cclxuXHJcblx0XHQjIGV2ZW50XHJcblx0XHRAb24gPSAodHlwZSwgY2FsbGJhY2spID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2tcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBvZmYgPSAodHlwZSwgY2FsbGJhY2spID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2tcclxuXHRcdFx0QFxyXG5cclxuXHRcdCMgRE9NIE1hbmlwdWxhdGlvblxyXG5cclxuXHRcdFNWR19UQUdTID0gJ3N2ZyBsaW5lIHJlY3QgY2lyY2xlIGVsbGlwc2UgcG9seWxpbmUgcG9seWdvbiBwYXRoIHRleHQnXHJcblxyXG5cdFx0QGFwcGVuZCA9ICh0YWcpID0+XHJcblx0XHRcdEBlYWNoIChkb20sIGkpID0+XHJcblx0XHRcdFx0dGFnSW5kZXggPSBTVkdfVEFHUy5pbmRleE9mIHRhZy50b0xvd2VyQ2FzZSgpXHJcblx0XHRcdFx0aWYgdGFnSW5kZXggPiAtMVxyXG5cdFx0XHRcdFx0bmV3RG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG5ld0RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgdGFnXHJcblx0XHRcdFx0QFtpXSA9IGRvbS5hcHBlbmRDaGlsZCBuZXdEb21cclxuXHRcdFx0QFxyXG5cclxuXHRcdEB0ZXh0ID0gKHN0cikgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20udGV4dENvbnRlbnQgPSBzdHJcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBodG1sID0gKHN0cikgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20uaW5uZXJIVE1MID0gc3RyXHJcblx0XHRcdEBcclxuXHJcblx0XHRAd2lkdGggPSAodykgPT5cclxuXHRcdFx0aWYgdz9cclxuXHRcdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdFx0ZG9tLnN0eWxlLndpZHRoID0gdyArICdweCdcclxuXHRcdFx0XHRAXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwYXJzZUZsb2F0IGdldENvbXB1dGVkU3R5bGUoQFswXSkud2lkdGhcclxuXHJcblx0XHRAaGVpZ2h0ID0gKGgpID0+XHJcblx0XHRcdGlmIGg/XHJcblx0XHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRcdGRvbS5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4J1xyXG5cdFx0XHRcdEBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBhcnNlRmxvYXQgZ2V0Q29tcHV0ZWRTdHlsZShAWzBdKS5oZWlnaHRcclxuXHJcblxyXG5cdFx0QHN0eWxlID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdHN0eWxlVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUgJ3N0eWxlJ1xyXG5cdFx0XHRcdHN0eWxlcyA9IHt9XHJcblx0XHRcdFx0aWYgc3R5bGVUZXh0XHJcblx0XHRcdFx0XHRzdHlsZVRleHQuc3BsaXQoJzsnKS5lYWNoIChuKSAtPlxyXG5cdFx0XHRcdFx0XHRudiA9IG4uc3BsaXQgJzonXHJcblx0XHRcdFx0XHRcdHN0eWxlc1tudlswXV0gPSBudlsxXVxyXG5cdFx0XHRcdHN0eWxlc1tuYW1lXSA9IHZhbHVlXHJcblx0XHRcdFx0IyBjb25jYXRcclxuXHRcdFx0XHRzdHlsZVRleHQgPSAnJ1xyXG5cdFx0XHRcdGZvciBpIG9mIHN0eWxlc1xyXG5cdFx0XHRcdFx0c3R5bGVUZXh0ICs9IGkgKyAnOiAnICsgc3R5bGVzW2ldICsgJzsgJ1xyXG5cdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ3N0eWxlJywgc3R5bGVUZXh0XHJcblx0XHRcdEBcclxuXHJcblx0XHRAaGFzQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdCMgaWYgbXVsdGlwbGUsIGV2ZXJ5IERPTSBzaG91bGQgaGF2ZSB0aGUgY2xhc3NcclxuXHRcdFx0aSA9IDBcclxuXHRcdFx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdFx0XHRjbGFzc1RleHQgPSBAW2ldLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0IyBub3QgdXNlICcgJyB0byBhdm9pZCBtdWx0aXBsZSBzcGFjZXMgbGlrZSAnYSAgIGInXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmICFjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGFkZENsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIG5vdCBjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0QFxyXG5cclxuXHRcdEByZW1vdmVDbGFzcyA9IChuYW1lKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGNsYXNzVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5jb250YWlucyBuYW1lXHJcblx0XHRcdFx0XHRjbGFzc2VzLnJlbW92ZSBuYW1lXHJcblx0XHRcdFx0XHRpZiBjbGFzc2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZSAnY2xhc3MnLCBjbGFzc2VzLmpvaW4gJyAnXHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgJ2NsYXNzJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHRvZ2dsZUNsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIGNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5yZW1vdmUgbmFtZVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5sZW5ndGggPiAwXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlICdjbGFzcydcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBhdHRyID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRpZiB2YWx1ZT9cclxuXHRcdFx0XHRAZWFjaCAoZG9tKSAtPiBkb20uc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXHJcblx0XHRcdFx0cmV0dXJuIEBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHJldHVybiBAWzBdLmdldEF0dHJpYnV0ZSBuYW1lXHJcblxyXG5cdFx0QGhhc0F0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdGkgPSAwXHJcblx0XHRcdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRcdFx0aWYgbm90IEBbaV0uaGFzQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHJlbW92ZUF0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0QFxyXG5cclxuXHRcdEB2YWwgPSA9PiBAWzBdPy52YWx1ZVxyXG5cclxuXHQjICQucmVhZHkoKVxyXG5cdGdsb2JhbC4kLnJlYWR5ID0gKG9uTG9hZCkgLT5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbkxvYWRcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjICQuYWpheCgpXHJcblx0I1x0b3B0aW9uczpcclxuXHQjXHRcdHVybDogc3RyaW5nXHJcblx0I1x0XHQ9PT09XHJcblx0I1x0XHRhc3luYyA9IHRydWU6IGJvb2xcclxuXHQjXHRkYXRhOiBvYmplY3QgLSBxdWVyeSBwYXJhbWV0ZXJzIFRPRE86IGltcGxlbWVudCB0aGlzXHJcblx0I1x0XHRtZXRob2QgPSBHRVQ6IFBPU1QsIFBVVCwgREVMRVRFLCBIRUFEXHJcblx0I1x0XHR1c2VybmFtZTogc3RyaW5nXHJcblx0I1x0XHRwYXNzd29yZDogc3RyaW5nXHJcblx0I1x0XHRzdWNjZXNzOiBmdW5jdGlvblxyXG5cdCNcdFx0ZXJyb3I6IGZ1bmN0aW9uXHJcblx0I1x0XHRjb21wbGV0ZTogZnVuY3Rpb25cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRnbG9iYWwuJC5hamF4ID0gKHVybCwgb3BzKSAtPlxyXG5cdFx0aWYgIW9wc1xyXG5cdFx0XHRpZiB0eXBlb2YgdXJsID09ICdvYmplY3QnXHJcblx0XHRcdFx0b3BzID0gdXJsXHJcblx0XHRcdFx0dXJsID0gb3BzLnVybFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0b3BzID0ge31cclxuXHRcdG9wcy5tZXRob2Qgb3I9ICdHRVQnXHJcblx0XHRvcHMuYXN5bmMgPSB0cnVlIHVubGVzcyBvcHMuYXN5bmM/XHJcblxyXG5cdFx0eGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0XHJcblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuXHRcdFx0aWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxyXG5cdFx0XHRcdGlmIHhoci5zdGF0dXMgPT0gMjAwXHJcblx0XHRcdFx0XHRvcHMuc3VjY2VzcyB4aHIucmVzcG9uc2VUZXh0LCB4aHIuc3RhdHVzLCB4aHIgaWYgb3BzLnN1Y2Nlc3M/XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0b3BzLmVycm9yIHhociwgeGhyLnN0YXR1cyBpZiBvcHMuZXJyb3I/XHJcblx0XHRcdFx0XHRvcHMuY29tcGxldGUgeGhyLCB4aHIuc3RhdHVzIGlmIG9wcy5jb21wbGV0ZT9cclxuXHJcblx0XHR4aHIub3BlbiBvcHMubWV0aG9kLCB1cmwsIG9wcy5hc3luYywgb3BzLnVzZXJuYW1lLCBvcHMucGFzc3dvcmRcclxuXHRcdHhoci5zZW5kIG51bGwpIEJ1Lmdsb2JhbFxyXG4iLCIjIEJhc2UgY2xhc3Mgb2YgYWxsIHNoYXBlcyBhbmQgb3RoZXIgcmVuZGVyYWJsZSBvYmplY3RzXHJcblxyXG5jbGFzcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEJ1LlN0eWxlZC5hcHBseSBAXHJcblx0XHRCdS5FdmVudC5hcHBseSBAXHJcblxyXG5cdFx0QHZpc2libGUgPSB5ZXNcclxuXHRcdEBvcGFjaXR5ID0gMVxyXG5cclxuXHRcdEBwb3NpdGlvbiA9IG5ldyBCdS5WZWN0b3JcclxuXHRcdEByb3RhdGlvbiA9IDBcclxuXHRcdEBfc2NhbGUgPSBuZXcgQnUuVmVjdG9yIDEsIDFcclxuXHRcdEBza2V3ID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdCNAdG9Xb3JsZE1hdHJpeCA9IG5ldyBCdS5NYXRyaXgoKVxyXG5cdFx0I0B1cGRhdGVNYXRyaXggLT5cclxuXHJcblx0XHQjIGdlb21ldHJ5IHJlbGF0ZWRcclxuXHRcdEBib3VuZHMgPSBudWxsICMgdXNlZCB0byBhY2NlbGVyYXRlIHRoZSBoaXQgdGVzdGluZ1xyXG5cdFx0QGtleVBvaW50cyA9IG51bGxcclxuXHJcblx0XHQjIGhpZXJhcmNoeVxyXG5cdFx0QGNoaWxkcmVuID0gW11cclxuXHRcdEBwYXJlbnQgPSBudWxsXHJcblxyXG5cdEBwcm9wZXJ0eSAnc2NhbGUnLFxyXG5cdFx0Z2V0OiAtPiBAX3NjYWxlXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdGlmIEJ1LmlzTnVtYmVyIHZhbFxyXG5cdFx0XHRcdEBfc2NhbGUueCA9IEBfc2NhbGUueSA9IHZhbFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QF9zY2FsZSA9IHZhbFxyXG5cclxuXHQjIFRyYW5zbGF0ZSBhbiBvYmplY3RcclxuXHR0cmFuc2xhdGU6IChkeCwgZHkpIC0+XHJcblx0XHRAcG9zaXRpb24ueCArPSBkeFxyXG5cdFx0QHBvc2l0aW9uLnkgKz0gZHlcclxuXHRcdEBcclxuXHJcblx0IyBSb3RhdGUgYW4gb2JqZWN0XHJcblx0cm90YXRlOiAoZGEpIC0+XHJcblx0XHRAcm90YXRpb24gKz0gZGFcclxuXHRcdEBcclxuXHJcblx0IyBTY2FsZSBhbiBvYmplY3QgYnlcclxuXHRzY2FsZUJ5OiAoZHMpIC0+XHJcblx0XHRAc2NhbGUgKj0gZHNcclxuXHRcdEBcclxuXHJcblx0IyBTY2FsZSBhbiBvYmplY3QgdG9cclxuXHRzY2FsZVRvOiAocykgLT5cclxuXHRcdEBzY2FsZSA9IHNcclxuXHRcdEBcclxuXHJcblx0IyBHZXQgdGhlIHJvb3Qgbm9kZSBvZiB0aGUgc2NlbmUgdHJlZVxyXG5cdGdldFNjZW5lOiAtPlxyXG5cdFx0bm9kZSA9IEBcclxuXHRcdGxvb3BcclxuXHRcdFx0YnJlYWsgaWYgbm9kZSBpbnN0YW5jZW9mIEJ1LlNjZW5lXHJcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudFxyXG5cdFx0bm9kZVxyXG5cclxuXHQjIEFkZCBvYmplY3QocykgdG8gY2hpbGRyZW5cclxuXHRhZGRDaGlsZDogKHNoYXBlKSAtPlxyXG5cdFx0aWYgQnUuaXNBcnJheSBzaGFwZVxyXG5cdFx0XHRmb3IgcyBpbiBzaGFwZVxyXG5cdFx0XHRcdEBjaGlsZHJlbi5wdXNoIHNcclxuXHRcdFx0XHRzLnBhcmVudCA9IEBcclxuXHRcdGVsc2VcclxuXHRcdFx0QGNoaWxkcmVuLnB1c2ggc2hhcGVcclxuXHRcdFx0c2hhcGUucGFyZW50ID0gQFxyXG5cdFx0QFxyXG5cclxuXHQjIFJlbW92ZSBvYmplY3QgZnJvbSBjaGlsZHJlblxyXG5cdHJlbW92ZUNoaWxkOiAoc2hhcGUpIC0+XHJcblx0XHRpbmRleCA9IEBjaGlsZHJlbi5pbmRleE9mIHNoYXBlXHJcblx0XHRAY2hpbGRyZW4uc3BsaWNlIGluZGV4LCAxIGlmIGluZGV4ID4gLTFcclxuXHRcdEBcclxuXHJcblx0IyBBcHBseSBhbiBhbmltYXRpb24gb24gdGhpcyBvYmplY3RcclxuXHQjIFRoZSB0eXBlIG9mIGBhbmltYCBtYXkgYmU6XHJcblx0IyAgICAgMS4gUHJlc2V0IGFuaW1hdGlvbnM6IHRoZSBhbmltYXRpb24gbmFtZShzdHJpbmcgdHlwZSksIGllLiBrZXkgaW4gYEJ1LmFuaW1hdGlvbnNgXHJcblx0IyAgICAgMi4gQ3VzdG9tIGFuaW1hdGlvbnM6IHRoZSBhbmltYXRpb24gb2JqZWN0IG9mIGBCdS5BbmltYXRpb25gIHR5cGVcclxuXHQjICAgICAzLiBNdWx0aXBsZSBhbmltYXRpb25zOiBBbiBhcnJheSB3aG9zZSBjaGlsZHJlbiBhcmUgYWJvdmUgdHdvIHR5cGVzXHJcblx0YW5pbWF0ZTogKGFuaW0sIGFyZ3MpIC0+XHJcblx0XHRhcmdzID0gW2FyZ3NdIHVubGVzcyBCdS5pc0FycmF5IGFyZ3NcclxuXHRcdGlmIEJ1LmlzU3RyaW5nIGFuaW1cclxuXHRcdFx0aWYgYW5pbSBvZiBCdS5hbmltYXRpb25zXHJcblx0XHRcdFx0QnUuYW5pbWF0aW9uc1thbmltXS5hcHBseVRvIEAsIGFyZ3NcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybiBcIkJ1LmFuaW1hdGlvbnNbXFxcIiN7IGFuaW0gfVxcXCJdIGRvZXNuJ3QgZXhpc3RzLlwiXHJcblx0XHRlbHNlIGlmIEJ1LmlzQXJyYXkgYW5pbVxyXG5cdFx0XHRAYW5pbWF0ZSBhbmltW2ldLCBhcmdzIGZvciBvd24gaSBvZiBhbmltXHJcblx0XHRlbHNlXHJcblx0XHRcdGFuaW0uYXBwbHlUbyBALCBhcmdzXHJcblx0XHRAXHJcblxyXG5cdCMgQ3JlYXRlIEJvdW5kcyBmb3IgdGhpcyBvYmplY3RcclxuXHRjcmVhdGVCb3VuZHM6IC0+XHJcblx0XHRAYm91bmRzID0gbmV3IEJ1LkJvdW5kcyBAXHJcblx0XHRAXHJcblxyXG5cdCMgSGl0IHRlc3Rpbmcgd2l0aCB1bnByb2plY3Rpb25zXHJcblx0aGl0VGVzdDogKHYpIC0+XHJcblx0XHRyZW5kZXJlciA9IEBnZXRTY2VuZSgpLnJlbmRlcmVyXHJcblx0XHR2Lm9mZnNldCgtcmVuZGVyZXIud2lkdGggLyAyLCAtcmVuZGVyZXIuaGVpZ2h0IC8gMikgaWYgcmVuZGVyZXIub3JpZ2luQXRDZW50ZXJcclxuXHRcdHYucHJvamVjdCByZW5kZXJlci5jYW1lcmFcclxuXHRcdHYudW5Qcm9qZWN0IEBcclxuXHRcdEBjb250YWluc1BvaW50IHZcclxuXHJcblx0IyBIaXQgdGVzdGluZyBpbiB0aGUgc2FtZSBjb29yZGluYXRlXHJcblx0Y29udGFpbnNQb2ludDogKHApIC0+XHJcblx0XHRpZiBAYm91bmRzPyBhbmQgbm90IEBib3VuZHMuY29udGFpbnNQb2ludCBwXHJcblx0XHRcdHJldHVybiBub1xyXG5cdFx0ZWxzZSBpZiBAX2NvbnRhaW5zUG9pbnRcclxuXHRcdFx0cmV0dXJuIEBfY29udGFpbnNQb2ludCBwXHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBub1xyXG4iLCIjIEFkZCBjb2xvciB0byB0aGUgc2hhcGVzXHJcbiMgVGhpcyBvYmplY3QgaXMgZGVkaWNhdGVkIHRvIG1peGVkLWluIHRoZSBPYmplY3QyRC5cclxuXHJcbkJ1LlN0eWxlZCA9ICgpIC0+XHJcblx0QHN0cm9rZVN0eWxlID0gQnUuU3R5bGVkLkRFRkFVTFRfU1RST0tFX1NUWUxFXHJcblx0QGZpbGxTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRAZGFzaFN0eWxlID0gZmFsc2VcclxuXHRAZGFzaEZsb3dTcGVlZCA9IDBcclxuXHRAbGluZVdpZHRoID0gMVxyXG5cclxuXHRAZGFzaE9mZnNldCA9IDBcclxuXHJcblx0IyBTZXQvY29weSBzdHlsZSBmcm9tIG90aGVyIHN0eWxlXHJcblx0QHN0eWxlID0gKHN0eWxlKSAtPlxyXG5cdFx0aWYgQnUuaXNTdHJpbmcgc3R5bGVcclxuXHRcdFx0c3R5bGUgPSBCdS5zdHlsZXNbc3R5bGVdXHJcblx0XHRcdGlmIG5vdCBzdHlsZT9cclxuXHRcdFx0XHRzdHlsZSA9IEJ1LnN0eWxlcy5kZWZhdWx0XHJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiQnUuU3R5bGVkOiBCdS5zdHlsZXMuI3sgc3R5bGUgfSBkb2Vzbid0IGV4aXN0cywgZmVsbCBiYWNrIHRvIGRlZmF1bHQuXCJcclxuXHRcdGVsc2UgaWYgbm90IHN0eWxlP1xyXG5cdFx0XHRzdHlsZSA9IEJ1LnN0eWxlc1snZGVmYXVsdCddXHJcblxyXG5cdFx0Zm9yIGsgaW4gWydzdHJva2VTdHlsZScsICdmaWxsU3R5bGUnLCAnZGFzaFN0eWxlJywgJ2Rhc2hGbG93U3BlZWQnLCAnbGluZVdpZHRoJ11cclxuXHRcdFx0QFtrXSA9IHN0eWxlW2tdXHJcblx0XHRAXHJcblxyXG5cdCMgU2V0IHRoZSBzdHJva2Ugc3R5bGVcclxuXHRAc3Ryb2tlID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSB1bmxlc3Mgdj9cclxuXHRcdHYgPSBCdS5zdHlsZXNbdl0uc3Ryb2tlU3R5bGUgaWYgQnUuc3R5bGVzPyBhbmQgdiBvZiBCdS5zdHlsZXNcclxuXHRcdHN3aXRjaCB2XHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBzdHJva2VTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX1NUUk9LRV9TVFlMRVxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQHN0cm9rZVN0eWxlID0gbnVsbFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QHN0cm9rZVN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgZmlsbCBzdHlsZVxyXG5cdEBmaWxsID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSB1bmxlc3Mgdj9cclxuXHRcdHYgPSBCdS5zdHlsZXNbdl0uZmlsbFN0eWxlIGlmIEJ1LnN0eWxlcz8gYW5kIHYgb2YgQnUuc3R5bGVzXHJcblx0XHRzd2l0Y2ggdlxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQGZpbGxTdHlsZSA9IG51bGxcclxuXHRcdFx0d2hlbiB0cnVlIHRoZW4gQGZpbGxTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBmaWxsU3R5bGUgPSB2XHJcblx0XHRAXHJcblxyXG5cdCMgU2V0IHRoZSBkYXNoIHN0eWxlXHJcblx0QGRhc2ggPSAodikgLT5cclxuXHRcdHYgPSB0cnVlIHVubGVzcyB2P1xyXG5cdFx0diA9IEJ1LnN0eWxlc1t2XS5kYXNoU3R5bGUgaWYgQnUuc3R5bGVzPyBhbmQgdiBvZiBCdS5zdHlsZXNcclxuXHRcdHYgPSBbdiwgdl0gaWYgQnUuaXNOdW1iZXIgdlxyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBkYXNoU3R5bGUgPSBudWxsXHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBkYXNoU3R5bGUgPSBCdS5TdHlsZWQuREVGQVVMVF9EQVNIX1NUWUxFXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAZGFzaFN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgZGFzaCBmbG93aW5nIHNwZWVkXHJcblx0QGRhc2hGbG93ID0gKHNwZWVkKSAtPlxyXG5cdFx0c3BlZWQgPSAxIGlmIHNwZWVkID09IHRydWUgb3Igbm90IHNwZWVkP1xyXG5cdFx0c3BlZWQgPSAwIGlmIHNwZWVkID09IGZhbHNlXHJcblx0XHRCdS5kYXNoRmxvd01hbmFnZXIuc2V0U3BlZWQgQCwgc3BlZWRcclxuXHRcdEBcclxuXHJcblx0IyBTZXQgdGhlIGxpbmVXaWR0aFxyXG5cdEBzZXRMaW5lV2lkdGggPSAodykgLT5cclxuXHRcdEBsaW5lV2lkdGggPSB3XHJcblx0XHRAXHJcblxyXG5cdEBcclxuXHJcbkJ1LlN0eWxlZC5ERUZBVUxUX1NUUk9LRV9TVFlMRSA9ICcjMDQ4J1xyXG5CdS5TdHlsZWQuREVGQVVMVF9GSUxMX1NUWUxFID0gJ3JnYmEoNjQsIDEyOCwgMTkyLCAwLjUpJ1xyXG5CdS5TdHlsZWQuREVGQVVMVF9EQVNIX1NUWUxFID0gWzgsIDRdXHJcblxyXG5CdS5zdHlsZXMgPVxyXG5cdGRlZmF1bHQ6IG5ldyBCdS5TdHlsZWQoKS5zdHJva2UoKS5maWxsKClcclxuXHRob3ZlcjogbmV3IEJ1LlN0eWxlZCgpLnN0cm9rZSgnaHNsYSgwLCAxMDAlLCA0MCUsIDAuNzUpJykuZmlsbCgnaHNsYSgwLCAxMDAlLCA3NSUsIDAuNSknKVxyXG5cdHRleHQ6IG5ldyBCdS5TdHlsZWQoKS5zdHJva2UoZmFsc2UpLmZpbGwoJ2JsYWNrJylcclxuXHRsaW5lOiBuZXcgQnUuU3R5bGVkKCkuZmlsbChmYWxzZSlcclxuXHRzZWxlY3RlZDogbmV3IEJ1LlN0eWxlZCgpLnNldExpbmVXaWR0aCgzKVxyXG5cdGRhc2g6IG5ldyBCdS5TdHlsZWQoKS5kYXNoKClcclxuIiwiIyBEZWNsYXJhdGl2ZSBmcmFtZXdvcmsgZm9yIEJ1LmpzIGFwcHNcclxuXHJcbiMjIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IyNcclxuQWxsIHN1cHBvcnRlZCBjb25zdHJ1Y3RvciBvcHRpb25zOlxyXG4oVGhlIGFwcGVhcmFuY2Ugc2VxdWVuY2UgaXMgdGhlIHByb2Nlc3Mgc2VxdWVuY2UuKVxyXG57XHJcbiAgICByZW5kZXJlcjogIyBzZXR0aW5ncyB0byB0aGUgcmVuZGVyZXJcclxuICAgIFx0Y29udGFpbmVyOiAnI2NvbnRhaW5lcicgIyBjc3Mgc2VsZWN0b3Igb2YgdGhlIGNvbnRhaW5lciBkb20gb3IgaXRzZWxmXHJcbiAgICAgICAgY3Vyc29yOiAnY3Jvc3NoYW5kJyAjIHRoZSBkZWZhdWx0IGN1cnNvciBzdHlsZSBvbiB0aGUgPGNhbnZhcz5cclxuICAgICAgICBiYWNrZ3JvdW5kOiAncGluaycgIyB0aGUgZGVmYXVsdCBiYWNrZ3JvdW5kIG9mIHRoZSA8Y2FudmFzPlxyXG4gICAgXHRzaG93S2V5UG9pbnRzOiB0cnVlICMgd2hldGhlciB0byBzaG93IHRoZSBrZXkgcG9pbnRzIG9mIHNoYXBlcyAoaWYgdGhleSBoYXZlKS5cclxuICAgIGRhdGE6IHsgdmFyIH0gIyB2YXJpYWJsZXMgb2YgdGhpcyBCdS5qcyBhcHAsIHdpbGwgYmUgY29waWVkIHRvIHRoZSBhcHAgb2JqZWN0XHJcbiAgICBtZXRob2RzOiB7IGZ1bmN0aW9uIH0jIGZ1bmN0aW9ucyBvZiB0aGlzIEJ1LmpzIGFwcCwgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIGFwcCBvYmplY3RcclxuICAgIG9iamVjdHM6IHt9IG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7fSAjIGFsbCB0aGUgcmVuZGVyYWJsZSBvYmplY3RzXHJcblx0aGllcmFyY2h5OiAjIGFuIHRyZWUgdGhhdCByZXByZXNlbnQgdGhlIG9iamVjdCBoaWVyYXJjaHkgb2YgdGhlIHNjZW5lLCB0aGUga2V5cyBhcmUgaW4gYG9iamVjdHNgXHJcbiAgICBldmVudHM6ICMgZXZlbnQgbGlzdGVuZXJzLCAnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJyB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgYm91bmQgdG8gPGNhbnZhcz5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICMgY2FsbGVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICMgY2FsbGVkIGV2ZXJ5IGZyYW1lXHJcbn1cclxuIyM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSMjI1xyXG5cclxuY2xhc3MgQnUuQXBwXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQCRvcHRpb25zID0ge30pIC0+XHJcblx0XHRmb3IgayBpbiBbXCJyZW5kZXJlclwiLCBcImRhdGFcIiwgXCJvYmplY3RzXCIsIFwiaGllcmFyY2h5XCIsIFwibWV0aG9kc1wiLCBcImV2ZW50c1wiXVxyXG5cdFx0XHRAJG9wdGlvbnNba10gb3I9IHt9XHJcblxyXG5cdFx0QCRvYmplY3RzID0ge31cclxuXHRcdEAkaW5wdXRNYW5hZ2VyID0gbmV3IEJ1LklucHV0TWFuYWdlclxyXG5cclxuXHRcdEJ1LnJlYWR5IEBpbml0LCBAXHJcblxyXG5cdGluaXQ6ICgpIC0+XHJcblx0XHQjIHJlbmRlcmVyXHJcblx0XHRAJHJlbmRlcmVyID0gbmV3IEJ1LlJlbmRlcmVyIEAkb3B0aW9ucy5yZW5kZXJlclxyXG5cclxuXHRcdCMgZGF0YVxyXG5cdFx0aWYgQnUuaXNGdW5jdGlvbiBAJG9wdGlvbnMuZGF0YVxyXG5cdFx0XHRAJG9wdGlvbnMuZGF0YSA9IEAkb3B0aW9ucy5kYXRhLmFwcGx5IHRoaXNcclxuXHRcdEBba10gPSBAJG9wdGlvbnMuZGF0YVtrXSBmb3IgayBvZiBAJG9wdGlvbnMuZGF0YVxyXG5cclxuXHRcdCMgbWV0aG9kc1xyXG5cdFx0QFtrXSA9IEAkb3B0aW9ucy5tZXRob2RzW2tdIGZvciBrIG9mIEAkb3B0aW9ucy5tZXRob2RzXHJcblxyXG5cdFx0IyBvYmplY3RzXHJcblx0XHRpZiBCdS5pc0Z1bmN0aW9uIEAkb3B0aW9ucy5vYmplY3RzXHJcblx0XHRcdEAkb2JqZWN0cyA9IEAkb3B0aW9ucy5vYmplY3RzLmFwcGx5IHRoaXNcclxuXHRcdGVsc2VcclxuXHRcdFx0QCRvYmplY3RzW25hbWVdID0gQCRvcHRpb25zLm9iamVjdHNbbmFtZV0gZm9yIG5hbWUgb2YgQCRvcHRpb25zLm9iamVjdHNcclxuXHJcblx0XHQjIGhpZXJhcmNoeVxyXG5cdFx0IyBUT0RPIHVzZSBhbiBhbGdvcml0aG0gdG8gYXZvaWQgY2lyY3VsYXIgc3RydWN0dXJlXHJcblx0XHRhc3NlbWJsZU9iamVjdHMgPSAoY2hpbGRyZW4sIHBhcmVudCkgPT5cclxuXHRcdFx0Zm9yIG93biBuYW1lIG9mIGNoaWxkcmVuXHJcblx0XHRcdFx0cGFyZW50LmFkZENoaWxkIEAkb2JqZWN0c1tuYW1lXVxyXG5cdFx0XHRcdGFzc2VtYmxlT2JqZWN0cyBjaGlsZHJlbltuYW1lXSwgQCRvYmplY3RzW25hbWVdXHJcblx0XHRhc3NlbWJsZU9iamVjdHMgQCRvcHRpb25zLmhpZXJhcmNoeSwgQCRyZW5kZXJlci5zY2VuZVxyXG5cclxuXHRcdCMgaW5pdFxyXG5cdFx0QCRvcHRpb25zLmluaXQ/LmNhbGwgQFxyXG5cclxuXHRcdCMgZXZlbnRzXHJcblx0XHRAJGlucHV0TWFuYWdlci5oYW5kbGVBcHBFdmVudHMgQCwgQCRvcHRpb25zLmV2ZW50c1xyXG5cclxuXHRcdCMgdXBkYXRlXHJcblx0XHRpZiBAJG9wdGlvbnMudXBkYXRlP1xyXG5cdFx0XHRAJHJlbmRlcmVyLm9uICd1cGRhdGUnLCA9PiBAJG9wdGlvbnMudXBkYXRlLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xyXG4iLCIjIEF1ZGlvXHJcblxyXG5jbGFzcyBCdS5BdWRpb1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHVybCkgLT5cclxuXHRcdEBhdWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2F1ZGlvJ1xyXG5cdFx0QHVybCA9ICcnXHJcblx0XHRAcmVhZHkgPSBub1xyXG5cclxuXHRcdEBsb2FkIHVybCBpZiB1cmxcclxuXHJcblx0bG9hZDogKHVybCkgLT5cclxuXHRcdEB1cmwgPSB1cmxcclxuXHRcdEBhdWRpby5hZGRFdmVudExpc3RlbmVyICdjYW5wbGF5JywgPT5cclxuXHRcdFx0QHJlYWR5ID0geWVzXHJcblx0XHRAYXVkaW8uc3JjID0gdXJsXHJcblxyXG5cdHBsYXk6IC0+XHJcblx0XHRpZiBAcmVhZHlcclxuXHRcdFx0QGF1ZGlvLnBsYXkoKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRjb25zb2xlLndhcm4gXCJUaGUgYXVkaW8gZmlsZSAjeyBAdXJsIH0gaGFzbid0IGJlZW4gcmVhZHkuXCJcclxuIiwiIyBDYW1lcmE6IGNoYW5nZSB0aGUgdmlldyByYW5nZSBhdCB0aGUgc2NlbmVcclxuXHJcbmNsYXNzIEJ1LkNhbWVyYSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnQ2FtZXJhJ1xyXG5cclxuIiwiIyBVc2VkIHRvIHJlbmRlciBhbGwgdGhlIGRyYXdhYmxlIG9iamVjdHMgdG8gdGhlIGNhbnZhc1xyXG5cclxuY2xhc3MgQnUuUmVuZGVyZXJcclxuXHJcblx0Y29uc3RydWN0b3I6ICgpIC0+XHJcblx0XHRCdS5FdmVudC5hcHBseSBAXHJcblx0XHRAdHlwZSA9ICdSZW5kZXJlcidcclxuXHJcblx0XHQjIEFQSVxyXG5cdFx0QHNjZW5lID0gbmV3IEJ1LlNjZW5lIEBcclxuXHRcdEBjYW1lcmEgPSBuZXcgQnUuQ2FtZXJhXHJcblx0XHRAdGlja0NvdW50ID0gMFxyXG5cdFx0QGlzUnVubmluZyA9IHllc1xyXG5cdFx0QHBpeGVsUmF0aW8gPSBCdS5nbG9iYWwuZGV2aWNlUGl4ZWxSYXRpbyBvciAxXHJcblx0XHRAY2xpcE1ldGVyID0gbmV3IENsaXBNZXRlcigpIGlmIENsaXBNZXRlcj9cclxuXHJcblx0XHQjIFJlY2VpdmUgb3B0aW9uc1xyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0Y29udGFpbmVyOiAnYm9keSdcclxuXHRcdFx0YmFja2dyb3VuZDogJyNlZWUnXHJcblx0XHRcdGZwczogNjBcclxuXHRcdFx0c2hvd0tleVBvaW50czogbm9cclxuXHRcdFx0c2hvd0JvdW5kczogbm9cclxuXHRcdFx0b3JpZ2luQXRDZW50ZXI6IG5vXHJcblx0XHRcdGltYWdlU21vb3RoaW5nOiB5ZXNcclxuXHJcblx0XHQjIENvcHkgb3B0aW9uc1xyXG5cdFx0Zm9yIG5hbWUgaW4gWydjb250YWluZXInLCAnYmFja2dyb3VuZCcsICd3aWR0aCcsICdoZWlnaHQnLCAnZnBzJywgJ3Nob3dLZXlQb2ludHMnLCAnc2hvd0JvdW5kcycsICdvcmlnaW5BdENlbnRlciddXHJcblx0XHRcdEBbbmFtZV0gPSBvcHRpb25zW25hbWVdXHJcblxyXG5cdFx0IyBJZiBvcHRpb25zLndpZHRoIGlzIG5vdCBnaXZlbiwgdGhlbiBmaWxsUGFyZW50IGlzIHRydWVcclxuXHRcdEBmaWxsUGFyZW50ID0gbm90IEJ1LmlzTnVtYmVyIG9wdGlvbnMud2lkdGhcclxuXHJcblx0XHQjIENvbnZlcnQgd2lkdGggYW5kIGhlaWdodCBmcm9tIGRpcChkZXZpY2UgaW5kZXBlbmRlbnQgcGl4ZWxzKSB0byBwaHlzaWNhbCBwaXhlbHNcclxuXHRcdEB3aWR0aCAqPSBAcGl4ZWxSYXRpb1xyXG5cdFx0QGhlaWdodCAqPSBAcGl4ZWxSYXRpb1xyXG5cclxuXHRcdCMgU2V0IGNhbnZhcyBkb21cclxuXHRcdEBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0XHRAZG9tLnN0eWxlLmN1cnNvciA9IG9wdGlvbnMuY3Vyc29yIG9yICdkZWZhdWx0J1xyXG5cdFx0QGRvbS5zdHlsZS5ib3hTaXppbmcgPSAnY29udGVudC1ib3gnXHJcblx0XHRAZG9tLnN0eWxlLmJhY2tncm91bmQgPSBAYmFja2dyb3VuZFxyXG5cdFx0QGRvbS5vbmNvbnRleHRtZW51ID0gLT4gZmFsc2VcclxuXHJcblx0XHQjIFNldCBjb250ZXh0XHJcblx0XHRAY29udGV4dCA9IEBkb20uZ2V0Q29udGV4dCAnMmQnXHJcblx0XHRAY29udGV4dC50ZXh0QmFzZWxpbmUgPSAndG9wJ1xyXG5cdFx0QGNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gb3B0aW9ucy5pbWFnZVNtb290aGluZ1xyXG5cclxuXHRcdCMgU2V0IGNvbnRhaW5lciBkb21cclxuXHRcdEBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIEBjb250YWluZXIgaWYgQnUuaXNTdHJpbmcgQGNvbnRhaW5lclxyXG5cdFx0aWYgQGZpbGxQYXJlbnQgYW5kIEBjb250YWluZXIgPT0gZG9jdW1lbnQuYm9keVxyXG5cdFx0XHQkKCdib2R5Jykuc3R5bGUoJ21hcmdpbicsIDApLnN0eWxlKCdvdmVyZmxvdycsICdoaWRkZW4nKVxyXG5cdFx0XHQkKCdodG1sLCBib2R5Jykuc3R5bGUoJ3dpZHRoJywgJzEwMCUnKS5zdHlsZSgnaGVpZ2h0JywgJzEwMCUnKVxyXG5cclxuXHRcdCMgU2V0IHNpemVzIGZvciByZW5kZXJlciBwcm9wZXJ0eSwgZG9tIGF0dHJpYnV0ZSBhbmQgZG9tIHN0eWxlXHJcblx0XHRvblJlc2l6ZSA9ID0+XHJcblx0XHRcdGNhbnZhc1JhdGlvID0gQGRvbS5oZWlnaHQgLyBAZG9tLndpZHRoXHJcblx0XHRcdGNvbnRhaW5lclJhdGlvID0gQGNvbnRhaW5lci5jbGllbnRIZWlnaHQgLyBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdGlmIGNvbnRhaW5lclJhdGlvIDwgY2FudmFzUmF0aW9cclxuXHRcdFx0XHRoZWlnaHQgPSBAY29udGFpbmVyLmNsaWVudEhlaWdodFxyXG5cdFx0XHRcdHdpZHRoID0gaGVpZ2h0IC8gY29udGFpbmVyUmF0aW9cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHdpZHRoID0gQGNvbnRhaW5lci5jbGllbnRXaWR0aFxyXG5cdFx0XHRcdGhlaWdodCA9IHdpZHRoICogY29udGFpbmVyUmF0aW9cclxuXHRcdFx0QHdpZHRoID0gQGRvbS53aWR0aCA9IHdpZHRoICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGhlaWdodCA9IEBkb20uaGVpZ2h0ID0gaGVpZ2h0ICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGRvbS5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcclxuXHRcdFx0QHJlbmRlcigpXHJcblxyXG5cdFx0aWYgbm90IEBmaWxsUGFyZW50XHJcblx0XHRcdEBkb20uc3R5bGUud2lkdGggPSAoQHdpZHRoIC8gQHBpeGVsUmF0aW8pICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IChAaGVpZ2h0IC8gQHBpeGVsUmF0aW8pICsgJ3B4J1xyXG5cdFx0XHRAZG9tLndpZHRoID0gQHdpZHRoXHJcblx0XHRcdEBkb20uaGVpZ2h0ID0gQGhlaWdodFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAd2lkdGggPSBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdEBoZWlnaHQgPSBAY29udGFpbmVyLmNsaWVudEhlaWdodFxyXG5cdFx0XHRCdS5nbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIG9uUmVzaXplXHJcblx0XHRcdEBkb20uYWRkRXZlbnRMaXN0ZW5lciAnRE9NTm9kZUluc2VydGVkJywgb25SZXNpemVcclxuXHJcblx0XHQjIFJ1biB0aGUgbG9vcFxyXG5cdFx0dGljayA9ID0+XHJcblx0XHRcdGlmIEBpc1J1bm5pbmdcclxuXHRcdFx0XHRAY2xpcE1ldGVyLnN0YXJ0KCkgaWYgQGNsaXBNZXRlcj9cclxuXHRcdFx0XHRAcmVuZGVyKClcclxuXHRcdFx0XHRAdHJpZ2dlciAndXBkYXRlJywgQFxyXG5cdFx0XHRcdEB0aWNrQ291bnQgKz0gMVxyXG5cdFx0XHRcdEBjbGlwTWV0ZXIudGljaygpIGlmIEBjbGlwTWV0ZXI/XHJcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSB0aWNrXHJcblx0XHR0aWNrKClcclxuXHJcblx0XHQjIEFwcGVuZCA8Y2FudmFzPiBkb20gaW50byB0aGUgY29udGFpbmVyXHJcblx0XHRhcHBlbmREb20gPSA9PlxyXG5cdFx0XHRAY29udGFpbmVyLmFwcGVuZENoaWxkIEBkb21cclxuXHRcdHNldFRpbWVvdXQgYXBwZW5kRG9tLCAxXHJcblxyXG5cdFx0IyBIb29rIHVwIHdpdGggcnVubmluZyBjb21wb25lbnRzXHJcblx0XHRCdS5hbmltYXRpb25SdW5uZXIuaG9va1VwIEBcclxuXHRcdEJ1LmRhc2hGbG93TWFuYWdlci5ob29rVXAgQFxyXG5cclxuXHJcblx0IyBQYXVzZS9jb250aW51ZS90b2dnbGUgdGhlIHJlbmRlcmluZyBsb29wXHJcblx0cGF1c2U6IC0+IEBpc1J1bm5pbmcgPSBmYWxzZVxyXG5cdGNvbnRpbnVlOiAtPiBAaXNSdW5uaW5nID0gdHJ1ZVxyXG5cdHRvZ2dsZTogLT4gQGlzUnVubmluZyA9IG5vdCBAaXNSdW5uaW5nXHJcblxyXG5cclxuXHQjIFBlcmZvcm0gdGhlIGZ1bGwgcmVuZGVyIHByb2Nlc3NcclxuXHRyZW5kZXI6IC0+XHJcblx0XHRAY29udGV4dC5zYXZlKClcclxuXHJcblx0XHQjIENsZWFyIHRoZSBjYW52YXNcclxuXHRcdEBjbGVhckNhbnZhcygpXHJcblxyXG5cdFx0IyBNb3ZlIGNlbnRlciBmcm9tIGxlZnQtdG9wIGNvcm5lciB0byBzY3JlZW4gY2VudGVyXHJcblx0XHRAY29udGV4dC50cmFuc2xhdGUgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIgaWYgQG9yaWdpbkF0Q2VudGVyXHJcblxyXG5cdFx0IyBab29tIHRoZSBjYW52YXMgd2l0aCBkZXZpY2VQaXhlbFJhdGlvIHRvIHN1cHBvcnQgaGlnaCBkZWZpbml0aW9uIHNjcmVlblxyXG5cdFx0QGNvbnRleHQuc2NhbGUgQHBpeGVsUmF0aW8sIEBwaXhlbFJhdGlvXHJcblxyXG5cdFx0IyBUcmFuc2Zvcm0gdGhlIGNhbWVyYVxyXG5cdFx0QGNvbnRleHQuc2NhbGUgMSAvIEBjYW1lcmEuc2NhbGUueCwgMSAvIEBjYW1lcmEuc2NhbGUueVxyXG5cdFx0QGNvbnRleHQucm90YXRlIC1AY2FtZXJhLnJvdGF0aW9uXHJcblx0XHRAY29udGV4dC50cmFuc2xhdGUgLUBjYW1lcmEucG9zaXRpb24ueCwgLUBjYW1lcmEucG9zaXRpb24ueVxyXG5cclxuXHRcdCMgRHJhdyB0aGUgc2NlbmUgdHJlZVxyXG5cdFx0QGRyYXdTaGFwZSBAc2NlbmVcclxuXHRcdEBjb250ZXh0LnJlc3RvcmUoKVxyXG5cdFx0QFxyXG5cclxuXHQjIENsZWFyIHRoZSBjYW52YXNcclxuXHRjbGVhckNhbnZhczogLT5cclxuXHRcdEBjb250ZXh0LmNsZWFyUmVjdCAwLCAwLCBAd2lkdGgsIEBoZWlnaHRcclxuXHRcdEBcclxuXHJcblx0IyBEcmF3IGFuIGFycmF5IG9mIGRyYXdhYmxlc1xyXG5cdGRyYXdTaGFwZXM6IChzaGFwZXMpID0+XHJcblx0XHRpZiBzaGFwZXM/XHJcblx0XHRcdGZvciBzaGFwZSBpbiBzaGFwZXNcclxuXHRcdFx0XHRAY29udGV4dC5zYXZlKClcclxuXHRcdFx0XHRAZHJhd1NoYXBlIHNoYXBlXHJcblx0XHRcdFx0QGNvbnRleHQucmVzdG9yZSgpXHJcblx0XHRAXHJcblxyXG5cdCMgRHJhdyBhbiBkcmF3YWJsZSB0byB0aGUgY2FudmFzXHJcblx0ZHJhd1NoYXBlOiAoc2hhcGUpID0+XHJcblx0XHRyZXR1cm4gQCB1bmxlc3Mgc2hhcGUudmlzaWJsZVxyXG5cclxuXHRcdEBjb250ZXh0LnRyYW5zbGF0ZSBzaGFwZS5wb3NpdGlvbi54LCBzaGFwZS5wb3NpdGlvbi55XHJcblx0XHRAY29udGV4dC5yb3RhdGUgc2hhcGUucm90YXRpb25cclxuXHRcdHN4ID0gc2hhcGUuc2NhbGUueFxyXG5cdFx0c3kgPSBzaGFwZS5zY2FsZS55XHJcblx0XHRpZiBzeCAvIHN5ID4gMTAwIG9yIHN4IC8gc3kgPCAwLjAxXHJcblx0XHRcdHN4ID0gMCBpZiBNYXRoLmFicyhzeCkgPCAwLjAyXHJcblx0XHRcdHN5ID0gMCBpZiBNYXRoLmFicyhzeSkgPCAwLjAyXHJcblx0XHRAY29udGV4dC5zY2FsZSBzeCwgc3lcclxuXHJcblx0XHRAY29udGV4dC5nbG9iYWxBbHBoYSAqPSBzaGFwZS5vcGFjaXR5XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzaGFwZS5zdHJva2VTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5saW5lV2lkdGggPSBzaGFwZS5saW5lV2lkdGhcclxuXHRcdFx0QGNvbnRleHQubGluZUNhcCA9IHNoYXBlLmxpbmVDYXAgaWYgc2hhcGUubGluZUNhcD9cclxuXHRcdFx0QGNvbnRleHQubGluZUpvaW4gPSBzaGFwZS5saW5lSm9pbiBpZiBzaGFwZS5saW5lSm9pbj9cclxuXHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cclxuXHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdHdoZW4gJ1BvaW50JyB0aGVuIEBkcmF3UG9pbnQgc2hhcGVcclxuXHRcdFx0d2hlbiAnTGluZScgdGhlbiBAZHJhd0xpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEBkcmF3Q2lyY2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0VsbGlwc2UnIHRoZW4gQGRyYXdFbGxpcHNlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ1RyaWFuZ2xlJyB0aGVuIEBkcmF3VHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUmVjdGFuZ2xlJyB0aGVuIEBkcmF3UmVjdGFuZ2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAZHJhd0ZhbiBzaGFwZVxyXG5cdFx0XHR3aGVuICdCb3cnIHRoZW4gQGRyYXdCb3cgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAZHJhd1BvbHlnb24gc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnIHRoZW4gQGRyYXdQb2x5bGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdTcGxpbmUnIHRoZW4gQGRyYXdTcGxpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9pbnRUZXh0JyB0aGVuIEBkcmF3UG9pbnRUZXh0IHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ltYWdlJyB0aGVuIEBkcmF3SW1hZ2Ugc2hhcGVcclxuXHRcdFx0d2hlbiAnT2JqZWN0MkQnLCAnU2NlbmUnICMgdGhlbiBkbyBub3RoaW5nXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLmxvZyAnZHJhd1NoYXBlcygpOiB1bmtub3duIHNoYXBlOiAnLCBzaGFwZS50eXBlLCBzaGFwZVxyXG5cclxuXHJcblx0XHRpZiBzaGFwZS5maWxsU3R5bGU/IGFuZCBzaGFwZS5maWxsYWJsZVxyXG5cdFx0XHRAY29udGV4dC5maWxsU3R5bGUgPSBzaGFwZS5maWxsU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuZmlsbCgpXHJcblxyXG5cdFx0aWYgc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRcdEBjb250ZXh0LmxpbmVEYXNoT2Zmc2V0ID0gc2hhcGUuZGFzaE9mZnNldFxyXG5cdFx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblx0XHRcdEBjb250ZXh0LnNldExpbmVEYXNoIFtdXHJcblx0XHRlbHNlIGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRAY29udGV4dC5zdHJva2UoKVxyXG5cclxuXHRcdEBkcmF3U2hhcGVzIHNoYXBlLmNoaWxkcmVuIGlmIHNoYXBlLmNoaWxkcmVuP1xyXG5cdFx0QGRyYXdTaGFwZXMgc2hhcGUua2V5UG9pbnRzIGlmIEBzaG93S2V5UG9pbnRzXHJcblx0XHRAZHJhd0JvdW5kcyBzaGFwZS5ib3VuZHMgaWYgQHNob3dCb3VuZHMgYW5kIHNoYXBlLmJvdW5kcz9cclxuXHRcdEBcclxuXHJcblxyXG5cclxuXHRkcmF3UG9pbnQ6IChzaGFwZSkgLT5cclxuXHRcdEBjb250ZXh0LmFyYyBzaGFwZS54LCBzaGFwZS55LCBCdS5QT0lOVF9SRU5ERVJfU0laRSwgMCwgQnUuVFdPX1BJXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3TGluZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0NpcmNsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCAwLCBCdS5UV09fUElcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdFbGxpcHNlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5lbGxpcHNlIDAsIDAsIHNoYXBlLnJhZGl1c1gsIHNoYXBlLnJhZGl1c1ksIDAsIEJ1LlRXT19QSSwgbm9cclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdUcmlhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1syXS54LCBzaGFwZS5wb2ludHNbMl0ueVxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdSZWN0YW5nbGU6IChzaGFwZSkgLT5cclxuXHRcdHJldHVybiBAZHJhd1JvdW5kUmVjdGFuZ2xlIHNoYXBlIGlmIHNoYXBlLmNvcm5lclJhZGl1cyAhPSAwXHJcblx0XHRAY29udGV4dC5yZWN0IHNoYXBlLnBvaW50TFQueCwgc2hhcGUucG9pbnRMVC55LCBzaGFwZS5zaXplLndpZHRoLCBzaGFwZS5zaXplLmhlaWdodFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1JvdW5kUmVjdGFuZ2xlOiAoc2hhcGUpIC0+XHJcblx0XHR4MSA9IHNoYXBlLnBvaW50TFQueFxyXG5cdFx0eDIgPSBzaGFwZS5wb2ludFJCLnhcclxuXHRcdHkxID0gc2hhcGUucG9pbnRMVC55XHJcblx0XHR5MiA9IHNoYXBlLnBvaW50UkIueVxyXG5cdFx0ciA9IHNoYXBlLmNvcm5lclJhZGl1c1xyXG5cclxuXHRcdEBjb250ZXh0Lm1vdmVUbyB4MSwgeTEgKyByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTEsIHgxICsgciwgeTEsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiAtIHIsIHkxXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTEsIHgyLCB5MSArIHIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiwgeTIgLSByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTIsIHgyIC0gciwgeTIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MSArIHIsIHkyXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTIsIHgxLCB5MiAtIHIsIHJcclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblxyXG5cdFx0QGNvbnRleHQuc2V0TGluZURhc2g/IHNoYXBlLmRhc2hTdHlsZSBpZiBzaGFwZS5zdHJva2VTdHlsZT8gYW5kIHNoYXBlLmRhc2hTdHlsZVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ZhbjogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUuY3gsIHNoYXBlLmN5XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0JvdzogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvbHlnb246IChzaGFwZSkgLT5cclxuXHRcdGZvciBwb2ludCBpbiBzaGFwZS52ZXJ0aWNlc1xyXG5cdFx0XHRAY29udGV4dC5saW5lVG8gcG9pbnQueCwgcG9pbnQueVxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdQb2x5bGluZTogKHNoYXBlKSAtPlxyXG5cdFx0Zm9yIHBvaW50IGluIHNoYXBlLnZlcnRpY2VzXHJcblx0XHRcdEBjb250ZXh0LmxpbmVUbyBwb2ludC54LCBwb2ludC55XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3U3BsaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0bGVuID0gc2hhcGUudmVydGljZXMubGVuZ3RoXHJcblx0XHRcdGlmIGxlbiA9PSAyXHJcblx0XHRcdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnZlcnRpY2VzWzBdLngsIHNoYXBlLnZlcnRpY2VzWzBdLnlcclxuXHRcdFx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUudmVydGljZXNbMV0ueCwgc2hhcGUudmVydGljZXNbMV0ueVxyXG5cdFx0XHRlbHNlIGlmIGxlbiA+IDJcclxuXHRcdFx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUudmVydGljZXNbMF0ueCwgc2hhcGUudmVydGljZXNbMF0ueVxyXG5cdFx0XHRcdGZvciBpIGluIFsxLi5sZW4gLSAxXVxyXG5cdFx0XHRcdFx0QGNvbnRleHQuYmV6aWVyQ3VydmVUbyhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQmVoaW5kW2kgLSAxXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0JlaGluZFtpIC0gMV0ueVxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLmNvbnRyb2xQb2ludHNBaGVhZFtpXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0FoZWFkW2ldLnlcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUudmVydGljZXNbaV0ueVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvaW50VGV4dDogKHNoYXBlKSAtPlxyXG5cdFx0Zm9udCA9IHNoYXBlLmZvbnQgb3IgQnUuREVGQVVMVF9GT05UXHJcblxyXG5cdFx0aWYgQnUuaXNTdHJpbmcgZm9udFxyXG5cdFx0XHRAY29udGV4dC50ZXh0QWxpZ24gPSBzaGFwZS50ZXh0QWxpZ25cclxuXHRcdFx0QGNvbnRleHQudGV4dEJhc2VsaW5lID0gc2hhcGUudGV4dEJhc2VsaW5lXHJcblx0XHRcdEBjb250ZXh0LmZvbnQgPSBmb250XHJcblxyXG5cdFx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0XHRAY29udGV4dC5zdHJva2VUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdFx0aWYgc2hhcGUuZmlsbFN0eWxlP1xyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxTdHlsZSA9IHNoYXBlLmZpbGxTdHlsZVxyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdGVsc2UgaWYgZm9udCBpbnN0YW5jZW9mIEJ1LlNwcml0ZVNoZWV0IGFuZCBmb250LnJlYWR5XHJcblx0XHRcdHRleHRXaWR0aCA9IGZvbnQubWVhc3VyZVRleHRXaWR0aCBzaGFwZS50ZXh0XHJcblx0XHRcdHhPZmZzZXQgPSBzd2l0Y2ggc2hhcGUudGV4dEFsaWduXHJcblx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnY2VudGVyJyB0aGVuIC10ZXh0V2lkdGggLyAyXHJcblx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gLXRleHRXaWR0aFxyXG5cdFx0XHR5T2Zmc2V0ID0gc3dpdGNoIHNoYXBlLnRleHRCYXNlbGluZVxyXG5cdFx0XHRcdHdoZW4gJ3RvcCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnbWlkZGxlJyB0aGVuIC1mb250LmhlaWdodCAvIDJcclxuXHRcdFx0XHR3aGVuICdib3R0b20nIHRoZW4gLWZvbnQuaGVpZ2h0XHJcblx0XHRcdGZvciBpIGluIFswLi4uc2hhcGUudGV4dC5sZW5ndGhdXHJcblx0XHRcdFx0Y2hhciA9IHNoYXBlLnRleHRbaV1cclxuXHRcdFx0XHRjaGFyQml0bWFwID0gZm9udC5nZXRGcmFtZUltYWdlIGNoYXJcclxuXHRcdFx0XHRpZiBjaGFyQml0bWFwP1xyXG5cdFx0XHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIGNoYXJCaXRtYXAsIHNoYXBlLnggKyB4T2Zmc2V0LCBzaGFwZS55ICsgeU9mZnNldFxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSBjaGFyQml0bWFwLndpZHRoXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSAxMFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ltYWdlOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5yZWFkeVxyXG5cdFx0XHR3ID0gc2hhcGUuc2l6ZS53aWR0aFxyXG5cdFx0XHRoID0gc2hhcGUuc2l6ZS5oZWlnaHRcclxuXHRcdFx0ZHggPSAtdyAqIHNoYXBlLnBpdm90LnhcclxuXHRcdFx0ZHkgPSAtaCAqIHNoYXBlLnBpdm90LnlcclxuXHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIHNoYXBlLmltYWdlLCBkeCwgZHksIHcsIGhcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdCb3VuZHM6IChib3VuZHMpIC0+XHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBCdS5SZW5kZXJlci5CT1VORFNfU1RST0tFX1NUWUxFXHJcblx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gQnUuUmVuZGVyZXIuQk9VTkRTX0RBU0hfU1RZTEVcclxuXHRcdEBjb250ZXh0LnJlY3QgYm91bmRzLngxLCBib3VuZHMueTEsIGJvdW5kcy54MiAtIGJvdW5kcy54MSwgYm91bmRzLnkyIC0gYm91bmRzLnkxXHJcblx0XHRAY29udGV4dC5zdHJva2UoKVxyXG5cdFx0QFxyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBTdGF0aWMgbWVtYmVyc1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBTdHJva2Ugc3R5bGUgb2YgYm91bmRzXHJcbkJ1LlJlbmRlcmVyLkJPVU5EU19TVFJPS0VfU1RZTEUgPSAncmVkJ1xyXG5cclxuIyBEYXNoIHN0eWxlIG9mIGJvdW5kc1xyXG5CdS5SZW5kZXJlci5CT1VORFNfREFTSF9TVFlMRSA9IFs2LCA2XVxyXG4iLCIjIFNjZW5lIGlzIHRoZSByb290IG9mIHRoZSBvYmplY3QgdHJlZVxyXG5cclxuY2xhc3MgQnUuU2NlbmUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEByZW5kZXJlcikgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1NjZW5lJ1xyXG4iLCIjIEJvdyBzaGFwZVxyXG5cclxuY2xhc3MgQnUuQm93IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ0JvdydcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUbykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRbQGFGcm9tLCBAYVRvXSA9IFtAYVRvLCBAYUZyb21dIGlmIEBhRnJvbSA+IEBhVG9cclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nID0gbmV3IEJ1LkxpbmUgQGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYUZyb20pLCBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhVG8pXHJcblx0XHRAa2V5UG9pbnRzID0gQHN0cmluZy5wb2ludHNcclxuXHJcblx0XHRAdXBkYXRlS2V5UG9pbnRzKClcclxuXHRcdEBvbiAnY2hhbmdlZCcsIEB1cGRhdGVLZXlQb2ludHNcclxuXHRcdEBvbiAnY2hhbmdlZCcsID0+IEAuYm91bmRzPy51cGRhdGUoKVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LkJvdyBAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvXHJcblxyXG5cdHVwZGF0ZUtleVBvaW50czogLT5cclxuXHRcdEBjZW50ZXIuc2V0IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nLnBvaW50c1swXS5jb3B5IEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFGcm9tXHJcblx0XHRAc3RyaW5nLnBvaW50c1sxXS5jb3B5IEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFUb1xyXG5cdFx0QGtleVBvaW50cyA9IEBzdHJpbmcucG9pbnRzXHJcblx0XHRAXHJcbiIsIiMgQ2lyY2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5DaXJjbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnQ2lyY2xlJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAX3JhZGl1cyA9IDEsIGN4ID0gMCwgY3kgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEBfY2VudGVyID0gbmV3IEJ1LlBvaW50KGN4LCBjeSlcclxuXHRcdEBib3VuZHMgPSBudWxsICMgZm9yIGFjY2VsZXJhdGUgY29udGFpbiB0ZXN0XHJcblxyXG5cdFx0QGtleVBvaW50cyA9IFtAX2NlbnRlcl1cclxuXHRcdEBvbiAnY2VudGVyQ2hhbmdlZCcsIEB1cGRhdGVLZXlQb2ludHNcclxuXHJcblx0Y2xvbmU6ICgpIC0+IG5ldyBCdS5DaXJjbGUgQHJhZGl1cywgQGN4LCBAY3lcclxuXHJcblx0dXBkYXRlS2V5UG9pbnRzOiAtPlxyXG5cdFx0QGtleVBvaW50c1swXS5zZXQgQGN4LCBAY3lcclxuXHJcblx0IyBwcm9wZXJ0eVxyXG5cclxuXHRAcHJvcGVydHkgJ2N4JyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXIueFxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2NlbnRlci54ID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjZW50ZXJDaGFuZ2VkJywgQFxyXG5cclxuXHRAcHJvcGVydHkgJ2N5JyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXIueVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2NlbnRlci55ID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjZW50ZXJDaGFuZ2VkJywgQFxyXG5cclxuXHRAcHJvcGVydHkgJ2NlbnRlcicsXHJcblx0XHRnZXQ6IC0+IEBfY2VudGVyXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyID0gdmFsXHJcblx0XHRcdEBjeCA9IHZhbC54XHJcblx0XHRcdEBjeSA9IHZhbC55XHJcblx0XHRcdEBrZXlQb2ludHNbMF0gPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAncmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9yYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9yYWRpdXMgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ3JhZGl1c0NoYW5nZWQnLCBAXHJcblx0XHRcdEBcclxuIiwiIyBFbGxpcHNlL092YWwgU2hhcGVcclxuXHJcbmNsYXNzIEJ1LkVsbGlwc2UgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnRWxsaXBzZSdcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQF9yYWRpdXNYID0gMjAsIEBfcmFkaXVzWSA9IDEwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHQjIHByb3BlcnR5XHJcblxyXG5cdEBwcm9wZXJ0eSAncmFkaXVzWCcsXHJcblx0XHRnZXQ6IC0+IEBfcmFkaXVzWFxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1c1ggPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NoYW5nZWQnLCBAXHJcblxyXG5cclxuXHRAcHJvcGVydHkgJ3JhZGl1c1knLFxyXG5cdFx0Z2V0OiAtPiBAX3JhZGl1c1lcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9yYWRpdXNZID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjaGFuZ2VkJywgQFxyXG4iLCIjIEZhbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuRmFuIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ0ZhbidcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUbykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRbQGFGcm9tLCBAYVRvXSA9IFtAYVRvLCBAYUZyb21dIGlmIEBhRnJvbSA+IEBhVG9cclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nID0gbmV3IEJ1LkxpbmUgQGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYUZyb20pLCBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhVG8pXHJcblxyXG5cdFx0QGtleVBvaW50cyA9IFtcclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMF1cclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMV1cclxuXHRcdFx0QGNlbnRlclxyXG5cdFx0XVxyXG5cdFx0QG9uICdjaGFuZ2VkJywgQHVwZGF0ZUtleVBvaW50c1xyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuRmFuIEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuXHJcblx0dXBkYXRlS2V5UG9pbnRzOiAtPlxyXG5cdFx0QGNlbnRlci5zZXQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcucG9pbnRzWzBdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYUZyb21cclxuXHRcdEBzdHJpbmcucG9pbnRzWzFdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYVRvXHJcblx0XHRAXHJcbiIsIiMgbGluZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuTGluZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdMaW5lJ1xyXG5cdGZpbGxhYmxlOiBub1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHAxLCBwMiwgcDMsIHA0KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPCAyXHJcblx0XHRcdEBwb2ludHMgPSBbbmV3IEJ1LlBvaW50KCksIG5ldyBCdS5Qb2ludCgpXVxyXG5cdFx0ZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoIDwgNFxyXG5cdFx0XHRAcG9pbnRzID0gW3AxLmNsb25lKCksIHAyLmNsb25lKCldXHJcblx0XHRlbHNlICAjIGxlbiA+PSA0XHJcblx0XHRcdEBwb2ludHMgPSBbbmV3IEJ1LlBvaW50KHAxLCBwMiksIG5ldyBCdS5Qb2ludChwMywgcDQpXVxyXG5cclxuXHRcdEBsZW5ndGggPSAwXHJcblx0XHRAbWlkcG9pbnQgPSBuZXcgQnUuUG9pbnQoKVxyXG5cdFx0QGtleVBvaW50cyA9IEBwb2ludHNcclxuXHJcblx0XHRAb24gXCJjaGFuZ2VkXCIsID0+XHJcblx0XHRcdEBsZW5ndGggPSBAcG9pbnRzWzBdLmRpc3RhbmNlVG8oQHBvaW50c1sxXSlcclxuXHRcdFx0QG1pZHBvaW50LnNldCgoQHBvaW50c1swXS54ICsgQHBvaW50c1sxXS54KSAvIDIsIChAcG9pbnRzWzBdLnkgKyBAcG9pbnRzWzFdLnkpIC8gMilcclxuXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LkxpbmUgQHBvaW50c1swXSwgQHBvaW50c1sxXVxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0c2V0OiAoYTEsIGEyLCBhMywgYTQpIC0+XHJcblx0XHRpZiBwND9cclxuXHRcdFx0QHBvaW50c1swXS5zZXQgYTEsIGEyXHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGEzLCBhNFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzBdID0gYTFcclxuXHRcdFx0QHBvaW50c1sxXSA9IGEyXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG5cclxuXHRzZXRQb2ludDE6IChhMSwgYTIpIC0+XHJcblx0XHRpZiBhMj9cclxuXHRcdFx0QHBvaW50c1swXS5zZXQgYTEsIGEyXHJcblx0XHRlbHNlXHJcblx0XHRcdEBwb2ludHNbMF0uY29weSBhMVxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHRcdEBcclxuXHJcblx0c2V0UG9pbnQyOiAoYTEsIGEyKSAtPlxyXG5cdFx0aWYgYTI/XHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGExLCBhMlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzFdLmNvcHkgYTFcclxuXHRcdEB0cmlnZ2VyIFwiY2hhbmdlZFwiXHJcblx0XHRAXHJcbiIsIiMgcG9pbnQgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlBvaW50IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1BvaW50J1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAeCA9IDAsIEB5ID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAbGluZVdpZHRoID0gMC41XHJcblx0XHRAX2xhYmVsSW5kZXggPSAtMVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvaW50IEB4LCBAeVxyXG5cclxuXHRAcHJvcGVydHkgJ2xhYmVsJyxcclxuXHRcdGdldDogLT4gaWYgQF9sYWJlbEluZGV4ID4gLTEgdGhlbiBAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0IGVsc2UgJydcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0aWYgQF9sYWJlbEluZGV4ID09IC0xXHJcblx0XHRcdFx0cG9pbnRUZXh0ID0gbmV3IEJ1LlBvaW50VGV4dCB2YWwsIEB4ICsgQnUuUE9JTlRfTEFCRUxfT0ZGU0VULCBAeSwge2FsaWduOiAnKzAnfVxyXG5cdFx0XHRcdEBjaGlsZHJlbi5wdXNoIHBvaW50VGV4dFxyXG5cdFx0XHRcdEBfbGFiZWxJbmRleCA9IEBjaGlsZHJlbi5sZW5ndGggLSAxXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0ID0gdmFsXHJcblxyXG5cdGFyY1RvOiAocmFkaXVzLCBhcmMpIC0+XHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IEB4ICsgTWF0aC5jb3MoYXJjKSAqIHJhZGl1cywgQHkgKyBNYXRoLnNpbihhcmMpICogcmFkaXVzXHJcblxyXG5cclxuXHQjIGNvcHkgdmFsdWUgZnJvbSBvdGhlciBsaW5lXHJcblx0Y29weTogKHBvaW50KSAtPlxyXG5cdFx0QHggPSBwb2ludC54XHJcblx0XHRAeSA9IHBvaW50LnlcclxuXHRcdEB1cGRhdGVMYWJlbCgpXHJcblxyXG5cdCMgc2V0IHZhbHVlIGZyb20geCwgeVxyXG5cdHNldDogKHgsIHkpIC0+XHJcblx0XHRAeCA9IHhcclxuXHRcdEB5ID0geVxyXG5cdFx0QHVwZGF0ZUxhYmVsKClcclxuXHJcblx0dXBkYXRlTGFiZWw6IC0+XHJcblx0XHRpZiBAX2xhYmVsSW5kZXggPiAtMVxyXG5cdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS54ID0gQHggKyBCdS5QT0lOVF9MQUJFTF9PRkZTRVRcclxuXHRcdFx0QGNoaWxkcmVuW0BfbGFiZWxJbmRleF0ueSA9IEB5XHJcbiIsIiMgcG9seWdvbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUG9seWdvbiBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdQb2x5Z29uJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0IyMjXHJcbiAgICBjb25zdHJ1Y3RvcnNcclxuICAgIDEuIFBvbHlnb24ocG9pbnRzKVxyXG4gICAgMi4gUG9seWdvbih4LCB5LCByYWRpdXMsIG4sIG9wdGlvbnMpOiB0byBnZW5lcmF0ZSByZWd1bGFyIHBvbHlnb25cclxuICAgIFx0b3B0aW9uczogYW5nbGUgLSBzdGFydCBhbmdsZSBvZiByZWd1bGFyIHBvbHlnb25cclxuXHQjIyNcclxuXHRjb25zdHJ1Y3RvcjogKHBvaW50cykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAdmVydGljZXMgPSBbXVxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEB0cmlhbmdsZXMgPSBbXVxyXG5cclxuXHRcdG9wdGlvbnMgPSBCdS5jb21iaW5lT3B0aW9ucyBhcmd1bWVudHMsXHJcblx0XHRcdGFuZ2xlOiAwXHJcblxyXG5cdFx0aWYgQnUuaXNBcnJheSBwb2ludHNcclxuXHRcdFx0QHZlcnRpY2VzID0gcG9pbnRzIGlmIHBvaW50cz9cclxuXHRcdGVsc2VcclxuXHRcdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA8IDRcclxuXHRcdFx0XHR4ID0gMFxyXG5cdFx0XHRcdHkgPSAwXHJcblx0XHRcdFx0cmFkaXVzID0gYXJndW1lbnRzWzBdXHJcblx0XHRcdFx0biA9IGFyZ3VtZW50c1sxXVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0eCA9IGFyZ3VtZW50c1swXVxyXG5cdFx0XHRcdHkgPSBhcmd1bWVudHNbMV1cclxuXHRcdFx0XHRyYWRpdXMgPSBhcmd1bWVudHNbMl1cclxuXHRcdFx0XHRuID0gYXJndW1lbnRzWzNdXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IEJ1LlBvbHlnb24uZ2VuZXJhdGVSZWd1bGFyUG9pbnRzIHgsIHksIHJhZGl1cywgbiwgb3B0aW9uc1xyXG5cclxuXHRcdEBvblZlcnRpY2VzQ2hhbmdlZCgpXHJcblx0XHRAb24gJ2NoYW5nZWQnLCBAb25WZXJ0aWNlc0NoYW5nZWRcclxuXHRcdEBvbiAnY2hhbmdlZCcsID0+IEAuYm91bmRzPy51cGRhdGUoKVxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvbHlnb24gQHZlcnRpY2VzXHJcblxyXG5cdG9uVmVydGljZXNDaGFuZ2VkOiAtPlxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEB0cmlhbmdsZXMgPSBbXVxyXG5cdFx0IyBpbml0IGxpbmVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdKSlcclxuXHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAxXSwgQHZlcnRpY2VzWzBdKSlcclxuXHJcblx0XHQjIGluaXQgdHJpYW5nbGVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMlxyXG5cdFx0XHRmb3IgaSBpbiBbMSAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QHRyaWFuZ2xlcy5wdXNoKG5ldyBCdS5UcmlhbmdsZShAdmVydGljZXNbMF0sIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXSkpXHJcblxyXG5cdCMgZGV0ZWN0XHJcblxyXG5cdGlzU2ltcGxlOiAoKSAtPlxyXG5cdFx0bGVuID0gQGxpbmVzLmxlbmd0aFxyXG5cdFx0Zm9yIGkgaW4gWzAuLi5sZW5dXHJcblx0XHRcdGZvciBqIGluIFtpICsgMS4uLmxlbl1cclxuXHRcdFx0XHRpZiBAbGluZXNbaV0uaXNDcm9zc1dpdGhMaW5lKEBsaW5lc1tqXSlcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdGFkZFBvaW50OiAocG9pbnQsIGluc2VydEluZGV4KSAtPlxyXG5cdFx0aWYgbm90IGluc2VydEluZGV4P1xyXG5cdFx0XHQjIGFkZCBwb2ludFxyXG5cdFx0XHRAdmVydGljZXMucHVzaCBwb2ludFxyXG5cclxuXHRcdFx0IyBhZGQgbGluZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEBsaW5lc1tAbGluZXMubGVuZ3RoIC0gMV0ucG9pbnRzWzFdID0gcG9pbnRcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdLCBAdmVydGljZXNbMF0pKVxyXG5cclxuXHRcdFx0IyBhZGQgdHJpYW5nbGVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDJcclxuXHRcdFx0XHRAdHJpYW5nbGVzLnB1c2gobmV3IEJ1LlRyaWFuZ2xlKFxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbMF1cclxuXHRcdFx0XHRcdFx0QHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAyXVxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0KSlcclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgcG9pbnQpXHJcblx0IyBUT0RPIGFkZCBsaW5lcyBhbmQgdHJpYW5nbGVzXHJcblxyXG5cdEBnZW5lcmF0ZVJlZ3VsYXJQb2ludHMgPSAoY3gsIGN5LCByYWRpdXMsIG4sIG9wdGlvbnMpIC0+XHJcblx0XHRhbmdsZURlbHRhID0gb3B0aW9ucy5hbmdsZVxyXG5cdFx0ciA9IHJhZGl1c1xyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGFuZ2xlU2VjdGlvbiA9IEJ1LlRXT19QSSAvIG5cclxuXHRcdGZvciBpIGluIFswIC4uLiBuXVxyXG5cdFx0XHRhID0gaSAqIGFuZ2xlU2VjdGlvbiArIGFuZ2xlRGVsdGFcclxuXHRcdFx0eCA9IGN4ICsgciAqIE1hdGguY29zKGEpXHJcblx0XHRcdHkgPSBjeSArIHIgKiBNYXRoLnNpbihhKVxyXG5cdFx0XHRwb2ludHNbaV0gPSBuZXcgQnUuUG9pbnQgeCwgeVxyXG5cdFx0cmV0dXJuIHBvaW50c1xyXG4iLCIjIHBvbHlsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2x5bGluZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdQb2x5bGluZSdcclxuXHRmaWxsYWJsZTogbm9cclxuXHJcblx0Y29uc3RydWN0b3I6IChAdmVydGljZXMgPSBbXSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxyXG5cdFx0XHR2ZXJ0aWNlcyA9IFtdXHJcblx0XHRcdGZvciBpIGluIFswIC4uLiBhcmd1bWVudHMubGVuZ3RoIC8gMl1cclxuXHRcdFx0XHR2ZXJ0aWNlcy5wdXNoIG5ldyBCdS5Qb2ludCBhcmd1bWVudHNbaSAqIDJdLCBhcmd1bWVudHNbaSAqIDIgKyAxXVxyXG5cdFx0XHRAdmVydGljZXMgPSB2ZXJ0aWNlc1xyXG5cclxuXHRcdEBsaW5lcyA9IFtdXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblxyXG5cdFx0QGZpbGwgb2ZmXHJcblxyXG5cdFx0QG9uIFwiY2hhbmdlZFwiLCA9PlxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEB1cGRhdGVMaW5lcygpXHJcblx0XHRcdFx0QGNhbGNMZW5ndGg/KClcclxuXHRcdFx0XHRAY2FsY1BvaW50Tm9ybWFsaXplZFBvcz8oKVxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHJcblx0Y2xvbmU6IC0+XHJcblx0XHRwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZSBAdmVydGljZXNcclxuXHRcdHBvbHlsaW5lLnN0cm9rZVN0eWxlID0gQHN0cm9rZVN0eWxlXHJcblx0XHRwb2x5bGluZS5maWxsU3R5bGUgPSBAZmlsbFN0eWxlXHJcblx0XHRwb2x5bGluZS5kYXNoU3R5bGUgPSBAZGFzaFN0eWxlXHJcblx0XHRwb2x5bGluZS5saW5lV2lkdGggPSBAbGluZVdpZHRoXHJcblx0XHRwb2x5bGluZS5kYXNoT2Zmc2V0ID0gQGRhc2hPZmZzZXRcclxuXHRcdHBvbHlsaW5lXHJcblxyXG5cdHVwZGF0ZUxpbmVzOiAtPlxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEB2ZXJ0aWNlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRpZiBAbGluZXNbaV0/XHJcblx0XHRcdFx0QGxpbmVzW2ldLnNldCBAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBsaW5lc1tpXSA9IG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXVxyXG5cdFx0IyBUT0RPIHJlbW92ZSB0aGUgcmVzdFxyXG5cdFx0QFxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0c2V0ID0gKHBvaW50cykgLT5cclxuXHRcdCMgcG9pbnRzXHJcblx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aF1cclxuXHRcdFx0QHZlcnRpY2VzW2ldLmNvcHkgcG9pbnRzW2ldXHJcblxyXG5cdFx0IyByZW1vdmUgdGhlIGV4dHJhIHBvaW50c1xyXG5cdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IHBvaW50cy5sZW5ndGhcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZSBwb2ludHMubGVuZ3RoXHJcblxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHRcdEBcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCwgaW5zZXJ0SW5kZXgpIC0+XHJcblx0XHRpZiBub3QgaW5zZXJ0SW5kZXg/XHJcblx0XHRcdCMgYWRkIHBvaW50XHJcblx0XHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblx0XHRcdCMgYWRkIGxpbmVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDFcclxuXHRcdFx0XHRAbGluZXMucHVzaCBuZXcgQnUuTGluZSBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDJdLCBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRlbHNlXHJcblx0XHRcdEB2ZXJ0aWNlcy5zcGxpY2UgaW5zZXJ0SW5kZXgsIDAsIHBvaW50XHJcblx0XHQjIFRPRE8gYWRkIGxpbmVzXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG4iLCIjIHJlY3RhbmdsZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUmVjdGFuZ2xlIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1JlY3RhbmdsZSdcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgY29ybmVyUmFkaXVzID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IHggKyB3aWR0aCAvIDIsIHkgKyBoZWlnaHQgLyAyXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplIHdpZHRoLCBoZWlnaHRcclxuXHJcblx0XHRAcG9pbnRMVCA9IG5ldyBCdS5Qb2ludCB4LCB5XHJcblx0XHRAcG9pbnRSVCA9IG5ldyBCdS5Qb2ludCB4ICsgd2lkdGgsIHlcclxuXHRcdEBwb2ludFJCID0gbmV3IEJ1LlBvaW50IHggKyB3aWR0aCwgeSArIGhlaWdodFxyXG5cdFx0QHBvaW50TEIgPSBuZXcgQnUuUG9pbnQgeCwgeSArIGhlaWdodFxyXG5cclxuXHRcdEBwb2ludHMgPSBbQHBvaW50TFQsIEBwb2ludFJULCBAcG9pbnRSQiwgQHBvaW50TEJdXHJcblxyXG5cdFx0QGNvcm5lclJhZGl1cyA9IGNvcm5lclJhZGl1c1xyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblxyXG5cdEBwcm9wZXJ0eSAnY29ybmVyUmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9jb3JuZXJSYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jb3JuZXJSYWRpdXMgPSB2YWxcclxuXHRcdFx0QGtleVBvaW50cyA9IGlmIHZhbCA+IDAgdGhlbiBbXSBlbHNlIEBwb2ludHNcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5SZWN0YW5nbGUgQHBvaW50TFQueCwgQHBvaW50TFQueSwgQHNpemUud2lkdGgsIEBzaXplLmhlaWdodFxyXG5cclxuXHRzZXQ6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG5cdFx0QGNlbnRlci5zZXQgeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDJcclxuXHRcdEBzaXplLnNldCB3aWR0aCwgaGVpZ2h0XHJcblxyXG5cdFx0QHBvaW50TFQuc2V0IHgsIHlcclxuXHRcdEBwb2ludFJULnNldCB4ICsgd2lkdGgsIHlcclxuXHRcdEBwb2ludFJCLnNldCB4ICsgd2lkdGgsIHkgKyBoZWlnaHRcclxuXHRcdEBwb2ludExCLnNldCB4LCB5ICsgaGVpZ2h0XHJcbiIsIiMgc3BsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5TcGxpbmUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnU3BsaW5lJ1xyXG5cdGZpbGxhYmxlOiBub1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHZlcnRpY2VzKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdGlmIHZlcnRpY2VzIGluc3RhbmNlb2YgQnUuUG9seWxpbmVcclxuXHRcdFx0cG9seWxpbmUgPSB2ZXJ0aWNlc1xyXG5cdFx0XHRAdmVydGljZXMgPSBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0XHRwb2x5bGluZS5vbiAncG9pbnRDaGFuZ2UnLCAocG9seWxpbmUpID0+XHJcblx0XHRcdFx0QHZlcnRpY2VzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblx0XHRlbHNlXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IEJ1LmNsb25lIHZlcnRpY2VzXHJcblxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cdFx0QGNvbnRyb2xQb2ludHNBaGVhZCA9IFtdXHJcblx0XHRAY29udHJvbFBvaW50c0JlaGluZCA9IFtdXHJcblxyXG5cdFx0QGZpbGwgb2ZmXHJcblx0XHRAc21vb3RoRmFjdG9yID0gQnUuREVGQVVMVF9TUExJTkVfU01PT1RIXHJcblx0XHRAX3Ntb290aGVyID0gbm9cclxuXHJcblx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnc21vb3RoZXInLFxyXG5cdFx0Z2V0OiAtPiBAX3Ntb290aGVyXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdG9sZFZhbCA9IEBfc21vb3RoZXJcclxuXHRcdFx0QF9zbW9vdGhlciA9IHZhbFxyXG5cdFx0XHRjYWxjQ29udHJvbFBvaW50cyBAIGlmIG9sZFZhbCAhPSBAX3Ntb290aGVyXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuU3BsaW5lIEB2ZXJ0aWNlc1xyXG5cclxuXHRhZGRQb2ludDogKHBvaW50KSAtPlxyXG5cdFx0QHZlcnRpY2VzLnB1c2ggcG9pbnRcclxuXHRcdGNhbGNDb250cm9sUG9pbnRzIEBcclxuXHJcblx0Y2FsY0NvbnRyb2xQb2ludHMgPSAoc3BsaW5lKSAtPlxyXG5cdFx0c3BsaW5lLmtleVBvaW50cyA9IHNwbGluZS52ZXJ0aWNlc1xyXG5cclxuXHRcdHAgPSBzcGxpbmUudmVydGljZXNcclxuXHRcdGxlbiA9IHAubGVuZ3RoXHJcblx0XHRpZiBsZW4gPj0gMVxyXG5cdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFswXSA9IHBbMF1cclxuXHRcdGlmIGxlbiA+PSAyXHJcblx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQWhlYWRbbGVuIC0gMV0gPSBwW2xlbiAtIDFdXHJcblx0XHRpZiBsZW4gPj0gM1xyXG5cdFx0XHRmb3IgaSBpbiBbMS4uLmxlbiAtIDFdXHJcblx0XHRcdFx0dGhldGExID0gTWF0aC5hdGFuMiBwW2ldLnkgLSBwW2kgLSAxXS55LCBwW2ldLnggLSBwW2kgLSAxXS54XHJcblx0XHRcdFx0dGhldGEyID0gTWF0aC5hdGFuMiBwW2kgKyAxXS55IC0gcFtpXS55LCBwW2kgKyAxXS54IC0gcFtpXS54XHJcblx0XHRcdFx0bGVuMSA9IEJ1LmJldmVsIHBbaV0ueSAtIHBbaSAtIDFdLnksIHBbaV0ueCAtIHBbaSAtIDFdLnhcclxuXHRcdFx0XHRsZW4yID0gQnUuYmV2ZWwgcFtpXS55IC0gcFtpICsgMV0ueSwgcFtpXS54IC0gcFtpICsgMV0ueFxyXG5cdFx0XHRcdHRoZXRhID0gdGhldGExICsgKHRoZXRhMiAtIHRoZXRhMSkgKiBpZiBzcGxpbmUuX3Ntb290aGVyIHRoZW4gbGVuMSAvIChsZW4xICsgbGVuMikgZWxzZSAwLjVcclxuXHRcdFx0XHR0aGV0YSArPSBNYXRoLlBJIGlmIE1hdGguYWJzKHRoZXRhIC0gdGhldGExKSA+IEJ1LkhBTEZfUElcclxuXHRcdFx0XHR4QSA9IHBbaV0ueCAtIGxlbjEgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5jb3ModGhldGEpXHJcblx0XHRcdFx0eUEgPSBwW2ldLnkgLSBsZW4xICogc3BsaW5lLnNtb290aEZhY3RvciAqIE1hdGguc2luKHRoZXRhKVxyXG5cdFx0XHRcdHhCID0gcFtpXS54ICsgbGVuMiAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLmNvcyh0aGV0YSlcclxuXHRcdFx0XHR5QiA9IHBbaV0ueSArIGxlbjIgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5zaW4odGhldGEpXHJcblx0XHRcdFx0c3BsaW5lLmNvbnRyb2xQb2ludHNBaGVhZFtpXSA9IG5ldyBCdS5Qb2ludCB4QSwgeUFcclxuXHRcdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFtpXSA9IG5ldyBCdS5Qb2ludCB4QiwgeUJcclxuXHJcblx0XHRcdFx0IyBhZGQgY29udHJvbCBsaW5lcyBmb3IgZGVidWdnaW5nXHJcblx0XHRcdFx0I3NwbGluZS5jaGlsZHJlbltpICogMiAtIDJdID0gbmV3IEJ1LkxpbmUgc3BsaW5lLnZlcnRpY2VzW2ldLCBzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2ldXHJcblx0XHRcdFx0I3NwbGluZS5jaGlsZHJlbltpICogMiAtIDFdID0gIG5ldyBCdS5MaW5lIHNwbGluZS52ZXJ0aWNlc1tpXSwgc3BsaW5lLmNvbnRyb2xQb2ludHNCZWhpbmRbaV1cclxuIiwiIyB0cmlhbmdsZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuVHJpYW5nbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnVHJpYW5nbGUnXHJcblx0ZmlsbGFibGU6IHllc1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHAxLCBwMiwgcDMpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA9PSA2XHJcblx0XHRcdFt4MSwgeTEsIHgyLCB5MiwgeDMsIHkzXSA9IGFyZ3VtZW50c1xyXG5cdFx0XHRwMSA9IG5ldyBCdS5Qb2ludCB4MSwgeTFcclxuXHRcdFx0cDIgPSBuZXcgQnUuUG9pbnQgeDIsIHkyXHJcblx0XHRcdHAzID0gbmV3IEJ1LlBvaW50IHgzLCB5M1xyXG5cclxuXHRcdEBsaW5lcyA9IFtcclxuXHRcdFx0bmV3IEJ1LkxpbmUocDEsIHAyKVxyXG5cdFx0XHRuZXcgQnUuTGluZShwMiwgcDMpXHJcblx0XHRcdG5ldyBCdS5MaW5lKHAzLCBwMSlcclxuXHRcdF1cclxuXHRcdCNAY2VudGVyID0gbmV3IEJ1LlBvaW50IEJ1LmF2ZXJhZ2UocDEueCwgcDIueCwgcDMueCksIEJ1LmF2ZXJhZ2UocDEueSwgcDIueSwgcDMueSlcclxuXHRcdEBwb2ludHMgPSBbcDEsIHAyLCBwM11cclxuXHRcdEBrZXlQb2ludHMgPSBAcG9pbnRzXHJcblx0XHRAb24gJ2NoYW5nZWQnLCBAdXBkYXRlXHJcblx0XHRAb24gJ2NoYW5nZWQnLCA9PiBALmJvdW5kcz8udXBkYXRlKClcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5UcmlhbmdsZSBAcG9pbnRzWzBdLCBAcG9pbnRzWzFdLCBAcG9pbnRzWzJdXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdEBsaW5lc1swXS5wb2ludHNbMF0uY29weSBAcG9pbnRzWzBdXHJcblx0XHRAbGluZXNbMF0ucG9pbnRzWzFdLmNvcHkgQHBvaW50c1sxXVxyXG5cdFx0QGxpbmVzWzFdLnBvaW50c1swXS5jb3B5IEBwb2ludHNbMV1cclxuXHRcdEBsaW5lc1sxXS5wb2ludHNbMV0uY29weSBAcG9pbnRzWzJdXHJcblx0XHRAbGluZXNbMl0ucG9pbnRzWzBdLmNvcHkgQHBvaW50c1syXVxyXG5cdFx0QGxpbmVzWzJdLnBvaW50c1sxXS5jb3B5IEBwb2ludHNbMF1cclxuIiwiIyBVc2VkIHRvIHJlbmRlciBiaXRtYXAgdG8gdGhlIHNjcmVlblxyXG5cclxuY2xhc3MgQnUuSW1hZ2UgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB1cmwsIHggPSAwLCB5ID0gMCwgd2lkdGgsIGhlaWdodCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0ltYWdlJ1xyXG5cclxuXHRcdEBhdXRvU2l6ZSA9IHllc1xyXG5cdFx0QHNpemUgPSBuZXcgQnUuU2l6ZVxyXG5cdFx0QHBvc2l0aW9uID0gbmV3IEJ1LlZlY3RvciB4LCB5XHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlZlY3RvciB4ICsgd2lkdGggLyAyLCB5ICsgaGVpZ2h0IC8gMlxyXG5cdFx0aWYgd2lkdGg/XHJcblx0XHRcdEBzaXplLnNldCB3aWR0aCwgaGVpZ2h0XHJcblx0XHRcdEBhdXRvU2l6ZSA9IG5vXHJcblxyXG5cdFx0QHBpdm90ID0gbmV3IEJ1LlZlY3RvciAwLjUsIDAuNVxyXG5cclxuXHRcdEBfaW1hZ2UgPSBuZXcgQnUuZ2xvYmFsLkltYWdlXHJcblx0XHRAcmVhZHkgPSBmYWxzZVxyXG5cclxuXHRcdEBfaW1hZ2Uub25sb2FkID0gKGUpID0+XHJcblx0XHRcdGlmIEBhdXRvU2l6ZVxyXG5cdFx0XHRcdEBzaXplLnNldCBAX2ltYWdlLndpZHRoLCBAX2ltYWdlLmhlaWdodFxyXG5cdFx0XHRAcmVhZHkgPSB0cnVlXHJcblxyXG5cdFx0QF9pbWFnZS5zcmMgPSBAdXJsIGlmIEB1cmw/XHJcblxyXG5cdEBwcm9wZXJ0eSAnaW1hZ2UnLFxyXG5cdFx0Z2V0OiAtPiBAX2ltYWdlXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfaW1hZ2UgPSB2YWxcclxuXHRcdFx0QHJlYWR5ID0geWVzXHJcbiIsIiMgUmVuZGVyIHRleHQgYXJvdW5kIGEgcG9pbnRcclxuXHJcbmNsYXNzIEJ1LlBvaW50VGV4dCBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdCMjI1xyXG5cdG9wdGlvbnMuYWxpZ246XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHwgICAtLSAgICAwLSAgICArLSAgIHxcclxuXHR8ICAgICAgICAgfOKGmTAwICAgICAgfFxyXG5cdHwgICAtMCAgLS0rLT4gICArMCAgIHxcclxuXHR8ICAgICAgICAg4oaTICAgICAgICAgIHxcclxuXHR8ICAgLSsgICAgMCsgICAgKysgICB8XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdGZvciBleGFtcGxlOiB0ZXh0IGlzIGluIHRoZSByaWdodCB0b3Agb2YgdGhlIHBvaW50LCB0aGVuIGFsaWduID0gXCIrLVwiXHJcblx0IyMjXHJcblx0Y29uc3RydWN0b3I6IChAdGV4dCwgQHggPSAwLCBAeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2ludFRleHQnXHJcblx0XHRAc3Ryb2tlU3R5bGUgPSBudWxsICMgbm8gc3Ryb2tlIGJ5IGRlZmF1bHRcclxuXHRcdEBmaWxsU3R5bGUgPSAnYmxhY2snXHJcblxyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0YWxpZ246ICcwMCdcclxuXHRcdEBhbGlnbiA9IG9wdGlvbnMuYWxpZ25cclxuXHRcdGlmIG9wdGlvbnMuZm9udD9cclxuXHRcdFx0QGZvbnQgPSBvcHRpb25zLmZvbnRcclxuXHRcdGVsc2UgaWYgb3B0aW9ucy5mb250RmFtaWx5PyBvciBvcHRpb25zLmZvbnRTaXplP1xyXG5cdFx0XHRAX2ZvbnRGYW1pbHkgPSBvcHRpb25zLmZvbnRGYW1pbHkgb3IgQnUuREVGQVVMVF9GT05UX0ZBTUlMWVxyXG5cdFx0XHRAX2ZvbnRTaXplID0gb3B0aW9ucy5mb250U2l6ZSBvciBCdS5ERUZBVUxUX0ZPTlRfU0laRVxyXG5cdFx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAZm9udCA9IG51bGxcclxuXHJcblx0QHByb3BlcnR5ICdhbGlnbicsXHJcblx0XHRnZXQ6IC0+IEBfYWxpZ25cclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9hbGlnbiA9IHZhbFxyXG5cdFx0XHRAc2V0QWxpZ24gQF9hbGlnblxyXG5cclxuXHRAcHJvcGVydHkgJ2ZvbnRGYW1pbHknLFxyXG5cdFx0Z2V0OiAtPiBAX2ZvbnRGYW1pbHlcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9mb250RmFtaWx5ID0gdmFsXHJcblx0XHRcdEBmb250ID0gXCIjeyBAX2ZvbnRTaXplIH1weCAjeyBAX2ZvbnRGYW1pbHkgfVwiXHJcblxyXG5cdEBwcm9wZXJ0eSAnZm9udFNpemUnLFxyXG5cdFx0Z2V0OiAtPiBAX2ZvbnRTaXplXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfZm9udFNpemUgPSB2YWxcclxuXHRcdFx0QGZvbnQgPSBcIiN7IEBfZm9udFNpemUgfXB4ICN7IEBfZm9udEZhbWlseSB9XCJcclxuXHJcblx0c2V0QWxpZ246IChhbGlnbikgLT5cclxuXHRcdGlmIGFsaWduLmxlbmd0aCA9PSAxXHJcblx0XHRcdGFsaWduID0gJycgKyBhbGlnbiArIGFsaWduXHJcblx0XHRhbGlnblggPSBhbGlnbi5zdWJzdHJpbmcoMCwgMSlcclxuXHRcdGFsaWduWSA9IGFsaWduLnN1YnN0cmluZygxLCAyKVxyXG5cdFx0QHRleHRBbGlnbiA9IHN3aXRjaCBhbGlnblhcclxuXHRcdFx0d2hlbiAnLScgdGhlbiAncmlnaHQnXHJcblx0XHRcdHdoZW4gJzAnIHRoZW4gJ2NlbnRlcidcclxuXHRcdFx0d2hlbiAnKycgdGhlbiAnbGVmdCdcclxuXHRcdEB0ZXh0QmFzZWxpbmUgPSBzd2l0Y2ggYWxpZ25ZXHJcblx0XHRcdHdoZW4gJy0nIHRoZW4gJ2JvdHRvbSdcclxuXHRcdFx0d2hlbiAnMCcgdGhlbiAnbWlkZGxlJ1xyXG5cdFx0XHR3aGVuICcrJyB0aGVuICd0b3AnXHJcblx0XHRAXHJcbiIsIiMgYW5pbWF0aW9uIGNsYXNzIGFuZCBwcmVzZXQgYW5pbWF0aW9uc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cclxuXHRcdEBmcm9tID0gb3B0aW9ucy5mcm9tXHJcblx0XHRAdG8gPSBvcHRpb25zLnRvXHJcblx0XHRAZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIG9yIDAuNVxyXG5cdFx0QGVhc2luZyA9IG9wdGlvbnMuZWFzaW5nIG9yIGZhbHNlXHJcblx0XHRAcmVwZWF0ID0gISFvcHRpb25zLnJlcGVhdFxyXG5cdFx0QGluaXQgPSBvcHRpb25zLmluaXRcclxuXHRcdEB1cGRhdGUgPSBvcHRpb25zLnVwZGF0ZVxyXG5cdFx0QGZpbmlzaCA9IG9wdGlvbnMuZmluaXNoXHJcblxyXG5cdGFwcGx5VG86ICh0YXJnZXQsIGFyZ3MpIC0+XHJcblx0XHRhcmdzID0gW2FyZ3NdIHVubGVzcyBCdS5pc0FycmF5IGFyZ3NcclxuXHRcdHRhc2sgPSBuZXcgQnUuQW5pbWF0aW9uVGFzayBALCB0YXJnZXQsIGFyZ3NcclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lci5hZGQgdGFza1xyXG5cdFx0dGFza1xyXG5cclxuXHRpc0xlZ2FsOiAtPlxyXG5cdFx0cmV0dXJuIHRydWUgdW5sZXNzIEBmcm9tPyBhbmQgQHRvP1xyXG5cclxuXHRcdGlmIEJ1LmlzUGxhaW5PYmplY3QgQGZyb21cclxuXHRcdFx0Zm9yIG93biBrZXkgb2YgQGZyb21cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0b1trZXldP1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0bz9cclxuXHRcdHRydWVcclxuXHJcbiMgUHJlc2V0IEFuaW1hdGlvbnNcclxuIyBTb21lIG9mIHRoZSBhbmltYXRpb25zIGFyZSBjb25zaXN0ZW50IHdpdGggalF1ZXJ5IFVJXHJcbkJ1LmFuaW1hdGlvbnMgPVxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgU2ltcGxlXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0ZmFkZUluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IGFuaW0udFxyXG5cclxuXHRmYWRlT3V0OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IDEgLSBhbmltLnRcclxuXHJcblx0c3BpbjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDJcclxuXHJcblx0c3BpbkluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLmRlc1NjYWxlID0gYW5pbS5hcmcgb3IgMVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLnRcclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDRcclxuXHRcdFx0QHNjYWxlID0gYW5pbS50ICogYW5pbS5kYXRhLmRlc1NjYWxlXHJcblxyXG5cdHNwaW5PdXQ6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gMSAtIGFuaW0udFxyXG5cdFx0XHRAcm90YXRpb24gPSBhbmltLnQgKiBNYXRoLlBJICogNFxyXG5cdFx0XHRAc2NhbGUgPSAxIC0gYW5pbS50XHJcblxyXG5cdGJsaW5rOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRkdXJhdGlvbjogMC4yXHJcblx0XHRmcm9tOiAwXHJcblx0XHR0bzogNTEyXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRkID0gTWF0aC5mbG9vciBNYXRoLmFicyhhbmltLmN1cnJlbnQgLSAyNTYpXHJcblx0XHRcdEBmaWxsU3R5bGUgPSBcInJnYigjeyBkIH0sICN7IGQgfSwgI3sgZCB9KVwiXHJcblxyXG5cdHNoYWtlOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLm94ID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0YW5pbS5kYXRhLnJhbmdlID0gYW5pbS5hcmcgb3IgMjBcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gTWF0aC5zaW4oYW5pbS50ICogTWF0aC5QSSAqIDgpICogYW5pbS5kYXRhLnJhbmdlICsgYW5pbS5kYXRhLm94XHJcblxyXG5cdGp1bXA6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmRhdGEub3kgPSBAcG9zaXRpb24ueVxyXG5cdFx0XHRhbmltLmRhdGEuaGVpZ2h0ID0gYW5pbS5hcmcgb3IgMTAwXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueSA9IC0gYW5pbS5kYXRhLmhlaWdodCAqIE1hdGguc2luKGFuaW0udCAqIE1hdGguUEkpICsgYW5pbS5kYXRhLm95XHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBUb2dnbGVkOiBkZXRlY3QgYW5kIHNhdmUgb3JpZ2luYWwgc3RhdHVzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0cHVmZjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0ZHVyYXRpb246IDAuMTVcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPVxyXG5cdFx0XHRcdG9wYWNpdHk6IEBvcGFjaXR5XHJcblx0XHRcdFx0c2NhbGU6IEBzY2FsZS54XHJcblx0XHRcdGFuaW0udG8gPVxyXG5cdFx0XHRcdGlmIEBvcGFjaXR5ID09IDFcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAqIDEuNVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDFcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAvIDEuNVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLmN1cnJlbnQub3BhY2l0eVxyXG5cdFx0XHRAc2NhbGUgPSBhbmltLmN1cnJlbnQuc2NhbGVcclxuXHJcblx0Y2xpcDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIEBzY2FsZS55ICE9IDBcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSAwXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSBAc2NhbGUueFxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFg6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueFxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnggPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFk6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFdpdGggQXJndW1lbnRzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW92ZVRvOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0aWYgYW5pbS5hcmc/XHJcblx0XHRcdFx0YW5pbS5mcm9tID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0XHRhbmltLnRvID0gcGFyc2VGbG9hdCBhbmltLmFyZ1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnQnUuYW5pbWF0aW9ucy5tb3ZlVG8gbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdG1vdmVCeTogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIGFuaW0uYXJncz9cclxuXHRcdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24ueFxyXG5cdFx0XHRcdGFuaW0udG8gPSBAcG9zaXRpb24ueCArIHBhcnNlRmxvYXQoYW5pbS5hcmdzKVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnQnUuYW5pbWF0aW9ucy5tb3ZlQnkgbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdGRpc2NvbG9yOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0ZGVzQ29sb3IgPSBhbmltLmFyZ1xyXG5cdFx0XHRkZXNDb2xvciA9IG5ldyBCdS5Db2xvciBkZXNDb2xvciBpZiBCdS5pc1N0cmluZyBkZXNDb2xvclxyXG5cdFx0XHRhbmltLmZyb20gPSBuZXcgQnUuQ29sb3IgQGZpbGxTdHlsZVxyXG5cdFx0XHRhbmltLnRvID0gZGVzQ29sb3JcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBmaWxsU3R5bGUgPSBhbmltLmN1cnJlbnQudG9SR0JBKClcclxuIiwiIyBSdW4gdGhlIGFuaW1hdGlvbiB0YXNrc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uUnVubmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QHJ1bm5pbmdBbmltYXRpb25zID0gW11cclxuXHJcblx0YWRkOiAodGFzaykgLT5cclxuXHRcdHRhc2suaW5pdCgpXHJcblx0XHRpZiB0YXNrLmFuaW1hdGlvbi5pc0xlZ2FsKClcclxuXHRcdFx0dGFzay5zdGFydFRpbWUgPSBCdS5ub3coKVxyXG5cdFx0XHRAcnVubmluZ0FuaW1hdGlvbnMucHVzaCB0YXNrXHJcblx0XHRlbHNlXHJcblx0XHRcdGNvbnNvbGUuZXJyb3IgJ0J1LkFuaW1hdGlvblJ1bm5lcjogYW5pbWF0aW9uIHNldHRpbmcgaXMgaWxsZWdhbDogJywgdGFzay5hbmltYXRpb25cclxuXHJcblx0dXBkYXRlOiAtPlxyXG5cdFx0bm93ID0gQnUubm93KClcclxuXHRcdGZvciB0YXNrIGluIEBydW5uaW5nQW5pbWF0aW9uc1xyXG5cdFx0XHRjb250aW51ZSBpZiB0YXNrLmZpbmlzaGVkXHJcblxyXG5cdFx0XHRhbmltID0gdGFzay5hbmltYXRpb25cclxuXHRcdFx0dCA9IChub3cgLSB0YXNrLnN0YXJ0VGltZSkgLyAoYW5pbS5kdXJhdGlvbiAqIDEwMDApXHJcblx0XHRcdGlmIHQgPiAxXHJcblx0XHRcdFx0ZmluaXNoID0gdHJ1ZVxyXG5cdFx0XHRcdGlmIGFuaW0ucmVwZWF0XHJcblx0XHRcdFx0XHR0ID0gMFxyXG5cdFx0XHRcdFx0dGFzay5zdGFydFRpbWUgPSBCdS5ub3coKVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdCMgVE9ETyByZW1vdmUgdGhlIGZpbmlzaGVkIHRhc2tzIG91dFxyXG5cdFx0XHRcdFx0dCA9IDFcclxuXHRcdFx0XHRcdHRhc2suZmluaXNoZWQgPSB5ZXNcclxuXHJcblx0XHRcdGlmIGFuaW0uZWFzaW5nID09IHRydWVcclxuXHRcdFx0XHR0ID0gZWFzaW5nRnVuY3Rpb25zW0RFRkFVTFRfRUFTSU5HX0ZVTkNUSU9OXSB0XHJcblx0XHRcdGVsc2UgaWYgZWFzaW5nRnVuY3Rpb25zW2FuaW0uZWFzaW5nXT9cclxuXHRcdFx0XHR0ID0gZWFzaW5nRnVuY3Rpb25zW2FuaW0uZWFzaW5nXSB0XHJcblxyXG5cdFx0XHR0YXNrLnQgPSB0XHJcblx0XHRcdHRhc2suaW50ZXJwb2xhdGUoKVxyXG5cclxuXHRcdFx0YW5pbS51cGRhdGUuY2FsbCB0YXNrLnRhcmdldCwgdGFza1xyXG5cdFx0XHRpZiBmaW5pc2ggdGhlbiBhbmltLmZpbmlzaD8uY2FsbCB0YXNrLnRhcmdldCwgdGFza1xyXG5cclxuXHQjIEhvb2sgdXAgb24gYW4gcmVuZGVyZXIsIHJlbW92ZSBvd24gc2V0SW50ZXJuYWxcclxuXHRob29rVXA6IChyZW5kZXJlcikgLT5cclxuXHRcdHJlbmRlcmVyLm9uICd1cGRhdGUnLCA9PiBAdXBkYXRlKClcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFByaXZhdGUgdmFyaWFibGVzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0REVGQVVMVF9FQVNJTkdfRlVOQ1RJT04gPSAncXVhZCdcclxuXHRlYXNpbmdGdW5jdGlvbnMgPVxyXG5cdFx0cXVhZEluOiAodCkgLT4gdCAqIHRcclxuXHRcdHF1YWRPdXQ6ICh0KSAtPiB0ICogKDIgLSB0KVxyXG5cdFx0cXVhZDogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQyICogdCAqIHRcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdC0yICogdCAqIHQgKyA0ICogdCAtIDFcclxuXHJcblx0XHRjdWJpY0luOiAodCkgLT4gdCAqKiAzXHJcblx0XHRjdWJpY091dDogKHQpIC0+ICh0IC0gMSkgKiogMyArIDFcclxuXHRcdGN1YmljOiAodCkgLT5cclxuXHRcdFx0aWYgdCA8IDAuNVxyXG5cdFx0XHRcdDQgKiB0ICoqIDNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdDQgKiAodCAtIDEpICoqIDMgKyAxXHJcblxyXG5cdFx0c2luZUluOiAodCkgLT4gTWF0aC5zaW4oKHQgLSAxKSAqIEJ1LkhBTEZfUEkpICsgMVxyXG5cdFx0c2luZU91dDogKHQpIC0+IE1hdGguc2luIHQgKiBCdS5IQUxGX1BJXHJcblx0XHRzaW5lOiAodCkgLT5cclxuXHRcdFx0aWYgdCA8IDAuNVxyXG5cdFx0XHRcdChNYXRoLnNpbigodCAqIDIgLSAxKSAqIEJ1LkhBTEZfUEkpICsgMSkgLyAyXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRNYXRoLnNpbigodCAtIDAuNSkgKiBNYXRoLlBJKSAvIDIgKyAwLjVcclxuXHJcblx0XHQjIFRPRE8gYWRkIHF1YXJ0LCBxdWludCwgZXhwbywgY2lyYywgYmFjaywgZWxhc3RpYywgYm91bmNlXHJcblxyXG4jIERlZmluZSB0aGUgZ2xvYmFsIHVuaXF1ZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzXHJcbkJ1LmFuaW1hdGlvblJ1bm5lciA9IG5ldyBCdS5BbmltYXRpb25SdW5uZXJcclxuIiwiIyBBbmltYXRpb25UYXNrIGlzIGFuIGluc3RhbmNlIG9mIEFuaW1hdGlvbiwgcnVuIGJ5IEFuaW1hdGlvblJ1bm5lclxuXG5jbGFzcyBCdS5BbmltYXRpb25UYXNrXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBhbmltYXRpb24sIEB0YXJnZXQsIEBhcmdzID0gW10pIC0+XG4gICAgICAgIEBzdGFydFRpbWUgPSAwXG4gICAgICAgIEBmaW5pc2hlZCA9IG5vXG4gICAgICAgIEBmcm9tID0gQnUuY2xvbmUgQGFuaW1hdGlvbi5mcm9tXG4gICAgICAgIEBjdXJyZW50ID0gQnUuY2xvbmUgQGFuaW1hdGlvbi5mcm9tXG4gICAgICAgIEB0byA9IEJ1LmNsb25lIEBhbmltYXRpb24udG9cbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBAdCA9IDBcbiAgICAgICAgQGFyZyA9IEBhcmdzWzBdXG5cbiAgICBpbml0OiAtPlxuICAgICAgICBAYW5pbWF0aW9uLmluaXQ/LmNhbGwgQHRhcmdldCwgQFxuICAgICAgICBAY3VycmVudCA9IEJ1LmNsb25lIEBmcm9tXG5cbiAgICByZXN0YXJ0OiAtPlxuICAgICAgICBAc3RhcnRUaW1lID0gQnUubm93KClcbiAgICAgICAgQGZpbmlzaGVkID0gbm9cblxuICAgIGludGVycG9sYXRlOiAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBmcm9tP1xuXG4gICAgICAgIGlmIEJ1LmlzTnVtYmVyIEBmcm9tXG4gICAgICAgICAgICBAY3VycmVudCA9IGludGVycG9sYXRlTnVtIEBmcm9tLCBAdG8sIEB0XG4gICAgICAgIGVsc2UgaWYgQGZyb20gaW5zdGFuY2VvZiBCdS5Db2xvclxuICAgICAgICAgICAgaW50ZXJwb2xhdGVDb2xvciBAZnJvbSwgQHRvLCBAdCwgQGN1cnJlbnRcbiAgICAgICAgZWxzZSBpZiBAZnJvbSBpbnN0YW5jZW9mIEJ1LlZlY3RvclxuICAgICAgICAgICAgaW50ZXJwb2xhdGVWZWN0b3IgQGZyb20sIEB0bywgQHQsIEBjdXJyZW50XG4gICAgICAgIGVsc2UgaWYgQnUuaXNQbGFpbk9iamVjdCBAZnJvbVxuICAgICAgICAgICAgZm9yIG93biBrZXkgb2YgQGZyb21cbiAgICAgICAgICAgICAgICBpZiBCdS5pc051bWJlciBAZnJvbVtrZXldXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50W2tleV0gPSBpbnRlcnBvbGF0ZU51bSBAZnJvbVtrZXldLCBAdG9ba2V5XSwgQHRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRlT2JqZWN0IEBmcm9tW2tleV0sIEB0b1trZXldLCBAdCwgQGN1cnJlbnRba2V5XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yIFwiQnUuQW5pbWF0aW9uIG5vdCBzdXBwb3J0IGludGVycG9sYXRlIHR5cGU6IFwiLCBAZnJvbVxuXG4gICAgaW50ZXJwb2xhdGVOdW0gPSAoYSwgYiwgdCkgLT4gYiAqIHQgLSBhICogKHQgLSAxKVxuXG4gICAgaW50ZXJwb2xhdGVDb2xvciA9IChhLCBiLCB0LCBjKSAtPlxuICAgICAgICBjLnNldFJHQkEgaW50ZXJwb2xhdGVOdW0oYS5yLCBiLnIsIHQpLCBpbnRlcnBvbGF0ZU51bShhLmcsIGIuZywgdCksIGludGVycG9sYXRlTnVtKGEuYiwgYi5iLCB0KSwgaW50ZXJwb2xhdGVOdW0oYS5hLCBiLmEsIHQpXG5cbiAgICBpbnRlcnBvbGF0ZVZlY3RvciA9IChhLCBiLCB0LCBjKSAtPlxuICAgICAgICBjLnggPSBpbnRlcnBvbGF0ZU51bSBhLngsIGIueCwgdFxuICAgICAgICBjLnkgPSBpbnRlcnBvbGF0ZU51bSBhLnksIGIueSwgdFxuIiwiIyBNYW5hZ2UgYW4gT2JqZWN0MkQgbGlzdCBhbmQgdXBkYXRlIGl0cyBkYXNoT2Zmc2V0XHJcblxyXG5jbGFzcyBCdS5EYXNoRmxvd01hbmFnZXJcclxuXHJcblx0Y29uc3RydWN0b3I6IC0+XHJcblx0XHRAZmxvd2luZ09iamVjdHMgPSBbXVxyXG5cclxuXHRzZXRTcGVlZDogKHRhcmdldCwgc3BlZWQpIC0+XHJcblx0XHR0YXJnZXQuZGFzaEZsb3dTcGVlZCA9IHNwZWVkXHJcblx0XHRpID0gQGZsb3dpbmdPYmplY3RzLmluZGV4T2YgdGFyZ2V0XHJcblx0XHRpZiBzcGVlZCAhPSAwXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5wdXNoIHRhcmdldCBpZiBpID09IC0xXHJcblx0XHRlbHNlXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5zcGxpY2UoaSwgMSkgaWYgaSA+IC0xXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdGZvciBvIGluIEBmbG93aW5nT2JqZWN0c1xyXG5cdFx0XHRvLmRhc2hPZmZzZXQgKz0gby5kYXNoRmxvd1NwZWVkXHJcblxyXG5cdCMgSG9vayB1cCBvbiBhbiByZW5kZXJlciwgcmVtb3ZlIG93biBzZXRJbnRlcm5hbFxyXG5cdGhvb2tVcDogKHJlbmRlcmVyKSAtPlxyXG5cdFx0cmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEB1cGRhdGUoKVxyXG5cclxuIyBHbG9iYWwgdW5pcXVlIGluc3RhbmNlXHJcbkJ1LmRhc2hGbG93TWFuYWdlciA9IG5ldyBCdS5EYXNoRmxvd01hbmFnZXJcclxuIiwiIyBTcHJpdGUgU2hlZXRcclxuXHJcbmNsYXNzIEJ1LlNwcml0ZVNoZWV0XHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHJcblx0XHRAcmVhZHkgPSBubyAgIyBJZiB0aGlzIHNwcml0ZSBzaGVldCBpcyBsb2FkZWQgYW5kIHBhcnNlZC5cclxuXHRcdEBoZWlnaHQgPSAwICAjIEhlaWdodCBvZiB0aGlzIHNwcml0ZVxyXG5cclxuXHRcdEBkYXRhID0gbnVsbCAgIyBUaGUgSlNPTiBkYXRhXHJcblx0XHRAaW1hZ2VzID0gW10gICMgVGhlIGBJbWFnZWAgbGlzdCBsb2FkZWRcclxuXHRcdEBmcmFtZUltYWdlcyA9IFtdICAjIFBhcnNlZCBmcmFtZSBpbWFnZXNcclxuXHJcblx0XHQjIGxvYWQgYW5kIHRyaWdnZXIgcGFyc2VEYXRhKClcclxuXHRcdCQuYWpheCBAdXJsLCBzdWNjZXNzOiAodGV4dCkgPT5cclxuXHRcdFx0QGRhdGEgPSBKU09OLnBhcnNlIHRleHRcclxuXHJcblx0XHRcdGlmIG5vdCBAZGF0YS5pbWFnZXM/XHJcblx0XHRcdFx0QGRhdGEuaW1hZ2VzID0gW0B1cmwuc3Vic3RyaW5nKEB1cmwubGFzdEluZGV4T2YoJy8nKSwgQHVybC5sZW5ndGggLSA1KSArICcucG5nJ11cclxuXHJcblx0XHRcdGJhc2VVcmwgPSBAdXJsLnN1YnN0cmluZyAwLCBAdXJsLmxhc3RJbmRleE9mKCcvJykgKyAxXHJcblx0XHRcdGZvciBvd24gaSBvZiBAZGF0YS5pbWFnZXNcclxuXHRcdFx0XHRAZGF0YS5pbWFnZXNbaV0gPSBiYXNlVXJsICsgQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdFx0XHRcdGNvdW50TG9hZGVkID0gMFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0gPSBuZXcgSW1hZ2VcclxuXHRcdFx0XHRAaW1hZ2VzW2ldLm9ubG9hZCA9ICgpID0+XHJcblx0XHRcdFx0XHRjb3VudExvYWRlZCArPSAxXHJcblx0XHRcdFx0XHRAcGFyc2VEYXRhKCkgaWYgY291bnRMb2FkZWQgPT0gQGRhdGEuaW1hZ2VzLmxlbmd0aFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0uc3JjID0gQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdHBhcnNlRGF0YTogLT5cclxuXHRcdCMgQ2xpcCB0aGUgaW1hZ2UgZm9yIGV2ZXJ5IGZyYW1lc1xyXG5cdFx0ZnJhbWVzID0gQGRhdGEuZnJhbWVzXHJcblx0XHRmb3Igb3duIGkgb2YgZnJhbWVzXHJcblx0XHRcdGZvciBqIGluIFswLi40XVxyXG5cdFx0XHRcdGlmIG5vdCBmcmFtZXNbaV1bal0/XHJcblx0XHRcdFx0XHRmcmFtZXNbaV1bal0gPSBpZiBmcmFtZXNbaSAtIDFdP1tqXT8gdGhlbiBmcmFtZXNbaSAtIDFdW2pdIGVsc2UgMFxyXG5cdFx0XHR4ID0gZnJhbWVzW2ldWzBdXHJcblx0XHRcdHkgPSBmcmFtZXNbaV1bMV1cclxuXHRcdFx0dyA9IGZyYW1lc1tpXVsyXVxyXG5cdFx0XHRoID0gZnJhbWVzW2ldWzNdXHJcblx0XHRcdGZyYW1lSW5kZXggPSBmcmFtZXNbaV1bNF1cclxuXHRcdFx0QGZyYW1lSW1hZ2VzW2ldID0gY2xpcEltYWdlIEBpbWFnZXNbZnJhbWVJbmRleF0sIHgsIHksIHcsIGhcclxuXHRcdFx0QGhlaWdodCA9IGggaWYgQGhlaWdodCA9PSAwXHJcblxyXG5cdFx0QHJlYWR5ID0geWVzXHJcblx0XHRAdHJpZ2dlciAnbG9hZGVkJ1xyXG5cclxuXHRnZXRGcmFtZUltYWdlOiAoa2V5LCBpbmRleCA9IDApIC0+XHJcblx0XHRyZXR1cm4gbnVsbCB1bmxlc3MgQHJlYWR5XHJcblx0XHRhbmltYXRpb24gPSBAZGF0YS5hbmltYXRpb25zW2tleV1cclxuXHRcdHJldHVybiBudWxsIHVubGVzcyBhbmltYXRpb24/XHJcblxyXG5cdFx0cmV0dXJuIEBmcmFtZUltYWdlc1thbmltYXRpb24uZnJhbWVzW2luZGV4XV1cclxuXHJcblx0bWVhc3VyZVRleHRXaWR0aDogKHRleHQpIC0+XHJcblx0XHR3aWR0aCA9IDBcclxuXHRcdGZvciBjaGFyIGluIHRleHRcclxuXHRcdFx0d2lkdGggKz0gQGdldEZyYW1lSW1hZ2UoY2hhcikud2lkdGhcclxuXHRcdHdpZHRoXHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBQcml2YXRlIG1lbWJlcnNcclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcclxuXHJcblx0Y2xpcEltYWdlID0gKGltYWdlLCB4LCB5LCB3LCBoKSAtPlxyXG5cdFx0Y2FudmFzLndpZHRoID0gd1xyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGhcclxuXHRcdGNvbnRleHQuZHJhd0ltYWdlIGltYWdlLCB4LCB5LCB3LCBoLCAwLCAwLCB3LCBoXHJcblxyXG5cdFx0bmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG5cdFx0bmV3SW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpXHJcblx0XHRyZXR1cm4gbmV3SW1hZ2VcclxuIiwiIyBNYW5hZ2UgdGhlIHVzZXIgaW5wdXQsIGxpa2UgbW91c2UsIGtleWJvYXJkLCB0b3VjaHNjcmVlbiBldGNcclxuXHJcbmNsYXNzIEJ1LklucHV0TWFuYWdlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IHllc1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IG5vXHJcblxyXG5cdCMgVG8gZGV0ZWN0IHdoZXRoZXIgYSBrZXkgaXMgcHJlc3NlZCBkb3duXHJcblx0aXNLZXlEb3duOiAoa2V5KSAtPlxyXG5cdFx0a2V5Q29kZSA9IEBrZXlUb0tleUNvZGUga2V5XHJcblx0XHRAa2V5U3RhdGVzW2tleUNvZGVdXHJcblxyXG5cdCMgQ29udmVydCBmcm9tIGtleUlkZW50aWZpZXJzL2tleVZhbHVlcyB0byBrZXlDb2RlXHJcblx0a2V5VG9LZXlDb2RlOiAoa2V5KSAtPlxyXG5cdFx0a2V5ID0gQGtleUFsaWFzVG9LZXlNYXBba2V5XSBvciBrZXlcclxuXHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlTWFwW2tleV1cclxuXHJcblx0IyBSZWNpZXZlIGFuZCBiaW5kIHRoZSBtb3VzZS9rZXlib2FyZCBldmVudHMgbGlzdGVuZXJzXHJcblx0aGFuZGxlQXBwRXZlbnRzOiAoYXBwLCBldmVudHMpIC0+XHJcblx0XHRrZXlkb3duTGlzdGVuZXJzID0ge31cclxuXHRcdGtleXVwTGlzdGVuZXJzID0ge31cclxuXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSA9PlxyXG5cdFx0XHRrZXlkb3duTGlzdGVuZXJzW2Uua2V5Q29kZV0/LmNhbGwgYXBwLCBlXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5dXAnLCAoZSkgPT5cclxuXHRcdFx0a2V5dXBMaXN0ZW5lcnNbZS5rZXlDb2RlXT8uY2FsbCBhcHAsIGVcclxuXHJcblx0XHRmb3IgdHlwZSBvZiBldmVudHNcclxuXHRcdFx0aWYgdHlwZSBpbiBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdtb3VzZXdoZWVsJywgJ2tleWRvd24nLCAna2V5dXAnXVxyXG5cdFx0XHRcdGFwcC4kcmVuZGVyZXIuZG9tLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgZXZlbnRzW3R5cGVdLmJpbmQoYXBwKVxyXG5cdFx0XHRlbHNlIGlmIHR5cGUuaW5kZXhPZigna2V5ZG93bi4nKSA9PSAwXHJcblx0XHRcdFx0a2V5ID0gdHlwZS5zdWJzdHJpbmcgOFxyXG5cdFx0XHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlIGtleVxyXG5cdFx0XHRcdGtleWRvd25MaXN0ZW5lcnNba2V5Q29kZV0gPSBldmVudHNbdHlwZV1cclxuXHRcdFx0ZWxzZSBpZiB0eXBlLmluZGV4T2YoJ2tleXVwLicpID09IDBcclxuXHRcdFx0XHRrZXkgPSB0eXBlLnN1YnN0cmluZyA2XHJcblx0XHRcdFx0a2V5Q29kZSA9IEBrZXlUb0tleUNvZGUga2V5XHJcblx0XHRcdFx0a2V5dXBMaXN0ZW5lcnNba2V5Q29kZV0gPSBldmVudHNbdHlwZV1cclxuXHJcblx0IyBNYXAgZnJvbSBrZXlJZGVudGlmaWVycy9rZXlWYWx1ZXMgdG8ga2V5Q29kZVxyXG5cdGtleVRvS2V5Q29kZU1hcDpcclxuXHRcdEJhY2tzcGFjZTogICAgOFxyXG5cdFx0VGFiOiAgICAgICAgICA5XHJcblx0XHRFbnRlcjogICAgICAgMTNcclxuXHRcdFNoaWZ0OiAgICAgICAxNlxyXG5cdFx0Q29udHJvbDogICAgIDE3XHJcblx0XHRBbHQ6ICAgICAgICAgMThcclxuXHRcdENhcHNMb2NrOiAgICAyMFxyXG5cdFx0RXNjYXBlOiAgICAgIDI3XHJcblx0XHQnICc6ICAgICAgICAgMzIgICMgU3BhY2VcclxuXHRcdFBhZ2VVcDogICAgICAzM1xyXG5cdFx0UGFnZURvd246ICAgIDM0XHJcblx0XHRFbmQ6ICAgICAgICAgMzVcclxuXHRcdEhvbWU6ICAgICAgICAzNlxyXG5cdFx0QXJyb3dMZWZ0OiAgIDM3XHJcblx0XHRBcnJvd1VwOiAgICAgMzhcclxuXHRcdEFycm93UmlnaHQ6ICAzOVxyXG5cdFx0QXJyb3dEb3duOiAgIDQwXHJcblx0XHREZWxldGU6ICAgICAgNDZcclxuXHJcblx0XHQxOiA0OVxyXG5cdFx0MjogNTBcclxuXHRcdDM6IDUxXHJcblx0XHQ0OiA1MlxyXG5cdFx0NTogNTNcclxuXHRcdDY6IDU0XHJcblx0XHQ3OiA1NVxyXG5cdFx0ODogNTZcclxuXHRcdDk6IDU3XHJcblx0XHRBOiA2NVxyXG5cdFx0QjogNjZcclxuXHRcdEM6IDY3XHJcblx0XHREOiA2OFxyXG5cdFx0RTogNjlcclxuXHRcdEY6IDcwXHJcblx0XHRHOiA3MVxyXG5cdFx0SDogNzJcclxuXHRcdEk6IDczXHJcblx0XHRKOiA3NFxyXG5cdFx0SzogNzVcclxuXHRcdEw6IDc2XHJcblx0XHRNOiA3N1xyXG5cdFx0TjogNzhcclxuXHRcdE86IDc5XHJcblx0XHRQOiA4MFxyXG5cdFx0UTogODFcclxuXHRcdFI6IDgyXHJcblx0XHRTOiA4M1xyXG5cdFx0VDogODRcclxuXHRcdFU6IDg1XHJcblx0XHRWOiA4NlxyXG5cdFx0VzogODdcclxuXHRcdFg6IDg4XHJcblx0XHRZOiA4OVxyXG5cdFx0WjogOTBcclxuXHJcblx0XHRGMTogIDExMlxyXG5cdFx0RjI6ICAxMTNcclxuXHRcdEYzOiAgMTE0XHJcblx0XHRGNDogIDExNVxyXG5cdFx0RjU6ICAxMTZcclxuXHRcdEY2OiAgMTE3XHJcblx0XHRGNzogIDExOFxyXG5cdFx0Rjg6ICAxMTlcclxuXHRcdEY5OiAgMTIwXHJcblx0XHRGMTA6IDEyMVxyXG5cdFx0RjExOiAxMjJcclxuXHRcdEYxMjogMTIzXHJcblxyXG5cdFx0J2AnOiAxOTJcclxuXHRcdCc9JzogMTg3XHJcblx0XHQnLCc6IDE4OFxyXG5cdFx0Jy0nOiAxODlcclxuXHRcdCcuJzogMTkwXHJcblx0XHQnLyc6IDE5MVxyXG5cdFx0JzsnOiAxODZcclxuXHRcdFwiJ1wiOiAyMjJcclxuXHRcdCdbJzogMjE5XHJcblx0XHQnXSc6IDIyMVxyXG5cdFx0J1xcXFwnOiAyMjBcclxuXHJcblx0IyBNYXAgZnJvbSBub3Qgc3RhbmRhcmQsIGJ1dCBjb21tb25seSBrbm93biBrZXlWYWx1ZXMva2V5SWRlbnRpZmllcnMgdG8ga2V5Q29kZVxyXG5cdGtleUFsaWFzVG9LZXlNYXA6XHJcblx0XHRDdHJsOiAgICAgICAgJ0NvbnRyb2wnICAgICAjIDE3XHJcblx0XHRDdGw6ICAgICAgICAgJ0NvbnRyb2wnICAgICAjIDE3XHJcblx0XHRFc2M6ICAgICAgICAgJ0VzY2FwZScgICAgICAjIDI3XHJcblx0XHRTcGFjZTogICAgICAgJyAnICAgICAgICAgICAjIDMyXHJcblx0XHRQZ1VwOiAgICAgICAgJ1BhZ2VVcCcgICAgICAjIDMzXHJcblx0XHQnUGFnZSBVcCc6ICAgJ1BhZ2VVcCcgICAgICAjIDMzXHJcblx0XHRQZ0RuOiAgICAgICAgJ1BhZ2VEb3duJyAgICAjIDM0XHJcblx0XHQnUGFnZSBEb3duJzogJ1BhZ2VEb3duJyAgICAjIDM0XHJcblx0XHRMZWZ0OiAgICAgICAgJ0Fycm93TGVmdCcgICAjIDM3XHJcblx0XHRVcDogICAgICAgICAgJ0Fycm93VXAnICAgICAjIDM4XHJcblx0XHRSaWdodDogICAgICAgJ0Fycm93UmlnaHQnICAjIDM5XHJcblx0XHREb3duOiAgICAgICAgJ0Fycm93RG93bicgICAjIDQwXHJcblx0XHREZWw6ICAgICAgICAgJ0RlbGV0ZScgICAgICAjIDQ2XHJcbiIsIiMgUGFuIGFuZCB6b29tIHRoZSBjYW1lcmEgYnkgdGhlIG1vdXNlXHJcbiMgRHJhZyBsZWZ0IG1vdXNlIGJ1dHRvbiB0byBwYW4sIHdoZWVsIHVwL2Rvd24gdG8gem9vbSBpbi9vdXRcclxuXHJcbmNsYXNzIEJ1Lk1vdXNlQ29udHJvbFxyXG5cclxuXHRzY2FsZUFuaW1hdGlvbiA9IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjJcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmFyZyA9IDEgdW5sZXNzIGFuaW0uYXJnP1xyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUuY2xvbmUoKVxyXG5cdFx0XHRhbmltLnRvID0gQHNjYWxlLmNsb25lKCkubXVsdGlwbHlTY2FsYXIgcGFyc2VGbG9hdCBhbmltLmFyZ1xyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdHRyYW5zbGF0ZUFuaW1hdGlvbiA9IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjJcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmFyZyA9IG5ldyBCdS5WZWN0b3IgdW5sZXNzIGFuaW0uYXJnP1xyXG5cdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24uY2xvbmUoKVxyXG5cdFx0XHRhbmltLnRvID0gQHBvc2l0aW9uLmNsb25lKCkuYWRkIGFuaW0uYXJnXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24uY29weSBhbmltLmN1cnJlbnRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY2FtZXJhLCBkb20pIC0+XHJcblx0XHRAem9vbVNjYWxlQW5pbSA9IHNjYWxlQW5pbWF0aW9uLmFwcGx5VG8gQGNhbWVyYVxyXG5cdFx0QHpvb21UcmFuc0FuaW0gPSB0cmFuc2xhdGVBbmltYXRpb24uYXBwbHlUbyBAY2FtZXJhXHJcblxyXG5cdFx0QHNtb290aFpvb21pbmcgPSB5ZXNcclxuXHRcdEBkZXNTY2FsZSA9IG5ldyBCdS5WZWN0b3IgMSwgMVxyXG5cclxuXHRcdGRvbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcclxuXHRcdGRvbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJywgQG9uTW91c2VXaGVlbFxyXG5cclxuXHRvbk1vdXNlTW92ZTogKGUpID0+XHJcblx0XHRpZiBlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuTEVGVFxyXG5cdFx0XHRzY2FsZSA9IEBjYW1lcmEuc2NhbGUueFxyXG5cdFx0XHRkeCA9IC1lLm1vdmVtZW50WCAqIHNjYWxlXHJcblx0XHRcdGR5ID0gLWUubW92ZW1lbnRZICogc2NhbGVcclxuXHJcblx0XHRcdEBjYW1lcmEudHJhbnNsYXRlIGR4LCBkeVxyXG5cclxuXHRvbk1vdXNlV2hlZWw6IChlKSA9PlxyXG5cdFx0ZGVsdGFTY2FsZVN0ZXAgPSBNYXRoLnBvdygxLjI1LCAtZS53aGVlbERlbHRhIC8gMTIwKVxyXG5cdFx0QGRlc1NjYWxlLm11bHRpcGx5U2NhbGFyIGRlbHRhU2NhbGVTdGVwXHJcblx0XHRkZWx0YVNjYWxlQWxsID0gQGRlc1NjYWxlLnggLyBAY2FtZXJhLnNjYWxlLnhcclxuXHJcblx0XHRteCA9IGUub2Zmc2V0WCAtICQoZS50YXJnZXQpLndpZHRoKCkgLyAyXHJcblx0XHRteSA9IGUub2Zmc2V0WSAtICQoZS50YXJnZXQpLmhlaWdodCgpIC8gMlxyXG5cdFx0ZHggPSAtbXggKiAoZGVsdGFTY2FsZUFsbCAtIDEpICogQGNhbWVyYS5zY2FsZS54XHJcblx0XHRkeSA9IC1teSAqIChkZWx0YVNjYWxlQWxsIC0gMSkgKiBAY2FtZXJhLnNjYWxlLnlcclxuXHJcblx0XHRpZiBAc21vb3RoWm9vbWluZ1xyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS5mcm9tLmNvcHkgQGNhbWVyYS5zY2FsZVxyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS50by5jb3B5IEBkZXNTY2FsZVxyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS5yZXN0YXJ0KClcclxuXHJcblx0XHRcdEB6b29tVHJhbnNBbmltLmZyb20uY29weSBAY2FtZXJhLnBvc2l0aW9uXHJcblx0XHRcdEB6b29tVHJhbnNBbmltLnRvLnNldCBAY2FtZXJhLnBvc2l0aW9uLnggKyBkeCwgQGNhbWVyYS5wb3NpdGlvbi55ICsgZHlcclxuXHRcdFx0QHpvb21UcmFuc0FuaW0ucmVzdGFydCgpXHJcblx0XHRlbHNlXHJcblx0XHRcdEBjYW1lcmEudHJhbnNsYXRlIGR4LCBkeVxyXG5cdFx0XHRAY2FtZXJhLnNjYWxlLmNvcHkgdGhpcy5kZXNTY2FsZVxyXG4iLCIjIEdlb21ldHJ5IEFsZ29yaXRobSBDb2xsZWN0aW9uXHJcblxyXG5CdS5nZW9tZXRyeUFsZ29yaXRobSA9IEcgPVxyXG5cclxuXHRpbmplY3Q6IC0+XHJcblx0XHRAaW5qZWN0SW50byBbXHJcblx0XHRcdCdwb2ludCdcclxuXHRcdFx0J2xpbmUnXHJcblx0XHRcdCdjaXJjbGUnXHJcblx0XHRcdCdlbGxpcHNlJ1xyXG5cdFx0XHQndHJpYW5nbGUnXHJcblx0XHRcdCdyZWN0YW5nbGUnXHJcblx0XHRcdCdmYW4nXHJcblx0XHRcdCdib3cnXHJcblx0XHRcdCdwb2x5Z29uJ1xyXG5cdFx0XHQncG9seWxpbmUnXHJcblx0XHRdXHJcblxyXG5cdGluamVjdEludG86IChzaGFwZXMpIC0+XHJcblx0XHRzaGFwZXMgPSBbc2hhcGVzXSBpZiBCdS5pc1N0cmluZyBzaGFwZXNcclxuXHJcblx0XHRpZiAncG9pbnQnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Qb2ludDo6aW5DaXJjbGUgPSAoY2lyY2xlKSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkNpcmNsZSBALCBjaXJjbGVcclxuXHRcdFx0QnUuUG9pbnQ6OmRpc3RhbmNlVG8gPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5kaXN0YW5jZUZyb21Qb2ludFRvUG9pbnQgQCwgcG9pbnRcclxuXHRcdFx0QnUuUG9pbnQ6OmlzTmVhciA9ICh0YXJnZXQsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRcdFx0c3dpdGNoIHRhcmdldC50eXBlXHJcblx0XHRcdFx0XHR3aGVuICdQb2ludCdcclxuXHRcdFx0XHRcdFx0Ry5wb2ludE5lYXJQb2ludCBALCB0YXJnZXQsIGxpbWl0XHJcblx0XHRcdFx0XHR3aGVuICdMaW5lJ1xyXG5cdFx0XHRcdFx0XHRHLnBvaW50TmVhckxpbmUgQCwgdGFyZ2V0LCBsaW1pdFxyXG5cdFx0XHRcdFx0d2hlbiAnUG9seWxpbmUnXHJcblx0XHRcdFx0XHRcdEcucG9pbnROZWFyUG9seWxpbmUgQCwgdGFyZ2V0LCBsaW1pdFxyXG5cdFx0XHRCdS5Qb2ludC5pbnRlcnBvbGF0ZSA9IEcuaW50ZXJwb2xhdGVCZXR3ZWVuVHdvUG9pbnRzXHJcblxyXG5cdFx0aWYgJ2xpbmUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5MaW5lOjpkaXN0YW5jZVRvID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUgcG9pbnQsIEBcclxuXHRcdFx0QnUuTGluZTo6aXNUd29Qb2ludHNTYW1lU2lkZSA9IChwMSwgcDIpIC0+XHJcblx0XHRcdFx0Ry50d29Qb2ludHNTYW1lU2lkZU9mTGluZSBwMSwgcDIsIEBcclxuXHRcdFx0QnUuTGluZTo6Zm9vdFBvaW50RnJvbSA9IChwb2ludCwgc2F2ZVRvKSAtPlxyXG5cdFx0XHRcdEcuZm9vdFBvaW50RnJvbVBvaW50VG9MaW5lIHBvaW50LCBALCBzYXZlVG9cclxuXHRcdFx0QnUuTGluZTo6Z2V0Q3Jvc3NQb2ludFdpdGggPSAobGluZSkgLT5cclxuXHRcdFx0XHRHLmdldENyb3NzUG9pbnRPZlR3b0xpbmVzIGxpbmUsIEBcclxuXHRcdFx0QnUuTGluZTo6aXNDcm9zc1dpdGhMaW5lID0gKGxpbmUpIC0+XHJcblx0XHRcdFx0Ry5pc1R3b0xpbmVzQ3Jvc3MgbGluZSwgQFxyXG5cclxuXHRcdGlmICdjaXJjbGUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5DaXJjbGU6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkNpcmNsZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdlbGxpcHNlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuRWxsaXBzZTo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluRWxsaXBzZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICd0cmlhbmdsZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlRyaWFuZ2xlOjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5UcmlhbmdsZSBwb2ludCwgQFxyXG5cdFx0XHRCdS5UcmlhbmdsZTo6YXJlYSA9IC0+XHJcblx0XHRcdFx0Ry5jYWxjVHJpYW5nbGVBcmVhIEBcclxuXHJcblx0XHRpZiAncmVjdGFuZ2xlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUmVjdGFuZ2xlOjpjb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJblJlY3RhbmdsZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdmYW4nIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5GYW46Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkZhbiBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdib3cnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Cb3c6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkJvdyBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdwb2x5Z29uJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUG9seWdvbjo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluUG9seWdvbiBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdwb2x5bGluZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpsZW5ndGggPSAwXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpwb2ludE5vcm1hbGl6ZWRQb3MgPSBbXVxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Y2FsY0xlbmd0aCA9ICgpIC0+XHJcblx0XHRcdFx0QGxlbmd0aCA9IEcuY2FsY1BvbHlsaW5lTGVuZ3RoIEBcclxuXHRcdFx0QnUuUG9seWxpbmU6OmNhbGNQb2ludE5vcm1hbGl6ZWRQb3MgPSAtPlxyXG5cdFx0XHRcdEcuY2FsY05vcm1hbGl6ZWRWZXJ0aWNlc1Bvc09mUG9seWxpbmUgQFxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Z2V0Tm9ybWFsaXplZFBvcyA9IChpbmRleCkgLT5cclxuXHRcdFx0XHRpZiBpbmRleD8gdGhlbiBAcG9pbnROb3JtYWxpemVkUG9zW2luZGV4XSBlbHNlIEBwb2ludE5vcm1hbGl6ZWRQb3NcclxuXHRcdFx0QnUuUG9seWxpbmU6OmNvbXByZXNzID0gKHN0cmVuZ3RoID0gMC44KSAtPlxyXG5cdFx0XHRcdEcuY29tcHJlc3NQb2x5bGluZSBALCBzdHJlbmd0aFxyXG5cclxuXHQjIFBvaW50IGluIHNoYXBlc1xyXG5cclxuXHRwb2ludE5lYXJQb2ludDogKHBvaW50LCB0YXJnZXQsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRwb2ludC5kaXN0YW5jZVRvKHRhcmdldCkgPCBsaW1pdFxyXG5cclxuXHRwb2ludE5lYXJMaW5lOiAocG9pbnQsIGxpbmUsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHR2ZXJ0aWNhbERpc3QgPSBsaW5lLmRpc3RhbmNlVG8gcG9pbnRcclxuXHRcdGZvb3RQb2ludCA9IGxpbmUuZm9vdFBvaW50RnJvbSBwb2ludFxyXG5cclxuXHRcdGlzQmV0d2VlbjEgPSBmb290UG9pbnQuZGlzdGFuY2VUbyhsaW5lLnBvaW50c1swXSkgPCBsaW5lLmxlbmd0aCArIGxpbWl0XHJcblx0XHRpc0JldHdlZW4yID0gZm9vdFBvaW50LmRpc3RhbmNlVG8obGluZS5wb2ludHNbMV0pIDwgbGluZS5sZW5ndGggKyBsaW1pdFxyXG5cclxuXHRcdHJldHVybiB2ZXJ0aWNhbERpc3QgPCBsaW1pdCBhbmQgaXNCZXR3ZWVuMSBhbmQgaXNCZXR3ZWVuMlxyXG5cclxuXHRwb2ludE5lYXJQb2x5bGluZTogKHBvaW50LCBwb2x5bGluZSwgbGltaXQgPSBCdS5ERUZBVUxUX05FQVJfRElTVCkgLT5cclxuXHRcdGZvciBsaW5lIGluIHBvbHlsaW5lLmxpbmVzXHJcblx0XHRcdHJldHVybiB5ZXMgaWYgRy5wb2ludE5lYXJMaW5lIHBvaW50LCBsaW5lLCBsaW1pdFxyXG5cdFx0bm9cclxuXHJcblx0cG9pbnRJbkNpcmNsZTogKHBvaW50LCBjaXJjbGUpIC0+XHJcblx0XHRkeCA9IHBvaW50LnggLSBjaXJjbGUuY3hcclxuXHRcdGR5ID0gcG9pbnQueSAtIGNpcmNsZS5jeVxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGR4LCBkeSkgPCBjaXJjbGUucmFkaXVzXHJcblxyXG5cdHBvaW50SW5FbGxpcHNlOiAocG9pbnQsIGVsbGlwc2UpIC0+XHJcblx0XHRyZXR1cm4gQnUuYmV2ZWwocG9pbnQueCAvIGVsbGlwc2UucmFkaXVzWCwgcG9pbnQueSAvIGVsbGlwc2UucmFkaXVzWSkgPCAxXHJcblxyXG5cdHBvaW50SW5SZWN0YW5nbGU6IChwb2ludCwgcmVjdGFuZ2xlKSAtPlxyXG5cdFx0cG9pbnQueCA+IHJlY3RhbmdsZS5wb2ludExULnggYW5kXHJcblx0XHRcdFx0cG9pbnQueSA+IHJlY3RhbmdsZS5wb2ludExULnkgYW5kXHJcblx0XHRcdFx0cG9pbnQueCA8IHJlY3RhbmdsZS5wb2ludExULnggKyByZWN0YW5nbGUuc2l6ZS53aWR0aCBhbmRcclxuXHRcdFx0XHRwb2ludC55IDwgcmVjdGFuZ2xlLnBvaW50TFQueSArIHJlY3RhbmdsZS5zaXplLmhlaWdodFxyXG5cclxuXHRwb2ludEluVHJpYW5nbGU6IChwb2ludCwgdHJpYW5nbGUpIC0+XHJcblx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMl0sIHRyaWFuZ2xlLmxpbmVzWzBdKSBhbmRcclxuXHRcdFx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMF0sIHRyaWFuZ2xlLmxpbmVzWzFdKSBhbmRcclxuXHRcdFx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMV0sIHRyaWFuZ2xlLmxpbmVzWzJdKVxyXG5cclxuXHRwb2ludEluRmFuOiAocG9pbnQsIGZhbikgLT5cclxuXHRcdGR4ID0gcG9pbnQueCAtIGZhbi5jeFxyXG5cdFx0ZHkgPSBwb2ludC55IC0gZmFuLmN5XHJcblx0XHRhID0gTWF0aC5hdGFuMihwb2ludC55IC0gZmFuLmN5LCBwb2ludC54IC0gZmFuLmN4KVxyXG5cdFx0YSArPSBCdS5UV09fUEkgd2hpbGUgYSA8IGZhbi5hRnJvbVxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGR4LCBkeSkgPCBmYW4ucmFkaXVzICYmIGEgPiBmYW4uYUZyb20gJiYgYSA8IGZhbi5hVG9cclxuXHJcblx0cG9pbnRJbkJvdzogKHBvaW50LCBib3cpIC0+XHJcblx0XHRpZiBCdS5iZXZlbChib3cuY3ggLSBwb2ludC54LCBib3cuY3kgLSBwb2ludC55KSA8IGJvdy5yYWRpdXNcclxuXHRcdFx0c2FtZVNpZGUgPSBib3cuc3RyaW5nLmlzVHdvUG9pbnRzU2FtZVNpZGUoYm93LmNlbnRlciwgcG9pbnQpXHJcblx0XHRcdHNtYWxsVGhhbkhhbGZDaXJjbGUgPSBib3cuYVRvIC0gYm93LmFGcm9tIDwgTWF0aC5QSVxyXG5cdFx0XHRyZXR1cm4gc2FtZVNpZGUgXiBzbWFsbFRoYW5IYWxmQ2lyY2xlXHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cclxuXHRwb2ludEluUG9seWdvbjogKHBvaW50LCBwb2x5Z29uKSAtPlxyXG5cdFx0Zm9yIHRyaWFuZ2xlIGluIHBvbHlnb24udHJpYW5nbGVzXHJcblx0XHRcdGlmIHRyaWFuZ2xlLmNvbnRhaW5zUG9pbnQgcG9pbnRcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0ZmFsc2VcclxuXHJcblx0IyBEaXN0YW5jZVxyXG5cclxuXHRkaXN0YW5jZUZyb21Qb2ludFRvUG9pbnQ6IChwb2ludDEsIHBvaW50MikgLT5cclxuXHRcdEJ1LmJldmVsIHBvaW50MS54IC0gcG9pbnQyLngsIHBvaW50MS55IC0gcG9pbnQyLnlcclxuXHJcblx0ZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmU6IChwb2ludCwgbGluZSkgLT5cclxuXHRcdHAxID0gbGluZS5wb2ludHNbMF1cclxuXHRcdHAyID0gbGluZS5wb2ludHNbMV1cclxuXHRcdGEgPSAocDEueSAtIHAyLnkpIC8gKHAxLnggLSBwMi54KVxyXG5cdFx0YiA9IHAxLnkgLSBhICogcDEueFxyXG5cdFx0cmV0dXJuIE1hdGguYWJzKGEgKiBwb2ludC54ICsgYiAtIHBvaW50LnkpIC8gTWF0aC5zcXJ0KGEgKiBhICsgMSlcclxuXHJcblx0IyBQb2ludCBSZWxhdGVkXHJcblxyXG5cdGludGVycG9sYXRlQmV0d2VlblR3b1BvaW50czogKHAxLCBwMiwgaywgcDMpIC0+XHJcblx0XHR4ID0gcDEueCArIChwMi54IC0gcDEueCkgKiBrXHJcblx0XHR5ID0gcDEueSArIChwMi55IC0gcDEueSkgKiBrXHJcblxyXG5cdFx0aWYgcDM/XHJcblx0XHRcdHAzLnNldCB4LCB5XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBuZXcgQnUuUG9pbnQgeCwgeVxyXG5cclxuXHQjIFBvaW50IGFuZCBMaW5lXHJcblxyXG5cdHR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lOiAocDEsIHAyLCBsaW5lKSAtPlxyXG5cdFx0cEEgPSBsaW5lLnBvaW50c1swXVxyXG5cdFx0cEIgPSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0aWYgcEEueCA9PSBwQi54XHJcblx0XHRcdCMgaWYgYm90aCBvZiB0aGUgdHdvIHBvaW50cyBhcmUgb24gdGhlIGxpbmUgdGhlbiB3ZSBjb25zaWRlciB0aGV5IGFyZSBpbiB0aGUgc2FtZSBzaWRlXHJcblx0XHRcdHJldHVybiAocDEueCAtIHBBLngpICogKHAyLnggLSBwQS54KSA+IDBcclxuXHRcdGVsc2VcclxuXHRcdFx0eTAxID0gKHBBLnkgLSBwQi55KSAqIChwMS54IC0gcEEueCkgLyAocEEueCAtIHBCLngpICsgcEEueVxyXG5cdFx0XHR5MDIgPSAocEEueSAtIHBCLnkpICogKHAyLnggLSBwQS54KSAvIChwQS54IC0gcEIueCkgKyBwQS55XHJcblx0XHRcdHJldHVybiAocDEueSAtIHkwMSkgKiAocDIueSAtIHkwMikgPiAwXHJcblxyXG5cdGZvb3RQb2ludEZyb21Qb2ludFRvTGluZTogKHBvaW50LCBsaW5lLCBzYXZlVG8gPSBuZXcgQnUuUG9pbnQpIC0+XHJcblx0XHRwMSA9IGxpbmUucG9pbnRzWzBdXHJcblx0XHRwMiA9IGxpbmUucG9pbnRzWzFdXHJcblx0XHRBID0gKHAxLnkgLSBwMi55KSAvIChwMS54IC0gcDIueClcclxuXHRcdEIgPSBwMS55IC0gQSAqIHAxLnhcclxuXHRcdG0gPSBwb2ludC54ICsgQSAqIHBvaW50LnlcclxuXHRcdHggPSAobSAtIEEgKiBCKSAvIChBICogQSArIDEpXHJcblx0XHR5ID0gQSAqIHggKyBCXHJcblxyXG5cdFx0c2F2ZVRvLnNldCB4LCB5XHJcblx0XHRyZXR1cm4gc2F2ZVRvXHJcblxyXG5cdGdldENyb3NzUG9pbnRPZlR3b0xpbmVzOiAobGluZTEsIGxpbmUyKSAtPlxyXG5cdFx0W3AxLCBwMl0gPSBsaW5lMS5wb2ludHNcclxuXHRcdFtxMSwgcTJdID0gbGluZTIucG9pbnRzXHJcblxyXG5cdFx0YTEgPSBwMi55IC0gcDEueVxyXG5cdFx0YjEgPSBwMS54IC0gcDIueFxyXG5cdFx0YzEgPSAoYTEgKiBwMS54KSArIChiMSAqIHAxLnkpXHJcblx0XHRhMiA9IHEyLnkgLSBxMS55XHJcblx0XHRiMiA9IHExLnggLSBxMi54XHJcblx0XHRjMiA9IChhMiAqIHExLngpICsgKGIyICogcTEueSlcclxuXHRcdGRldCA9IChhMSAqIGIyKSAtIChhMiAqIGIxKVxyXG5cclxuXHRcdHJldHVybiBuZXcgQnUuUG9pbnQgKChiMiAqIGMxKSAtIChiMSAqIGMyKSkgLyBkZXQsICgoYTEgKiBjMikgLSAoYTIgKiBjMSkpIC8gZGV0XHJcblxyXG5cdGlzVHdvTGluZXNDcm9zczogKGxpbmUxLCBsaW5lMikgLT5cclxuXHRcdHgxID0gbGluZTEucG9pbnRzWzBdLnhcclxuXHRcdHkxID0gbGluZTEucG9pbnRzWzBdLnlcclxuXHRcdHgyID0gbGluZTEucG9pbnRzWzFdLnhcclxuXHRcdHkyID0gbGluZTEucG9pbnRzWzFdLnlcclxuXHRcdHgzID0gbGluZTIucG9pbnRzWzBdLnhcclxuXHRcdHkzID0gbGluZTIucG9pbnRzWzBdLnlcclxuXHRcdHg0ID0gbGluZTIucG9pbnRzWzFdLnhcclxuXHRcdHk0ID0gbGluZTIucG9pbnRzWzFdLnlcclxuXHJcblx0XHRkID0gKHkyIC0geTEpICogKHg0IC0geDMpIC0gKHk0IC0geTMpICogKHgyIC0geDEpXHJcblxyXG5cdFx0aWYgZCA9PSAwXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR4MCA9ICgoeDIgLSB4MSkgKiAoeDQgLSB4MykgKiAoeTMgLSB5MSkgKyAoeTIgLSB5MSkgKiAoeDQgLSB4MykgKiB4MSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKSAqIHgzKSAvIGRcclxuXHRcdFx0eTAgPSAoKHkyIC0geTEpICogKHk0IC0geTMpICogKHgzIC0geDEpICsgKHgyIC0geDEpICogKHk0IC0geTMpICogeTEgLSAoeDQgLSB4MykgKiAoeTIgLSB5MSkgKiB5MykgLyAtZFxyXG5cdFx0cmV0dXJuICh4MCAtIHgxKSAqICh4MCAtIHgyKSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh4MCAtIHgzKSAqICh4MCAtIHg0KSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh5MCAtIHkxKSAqICh5MCAtIHkyKSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh5MCAtIHkzKSAqICh5MCAtIHk0KSA8IDBcclxuXHJcblx0IyBQb2x5bGluZVxyXG5cclxuXHRjYWxjUG9seWxpbmVMZW5ndGg6IChwb2x5bGluZSkgLT5cclxuXHRcdGxlbiA9IDBcclxuXHRcdGlmIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCA+PSAyXHJcblx0XHRcdGZvciBpIGluIFsxIC4uLiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdFx0bGVuICs9IHBvbHlsaW5lLnZlcnRpY2VzW2ldLmRpc3RhbmNlVG8gcG9seWxpbmUudmVydGljZXNbaSAtIDFdXHJcblx0XHRyZXR1cm4gbGVuXHJcblxyXG5cdGNhbGNOb3JtYWxpemVkVmVydGljZXNQb3NPZlBvbHlsaW5lOiAocG9seWxpbmUpIC0+XHJcblx0XHRjdXJyUG9zID0gMFxyXG5cdFx0cG9seWxpbmUucG9pbnROb3JtYWxpemVkUG9zWzBdID0gMFxyXG5cdFx0Zm9yIGkgaW4gWzEgLi4uIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aF1cclxuXHRcdFx0Y3VyclBvcyArPSBwb2x5bGluZS52ZXJ0aWNlc1tpXS5kaXN0YW5jZVRvKHBvbHlsaW5lLnZlcnRpY2VzW2kgLSAxXSkgLyBwb2x5bGluZS5sZW5ndGhcclxuXHRcdFx0cG9seWxpbmUucG9pbnROb3JtYWxpemVkUG9zW2ldID0gY3VyclBvc1xyXG5cclxuXHRjb21wcmVzc1BvbHlsaW5lOiAocG9seWxpbmUsIHN0cmVuZ3RoKSAtPlxyXG5cdFx0Y29tcHJlc3NlZCA9IFtdXHJcblx0XHRmb3Igb3duIGkgb2YgcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0aWYgaSA8IDJcclxuXHRcdFx0XHRjb21wcmVzc2VkW2ldID0gcG9seWxpbmUudmVydGljZXNbaV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFtwQSwgcE1dID0gY29tcHJlc3NlZFstMi4uLTFdXHJcblx0XHRcdFx0cEIgPSBwb2x5bGluZS52ZXJ0aWNlc1tpXVxyXG5cdFx0XHRcdG9ibGlxdWVBbmdsZSA9IE1hdGguYWJzKE1hdGguYXRhbjIocEEueSAtIHBNLnksIHBBLnggLSBwTS54KSAtIE1hdGguYXRhbjIocE0ueSAtIHBCLnksIHBNLnggLSBwQi54KSlcclxuXHRcdFx0XHRpZiBvYmxpcXVlQW5nbGUgPCBzdHJlbmd0aCAqIHN0cmVuZ3RoICogQnUuSEFMRl9QSVxyXG5cdFx0XHRcdFx0Y29tcHJlc3NlZFtjb21wcmVzc2VkLmxlbmd0aCAtIDFdID0gcEJcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRjb21wcmVzc2VkLnB1c2ggcEJcclxuXHRcdHBvbHlsaW5lLnZlcnRpY2VzID0gY29tcHJlc3NlZFxyXG5cdFx0cG9seWxpbmUua2V5UG9pbnRzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdHJldHVybiBwb2x5bGluZVxyXG5cclxuXHQjIEFyZWEgQ2FsY3VsYXRpb25cclxuXHJcblx0Y2FsY1RyaWFuZ2xlQXJlYTogKHRyaWFuZ2xlKSAtPlxyXG5cdFx0W2EsIGIsIGNdID0gdHJpYW5nbGUucG9pbnRzXHJcblx0XHRyZXR1cm4gTWF0aC5hYnMoKChiLnggLSBhLngpICogKGMueSAtIGEueSkpIC0gKChjLnggLSBhLngpICogKGIueSAtIGEueSkpKSAvIDJcclxuXHJcbkcuaW5qZWN0KClcclxuIiwiIyBVc2VkIHRvIGdlbmVyYXRlIHJhbmRvbSBzaGFwZXNcclxuXHJcbmNsYXNzIEJ1LlNoYXBlUmFuZG9taXplclxyXG5cclxuXHRNQVJHSU4gPSAzMFxyXG5cclxuXHRyYW5nZVg6IDBcclxuXHRyYW5nZVk6IDBcclxuXHRyYW5nZVdpZHRoOiA4MDBcclxuXHRyYW5nZUhlaWdodDogNDUwXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAtPlxyXG5cclxuXHRyYW5kb21YOiAtPlxyXG5cdFx0QnUucmFuZCBAcmFuZ2VYICsgTUFSR0lOLCBAcmFuZ2VYICsgQHJhbmdlV2lkdGggLSBNQVJHSU4gKiAyXHJcblxyXG5cdHJhbmRvbVk6IC0+XHJcblx0XHRCdS5yYW5kIEByYW5nZVkgKyBNQVJHSU4sIEByYW5nZVkgKyBAcmFuZ2VIZWlnaHQgLSBNQVJHSU4gKiAyXHJcblxyXG5cdHJhbmRvbVJhZGl1czogLT5cclxuXHRcdEJ1LnJhbmQgMTAsIE1hdGgubWluKEByYW5nZVggKyBAcmFuZ2VXaWR0aCwgQHJhbmdlWSArIEByYW5nZUhlaWdodCkgLyAyXHJcblxyXG5cdHNldFJhbmdlOiAoYSwgYiwgYywgZCkgLT5cclxuXHRcdGlmIGM/XHJcblx0XHRcdEByYW5nZVggPSBhXHJcblx0XHRcdEByYW5nZVkgPSBiXHJcblx0XHRcdEByYW5nZVdpZHRoID0gY1xyXG5cdFx0XHRAcmFuZ2VIZWlnaHQgPSBkXHJcblx0XHRlbHNlXHJcblx0XHRcdEByYW5nZVdpZHRoID0gYVxyXG5cdFx0XHRAcmFuZ2VIZWlnaHQgPSBiXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlOiAodHlwZSkgLT5cclxuXHRcdHN3aXRjaCB0eXBlXHJcblx0XHRcdHdoZW4gJ2NpcmNsZScgdGhlbiBAZ2VuZXJhdGVDaXJjbGUoKVxyXG5cdFx0XHR3aGVuICdib3cnIHRoZW4gQGdlbmVyYXRlQm93KClcclxuXHRcdFx0d2hlbiAndHJpYW5nbGUnIHRoZW4gQGdlbmVyYXRlVHJpYW5nbGUoKVxyXG5cdFx0XHR3aGVuICdyZWN0YW5nbGUnIHRoZW4gQGdlbmVyYXRlUmVjdGFuZ2xlKClcclxuXHRcdFx0d2hlbiAnZmFuJyB0aGVuIEBnZW5lcmF0ZUZhbigpXHJcblx0XHRcdHdoZW4gJ3BvbHlnb24nIHRoZW4gQGdlbmVyYXRlUG9seWdvbigpXHJcblx0XHRcdHdoZW4gJ2xpbmUnIHRoZW4gQGdlbmVyYXRlTGluZSgpXHJcblx0XHRcdHdoZW4gJ3BvbHlsaW5lJyB0aGVuIEBnZW5lcmF0ZVBvbHlsaW5lKClcclxuXHRcdFx0ZWxzZSBjb25zb2xlLndhcm4gJ25vdCBzdXBwb3J0IHNoYXBlOiAnICsgdHlwZVxyXG5cclxuXHRyYW5kb21pemU6IChzaGFwZSkgLT5cclxuXHRcdGlmIEJ1LmlzQXJyYXkgc2hhcGVcclxuXHRcdFx0QHJhbmRvbWl6ZSBzIGZvciBzIGluIHNoYXBlXHJcblx0XHRlbHNlXHJcblx0XHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEByYW5kb21pemVDaXJjbGUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdFbGxpcHNlJyB0aGVuIEByYW5kb21pemVFbGxpcHNlIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnQm93JyB0aGVuIEByYW5kb21pemVCb3cgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdUcmlhbmdsZScgdGhlbiBAcmFuZG9taXplVHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdSZWN0YW5nbGUnIHRoZW4gQHJhbmRvbWl6ZVJlY3RhbmdsZSBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAcmFuZG9taXplRmFuIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAcmFuZG9taXplUG9seWdvbiBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ0xpbmUnIHRoZW4gQHJhbmRvbWl6ZUxpbmUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdQb2x5bGluZScgdGhlbiBAcmFuZG9taXplUG9seWxpbmUgc2hhcGVcclxuXHRcdFx0XHRlbHNlIGNvbnNvbGUud2FybiAnbm90IHN1cHBvcnQgc2hhcGU6ICcgKyBzaGFwZS50eXBlXHJcblx0XHRAXHJcblxyXG5cdHJhbmRvbWl6ZVBvc2l0aW9uOiAoc2hhcGUpIC0+XHJcblx0XHRzaGFwZS5wb3NpdGlvbi54ID0gQHJhbmRvbVgoKVxyXG5cdFx0c2hhcGUucG9zaXRpb24ueSA9IEByYW5kb21ZKClcclxuXHRcdHNoYXBlLnRyaWdnZXIgJ2NoYW5nZWQnXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlQ2lyY2xlOiAtPlxyXG5cdFx0Y2lyY2xlID0gbmV3IEJ1LkNpcmNsZSBAcmFuZG9tUmFkaXVzKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGNpcmNsZS5jZW50ZXIubGFiZWwgPSAnTydcclxuXHRcdGNpcmNsZVxyXG5cclxuXHRyYW5kb21pemVDaXJjbGU6IChjaXJjbGUpIC0+XHJcblx0XHRjaXJjbGUuY3ggPSBAcmFuZG9tWCgpXHJcblx0XHRjaXJjbGUuY3kgPSBAcmFuZG9tWSgpXHJcblx0XHRjaXJjbGUucmFkaXVzID0gQHJhbmRvbVJhZGl1cygpXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlRWxsaXBzZTogLT5cclxuXHRcdGVsbGlwc2UgPSBuZXcgQnUuRWxsaXBzZSBAcmFuZG9tUmFkaXVzKCksIEByYW5kb21SYWRpdXMoKVxyXG5cdFx0QHJhbmRvbWl6ZVBvc2l0aW9uIGVsbGlwc2VcclxuXHRcdGVsbGlwc2VcclxuXHJcblx0cmFuZG9taXplRWxsaXBzZTogKGVsbGlwc2UpIC0+XHJcblx0XHRlbGxpcHNlLnJhZGl1c1ggPSBAcmFuZG9tUmFkaXVzKClcclxuXHRcdGVsbGlwc2UucmFkaXVzWSA9IEByYW5kb21SYWRpdXMoKVxyXG5cdFx0QHJhbmRvbWl6ZVBvc2l0aW9uIGVsbGlwc2VcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVCb3c6IC0+XHJcblx0XHRhRnJvbSA9IEJ1LnJhbmQgQnUuVFdPX1BJXHJcblx0XHRhVG8gPSBhRnJvbSArIEJ1LnJhbmQgQnUuSEFMRl9QSSwgQnUuVFdPX1BJXHJcblxyXG5cdFx0Ym93ID0gbmV3IEJ1LkJvdyBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tUmFkaXVzKCksIGFGcm9tLCBhVG9cclxuXHRcdGJvdy5zdHJpbmcucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRib3cuc3RyaW5nLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0Ym93XHJcblxyXG5cdHJhbmRvbWl6ZUJvdzogKGJvdykgLT5cclxuXHRcdGFGcm9tID0gQnUucmFuZCBCdS5UV09fUElcclxuXHRcdGFUbyA9IGFGcm9tICsgQnUucmFuZCBCdS5IQUxGX1BJLCBCdS5UV09fUElcclxuXHJcblx0XHRib3cuY3ggPSBAcmFuZG9tWCgpXHJcblx0XHRib3cuY3kgPSBAcmFuZG9tWSgpXHJcblx0XHRib3cucmFkaXVzID0gQHJhbmRvbVJhZGl1cygpXHJcblx0XHRib3cuYUZyb20gPSBhRnJvbVxyXG5cdFx0Ym93LmFUbyA9IGFUb1xyXG5cdFx0Ym93LnRyaWdnZXIgJ2NoYW5nZWQnXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlRmFuOiAtPlxyXG5cdFx0YUZyb20gPSBCdS5yYW5kIEJ1LlRXT19QSVxyXG5cdFx0YVRvID0gYUZyb20gKyBCdS5yYW5kIEJ1LkhBTEZfUEksIEJ1LlRXT19QSVxyXG5cclxuXHRcdGZhbiA9IG5ldyBCdS5GYW4gQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSwgQHJhbmRvbVJhZGl1cygpLCBhRnJvbSwgYVRvXHJcblx0XHRmYW4uY2VudGVyLmxhYmVsID0gJ08nXHJcblx0XHRmYW4uc3RyaW5nLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0ZmFuLnN0cmluZy5wb2ludHNbMV0ubGFiZWwgPSAnQidcclxuXHRcdGZhblxyXG5cclxuXHRyYW5kb21pemVGYW46IEA6OnJhbmRvbWl6ZUJvd1xyXG5cclxuXHRnZW5lcmF0ZVRyaWFuZ2xlOiAtPlxyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGZvciBpIGluIFswLi4yXVxyXG5cdFx0XHRwb2ludHNbaV0gPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cclxuXHRcdHRyaWFuZ2xlID0gbmV3IEJ1LlRyaWFuZ2xlIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl1cclxuXHRcdHRyaWFuZ2xlLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0dHJpYW5nbGUucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHR0cmlhbmdsZS5wb2ludHNbMl0ubGFiZWwgPSAnQydcclxuXHRcdHRyaWFuZ2xlXHJcblxyXG5cdHJhbmRvbWl6ZVRyaWFuZ2xlOiAodHJpYW5nbGUpIC0+XHJcblx0XHR0cmlhbmdsZS5wb2ludHNbaV0uc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCkgZm9yIGkgaW4gWzAuLjJdXHJcblx0XHR0cmlhbmdsZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVJlY3RhbmdsZTogLT5cclxuXHRcdHJlY3QgPSBuZXcgQnUuUmVjdGFuZ2xlKFxyXG5cdFx0XHRCdS5yYW5kKEByYW5nZVdpZHRoKVxyXG5cdFx0XHRCdS5yYW5kKEByYW5nZUhlaWdodClcclxuXHRcdFx0QnUucmFuZChAcmFuZ2VXaWR0aCAvIDIpXHJcblx0XHRcdEJ1LnJhbmQoQHJhbmdlSGVpZ2h0IC8gMilcclxuXHRcdClcclxuXHRcdHJlY3QucG9pbnRMVC5sYWJlbCA9ICdBJ1xyXG5cdFx0cmVjdC5wb2ludFJULmxhYmVsID0gJ0InXHJcblx0XHRyZWN0LnBvaW50UkIubGFiZWwgPSAnQydcclxuXHRcdHJlY3QucG9pbnRMQi5sYWJlbCA9ICdEJ1xyXG5cdFx0cmVjdFxyXG5cclxuXHRyYW5kb21pemVSZWN0YW5nbGU6IChyZWN0YW5nbGUpIC0+XHJcblx0XHRyZWN0YW5nbGUuc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdHJlY3RhbmdsZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVBvbHlnb246IC0+XHJcblx0XHRwb2ludHMgPSBbXVxyXG5cclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2ludHMucHVzaCBwb2ludFxyXG5cclxuXHRcdG5ldyBCdS5Qb2x5Z29uIHBvaW50c1xyXG5cclxuXHRyYW5kb21pemVQb2x5Z29uOiAocG9seWdvbikgLT5cclxuXHRcdHZlcnRleC5zZXQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSBmb3IgdmVydGV4IGluIHBvbHlnb24udmVydGljZXNcclxuXHRcdHBvbHlnb24udHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVMaW5lOiAtPlxyXG5cdFx0bGluZSA9IG5ldyBCdS5MaW5lIEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGxpbmUucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRsaW5lLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0bGluZVxyXG5cclxuXHRyYW5kb21pemVMaW5lOiAobGluZSkgLT5cclxuXHRcdHBvaW50LnNldCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpIGZvciBwb2ludCBpbiBsaW5lLnBvaW50c1xyXG5cdFx0bGluZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVBvbHlsaW5lOiAtPlxyXG5cdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2x5bGluZS5hZGRQb2ludCBwb2ludFxyXG5cdFx0cG9seWxpbmVcclxuXHJcblx0cmFuZG9taXplUG9seWxpbmU6IChwb2x5bGluZSkgLT5cclxuXHRcdHZlcnRleC5zZXQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSBmb3IgdmVydGV4IGluIHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRwb2x5bGluZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG4iXX0=

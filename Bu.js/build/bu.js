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

    Object2D.prototype.addChild = function(shape) {
      var j, len, s;
      if (Bu.isArray(shape)) {
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          this.children.push(s);
        }
      } else {
        this.children.push(shape);
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

    Object2D.prototype.hitTest = function(p) {
      p.unProject(this);
      return this.containsPoint(p);
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
            parent.children.push(_this.$objects[name]);
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
      this.scene = new Bu.Scene;
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

    function Scene() {
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

    ShapeRandomizer.prototype.rangeWidth = 800;

    ShapeRandomizer.prototype.rangeHeight = 450;

    function ShapeRandomizer() {}

    ShapeRandomizer.prototype.randomX = function() {
      return Bu.rand(MARGIN, this.rangeWidth - MARGIN * 2);
    };

    ShapeRandomizer.prototype.randomY = function() {
      return Bu.rand(MARGIN, this.rangeHeight - MARGIN * 2);
    };

    ShapeRandomizer.prototype.randomRadius = function() {
      return Bu.rand(5, Math.min(this.rangeWidth, this.rangeHeight) / 2);
    };

    ShapeRandomizer.prototype.setRange = function(w, h) {
      this.rangeWidth = w;
      return this.rangeHeight = h;
    };

    ShapeRandomizer.prototype.generate = function(type) {
      switch (type) {
        case 'circle':
          this.generateCircle();
          break;
        case 'bow':
          this.generateBow();
          break;
        case 'triangle':
          this.generateTriangle();
          break;
        case 'rectangle':
          this.generateRectangle();
          break;
        case 'fan':
          this.generateFan();
          break;
        case 'polygon':
          this.generatePolygon();
          break;
        case 'line':
          this.generateLine();
          break;
        case 'polyline':
          this.generatePolyline();
          break;
        default:
          console.warn('not support shape: ' + type);
      }
      return this.rangeHeight = h;
    };

    ShapeRandomizer.prototype.randomize = function(shape) {
      var j, len, results, s;
      if (Bu.isArray(shape)) {
        results = [];
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          results.push(this.randomize(s));
        }
        return results;
      } else {
        switch (shape.type) {
          case 'Circle':
            return this.randomizeCircle(shape);
          case 'Ellipse':
            return this.randomizeEllipse(shape);
          case 'Bow':
            return this.randomizeBow(shape);
          case 'Triangle':
            return this.randomizeTriangle(shape);
          case 'Rectangle':
            return this.randomizeRectangle(shape);
          case 'Fan':
            return this.randomizeFan(shape);
          case 'Polygon':
            return this.randomizePolygon(shape);
          case 'Line':
            return this.randomizeLine(shape);
          case 'Polyline':
            return this.randomizePolyline(shape);
          default:
            return console.warn('not support shape: ' + shape.type);
        }
      }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1LmNvZmZlZSIsIkJvdW5kcy5jb2ZmZWUiLCJDb2xvci5jb2ZmZWUiLCJTaXplLmNvZmZlZSIsIlZlY3Rvci5jb2ZmZWUiLCJFdmVudC5jb2ZmZWUiLCJNaWNyb0pRdWVyeS5jb2ZmZWUiLCJPYmplY3QyRC5jb2ZmZWUiLCJTdHlsZWQuY29mZmVlIiwiQXBwLmNvZmZlZSIsIkF1ZGlvLmNvZmZlZSIsIkNhbWVyYS5jb2ZmZWUiLCJSZW5kZXJlci5jb2ZmZWUiLCJTY2VuZS5jb2ZmZWUiLCJCb3cuY29mZmVlIiwiQ2lyY2xlLmNvZmZlZSIsIkVsbGlwc2UuY29mZmVlIiwiRmFuLmNvZmZlZSIsIkxpbmUuY29mZmVlIiwiUG9pbnQuY29mZmVlIiwiUG9seWdvbi5jb2ZmZWUiLCJQb2x5bGluZS5jb2ZmZWUiLCJSZWN0YW5nbGUuY29mZmVlIiwiU3BsaW5lLmNvZmZlZSIsIlRyaWFuZ2xlLmNvZmZlZSIsIkltYWdlLmNvZmZlZSIsIlBvaW50VGV4dC5jb2ZmZWUiLCJBbmltYXRpb24uY29mZmVlIiwiQW5pbWF0aW9uUnVubmVyLmNvZmZlZSIsIkFuaW1hdGlvblRhc2suY29mZmVlIiwiRGFzaEZsb3dNYW5hZ2VyLmNvZmZlZSIsIlNwcml0ZVNoZWV0LmNvZmZlZSIsIklucHV0TWFuYWdlci5jb2ZmZWUiLCJNb3VzZUNvbnRyb2wuY29mZmVlIiwiZ2VvbWV0cnlBbGdvcml0aG0uY29mZmVlIiwiU2hhcGVSYW5kb21pemVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUE7QUFBQSxNQUFBLDBDQUFBO0lBQUE7O0VBQUEsTUFBQSxHQUFTLE1BQUEsSUFBVTs7RUFDbkIsTUFBTSxDQUFDLEVBQVAsR0FBWTtJQUFDLFFBQUEsTUFBRDs7O0VBUVosRUFBRSxDQUFDLE9BQUgsR0FBYTs7RUFHYixFQUFFLENBQUMsdUJBQUgsR0FBNkIsQ0FBQyxRQUFELEVBQVcsS0FBWCxFQUFrQixJQUFsQjs7RUFHN0IsRUFBRSxDQUFDLE9BQUgsR0FBYSxJQUFJ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QUFDakIsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztBQUNsQixXQUFTLDBCQUFUO1FBQ0MsS0FBQSxHQUFZLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVQsRUFBcUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFyQjtRQUNaLEtBQUssQ0FBQyxLQUFOLEdBQWMsR0FBQSxHQUFNO1FBQ3BCLFFBQVEsQ0FBQyxRQUFULENBQWtCLEtBQWxCO0FBSEQ7YUFJQTtJQU5pQjs7OEJBUWxCLGlCQUFBLEdBQW1CLFNBQUMsUUFBRDtBQUNsQixVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFYLEVBQXVCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdkI7QUFBQTtNQUNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQWpCO2FBQ0E7SUFIa0I7Ozs7O0FBcExwQiIsImZpbGUiOiJidS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgTmFtZXNwYWNlLCBjb25zdGFudHMsIHV0aWxpdHkgZnVuY3Rpb25zIGFuZCBwb2x5ZmlsbHNcclxuXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgTmFtZXNwYWNlXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5nbG9iYWwgPSB3aW5kb3cgb3IgQFxyXG5nbG9iYWwuQnUgPSB7Z2xvYmFsfVxyXG5cclxuXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQ29uc3RhbnRzXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIFZlcnNpb24gaW5mb1xyXG5CdS5WRVJTSU9OID0gJzAuNC4wJ1xyXG5cclxuIyBCcm93c2VyIHZlbmRvciBwcmVmaXhlcywgdXNlZCBpbiBleHBlcmltZW50YWwgZmVhdHVyZXNcclxuQnUuQlJPV1NFUl9WRU5ET1JfUFJFRklYRVMgPSBbJ3dlYmtpdCcsICdtb3onLCAnbXMnXVxyXG5cclxuIyBNYXRoXHJcbkJ1LkhBTEZfUEkgPSBNYXRoLlBJIC8gMlxyXG5CdS5UV09fUEkgPSBNYXRoLlBJICogMlxyXG5cclxuIyBEZWZhdWx0IGZvbnQgZm9yIHRoZSB0ZXh0XHJcbkJ1LkRFRkFVTFRfRk9OVF9GQU1JTFkgPSAnVmVyZGFuYSdcclxuQnUuREVGQVVMVF9GT05UX1NJWkUgPSAxMVxyXG5CdS5ERUZBVUxUX0ZPTlQgPSAnMTFweCBWZXJkYW5hJ1xyXG5cclxuIyBQb2ludCBpcyByZW5kZXJlZCBhcyBhIHNtYWxsIGNpcmNsZSBvbiBzY3JlZW4uIFRoaXMgaXMgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlLlxyXG5CdS5QT0lOVF9SRU5ERVJfU0laRSA9IDIuMjVcclxuXHJcbiMgUG9pbnQgY2FuIGhhdmUgYSBsYWJlbCBhdHRhY2hlZCBuZWFyIGl0LiBUaGlzIGlzIHRoZSBnYXAgZGlzdGFuY2UgYmV0d2VlbiB0aGVtLlxyXG5CdS5QT0lOVF9MQUJFTF9PRkZTRVQgPSA1XHJcblxyXG4jIERlZmF1bHQgc21vb3RoIGZhY3RvciBvZiBzcGxpbmUsIHJhbmdlIGluIFswLCAxXSBhbmQgMSBpcyB0aGUgc21vb3RoZXN0XHJcbkJ1LkRFRkFVTFRfU1BMSU5FX1NNT09USCA9IDAuMjVcclxuXHJcbiMgSG93IGNsb3NlIGEgcG9pbnQgdG8gYSBsaW5lIGlzIHJlZ2FyZGVkIHRoYXQgdGhlIHBvaW50IGlzICoqT04qKiB0aGUgbGluZS5cclxuQnUuREVGQVVMVF9ORUFSX0RJU1QgPSA1XHJcblxyXG4jIEVudW1lcmF0aW9uIG9mIG1vdXNlIGJ1dHRvbnMsIHVzZWQgdG8gY29tcGFyZSB3aXRoIGBlLmJ1dHRvbnNgIG9mIG1vdXNlIGV2ZW50c1xyXG5CdS5NT1VTRSA9XHJcblx0Tk9ORTogICAwXHJcblx0TEVGVDogICAxXHJcblx0UklHSFQ6IDJcclxuXHRNSURETEU6ICA0XHJcblxyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBDYWxjdWxhdGUgdGhlIG1lYW4gdmFsdWUgb2YgbnVtYmVyc1xyXG5CdS5hdmVyYWdlID0gKCktPlxyXG5cdG5zID0gYXJndW1lbnRzXHJcblx0bnMgPSBhcmd1bWVudHNbMF0gaWYgdHlwZW9mIGFyZ3VtZW50c1swXSBpcyAnb2JqZWN0J1xyXG5cdHN1bSA9IDBcclxuXHRmb3IgaSBpbiBuc1xyXG5cdFx0c3VtICs9IGlcclxuXHRzdW0gLyBucy5sZW5ndGhcclxuXHJcbiMgQ2FsY3VsYXRlIHRoZSBoeXBvdGVudXNlIGZyb20gdGhlIGNhdGhldHVzZXNcclxuQnUuYmV2ZWwgPSAoeCwgeSkgLT5cclxuXHRNYXRoLnNxcnQgeCAqIHggKyB5ICogeVxyXG5cclxuIyBMaW1pdCBhIG51bWJlciBieSBtaW5pbXVtIHZhbHVlIGFuZCBtYXhpbXVtIHZhbHVlXHJcbkJ1LmNsYW1wID0gKHgsIG1pbiwgbWF4KSAtPlxyXG5cdHggPSBtaW4gaWYgeCA8IG1pblxyXG5cdHggPSBtYXggaWYgeCA+IG1heFxyXG5cdHhcclxuXHJcbiMgR2VuZXJhdGUgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIG51bWJlcnNcclxuQnUucmFuZCA9IChmcm9tLCB0bykgLT5cclxuXHRpZiBub3QgdG8/XHJcblx0XHR0byA9IGZyb21cclxuXHRcdGZyb20gPSAwXHJcblx0TWF0aC5yYW5kb20oKSAqICh0byAtIGZyb20pICsgZnJvbVxyXG5cclxuIyBDb252ZXJ0IGFuIGFuZ2xlIGZyb20gcmFkaWFuIHRvIGRlZ1xyXG5CdS5yMmQgPSAocikgLT4gKHIgKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKDEpXHJcblxyXG4jIENvbnZlcnQgYW4gYW5nbGUgZnJvbSBkZWcgdG8gcmFkaWFuXHJcbkJ1LmQyciA9IChyKSAtPiByICogTWF0aC5QSSAvIDE4MFxyXG5cclxuIyBHZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wXHJcbkJ1Lm5vdyA9IGlmIEJ1Lmdsb2JhbC5wZXJmb3JtYW5jZT8gdGhlbiAtPiBCdS5nbG9iYWwucGVyZm9ybWFuY2Uubm93KCkgZWxzZSAtPiBEYXRlLm5vdygpXHJcblxyXG4jIENvbWJpbmUgdGhlIGdpdmVuIG9wdGlvbnMgKGxhc3QgaXRlbSBvZiBhcmd1bWVudHMpIHdpdGggdGhlIGRlZmF1bHQgb3B0aW9uc1xyXG5CdS5jb21iaW5lT3B0aW9ucyA9IChhcmdzLCBkZWZhdWx0T3B0aW9ucykgLT5cclxuXHRkZWZhdWx0T3B0aW9ucyA9IHt9IGlmIG5vdCBkZWZhdWx0T3B0aW9ucz9cclxuXHRnaXZlbk9wdGlvbnMgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cclxuXHRpZiBCdS5pc1BsYWluT2JqZWN0IGdpdmVuT3B0aW9uc1xyXG5cdFx0Zm9yIGkgb2YgZ2l2ZW5PcHRpb25zIHdoZW4gZ2l2ZW5PcHRpb25zW2ldP1xyXG5cdFx0XHRkZWZhdWx0T3B0aW9uc1tpXSA9IGdpdmVuT3B0aW9uc1tpXVxyXG5cdHJldHVybiBkZWZhdWx0T3B0aW9uc1xyXG5cclxuIyBDaGVjayBpZiBhbiB2YXJpYWJsZSBpcyBhIG51bWJlclxyXG5CdS5pc051bWJlciA9IChvKSAtPlxyXG5cdHR5cGVvZiBvID09ICdudW1iZXInXHJcblxyXG4jIENoZWNrIGlmIGFuIHZhcmlhYmxlIGlzIGEgc3RyaW5nXHJcbkJ1LmlzU3RyaW5nID0gKG8pIC0+XHJcblx0dHlwZW9mIG8gPT0gJ3N0cmluZydcclxuXHJcbiMgQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGFuIHBsYWluIG9iamVjdCwgbm90IGluc3RhbmNlIG9mIGNsYXNzL2Z1bmN0aW9uXHJcbkJ1LmlzUGxhaW5PYmplY3QgPSAobykgLT5cclxuXHRvIGluc3RhbmNlb2YgT2JqZWN0IGFuZCBvLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ09iamVjdCdcclxuXHJcbiMgQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGEgZnVuY3Rpb25cclxuQnUuaXNGdW5jdGlvbiA9IChvKSAtPlxyXG5cdG8gaW5zdGFuY2VvZiBPYmplY3QgYW5kIG8uY29uc3RydWN0b3IubmFtZSA9PSAnRnVuY3Rpb24nXHJcblxyXG4jIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhIEFycmF5XHJcbkJ1LmlzQXJyYXkgPSAobykgLT5cclxuXHRvIGluc3RhbmNlb2YgQXJyYXlcclxuXHJcbiMgQ2xvbmUgYW4gT2JqZWN0IG9yIEFycmF5XHJcbkJ1LmNsb25lID0gKHRhcmdldCkgLT5cclxuXHRpZiB0eXBlb2YodGFyZ2V0KSAhPSAnb2JqZWN0JyBvciB0YXJnZXQgPT0gbnVsbCBvciBCdS5pc0Z1bmN0aW9uIHRhcmdldFxyXG5cdFx0dGFyZ2V0XHJcblx0ZWxzZVxyXG5cdFx0cmV0dXJuIHRhcmdldC5jbG9uZSgpIGlmIHRhcmdldC5jbG9uZT9cclxuXHRcdFxyXG5cdFx0IyBGSVhNRSBjYXVzZSBzdGFjayBvdmVyZmxvdyB3aGVuIGl0cyBhIGNpcmN1bGFyIHN0cnVjdHVyZVxyXG5cdFx0aWYgQnUuaXNBcnJheSB0YXJnZXRcclxuXHRcdFx0Y2xvbmUgPSBbXVxyXG5cdFx0ZWxzZSBpZiBCdS5pc1BsYWluT2JqZWN0IHRhcmdldFxyXG5cdFx0XHRjbG9uZSA9IHt9XHJcblx0XHRlbHNlICMgaW5zdGFuY2Ugb2YgY2xhc3NcclxuXHRcdFx0Y2xvbmUgPSBPYmplY3QuY3JlYXRlIHRhcmdldC5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcclxuXHJcblx0XHRmb3Igb3duIGkgb2YgdGFyZ2V0XHJcblx0XHRcdGNsb25lW2ldID0gQnUuY2xvbmUgdGFyZ2V0W2ldXHJcblxyXG5cdFx0Y2xvbmVcclxuXHJcbiMgVXNlIGxvY2FsU3RvcmFnZSB0byBwZXJzaXN0IGRhdGFcclxuQnUuZGF0YSA9IChrZXksIHZhbHVlKSAtPlxyXG5cdGlmIHZhbHVlP1xyXG5cdFx0bG9jYWxTdG9yYWdlWydCdS4nICsga2V5XSA9IEpTT04uc3RyaW5naWZ5IHZhbHVlXHJcblx0ZWxzZVxyXG5cdFx0dmFsdWUgPSBsb2NhbFN0b3JhZ2VbJ0J1LicgKyBrZXldXHJcblx0XHRpZiB2YWx1ZT8gdGhlbiBKU09OLnBhcnNlIHZhbHVlIGVsc2UgbnVsbFxyXG5cclxuIyBFeGVjdXRlIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHlcclxuQnUucmVhZHkgPSAoY2IsIGNvbnRleHQsIGFyZ3MpIC0+XHJcblx0aWYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnXHJcblx0XHRjYi5hcHBseSBjb250ZXh0LCBhcmdzXHJcblx0ZWxzZVxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnRE9NQ29udGVudExvYWRlZCcsIC0+IGNiLmFwcGx5IGNvbnRleHQsIGFyZ3NcclxuXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgUG9seWZpbGxzXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIFNob3J0Y3V0IHRvIGRlZmluZSBhIHByb3BlcnR5IGZvciBhIGNsYXNzLiBUaGlzIGlzIHVzZWQgdG8gc29sdmUgdGhlIHByb2JsZW1cclxuIyB0aGF0IENvZmZlZVNjcmlwdCBkaWRuJ3Qgc3VwcG9ydCBnZXR0ZXJzIGFuZCBzZXR0ZXJzLlxyXG4jIGNsYXNzIFBlcnNvblxyXG4jICAgQGNvbnN0cnVjdG9yOiAoYWdlKSAtPlxyXG4jICAgICBAX2FnZSA9IGFnZVxyXG4jXHJcbiMgICBAcHJvcGVydHkgJ2FnZScsXHJcbiMgICAgIGdldDogLT4gQF9hZ2VcclxuIyAgICAgc2V0OiAodmFsKSAtPlxyXG4jICAgICAgIEBfYWdlID0gdmFsXHJcbiNcclxuRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2NcclxuXHJcbiMgTWFrZSBhIGNvcHkgb2YgdGhpcyBmdW5jdGlvbiB3aGljaCBoYXMgYSBsaW1pdGVkIHNob3J0ZXN0IGV4ZWN1dGluZyBpbnRlcnZhbC5cclxuRnVuY3Rpb246OnRocm90dGxlID0gKGxpbWl0ID0gMC41KSAtPlxyXG5cdGN1cnJUaW1lID0gMFxyXG5cdGxhc3RUaW1lID0gMFxyXG5cclxuXHRyZXR1cm4gKCkgPT5cclxuXHRcdGN1cnJUaW1lID0gRGF0ZS5ub3coKVxyXG5cdFx0aWYgY3VyclRpbWUgLSBsYXN0VGltZSA+IGxpbWl0ICogMTAwMFxyXG5cdFx0XHRAYXBwbHkgbnVsbCwgYXJndW1lbnRzXHJcblx0XHRcdGxhc3RUaW1lID0gY3VyclRpbWVcclxuXHJcbiMgTWFrZSBhIGNvcHkgb2YgdGhpcyBmdW5jdGlvbiB3aG9zZSBleGVjdXRpb24gd2lsbCBiZSBjb250aW51b3VzbHkgcHV0IG9mZlxyXG4jIGFmdGVyIGV2ZXJ5IGNhbGxpbmcgb2YgdGhpcyBmdW5jdGlvbi5cclxuRnVuY3Rpb246OmRlYm91bmNlID0gKGRlbGF5ID0gMC41KSAtPlxyXG5cdGFyZ3MgPSBudWxsXHJcblx0dGltZW91dCA9IG51bGxcclxuXHJcblx0bGF0ZXIgPSA9PlxyXG5cdFx0QGFwcGx5IG51bGwsIGFyZ3NcclxuXHJcblx0cmV0dXJuICgpIC0+XHJcblx0XHRhcmdzID0gYXJndW1lbnRzXHJcblx0XHRjbGVhclRpbWVvdXQgdGltZW91dFxyXG5cdFx0dGltZW91dCA9IHNldFRpbWVvdXQgbGF0ZXIsIGRlbGF5ICogMTAwMFxyXG5cclxuXHJcbiMgSXRlcmF0ZSB0aGlzIEFycmF5IGFuZCBkbyBzb21ldGhpbmcgd2l0aCB0aGUgaXRlbXMuXHJcbkFycmF5OjplYWNoIG9yPSAoZm4pIC0+XHJcblx0aSA9IDBcclxuXHR3aGlsZSBpIDwgQGxlbmd0aFxyXG5cdFx0Zm4gQFtpXVxyXG5cdFx0aSsrXHJcblx0cmV0dXJuIEBcclxuXHJcbiMgSXRlcmF0ZSB0aGlzIEFycmF5IGFuZCBtYXAgdGhlIGl0ZW1zIHRvIGEgbmV3IEFycmF5LlxyXG5BcnJheTo6bWFwIG9yPSAoZm4pIC0+XHJcblx0YXJyID0gW11cclxuXHRpID0gMFxyXG5cdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRhcnIucHVzaCBmbihAW2ldKVxyXG5cdFx0aSsrXHJcblx0cmV0dXJuIEBcclxuXHJcbiMgT3V0cHV0IHZlcnNpb24gaW5mbyB0byB0aGUgY29uc29sZSwgYXQgbW9zdCBvbmUgdGltZSBpbiBhIG1pbnV0ZS5cclxuY3VycmVudFRpbWUgPSBEYXRlLm5vdygpXHJcbmxhc3RUaW1lID0gQnUuZGF0YSAndmVyc2lvbi50aW1lc3RhbXAnXHJcbnVubGVzcyBsYXN0VGltZT8gYW5kIGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUgPCA2MCAqIDEwMDBcclxuXHRjb25zb2xlLmluZm8/ICdCdS5qcyB2JyArIEJ1LlZFUlNJT04gKyAnIC0gW2h0dHBzOi8vZ2l0aHViLmNvbS9qYXJ2aXNuaXUvQnUuanNdJ1xyXG5cdEJ1LmRhdGEgJ3ZlcnNpb24udGltZXN0YW1wJywgY3VycmVudFRpbWVcclxuIiwiIyMgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveFxyXG5cclxuY2xhc3MgQnUuQm91bmRzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHRhcmdldCkgLT5cclxuXHJcblx0XHQjIFRPRE8gdXNlIG1pbiwgbWF4OiBWZWN0b3JcclxuXHRcdEB4MSA9IEB5MSA9IEB4MiA9IEB5MiA9IDBcclxuXHRcdEBpc0VtcHR5ID0geWVzXHJcblxyXG5cdFx0QHBvaW50MSA9IG5ldyBCdS5WZWN0b3JcclxuXHRcdEBwb2ludDIgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0QHVwZGF0ZSgpXHJcblx0XHRAYmluZEV2ZW50KClcclxuXHJcblx0Y29udGFpbnNQb2ludDogKHApIC0+XHJcblx0XHRAeDEgPCBwLnggJiYgQHgyID4gcC54ICYmIEB5MSA8IHAueSAmJiBAeTIgPiBwLnlcclxuXHJcblx0dXBkYXRlOiA9PlxyXG5cdFx0QGNsZWFyKClcclxuXHRcdHN3aXRjaCBAdGFyZ2V0LnR5cGVcclxuXHRcdFx0d2hlbiAnTGluZScsICdUcmlhbmdsZScsICdSZWN0YW5nbGUnXHJcblx0XHRcdFx0Zm9yIHYgaW4gQHRhcmdldC5wb2ludHNcclxuXHRcdFx0XHRcdEBleHBhbmRCeVBvaW50KHYpXHJcblx0XHRcdHdoZW4gJ0NpcmNsZScsICdCb3cnLCAnRmFuJ1xyXG5cdFx0XHRcdEBleHBhbmRCeUNpcmNsZSBAdGFyZ2V0XHJcblx0XHRcdHdoZW4gJ1BvbHlsaW5lJywgJ1BvbHlnb24nXHJcblx0XHRcdFx0Zm9yIHYgaW4gQHRhcmdldC52ZXJ0aWNlc1xyXG5cdFx0XHRcdFx0QGV4cGFuZEJ5UG9pbnQodilcclxuXHRcdFx0d2hlbiAnRWxsaXBzZSdcclxuXHRcdFx0XHRAeDEgPSAtQHRhcmdldC5yYWRpdXNYXHJcblx0XHRcdFx0QHgyID0gQHRhcmdldC5yYWRpdXNYXHJcblx0XHRcdFx0QHkxID0gLUB0YXJnZXQucmFkaXVzWVxyXG5cdFx0XHRcdEB5MiA9IEB0YXJnZXQucmFkaXVzWVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiQm91bmRzOiBub3Qgc3VwcG9ydCBzaGFwZSB0eXBlICN7IEB0YXJnZXQudHlwZSB9XCJcclxuXHJcblx0YmluZEV2ZW50OiAtPlxyXG5cdFx0c3dpdGNoIEB0YXJnZXQudHlwZVxyXG5cdFx0XHR3aGVuICdDaXJjbGUnLCAnQm93JywgJ0ZhbidcclxuXHRcdFx0XHRAdGFyZ2V0Lm9uICdjZW50ZXJDaGFuZ2VkJywgQHVwZGF0ZVxyXG5cdFx0XHRcdEB0YXJnZXQub24gJ3JhZGl1c0NoYW5nZWQnLCBAdXBkYXRlXHJcblx0XHRcdHdoZW4gJ0VsbGlwc2UnXHJcblx0XHRcdFx0QHRhcmdldC5vbiAnY2hhbmdlZCcsIEB1cGRhdGVcclxuXHJcblx0Y2xlYXI6ICgpIC0+XHJcblx0XHRAeDEgPSBAeTEgPSBAeDIgPSBAeTIgPSAwXHJcblx0XHRAaXNFbXB0eSA9IHllc1xyXG5cdFx0QFxyXG5cclxuXHRleHBhbmRCeVBvaW50OiAodikgLT5cclxuXHRcdGlmIEBpc0VtcHR5XHJcblx0XHRcdEBpc0VtcHR5ID0gbm9cclxuXHRcdFx0QHgxID0gQHgyID0gdi54XHJcblx0XHRcdEB5MSA9IEB5MiA9IHYueVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAeDEgPSB2LnggaWYgdi54IDwgQHgxXHJcblx0XHRcdEB4MiA9IHYueCBpZiB2LnggPiBAeDJcclxuXHRcdFx0QHkxID0gdi55IGlmIHYueSA8IEB5MVxyXG5cdFx0XHRAeTIgPSB2LnkgaWYgdi55ID4gQHkyXHJcblx0XHRAXHJcblxyXG5cdGV4cGFuZEJ5Q2lyY2xlOiAoYykgLT5cclxuXHRcdGNwID0gYy5jZW50ZXJcclxuXHRcdHIgPSBjLnJhZGl1c1xyXG5cdFx0aWYgQGlzRW1wdHlcclxuXHRcdFx0QGlzRW1wdHkgPSBub1xyXG5cdFx0XHRAeDEgPSBjcC54IC0gclxyXG5cdFx0XHRAeDIgPSBjcC54ICsgclxyXG5cdFx0XHRAeTEgPSBjcC55IC0gclxyXG5cdFx0XHRAeTIgPSBjcC55ICsgclxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAeDEgPSBjcC54IC0gciBpZiBjcC54IC0gciA8IEB4MVxyXG5cdFx0XHRAeDIgPSBjcC54ICsgciBpZiBjcC54ICsgciA+IEB4MlxyXG5cdFx0XHRAeTEgPSBjcC55IC0gciBpZiBjcC55IC0gciA8IEB5MVxyXG5cdFx0XHRAeTIgPSBjcC55ICsgciBpZiBjcC55ICsgciA+IEB5MlxyXG5cdFx0QFxyXG4iLCIjIFBhcnNlIGFuZCBzZXJpYWxpemUgY29sb3JcbiMgVE9ETyBTdXBwb3J0IGhzbCgwLCAxMDAlLCA1MCUpIGZvcm1hdC5cblxuY2xhc3MgQnUuQ29sb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBAciA9IEBnID0gQGIgPSAyNTVcbiAgICAgICAgQGEgPSAxXG5cbiAgICAgICAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICBhcmcgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgICAgIGlmIEJ1LmlzU3RyaW5nIGFyZ1xuICAgICAgICAgICAgICAgIEBwYXJzZSBhcmdcbiAgICAgICAgICAgICAgICBAYSA9IGNsYW1wQWxwaGEgQGFcbiAgICAgICAgICAgIGVsc2UgaWYgYXJnIGluc3RhbmNlb2YgQnUuQ29sb3JcbiAgICAgICAgICAgICAgICBAY29weSBhcmdcbiAgICAgICAgZWxzZSAjIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMyBvciA0XG4gICAgICAgICAgICBAciA9IGFyZ3VtZW50c1swXVxuICAgICAgICAgICAgQGcgPSBhcmd1bWVudHNbMV1cbiAgICAgICAgICAgIEBiID0gYXJndW1lbnRzWzJdXG4gICAgICAgICAgICBAYSA9IGFyZ3VtZW50c1szXSBvciAxXG5cbiAgICBwYXJzZTogKHN0cikgLT5cbiAgICAgICAgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfUkdCQVxuICAgICAgICAgICAgQHIgPSBwYXJzZUludCBmb3VuZFsxXVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludCBmb3VuZFsyXVxuICAgICAgICAgICAgQGIgPSBwYXJzZUludCBmb3VuZFszXVxuICAgICAgICAgICAgQGEgPSBwYXJzZUZsb2F0IGZvdW5kWzRdXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfUkdCXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50IGZvdW5kWzFdXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50IGZvdW5kWzJdXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50IGZvdW5kWzNdXG4gICAgICAgICAgICBAYSA9IDFcbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JBX1BFUlxuICAgICAgICAgICAgQHIgPSBwYXJzZUludChmb3VuZFsxXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQoZm91bmRbMl0gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50KGZvdW5kWzNdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGEgPSBwYXJzZUZsb2F0IGZvdW5kWzRdXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfUkdCX1BFUlxuICAgICAgICAgICAgQHIgPSBwYXJzZUludChmb3VuZFsxXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQoZm91bmRbMl0gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50KGZvdW5kWzNdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfSEVYM1xuICAgICAgICAgICAgaGV4ID0gZm91bmRbMV1cbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgaGV4WzBdLCAxNlxuICAgICAgICAgICAgQHIgPSBAciAqIDE2ICsgQHJcbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgaGV4WzFdLCAxNlxuICAgICAgICAgICAgQGcgPSBAZyAqIDE2ICsgQGdcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgaGV4WzJdLCAxNlxuICAgICAgICAgICAgQGIgPSBAYiAqIDE2ICsgQGJcbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX0hFWDZcbiAgICAgICAgICAgIGhleCA9IGZvdW5kWzFdXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50IGhleC5zdWJzdHJpbmcoMCwgMiksIDE2XG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50IGhleC5zdWJzdHJpbmcoMiwgNCksIDE2XG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50IGhleC5zdWJzdHJpbmcoNCwgNiksIDE2XG4gICAgICAgICAgICBAYSA9IDFcbiAgICAgICAgZWxzZSBpZiBDU1MzX0NPTE9SU1tzdHIgPSBzdHIudG9Mb3dlckNhc2UoKS50cmltKCldP1xuICAgICAgICAgICAgQHIgPSBDU1MzX0NPTE9SU1tzdHJdWzBdXG4gICAgICAgICAgICBAZyA9IENTUzNfQ09MT1JTW3N0cl1bMV1cbiAgICAgICAgICAgIEBiID0gQ1NTM19DT0xPUlNbc3RyXVsyXVxuICAgICAgICAgICAgQGEgPSBDU1MzX0NPTE9SU1tzdHJdWzNdXG4gICAgICAgICAgICBAYSA9IDEgdW5sZXNzIEBhP1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yIFwiQnUuQ29sb3IucGFyc2UoXFxcIiN7IHN0ciB9XFxcIikgZXJyb3IuXCJcbiAgICAgICAgQFxuXG4gICAgY2xvbmU6IC0+XG4gICAgICAgIChuZXcgQnUuQ29sb3IpLmNvcHkgQFxuXG4gICAgY29weTogKGNvbG9yKSAtPlxuICAgICAgICBAciA9IGNvbG9yLnJcbiAgICAgICAgQGcgPSBjb2xvci5nXG4gICAgICAgIEBiID0gY29sb3IuYlxuICAgICAgICBAYSA9IGNvbG9yLmFcbiAgICAgICAgQFxuXG4gICAgc2V0UkdCOiAociwgZywgYikgLT5cbiAgICAgICAgQHIgPSBwYXJzZUludCByXG4gICAgICAgIEBnID0gcGFyc2VJbnQgZ1xuICAgICAgICBAYiA9IHBhcnNlSW50IGJcbiAgICAgICAgQGEgPSAxXG4gICAgICAgIEBcblxuICAgIHNldFJHQkE6IChyLCBnLCBiLCBhKSAtPlxuICAgICAgICBAciA9IHBhcnNlSW50IHJcbiAgICAgICAgQGcgPSBwYXJzZUludCBnXG4gICAgICAgIEBiID0gcGFyc2VJbnQgYlxuICAgICAgICBAYSA9IGNsYW1wQWxwaGEgcGFyc2VGbG9hdCBhXG4gICAgICAgIEBcblxuICAgIHRvUkdCOiAtPlxuICAgICAgICBcInJnYigjeyBAciB9LCAjeyBAZyB9LCAjeyBAYiB9KVwiXG5cbiAgICB0b1JHQkE6IC0+XG4gICAgICAgIFwicmdiYSgjeyBAciB9LCAjeyBAZyB9LCAjeyBAYiB9LCAjeyBAYSB9KVwiXG5cblxuICAgICMgUHJpdmF0ZSBmdW5jdGlvbnNcblxuICAgIGNsYW1wQWxwaGEgPSAoYSkgLT4gQnUuY2xhbXAgYSwgMCwgMVxuXG5cbiAgICAjIFByaXZhdGUgdmFyaWFibGVzXG5cbiAgICBSRV9SR0IgPSAvcmdiXFwoXFxzKihcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXHMqXFwpL2lcbiAgICBSRV9SR0JBID0gL3JnYmFcXChcXHMqKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxccyosXFxzKihbLlxcZF0rKVxccypcXCkvaVxuICAgIFJFX1JHQl9QRVIgPSAvcmdiXFwoXFxzKihcXGQrKSUsXFxzKihcXGQrKSUsXFxzKihcXGQrKSVcXHMqXFwpL2lcbiAgICBSRV9SR0JBX1BFUiA9IC9yZ2JhXFwoXFxzKihcXGQrKSUsXFxzKihcXGQrKSUsXFxzKihcXGQrKSVcXHMqLFxccyooWy5cXGRdKylcXHMqXFwpL2lcbiAgICBSRV9IRVgzID0gLyMoWzAtOUEtRl17M30pXFxzKiQvaVxuICAgIFJFX0hFWDYgPSAvIyhbMC05QS1GXXs2fSlcXHMqJC9pXG4gICAgQ1NTM19DT0xPUlMgPVxuICAgICAgICB0cmFuc3BhcmVudDogWzAsIDAsIDAsIDBdXG5cbiAgICAgICAgYWxpY2VibHVlOiBbMjQwLCAyNDgsIDI1NV1cbiAgICAgICAgYW50aXF1ZXdoaXRlOiBbMjUwLCAyMzUsIDIxNV1cbiAgICAgICAgYXF1YTogWzAsIDI1NSwgMjU1XVxuICAgICAgICBhcXVhbWFyaW5lOiBbMTI3LCAyNTUsIDIxMl1cbiAgICAgICAgYXp1cmU6IFsyNDAsIDI1NSwgMjU1XVxuICAgICAgICBiZWlnZTogWzI0NSwgMjQ1LCAyMjBdXG4gICAgICAgIGJpc3F1ZTogWzI1NSwgMjI4LCAxOTZdXG4gICAgICAgIGJsYWNrOiBbMCwgMCwgMF1cbiAgICAgICAgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsIDIzNSwgMjA1XVxuICAgICAgICBibHVlOiBbMCwgMCwgMjU1XVxuICAgICAgICBibHVldmlvbGV0OiBbMTM4LCA0MywgMjI2XVxuICAgICAgICBicm93bjogWzE2NSwgNDIsIDQyXVxuICAgICAgICBidXJseXdvb2Q6IFsyMjIsIDE4NCwgMTM1XVxuICAgICAgICBjYWRldGJsdWU6IFs5NSwgMTU4LCAxNjBdXG4gICAgICAgIGNoYXJ0cmV1c2U6IFsxMjcsIDI1NSwgMF1cbiAgICAgICAgY2hvY29sYXRlOiBbMjEwLCAxMDUsIDMwXVxuICAgICAgICBjb3JhbDogWzI1NSwgMTI3LCA4MF1cbiAgICAgICAgY29ybmZsb3dlcmJsdWU6IFsxMDAsIDE0OSwgMjM3XVxuICAgICAgICBjb3Juc2lsazogWzI1NSwgMjQ4LCAyMjBdXG4gICAgICAgIGNyaW1zb246IFsyMjAsIDIwLCA2MF1cbiAgICAgICAgY3lhbjogWzAsIDI1NSwgMjU1XVxuICAgICAgICBkYXJrYmx1ZTogWzAsIDAsIDEzOV1cbiAgICAgICAgZGFya2N5YW46IFswLCAxMzksIDEzOV1cbiAgICAgICAgZGFya2dvbGRlbnJvZDogWzE4NCwgMTM0LCAxMV1cbiAgICAgICAgZGFya2dyYXk6IFsxNjksIDE2OSwgMTY5XVxuICAgICAgICBkYXJrZ3JlZW46IFswLCAxMDAsIDBdXG4gICAgICAgIGRhcmtncmV5OiBbMTY5LCAxNjksIDE2OV1cbiAgICAgICAgZGFya2toYWtpOiBbMTg5LCAxODMsIDEwN11cbiAgICAgICAgZGFya21hZ2VudGE6IFsxMzksIDAsIDEzOV1cbiAgICAgICAgZGFya29saXZlZ3JlZW46IFs4NSwgMTA3LCA0N11cbiAgICAgICAgZGFya29yYW5nZTogWzI1NSwgMTQwLCAwXVxuICAgICAgICBkYXJrb3JjaGlkOiBbMTUzLCA1MCwgMjA0XVxuICAgICAgICBkYXJrcmVkOiBbMTM5LCAwLCAwXVxuICAgICAgICBkYXJrc2FsbW9uOiBbMjMzLCAxNTAsIDEyMl1cbiAgICAgICAgZGFya3NlYWdyZWVuOiBbMTQzLCAxODgsIDE0M11cbiAgICAgICAgZGFya3NsYXRlYmx1ZTogWzcyLCA2MSwgMTM5XVxuICAgICAgICBkYXJrc2xhdGVncmF5OiBbNDcsIDc5LCA3OV1cbiAgICAgICAgZGFya3NsYXRlZ3JleTogWzQ3LCA3OSwgNzldXG4gICAgICAgIGRhcmt0dXJxdW9pc2U6IFswLCAyMDYsIDIwOV1cbiAgICAgICAgZGFya3Zpb2xldDogWzE0OCwgMCwgMjExXVxuICAgICAgICBkZWVwcGluazogWzI1NSwgMjAsIDE0N11cbiAgICAgICAgZGVlcHNreWJsdWU6IFswLCAxOTEsIDI1NV1cbiAgICAgICAgZGltZ3JheTogWzEwNSwgMTA1LCAxMDVdXG4gICAgICAgIGRpbWdyZXk6IFsxMDUsIDEwNSwgMTA1XVxuICAgICAgICBkb2RnZXJibHVlOiBbMzAsIDE0NCwgMjU1XVxuICAgICAgICBmaXJlYnJpY2s6IFsxNzgsIDM0LCAzNF1cbiAgICAgICAgZmxvcmFsd2hpdGU6IFsyNTUsIDI1MCwgMjQwXVxuICAgICAgICBmb3Jlc3RncmVlbjogWzM0LCAxMzksIDM0XVxuICAgICAgICBmdWNoc2lhOiBbMjU1LCAwLCAyNTVdXG4gICAgICAgIGdhaW5zYm9ybzogWzIyMCwgMjIwLCAyMjBdXG4gICAgICAgIGdob3N0d2hpdGU6IFsyNDgsIDI0OCwgMjU1XVxuICAgICAgICBnb2xkOiBbMjU1LCAyMTUsIDBdXG4gICAgICAgIGdvbGRlbnJvZDogWzIxOCwgMTY1LCAzMl1cbiAgICAgICAgZ3JheTogWzEyOCwgMTI4LCAxMjhdXG4gICAgICAgIGdyZWVuOiBbMCwgMTI4LCAwXVxuICAgICAgICBncmVlbnllbGxvdzogWzE3MywgMjU1LCA0N11cbiAgICAgICAgZ3JleTogWzEyOCwgMTI4LCAxMjhdXG4gICAgICAgIGhvbmV5ZGV3OiBbMjQwLCAyNTUsIDI0MF1cbiAgICAgICAgaG90cGluazogWzI1NSwgMTA1LCAxODBdXG4gICAgICAgIGluZGlhbnJlZDogWzIwNSwgOTIsIDkyXVxuICAgICAgICBpbmRpZ286IFs3NSwgMCwgMTMwXVxuICAgICAgICBpdm9yeTogWzI1NSwgMjU1LCAyNDBdXG4gICAgICAgIGtoYWtpOiBbMjQwLCAyMzAsIDE0MF1cbiAgICAgICAgbGF2ZW5kZXI6IFsyMzAsIDIzMCwgMjUwXVxuICAgICAgICBsYXZlbmRlcmJsdXNoOiBbMjU1LCAyNDAsIDI0NV1cbiAgICAgICAgbGF3bmdyZWVuOiBbMTI0LCAyNTIsIDBdXG4gICAgICAgIGxlbW9uY2hpZmZvbjogWzI1NSwgMjUwLCAyMDVdXG4gICAgICAgIGxpZ2h0Ymx1ZTogWzE3MywgMjE2LCAyMzBdXG4gICAgICAgIGxpZ2h0Y29yYWw6IFsyNDAsIDEyOCwgMTI4XVxuICAgICAgICBsaWdodGN5YW46IFsyMjQsIDI1NSwgMjU1XVxuICAgICAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwgMjUwLCAyMTBdXG4gICAgICAgIGxpZ2h0Z3JheTogWzIxMSwgMjExLCAyMTFdXG4gICAgICAgIGxpZ2h0Z3JlZW46IFsxNDQsIDIzOCwgMTQ0XVxuICAgICAgICBsaWdodGdyZXk6IFsyMTEsIDIxMSwgMjExXVxuICAgICAgICBsaWdodHBpbms6IFsyNTUsIDE4MiwgMTkzXVxuICAgICAgICBsaWdodHNhbG1vbjogWzI1NSwgMTYwLCAxMjJdXG4gICAgICAgIGxpZ2h0c2VhZ3JlZW46IFszMiwgMTc4LCAxNzBdXG4gICAgICAgIGxpZ2h0c2t5Ymx1ZTogWzEzNSwgMjA2LCAyNTBdXG4gICAgICAgIGxpZ2h0c2xhdGVncmF5OiBbMTE5LCAxMzYsIDE1M11cbiAgICAgICAgbGlnaHRzbGF0ZWdyZXk6IFsxMTksIDEzNiwgMTUzXVxuICAgICAgICBsaWdodHN0ZWVsYmx1ZTogWzE3NiwgMTk2LCAyMjJdXG4gICAgICAgIGxpZ2h0eWVsbG93OiBbMjU1LCAyNTUsIDIyNF1cbiAgICAgICAgbGltZTogWzAsIDI1NSwgMF1cbiAgICAgICAgbGltZWdyZWVuOiBbNTAsIDIwNSwgNTBdXG4gICAgICAgIGxpbmVuOiBbMjUwLCAyNDAsIDIzMF1cbiAgICAgICAgbWFnZW50YTogWzI1NSwgMCwgMjU1XVxuICAgICAgICBtYXJvb246IFsxMjgsIDAsIDBdXG4gICAgICAgIG1lZGl1bWFxdWFtYXJpbmU6IFsxMDIsIDIwNSwgMTcwXVxuICAgICAgICBtZWRpdW1ibHVlOiBbMCwgMCwgMjA1XVxuICAgICAgICBtZWRpdW1vcmNoaWQ6IFsxODYsIDg1LCAyMTFdXG4gICAgICAgIG1lZGl1bXB1cnBsZTogWzE0NywgMTEyLCAyMTldXG4gICAgICAgIG1lZGl1bXNlYWdyZWVuOiBbNjAsIDE3OSwgMTEzXVxuICAgICAgICBtZWRpdW1zbGF0ZWJsdWU6IFsxMjMsIDEwNCwgMjM4XVxuICAgICAgICBtZWRpdW1zcHJpbmdncmVlbjogWzAsIDI1MCwgMTU0XVxuICAgICAgICBtZWRpdW10dXJxdW9pc2U6IFs3MiwgMjA5LCAyMDRdXG4gICAgICAgIG1lZGl1bXZpb2xldHJlZDogWzE5OSwgMjEsIDEzM11cbiAgICAgICAgbWlkbmlnaHRibHVlOiBbMjUsIDI1LCAxMTJdXG4gICAgICAgIG1pbnRjcmVhbTogWzI0NSwgMjU1LCAyNTBdXG4gICAgICAgIG1pc3R5cm9zZTogWzI1NSwgMjI4LCAyMjVdXG4gICAgICAgIG1vY2Nhc2luOiBbMjU1LCAyMjgsIDE4MV1cbiAgICAgICAgbmF2YWpvd2hpdGU6IFsyNTUsIDIyMiwgMTczXVxuICAgICAgICBuYXZ5OiBbMCwgMCwgMTI4XVxuICAgICAgICBvbGRsYWNlOiBbMjUzLCAyNDUsIDIzMF1cbiAgICAgICAgb2xpdmU6IFsxMjgsIDEyOCwgMF1cbiAgICAgICAgb2xpdmVkcmFiOiBbMTA3LCAxNDIsIDM1XVxuICAgICAgICBvcmFuZ2U6IFsyNTUsIDE2NSwgMF1cbiAgICAgICAgb3JhbmdlcmVkOiBbMjU1LCA2OSwgMF1cbiAgICAgICAgb3JjaGlkOiBbMjE4LCAxMTIsIDIxNF1cbiAgICAgICAgcGFsZWdvbGRlbnJvZDogWzIzOCwgMjMyLCAxNzBdXG4gICAgICAgIHBhbGVncmVlbjogWzE1MiwgMjUxLCAxNTJdXG4gICAgICAgIHBhbGV0dXJxdW9pc2U6IFsxNzUsIDIzOCwgMjM4XVxuICAgICAgICBwYWxldmlvbGV0cmVkOiBbMjE5LCAxMTIsIDE0N11cbiAgICAgICAgcGFwYXlhd2hpcDogWzI1NSwgMjM5LCAyMTNdXG4gICAgICAgIHBlYWNocHVmZjogWzI1NSwgMjE4LCAxODVdXG4gICAgICAgIHBlcnU6IFsyMDUsIDEzMywgNjNdXG4gICAgICAgIHBpbms6IFsyNTUsIDE5MiwgMjAzXVxuICAgICAgICBwbHVtOiBbMjIxLCAxNjAsIDIyMV1cbiAgICAgICAgcG93ZGVyYmx1ZTogWzE3NiwgMjI0LCAyMzBdXG4gICAgICAgIHB1cnBsZTogWzEyOCwgMCwgMTI4XVxuICAgICAgICByZWQ6IFsyNTUsIDAsIDBdXG4gICAgICAgIHJvc3licm93bjogWzE4OCwgMTQzLCAxNDNdXG4gICAgICAgIHJveWFsYmx1ZTogWzY1LCAxMDUsIDIyNV1cbiAgICAgICAgc2FkZGxlYnJvd246IFsxMzksIDY5LCAxOV1cbiAgICAgICAgc2FsbW9uOiBbMjUwLCAxMjgsIDExNF1cbiAgICAgICAgc2FuZHlicm93bjogWzI0NCwgMTY0LCA5Nl1cbiAgICAgICAgc2VhZ3JlZW46IFs0NiwgMTM5LCA4N11cbiAgICAgICAgc2Vhc2hlbGw6IFsyNTUsIDI0NSwgMjM4XVxuICAgICAgICBzaWVubmE6IFsxNjAsIDgyLCA0NV1cbiAgICAgICAgc2lsdmVyOiBbMTkyLCAxOTIsIDE5Ml1cbiAgICAgICAgc2t5Ymx1ZTogWzEzNSwgMjA2LCAyMzVdXG4gICAgICAgIHNsYXRlYmx1ZTogWzEwNiwgOTAsIDIwNV1cbiAgICAgICAgc2xhdGVncmF5OiBbMTEyLCAxMjgsIDE0NF1cbiAgICAgICAgc2xhdGVncmV5OiBbMTEyLCAxMjgsIDE0NF1cbiAgICAgICAgc25vdzogWzI1NSwgMjUwLCAyNTBdXG4gICAgICAgIHNwcmluZ2dyZWVuOiBbMCwgMjU1LCAxMjddXG4gICAgICAgIHN0ZWVsYmx1ZTogWzcwLCAxMzAsIDE4MF1cbiAgICAgICAgdGFuOiBbMjEwLCAxODAsIDE0MF1cbiAgICAgICAgdGVhbDogWzAsIDEyOCwgMTI4XVxuICAgICAgICB0aGlzdGxlOiBbMjE2LCAxOTEsIDIxNl1cbiAgICAgICAgdG9tYXRvOiBbMjU1LCA5OSwgNzFdXG4gICAgICAgIHR1cnF1b2lzZTogWzY0LCAyMjQsIDIwOF1cbiAgICAgICAgdmlvbGV0OiBbMjM4LCAxMzAsIDIzOF1cbiAgICAgICAgd2hlYXQ6IFsyNDUsIDIyMiwgMTc5XVxuICAgICAgICB3aGl0ZTogWzI1NSwgMjU1LCAyNTVdXG4gICAgICAgIHdoaXRlc21va2U6IFsyNDUsIDI0NSwgMjQ1XVxuICAgICAgICB5ZWxsb3c6IFsyNTUsIDI1NSwgMF1cbiAgICAgICAgeWVsbG93Z3JlZW46IFsxNTQsIDIwNSwgNTBdXG4iLCIjIHRoZSBzaXplIG9mIHJlY3RhbmdsZSwgQm91bmRzIGV0Yy5cclxuXHJcbmNsYXNzIEJ1LlNpemVcclxuXHRjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCkgLT5cclxuXHRcdEB0eXBlID0gJ1NpemUnXHJcblxyXG5cdHNldDogKEB3aWR0aCwgQGhlaWdodCkgLT5cclxuIiwiIyAyZCB2ZWN0b3JcclxuXHJcbmNsYXNzIEJ1LlZlY3RvclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB4ID0gMCwgQHkgPSAwKSAtPlxyXG5cclxuXHRjbG9uZTogLT5cclxuXHRcdG5ldyBCdS5WZWN0b3IgQHgsIEB5XHJcblxyXG5cdGFkZDogKHYpIC0+XHJcblx0XHRAeCArPSB2LnhcclxuXHRcdEB5ICs9IHYueVxyXG5cdFx0QFxyXG5cclxuXHRzZXQ6IChAeCwgQHkpIC0+XHJcblx0XHRAXHJcblxyXG5cdGNvcHk6ICh2KSAtPlxyXG5cdFx0QHggPSB2LnhcclxuXHRcdEB5ID0gdi55XHJcblx0XHRAXHJcblxyXG5cdG11bHRpcGx5U2NhbGFyOiAoc2NhbGFyKSAtPlxyXG5cdFx0QHggKj0gc2NhbGFyXHJcblx0XHRAeSAqPSBzY2FsYXJcclxuXHRcdEBcclxuXHJcblx0dW5Qcm9qZWN0OiAob2JqKSAtPlxyXG5cdFx0IyB0cmFuc2xhdGVcclxuXHRcdEB4IC09IG9iai5wb3NpdGlvbi54XHJcblx0XHRAeSAtPSBvYmoucG9zaXRpb24ueVxyXG5cdFx0IyByb3RhdGlvblxyXG5cdFx0bGVuID0gQnUuYmV2ZWwoQHgsIEB5KVxyXG5cdFx0YSA9IE1hdGguYXRhbjIoQHksIEB4KSAtIG9iai5yb3RhdGlvblxyXG5cdFx0QHggPSBsZW4gKiBNYXRoLmNvcyhhKVxyXG5cdFx0QHkgPSBsZW4gKiBNYXRoLnNpbihhKVxyXG5cdFx0IyBzY2FsZVxyXG5cdFx0QHggLz0gb2JqLnNjYWxlLnhcclxuXHRcdEB5IC89IG9iai5zY2FsZS55XHJcblx0XHRAXHJcbiIsIiMgQWRkIGV2ZW50IGxpc3RlbmVyIGZlYXR1cmUgdG8gY3VzdG9tIG9iamVjdHNcclxuXHJcbkJ1LkV2ZW50ID0gLT5cclxuXHR0eXBlcyA9IHt9XHJcblxyXG5cdEBvbiA9ICh0eXBlLCBsaXN0ZW5lcikgLT5cclxuXHRcdGxpc3RlbmVycyA9IHR5cGVzW3R5cGVdIG9yPSBbXVxyXG5cdFx0bGlzdGVuZXJzLnB1c2ggbGlzdGVuZXIgaWYgbGlzdGVuZXJzLmluZGV4T2YgbGlzdGVuZXIgPT0gLTFcclxuXHJcblx0QG9uY2UgPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lci5vbmNlID0gdHJ1ZVxyXG5cdFx0QG9uIHR5cGUsIGxpc3RlbmVyXHJcblxyXG5cdEBvZmYgPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lcnMgPSB0eXBlc1t0eXBlXVxyXG5cdFx0aWYgbGlzdGVuZXI/XHJcblx0XHRcdGlmIGxpc3RlbmVycz9cclxuXHRcdFx0XHRpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mIGxpc3RlbmVyXHJcblx0XHRcdFx0bGlzdGVuZXJzLnNwbGljZSBpbmRleCwgMSBpZiBpbmRleCA+IC0xXHJcblx0XHRlbHNlXHJcblx0XHRcdGxpc3RlbmVycy5sZW5ndGggPSAwIGlmIGxpc3RlbmVycz9cclxuXHJcblx0QHRyaWdnZXIgPSAodHlwZSwgZXZlbnREYXRhKSAtPlxyXG5cdFx0bGlzdGVuZXJzID0gdHlwZXNbdHlwZV1cclxuXHJcblx0XHRpZiBsaXN0ZW5lcnM/XHJcblx0XHRcdGV2ZW50RGF0YSBvcj0ge31cclxuXHRcdFx0ZXZlbnREYXRhLnRhcmdldCA9IEBcclxuXHRcdFx0Zm9yIGxpc3RlbmVyIGluIGxpc3RlbmVyc1xyXG5cdFx0XHRcdGxpc3RlbmVyLmNhbGwgdGhpcywgZXZlbnREYXRhXHJcblx0XHRcdFx0aWYgbGlzdGVuZXIub25jZVxyXG5cdFx0XHRcdFx0bGlzdGVuZXJzLnNwbGljZSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lciksIDFcclxuIiwiIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBNaWNyb0pRdWVyeSAtIEEgbWljcm8gdmVyc2lvbiBvZiBqUXVlcnlcclxuI1xyXG4jIFN1cHBvcnRlZCBmZWF0dXJlczpcclxuIyAgICQuIC0gc3RhdGljIG1ldGhvZHNcclxuIyAgICAgLnJlYWR5KGNiKSAtIGNhbGwgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHRoZSBwYWdlIGlzIGxvYWRlZFxyXG4jICAgICAuYWpheChbdXJsLF0gb3B0aW9ucykgLSBwZXJmb3JtIGFuIGFqYXggcmVxdWVzdFxyXG4jICAgJChzZWxlY3RvcikgLSBzZWxlY3QgZWxlbWVudChzKVxyXG4jICAgICAub24odHlwZSwgY2FsbGJhY2spIC0gYWRkIGFuIGV2ZW50IGxpc3RlbmVyXHJcbiMgICAgIC5vZmYodHlwZSwgY2FsbGJhY2spIC0gcmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyXHJcbiMgICAgIC5hcHBlbmQodGFnTmFtZSkgLSBhcHBlbmQgYSB0YWdcclxuIyAgICAgLnRleHQodGV4dCkgLSBzZXQgdGhlIGlubmVyIHRleHRcclxuIyAgICAgLmh0bWwoaHRtbFRleHQpIC0gc2V0IHRoZSBpbm5lciBIVE1MXHJcbiMgICAgIC5zdHlsZShuYW1lLCB2YWx1ZSkgLSBzZXQgc3R5bGUgKGEgY3NzIGF0dHJpYnV0ZSlcclxuIyAgICAgIy5jc3Mob2JqZWN0KSAtIHNldCBzdHlsZXMgKG11bHRpcGxlIGNzcyBhdHRyaWJ1dGUpXHJcbiMgICAgIC5oYXNDbGFzcyhjbGFzc05hbWUpIC0gZGV0ZWN0IHdoZXRoZXIgYSBjbGFzcyBleGlzdHNcclxuIyAgICAgLmFkZENsYXNzKGNsYXNzTmFtZSkgLSBhZGQgYSBjbGFzc1xyXG4jICAgICAucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKSAtIHJlbW92ZSBhIGNsYXNzXHJcbiMgICAgIC50b2dnbGVDbGFzcyhjbGFzc05hbWUpIC0gdG9nZ2xlIGEgY2xhc3NcclxuIyAgICAgLmF0dHIobmFtZSwgdmFsdWUpIC0gc2V0IGFuIGF0dHJpYnV0ZVxyXG4jICAgICAuaGFzQXR0cihuYW1lKSAtIGRldGVjdCB3aGV0aGVyIGFuIGF0dHJpYnV0ZSBleGlzdHNcclxuIyAgICAgLnJlbW92ZUF0dHIobmFtZSkgLSByZW1vdmUgYW4gYXR0cmlidXRlXHJcbiMgICBOb3RlczpcclxuIyAgICAgICAgIyBpcyBwbGFubmVkIGJ1dCBub3QgaW1wbGVtZW50ZWRcclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbigoZ2xvYmFsKSAtPlxyXG5cclxuXHQjIHNlbGVjdG9yXHJcblx0Z2xvYmFsLiQgPSAoc2VsZWN0b3IpIC0+XHJcblx0XHRzZWxlY3Rpb25zID0gW11cclxuXHRcdGlmIHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJ1xyXG5cdFx0XHRzZWxlY3Rpb25zID0gW10uc2xpY2UuY2FsbCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsIHNlbGVjdG9yXHJcblx0XHRlbHNlIGlmIHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTEVsZW1lbnRcclxuXHRcdFx0c2VsZWN0aW9ucy5wdXNoIHNlbGVjdG9yXHJcblx0XHRqUXVlcnkuYXBwbHkgc2VsZWN0aW9uc1xyXG5cdFx0c2VsZWN0aW9uc1xyXG5cclxuXHRqUXVlcnkgPSAtPlxyXG5cclxuXHRcdCMgZXZlbnRcclxuXHRcdEBvbiA9ICh0eXBlLCBjYWxsYmFjaykgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20uYWRkRXZlbnRMaXN0ZW5lciB0eXBlLCBjYWxsYmFja1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QG9mZiA9ICh0eXBlLCBjYWxsYmFjaykgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciB0eXBlLCBjYWxsYmFja1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0IyBET00gTWFuaXB1bGF0aW9uXHJcblxyXG5cdFx0U1ZHX1RBR1MgPSAnc3ZnIGxpbmUgcmVjdCBjaXJjbGUgZWxsaXBzZSBwb2x5bGluZSBwb2x5Z29uIHBhdGggdGV4dCdcclxuXHJcblx0XHRAYXBwZW5kID0gKHRhZykgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSwgaSkgPT5cclxuXHRcdFx0XHR0YWdJbmRleCA9IFNWR19UQUdTLmluZGV4T2YgdGFnLnRvTG93ZXJDYXNlKClcclxuXHRcdFx0XHRpZiB0YWdJbmRleCA+IC0xXHJcblx0XHRcdFx0XHRuZXdEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0bmV3RG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCB0YWdcclxuXHRcdFx0XHRAW2ldID0gZG9tLmFwcGVuZENoaWxkIG5ld0RvbVxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHRleHQgPSAoc3RyKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS50ZXh0Q29udGVudCA9IHN0clxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGh0bWwgPSAoc3RyKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5pbm5lckhUTUwgPSBzdHJcclxuXHRcdFx0QFxyXG5cclxuXHRcdEB3aWR0aCA9ICh3KSA9PlxyXG5cdFx0XHRpZiB3P1xyXG5cdFx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0XHRkb20uc3R5bGUud2lkdGggPSB3ICsgJ3B4J1xyXG5cdFx0XHRcdEBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHBhcnNlRmxvYXQgZ2V0Q29tcHV0ZWRTdHlsZShAWzBdKS53aWR0aFxyXG5cclxuXHRcdEBoZWlnaHQgPSAoaCkgPT5cclxuXHRcdFx0aWYgaD9cclxuXHRcdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdFx0ZG9tLnN0eWxlLmhlaWdodCA9IGggKyAncHgnXHJcblx0XHRcdFx0QFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cGFyc2VGbG9hdCBnZXRDb21wdXRlZFN0eWxlKEBbMF0pLmhlaWdodFxyXG5cclxuXHJcblx0XHRAc3R5bGUgPSAobmFtZSwgdmFsdWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0c3R5bGVUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnc3R5bGUnXHJcblx0XHRcdFx0c3R5bGVzID0ge31cclxuXHRcdFx0XHRpZiBzdHlsZVRleHRcclxuXHRcdFx0XHRcdHN0eWxlVGV4dC5zcGxpdCgnOycpLmVhY2ggKG4pIC0+XHJcblx0XHRcdFx0XHRcdG52ID0gbi5zcGxpdCAnOidcclxuXHRcdFx0XHRcdFx0c3R5bGVzW252WzBdXSA9IG52WzFdXHJcblx0XHRcdFx0c3R5bGVzW25hbWVdID0gdmFsdWVcclxuXHRcdFx0XHQjIGNvbmNhdFxyXG5cdFx0XHRcdHN0eWxlVGV4dCA9ICcnXHJcblx0XHRcdFx0Zm9yIGkgb2Ygc3R5bGVzXHJcblx0XHRcdFx0XHRzdHlsZVRleHQgKz0gaSArICc6ICcgKyBzdHlsZXNbaV0gKyAnOyAnXHJcblx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZSAnc3R5bGUnLCBzdHlsZVRleHRcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBoYXNDbGFzcyA9IChuYW1lKSA9PlxyXG5cdFx0XHRpZiBAbGVuZ3RoID09IDBcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0IyBpZiBtdWx0aXBsZSwgZXZlcnkgRE9NIHNob3VsZCBoYXZlIHRoZSBjbGFzc1xyXG5cdFx0XHRpID0gMFxyXG5cdFx0XHR3aGlsZSBpIDwgQGxlbmd0aFxyXG5cdFx0XHRcdGNsYXNzVGV4dCA9IEBbaV0uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHQjIG5vdCB1c2UgJyAnIHRvIGF2b2lkIG11bHRpcGxlIHNwYWNlcyBsaWtlICdhICAgYidcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgIWNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdFx0aSsrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAYWRkQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRjbGFzc1RleHQgPSBkb20uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgbm90IGNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoIG5hbWVcclxuXHRcdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ2NsYXNzJywgY2xhc3Nlcy5qb2luICcgJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHJlbW92ZUNsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSBvciAnJ1xyXG5cdFx0XHRcdGNsYXNzZXMgPSBjbGFzc1RleHQuc3BsaXQgUmVnRXhwICcgKydcclxuXHRcdFx0XHRpZiBjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdGNsYXNzZXMucmVtb3ZlIG5hbWVcclxuXHRcdFx0XHRcdGlmIGNsYXNzZXMubGVuZ3RoID4gMFxyXG5cdFx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZSAnY2xhc3MnXHJcblx0XHRcdEBcclxuXHJcblx0XHRAdG9nZ2xlQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRjbGFzc1RleHQgPSBkb20uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5jb250YWlucyBuYW1lXHJcblx0XHRcdFx0XHRjbGFzc2VzLnJlbW92ZSBuYW1lXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoIG5hbWVcclxuXHRcdFx0XHRpZiBjbGFzc2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ2NsYXNzJywgY2xhc3Nlcy5qb2luICcgJ1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgJ2NsYXNzJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGF0dHIgPSAobmFtZSwgdmFsdWUpID0+XHJcblx0XHRcdGlmIHZhbHVlP1xyXG5cdFx0XHRcdEBlYWNoIChkb20pIC0+IGRvbS5zZXRBdHRyaWJ1dGUgbmFtZSwgdmFsdWVcclxuXHRcdFx0XHRyZXR1cm4gQFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cmV0dXJuIEBbMF0uZ2V0QXR0cmlidXRlIG5hbWVcclxuXHJcblx0XHRAaGFzQXR0ciA9IChuYW1lKSA9PlxyXG5cdFx0XHRpZiBAbGVuZ3RoID09IDBcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0aSA9IDBcclxuXHRcdFx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdFx0XHRpZiBub3QgQFtpXS5oYXNBdHRyaWJ1dGUgbmFtZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdFx0aSsrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAcmVtb3ZlQXR0ciA9IChuYW1lKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgbmFtZVxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHZhbCA9ID0+IEBbMF0/LnZhbHVlXHJcblxyXG5cdCMgJC5yZWFkeSgpXHJcblx0Z2xvYmFsLiQucmVhZHkgPSAob25Mb2FkKSAtPlxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnRE9NQ29udGVudExvYWRlZCcsIG9uTG9hZFxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgJC5hamF4KClcclxuXHQjXHRvcHRpb25zOlxyXG5cdCNcdFx0dXJsOiBzdHJpbmdcclxuXHQjXHRcdD09PT1cclxuXHQjXHRcdGFzeW5jID0gdHJ1ZTogYm9vbFxyXG5cdCNcdGRhdGE6IG9iamVjdCAtIHF1ZXJ5IHBhcmFtZXRlcnMgVE9ETzogaW1wbGVtZW50IHRoaXNcclxuXHQjXHRcdG1ldGhvZCA9IEdFVDogUE9TVCwgUFVULCBERUxFVEUsIEhFQURcclxuXHQjXHRcdHVzZXJuYW1lOiBzdHJpbmdcclxuXHQjXHRcdHBhc3N3b3JkOiBzdHJpbmdcclxuXHQjXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uXHJcblx0I1x0XHRlcnJvcjogZnVuY3Rpb25cclxuXHQjXHRcdGNvbXBsZXRlOiBmdW5jdGlvblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdGdsb2JhbC4kLmFqYXggPSAodXJsLCBvcHMpIC0+XHJcblx0XHRpZiAhb3BzXHJcblx0XHRcdGlmIHR5cGVvZiB1cmwgPT0gJ29iamVjdCdcclxuXHRcdFx0XHRvcHMgPSB1cmxcclxuXHRcdFx0XHR1cmwgPSBvcHMudXJsXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRvcHMgPSB7fVxyXG5cdFx0b3BzLm1ldGhvZCBvcj0gJ0dFVCdcclxuXHRcdG9wcy5hc3luYyA9IHRydWUgdW5sZXNzIG9wcy5hc3luYz9cclxuXHJcblx0XHR4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3RcclxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG5cdFx0XHRpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XHJcblx0XHRcdFx0aWYgeGhyLnN0YXR1cyA9PSAyMDBcclxuXHRcdFx0XHRcdG9wcy5zdWNjZXNzIHhoci5yZXNwb25zZVRleHQsIHhoci5zdGF0dXMsIHhociBpZiBvcHMuc3VjY2Vzcz9cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRvcHMuZXJyb3IgeGhyLCB4aHIuc3RhdHVzIGlmIG9wcy5lcnJvcj9cclxuXHRcdFx0XHRcdG9wcy5jb21wbGV0ZSB4aHIsIHhoci5zdGF0dXMgaWYgb3BzLmNvbXBsZXRlP1xyXG5cclxuXHRcdHhoci5vcGVuIG9wcy5tZXRob2QsIHVybCwgb3BzLmFzeW5jLCBvcHMudXNlcm5hbWUsIG9wcy5wYXNzd29yZFxyXG5cdFx0eGhyLnNlbmQgbnVsbCkgQnUuZ2xvYmFsXHJcbiIsIiMgQmFzZSBjbGFzcyBvZiBhbGwgc2hhcGVzIGFuZCBvdGhlciByZW5kZXJhYmxlIG9iamVjdHNcclxuXHJcbmNsYXNzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QnUuU3R5bGVkLmFwcGx5IEBcclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHJcblx0XHRAdmlzaWJsZSA9IHllc1xyXG5cdFx0QG9wYWNpdHkgPSAxXHJcblxyXG5cdFx0QHBvc2l0aW9uID0gbmV3IEJ1LlZlY3RvclxyXG5cdFx0QHJvdGF0aW9uID0gMFxyXG5cdFx0QF9zY2FsZSA9IG5ldyBCdS5WZWN0b3IgMSwgMVxyXG5cdFx0QHNrZXcgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0I0B0b1dvcmxkTWF0cml4ID0gbmV3IEJ1Lk1hdHJpeCgpXHJcblx0XHQjQHVwZGF0ZU1hdHJpeCAtPlxyXG5cclxuXHRcdCMgZ2VvbWV0cnkgcmVsYXRlZFxyXG5cdFx0QGJvdW5kcyA9IG51bGwgIyB1c2VkIHRvIGFjY2VsZXJhdGUgdGhlIGhpdCB0ZXN0aW5nXHJcblx0XHRAa2V5UG9pbnRzID0gbnVsbFxyXG5cclxuXHRcdCMgaGllcmFyY2h5XHJcblx0XHRAY2hpbGRyZW4gPSBbXVxyXG5cdFx0QHBhcmVudCA9IG51bGxcclxuXHJcblx0QHByb3BlcnR5ICdzY2FsZScsXHJcblx0XHRnZXQ6IC0+IEBfc2NhbGVcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0aWYgQnUuaXNOdW1iZXIgdmFsXHJcblx0XHRcdFx0QF9zY2FsZS54ID0gQF9zY2FsZS55ID0gdmFsXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAX3NjYWxlID0gdmFsXHJcblxyXG5cdCMgVHJhbnNsYXRlIGFuIG9iamVjdFxyXG5cdHRyYW5zbGF0ZTogKGR4LCBkeSkgLT5cclxuXHRcdEBwb3NpdGlvbi54ICs9IGR4XHJcblx0XHRAcG9zaXRpb24ueSArPSBkeVxyXG5cdFx0QFxyXG5cclxuXHQjIFJvdGF0ZSBhbiBvYmplY3RcclxuXHRyb3RhdGU6IChkYSkgLT5cclxuXHRcdEByb3RhdGlvbiArPSBkYVxyXG5cdFx0QFxyXG5cclxuXHQjIFNjYWxlIGFuIG9iamVjdCBieVxyXG5cdHNjYWxlQnk6IChkcykgLT5cclxuXHRcdEBzY2FsZSAqPSBkc1xyXG5cdFx0QFxyXG5cclxuXHQjIFNjYWxlIGFuIG9iamVjdCB0b1xyXG5cdHNjYWxlVG86IChzKSAtPlxyXG5cdFx0QHNjYWxlID0gc1xyXG5cdFx0QFxyXG5cclxuXHQjIEFkZCBvYmplY3QocykgdG8gY2hpbGRyZW5cclxuXHRhZGRDaGlsZDogKHNoYXBlKSAtPlxyXG5cdFx0aWYgQnUuaXNBcnJheSBzaGFwZVxyXG5cdFx0XHRAY2hpbGRyZW4ucHVzaCBzIGZvciBzIGluIHNoYXBlXHJcblx0XHRlbHNlXHJcblx0XHRcdEBjaGlsZHJlbi5wdXNoIHNoYXBlXHJcblx0XHRAXHJcblxyXG5cdCMgUmVtb3ZlIG9iamVjdCBmcm9tIGNoaWxkcmVuXHJcblx0cmVtb3ZlQ2hpbGQ6IChzaGFwZSkgLT5cclxuXHRcdGluZGV4ID0gQGNoaWxkcmVuLmluZGV4T2Ygc2hhcGVcclxuXHRcdEBjaGlsZHJlbi5zcGxpY2UgaW5kZXgsIDEgaWYgaW5kZXggPiAtMVxyXG5cdFx0QFxyXG5cclxuXHQjIEFwcGx5IGFuIGFuaW1hdGlvbiBvbiB0aGlzIG9iamVjdFxyXG5cdCMgVGhlIHR5cGUgb2YgYGFuaW1gIG1heSBiZTpcclxuXHQjICAgICAxLiBQcmVzZXQgYW5pbWF0aW9uczogdGhlIGFuaW1hdGlvbiBuYW1lKHN0cmluZyB0eXBlKSwgaWUuIGtleSBpbiBgQnUuYW5pbWF0aW9uc2BcclxuXHQjICAgICAyLiBDdXN0b20gYW5pbWF0aW9uczogdGhlIGFuaW1hdGlvbiBvYmplY3Qgb2YgYEJ1LkFuaW1hdGlvbmAgdHlwZVxyXG5cdCMgICAgIDMuIE11bHRpcGxlIGFuaW1hdGlvbnM6IEFuIGFycmF5IHdob3NlIGNoaWxkcmVuIGFyZSBhYm92ZSB0d28gdHlwZXNcclxuXHRhbmltYXRlOiAoYW5pbSwgYXJncykgLT5cclxuXHRcdGFyZ3MgPSBbYXJnc10gdW5sZXNzIEJ1LmlzQXJyYXkgYXJnc1xyXG5cdFx0aWYgQnUuaXNTdHJpbmcgYW5pbVxyXG5cdFx0XHRpZiBhbmltIG9mIEJ1LmFuaW1hdGlvbnNcclxuXHRcdFx0XHRCdS5hbmltYXRpb25zW2FuaW1dLmFwcGx5VG8gQCwgYXJnc1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiQnUuYW5pbWF0aW9uc1tcXFwiI3sgYW5pbSB9XFxcIl0gZG9lc24ndCBleGlzdHMuXCJcclxuXHRcdGVsc2UgaWYgQnUuaXNBcnJheSBhbmltXHJcblx0XHRcdEBhbmltYXRlIGFuaW1baV0sIGFyZ3MgZm9yIG93biBpIG9mIGFuaW1cclxuXHRcdGVsc2VcclxuXHRcdFx0YW5pbS5hcHBseVRvIEAsIGFyZ3NcclxuXHRcdEBcclxuXHJcblx0IyBDcmVhdGUgQm91bmRzIGZvciB0aGlzIG9iamVjdFxyXG5cdGNyZWF0ZUJvdW5kczogLT5cclxuXHRcdEBib3VuZHMgPSBuZXcgQnUuQm91bmRzIEBcclxuXHRcdEBcclxuXHJcblx0IyBIaXQgdGVzdGluZyB3aXRoIHVucHJvamVjdGlvbnNcclxuXHRoaXRUZXN0OiAocCkgLT5cclxuXHRcdHAudW5Qcm9qZWN0IEBcclxuXHRcdEBjb250YWluc1BvaW50IHBcclxuXHJcblx0IyBIaXQgdGVzdGluZyBpbiB0aGUgc2FtZSBjb29yZGluYXRlXHJcblx0Y29udGFpbnNQb2ludDogKHApIC0+XHJcblx0XHRpZiBAYm91bmRzPyBhbmQgbm90IEBib3VuZHMuY29udGFpbnNQb2ludCBwXHJcblx0XHRcdHJldHVybiBub1xyXG5cdFx0ZWxzZSBpZiBAX2NvbnRhaW5zUG9pbnRcclxuXHRcdFx0cmV0dXJuIEBfY29udGFpbnNQb2ludCBwXHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBub1xyXG4iLCIjIEFkZCBjb2xvciB0byB0aGUgc2hhcGVzXHJcbiMgVGhpcyBvYmplY3QgaXMgZGVkaWNhdGVkIHRvIG1peGVkLWluIHRoZSBPYmplY3QyRC5cclxuXHJcbkJ1LlN0eWxlZCA9ICgpIC0+XHJcblx0QHN0cm9rZVN0eWxlID0gQnUuU3R5bGVkLkRFRkFVTFRfU1RST0tFX1NUWUxFXHJcblx0QGZpbGxTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRAZGFzaFN0eWxlID0gZmFsc2VcclxuXHRAZGFzaEZsb3dTcGVlZCA9IDBcclxuXHRAbGluZVdpZHRoID0gMVxyXG5cclxuXHRAZGFzaE9mZnNldCA9IDBcclxuXHJcblx0IyBTZXQvY29weSBzdHlsZSBmcm9tIG90aGVyIHN0eWxlXHJcblx0QHN0eWxlID0gKHN0eWxlKSAtPlxyXG5cdFx0aWYgQnUuaXNTdHJpbmcgc3R5bGVcclxuXHRcdFx0c3R5bGUgPSBCdS5zdHlsZXNbc3R5bGVdXHJcblx0XHRcdGlmIG5vdCBzdHlsZT9cclxuXHRcdFx0XHRzdHlsZSA9IEJ1LnN0eWxlcy5kZWZhdWx0XHJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiQnUuU3R5bGVkOiBCdS5zdHlsZXMuI3sgc3R5bGUgfSBkb2Vzbid0IGV4aXN0cywgZmVsbCBiYWNrIHRvIGRlZmF1bHQuXCJcclxuXHRcdGVsc2UgaWYgbm90IHN0eWxlP1xyXG5cdFx0XHRzdHlsZSA9IEJ1LnN0eWxlc1snZGVmYXVsdCddXHJcblxyXG5cdFx0Zm9yIGsgaW4gWydzdHJva2VTdHlsZScsICdmaWxsU3R5bGUnLCAnZGFzaFN0eWxlJywgJ2Rhc2hGbG93U3BlZWQnLCAnbGluZVdpZHRoJ11cclxuXHRcdFx0QFtrXSA9IHN0eWxlW2tdXHJcblx0XHRAXHJcblxyXG5cdCMgU2V0IHRoZSBzdHJva2Ugc3R5bGVcclxuXHRAc3Ryb2tlID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSB1bmxlc3Mgdj9cclxuXHRcdHYgPSBCdS5zdHlsZXNbdl0uc3Ryb2tlU3R5bGUgaWYgQnUuc3R5bGVzPyBhbmQgdiBvZiBCdS5zdHlsZXNcclxuXHRcdHN3aXRjaCB2XHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBzdHJva2VTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX1NUUk9LRV9TVFlMRVxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQHN0cm9rZVN0eWxlID0gbnVsbFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QHN0cm9rZVN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgZmlsbCBzdHlsZVxyXG5cdEBmaWxsID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSB1bmxlc3Mgdj9cclxuXHRcdHYgPSBCdS5zdHlsZXNbdl0uZmlsbFN0eWxlIGlmIEJ1LnN0eWxlcz8gYW5kIHYgb2YgQnUuc3R5bGVzXHJcblx0XHRzd2l0Y2ggdlxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQGZpbGxTdHlsZSA9IG51bGxcclxuXHRcdFx0d2hlbiB0cnVlIHRoZW4gQGZpbGxTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBmaWxsU3R5bGUgPSB2XHJcblx0XHRAXHJcblxyXG5cdCMgU2V0IHRoZSBkYXNoIHN0eWxlXHJcblx0QGRhc2ggPSAodikgLT5cclxuXHRcdHYgPSB0cnVlIHVubGVzcyB2P1xyXG5cdFx0diA9IEJ1LnN0eWxlc1t2XS5kYXNoU3R5bGUgaWYgQnUuc3R5bGVzPyBhbmQgdiBvZiBCdS5zdHlsZXNcclxuXHRcdHYgPSBbdiwgdl0gaWYgQnUuaXNOdW1iZXIgdlxyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBkYXNoU3R5bGUgPSBudWxsXHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBkYXNoU3R5bGUgPSBCdS5TdHlsZWQuREVGQVVMVF9EQVNIX1NUWUxFXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAZGFzaFN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgZGFzaCBmbG93aW5nIHNwZWVkXHJcblx0QGRhc2hGbG93ID0gKHNwZWVkKSAtPlxyXG5cdFx0c3BlZWQgPSAxIGlmIHNwZWVkID09IHRydWUgb3Igbm90IHNwZWVkP1xyXG5cdFx0c3BlZWQgPSAwIGlmIHNwZWVkID09IGZhbHNlXHJcblx0XHRCdS5kYXNoRmxvd01hbmFnZXIuc2V0U3BlZWQgQCwgc3BlZWRcclxuXHRcdEBcclxuXHJcblx0IyBTZXQgdGhlIGxpbmVXaWR0aFxyXG5cdEBzZXRMaW5lV2lkdGggPSAodykgLT5cclxuXHRcdEBsaW5lV2lkdGggPSB3XHJcblx0XHRAXHJcblxyXG5cdEBcclxuXHJcbkJ1LlN0eWxlZC5ERUZBVUxUX1NUUk9LRV9TVFlMRSA9ICcjMDQ4J1xyXG5CdS5TdHlsZWQuREVGQVVMVF9GSUxMX1NUWUxFID0gJ3JnYmEoNjQsIDEyOCwgMTkyLCAwLjUpJ1xyXG5CdS5TdHlsZWQuREVGQVVMVF9EQVNIX1NUWUxFID0gWzgsIDRdXHJcblxyXG5CdS5zdHlsZXMgPVxyXG5cdGRlZmF1bHQ6IG5ldyBCdS5TdHlsZWQoKS5zdHJva2UoKS5maWxsKClcclxuXHRob3ZlcjogbmV3IEJ1LlN0eWxlZCgpLnN0cm9rZSgnaHNsYSgwLCAxMDAlLCA0MCUsIDAuNzUpJykuZmlsbCgnaHNsYSgwLCAxMDAlLCA3NSUsIDAuNSknKVxyXG5cdHRleHQ6IG5ldyBCdS5TdHlsZWQoKS5zdHJva2UoZmFsc2UpLmZpbGwoJ2JsYWNrJylcclxuXHRsaW5lOiBuZXcgQnUuU3R5bGVkKCkuZmlsbChmYWxzZSlcclxuXHRzZWxlY3RlZDogbmV3IEJ1LlN0eWxlZCgpLnNldExpbmVXaWR0aCgzKVxyXG5cdGRhc2g6IG5ldyBCdS5TdHlsZWQoKS5kYXNoKClcclxuIiwiIyBEZWNsYXJhdGl2ZSBmcmFtZXdvcmsgZm9yIEJ1LmpzIGFwcHNcclxuXHJcbiMjIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IyNcclxuQWxsIHN1cHBvcnRlZCBjb25zdHJ1Y3RvciBvcHRpb25zOlxyXG4oVGhlIGFwcGVhcmFuY2Ugc2VxdWVuY2UgaXMgdGhlIHByb2Nlc3Mgc2VxdWVuY2UuKVxyXG57XHJcbiAgICByZW5kZXJlcjogIyBzZXR0aW5ncyB0byB0aGUgcmVuZGVyZXJcclxuICAgIFx0Y29udGFpbmVyOiAnI2NvbnRhaW5lcicgIyBjc3Mgc2VsZWN0b3Igb2YgdGhlIGNvbnRhaW5lciBkb20gb3IgaXRzZWxmXHJcbiAgICAgICAgY3Vyc29yOiAnY3Jvc3NoYW5kJyAjIHRoZSBkZWZhdWx0IGN1cnNvciBzdHlsZSBvbiB0aGUgPGNhbnZhcz5cclxuICAgICAgICBiYWNrZ3JvdW5kOiAncGluaycgIyB0aGUgZGVmYXVsdCBiYWNrZ3JvdW5kIG9mIHRoZSA8Y2FudmFzPlxyXG4gICAgXHRzaG93S2V5UG9pbnRzOiB0cnVlICMgd2hldGhlciB0byBzaG93IHRoZSBrZXkgcG9pbnRzIG9mIHNoYXBlcyAoaWYgdGhleSBoYXZlKS5cclxuICAgIGRhdGE6IHsgdmFyIH0gIyB2YXJpYWJsZXMgb2YgdGhpcyBCdS5qcyBhcHAsIHdpbGwgYmUgY29waWVkIHRvIHRoZSBhcHAgb2JqZWN0XHJcbiAgICBtZXRob2RzOiB7IGZ1bmN0aW9uIH0jIGZ1bmN0aW9ucyBvZiB0aGlzIEJ1LmpzIGFwcCwgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIGFwcCBvYmplY3RcclxuICAgIG9iamVjdHM6IHt9IG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7fSAjIGFsbCB0aGUgcmVuZGVyYWJsZSBvYmplY3RzXHJcblx0aGllcmFyY2h5OiAjIGFuIHRyZWUgdGhhdCByZXByZXNlbnQgdGhlIG9iamVjdCBoaWVyYXJjaHkgb2YgdGhlIHNjZW5lLCB0aGUga2V5cyBhcmUgaW4gYG9iamVjdHNgXHJcbiAgICBldmVudHM6ICMgZXZlbnQgbGlzdGVuZXJzLCAnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJyB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgYm91bmQgdG8gPGNhbnZhcz5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICMgY2FsbGVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICMgY2FsbGVkIGV2ZXJ5IGZyYW1lXHJcbn1cclxuIyM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSMjI1xyXG5cclxuY2xhc3MgQnUuQXBwXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQCRvcHRpb25zID0ge30pIC0+XHJcblx0XHRmb3IgayBpbiBbXCJyZW5kZXJlclwiLCBcImRhdGFcIiwgXCJvYmplY3RzXCIsIFwiaGllcmFyY2h5XCIsIFwibWV0aG9kc1wiLCBcImV2ZW50c1wiXVxyXG5cdFx0XHRAJG9wdGlvbnNba10gb3I9IHt9XHJcblxyXG5cdFx0QCRvYmplY3RzID0ge31cclxuXHRcdEAkaW5wdXRNYW5hZ2VyID0gbmV3IEJ1LklucHV0TWFuYWdlclxyXG5cclxuXHRcdEJ1LnJlYWR5IEBpbml0LCBAXHJcblxyXG5cdGluaXQ6ICgpIC0+XHJcblx0XHQjIHJlbmRlcmVyXHJcblx0XHRAJHJlbmRlcmVyID0gbmV3IEJ1LlJlbmRlcmVyIEAkb3B0aW9ucy5yZW5kZXJlclxyXG5cclxuXHRcdCMgZGF0YVxyXG5cdFx0aWYgQnUuaXNGdW5jdGlvbiBAJG9wdGlvbnMuZGF0YVxyXG5cdFx0XHRAJG9wdGlvbnMuZGF0YSA9IEAkb3B0aW9ucy5kYXRhLmFwcGx5IHRoaXNcclxuXHRcdEBba10gPSBAJG9wdGlvbnMuZGF0YVtrXSBmb3IgayBvZiBAJG9wdGlvbnMuZGF0YVxyXG5cclxuXHRcdCMgbWV0aG9kc1xyXG5cdFx0QFtrXSA9IEAkb3B0aW9ucy5tZXRob2RzW2tdIGZvciBrIG9mIEAkb3B0aW9ucy5tZXRob2RzXHJcblxyXG5cdFx0IyBvYmplY3RzXHJcblx0XHRpZiBCdS5pc0Z1bmN0aW9uIEAkb3B0aW9ucy5vYmplY3RzXHJcblx0XHRcdEAkb2JqZWN0cyA9IEAkb3B0aW9ucy5vYmplY3RzLmFwcGx5IHRoaXNcclxuXHRcdGVsc2VcclxuXHRcdFx0QCRvYmplY3RzW25hbWVdID0gQCRvcHRpb25zLm9iamVjdHNbbmFtZV0gZm9yIG5hbWUgb2YgQCRvcHRpb25zLm9iamVjdHNcclxuXHJcblx0XHQjIGhpZXJhcmNoeVxyXG5cdFx0IyBUT0RPIHVzZSBhbiBhbGdvcml0aG0gdG8gYXZvaWQgY2lyY3VsYXIgc3RydWN0dXJlXHJcblx0XHRhc3NlbWJsZU9iamVjdHMgPSAoY2hpbGRyZW4sIHBhcmVudCkgPT5cclxuXHRcdFx0Zm9yIG93biBuYW1lIG9mIGNoaWxkcmVuXHJcblx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLnB1c2ggQCRvYmplY3RzW25hbWVdXHJcblx0XHRcdFx0YXNzZW1ibGVPYmplY3RzIGNoaWxkcmVuW25hbWVdLCBAJG9iamVjdHNbbmFtZV1cclxuXHRcdGFzc2VtYmxlT2JqZWN0cyBAJG9wdGlvbnMuaGllcmFyY2h5LCBAJHJlbmRlcmVyLnNjZW5lXHJcblxyXG5cdFx0IyBpbml0XHJcblx0XHRAJG9wdGlvbnMuaW5pdD8uY2FsbCBAXHJcblxyXG5cdFx0IyBldmVudHNcclxuXHRcdEAkaW5wdXRNYW5hZ2VyLmhhbmRsZUFwcEV2ZW50cyBALCBAJG9wdGlvbnMuZXZlbnRzXHJcblxyXG5cdFx0IyB1cGRhdGVcclxuXHRcdGlmIEAkb3B0aW9ucy51cGRhdGU/XHJcblx0XHRcdEAkcmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEAkb3B0aW9ucy51cGRhdGUuYXBwbHkgdGhpcywgYXJndW1lbnRzXHJcbiIsIiMgQXVkaW9cclxuXHJcbmNsYXNzIEJ1LkF1ZGlvXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAodXJsKSAtPlxyXG5cdFx0QGF1ZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnYXVkaW8nXHJcblx0XHRAdXJsID0gJydcclxuXHRcdEByZWFkeSA9IG5vXHJcblxyXG5cdFx0QGxvYWQgdXJsIGlmIHVybFxyXG5cclxuXHRsb2FkOiAodXJsKSAtPlxyXG5cdFx0QHVybCA9IHVybFxyXG5cdFx0QGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIgJ2NhbnBsYXknLCA9PlxyXG5cdFx0XHRAcmVhZHkgPSB5ZXNcclxuXHRcdEBhdWRpby5zcmMgPSB1cmxcclxuXHJcblx0cGxheTogLT5cclxuXHRcdGlmIEByZWFkeVxyXG5cdFx0XHRAYXVkaW8ucGxheSgpXHJcblx0XHRlbHNlXHJcblx0XHRcdGNvbnNvbGUud2FybiBcIlRoZSBhdWRpbyBmaWxlICN7IEB1cmwgfSBoYXNuJ3QgYmVlbiByZWFkeS5cIlxyXG4iLCIjIENhbWVyYTogY2hhbmdlIHRoZSB2aWV3IHJhbmdlIGF0IHRoZSBzY2VuZVxyXG5cclxuY2xhc3MgQnUuQ2FtZXJhIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6ICgpIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdDYW1lcmEnXHJcblxyXG4iLCIjIFVzZWQgdG8gcmVuZGVyIGFsbCB0aGUgZHJhd2FibGUgb2JqZWN0cyB0byB0aGUgY2FudmFzXHJcblxyXG5jbGFzcyBCdS5SZW5kZXJlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHRcdEB0eXBlID0gJ1JlbmRlcmVyJ1xyXG5cclxuXHRcdCMgQVBJXHJcblx0XHRAc2NlbmUgPSBuZXcgQnUuU2NlbmVcclxuXHRcdEBjYW1lcmEgPSBuZXcgQnUuQ2FtZXJhXHJcblx0XHRAdGlja0NvdW50ID0gMFxyXG5cdFx0QGlzUnVubmluZyA9IHllc1xyXG5cdFx0QHBpeGVsUmF0aW8gPSBCdS5nbG9iYWwuZGV2aWNlUGl4ZWxSYXRpbyBvciAxXHJcblx0XHRAY2xpcE1ldGVyID0gbmV3IENsaXBNZXRlcigpIGlmIENsaXBNZXRlcj9cclxuXHJcblx0XHQjIFJlY2VpdmUgb3B0aW9uc1xyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0Y29udGFpbmVyOiAnYm9keSdcclxuXHRcdFx0YmFja2dyb3VuZDogJyNlZWUnXHJcblx0XHRcdGZwczogNjBcclxuXHRcdFx0c2hvd0tleVBvaW50czogbm9cclxuXHRcdFx0c2hvd0JvdW5kczogbm9cclxuXHRcdFx0b3JpZ2luQXRDZW50ZXI6IG5vXHJcblx0XHRcdGltYWdlU21vb3RoaW5nOiB5ZXNcclxuXHJcblx0XHQjIENvcHkgb3B0aW9uc1xyXG5cdFx0Zm9yIG5hbWUgaW4gWydjb250YWluZXInLCAnYmFja2dyb3VuZCcsICd3aWR0aCcsICdoZWlnaHQnLCAnZnBzJywgJ3Nob3dLZXlQb2ludHMnLCAnc2hvd0JvdW5kcycsICdvcmlnaW5BdENlbnRlciddXHJcblx0XHRcdEBbbmFtZV0gPSBvcHRpb25zW25hbWVdXHJcblxyXG5cdFx0IyBJZiBvcHRpb25zLndpZHRoIGlzIG5vdCBnaXZlbiwgdGhlbiBmaWxsUGFyZW50IGlzIHRydWVcclxuXHRcdEBmaWxsUGFyZW50ID0gbm90IEJ1LmlzTnVtYmVyIG9wdGlvbnMud2lkdGhcclxuXHJcblx0XHQjIENvbnZlcnQgd2lkdGggYW5kIGhlaWdodCBmcm9tIGRpcChkZXZpY2UgaW5kZXBlbmRlbnQgcGl4ZWxzKSB0byBwaHlzaWNhbCBwaXhlbHNcclxuXHRcdEB3aWR0aCAqPSBAcGl4ZWxSYXRpb1xyXG5cdFx0QGhlaWdodCAqPSBAcGl4ZWxSYXRpb1xyXG5cclxuXHRcdCMgU2V0IGNhbnZhcyBkb21cclxuXHRcdEBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0XHRAZG9tLnN0eWxlLmN1cnNvciA9IG9wdGlvbnMuY3Vyc29yIG9yICdkZWZhdWx0J1xyXG5cdFx0QGRvbS5zdHlsZS5ib3hTaXppbmcgPSAnY29udGVudC1ib3gnXHJcblx0XHRAZG9tLnN0eWxlLmJhY2tncm91bmQgPSBAYmFja2dyb3VuZFxyXG5cdFx0QGRvbS5vbmNvbnRleHRtZW51ID0gLT4gZmFsc2VcclxuXHJcblx0XHQjIFNldCBjb250ZXh0XHJcblx0XHRAY29udGV4dCA9IEBkb20uZ2V0Q29udGV4dCAnMmQnXHJcblx0XHRAY29udGV4dC50ZXh0QmFzZWxpbmUgPSAndG9wJ1xyXG5cdFx0QGNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gb3B0aW9ucy5pbWFnZVNtb290aGluZ1xyXG5cclxuXHRcdCMgU2V0IGNvbnRhaW5lciBkb21cclxuXHRcdEBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIEBjb250YWluZXIgaWYgQnUuaXNTdHJpbmcgQGNvbnRhaW5lclxyXG5cdFx0aWYgQGZpbGxQYXJlbnQgYW5kIEBjb250YWluZXIgPT0gZG9jdW1lbnQuYm9keVxyXG5cdFx0XHQkKCdib2R5Jykuc3R5bGUoJ21hcmdpbicsIDApLnN0eWxlKCdvdmVyZmxvdycsICdoaWRkZW4nKVxyXG5cdFx0XHQkKCdodG1sLCBib2R5Jykuc3R5bGUoJ3dpZHRoJywgJzEwMCUnKS5zdHlsZSgnaGVpZ2h0JywgJzEwMCUnKVxyXG5cclxuXHRcdCMgU2V0IHNpemVzIGZvciByZW5kZXJlciBwcm9wZXJ0eSwgZG9tIGF0dHJpYnV0ZSBhbmQgZG9tIHN0eWxlXHJcblx0XHRvblJlc2l6ZSA9ID0+XHJcblx0XHRcdGNhbnZhc1JhdGlvID0gQGRvbS5oZWlnaHQgLyBAZG9tLndpZHRoXHJcblx0XHRcdGNvbnRhaW5lclJhdGlvID0gQGNvbnRhaW5lci5jbGllbnRIZWlnaHQgLyBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdGlmIGNvbnRhaW5lclJhdGlvIDwgY2FudmFzUmF0aW9cclxuXHRcdFx0XHRoZWlnaHQgPSBAY29udGFpbmVyLmNsaWVudEhlaWdodFxyXG5cdFx0XHRcdHdpZHRoID0gaGVpZ2h0IC8gY29udGFpbmVyUmF0aW9cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHdpZHRoID0gQGNvbnRhaW5lci5jbGllbnRXaWR0aFxyXG5cdFx0XHRcdGhlaWdodCA9IHdpZHRoICogY29udGFpbmVyUmF0aW9cclxuXHRcdFx0QHdpZHRoID0gQGRvbS53aWR0aCA9IHdpZHRoICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGhlaWdodCA9IEBkb20uaGVpZ2h0ID0gaGVpZ2h0ICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGRvbS5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcclxuXHRcdFx0QHJlbmRlcigpXHJcblxyXG5cdFx0aWYgbm90IEBmaWxsUGFyZW50XHJcblx0XHRcdEBkb20uc3R5bGUud2lkdGggPSAoQHdpZHRoIC8gQHBpeGVsUmF0aW8pICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IChAaGVpZ2h0IC8gQHBpeGVsUmF0aW8pICsgJ3B4J1xyXG5cdFx0XHRAZG9tLndpZHRoID0gQHdpZHRoXHJcblx0XHRcdEBkb20uaGVpZ2h0ID0gQGhlaWdodFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAd2lkdGggPSBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdEBoZWlnaHQgPSBAY29udGFpbmVyLmNsaWVudEhlaWdodFxyXG5cdFx0XHRCdS5nbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIG9uUmVzaXplXHJcblx0XHRcdEBkb20uYWRkRXZlbnRMaXN0ZW5lciAnRE9NTm9kZUluc2VydGVkJywgb25SZXNpemVcclxuXHJcblx0XHQjIFJ1biB0aGUgbG9vcFxyXG5cdFx0dGljayA9ID0+XHJcblx0XHRcdGlmIEBpc1J1bm5pbmdcclxuXHRcdFx0XHRAY2xpcE1ldGVyLnN0YXJ0KCkgaWYgQGNsaXBNZXRlcj9cclxuXHRcdFx0XHRAcmVuZGVyKClcclxuXHRcdFx0XHRAdHJpZ2dlciAndXBkYXRlJywgQFxyXG5cdFx0XHRcdEB0aWNrQ291bnQgKz0gMVxyXG5cdFx0XHRcdEBjbGlwTWV0ZXIudGljaygpIGlmIEBjbGlwTWV0ZXI/XHJcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSB0aWNrXHJcblx0XHR0aWNrKClcclxuXHJcblx0XHQjIEFwcGVuZCA8Y2FudmFzPiBkb20gaW50byB0aGUgY29udGFpbmVyXHJcblx0XHRhcHBlbmREb20gPSA9PlxyXG5cdFx0XHRAY29udGFpbmVyLmFwcGVuZENoaWxkIEBkb21cclxuXHRcdHNldFRpbWVvdXQgYXBwZW5kRG9tLCAxXHJcblxyXG5cdFx0IyBIb29rIHVwIHdpdGggcnVubmluZyBjb21wb25lbnRzXHJcblx0XHRCdS5hbmltYXRpb25SdW5uZXIuaG9va1VwIEBcclxuXHRcdEJ1LmRhc2hGbG93TWFuYWdlci5ob29rVXAgQFxyXG5cclxuXHJcblx0IyBQYXVzZS9jb250aW51ZS90b2dnbGUgdGhlIHJlbmRlcmluZyBsb29wXHJcblx0cGF1c2U6IC0+IEBpc1J1bm5pbmcgPSBmYWxzZVxyXG5cdGNvbnRpbnVlOiAtPiBAaXNSdW5uaW5nID0gdHJ1ZVxyXG5cdHRvZ2dsZTogLT4gQGlzUnVubmluZyA9IG5vdCBAaXNSdW5uaW5nXHJcblxyXG5cclxuXHQjIFBlcmZvcm0gdGhlIGZ1bGwgcmVuZGVyIHByb2Nlc3NcclxuXHRyZW5kZXI6IC0+XHJcblx0XHRAY29udGV4dC5zYXZlKClcclxuXHJcblx0XHQjIENsZWFyIHRoZSBjYW52YXNcclxuXHRcdEBjbGVhckNhbnZhcygpXHJcblxyXG5cdFx0IyBNb3ZlIGNlbnRlciBmcm9tIGxlZnQtdG9wIGNvcm5lciB0byBzY3JlZW4gY2VudGVyXHJcblx0XHRAY29udGV4dC50cmFuc2xhdGUgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIgaWYgQG9yaWdpbkF0Q2VudGVyXHJcblxyXG5cdFx0IyBab29tIHRoZSBjYW52YXMgd2l0aCBkZXZpY2VQaXhlbFJhdGlvIHRvIHN1cHBvcnQgaGlnaCBkZWZpbml0aW9uIHNjcmVlblxyXG5cdFx0QGNvbnRleHQuc2NhbGUgQHBpeGVsUmF0aW8sIEBwaXhlbFJhdGlvXHJcblxyXG5cdFx0IyBUcmFuc2Zvcm0gdGhlIGNhbWVyYVxyXG5cdFx0QGNvbnRleHQuc2NhbGUgMSAvIEBjYW1lcmEuc2NhbGUueCwgMSAvIEBjYW1lcmEuc2NhbGUueVxyXG5cdFx0QGNvbnRleHQucm90YXRlIC1AY2FtZXJhLnJvdGF0aW9uXHJcblx0XHRAY29udGV4dC50cmFuc2xhdGUgLUBjYW1lcmEucG9zaXRpb24ueCwgLUBjYW1lcmEucG9zaXRpb24ueVxyXG5cclxuXHRcdCMgRHJhdyB0aGUgc2NlbmUgdHJlZVxyXG5cdFx0QGRyYXdTaGFwZSBAc2NlbmVcclxuXHRcdEBjb250ZXh0LnJlc3RvcmUoKVxyXG5cdFx0QFxyXG5cclxuXHQjIENsZWFyIHRoZSBjYW52YXNcclxuXHRjbGVhckNhbnZhczogLT5cclxuXHRcdEBjb250ZXh0LmNsZWFyUmVjdCAwLCAwLCBAd2lkdGgsIEBoZWlnaHRcclxuXHRcdEBcclxuXHJcblx0IyBEcmF3IGFuIGFycmF5IG9mIGRyYXdhYmxlc1xyXG5cdGRyYXdTaGFwZXM6IChzaGFwZXMpID0+XHJcblx0XHRpZiBzaGFwZXM/XHJcblx0XHRcdGZvciBzaGFwZSBpbiBzaGFwZXNcclxuXHRcdFx0XHRAY29udGV4dC5zYXZlKClcclxuXHRcdFx0XHRAZHJhd1NoYXBlIHNoYXBlXHJcblx0XHRcdFx0QGNvbnRleHQucmVzdG9yZSgpXHJcblx0XHRAXHJcblxyXG5cdCMgRHJhdyBhbiBkcmF3YWJsZSB0byB0aGUgY2FudmFzXHJcblx0ZHJhd1NoYXBlOiAoc2hhcGUpID0+XHJcblx0XHRyZXR1cm4gQCB1bmxlc3Mgc2hhcGUudmlzaWJsZVxyXG5cclxuXHRcdEBjb250ZXh0LnRyYW5zbGF0ZSBzaGFwZS5wb3NpdGlvbi54LCBzaGFwZS5wb3NpdGlvbi55XHJcblx0XHRAY29udGV4dC5yb3RhdGUgc2hhcGUucm90YXRpb25cclxuXHRcdHN4ID0gc2hhcGUuc2NhbGUueFxyXG5cdFx0c3kgPSBzaGFwZS5zY2FsZS55XHJcblx0XHRpZiBzeCAvIHN5ID4gMTAwIG9yIHN4IC8gc3kgPCAwLjAxXHJcblx0XHRcdHN4ID0gMCBpZiBNYXRoLmFicyhzeCkgPCAwLjAyXHJcblx0XHRcdHN5ID0gMCBpZiBNYXRoLmFicyhzeSkgPCAwLjAyXHJcblx0XHRAY29udGV4dC5zY2FsZSBzeCwgc3lcclxuXHJcblx0XHRAY29udGV4dC5nbG9iYWxBbHBoYSAqPSBzaGFwZS5vcGFjaXR5XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzaGFwZS5zdHJva2VTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5saW5lV2lkdGggPSBzaGFwZS5saW5lV2lkdGhcclxuXHRcdFx0QGNvbnRleHQubGluZUNhcCA9IHNoYXBlLmxpbmVDYXAgaWYgc2hhcGUubGluZUNhcD9cclxuXHRcdFx0QGNvbnRleHQubGluZUpvaW4gPSBzaGFwZS5saW5lSm9pbiBpZiBzaGFwZS5saW5lSm9pbj9cclxuXHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cclxuXHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdHdoZW4gJ1BvaW50JyB0aGVuIEBkcmF3UG9pbnQgc2hhcGVcclxuXHRcdFx0d2hlbiAnTGluZScgdGhlbiBAZHJhd0xpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEBkcmF3Q2lyY2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0VsbGlwc2UnIHRoZW4gQGRyYXdFbGxpcHNlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ1RyaWFuZ2xlJyB0aGVuIEBkcmF3VHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUmVjdGFuZ2xlJyB0aGVuIEBkcmF3UmVjdGFuZ2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAZHJhd0ZhbiBzaGFwZVxyXG5cdFx0XHR3aGVuICdCb3cnIHRoZW4gQGRyYXdCb3cgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAZHJhd1BvbHlnb24gc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnIHRoZW4gQGRyYXdQb2x5bGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdTcGxpbmUnIHRoZW4gQGRyYXdTcGxpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9pbnRUZXh0JyB0aGVuIEBkcmF3UG9pbnRUZXh0IHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ltYWdlJyB0aGVuIEBkcmF3SW1hZ2Ugc2hhcGVcclxuXHRcdFx0d2hlbiAnT2JqZWN0MkQnLCAnU2NlbmUnICMgdGhlbiBkbyBub3RoaW5nXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLmxvZyAnZHJhd1NoYXBlcygpOiB1bmtub3duIHNoYXBlOiAnLCBzaGFwZS50eXBlLCBzaGFwZVxyXG5cclxuXHJcblx0XHRpZiBzaGFwZS5maWxsU3R5bGU/IGFuZCBzaGFwZS5maWxsYWJsZVxyXG5cdFx0XHRAY29udGV4dC5maWxsU3R5bGUgPSBzaGFwZS5maWxsU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuZmlsbCgpXHJcblxyXG5cdFx0aWYgc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRcdEBjb250ZXh0LmxpbmVEYXNoT2Zmc2V0ID0gc2hhcGUuZGFzaE9mZnNldFxyXG5cdFx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblx0XHRcdEBjb250ZXh0LnNldExpbmVEYXNoIFtdXHJcblx0XHRlbHNlIGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRAY29udGV4dC5zdHJva2UoKVxyXG5cclxuXHRcdEBkcmF3U2hhcGVzIHNoYXBlLmNoaWxkcmVuIGlmIHNoYXBlLmNoaWxkcmVuP1xyXG5cdFx0QGRyYXdTaGFwZXMgc2hhcGUua2V5UG9pbnRzIGlmIEBzaG93S2V5UG9pbnRzXHJcblx0XHRAZHJhd0JvdW5kcyBzaGFwZS5ib3VuZHMgaWYgQHNob3dCb3VuZHMgYW5kIHNoYXBlLmJvdW5kcz9cclxuXHRcdEBcclxuXHJcblxyXG5cclxuXHRkcmF3UG9pbnQ6IChzaGFwZSkgLT5cclxuXHRcdEBjb250ZXh0LmFyYyBzaGFwZS54LCBzaGFwZS55LCBCdS5QT0lOVF9SRU5ERVJfU0laRSwgMCwgQnUuVFdPX1BJXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3TGluZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0NpcmNsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCAwLCBCdS5UV09fUElcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdFbGxpcHNlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5lbGxpcHNlIDAsIDAsIHNoYXBlLnJhZGl1c1gsIHNoYXBlLnJhZGl1c1ksIDAsIEJ1LlRXT19QSSwgbm9cclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdUcmlhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1syXS54LCBzaGFwZS5wb2ludHNbMl0ueVxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdSZWN0YW5nbGU6IChzaGFwZSkgLT5cclxuXHRcdHJldHVybiBAZHJhd1JvdW5kUmVjdGFuZ2xlIHNoYXBlIGlmIHNoYXBlLmNvcm5lclJhZGl1cyAhPSAwXHJcblx0XHRAY29udGV4dC5yZWN0IHNoYXBlLnBvaW50TFQueCwgc2hhcGUucG9pbnRMVC55LCBzaGFwZS5zaXplLndpZHRoLCBzaGFwZS5zaXplLmhlaWdodFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1JvdW5kUmVjdGFuZ2xlOiAoc2hhcGUpIC0+XHJcblx0XHR4MSA9IHNoYXBlLnBvaW50TFQueFxyXG5cdFx0eDIgPSBzaGFwZS5wb2ludFJCLnhcclxuXHRcdHkxID0gc2hhcGUucG9pbnRMVC55XHJcblx0XHR5MiA9IHNoYXBlLnBvaW50UkIueVxyXG5cdFx0ciA9IHNoYXBlLmNvcm5lclJhZGl1c1xyXG5cclxuXHRcdEBjb250ZXh0Lm1vdmVUbyB4MSwgeTEgKyByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTEsIHgxICsgciwgeTEsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiAtIHIsIHkxXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTEsIHgyLCB5MSArIHIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiwgeTIgLSByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTIsIHgyIC0gciwgeTIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MSArIHIsIHkyXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTIsIHgxLCB5MiAtIHIsIHJcclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblxyXG5cdFx0QGNvbnRleHQuc2V0TGluZURhc2g/IHNoYXBlLmRhc2hTdHlsZSBpZiBzaGFwZS5zdHJva2VTdHlsZT8gYW5kIHNoYXBlLmRhc2hTdHlsZVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ZhbjogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUuY3gsIHNoYXBlLmN5XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0JvdzogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvbHlnb246IChzaGFwZSkgLT5cclxuXHRcdGZvciBwb2ludCBpbiBzaGFwZS52ZXJ0aWNlc1xyXG5cdFx0XHRAY29udGV4dC5saW5lVG8gcG9pbnQueCwgcG9pbnQueVxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdQb2x5bGluZTogKHNoYXBlKSAtPlxyXG5cdFx0Zm9yIHBvaW50IGluIHNoYXBlLnZlcnRpY2VzXHJcblx0XHRcdEBjb250ZXh0LmxpbmVUbyBwb2ludC54LCBwb2ludC55XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3U3BsaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0bGVuID0gc2hhcGUudmVydGljZXMubGVuZ3RoXHJcblx0XHRcdGlmIGxlbiA9PSAyXHJcblx0XHRcdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnZlcnRpY2VzWzBdLngsIHNoYXBlLnZlcnRpY2VzWzBdLnlcclxuXHRcdFx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUudmVydGljZXNbMV0ueCwgc2hhcGUudmVydGljZXNbMV0ueVxyXG5cdFx0XHRlbHNlIGlmIGxlbiA+IDJcclxuXHRcdFx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUudmVydGljZXNbMF0ueCwgc2hhcGUudmVydGljZXNbMF0ueVxyXG5cdFx0XHRcdGZvciBpIGluIFsxLi5sZW4gLSAxXVxyXG5cdFx0XHRcdFx0QGNvbnRleHQuYmV6aWVyQ3VydmVUbyhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQmVoaW5kW2kgLSAxXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0JlaGluZFtpIC0gMV0ueVxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLmNvbnRyb2xQb2ludHNBaGVhZFtpXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0FoZWFkW2ldLnlcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS54XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUudmVydGljZXNbaV0ueVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvaW50VGV4dDogKHNoYXBlKSAtPlxyXG5cdFx0Zm9udCA9IHNoYXBlLmZvbnQgb3IgQnUuREVGQVVMVF9GT05UXHJcblxyXG5cdFx0aWYgQnUuaXNTdHJpbmcgZm9udFxyXG5cdFx0XHRAY29udGV4dC50ZXh0QWxpZ24gPSBzaGFwZS50ZXh0QWxpZ25cclxuXHRcdFx0QGNvbnRleHQudGV4dEJhc2VsaW5lID0gc2hhcGUudGV4dEJhc2VsaW5lXHJcblx0XHRcdEBjb250ZXh0LmZvbnQgPSBmb250XHJcblxyXG5cdFx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0XHRAY29udGV4dC5zdHJva2VUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdFx0aWYgc2hhcGUuZmlsbFN0eWxlP1xyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxTdHlsZSA9IHNoYXBlLmZpbGxTdHlsZVxyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdGVsc2UgaWYgZm9udCBpbnN0YW5jZW9mIEJ1LlNwcml0ZVNoZWV0IGFuZCBmb250LnJlYWR5XHJcblx0XHRcdHRleHRXaWR0aCA9IGZvbnQubWVhc3VyZVRleHRXaWR0aCBzaGFwZS50ZXh0XHJcblx0XHRcdHhPZmZzZXQgPSBzd2l0Y2ggc2hhcGUudGV4dEFsaWduXHJcblx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnY2VudGVyJyB0aGVuIC10ZXh0V2lkdGggLyAyXHJcblx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gLXRleHRXaWR0aFxyXG5cdFx0XHR5T2Zmc2V0ID0gc3dpdGNoIHNoYXBlLnRleHRCYXNlbGluZVxyXG5cdFx0XHRcdHdoZW4gJ3RvcCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnbWlkZGxlJyB0aGVuIC1mb250LmhlaWdodCAvIDJcclxuXHRcdFx0XHR3aGVuICdib3R0b20nIHRoZW4gLWZvbnQuaGVpZ2h0XHJcblx0XHRcdGZvciBpIGluIFswLi4uc2hhcGUudGV4dC5sZW5ndGhdXHJcblx0XHRcdFx0Y2hhciA9IHNoYXBlLnRleHRbaV1cclxuXHRcdFx0XHRjaGFyQml0bWFwID0gZm9udC5nZXRGcmFtZUltYWdlIGNoYXJcclxuXHRcdFx0XHRpZiBjaGFyQml0bWFwP1xyXG5cdFx0XHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIGNoYXJCaXRtYXAsIHNoYXBlLnggKyB4T2Zmc2V0LCBzaGFwZS55ICsgeU9mZnNldFxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSBjaGFyQml0bWFwLndpZHRoXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSAxMFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ltYWdlOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5yZWFkeVxyXG5cdFx0XHR3ID0gc2hhcGUuc2l6ZS53aWR0aFxyXG5cdFx0XHRoID0gc2hhcGUuc2l6ZS5oZWlnaHRcclxuXHRcdFx0ZHggPSAtdyAqIHNoYXBlLnBpdm90LnhcclxuXHRcdFx0ZHkgPSAtaCAqIHNoYXBlLnBpdm90LnlcclxuXHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIHNoYXBlLmltYWdlLCBkeCwgZHksIHcsIGhcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdCb3VuZHM6IChib3VuZHMpIC0+XHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBCdS5SZW5kZXJlci5CT1VORFNfU1RST0tFX1NUWUxFXHJcblx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gQnUuUmVuZGVyZXIuQk9VTkRTX0RBU0hfU1RZTEVcclxuXHRcdEBjb250ZXh0LnJlY3QgYm91bmRzLngxLCBib3VuZHMueTEsIGJvdW5kcy54MiAtIGJvdW5kcy54MSwgYm91bmRzLnkyIC0gYm91bmRzLnkxXHJcblx0XHRAY29udGV4dC5zdHJva2UoKVxyXG5cdFx0QFxyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBTdGF0aWMgbWVtYmVyc1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBTdHJva2Ugc3R5bGUgb2YgYm91bmRzXHJcbkJ1LlJlbmRlcmVyLkJPVU5EU19TVFJPS0VfU1RZTEUgPSAncmVkJ1xyXG5cclxuIyBEYXNoIHN0eWxlIG9mIGJvdW5kc1xyXG5CdS5SZW5kZXJlci5CT1VORFNfREFTSF9TVFlMRSA9IFs2LCA2XVxyXG4iLCIjIFNjZW5lIGlzIHRoZSByb290IG9mIHRoZSBvYmplY3QgdHJlZVxyXG5cclxuY2xhc3MgQnUuU2NlbmUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1NjZW5lJ1xyXG4iLCIjIEJvdyBzaGFwZVxyXG5cclxuY2xhc3MgQnUuQm93IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ0JvdydcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUbykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRbQGFGcm9tLCBAYVRvXSA9IFtAYVRvLCBAYUZyb21dIGlmIEBhRnJvbSA+IEBhVG9cclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nID0gbmV3IEJ1LkxpbmUgQGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYUZyb20pLCBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhVG8pXHJcblx0XHRAa2V5UG9pbnRzID0gQHN0cmluZy5wb2ludHNcclxuXHJcblx0XHRAdXBkYXRlS2V5UG9pbnRzKClcclxuXHRcdEBvbiAnY2hhbmdlZCcsIEB1cGRhdGVLZXlQb2ludHNcclxuXHRcdEBvbiAnY2hhbmdlZCcsID0+IEAuYm91bmRzPy51cGRhdGUoKVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LkJvdyBAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvXHJcblxyXG5cdHVwZGF0ZUtleVBvaW50czogLT5cclxuXHRcdEBjZW50ZXIuc2V0IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nLnBvaW50c1swXS5jb3B5IEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFGcm9tXHJcblx0XHRAc3RyaW5nLnBvaW50c1sxXS5jb3B5IEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFUb1xyXG5cdFx0QGtleVBvaW50cyA9IEBzdHJpbmcucG9pbnRzXHJcblx0XHRAXHJcbiIsIiMgQ2lyY2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5DaXJjbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnQ2lyY2xlJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAX3JhZGl1cyA9IDEsIGN4ID0gMCwgY3kgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEBfY2VudGVyID0gbmV3IEJ1LlBvaW50KGN4LCBjeSlcclxuXHRcdEBib3VuZHMgPSBudWxsICMgZm9yIGFjY2VsZXJhdGUgY29udGFpbiB0ZXN0XHJcblxyXG5cdFx0QGtleVBvaW50cyA9IFtAX2NlbnRlcl1cclxuXHRcdEBvbiAnY2VudGVyQ2hhbmdlZCcsIEB1cGRhdGVLZXlQb2ludHNcclxuXHJcblx0Y2xvbmU6ICgpIC0+IG5ldyBCdS5DaXJjbGUgQHJhZGl1cywgQGN4LCBAY3lcclxuXHJcblx0dXBkYXRlS2V5UG9pbnRzOiAtPlxyXG5cdFx0QGtleVBvaW50c1swXS5zZXQgQGN4LCBAY3lcclxuXHJcblx0IyBwcm9wZXJ0eVxyXG5cclxuXHRAcHJvcGVydHkgJ2N4JyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXIueFxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2NlbnRlci54ID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjZW50ZXJDaGFuZ2VkJywgQFxyXG5cclxuXHRAcHJvcGVydHkgJ2N5JyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXIueVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2NlbnRlci55ID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjZW50ZXJDaGFuZ2VkJywgQFxyXG5cclxuXHRAcHJvcGVydHkgJ2NlbnRlcicsXHJcblx0XHRnZXQ6IC0+IEBfY2VudGVyXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyID0gdmFsXHJcblx0XHRcdEBjeCA9IHZhbC54XHJcblx0XHRcdEBjeSA9IHZhbC55XHJcblx0XHRcdEBrZXlQb2ludHNbMF0gPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAncmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9yYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9yYWRpdXMgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ3JhZGl1c0NoYW5nZWQnLCBAXHJcblx0XHRcdEBcclxuIiwiIyBFbGxpcHNlL092YWwgU2hhcGVcclxuXHJcbmNsYXNzIEJ1LkVsbGlwc2UgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnRWxsaXBzZSdcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQF9yYWRpdXNYID0gMjAsIEBfcmFkaXVzWSA9IDEwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHQjIHByb3BlcnR5XHJcblxyXG5cdEBwcm9wZXJ0eSAncmFkaXVzWCcsXHJcblx0XHRnZXQ6IC0+IEBfcmFkaXVzWFxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1c1ggPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NoYW5nZWQnLCBAXHJcblxyXG5cclxuXHRAcHJvcGVydHkgJ3JhZGl1c1knLFxyXG5cdFx0Z2V0OiAtPiBAX3JhZGl1c1lcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9yYWRpdXNZID0gdmFsXHJcblx0XHRcdEB0cmlnZ2VyICdjaGFuZ2VkJywgQFxyXG4iLCIjIEZhbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuRmFuIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ0ZhbidcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUbykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRbQGFGcm9tLCBAYVRvXSA9IFtAYVRvLCBAYUZyb21dIGlmIEBhRnJvbSA+IEBhVG9cclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nID0gbmV3IEJ1LkxpbmUgQGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYUZyb20pLCBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhVG8pXHJcblxyXG5cdFx0QGtleVBvaW50cyA9IFtcclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMF1cclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMV1cclxuXHRcdFx0QGNlbnRlclxyXG5cdFx0XVxyXG5cdFx0QG9uICdjaGFuZ2VkJywgQHVwZGF0ZUtleVBvaW50c1xyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuRmFuIEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuXHJcblx0dXBkYXRlS2V5UG9pbnRzOiAtPlxyXG5cdFx0QGNlbnRlci5zZXQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcucG9pbnRzWzBdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYUZyb21cclxuXHRcdEBzdHJpbmcucG9pbnRzWzFdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYVRvXHJcblx0XHRAXHJcbiIsIiMgbGluZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuTGluZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdMaW5lJ1xyXG5cdGZpbGxhYmxlOiBub1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHAxLCBwMiwgcDMsIHA0KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPCAyXHJcblx0XHRcdEBwb2ludHMgPSBbbmV3IEJ1LlBvaW50KCksIG5ldyBCdS5Qb2ludCgpXVxyXG5cdFx0ZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoIDwgNFxyXG5cdFx0XHRAcG9pbnRzID0gW3AxLmNsb25lKCksIHAyLmNsb25lKCldXHJcblx0XHRlbHNlICAjIGxlbiA+PSA0XHJcblx0XHRcdEBwb2ludHMgPSBbbmV3IEJ1LlBvaW50KHAxLCBwMiksIG5ldyBCdS5Qb2ludChwMywgcDQpXVxyXG5cclxuXHRcdEBsZW5ndGggPSAwXHJcblx0XHRAbWlkcG9pbnQgPSBuZXcgQnUuUG9pbnQoKVxyXG5cdFx0QGtleVBvaW50cyA9IEBwb2ludHNcclxuXHJcblx0XHRAb24gXCJjaGFuZ2VkXCIsID0+XHJcblx0XHRcdEBsZW5ndGggPSBAcG9pbnRzWzBdLmRpc3RhbmNlVG8oQHBvaW50c1sxXSlcclxuXHRcdFx0QG1pZHBvaW50LnNldCgoQHBvaW50c1swXS54ICsgQHBvaW50c1sxXS54KSAvIDIsIChAcG9pbnRzWzBdLnkgKyBAcG9pbnRzWzFdLnkpIC8gMilcclxuXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LkxpbmUgQHBvaW50c1swXSwgQHBvaW50c1sxXVxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0c2V0OiAoYTEsIGEyLCBhMywgYTQpIC0+XHJcblx0XHRpZiBwND9cclxuXHRcdFx0QHBvaW50c1swXS5zZXQgYTEsIGEyXHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGEzLCBhNFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzBdID0gYTFcclxuXHRcdFx0QHBvaW50c1sxXSA9IGEyXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG5cclxuXHRzZXRQb2ludDE6IChhMSwgYTIpIC0+XHJcblx0XHRpZiBhMj9cclxuXHRcdFx0QHBvaW50c1swXS5zZXQgYTEsIGEyXHJcblx0XHRlbHNlXHJcblx0XHRcdEBwb2ludHNbMF0uY29weSBhMVxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHRcdEBcclxuXHJcblx0c2V0UG9pbnQyOiAoYTEsIGEyKSAtPlxyXG5cdFx0aWYgYTI/XHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGExLCBhMlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzFdLmNvcHkgYTFcclxuXHRcdEB0cmlnZ2VyIFwiY2hhbmdlZFwiXHJcblx0XHRAXHJcbiIsIiMgcG9pbnQgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlBvaW50IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1BvaW50J1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAeCA9IDAsIEB5ID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAbGluZVdpZHRoID0gMC41XHJcblx0XHRAX2xhYmVsSW5kZXggPSAtMVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvaW50IEB4LCBAeVxyXG5cclxuXHRAcHJvcGVydHkgJ2xhYmVsJyxcclxuXHRcdGdldDogLT4gaWYgQF9sYWJlbEluZGV4ID4gLTEgdGhlbiBAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0IGVsc2UgJydcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0aWYgQF9sYWJlbEluZGV4ID09IC0xXHJcblx0XHRcdFx0cG9pbnRUZXh0ID0gbmV3IEJ1LlBvaW50VGV4dCB2YWwsIEB4ICsgQnUuUE9JTlRfTEFCRUxfT0ZGU0VULCBAeSwge2FsaWduOiAnKzAnfVxyXG5cdFx0XHRcdEBjaGlsZHJlbi5wdXNoIHBvaW50VGV4dFxyXG5cdFx0XHRcdEBfbGFiZWxJbmRleCA9IEBjaGlsZHJlbi5sZW5ndGggLSAxXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0ID0gdmFsXHJcblxyXG5cdGFyY1RvOiAocmFkaXVzLCBhcmMpIC0+XHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IEB4ICsgTWF0aC5jb3MoYXJjKSAqIHJhZGl1cywgQHkgKyBNYXRoLnNpbihhcmMpICogcmFkaXVzXHJcblxyXG5cclxuXHQjIGNvcHkgdmFsdWUgZnJvbSBvdGhlciBsaW5lXHJcblx0Y29weTogKHBvaW50KSAtPlxyXG5cdFx0QHggPSBwb2ludC54XHJcblx0XHRAeSA9IHBvaW50LnlcclxuXHRcdEB1cGRhdGVMYWJlbCgpXHJcblxyXG5cdCMgc2V0IHZhbHVlIGZyb20geCwgeVxyXG5cdHNldDogKHgsIHkpIC0+XHJcblx0XHRAeCA9IHhcclxuXHRcdEB5ID0geVxyXG5cdFx0QHVwZGF0ZUxhYmVsKClcclxuXHJcblx0dXBkYXRlTGFiZWw6IC0+XHJcblx0XHRpZiBAX2xhYmVsSW5kZXggPiAtMVxyXG5cdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS54ID0gQHggKyBCdS5QT0lOVF9MQUJFTF9PRkZTRVRcclxuXHRcdFx0QGNoaWxkcmVuW0BfbGFiZWxJbmRleF0ueSA9IEB5XHJcbiIsIiMgcG9seWdvbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUG9seWdvbiBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdQb2x5Z29uJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0IyMjXHJcbiAgICBjb25zdHJ1Y3RvcnNcclxuICAgIDEuIFBvbHlnb24ocG9pbnRzKVxyXG4gICAgMi4gUG9seWdvbih4LCB5LCByYWRpdXMsIG4sIG9wdGlvbnMpOiB0byBnZW5lcmF0ZSByZWd1bGFyIHBvbHlnb25cclxuICAgIFx0b3B0aW9uczogYW5nbGUgLSBzdGFydCBhbmdsZSBvZiByZWd1bGFyIHBvbHlnb25cclxuXHQjIyNcclxuXHRjb25zdHJ1Y3RvcjogKHBvaW50cykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAdmVydGljZXMgPSBbXVxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEB0cmlhbmdsZXMgPSBbXVxyXG5cclxuXHRcdG9wdGlvbnMgPSBCdS5jb21iaW5lT3B0aW9ucyBhcmd1bWVudHMsXHJcblx0XHRcdGFuZ2xlOiAwXHJcblxyXG5cdFx0aWYgQnUuaXNBcnJheSBwb2ludHNcclxuXHRcdFx0QHZlcnRpY2VzID0gcG9pbnRzIGlmIHBvaW50cz9cclxuXHRcdGVsc2VcclxuXHRcdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA8IDRcclxuXHRcdFx0XHR4ID0gMFxyXG5cdFx0XHRcdHkgPSAwXHJcblx0XHRcdFx0cmFkaXVzID0gYXJndW1lbnRzWzBdXHJcblx0XHRcdFx0biA9IGFyZ3VtZW50c1sxXVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0eCA9IGFyZ3VtZW50c1swXVxyXG5cdFx0XHRcdHkgPSBhcmd1bWVudHNbMV1cclxuXHRcdFx0XHRyYWRpdXMgPSBhcmd1bWVudHNbMl1cclxuXHRcdFx0XHRuID0gYXJndW1lbnRzWzNdXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IEJ1LlBvbHlnb24uZ2VuZXJhdGVSZWd1bGFyUG9pbnRzIHgsIHksIHJhZGl1cywgbiwgb3B0aW9uc1xyXG5cclxuXHRcdEBvblZlcnRpY2VzQ2hhbmdlZCgpXHJcblx0XHRAb24gJ2NoYW5nZWQnLCBAb25WZXJ0aWNlc0NoYW5nZWRcclxuXHRcdEBvbiAnY2hhbmdlZCcsID0+IEAuYm91bmRzPy51cGRhdGUoKVxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvbHlnb24gQHZlcnRpY2VzXHJcblxyXG5cdG9uVmVydGljZXNDaGFuZ2VkOiAtPlxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEB0cmlhbmdsZXMgPSBbXVxyXG5cdFx0IyBpbml0IGxpbmVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdKSlcclxuXHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAxXSwgQHZlcnRpY2VzWzBdKSlcclxuXHJcblx0XHQjIGluaXQgdHJpYW5nbGVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMlxyXG5cdFx0XHRmb3IgaSBpbiBbMSAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QHRyaWFuZ2xlcy5wdXNoKG5ldyBCdS5UcmlhbmdsZShAdmVydGljZXNbMF0sIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXSkpXHJcblxyXG5cdCMgZGV0ZWN0XHJcblxyXG5cdGlzU2ltcGxlOiAoKSAtPlxyXG5cdFx0bGVuID0gQGxpbmVzLmxlbmd0aFxyXG5cdFx0Zm9yIGkgaW4gWzAuLi5sZW5dXHJcblx0XHRcdGZvciBqIGluIFtpICsgMS4uLmxlbl1cclxuXHRcdFx0XHRpZiBAbGluZXNbaV0uaXNDcm9zc1dpdGhMaW5lKEBsaW5lc1tqXSlcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdGFkZFBvaW50OiAocG9pbnQsIGluc2VydEluZGV4KSAtPlxyXG5cdFx0aWYgbm90IGluc2VydEluZGV4P1xyXG5cdFx0XHQjIGFkZCBwb2ludFxyXG5cdFx0XHRAdmVydGljZXMucHVzaCBwb2ludFxyXG5cclxuXHRcdFx0IyBhZGQgbGluZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEBsaW5lc1tAbGluZXMubGVuZ3RoIC0gMV0ucG9pbnRzWzFdID0gcG9pbnRcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdLCBAdmVydGljZXNbMF0pKVxyXG5cclxuXHRcdFx0IyBhZGQgdHJpYW5nbGVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDJcclxuXHRcdFx0XHRAdHJpYW5nbGVzLnB1c2gobmV3IEJ1LlRyaWFuZ2xlKFxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbMF1cclxuXHRcdFx0XHRcdFx0QHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAyXVxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0KSlcclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgcG9pbnQpXHJcblx0IyBUT0RPIGFkZCBsaW5lcyBhbmQgdHJpYW5nbGVzXHJcblxyXG5cdEBnZW5lcmF0ZVJlZ3VsYXJQb2ludHMgPSAoY3gsIGN5LCByYWRpdXMsIG4sIG9wdGlvbnMpIC0+XHJcblx0XHRhbmdsZURlbHRhID0gb3B0aW9ucy5hbmdsZVxyXG5cdFx0ciA9IHJhZGl1c1xyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGFuZ2xlU2VjdGlvbiA9IEJ1LlRXT19QSSAvIG5cclxuXHRcdGZvciBpIGluIFswIC4uLiBuXVxyXG5cdFx0XHRhID0gaSAqIGFuZ2xlU2VjdGlvbiArIGFuZ2xlRGVsdGFcclxuXHRcdFx0eCA9IGN4ICsgciAqIE1hdGguY29zKGEpXHJcblx0XHRcdHkgPSBjeSArIHIgKiBNYXRoLnNpbihhKVxyXG5cdFx0XHRwb2ludHNbaV0gPSBuZXcgQnUuUG9pbnQgeCwgeVxyXG5cdFx0cmV0dXJuIHBvaW50c1xyXG4iLCIjIHBvbHlsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2x5bGluZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdQb2x5bGluZSdcclxuXHRmaWxsYWJsZTogbm9cclxuXHJcblx0Y29uc3RydWN0b3I6IChAdmVydGljZXMgPSBbXSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxyXG5cdFx0XHR2ZXJ0aWNlcyA9IFtdXHJcblx0XHRcdGZvciBpIGluIFswIC4uLiBhcmd1bWVudHMubGVuZ3RoIC8gMl1cclxuXHRcdFx0XHR2ZXJ0aWNlcy5wdXNoIG5ldyBCdS5Qb2ludCBhcmd1bWVudHNbaSAqIDJdLCBhcmd1bWVudHNbaSAqIDIgKyAxXVxyXG5cdFx0XHRAdmVydGljZXMgPSB2ZXJ0aWNlc1xyXG5cclxuXHRcdEBsaW5lcyA9IFtdXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblxyXG5cdFx0QGZpbGwgb2ZmXHJcblxyXG5cdFx0QG9uIFwiY2hhbmdlZFwiLCA9PlxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEB1cGRhdGVMaW5lcygpXHJcblx0XHRcdFx0QGNhbGNMZW5ndGg/KClcclxuXHRcdFx0XHRAY2FsY1BvaW50Tm9ybWFsaXplZFBvcz8oKVxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHJcblx0Y2xvbmU6IC0+XHJcblx0XHRwb2x5bGluZSA9IG5ldyBCdS5Qb2x5bGluZSBAdmVydGljZXNcclxuXHRcdHBvbHlsaW5lLnN0cm9rZVN0eWxlID0gQHN0cm9rZVN0eWxlXHJcblx0XHRwb2x5bGluZS5maWxsU3R5bGUgPSBAZmlsbFN0eWxlXHJcblx0XHRwb2x5bGluZS5kYXNoU3R5bGUgPSBAZGFzaFN0eWxlXHJcblx0XHRwb2x5bGluZS5saW5lV2lkdGggPSBAbGluZVdpZHRoXHJcblx0XHRwb2x5bGluZS5kYXNoT2Zmc2V0ID0gQGRhc2hPZmZzZXRcclxuXHRcdHBvbHlsaW5lXHJcblxyXG5cdHVwZGF0ZUxpbmVzOiAtPlxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEB2ZXJ0aWNlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRpZiBAbGluZXNbaV0/XHJcblx0XHRcdFx0QGxpbmVzW2ldLnNldCBAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBsaW5lc1tpXSA9IG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXVxyXG5cdFx0IyBUT0RPIHJlbW92ZSB0aGUgcmVzdFxyXG5cdFx0QFxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0c2V0ID0gKHBvaW50cykgLT5cclxuXHRcdCMgcG9pbnRzXHJcblx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aF1cclxuXHRcdFx0QHZlcnRpY2VzW2ldLmNvcHkgcG9pbnRzW2ldXHJcblxyXG5cdFx0IyByZW1vdmUgdGhlIGV4dHJhIHBvaW50c1xyXG5cdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IHBvaW50cy5sZW5ndGhcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZSBwb2ludHMubGVuZ3RoXHJcblxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHRcdEBcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCwgaW5zZXJ0SW5kZXgpIC0+XHJcblx0XHRpZiBub3QgaW5zZXJ0SW5kZXg/XHJcblx0XHRcdCMgYWRkIHBvaW50XHJcblx0XHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblx0XHRcdCMgYWRkIGxpbmVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDFcclxuXHRcdFx0XHRAbGluZXMucHVzaCBuZXcgQnUuTGluZSBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDJdLCBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRlbHNlXHJcblx0XHRcdEB2ZXJ0aWNlcy5zcGxpY2UgaW5zZXJ0SW5kZXgsIDAsIHBvaW50XHJcblx0XHQjIFRPRE8gYWRkIGxpbmVzXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG4iLCIjIHJlY3RhbmdsZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUmVjdGFuZ2xlIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1JlY3RhbmdsZSdcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgY29ybmVyUmFkaXVzID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IHggKyB3aWR0aCAvIDIsIHkgKyBoZWlnaHQgLyAyXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplIHdpZHRoLCBoZWlnaHRcclxuXHJcblx0XHRAcG9pbnRMVCA9IG5ldyBCdS5Qb2ludCB4LCB5XHJcblx0XHRAcG9pbnRSVCA9IG5ldyBCdS5Qb2ludCB4ICsgd2lkdGgsIHlcclxuXHRcdEBwb2ludFJCID0gbmV3IEJ1LlBvaW50IHggKyB3aWR0aCwgeSArIGhlaWdodFxyXG5cdFx0QHBvaW50TEIgPSBuZXcgQnUuUG9pbnQgeCwgeSArIGhlaWdodFxyXG5cclxuXHRcdEBwb2ludHMgPSBbQHBvaW50TFQsIEBwb2ludFJULCBAcG9pbnRSQiwgQHBvaW50TEJdXHJcblxyXG5cdFx0QGNvcm5lclJhZGl1cyA9IGNvcm5lclJhZGl1c1xyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblxyXG5cdEBwcm9wZXJ0eSAnY29ybmVyUmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9jb3JuZXJSYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jb3JuZXJSYWRpdXMgPSB2YWxcclxuXHRcdFx0QGtleVBvaW50cyA9IGlmIHZhbCA+IDAgdGhlbiBbXSBlbHNlIEBwb2ludHNcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5SZWN0YW5nbGUgQHBvaW50TFQueCwgQHBvaW50TFQueSwgQHNpemUud2lkdGgsIEBzaXplLmhlaWdodFxyXG5cclxuXHRzZXQ6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG5cdFx0QGNlbnRlci5zZXQgeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDJcclxuXHRcdEBzaXplLnNldCB3aWR0aCwgaGVpZ2h0XHJcblxyXG5cdFx0QHBvaW50TFQuc2V0IHgsIHlcclxuXHRcdEBwb2ludFJULnNldCB4ICsgd2lkdGgsIHlcclxuXHRcdEBwb2ludFJCLnNldCB4ICsgd2lkdGgsIHkgKyBoZWlnaHRcclxuXHRcdEBwb2ludExCLnNldCB4LCB5ICsgaGVpZ2h0XHJcbiIsIiMgc3BsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5TcGxpbmUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnU3BsaW5lJ1xyXG5cdGZpbGxhYmxlOiBub1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHZlcnRpY2VzKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdGlmIHZlcnRpY2VzIGluc3RhbmNlb2YgQnUuUG9seWxpbmVcclxuXHRcdFx0cG9seWxpbmUgPSB2ZXJ0aWNlc1xyXG5cdFx0XHRAdmVydGljZXMgPSBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0XHRwb2x5bGluZS5vbiAncG9pbnRDaGFuZ2UnLCAocG9seWxpbmUpID0+XHJcblx0XHRcdFx0QHZlcnRpY2VzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblx0XHRlbHNlXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IEJ1LmNsb25lIHZlcnRpY2VzXHJcblxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cdFx0QGNvbnRyb2xQb2ludHNBaGVhZCA9IFtdXHJcblx0XHRAY29udHJvbFBvaW50c0JlaGluZCA9IFtdXHJcblxyXG5cdFx0QGZpbGwgb2ZmXHJcblx0XHRAc21vb3RoRmFjdG9yID0gQnUuREVGQVVMVF9TUExJTkVfU01PT1RIXHJcblx0XHRAX3Ntb290aGVyID0gbm9cclxuXHJcblx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnc21vb3RoZXInLFxyXG5cdFx0Z2V0OiAtPiBAX3Ntb290aGVyXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdG9sZFZhbCA9IEBfc21vb3RoZXJcclxuXHRcdFx0QF9zbW9vdGhlciA9IHZhbFxyXG5cdFx0XHRjYWxjQ29udHJvbFBvaW50cyBAIGlmIG9sZFZhbCAhPSBAX3Ntb290aGVyXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuU3BsaW5lIEB2ZXJ0aWNlc1xyXG5cclxuXHRhZGRQb2ludDogKHBvaW50KSAtPlxyXG5cdFx0QHZlcnRpY2VzLnB1c2ggcG9pbnRcclxuXHRcdGNhbGNDb250cm9sUG9pbnRzIEBcclxuXHJcblx0Y2FsY0NvbnRyb2xQb2ludHMgPSAoc3BsaW5lKSAtPlxyXG5cdFx0c3BsaW5lLmtleVBvaW50cyA9IHNwbGluZS52ZXJ0aWNlc1xyXG5cclxuXHRcdHAgPSBzcGxpbmUudmVydGljZXNcclxuXHRcdGxlbiA9IHAubGVuZ3RoXHJcblx0XHRpZiBsZW4gPj0gMVxyXG5cdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFswXSA9IHBbMF1cclxuXHRcdGlmIGxlbiA+PSAyXHJcblx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQWhlYWRbbGVuIC0gMV0gPSBwW2xlbiAtIDFdXHJcblx0XHRpZiBsZW4gPj0gM1xyXG5cdFx0XHRmb3IgaSBpbiBbMS4uLmxlbiAtIDFdXHJcblx0XHRcdFx0dGhldGExID0gTWF0aC5hdGFuMiBwW2ldLnkgLSBwW2kgLSAxXS55LCBwW2ldLnggLSBwW2kgLSAxXS54XHJcblx0XHRcdFx0dGhldGEyID0gTWF0aC5hdGFuMiBwW2kgKyAxXS55IC0gcFtpXS55LCBwW2kgKyAxXS54IC0gcFtpXS54XHJcblx0XHRcdFx0bGVuMSA9IEJ1LmJldmVsIHBbaV0ueSAtIHBbaSAtIDFdLnksIHBbaV0ueCAtIHBbaSAtIDFdLnhcclxuXHRcdFx0XHRsZW4yID0gQnUuYmV2ZWwgcFtpXS55IC0gcFtpICsgMV0ueSwgcFtpXS54IC0gcFtpICsgMV0ueFxyXG5cdFx0XHRcdHRoZXRhID0gdGhldGExICsgKHRoZXRhMiAtIHRoZXRhMSkgKiBpZiBzcGxpbmUuX3Ntb290aGVyIHRoZW4gbGVuMSAvIChsZW4xICsgbGVuMikgZWxzZSAwLjVcclxuXHRcdFx0XHR0aGV0YSArPSBNYXRoLlBJIGlmIE1hdGguYWJzKHRoZXRhIC0gdGhldGExKSA+IEJ1LkhBTEZfUElcclxuXHRcdFx0XHR4QSA9IHBbaV0ueCAtIGxlbjEgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5jb3ModGhldGEpXHJcblx0XHRcdFx0eUEgPSBwW2ldLnkgLSBsZW4xICogc3BsaW5lLnNtb290aEZhY3RvciAqIE1hdGguc2luKHRoZXRhKVxyXG5cdFx0XHRcdHhCID0gcFtpXS54ICsgbGVuMiAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLmNvcyh0aGV0YSlcclxuXHRcdFx0XHR5QiA9IHBbaV0ueSArIGxlbjIgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5zaW4odGhldGEpXHJcblx0XHRcdFx0c3BsaW5lLmNvbnRyb2xQb2ludHNBaGVhZFtpXSA9IG5ldyBCdS5Qb2ludCB4QSwgeUFcclxuXHRcdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFtpXSA9IG5ldyBCdS5Qb2ludCB4QiwgeUJcclxuXHJcblx0XHRcdFx0IyBhZGQgY29udHJvbCBsaW5lcyBmb3IgZGVidWdnaW5nXHJcblx0XHRcdFx0I3NwbGluZS5jaGlsZHJlbltpICogMiAtIDJdID0gbmV3IEJ1LkxpbmUgc3BsaW5lLnZlcnRpY2VzW2ldLCBzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2ldXHJcblx0XHRcdFx0I3NwbGluZS5jaGlsZHJlbltpICogMiAtIDFdID0gIG5ldyBCdS5MaW5lIHNwbGluZS52ZXJ0aWNlc1tpXSwgc3BsaW5lLmNvbnRyb2xQb2ludHNCZWhpbmRbaV1cclxuIiwiIyB0cmlhbmdsZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuVHJpYW5nbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnVHJpYW5nbGUnXHJcblx0ZmlsbGFibGU6IHllc1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHAxLCBwMiwgcDMpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA9PSA2XHJcblx0XHRcdFt4MSwgeTEsIHgyLCB5MiwgeDMsIHkzXSA9IGFyZ3VtZW50c1xyXG5cdFx0XHRwMSA9IG5ldyBCdS5Qb2ludCB4MSwgeTFcclxuXHRcdFx0cDIgPSBuZXcgQnUuUG9pbnQgeDIsIHkyXHJcblx0XHRcdHAzID0gbmV3IEJ1LlBvaW50IHgzLCB5M1xyXG5cclxuXHRcdEBsaW5lcyA9IFtcclxuXHRcdFx0bmV3IEJ1LkxpbmUocDEsIHAyKVxyXG5cdFx0XHRuZXcgQnUuTGluZShwMiwgcDMpXHJcblx0XHRcdG5ldyBCdS5MaW5lKHAzLCBwMSlcclxuXHRcdF1cclxuXHRcdCNAY2VudGVyID0gbmV3IEJ1LlBvaW50IEJ1LmF2ZXJhZ2UocDEueCwgcDIueCwgcDMueCksIEJ1LmF2ZXJhZ2UocDEueSwgcDIueSwgcDMueSlcclxuXHRcdEBwb2ludHMgPSBbcDEsIHAyLCBwM11cclxuXHRcdEBrZXlQb2ludHMgPSBAcG9pbnRzXHJcblx0XHRAb24gJ2NoYW5nZWQnLCBAdXBkYXRlXHJcblx0XHRAb24gJ2NoYW5nZWQnLCA9PiBALmJvdW5kcz8udXBkYXRlKClcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5UcmlhbmdsZSBAcG9pbnRzWzBdLCBAcG9pbnRzWzFdLCBAcG9pbnRzWzJdXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdEBsaW5lc1swXS5wb2ludHNbMF0uY29weSBAcG9pbnRzWzBdXHJcblx0XHRAbGluZXNbMF0ucG9pbnRzWzFdLmNvcHkgQHBvaW50c1sxXVxyXG5cdFx0QGxpbmVzWzFdLnBvaW50c1swXS5jb3B5IEBwb2ludHNbMV1cclxuXHRcdEBsaW5lc1sxXS5wb2ludHNbMV0uY29weSBAcG9pbnRzWzJdXHJcblx0XHRAbGluZXNbMl0ucG9pbnRzWzBdLmNvcHkgQHBvaW50c1syXVxyXG5cdFx0QGxpbmVzWzJdLnBvaW50c1sxXS5jb3B5IEBwb2ludHNbMF1cclxuIiwiIyBVc2VkIHRvIHJlbmRlciBiaXRtYXAgdG8gdGhlIHNjcmVlblxyXG5cclxuY2xhc3MgQnUuSW1hZ2UgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB1cmwsIHggPSAwLCB5ID0gMCwgd2lkdGgsIGhlaWdodCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0ltYWdlJ1xyXG5cclxuXHRcdEBhdXRvU2l6ZSA9IHllc1xyXG5cdFx0QHNpemUgPSBuZXcgQnUuU2l6ZVxyXG5cdFx0QHBvc2l0aW9uID0gbmV3IEJ1LlZlY3RvciB4LCB5XHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlZlY3RvciB4ICsgd2lkdGggLyAyLCB5ICsgaGVpZ2h0IC8gMlxyXG5cdFx0aWYgd2lkdGg/XHJcblx0XHRcdEBzaXplLnNldCB3aWR0aCwgaGVpZ2h0XHJcblx0XHRcdEBhdXRvU2l6ZSA9IG5vXHJcblxyXG5cdFx0QHBpdm90ID0gbmV3IEJ1LlZlY3RvciAwLjUsIDAuNVxyXG5cclxuXHRcdEBfaW1hZ2UgPSBuZXcgQnUuZ2xvYmFsLkltYWdlXHJcblx0XHRAcmVhZHkgPSBmYWxzZVxyXG5cclxuXHRcdEBfaW1hZ2Uub25sb2FkID0gKGUpID0+XHJcblx0XHRcdGlmIEBhdXRvU2l6ZVxyXG5cdFx0XHRcdEBzaXplLnNldCBAX2ltYWdlLndpZHRoLCBAX2ltYWdlLmhlaWdodFxyXG5cdFx0XHRAcmVhZHkgPSB0cnVlXHJcblxyXG5cdFx0QF9pbWFnZS5zcmMgPSBAdXJsIGlmIEB1cmw/XHJcblxyXG5cdEBwcm9wZXJ0eSAnaW1hZ2UnLFxyXG5cdFx0Z2V0OiAtPiBAX2ltYWdlXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfaW1hZ2UgPSB2YWxcclxuXHRcdFx0QHJlYWR5ID0geWVzXHJcbiIsIiMgUmVuZGVyIHRleHQgYXJvdW5kIGEgcG9pbnRcclxuXHJcbmNsYXNzIEJ1LlBvaW50VGV4dCBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdCMjI1xyXG5cdG9wdGlvbnMuYWxpZ246XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHwgICAtLSAgICAwLSAgICArLSAgIHxcclxuXHR8ICAgICAgICAgfOKGmTAwICAgICAgfFxyXG5cdHwgICAtMCAgLS0rLT4gICArMCAgIHxcclxuXHR8ICAgICAgICAg4oaTICAgICAgICAgIHxcclxuXHR8ICAgLSsgICAgMCsgICAgKysgICB8XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdGZvciBleGFtcGxlOiB0ZXh0IGlzIGluIHRoZSByaWdodCB0b3Agb2YgdGhlIHBvaW50LCB0aGVuIGFsaWduID0gXCIrLVwiXHJcblx0IyMjXHJcblx0Y29uc3RydWN0b3I6IChAdGV4dCwgQHggPSAwLCBAeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2ludFRleHQnXHJcblx0XHRAc3Ryb2tlU3R5bGUgPSBudWxsICMgbm8gc3Ryb2tlIGJ5IGRlZmF1bHRcclxuXHRcdEBmaWxsU3R5bGUgPSAnYmxhY2snXHJcblxyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0YWxpZ246ICcwMCdcclxuXHRcdEBhbGlnbiA9IG9wdGlvbnMuYWxpZ25cclxuXHRcdGlmIG9wdGlvbnMuZm9udD9cclxuXHRcdFx0QGZvbnQgPSBvcHRpb25zLmZvbnRcclxuXHRcdGVsc2UgaWYgb3B0aW9ucy5mb250RmFtaWx5PyBvciBvcHRpb25zLmZvbnRTaXplP1xyXG5cdFx0XHRAX2ZvbnRGYW1pbHkgPSBvcHRpb25zLmZvbnRGYW1pbHkgb3IgQnUuREVGQVVMVF9GT05UX0ZBTUlMWVxyXG5cdFx0XHRAX2ZvbnRTaXplID0gb3B0aW9ucy5mb250U2l6ZSBvciBCdS5ERUZBVUxUX0ZPTlRfU0laRVxyXG5cdFx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAZm9udCA9IG51bGxcclxuXHJcblx0QHByb3BlcnR5ICdhbGlnbicsXHJcblx0XHRnZXQ6IC0+IEBfYWxpZ25cclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9hbGlnbiA9IHZhbFxyXG5cdFx0XHRAc2V0QWxpZ24gQF9hbGlnblxyXG5cclxuXHRAcHJvcGVydHkgJ2ZvbnRGYW1pbHknLFxyXG5cdFx0Z2V0OiAtPiBAX2ZvbnRGYW1pbHlcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9mb250RmFtaWx5ID0gdmFsXHJcblx0XHRcdEBmb250ID0gXCIjeyBAX2ZvbnRTaXplIH1weCAjeyBAX2ZvbnRGYW1pbHkgfVwiXHJcblxyXG5cdEBwcm9wZXJ0eSAnZm9udFNpemUnLFxyXG5cdFx0Z2V0OiAtPiBAX2ZvbnRTaXplXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfZm9udFNpemUgPSB2YWxcclxuXHRcdFx0QGZvbnQgPSBcIiN7IEBfZm9udFNpemUgfXB4ICN7IEBfZm9udEZhbWlseSB9XCJcclxuXHJcblx0c2V0QWxpZ246IChhbGlnbikgLT5cclxuXHRcdGlmIGFsaWduLmxlbmd0aCA9PSAxXHJcblx0XHRcdGFsaWduID0gJycgKyBhbGlnbiArIGFsaWduXHJcblx0XHRhbGlnblggPSBhbGlnbi5zdWJzdHJpbmcoMCwgMSlcclxuXHRcdGFsaWduWSA9IGFsaWduLnN1YnN0cmluZygxLCAyKVxyXG5cdFx0QHRleHRBbGlnbiA9IHN3aXRjaCBhbGlnblhcclxuXHRcdFx0d2hlbiAnLScgdGhlbiAncmlnaHQnXHJcblx0XHRcdHdoZW4gJzAnIHRoZW4gJ2NlbnRlcidcclxuXHRcdFx0d2hlbiAnKycgdGhlbiAnbGVmdCdcclxuXHRcdEB0ZXh0QmFzZWxpbmUgPSBzd2l0Y2ggYWxpZ25ZXHJcblx0XHRcdHdoZW4gJy0nIHRoZW4gJ2JvdHRvbSdcclxuXHRcdFx0d2hlbiAnMCcgdGhlbiAnbWlkZGxlJ1xyXG5cdFx0XHR3aGVuICcrJyB0aGVuICd0b3AnXHJcblx0XHRAXHJcbiIsIiMgYW5pbWF0aW9uIGNsYXNzIGFuZCBwcmVzZXQgYW5pbWF0aW9uc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cclxuXHRcdEBmcm9tID0gb3B0aW9ucy5mcm9tXHJcblx0XHRAdG8gPSBvcHRpb25zLnRvXHJcblx0XHRAZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIG9yIDAuNVxyXG5cdFx0QGVhc2luZyA9IG9wdGlvbnMuZWFzaW5nIG9yIGZhbHNlXHJcblx0XHRAcmVwZWF0ID0gISFvcHRpb25zLnJlcGVhdFxyXG5cdFx0QGluaXQgPSBvcHRpb25zLmluaXRcclxuXHRcdEB1cGRhdGUgPSBvcHRpb25zLnVwZGF0ZVxyXG5cdFx0QGZpbmlzaCA9IG9wdGlvbnMuZmluaXNoXHJcblxyXG5cdGFwcGx5VG86ICh0YXJnZXQsIGFyZ3MpIC0+XHJcblx0XHRhcmdzID0gW2FyZ3NdIHVubGVzcyBCdS5pc0FycmF5IGFyZ3NcclxuXHRcdHRhc2sgPSBuZXcgQnUuQW5pbWF0aW9uVGFzayBALCB0YXJnZXQsIGFyZ3NcclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lci5hZGQgdGFza1xyXG5cdFx0dGFza1xyXG5cclxuXHRpc0xlZ2FsOiAtPlxyXG5cdFx0cmV0dXJuIHRydWUgdW5sZXNzIEBmcm9tPyBhbmQgQHRvP1xyXG5cclxuXHRcdGlmIEJ1LmlzUGxhaW5PYmplY3QgQGZyb21cclxuXHRcdFx0Zm9yIG93biBrZXkgb2YgQGZyb21cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0b1trZXldP1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0bz9cclxuXHRcdHRydWVcclxuXHJcbiMgUHJlc2V0IEFuaW1hdGlvbnNcclxuIyBTb21lIG9mIHRoZSBhbmltYXRpb25zIGFyZSBjb25zaXN0ZW50IHdpdGggalF1ZXJ5IFVJXHJcbkJ1LmFuaW1hdGlvbnMgPVxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgU2ltcGxlXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0ZmFkZUluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IGFuaW0udFxyXG5cclxuXHRmYWRlT3V0OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IDEgLSBhbmltLnRcclxuXHJcblx0c3BpbjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDJcclxuXHJcblx0c3BpbkluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLmRlc1NjYWxlID0gYW5pbS5hcmcgb3IgMVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLnRcclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDRcclxuXHRcdFx0QHNjYWxlID0gYW5pbS50ICogYW5pbS5kYXRhLmRlc1NjYWxlXHJcblxyXG5cdHNwaW5PdXQ6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gMSAtIGFuaW0udFxyXG5cdFx0XHRAcm90YXRpb24gPSBhbmltLnQgKiBNYXRoLlBJICogNFxyXG5cdFx0XHRAc2NhbGUgPSAxIC0gYW5pbS50XHJcblxyXG5cdGJsaW5rOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRkdXJhdGlvbjogMC4yXHJcblx0XHRmcm9tOiAwXHJcblx0XHR0bzogNTEyXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRkID0gTWF0aC5mbG9vciBNYXRoLmFicyhhbmltLmN1cnJlbnQgLSAyNTYpXHJcblx0XHRcdEBmaWxsU3R5bGUgPSBcInJnYigjeyBkIH0sICN7IGQgfSwgI3sgZCB9KVwiXHJcblxyXG5cdHNoYWtlOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLm94ID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0YW5pbS5kYXRhLnJhbmdlID0gYW5pbS5hcmcgb3IgMjBcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gTWF0aC5zaW4oYW5pbS50ICogTWF0aC5QSSAqIDgpICogYW5pbS5kYXRhLnJhbmdlICsgYW5pbS5kYXRhLm94XHJcblxyXG5cdGp1bXA6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmRhdGEub3kgPSBAcG9zaXRpb24ueVxyXG5cdFx0XHRhbmltLmRhdGEuaGVpZ2h0ID0gYW5pbS5hcmcgb3IgMTAwXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueSA9IC0gYW5pbS5kYXRhLmhlaWdodCAqIE1hdGguc2luKGFuaW0udCAqIE1hdGguUEkpICsgYW5pbS5kYXRhLm95XHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBUb2dnbGVkOiBkZXRlY3QgYW5kIHNhdmUgb3JpZ2luYWwgc3RhdHVzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0cHVmZjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0ZHVyYXRpb246IDAuMTVcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPVxyXG5cdFx0XHRcdG9wYWNpdHk6IEBvcGFjaXR5XHJcblx0XHRcdFx0c2NhbGU6IEBzY2FsZS54XHJcblx0XHRcdGFuaW0udG8gPVxyXG5cdFx0XHRcdGlmIEBvcGFjaXR5ID09IDFcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAqIDEuNVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDFcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAvIDEuNVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLmN1cnJlbnQub3BhY2l0eVxyXG5cdFx0XHRAc2NhbGUgPSBhbmltLmN1cnJlbnQuc2NhbGVcclxuXHJcblx0Y2xpcDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIEBzY2FsZS55ICE9IDBcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSAwXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSBAc2NhbGUueFxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFg6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueFxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnggPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFk6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFdpdGggQXJndW1lbnRzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW92ZVRvOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0aWYgYW5pbS5hcmc/XHJcblx0XHRcdFx0YW5pbS5mcm9tID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0XHRhbmltLnRvID0gcGFyc2VGbG9hdCBhbmltLmFyZ1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnQnUuYW5pbWF0aW9ucy5tb3ZlVG8gbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdG1vdmVCeTogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIGFuaW0uYXJncz9cclxuXHRcdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24ueFxyXG5cdFx0XHRcdGFuaW0udG8gPSBAcG9zaXRpb24ueCArIHBhcnNlRmxvYXQoYW5pbS5hcmdzKVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnQnUuYW5pbWF0aW9ucy5tb3ZlQnkgbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdGRpc2NvbG9yOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0ZGVzQ29sb3IgPSBhbmltLmFyZ1xyXG5cdFx0XHRkZXNDb2xvciA9IG5ldyBCdS5Db2xvciBkZXNDb2xvciBpZiBCdS5pc1N0cmluZyBkZXNDb2xvclxyXG5cdFx0XHRhbmltLmZyb20gPSBuZXcgQnUuQ29sb3IgQGZpbGxTdHlsZVxyXG5cdFx0XHRhbmltLnRvID0gZGVzQ29sb3JcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBmaWxsU3R5bGUgPSBhbmltLmN1cnJlbnQudG9SR0JBKClcclxuIiwiIyBSdW4gdGhlIGFuaW1hdGlvbiB0YXNrc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uUnVubmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QHJ1bm5pbmdBbmltYXRpb25zID0gW11cclxuXHJcblx0YWRkOiAodGFzaykgLT5cclxuXHRcdHRhc2suaW5pdCgpXHJcblx0XHRpZiB0YXNrLmFuaW1hdGlvbi5pc0xlZ2FsKClcclxuXHRcdFx0dGFzay5zdGFydFRpbWUgPSBCdS5ub3coKVxyXG5cdFx0XHRAcnVubmluZ0FuaW1hdGlvbnMucHVzaCB0YXNrXHJcblx0XHRlbHNlXHJcblx0XHRcdGNvbnNvbGUuZXJyb3IgJ0J1LkFuaW1hdGlvblJ1bm5lcjogYW5pbWF0aW9uIHNldHRpbmcgaXMgaWxsZWdhbDogJywgdGFzay5hbmltYXRpb25cclxuXHJcblx0dXBkYXRlOiAtPlxyXG5cdFx0bm93ID0gQnUubm93KClcclxuXHRcdGZvciB0YXNrIGluIEBydW5uaW5nQW5pbWF0aW9uc1xyXG5cdFx0XHRjb250aW51ZSBpZiB0YXNrLmZpbmlzaGVkXHJcblxyXG5cdFx0XHRhbmltID0gdGFzay5hbmltYXRpb25cclxuXHRcdFx0dCA9IChub3cgLSB0YXNrLnN0YXJ0VGltZSkgLyAoYW5pbS5kdXJhdGlvbiAqIDEwMDApXHJcblx0XHRcdGlmIHQgPiAxXHJcblx0XHRcdFx0ZmluaXNoID0gdHJ1ZVxyXG5cdFx0XHRcdGlmIGFuaW0ucmVwZWF0XHJcblx0XHRcdFx0XHR0ID0gMFxyXG5cdFx0XHRcdFx0dGFzay5zdGFydFRpbWUgPSBCdS5ub3coKVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdCMgVE9ETyByZW1vdmUgdGhlIGZpbmlzaGVkIHRhc2tzIG91dFxyXG5cdFx0XHRcdFx0dCA9IDFcclxuXHRcdFx0XHRcdHRhc2suZmluaXNoZWQgPSB5ZXNcclxuXHJcblx0XHRcdGlmIGFuaW0uZWFzaW5nID09IHRydWVcclxuXHRcdFx0XHR0ID0gZWFzaW5nRnVuY3Rpb25zW0RFRkFVTFRfRUFTSU5HX0ZVTkNUSU9OXSB0XHJcblx0XHRcdGVsc2UgaWYgZWFzaW5nRnVuY3Rpb25zW2FuaW0uZWFzaW5nXT9cclxuXHRcdFx0XHR0ID0gZWFzaW5nRnVuY3Rpb25zW2FuaW0uZWFzaW5nXSB0XHJcblxyXG5cdFx0XHR0YXNrLnQgPSB0XHJcblx0XHRcdHRhc2suaW50ZXJwb2xhdGUoKVxyXG5cclxuXHRcdFx0YW5pbS51cGRhdGUuY2FsbCB0YXNrLnRhcmdldCwgdGFza1xyXG5cdFx0XHRpZiBmaW5pc2ggdGhlbiBhbmltLmZpbmlzaD8uY2FsbCB0YXNrLnRhcmdldCwgdGFza1xyXG5cclxuXHQjIEhvb2sgdXAgb24gYW4gcmVuZGVyZXIsIHJlbW92ZSBvd24gc2V0SW50ZXJuYWxcclxuXHRob29rVXA6IChyZW5kZXJlcikgLT5cclxuXHRcdHJlbmRlcmVyLm9uICd1cGRhdGUnLCA9PiBAdXBkYXRlKClcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFByaXZhdGUgdmFyaWFibGVzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0REVGQVVMVF9FQVNJTkdfRlVOQ1RJT04gPSAncXVhZCdcclxuXHRlYXNpbmdGdW5jdGlvbnMgPVxyXG5cdFx0cXVhZEluOiAodCkgLT4gdCAqIHRcclxuXHRcdHF1YWRPdXQ6ICh0KSAtPiB0ICogKDIgLSB0KVxyXG5cdFx0cXVhZDogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQyICogdCAqIHRcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdC0yICogdCAqIHQgKyA0ICogdCAtIDFcclxuXHJcblx0XHRjdWJpY0luOiAodCkgLT4gdCAqKiAzXHJcblx0XHRjdWJpY091dDogKHQpIC0+ICh0IC0gMSkgKiogMyArIDFcclxuXHRcdGN1YmljOiAodCkgLT5cclxuXHRcdFx0aWYgdCA8IDAuNVxyXG5cdFx0XHRcdDQgKiB0ICoqIDNcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdDQgKiAodCAtIDEpICoqIDMgKyAxXHJcblxyXG5cdFx0c2luZUluOiAodCkgLT4gTWF0aC5zaW4oKHQgLSAxKSAqIEJ1LkhBTEZfUEkpICsgMVxyXG5cdFx0c2luZU91dDogKHQpIC0+IE1hdGguc2luIHQgKiBCdS5IQUxGX1BJXHJcblx0XHRzaW5lOiAodCkgLT5cclxuXHRcdFx0aWYgdCA8IDAuNVxyXG5cdFx0XHRcdChNYXRoLnNpbigodCAqIDIgLSAxKSAqIEJ1LkhBTEZfUEkpICsgMSkgLyAyXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRNYXRoLnNpbigodCAtIDAuNSkgKiBNYXRoLlBJKSAvIDIgKyAwLjVcclxuXHJcblx0XHQjIFRPRE8gYWRkIHF1YXJ0LCBxdWludCwgZXhwbywgY2lyYywgYmFjaywgZWxhc3RpYywgYm91bmNlXHJcblxyXG4jIERlZmluZSB0aGUgZ2xvYmFsIHVuaXF1ZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzXHJcbkJ1LmFuaW1hdGlvblJ1bm5lciA9IG5ldyBCdS5BbmltYXRpb25SdW5uZXJcclxuIiwiIyBBbmltYXRpb25UYXNrIGlzIGFuIGluc3RhbmNlIG9mIEFuaW1hdGlvbiwgcnVuIGJ5IEFuaW1hdGlvblJ1bm5lclxuXG5jbGFzcyBCdS5BbmltYXRpb25UYXNrXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBhbmltYXRpb24sIEB0YXJnZXQsIEBhcmdzID0gW10pIC0+XG4gICAgICAgIEBzdGFydFRpbWUgPSAwXG4gICAgICAgIEBmaW5pc2hlZCA9IG5vXG4gICAgICAgIEBmcm9tID0gQnUuY2xvbmUgQGFuaW1hdGlvbi5mcm9tXG4gICAgICAgIEBjdXJyZW50ID0gQnUuY2xvbmUgQGFuaW1hdGlvbi5mcm9tXG4gICAgICAgIEB0byA9IEJ1LmNsb25lIEBhbmltYXRpb24udG9cbiAgICAgICAgQGRhdGEgPSB7fVxuICAgICAgICBAdCA9IDBcbiAgICAgICAgQGFyZyA9IEBhcmdzWzBdXG5cbiAgICBpbml0OiAtPlxuICAgICAgICBAYW5pbWF0aW9uLmluaXQ/LmNhbGwgQHRhcmdldCwgQFxuICAgICAgICBAY3VycmVudCA9IEJ1LmNsb25lIEBmcm9tXG5cbiAgICByZXN0YXJ0OiAtPlxuICAgICAgICBAc3RhcnRUaW1lID0gQnUubm93KClcbiAgICAgICAgQGZpbmlzaGVkID0gbm9cblxuICAgIGludGVycG9sYXRlOiAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBmcm9tP1xuXG4gICAgICAgIGlmIEJ1LmlzTnVtYmVyIEBmcm9tXG4gICAgICAgICAgICBAY3VycmVudCA9IGludGVycG9sYXRlTnVtIEBmcm9tLCBAdG8sIEB0XG4gICAgICAgIGVsc2UgaWYgQGZyb20gaW5zdGFuY2VvZiBCdS5Db2xvclxuICAgICAgICAgICAgaW50ZXJwb2xhdGVDb2xvciBAZnJvbSwgQHRvLCBAdCwgQGN1cnJlbnRcbiAgICAgICAgZWxzZSBpZiBAZnJvbSBpbnN0YW5jZW9mIEJ1LlZlY3RvclxuICAgICAgICAgICAgaW50ZXJwb2xhdGVWZWN0b3IgQGZyb20sIEB0bywgQHQsIEBjdXJyZW50XG4gICAgICAgIGVsc2UgaWYgQnUuaXNQbGFpbk9iamVjdCBAZnJvbVxuICAgICAgICAgICAgZm9yIG93biBrZXkgb2YgQGZyb21cbiAgICAgICAgICAgICAgICBpZiBCdS5pc051bWJlciBAZnJvbVtrZXldXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50W2tleV0gPSBpbnRlcnBvbGF0ZU51bSBAZnJvbVtrZXldLCBAdG9ba2V5XSwgQHRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRlT2JqZWN0IEBmcm9tW2tleV0sIEB0b1trZXldLCBAdCwgQGN1cnJlbnRba2V5XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yIFwiQnUuQW5pbWF0aW9uIG5vdCBzdXBwb3J0IGludGVycG9sYXRlIHR5cGU6IFwiLCBAZnJvbVxuXG4gICAgaW50ZXJwb2xhdGVOdW0gPSAoYSwgYiwgdCkgLT4gYiAqIHQgLSBhICogKHQgLSAxKVxuXG4gICAgaW50ZXJwb2xhdGVDb2xvciA9IChhLCBiLCB0LCBjKSAtPlxuICAgICAgICBjLnNldFJHQkEgaW50ZXJwb2xhdGVOdW0oYS5yLCBiLnIsIHQpLCBpbnRlcnBvbGF0ZU51bShhLmcsIGIuZywgdCksIGludGVycG9sYXRlTnVtKGEuYiwgYi5iLCB0KSwgaW50ZXJwb2xhdGVOdW0oYS5hLCBiLmEsIHQpXG5cbiAgICBpbnRlcnBvbGF0ZVZlY3RvciA9IChhLCBiLCB0LCBjKSAtPlxuICAgICAgICBjLnggPSBpbnRlcnBvbGF0ZU51bSBhLngsIGIueCwgdFxuICAgICAgICBjLnkgPSBpbnRlcnBvbGF0ZU51bSBhLnksIGIueSwgdFxuIiwiIyBNYW5hZ2UgYW4gT2JqZWN0MkQgbGlzdCBhbmQgdXBkYXRlIGl0cyBkYXNoT2Zmc2V0XHJcblxyXG5jbGFzcyBCdS5EYXNoRmxvd01hbmFnZXJcclxuXHJcblx0Y29uc3RydWN0b3I6IC0+XHJcblx0XHRAZmxvd2luZ09iamVjdHMgPSBbXVxyXG5cclxuXHRzZXRTcGVlZDogKHRhcmdldCwgc3BlZWQpIC0+XHJcblx0XHR0YXJnZXQuZGFzaEZsb3dTcGVlZCA9IHNwZWVkXHJcblx0XHRpID0gQGZsb3dpbmdPYmplY3RzLmluZGV4T2YgdGFyZ2V0XHJcblx0XHRpZiBzcGVlZCAhPSAwXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5wdXNoIHRhcmdldCBpZiBpID09IC0xXHJcblx0XHRlbHNlXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5zcGxpY2UoaSwgMSkgaWYgaSA+IC0xXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdGZvciBvIGluIEBmbG93aW5nT2JqZWN0c1xyXG5cdFx0XHRvLmRhc2hPZmZzZXQgKz0gby5kYXNoRmxvd1NwZWVkXHJcblxyXG5cdCMgSG9vayB1cCBvbiBhbiByZW5kZXJlciwgcmVtb3ZlIG93biBzZXRJbnRlcm5hbFxyXG5cdGhvb2tVcDogKHJlbmRlcmVyKSAtPlxyXG5cdFx0cmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEB1cGRhdGUoKVxyXG5cclxuIyBHbG9iYWwgdW5pcXVlIGluc3RhbmNlXHJcbkJ1LmRhc2hGbG93TWFuYWdlciA9IG5ldyBCdS5EYXNoRmxvd01hbmFnZXJcclxuIiwiIyBTcHJpdGUgU2hlZXRcclxuXHJcbmNsYXNzIEJ1LlNwcml0ZVNoZWV0XHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHJcblx0XHRAcmVhZHkgPSBubyAgIyBJZiB0aGlzIHNwcml0ZSBzaGVldCBpcyBsb2FkZWQgYW5kIHBhcnNlZC5cclxuXHRcdEBoZWlnaHQgPSAwICAjIEhlaWdodCBvZiB0aGlzIHNwcml0ZVxyXG5cclxuXHRcdEBkYXRhID0gbnVsbCAgIyBUaGUgSlNPTiBkYXRhXHJcblx0XHRAaW1hZ2VzID0gW10gICMgVGhlIGBJbWFnZWAgbGlzdCBsb2FkZWRcclxuXHRcdEBmcmFtZUltYWdlcyA9IFtdICAjIFBhcnNlZCBmcmFtZSBpbWFnZXNcclxuXHJcblx0XHQjIGxvYWQgYW5kIHRyaWdnZXIgcGFyc2VEYXRhKClcclxuXHRcdCQuYWpheCBAdXJsLCBzdWNjZXNzOiAodGV4dCkgPT5cclxuXHRcdFx0QGRhdGEgPSBKU09OLnBhcnNlIHRleHRcclxuXHJcblx0XHRcdGlmIG5vdCBAZGF0YS5pbWFnZXM/XHJcblx0XHRcdFx0QGRhdGEuaW1hZ2VzID0gW0B1cmwuc3Vic3RyaW5nKEB1cmwubGFzdEluZGV4T2YoJy8nKSwgQHVybC5sZW5ndGggLSA1KSArICcucG5nJ11cclxuXHJcblx0XHRcdGJhc2VVcmwgPSBAdXJsLnN1YnN0cmluZyAwLCBAdXJsLmxhc3RJbmRleE9mKCcvJykgKyAxXHJcblx0XHRcdGZvciBvd24gaSBvZiBAZGF0YS5pbWFnZXNcclxuXHRcdFx0XHRAZGF0YS5pbWFnZXNbaV0gPSBiYXNlVXJsICsgQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdFx0XHRcdGNvdW50TG9hZGVkID0gMFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0gPSBuZXcgSW1hZ2VcclxuXHRcdFx0XHRAaW1hZ2VzW2ldLm9ubG9hZCA9ICgpID0+XHJcblx0XHRcdFx0XHRjb3VudExvYWRlZCArPSAxXHJcblx0XHRcdFx0XHRAcGFyc2VEYXRhKCkgaWYgY291bnRMb2FkZWQgPT0gQGRhdGEuaW1hZ2VzLmxlbmd0aFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0uc3JjID0gQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdHBhcnNlRGF0YTogLT5cclxuXHRcdCMgQ2xpcCB0aGUgaW1hZ2UgZm9yIGV2ZXJ5IGZyYW1lc1xyXG5cdFx0ZnJhbWVzID0gQGRhdGEuZnJhbWVzXHJcblx0XHRmb3Igb3duIGkgb2YgZnJhbWVzXHJcblx0XHRcdGZvciBqIGluIFswLi40XVxyXG5cdFx0XHRcdGlmIG5vdCBmcmFtZXNbaV1bal0/XHJcblx0XHRcdFx0XHRmcmFtZXNbaV1bal0gPSBpZiBmcmFtZXNbaSAtIDFdP1tqXT8gdGhlbiBmcmFtZXNbaSAtIDFdW2pdIGVsc2UgMFxyXG5cdFx0XHR4ID0gZnJhbWVzW2ldWzBdXHJcblx0XHRcdHkgPSBmcmFtZXNbaV1bMV1cclxuXHRcdFx0dyA9IGZyYW1lc1tpXVsyXVxyXG5cdFx0XHRoID0gZnJhbWVzW2ldWzNdXHJcblx0XHRcdGZyYW1lSW5kZXggPSBmcmFtZXNbaV1bNF1cclxuXHRcdFx0QGZyYW1lSW1hZ2VzW2ldID0gY2xpcEltYWdlIEBpbWFnZXNbZnJhbWVJbmRleF0sIHgsIHksIHcsIGhcclxuXHRcdFx0QGhlaWdodCA9IGggaWYgQGhlaWdodCA9PSAwXHJcblxyXG5cdFx0QHJlYWR5ID0geWVzXHJcblx0XHRAdHJpZ2dlciAnbG9hZGVkJ1xyXG5cclxuXHRnZXRGcmFtZUltYWdlOiAoa2V5LCBpbmRleCA9IDApIC0+XHJcblx0XHRyZXR1cm4gbnVsbCB1bmxlc3MgQHJlYWR5XHJcblx0XHRhbmltYXRpb24gPSBAZGF0YS5hbmltYXRpb25zW2tleV1cclxuXHRcdHJldHVybiBudWxsIHVubGVzcyBhbmltYXRpb24/XHJcblxyXG5cdFx0cmV0dXJuIEBmcmFtZUltYWdlc1thbmltYXRpb24uZnJhbWVzW2luZGV4XV1cclxuXHJcblx0bWVhc3VyZVRleHRXaWR0aDogKHRleHQpIC0+XHJcblx0XHR3aWR0aCA9IDBcclxuXHRcdGZvciBjaGFyIGluIHRleHRcclxuXHRcdFx0d2lkdGggKz0gQGdldEZyYW1lSW1hZ2UoY2hhcikud2lkdGhcclxuXHRcdHdpZHRoXHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBQcml2YXRlIG1lbWJlcnNcclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcclxuXHJcblx0Y2xpcEltYWdlID0gKGltYWdlLCB4LCB5LCB3LCBoKSAtPlxyXG5cdFx0Y2FudmFzLndpZHRoID0gd1xyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGhcclxuXHRcdGNvbnRleHQuZHJhd0ltYWdlIGltYWdlLCB4LCB5LCB3LCBoLCAwLCAwLCB3LCBoXHJcblxyXG5cdFx0bmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG5cdFx0bmV3SW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpXHJcblx0XHRyZXR1cm4gbmV3SW1hZ2VcclxuIiwiIyBNYW5hZ2UgdGhlIHVzZXIgaW5wdXQsIGxpa2UgbW91c2UsIGtleWJvYXJkLCB0b3VjaHNjcmVlbiBldGNcclxuXHJcbmNsYXNzIEJ1LklucHV0TWFuYWdlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IHllc1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IG5vXHJcblxyXG5cdCMgVG8gZGV0ZWN0IHdoZXRoZXIgYSBrZXkgaXMgcHJlc3NlZCBkb3duXHJcblx0aXNLZXlEb3duOiAoa2V5KSAtPlxyXG5cdFx0a2V5Q29kZSA9IEBrZXlUb0tleUNvZGUga2V5XHJcblx0XHRAa2V5U3RhdGVzW2tleUNvZGVdXHJcblxyXG5cdCMgQ29udmVydCBmcm9tIGtleUlkZW50aWZpZXJzL2tleVZhbHVlcyB0byBrZXlDb2RlXHJcblx0a2V5VG9LZXlDb2RlOiAoa2V5KSAtPlxyXG5cdFx0a2V5ID0gQGtleUFsaWFzVG9LZXlNYXBba2V5XSBvciBrZXlcclxuXHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlTWFwW2tleV1cclxuXHJcblx0IyBSZWNpZXZlIGFuZCBiaW5kIHRoZSBtb3VzZS9rZXlib2FyZCBldmVudHMgbGlzdGVuZXJzXHJcblx0aGFuZGxlQXBwRXZlbnRzOiAoYXBwLCBldmVudHMpIC0+XHJcblx0XHRrZXlkb3duTGlzdGVuZXJzID0ge31cclxuXHRcdGtleXVwTGlzdGVuZXJzID0ge31cclxuXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSA9PlxyXG5cdFx0XHRrZXlkb3duTGlzdGVuZXJzW2Uua2V5Q29kZV0/LmNhbGwgYXBwLCBlXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5dXAnLCAoZSkgPT5cclxuXHRcdFx0a2V5dXBMaXN0ZW5lcnNbZS5rZXlDb2RlXT8uY2FsbCBhcHAsIGVcclxuXHJcblx0XHRmb3IgdHlwZSBvZiBldmVudHNcclxuXHRcdFx0aWYgdHlwZSBpbiBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdtb3VzZXdoZWVsJywgJ2tleWRvd24nLCAna2V5dXAnXVxyXG5cdFx0XHRcdGFwcC4kcmVuZGVyZXIuZG9tLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgZXZlbnRzW3R5cGVdLmJpbmQoYXBwKVxyXG5cdFx0XHRlbHNlIGlmIHR5cGUuaW5kZXhPZigna2V5ZG93bi4nKSA9PSAwXHJcblx0XHRcdFx0a2V5ID0gdHlwZS5zdWJzdHJpbmcgOFxyXG5cdFx0XHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlIGtleVxyXG5cdFx0XHRcdGtleWRvd25MaXN0ZW5lcnNba2V5Q29kZV0gPSBldmVudHNbdHlwZV1cclxuXHRcdFx0ZWxzZSBpZiB0eXBlLmluZGV4T2YoJ2tleXVwLicpID09IDBcclxuXHRcdFx0XHRrZXkgPSB0eXBlLnN1YnN0cmluZyA2XHJcblx0XHRcdFx0a2V5Q29kZSA9IEBrZXlUb0tleUNvZGUga2V5XHJcblx0XHRcdFx0a2V5dXBMaXN0ZW5lcnNba2V5Q29kZV0gPSBldmVudHNbdHlwZV1cclxuXHJcblx0IyBNYXAgZnJvbSBrZXlJZGVudGlmaWVycy9rZXlWYWx1ZXMgdG8ga2V5Q29kZVxyXG5cdGtleVRvS2V5Q29kZU1hcDpcclxuXHRcdEJhY2tzcGFjZTogICAgOFxyXG5cdFx0VGFiOiAgICAgICAgICA5XHJcblx0XHRFbnRlcjogICAgICAgMTNcclxuXHRcdFNoaWZ0OiAgICAgICAxNlxyXG5cdFx0Q29udHJvbDogICAgIDE3XHJcblx0XHRBbHQ6ICAgICAgICAgMThcclxuXHRcdENhcHNMb2NrOiAgICAyMFxyXG5cdFx0RXNjYXBlOiAgICAgIDI3XHJcblx0XHQnICc6ICAgICAgICAgMzIgICMgU3BhY2VcclxuXHRcdFBhZ2VVcDogICAgICAzM1xyXG5cdFx0UGFnZURvd246ICAgIDM0XHJcblx0XHRFbmQ6ICAgICAgICAgMzVcclxuXHRcdEhvbWU6ICAgICAgICAzNlxyXG5cdFx0QXJyb3dMZWZ0OiAgIDM3XHJcblx0XHRBcnJvd1VwOiAgICAgMzhcclxuXHRcdEFycm93UmlnaHQ6ICAzOVxyXG5cdFx0QXJyb3dEb3duOiAgIDQwXHJcblx0XHREZWxldGU6ICAgICAgNDZcclxuXHJcblx0XHQxOiA0OVxyXG5cdFx0MjogNTBcclxuXHRcdDM6IDUxXHJcblx0XHQ0OiA1MlxyXG5cdFx0NTogNTNcclxuXHRcdDY6IDU0XHJcblx0XHQ3OiA1NVxyXG5cdFx0ODogNTZcclxuXHRcdDk6IDU3XHJcblx0XHRBOiA2NVxyXG5cdFx0QjogNjZcclxuXHRcdEM6IDY3XHJcblx0XHREOiA2OFxyXG5cdFx0RTogNjlcclxuXHRcdEY6IDcwXHJcblx0XHRHOiA3MVxyXG5cdFx0SDogNzJcclxuXHRcdEk6IDczXHJcblx0XHRKOiA3NFxyXG5cdFx0SzogNzVcclxuXHRcdEw6IDc2XHJcblx0XHRNOiA3N1xyXG5cdFx0TjogNzhcclxuXHRcdE86IDc5XHJcblx0XHRQOiA4MFxyXG5cdFx0UTogODFcclxuXHRcdFI6IDgyXHJcblx0XHRTOiA4M1xyXG5cdFx0VDogODRcclxuXHRcdFU6IDg1XHJcblx0XHRWOiA4NlxyXG5cdFx0VzogODdcclxuXHRcdFg6IDg4XHJcblx0XHRZOiA4OVxyXG5cdFx0WjogOTBcclxuXHJcblx0XHRGMTogIDExMlxyXG5cdFx0RjI6ICAxMTNcclxuXHRcdEYzOiAgMTE0XHJcblx0XHRGNDogIDExNVxyXG5cdFx0RjU6ICAxMTZcclxuXHRcdEY2OiAgMTE3XHJcblx0XHRGNzogIDExOFxyXG5cdFx0Rjg6ICAxMTlcclxuXHRcdEY5OiAgMTIwXHJcblx0XHRGMTA6IDEyMVxyXG5cdFx0RjExOiAxMjJcclxuXHRcdEYxMjogMTIzXHJcblxyXG5cdFx0J2AnOiAxOTJcclxuXHRcdCc9JzogMTg3XHJcblx0XHQnLCc6IDE4OFxyXG5cdFx0Jy0nOiAxODlcclxuXHRcdCcuJzogMTkwXHJcblx0XHQnLyc6IDE5MVxyXG5cdFx0JzsnOiAxODZcclxuXHRcdFwiJ1wiOiAyMjJcclxuXHRcdCdbJzogMjE5XHJcblx0XHQnXSc6IDIyMVxyXG5cdFx0J1xcXFwnOiAyMjBcclxuXHJcblx0IyBNYXAgZnJvbSBub3Qgc3RhbmRhcmQsIGJ1dCBjb21tb25seSBrbm93biBrZXlWYWx1ZXMva2V5SWRlbnRpZmllcnMgdG8ga2V5Q29kZVxyXG5cdGtleUFsaWFzVG9LZXlNYXA6XHJcblx0XHRDdHJsOiAgICAgICAgJ0NvbnRyb2wnICAgICAjIDE3XHJcblx0XHRDdGw6ICAgICAgICAgJ0NvbnRyb2wnICAgICAjIDE3XHJcblx0XHRFc2M6ICAgICAgICAgJ0VzY2FwZScgICAgICAjIDI3XHJcblx0XHRTcGFjZTogICAgICAgJyAnICAgICAgICAgICAjIDMyXHJcblx0XHRQZ1VwOiAgICAgICAgJ1BhZ2VVcCcgICAgICAjIDMzXHJcblx0XHQnUGFnZSBVcCc6ICAgJ1BhZ2VVcCcgICAgICAjIDMzXHJcblx0XHRQZ0RuOiAgICAgICAgJ1BhZ2VEb3duJyAgICAjIDM0XHJcblx0XHQnUGFnZSBEb3duJzogJ1BhZ2VEb3duJyAgICAjIDM0XHJcblx0XHRMZWZ0OiAgICAgICAgJ0Fycm93TGVmdCcgICAjIDM3XHJcblx0XHRVcDogICAgICAgICAgJ0Fycm93VXAnICAgICAjIDM4XHJcblx0XHRSaWdodDogICAgICAgJ0Fycm93UmlnaHQnICAjIDM5XHJcblx0XHREb3duOiAgICAgICAgJ0Fycm93RG93bicgICAjIDQwXHJcblx0XHREZWw6ICAgICAgICAgJ0RlbGV0ZScgICAgICAjIDQ2XHJcbiIsIiMgUGFuIGFuZCB6b29tIHRoZSBjYW1lcmEgYnkgdGhlIG1vdXNlXHJcbiMgRHJhZyBsZWZ0IG1vdXNlIGJ1dHRvbiB0byBwYW4sIHdoZWVsIHVwL2Rvd24gdG8gem9vbSBpbi9vdXRcclxuXHJcbmNsYXNzIEJ1Lk1vdXNlQ29udHJvbFxyXG5cclxuXHRzY2FsZUFuaW1hdGlvbiA9IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjJcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmFyZyA9IDEgdW5sZXNzIGFuaW0uYXJnP1xyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUuY2xvbmUoKVxyXG5cdFx0XHRhbmltLnRvID0gQHNjYWxlLmNsb25lKCkubXVsdGlwbHlTY2FsYXIgcGFyc2VGbG9hdCBhbmltLmFyZ1xyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlID0gYW5pbS5jdXJyZW50XHJcblxyXG5cdHRyYW5zbGF0ZUFuaW1hdGlvbiA9IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjJcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmFyZyA9IG5ldyBCdS5WZWN0b3IgdW5sZXNzIGFuaW0uYXJnP1xyXG5cdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24uY2xvbmUoKVxyXG5cdFx0XHRhbmltLnRvID0gQHBvc2l0aW9uLmNsb25lKCkuYWRkIGFuaW0uYXJnXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24uY29weSBhbmltLmN1cnJlbnRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY2FtZXJhLCBkb20pIC0+XHJcblx0XHRAem9vbVNjYWxlQW5pbSA9IHNjYWxlQW5pbWF0aW9uLmFwcGx5VG8gQGNhbWVyYVxyXG5cdFx0QHpvb21UcmFuc0FuaW0gPSB0cmFuc2xhdGVBbmltYXRpb24uYXBwbHlUbyBAY2FtZXJhXHJcblxyXG5cdFx0QHNtb290aFpvb21pbmcgPSB5ZXNcclxuXHRcdEBkZXNTY2FsZSA9IG5ldyBCdS5WZWN0b3IgMSwgMVxyXG5cclxuXHRcdGRvbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcclxuXHRcdGRvbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJywgQG9uTW91c2VXaGVlbFxyXG5cclxuXHRvbk1vdXNlTW92ZTogKGUpID0+XHJcblx0XHRpZiBlLmJ1dHRvbnMgPT0gQnUuTU9VU0UuTEVGVFxyXG5cdFx0XHRzY2FsZSA9IEBjYW1lcmEuc2NhbGUueFxyXG5cdFx0XHRkeCA9IC1lLm1vdmVtZW50WCAqIHNjYWxlXHJcblx0XHRcdGR5ID0gLWUubW92ZW1lbnRZICogc2NhbGVcclxuXHJcblx0XHRcdEBjYW1lcmEudHJhbnNsYXRlIGR4LCBkeVxyXG5cclxuXHRvbk1vdXNlV2hlZWw6IChlKSA9PlxyXG5cdFx0ZGVsdGFTY2FsZVN0ZXAgPSBNYXRoLnBvdygxLjI1LCAtZS53aGVlbERlbHRhIC8gMTIwKVxyXG5cdFx0QGRlc1NjYWxlLm11bHRpcGx5U2NhbGFyIGRlbHRhU2NhbGVTdGVwXHJcblx0XHRkZWx0YVNjYWxlQWxsID0gQGRlc1NjYWxlLnggLyBAY2FtZXJhLnNjYWxlLnhcclxuXHJcblx0XHRteCA9IGUub2Zmc2V0WCAtICQoZS50YXJnZXQpLndpZHRoKCkgLyAyXHJcblx0XHRteSA9IGUub2Zmc2V0WSAtICQoZS50YXJnZXQpLmhlaWdodCgpIC8gMlxyXG5cdFx0ZHggPSAtbXggKiAoZGVsdGFTY2FsZUFsbCAtIDEpICogQGNhbWVyYS5zY2FsZS54XHJcblx0XHRkeSA9IC1teSAqIChkZWx0YVNjYWxlQWxsIC0gMSkgKiBAY2FtZXJhLnNjYWxlLnlcclxuXHJcblx0XHRpZiBAc21vb3RoWm9vbWluZ1xyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS5mcm9tLmNvcHkgQGNhbWVyYS5zY2FsZVxyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS50by5jb3B5IEBkZXNTY2FsZVxyXG5cdFx0XHRAem9vbVNjYWxlQW5pbS5yZXN0YXJ0KClcclxuXHJcblx0XHRcdEB6b29tVHJhbnNBbmltLmZyb20uY29weSBAY2FtZXJhLnBvc2l0aW9uXHJcblx0XHRcdEB6b29tVHJhbnNBbmltLnRvLnNldCBAY2FtZXJhLnBvc2l0aW9uLnggKyBkeCwgQGNhbWVyYS5wb3NpdGlvbi55ICsgZHlcclxuXHRcdFx0QHpvb21UcmFuc0FuaW0ucmVzdGFydCgpXHJcblx0XHRlbHNlXHJcblx0XHRcdEBjYW1lcmEudHJhbnNsYXRlIGR4LCBkeVxyXG5cdFx0XHRAY2FtZXJhLnNjYWxlLmNvcHkgdGhpcy5kZXNTY2FsZVxyXG4iLCIjIEdlb21ldHJ5IEFsZ29yaXRobSBDb2xsZWN0aW9uXHJcblxyXG5CdS5nZW9tZXRyeUFsZ29yaXRobSA9IEcgPVxyXG5cclxuXHRpbmplY3Q6IC0+XHJcblx0XHRAaW5qZWN0SW50byBbXHJcblx0XHRcdCdwb2ludCdcclxuXHRcdFx0J2xpbmUnXHJcblx0XHRcdCdjaXJjbGUnXHJcblx0XHRcdCdlbGxpcHNlJ1xyXG5cdFx0XHQndHJpYW5nbGUnXHJcblx0XHRcdCdyZWN0YW5nbGUnXHJcblx0XHRcdCdmYW4nXHJcblx0XHRcdCdib3cnXHJcblx0XHRcdCdwb2x5Z29uJ1xyXG5cdFx0XHQncG9seWxpbmUnXHJcblx0XHRdXHJcblxyXG5cdGluamVjdEludG86IChzaGFwZXMpIC0+XHJcblx0XHRzaGFwZXMgPSBbc2hhcGVzXSBpZiBCdS5pc1N0cmluZyBzaGFwZXNcclxuXHJcblx0XHRpZiAncG9pbnQnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Qb2ludDo6aW5DaXJjbGUgPSAoY2lyY2xlKSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkNpcmNsZSBALCBjaXJjbGVcclxuXHRcdFx0QnUuUG9pbnQ6OmRpc3RhbmNlVG8gPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5kaXN0YW5jZUZyb21Qb2ludFRvUG9pbnQgQCwgcG9pbnRcclxuXHRcdFx0QnUuUG9pbnQ6OmlzTmVhciA9ICh0YXJnZXQsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRcdFx0c3dpdGNoIHRhcmdldC50eXBlXHJcblx0XHRcdFx0XHR3aGVuICdQb2ludCdcclxuXHRcdFx0XHRcdFx0Ry5wb2ludE5lYXJQb2ludCBALCB0YXJnZXQsIGxpbWl0XHJcblx0XHRcdFx0XHR3aGVuICdMaW5lJ1xyXG5cdFx0XHRcdFx0XHRHLnBvaW50TmVhckxpbmUgQCwgdGFyZ2V0LCBsaW1pdFxyXG5cdFx0XHRcdFx0d2hlbiAnUG9seWxpbmUnXHJcblx0XHRcdFx0XHRcdEcucG9pbnROZWFyUG9seWxpbmUgQCwgdGFyZ2V0LCBsaW1pdFxyXG5cdFx0XHRCdS5Qb2ludC5pbnRlcnBvbGF0ZSA9IEcuaW50ZXJwb2xhdGVCZXR3ZWVuVHdvUG9pbnRzXHJcblxyXG5cdFx0aWYgJ2xpbmUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5MaW5lOjpkaXN0YW5jZVRvID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUgcG9pbnQsIEBcclxuXHRcdFx0QnUuTGluZTo6aXNUd29Qb2ludHNTYW1lU2lkZSA9IChwMSwgcDIpIC0+XHJcblx0XHRcdFx0Ry50d29Qb2ludHNTYW1lU2lkZU9mTGluZSBwMSwgcDIsIEBcclxuXHRcdFx0QnUuTGluZTo6Zm9vdFBvaW50RnJvbSA9IChwb2ludCwgc2F2ZVRvKSAtPlxyXG5cdFx0XHRcdEcuZm9vdFBvaW50RnJvbVBvaW50VG9MaW5lIHBvaW50LCBALCBzYXZlVG9cclxuXHRcdFx0QnUuTGluZTo6Z2V0Q3Jvc3NQb2ludFdpdGggPSAobGluZSkgLT5cclxuXHRcdFx0XHRHLmdldENyb3NzUG9pbnRPZlR3b0xpbmVzIGxpbmUsIEBcclxuXHRcdFx0QnUuTGluZTo6aXNDcm9zc1dpdGhMaW5lID0gKGxpbmUpIC0+XHJcblx0XHRcdFx0Ry5pc1R3b0xpbmVzQ3Jvc3MgbGluZSwgQFxyXG5cclxuXHRcdGlmICdjaXJjbGUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5DaXJjbGU6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkNpcmNsZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdlbGxpcHNlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuRWxsaXBzZTo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluRWxsaXBzZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICd0cmlhbmdsZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlRyaWFuZ2xlOjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5UcmlhbmdsZSBwb2ludCwgQFxyXG5cdFx0XHRCdS5UcmlhbmdsZTo6YXJlYSA9IC0+XHJcblx0XHRcdFx0Ry5jYWxjVHJpYW5nbGVBcmVhIEBcclxuXHJcblx0XHRpZiAncmVjdGFuZ2xlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUmVjdGFuZ2xlOjpjb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJblJlY3RhbmdsZSBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdmYW4nIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5GYW46Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkZhbiBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdib3cnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Cb3c6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkJvdyBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdwb2x5Z29uJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUG9seWdvbjo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluUG9seWdvbiBwb2ludCwgQFxyXG5cclxuXHRcdGlmICdwb2x5bGluZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpsZW5ndGggPSAwXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpwb2ludE5vcm1hbGl6ZWRQb3MgPSBbXVxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Y2FsY0xlbmd0aCA9ICgpIC0+XHJcblx0XHRcdFx0QGxlbmd0aCA9IEcuY2FsY1BvbHlsaW5lTGVuZ3RoIEBcclxuXHRcdFx0QnUuUG9seWxpbmU6OmNhbGNQb2ludE5vcm1hbGl6ZWRQb3MgPSAtPlxyXG5cdFx0XHRcdEcuY2FsY05vcm1hbGl6ZWRWZXJ0aWNlc1Bvc09mUG9seWxpbmUgQFxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Z2V0Tm9ybWFsaXplZFBvcyA9IChpbmRleCkgLT5cclxuXHRcdFx0XHRpZiBpbmRleD8gdGhlbiBAcG9pbnROb3JtYWxpemVkUG9zW2luZGV4XSBlbHNlIEBwb2ludE5vcm1hbGl6ZWRQb3NcclxuXHRcdFx0QnUuUG9seWxpbmU6OmNvbXByZXNzID0gKHN0cmVuZ3RoID0gMC44KSAtPlxyXG5cdFx0XHRcdEcuY29tcHJlc3NQb2x5bGluZSBALCBzdHJlbmd0aFxyXG5cclxuXHQjIFBvaW50IGluIHNoYXBlc1xyXG5cclxuXHRwb2ludE5lYXJQb2ludDogKHBvaW50LCB0YXJnZXQsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRwb2ludC5kaXN0YW5jZVRvKHRhcmdldCkgPCBsaW1pdFxyXG5cclxuXHRwb2ludE5lYXJMaW5lOiAocG9pbnQsIGxpbmUsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHR2ZXJ0aWNhbERpc3QgPSBsaW5lLmRpc3RhbmNlVG8gcG9pbnRcclxuXHRcdGZvb3RQb2ludCA9IGxpbmUuZm9vdFBvaW50RnJvbSBwb2ludFxyXG5cclxuXHRcdGlzQmV0d2VlbjEgPSBmb290UG9pbnQuZGlzdGFuY2VUbyhsaW5lLnBvaW50c1swXSkgPCBsaW5lLmxlbmd0aCArIGxpbWl0XHJcblx0XHRpc0JldHdlZW4yID0gZm9vdFBvaW50LmRpc3RhbmNlVG8obGluZS5wb2ludHNbMV0pIDwgbGluZS5sZW5ndGggKyBsaW1pdFxyXG5cclxuXHRcdHJldHVybiB2ZXJ0aWNhbERpc3QgPCBsaW1pdCBhbmQgaXNCZXR3ZWVuMSBhbmQgaXNCZXR3ZWVuMlxyXG5cclxuXHRwb2ludE5lYXJQb2x5bGluZTogKHBvaW50LCBwb2x5bGluZSwgbGltaXQgPSBCdS5ERUZBVUxUX05FQVJfRElTVCkgLT5cclxuXHRcdGZvciBsaW5lIGluIHBvbHlsaW5lLmxpbmVzXHJcblx0XHRcdHJldHVybiB5ZXMgaWYgRy5wb2ludE5lYXJMaW5lIHBvaW50LCBsaW5lLCBsaW1pdFxyXG5cdFx0bm9cclxuXHJcblx0cG9pbnRJbkNpcmNsZTogKHBvaW50LCBjaXJjbGUpIC0+XHJcblx0XHRkeCA9IHBvaW50LnggLSBjaXJjbGUuY3hcclxuXHRcdGR5ID0gcG9pbnQueSAtIGNpcmNsZS5jeVxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGR4LCBkeSkgPCBjaXJjbGUucmFkaXVzXHJcblxyXG5cdHBvaW50SW5FbGxpcHNlOiAocG9pbnQsIGVsbGlwc2UpIC0+XHJcblx0XHRyZXR1cm4gQnUuYmV2ZWwocG9pbnQueCAvIGVsbGlwc2UucmFkaXVzWCwgcG9pbnQueSAvIGVsbGlwc2UucmFkaXVzWSkgPCAxXHJcblxyXG5cdHBvaW50SW5SZWN0YW5nbGU6IChwb2ludCwgcmVjdGFuZ2xlKSAtPlxyXG5cdFx0cG9pbnQueCA+IHJlY3RhbmdsZS5wb2ludExULnggYW5kXHJcblx0XHRcdFx0cG9pbnQueSA+IHJlY3RhbmdsZS5wb2ludExULnkgYW5kXHJcblx0XHRcdFx0cG9pbnQueCA8IHJlY3RhbmdsZS5wb2ludExULnggKyByZWN0YW5nbGUuc2l6ZS53aWR0aCBhbmRcclxuXHRcdFx0XHRwb2ludC55IDwgcmVjdGFuZ2xlLnBvaW50TFQueSArIHJlY3RhbmdsZS5zaXplLmhlaWdodFxyXG5cclxuXHRwb2ludEluVHJpYW5nbGU6IChwb2ludCwgdHJpYW5nbGUpIC0+XHJcblx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMl0sIHRyaWFuZ2xlLmxpbmVzWzBdKSBhbmRcclxuXHRcdFx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMF0sIHRyaWFuZ2xlLmxpbmVzWzFdKSBhbmRcclxuXHRcdFx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lKHBvaW50LCB0cmlhbmdsZS5wb2ludHNbMV0sIHRyaWFuZ2xlLmxpbmVzWzJdKVxyXG5cclxuXHRwb2ludEluRmFuOiAocG9pbnQsIGZhbikgLT5cclxuXHRcdGR4ID0gcG9pbnQueCAtIGZhbi5jeFxyXG5cdFx0ZHkgPSBwb2ludC55IC0gZmFuLmN5XHJcblx0XHRhID0gTWF0aC5hdGFuMihwb2ludC55IC0gZmFuLmN5LCBwb2ludC54IC0gZmFuLmN4KVxyXG5cdFx0YSArPSBCdS5UV09fUEkgd2hpbGUgYSA8IGZhbi5hRnJvbVxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGR4LCBkeSkgPCBmYW4ucmFkaXVzICYmIGEgPiBmYW4uYUZyb20gJiYgYSA8IGZhbi5hVG9cclxuXHJcblx0cG9pbnRJbkJvdzogKHBvaW50LCBib3cpIC0+XHJcblx0XHRpZiBCdS5iZXZlbChib3cuY3ggLSBwb2ludC54LCBib3cuY3kgLSBwb2ludC55KSA8IGJvdy5yYWRpdXNcclxuXHRcdFx0c2FtZVNpZGUgPSBib3cuc3RyaW5nLmlzVHdvUG9pbnRzU2FtZVNpZGUoYm93LmNlbnRlciwgcG9pbnQpXHJcblx0XHRcdHNtYWxsVGhhbkhhbGZDaXJjbGUgPSBib3cuYVRvIC0gYm93LmFGcm9tIDwgTWF0aC5QSVxyXG5cdFx0XHRyZXR1cm4gc2FtZVNpZGUgXiBzbWFsbFRoYW5IYWxmQ2lyY2xlXHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cclxuXHRwb2ludEluUG9seWdvbjogKHBvaW50LCBwb2x5Z29uKSAtPlxyXG5cdFx0Zm9yIHRyaWFuZ2xlIGluIHBvbHlnb24udHJpYW5nbGVzXHJcblx0XHRcdGlmIHRyaWFuZ2xlLmNvbnRhaW5zUG9pbnQgcG9pbnRcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0ZmFsc2VcclxuXHJcblx0IyBEaXN0YW5jZVxyXG5cclxuXHRkaXN0YW5jZUZyb21Qb2ludFRvUG9pbnQ6IChwb2ludDEsIHBvaW50MikgLT5cclxuXHRcdEJ1LmJldmVsIHBvaW50MS54IC0gcG9pbnQyLngsIHBvaW50MS55IC0gcG9pbnQyLnlcclxuXHJcblx0ZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmU6IChwb2ludCwgbGluZSkgLT5cclxuXHRcdHAxID0gbGluZS5wb2ludHNbMF1cclxuXHRcdHAyID0gbGluZS5wb2ludHNbMV1cclxuXHRcdGEgPSAocDEueSAtIHAyLnkpIC8gKHAxLnggLSBwMi54KVxyXG5cdFx0YiA9IHAxLnkgLSBhICogcDEueFxyXG5cdFx0cmV0dXJuIE1hdGguYWJzKGEgKiBwb2ludC54ICsgYiAtIHBvaW50LnkpIC8gTWF0aC5zcXJ0KGEgKiBhICsgMSlcclxuXHJcblx0IyBQb2ludCBSZWxhdGVkXHJcblxyXG5cdGludGVycG9sYXRlQmV0d2VlblR3b1BvaW50czogKHAxLCBwMiwgaywgcDMpIC0+XHJcblx0XHR4ID0gcDEueCArIChwMi54IC0gcDEueCkgKiBrXHJcblx0XHR5ID0gcDEueSArIChwMi55IC0gcDEueSkgKiBrXHJcblxyXG5cdFx0aWYgcDM/XHJcblx0XHRcdHAzLnNldCB4LCB5XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBuZXcgQnUuUG9pbnQgeCwgeVxyXG5cclxuXHQjIFBvaW50IGFuZCBMaW5lXHJcblxyXG5cdHR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lOiAocDEsIHAyLCBsaW5lKSAtPlxyXG5cdFx0cEEgPSBsaW5lLnBvaW50c1swXVxyXG5cdFx0cEIgPSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0aWYgcEEueCA9PSBwQi54XHJcblx0XHRcdCMgaWYgYm90aCBvZiB0aGUgdHdvIHBvaW50cyBhcmUgb24gdGhlIGxpbmUgdGhlbiB3ZSBjb25zaWRlciB0aGV5IGFyZSBpbiB0aGUgc2FtZSBzaWRlXHJcblx0XHRcdHJldHVybiAocDEueCAtIHBBLngpICogKHAyLnggLSBwQS54KSA+IDBcclxuXHRcdGVsc2VcclxuXHRcdFx0eTAxID0gKHBBLnkgLSBwQi55KSAqIChwMS54IC0gcEEueCkgLyAocEEueCAtIHBCLngpICsgcEEueVxyXG5cdFx0XHR5MDIgPSAocEEueSAtIHBCLnkpICogKHAyLnggLSBwQS54KSAvIChwQS54IC0gcEIueCkgKyBwQS55XHJcblx0XHRcdHJldHVybiAocDEueSAtIHkwMSkgKiAocDIueSAtIHkwMikgPiAwXHJcblxyXG5cdGZvb3RQb2ludEZyb21Qb2ludFRvTGluZTogKHBvaW50LCBsaW5lLCBzYXZlVG8gPSBuZXcgQnUuUG9pbnQpIC0+XHJcblx0XHRwMSA9IGxpbmUucG9pbnRzWzBdXHJcblx0XHRwMiA9IGxpbmUucG9pbnRzWzFdXHJcblx0XHRBID0gKHAxLnkgLSBwMi55KSAvIChwMS54IC0gcDIueClcclxuXHRcdEIgPSBwMS55IC0gQSAqIHAxLnhcclxuXHRcdG0gPSBwb2ludC54ICsgQSAqIHBvaW50LnlcclxuXHRcdHggPSAobSAtIEEgKiBCKSAvIChBICogQSArIDEpXHJcblx0XHR5ID0gQSAqIHggKyBCXHJcblxyXG5cdFx0c2F2ZVRvLnNldCB4LCB5XHJcblx0XHRyZXR1cm4gc2F2ZVRvXHJcblxyXG5cdGdldENyb3NzUG9pbnRPZlR3b0xpbmVzOiAobGluZTEsIGxpbmUyKSAtPlxyXG5cdFx0W3AxLCBwMl0gPSBsaW5lMS5wb2ludHNcclxuXHRcdFtxMSwgcTJdID0gbGluZTIucG9pbnRzXHJcblxyXG5cdFx0YTEgPSBwMi55IC0gcDEueVxyXG5cdFx0YjEgPSBwMS54IC0gcDIueFxyXG5cdFx0YzEgPSAoYTEgKiBwMS54KSArIChiMSAqIHAxLnkpXHJcblx0XHRhMiA9IHEyLnkgLSBxMS55XHJcblx0XHRiMiA9IHExLnggLSBxMi54XHJcblx0XHRjMiA9IChhMiAqIHExLngpICsgKGIyICogcTEueSlcclxuXHRcdGRldCA9IChhMSAqIGIyKSAtIChhMiAqIGIxKVxyXG5cclxuXHRcdHJldHVybiBuZXcgQnUuUG9pbnQgKChiMiAqIGMxKSAtIChiMSAqIGMyKSkgLyBkZXQsICgoYTEgKiBjMikgLSAoYTIgKiBjMSkpIC8gZGV0XHJcblxyXG5cdGlzVHdvTGluZXNDcm9zczogKGxpbmUxLCBsaW5lMikgLT5cclxuXHRcdHgxID0gbGluZTEucG9pbnRzWzBdLnhcclxuXHRcdHkxID0gbGluZTEucG9pbnRzWzBdLnlcclxuXHRcdHgyID0gbGluZTEucG9pbnRzWzFdLnhcclxuXHRcdHkyID0gbGluZTEucG9pbnRzWzFdLnlcclxuXHRcdHgzID0gbGluZTIucG9pbnRzWzBdLnhcclxuXHRcdHkzID0gbGluZTIucG9pbnRzWzBdLnlcclxuXHRcdHg0ID0gbGluZTIucG9pbnRzWzFdLnhcclxuXHRcdHk0ID0gbGluZTIucG9pbnRzWzFdLnlcclxuXHJcblx0XHRkID0gKHkyIC0geTEpICogKHg0IC0geDMpIC0gKHk0IC0geTMpICogKHgyIC0geDEpXHJcblxyXG5cdFx0aWYgZCA9PSAwXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR4MCA9ICgoeDIgLSB4MSkgKiAoeDQgLSB4MykgKiAoeTMgLSB5MSkgKyAoeTIgLSB5MSkgKiAoeDQgLSB4MykgKiB4MSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKSAqIHgzKSAvIGRcclxuXHRcdFx0eTAgPSAoKHkyIC0geTEpICogKHk0IC0geTMpICogKHgzIC0geDEpICsgKHgyIC0geDEpICogKHk0IC0geTMpICogeTEgLSAoeDQgLSB4MykgKiAoeTIgLSB5MSkgKiB5MykgLyAtZFxyXG5cdFx0cmV0dXJuICh4MCAtIHgxKSAqICh4MCAtIHgyKSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh4MCAtIHgzKSAqICh4MCAtIHg0KSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh5MCAtIHkxKSAqICh5MCAtIHkyKSA8IDAgYW5kXHJcblx0XHRcdFx0XHRcdCh5MCAtIHkzKSAqICh5MCAtIHk0KSA8IDBcclxuXHJcblx0IyBQb2x5bGluZVxyXG5cclxuXHRjYWxjUG9seWxpbmVMZW5ndGg6IChwb2x5bGluZSkgLT5cclxuXHRcdGxlbiA9IDBcclxuXHRcdGlmIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aCA+PSAyXHJcblx0XHRcdGZvciBpIGluIFsxIC4uLiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdFx0bGVuICs9IHBvbHlsaW5lLnZlcnRpY2VzW2ldLmRpc3RhbmNlVG8gcG9seWxpbmUudmVydGljZXNbaSAtIDFdXHJcblx0XHRyZXR1cm4gbGVuXHJcblxyXG5cdGNhbGNOb3JtYWxpemVkVmVydGljZXNQb3NPZlBvbHlsaW5lOiAocG9seWxpbmUpIC0+XHJcblx0XHRjdXJyUG9zID0gMFxyXG5cdFx0cG9seWxpbmUucG9pbnROb3JtYWxpemVkUG9zWzBdID0gMFxyXG5cdFx0Zm9yIGkgaW4gWzEgLi4uIHBvbHlsaW5lLnZlcnRpY2VzLmxlbmd0aF1cclxuXHRcdFx0Y3VyclBvcyArPSBwb2x5bGluZS52ZXJ0aWNlc1tpXS5kaXN0YW5jZVRvKHBvbHlsaW5lLnZlcnRpY2VzW2kgLSAxXSkgLyBwb2x5bGluZS5sZW5ndGhcclxuXHRcdFx0cG9seWxpbmUucG9pbnROb3JtYWxpemVkUG9zW2ldID0gY3VyclBvc1xyXG5cclxuXHRjb21wcmVzc1BvbHlsaW5lOiAocG9seWxpbmUsIHN0cmVuZ3RoKSAtPlxyXG5cdFx0Y29tcHJlc3NlZCA9IFtdXHJcblx0XHRmb3Igb3duIGkgb2YgcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0aWYgaSA8IDJcclxuXHRcdFx0XHRjb21wcmVzc2VkW2ldID0gcG9seWxpbmUudmVydGljZXNbaV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFtwQSwgcE1dID0gY29tcHJlc3NlZFstMi4uLTFdXHJcblx0XHRcdFx0cEIgPSBwb2x5bGluZS52ZXJ0aWNlc1tpXVxyXG5cdFx0XHRcdG9ibGlxdWVBbmdsZSA9IE1hdGguYWJzKE1hdGguYXRhbjIocEEueSAtIHBNLnksIHBBLnggLSBwTS54KSAtIE1hdGguYXRhbjIocE0ueSAtIHBCLnksIHBNLnggLSBwQi54KSlcclxuXHRcdFx0XHRpZiBvYmxpcXVlQW5nbGUgPCBzdHJlbmd0aCAqIHN0cmVuZ3RoICogQnUuSEFMRl9QSVxyXG5cdFx0XHRcdFx0Y29tcHJlc3NlZFtjb21wcmVzc2VkLmxlbmd0aCAtIDFdID0gcEJcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRjb21wcmVzc2VkLnB1c2ggcEJcclxuXHRcdHBvbHlsaW5lLnZlcnRpY2VzID0gY29tcHJlc3NlZFxyXG5cdFx0cG9seWxpbmUua2V5UG9pbnRzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdHJldHVybiBwb2x5bGluZVxyXG5cclxuXHQjIEFyZWEgQ2FsY3VsYXRpb25cclxuXHJcblx0Y2FsY1RyaWFuZ2xlQXJlYTogKHRyaWFuZ2xlKSAtPlxyXG5cdFx0W2EsIGIsIGNdID0gdHJpYW5nbGUucG9pbnRzXHJcblx0XHRyZXR1cm4gTWF0aC5hYnMoKChiLnggLSBhLngpICogKGMueSAtIGEueSkpIC0gKChjLnggLSBhLngpICogKGIueSAtIGEueSkpKSAvIDJcclxuXHJcbkcuaW5qZWN0KClcclxuIiwiIyBVc2VkIHRvIGdlbmVyYXRlIHJhbmRvbSBzaGFwZXNcclxuXHJcbmNsYXNzIEJ1LlNoYXBlUmFuZG9taXplclxyXG5cclxuXHRNQVJHSU4gPSAzMFxyXG5cclxuXHRyYW5nZVdpZHRoOiA4MDBcclxuXHRyYW5nZUhlaWdodDogNDUwXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAtPlxyXG5cclxuXHRyYW5kb21YOiAtPlxyXG5cdFx0QnUucmFuZCBNQVJHSU4sIEByYW5nZVdpZHRoIC0gTUFSR0lOICogMlxyXG5cclxuXHRyYW5kb21ZOiAtPlxyXG5cdFx0QnUucmFuZCBNQVJHSU4sIEByYW5nZUhlaWdodCAtIE1BUkdJTiAqIDJcclxuXHJcblx0cmFuZG9tUmFkaXVzOiAtPlxyXG5cdFx0QnUucmFuZCA1LCBNYXRoLm1pbihAcmFuZ2VXaWR0aCwgQHJhbmdlSGVpZ2h0KSAvIDJcclxuXHJcblx0c2V0UmFuZ2U6ICh3LCBoKSAtPlxyXG5cdFx0QHJhbmdlV2lkdGggPSB3XHJcblx0XHRAcmFuZ2VIZWlnaHQgPSBoXHJcblxyXG5cdGdlbmVyYXRlOiAodHlwZSkgLT5cclxuXHRcdHN3aXRjaCB0eXBlXHJcblx0XHRcdHdoZW4gJ2NpcmNsZScgdGhlbiBAZ2VuZXJhdGVDaXJjbGUoKVxyXG5cdFx0XHR3aGVuICdib3cnIHRoZW4gQGdlbmVyYXRlQm93KClcclxuXHRcdFx0d2hlbiAndHJpYW5nbGUnIHRoZW4gQGdlbmVyYXRlVHJpYW5nbGUoKVxyXG5cdFx0XHR3aGVuICdyZWN0YW5nbGUnIHRoZW4gQGdlbmVyYXRlUmVjdGFuZ2xlKClcclxuXHRcdFx0d2hlbiAnZmFuJyB0aGVuIEBnZW5lcmF0ZUZhbigpXHJcblx0XHRcdHdoZW4gJ3BvbHlnb24nIHRoZW4gQGdlbmVyYXRlUG9seWdvbigpXHJcblx0XHRcdHdoZW4gJ2xpbmUnIHRoZW4gQGdlbmVyYXRlTGluZSgpXHJcblx0XHRcdHdoZW4gJ3BvbHlsaW5lJyB0aGVuIEBnZW5lcmF0ZVBvbHlsaW5lKClcclxuXHRcdFx0ZWxzZSBjb25zb2xlLndhcm4gJ25vdCBzdXBwb3J0IHNoYXBlOiAnICsgdHlwZVxyXG5cdFx0QHJhbmdlSGVpZ2h0ID0gaFxyXG5cclxuXHRyYW5kb21pemU6IChzaGFwZSkgLT5cclxuXHRcdGlmIEJ1LmlzQXJyYXkgc2hhcGVcclxuXHRcdFx0QHJhbmRvbWl6ZSBzIGZvciBzIGluIHNoYXBlXHJcblx0XHRlbHNlXHJcblx0XHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEByYW5kb21pemVDaXJjbGUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdFbGxpcHNlJyB0aGVuIEByYW5kb21pemVFbGxpcHNlIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnQm93JyB0aGVuIEByYW5kb21pemVCb3cgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdUcmlhbmdsZScgdGhlbiBAcmFuZG9taXplVHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdSZWN0YW5nbGUnIHRoZW4gQHJhbmRvbWl6ZVJlY3RhbmdsZSBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAcmFuZG9taXplRmFuIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAcmFuZG9taXplUG9seWdvbiBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ0xpbmUnIHRoZW4gQHJhbmRvbWl6ZUxpbmUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdQb2x5bGluZScgdGhlbiBAcmFuZG9taXplUG9seWxpbmUgc2hhcGVcclxuXHRcdFx0XHRlbHNlIGNvbnNvbGUud2FybiAnbm90IHN1cHBvcnQgc2hhcGU6ICcgKyBzaGFwZS50eXBlXHJcblxyXG5cdHJhbmRvbWl6ZVBvc2l0aW9uOiAoc2hhcGUpIC0+XHJcblx0XHRzaGFwZS5wb3NpdGlvbi54ID0gQHJhbmRvbVgoKVxyXG5cdFx0c2hhcGUucG9zaXRpb24ueSA9IEByYW5kb21ZKClcclxuXHRcdHNoYXBlLnRyaWdnZXIgJ2NoYW5nZWQnXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlQ2lyY2xlOiAtPlxyXG5cdFx0Y2lyY2xlID0gbmV3IEJ1LkNpcmNsZSBAcmFuZG9tUmFkaXVzKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGNpcmNsZS5jZW50ZXIubGFiZWwgPSAnTydcclxuXHRcdGNpcmNsZVxyXG5cclxuXHRyYW5kb21pemVDaXJjbGU6IChjaXJjbGUpIC0+XHJcblx0XHRjaXJjbGUuY3ggPSBAcmFuZG9tWCgpXHJcblx0XHRjaXJjbGUuY3kgPSBAcmFuZG9tWSgpXHJcblx0XHRjaXJjbGUucmFkaXVzID0gQHJhbmRvbVJhZGl1cygpXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlRWxsaXBzZTogLT5cclxuXHRcdGVsbGlwc2UgPSBuZXcgQnUuRWxsaXBzZSBAcmFuZG9tUmFkaXVzKCksIEByYW5kb21SYWRpdXMoKVxyXG5cdFx0QHJhbmRvbWl6ZVBvc2l0aW9uIGVsbGlwc2VcclxuXHRcdGVsbGlwc2VcclxuXHJcblx0cmFuZG9taXplRWxsaXBzZTogKGVsbGlwc2UpIC0+XHJcblx0XHRlbGxpcHNlLnJhZGl1c1ggPSBAcmFuZG9tUmFkaXVzKClcclxuXHRcdGVsbGlwc2UucmFkaXVzWSA9IEByYW5kb21SYWRpdXMoKVxyXG5cdFx0QHJhbmRvbWl6ZVBvc2l0aW9uIGVsbGlwc2VcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVCb3c6IC0+XHJcblx0XHRhRnJvbSA9IEJ1LnJhbmQgQnUuVFdPX1BJXHJcblx0XHRhVG8gPSBhRnJvbSArIEJ1LnJhbmQgQnUuSEFMRl9QSSwgQnUuVFdPX1BJXHJcblxyXG5cdFx0Ym93ID0gbmV3IEJ1LkJvdyBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tUmFkaXVzKCksIGFGcm9tLCBhVG9cclxuXHRcdGJvdy5zdHJpbmcucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRib3cuc3RyaW5nLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0Ym93XHJcblxyXG5cdHJhbmRvbWl6ZUJvdzogKGJvdykgLT5cclxuXHRcdGFGcm9tID0gQnUucmFuZCBCdS5UV09fUElcclxuXHRcdGFUbyA9IGFGcm9tICsgQnUucmFuZCBCdS5IQUxGX1BJLCBCdS5UV09fUElcclxuXHJcblx0XHRib3cuY3ggPSBAcmFuZG9tWCgpXHJcblx0XHRib3cuY3kgPSBAcmFuZG9tWSgpXHJcblx0XHRib3cucmFkaXVzID0gQHJhbmRvbVJhZGl1cygpXHJcblx0XHRib3cuYUZyb20gPSBhRnJvbVxyXG5cdFx0Ym93LmFUbyA9IGFUb1xyXG5cdFx0Ym93LnRyaWdnZXIgJ2NoYW5nZWQnXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlRmFuOiAtPlxyXG5cdFx0YUZyb20gPSBCdS5yYW5kIEJ1LlRXT19QSVxyXG5cdFx0YVRvID0gYUZyb20gKyBCdS5yYW5kIEJ1LkhBTEZfUEksIEJ1LlRXT19QSVxyXG5cclxuXHRcdGZhbiA9IG5ldyBCdS5GYW4gQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSwgQHJhbmRvbVJhZGl1cygpLCBhRnJvbSwgYVRvXHJcblx0XHRmYW4uY2VudGVyLmxhYmVsID0gJ08nXHJcblx0XHRmYW4uc3RyaW5nLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0ZmFuLnN0cmluZy5wb2ludHNbMV0ubGFiZWwgPSAnQidcclxuXHRcdGZhblxyXG5cclxuXHRyYW5kb21pemVGYW46IEA6OnJhbmRvbWl6ZUJvd1xyXG5cclxuXHRnZW5lcmF0ZVRyaWFuZ2xlOiAtPlxyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGZvciBpIGluIFswLi4yXVxyXG5cdFx0XHRwb2ludHNbaV0gPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cclxuXHRcdHRyaWFuZ2xlID0gbmV3IEJ1LlRyaWFuZ2xlIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl1cclxuXHRcdHRyaWFuZ2xlLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0dHJpYW5nbGUucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHR0cmlhbmdsZS5wb2ludHNbMl0ubGFiZWwgPSAnQydcclxuXHRcdHRyaWFuZ2xlXHJcblxyXG5cdHJhbmRvbWl6ZVRyaWFuZ2xlOiAodHJpYW5nbGUpIC0+XHJcblx0XHR0cmlhbmdsZS5wb2ludHNbaV0uc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCkgZm9yIGkgaW4gWzAuLjJdXHJcblx0XHR0cmlhbmdsZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVJlY3RhbmdsZTogLT5cclxuXHRcdHJlY3QgPSBuZXcgQnUuUmVjdGFuZ2xlKFxyXG5cdFx0XHRCdS5yYW5kKEByYW5nZVdpZHRoKVxyXG5cdFx0XHRCdS5yYW5kKEByYW5nZUhlaWdodClcclxuXHRcdFx0QnUucmFuZChAcmFuZ2VXaWR0aCAvIDIpXHJcblx0XHRcdEJ1LnJhbmQoQHJhbmdlSGVpZ2h0IC8gMilcclxuXHRcdClcclxuXHRcdHJlY3QucG9pbnRMVC5sYWJlbCA9ICdBJ1xyXG5cdFx0cmVjdC5wb2ludFJULmxhYmVsID0gJ0InXHJcblx0XHRyZWN0LnBvaW50UkIubGFiZWwgPSAnQydcclxuXHRcdHJlY3QucG9pbnRMQi5sYWJlbCA9ICdEJ1xyXG5cdFx0cmVjdFxyXG5cclxuXHRyYW5kb21pemVSZWN0YW5nbGU6IChyZWN0YW5nbGUpIC0+XHJcblx0XHRyZWN0YW5nbGUuc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdHJlY3RhbmdsZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVBvbHlnb246IC0+XHJcblx0XHRwb2ludHMgPSBbXVxyXG5cclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2ludHMucHVzaCBwb2ludFxyXG5cclxuXHRcdG5ldyBCdS5Qb2x5Z29uIHBvaW50c1xyXG5cclxuXHRyYW5kb21pemVQb2x5Z29uOiAocG9seWdvbikgLT5cclxuXHRcdHZlcnRleC5zZXQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSBmb3IgdmVydGV4IGluIHBvbHlnb24udmVydGljZXNcclxuXHRcdHBvbHlnb24udHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVMaW5lOiAtPlxyXG5cdFx0bGluZSA9IG5ldyBCdS5MaW5lIEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGxpbmUucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRsaW5lLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0bGluZVxyXG5cclxuXHRyYW5kb21pemVMaW5lOiAobGluZSkgLT5cclxuXHRcdHBvaW50LnNldCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpIGZvciBwb2ludCBpbiBsaW5lLnBvaW50c1xyXG5cdFx0bGluZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZVBvbHlsaW5lOiAtPlxyXG5cdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2x5bGluZS5hZGRQb2ludCBwb2ludFxyXG5cdFx0cG9seWxpbmVcclxuXHJcblx0cmFuZG9taXplUG9seWxpbmU6IChwb2x5bGluZSkgLT5cclxuXHRcdHZlcnRleC5zZXQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSBmb3IgdmVydGV4IGluIHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRwb2x5bGluZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG4iXX0=

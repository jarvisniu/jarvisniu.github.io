// Bu.js - https://github.com/jarvisniu/Bu.js
(function() {
  var base, base1, currentTime, global, lastBootTime, previousGlobal,
    hasProp = {}.hasOwnProperty;

  previousGlobal = global;

  global = window || this;

  global.Bu = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Bu.Renderer, arguments, function(){});
  };

  Bu.global = global;

  global = previousGlobal;

  Bu.VERSION = '0.3.4';

  Bu.HALF_PI = Math.PI / 2;

  Bu.TWO_PI = Math.PI * 2;

  Bu.DEFAULT_STROKE_STYLE = '#048';

  Bu.DEFAULT_FILL_STYLE = 'rgba(64, 128, 192, 0.5)';

  Bu.DEFAULT_DASH_STYLE = [8, 4];

  Bu.DEFAULT_STROKE_STYLE_HOVER = 'rgba(255, 128, 0, 0.75)';

  Bu.DEFAULT_FILL_STYLE_HOVER = 'rgba(255, 128, 128, 0.5)';

  Bu.DEFAULT_TEXT_FILL_STYLE = 'black';

  Bu.POINT_RENDER_SIZE = 2.25;

  Bu.POINT_LABEL_OFFSET = 5;

  Bu.DEFAULT_BOUND_STROKE_STYLE = '#444';

  Bu.DEFAULT_BOUND_DASH_STYLE = [6, 6];

  Bu.DEFAULT_SPLINE_SMOOTH = 0.25;

  Bu.DEFAULT_NEAR_DIST = 5;

  Bu.MOUSE_BUTTON_NONE = -1;

  Bu.MOUSE_BUTTON_LEFT = 0;

  Bu.MOUSE_BUTTON_MIDDLE = 1;

  Bu.MOUSE_BUTTON_RIGHT = 2;

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
    if (typeof givenOptions === 'object') {
      for (i in givenOptions) {
        defaultOptions[i] = givenOptions[i];
      }
    }
    return defaultOptions;
  };

  Bu.isPlainObject = function(o) {
    return o instanceof Object && o.constructor.name === 'Object';
  };

  Bu.clone = function(target, deep) {
    var clone, i, results, results1;
    if (deep == null) {
      deep = false;
    }
    if (target instanceof Array) {
      clone = [];
      results = [];
      for (i in target) {
        if (!hasProp.call(target, i)) continue;
        results.push(clone[i] = target[i]);
      }
      return results;
    } else if (target instanceof Object) {
      clone = {};
      results1 = [];
      for (i in target) {
        if (!hasProp.call(target, i)) continue;
        results1.push(clone[i] = target[i]);
      }
      return results1;
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

  lastBootTime = Bu.data('lastInfo');

  currentTime = Date.now();

  if (!((lastBootTime != null) && currentTime - lastBootTime < 60 * 1000)) {
    if (typeof console.info === "function") {
      console.info('Bu.js v' + Bu.VERSION + ' - [https://github.com/jarvisniu/Bu.js]');
    }
    Bu.data('lastInfo', currentTime);
  }

}).call(this);

(function() {
  Bu.Bounds = (function() {
    function Bounds(target) {
      var i, j, len, len1, ref, ref1, v;
      this.target = target;
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      this.isEmpty = true;
      this.point1 = new Bu.Vector;
      this.point2 = new Bu.Vector;
      this.strokeStyle = Bu.DEFAULT_BOUND_STROKE_STYLE;
      this.dashStyle = Bu.DEFAULT_BOUND_DASH_STYLE;
      this.dashOffset = 0;
      switch (this.target.type) {
        case 'Line':
        case 'Triangle':
        case 'Rectangle':
          ref = this.target.points;
          for (i = 0, len = ref.length; i < len; i++) {
            v = ref[i];
            this.expandByPoint(v);
          }
          break;
        case 'Circle':
        case 'Bow':
        case 'Fan':
          this.expandByCircle(this.target);
          this.target.on('centerChanged', (function(_this) {
            return function() {
              _this.clear();
              return _this.expandByCircle(_this.target);
            };
          })(this));
          this.target.on('radiusChanged', (function(_this) {
            return function() {
              _this.clear();
              return _this.expandByCircle(_this.target);
            };
          })(this));
          break;
        case 'Polyline':
        case 'Polygon':
          ref1 = this.target.vertices;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            v = ref1[j];
            this.expandByPoint(v);
          }
          break;
        default:
          console.warn('Bounds: not support shape type "' + this.target.type + '"');
      }
    }

    Bounds.prototype.containsPoint = function(p) {
      return this.x1 < p.x && this.x2 > p.x && this.y1 < p.y && this.y2 > p.y;
    };

    Bounds.prototype.clear = function() {
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      return this.isEmpty = true;
    };

    Bounds.prototype.expandByPoint = function(v) {
      if (this.isEmpty) {
        this.isEmpty = false;
        this.x1 = this.x2 = v.x;
        return this.y1 = this.y2 = v.y;
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
          return this.y2 = v.y;
        }
      }
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
        return this.y2 = cp.y + r;
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
          return this.y2 = cp.y + r;
        }
      }
    };

    return Bounds;

  })();

}).call(this);

(function() {
  Bu.Color = (function() {
    var CSS3_COLORS, RE_HEX3, RE_HEX6, RE_RGB, RE_RGBA, RE_RGBA_PER, RE_RGB_PER, clampAlpha;

    function Color() {
      var arg;
      if (arguments.length === 0) {
        this.r = this.g = this.b = 255;
        this.a = 1;
      }
      if (arguments.length === 1) {
        arg = arguments[0];
        if (typeof arg === 'string') {
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
    function Size(width1, height1) {
      this.width = width1;
      this.height = height1;
      this.type = 'Size';
    }

    Size.prototype.set = function(width, height) {
      this.width = width;
      return this.height = height;
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

    Vector.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
    };

    return Vector;

  })();

}).call(this);

(function() {
  Bu.Colorful = function() {
    this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
    this.fillStyle = Bu.DEFAULT_FILL_STYLE;
    this.dashStyle = false;
    this.lineWidth = 1;
    this.dashOffset = 0;
    this.stroke = function(v) {
      if (v == null) {
        v = true;
      }
      switch (v) {
        case true:
          this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
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
      switch (v) {
        case false:
          this.fillStyle = null;
          break;
        case true:
          this.fillStyle = Bu.DEFAULT_FILL_STYLE;
          break;
        default:
          this.fillStyle = v;
      }
      return this;
    };
    return this.dash = function(v) {
      if (v == null) {
        v = true;
      }
      if (typeof v === 'number') {
        v = [v, v];
      }
      switch (v) {
        case false:
          this.dashStyle = null;
          break;
        case true:
          this.dashStyle = Bu.DEFAULT_DASH_STYLE;
          break;
        default:
          this.dashStyle = v;
      }
      return this;
    };
  };

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
      var j, len, listener, listeners, results;
      listeners = types[type];
      if (listeners != null) {
        eventData || (eventData = {});
        eventData.target = this;
        results = [];
        for (j = 0, len = listeners.length; j < len; j++) {
          listener = listeners[j];
          listener.call(this, eventData);
          if (listener.once) {
            listeners.splice(i, 1);
            results.push(i -= 1);
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
      Bu.Colorful.apply(this);
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
        if (typeof val === 'number') {
          return this._scale.x = this._scale.y = val;
        } else {
          return this._scale = val;
        }
      }
    });

    Object2D.prototype.animate = function(anim, args) {
      var i;
      if (typeof anim === 'string') {
        if (anim in Bu.animations) {
          Bu.animations[anim].apply(this, args);
        } else {
          console.warn("Bu.animations[\"" + anim + "\"] doesn't exists.");
        }
      } else if (anim instanceof Array) {
        if (!(args instanceof Array)) {
          args = [args];
        }
        for (i in anim) {
          if (!hasProp.call(anim, i)) continue;
          this.animate(anim[i], args);
        }
      } else {
        anim.apply(this, args);
      }
      return this;
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
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
        background: '#eee'
      });
      this.width = options.width;
      this.height = options.height;
      this.fps = options.fps;
      this.container = options.container;
      this.fillParent = options.fillParent;
      this.isShowKeyPoints = options.showKeyPoints;
      this.tickCount = 0;
      this.isRunning = false;
      this.pixelRatio = Bu.global.devicePixelRatio || 1;
      this.dom = document.createElement('canvas');
      this.context = this.dom.getContext('2d');
      this.context.textBaseline = 'top';
      if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
        this.clipMeter = new ClipMeter();
      }
      this.shapes = [];
      if (!this.fillParent) {
        this.dom.style.width = this.width + 'px';
        this.dom.style.height = this.height + 'px';
        this.dom.width = this.width * this.pixelRatio;
        this.dom.height = this.height * this.pixelRatio;
      }
      this.dom.style.cursor = 'crosshair';
      this.dom.style.boxSizing = 'content-box';
      this.dom.style.background = options.background;
      this.dom.oncontextmenu = function() {
        return false;
      };
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

    Renderer.prototype.add = function(shape) {
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

    Renderer.prototype.remove = function(shape) {
      var index;
      index = this.shapes.indexOf(shape);
      if (index > -1) {
        this.shapes.splice(index, 1);
      }
      return this;
    };

    Renderer.prototype.render = function() {
      this.context.save();
      this.context.scale(this.pixelRatio, this.pixelRatio);
      this.clearCanvas();
      this.drawShapes(this.shapes);
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
        case 'Group':
          break;
        default:
          console.log('drawShapes(): unknown shape: ', shape);
      }
      if (shape.fillStyle != null) {
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
      if (this.isShowKeyPoints) {
        this.drawShapes(shape.keyPoints);
      }
      return this;
    };

    Renderer.prototype.drawPoint = function(shape) {
      this.context.arc(shape.x, shape.y, Bu.POINT_RENDER_SIZE, 0, Math.PI * 2);
      return this;
    };

    Renderer.prototype.drawLine = function(shape) {
      this.context.moveTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      return this;
    };

    Renderer.prototype.drawCircle = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2);
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
      var char, charBitmap, i, j, ref, textWidth, xOffset, yOffset;
      if (typeof shape.font === 'string') {
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
      } else if (shape.font instanceof Bu.SpriteSheet && shape.font.ready) {
        textWidth = shape.font.measureTextWidth(shape.text);
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
              return -shape.font.height / 2;
            case 'bottom':
              return -shape.font.height;
          }
        })();
        for (i = j = 0, ref = shape.text.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          char = shape.text[i];
          charBitmap = shape.font.getFrameImage(char);
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
      this.context.rect(bounds.x1, bounds.y1, bounds.x2 - bounds.x1, bounds.y2 - bounds.y1);
      return this;
    };

    return Renderer;

  })();

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Bow = (function(superClass) {
    extend(Bow, superClass);

    function Bow(cx, cy, radius, aFrom, aTo) {
      var ref;
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Bow.__super__.constructor.call(this);
      this.type = 'Bow';
      if (this.aFrom > this.aTo) {
        ref = [this.aTo, this.aFrom], this.aFrom = ref[0], this.aTo = ref[1];
      }
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
    }

    Bow.prototype.clone = function() {
      return new Bu.Bow(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    return Bow;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Circle = (function(superClass) {
    extend(Circle, superClass);

    function Circle(_radius, cx, cy) {
      this._radius = _radius != null ? _radius : 1;
      if (cx == null) {
        cx = 0;
      }
      if (cy == null) {
        cy = 0;
      }
      Circle.__super__.constructor.call(this);
      this.type = 'Circle';
      this._center = new Bu.Point(cx, cy);
      this.bounds = null;
      this.keyPoints = [this._center];
    }

    Circle.prototype.clone = function() {
      return new Bu.Circle(this.radius, this.cx, this.cy);
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

  Bu.Fan = (function(superClass) {
    extend(Fan, superClass);

    function Fan(cx, cy, radius, aFrom, aTo) {
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Fan.__super__.constructor.call(this);
      this.type = 'Fan';
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = [this.string.points[0], this.string.points[1], new Bu.Point(this.cx, this.cy)];
    }

    Fan.prototype.clone = function() {
      return new Bu.Fan(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    return Fan;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Line = (function(superClass) {
    extend(Line, superClass);

    function Line(p1, p2, p3, p4) {
      Line.__super__.constructor.call(this);
      this.type = 'Line';
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
      this.on("pointChange", (function(_this) {
        return function() {
          _this.length = _this.points[0].distanceTo(_this.points[1]);
          return _this.midpoint.set((_this.points[0].x + _this.points[1].x) / 2, (_this.points[0].y + _this.points[1].y) / 2);
        };
      })(this));
      this.trigger("pointChange", this);
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
      this.trigger("pointChange", this);
      return this;
    };

    Line.prototype.setPoint1 = function(a1, a2) {
      if (a2 != null) {
        this.points[0].set(a1, a2);
      } else {
        this.points[0].copy(a1);
      }
      this.trigger("pointChange", this);
      return this;
    };

    Line.prototype.setPoint2 = function(a1, a2) {
      if (a2 != null) {
        this.points[1].set(a1, a2);
      } else {
        this.points[1].copy(a1);
      }
      this.trigger("pointChange", this);
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

    function Point(x1, y1) {
      this.x = x1 != null ? x1 : 0;
      this.y = y1 != null ? y1 : 0;
      Point.__super__.constructor.call(this);
      this.type = 'Point';
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


    /*
       constructors
       1. Polygon(points)
       2. Polygon(x, y, radius, n, options): to generate regular polygon
       	options: angle - start angle of regular polygon
     */

    function Polygon(points) {
      var i, k, l, n, options, radius, ref, ref1, x, y;
      Polygon.__super__.constructor.call(this);
      this.type = 'Polygon';
      this.vertices = [];
      this.lines = [];
      this.triangles = [];
      options = Bu.combineOptions(arguments, {
        angle: 0
      });
      if (points instanceof Array) {
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
      if (this.vertices.length > 1) {
        for (i = k = 0, ref = this.vertices.length - 1; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          this.lines.push(new Bu.Line(this.vertices[i], this.vertices[i + 1]));
        }
        this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
      }
      if (this.vertices.length > 2) {
        for (i = l = 1, ref1 = this.vertices.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
          this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[i], this.vertices[i + 1]));
        }
      }
      this.keyPoints = this.vertices;
    }

    Polygon.prototype.clone = function() {
      return new Bu.Polygon(this.vertices);
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
      angleSection = Math.PI * 2 / n;
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
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Polyline = (function(superClass) {
    var set;

    extend(Polyline, superClass);

    function Polyline(vertices1) {
      var i, j, ref, vertices;
      this.vertices = vertices1 != null ? vertices1 : [];
      this.updateLines = bind(this.updateLines, this);
      this.clone = bind(this.clone, this);
      Polyline.__super__.constructor.call(this);
      this.type = 'Polyline';
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
      this.on("pointChange", (function(_this) {
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
      this.trigger("pointChange", this);
    }

    Polyline.prototype.clone = function() {
      return new Bu.Polyline(this.vertices);
    };

    Polyline.prototype.updateLines = function() {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = this.vertices.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.lines[i] != null) {
          results.push(this.lines[i].set(this.vertices[i], this.vertices[i + 1]));
        } else {
          results.push(this.lines[i] = new Bu.Line(this.vertices[i], this.vertices[i + 1]));
        }
      }
      return results;
    };

    set = function(points) {
      var i, j, ref;
      for (i = j = 0, ref = this.vertices.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.vertices[i].copy(points[i]);
      }
      if (this.vertices.length > points.length) {
        this.vertices.splice(points.length);
      }
      return this.trigger("pointChange", this);
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
      return this.trigger("pointChange", this);
    };

    return Polyline;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Rectangle = (function(superClass) {
    extend(Rectangle, superClass);

    function Rectangle(x, y, width, height, cornerRadius) {
      if (cornerRadius == null) {
        cornerRadius = 0;
      }
      Rectangle.__super__.constructor.call(this);
      this.type = 'Rectangle';
      this.center = new Bu.Point(x + width / 2, y + height / 2);
      this.size = new Bu.Size(width, height);
      this.pointLT = new Bu.Point(x, y);
      this.pointRT = new Bu.Point(x + width, y);
      this.pointRB = new Bu.Point(x + width, y + height);
      this.pointLB = new Bu.Point(x, y + height);
      this.points = [this.pointLT, this.pointRT, this.pointRB, this.pointLB];
      this.cornerRadius = cornerRadius;
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

    return Rectangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Spline = (function(superClass) {
    var calcControlPoints;

    extend(Spline, superClass);

    function Spline(vertices) {
      var polyline;
      Spline.__super__.constructor.call(this);
      this.type = 'Spline';
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
          if (Math.abs(theta - theta1) > Math.PI / 2) {
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
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Triangle = (function(superClass) {
    extend(Triangle, superClass);

    function Triangle(p1, p2, p3) {
      this.clone = bind(this.clone, this);
      var x1, x2, x3, y1, y2, y3;
      Triangle.__super__.constructor.call(this);
      this.type = 'Triangle';
      if (arguments.length === 6) {
        x1 = arguments[0], y1 = arguments[1], x2 = arguments[2], y2 = arguments[3], x3 = arguments[4], y3 = arguments[5];
        p1 = new Bu.Point(x1, y1);
        p2 = new Bu.Point(x2, y2);
        p3 = new Bu.Point(x3, y3);
      }
      this.lines = [new Bu.Line(p1, p2), new Bu.Line(p2, p3), new Bu.Line(p3, p1)];
      this.points = [p1, p2, p3];
      this.keyPoints = this.points;
    }

    Triangle.prototype.clone = function() {
      return new Bu.Triangle(this.points[0], this.points[1], this.points[2]);
    };

    return Triangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Group = (function(superClass) {
    extend(Group, superClass);

    function Group() {
      Group.__super__.constructor.call(this);
      this.type = 'Group';
    }

    return Group;

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
      this.image = new Bu.global.Image;
      this.loaded = false;
      this.image.onload = (function(_this) {
        return function(e) {
          if (_this.autoSize) {
            _this.size.set(_this.image.width, _this.image.height);
          }
          return _this.loaded = true;
        };
      })(this);
      this.image.src = this.url;
    }

    return Image;

  })(Bu.Object2D);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
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
      this.setContextAlign = bind(this.setContextAlign, this);
      PointText.__super__.constructor.call(this);
      this.type = 'PointText';
      this.strokeStyle = null;
      this.fillStyle = Bu.DEFAULT_TEXT_FILL_STYLE;
      options = Bu.combineOptions(arguments, {
        align: '00',
        fontFamily: 'Verdana',
        fontSize: 11
      });
      this.align = options.align;
      this._fontFamily = options.fontFamily;
      this._fontSize = options.fontSize;
      this.font = (this._fontSize + "px " + this._fontFamily) || options.font;
    }

    PointText.property('align', {
      get: function() {
        return this._align;
      },
      set: function(val) {
        this._align = val;
        return this.setContextAlign(this._align);
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

    PointText.prototype.setContextAlign = function(align) {
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
      return this.textBaseline = (function() {
        switch (alignY) {
          case '-':
            return 'bottom';
          case '0':
            return 'middle';
          case '+':
            return 'top';
        }
      })();
    };

    return PointText;

  })(Bu.Object2D);

}).call(this);

(function() {
  Bu.Animation = (function() {
    function Animation(options) {
      this.from = options.from;
      this.to = options.to;
      this.data = options.data || {};
      this.duration = options.duration || 0.5;
      this.easing = options.easing || false;
      this.repeat = !!options.repeat;
      this.init = options.init;
      this.update = options.update;
      this.finish = options.finish;
    }

    Animation.prototype.apply = function(target, args) {
      return Bu.animationRunner.add(this, target, args);
    };

    return Animation;

  })();

  Bu.animations = {
    fadeIn: new Bu.Animation({
      update: function(t) {
        return this.opacity = t;
      }
    }),
    fadeOut: new Bu.Animation({
      update: function(t) {
        return this.opacity = 1 - t;
      }
    }),
    spin: new Bu.Animation({
      update: function(t) {
        return this.rotation = t * Math.PI * 2;
      }
    }),
    spinIn: new Bu.Animation({
      init: function(anim, arg) {
        if (arg == null) {
          arg = 1;
        }
        return anim.data.ds = arg;
      },
      update: function(t, data) {
        this.opacity = t;
        this.rotation = t * Math.PI * 4;
        return this.scale = t * data.ds;
      }
    }),
    spinOut: new Bu.Animation({
      update: function(t) {
        this.opacity = 1 - t;
        this.rotation = t * Math.PI * 4;
        return this.scale = 1 - t;
      }
    }),
    blink: new Bu.Animation({
      duration: 0.2,
      from: 0,
      to: 512,
      update: function(data) {
        data = Math.floor(Math.abs(d - 256));
        return this.fillStyle = "rgb(" + data + ", " + data + ", " + data + ")";
      }
    }),
    shake: new Bu.Animation({
      init: function(anim, arg) {
        anim.data.ox = this.position.x;
        return anim.data.range = arg || 20;
      },
      update: function(t, data) {
        return this.position.x = Math.sin(t * Math.PI * 8) * data.range + data.ox;
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
      update: function(data) {
        this.opacity = data.opacity;
        return this.scale = data.scale;
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
      update: function(data) {
        return this.scale.y = data;
      }
    }),
    flipX: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.x;
        return anim.to = -anim.from;
      },
      update: function(data) {
        return this.scale.x = data;
      }
    }),
    flipY: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.y;
        return anim.to = -anim.from;
      },
      update: function(data) {
        return this.scale.y = data;
      }
    }),
    moveTo: new Bu.Animation({
      init: function(anim, args) {
        if (args != null) {
          anim.from = this.position.x;
          return anim.to = args;
        } else {
          return console.error('animation moveTo need an argument');
        }
      },
      update: function(data) {
        return this.position.x = data;
      }
    }),
    moveBy: new Bu.Animation({
      init: function(anim, args) {
        if (args != null) {
          anim.from = this.position.x;
          return anim.to = this.position.x + parseFloat(args);
        } else {
          return console.error('animation moveTo need an argument');
        }
      },
      update: function(data) {
        return this.position.x = data;
      }
    }),
    discolor: new Bu.Animation({
      init: function(anim, desColor) {
        if (typeof desColor === 'string') {
          desColor = new Bu.Color(desColor);
        }
        anim.from = new Bu.Color(this.fillStyle);
        return anim.to = desColor;
      },
      update: function(data) {
        return this.fillStyle = data.toRGBA();
      }
    })
  };

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.AnimationRunner = (function() {
    var DEFAULT_EASING_FUNCTION, easingFunctions, initTask, interpolateNum, interpolateObject, interpolateTask, isAnimationLegal;

    function AnimationRunner() {
      this.runningAnimations = [];
    }

    AnimationRunner.prototype.add = function(anim, target, args) {
      var ref, task;
      if ((ref = anim.init) != null) {
        ref.call(target, anim, args);
      }
      if (isAnimationLegal(anim)) {
        task = {
          animation: anim,
          target: target,
          startTime: Bu.now(),
          current: anim.data,
          finished: false
        };
        this.runningAnimations.push(task);
        return initTask(task, anim);
      } else {
        return console.error('Bu.AnimationRunner: animation setting is ilegal: ', animation);
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
        if (anim.from != null) {
          interpolateTask(task, t);
          anim.update.apply(task.target, [task.current, t]);
        } else {
          anim.update.apply(task.target, [t, task.current]);
        }
        if (finish) {
          results.push((ref1 = anim.finish) != null ? ref1.call(task.target, anim) : void 0);
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

    isAnimationLegal = function(anim) {
      var key, ref;
      if (!((anim.from != null) && (anim.to != null))) {
        return true;
      }
      if (Bu.isPlainObject(anim.from)) {
        ref = anim.from;
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          if (anim.to[key] == null) {
            return false;
          }
        }
      } else {
        if (anim.to == null) {
          return false;
        }
      }
      return true;
    };

    initTask = function(task, anim) {
      var key, ref, results;
      if (anim.from != null) {
        if (Bu.isPlainObject(anim.from)) {
          ref = anim.from;
          results = [];
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            results.push(task.current[key] = new anim.from[key].constructor);
          }
          return results;
        } else {
          return task.current = new anim.from.constructor;
        }
      }
    };

    interpolateTask = function(task, t) {
      var anim, key, ref, results;
      anim = task.animation;
      if (typeof anim.from === 'number') {
        return task.current = interpolateNum(anim.from, anim.to, t);
      } else if (anim.from instanceof Bu.Color) {
        return interpolateObject(anim.from, anim.to, t, task.current);
      } else if (Bu.isPlainObject(anim.from)) {
        ref = anim.from;
        results = [];
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          if (typeof anim.from[key] === 'number') {
            results.push(task.current[key] = interpolateNum(anim.from[key], anim.to[key], t));
          } else {
            results.push(interpolateObject(anim.from[key], anim.to[key], t, task.current[key]));
          }
        }
        return results;
      }
    };

    interpolateNum = function(a, b, t) {
      return b * t - a * (t - 1);
    };

    interpolateObject = function(a, b, t, c) {
      if (a instanceof Bu.Color) {
        return c.setRGBA(interpolateNum(a.r, b.r, t), interpolateNum(a.g, b.g, t), interpolateNum(a.b, b.b, t), interpolateNum(a.a, b.a, t));
      } else {
        return console.error("AnimationRunner.interpolateObject() doesn't support object type: ", a);
      }
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
  var G,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    hasProp = {}.hasOwnProperty;

  Bu.geometryAlgorithm = G = {
    inject: function() {
      return this.injectInto(['point', 'line', 'circle', 'triangle', 'rectangle', 'fan', 'bow', 'polygon', 'polyline']);
    },
    injectInto: function(shapes) {
      if (typeof shapes === 'string') {
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
        a += Math.PI * 2;
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
          if (obliqueAngle < strength * strength * Math.PI / 2) {
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
  Bu.RandomShapeGenerator = (function() {
    var MARGIN;

    MARGIN = 30;

    function RandomShapeGenerator(bu) {
      this.bu = bu;
    }

    RandomShapeGenerator.prototype.randomX = function() {
      return Bu.rand(MARGIN, this.bu.width - MARGIN * 2);
    };

    RandomShapeGenerator.prototype.randomY = function() {
      return Bu.rand(MARGIN, this.bu.height - MARGIN * 2);
    };

    RandomShapeGenerator.prototype.randomRadius = function() {
      return Bu.rand(5, Math.min(this.bu.width, this.bu.height) / 2);
    };

    RandomShapeGenerator.prototype.generate = function(type) {
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

    RandomShapeGenerator.prototype.generateCircle = function() {
      var circle;
      circle = new Bu.Circle(this.randomRadius(), this.randomX(), this.randomY());
      circle.center.label = 'O';
      return circle;
    };

    RandomShapeGenerator.prototype.generateBow = function() {
      var aFrom, aTo, bow;
      aFrom = Bu.rand(Math.PI * 2);
      aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
      bow = new Bu.Bow(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      bow.string.points[0].label = 'A';
      bow.string.points[1].label = 'B';
      return bow;
    };

    RandomShapeGenerator.prototype.generateTriangle = function() {
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

    RandomShapeGenerator.prototype.generateRectangle = function() {
      return new Bu.Rectangle(Bu.rand(this.bu.width), Bu.rand(this.bu.height), Bu.rand(this.bu.width / 2), Bu.rand(this.bu.height / 2));
    };

    RandomShapeGenerator.prototype.generateFan = function() {
      var aFrom, aTo, fan;
      aFrom = Bu.rand(Math.PI * 2);
      aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
      fan = new Bu.Fan(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      fan.string.points[0].label = 'A';
      fan.string.points[1].label = 'B';
      return fan;
    };

    RandomShapeGenerator.prototype.generatePolygon = function() {
      var i, j, point, points;
      points = [];
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        points.push(point);
      }
      return new Bu.Polygon(points);
    };

    RandomShapeGenerator.prototype.generateLine = function() {
      var line;
      line = new Bu.Line(this.randomX(), this.randomY(), this.randomX(), this.randomY());
      line.points[0].label = 'A';
      line.points[1].label = 'B';
      return line;
    };

    RandomShapeGenerator.prototype.generatePolyline = function() {
      var i, j, point, polyline;
      polyline = new Bu.Polyline;
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        polyline.addPoint(point);
      }
      return polyline;
    };

    return RandomShapeGenerator;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1LmpzIiwiQnUuY29mZmVlIiwiQm91bmRzLmNvZmZlZSIsIkNvbG9yLmNvZmZlZSIsIlNpemUuY29mZmVlIiwiVmVjdG9yLmNvZmZlZSIsIkNvbG9yZnVsLmNvZmZlZSIsIkV2ZW50LmNvZmZlZSIsIk1pY3JvSlF1ZXJ5LmNvZmZlZSIsIk9iamVjdDJELmNvZmZlZSIsIlJlbmRlcmVyLmNvZmZlZSIsIkJvdy5jb2ZmZWUiLCJDaXJjbGUuY29mZmVlIiwiRmFuLmNvZmZlZSIsIkxpbmUuY29mZmVlIiwiUG9pbnQuY29mZmVlIiwiUG9seWdvbi5jb2ZmZWUiLCJQb2x5bGluZS5jb2ZmZWUiLCJSZWN0YW5nbGUuY29mZmVlIiwiU3BsaW5lLmNvZmZlZSIsIlRyaWFuZ2xlLmNvZmZlZSIsIkdyb3VwLmNvZmZlZSIsIkltYWdlLmNvZmZlZSIsIlBvaW50VGV4dC5jb2ZmZWUiLCJBbmltYXRpb24uY29mZmVlIiwiQW5pbWF0aW9uUnVubmVyLmNvZmZlZSIsIlNwcml0ZVNoZWV0LmNvZmZlZSIsImdlb21ldHJ5QWxnb3JpdGhtLmNvZmZlZSIsIlJhbmRvbVNoYXBlR2VuZXJhdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLEFDRUE7QUFBQSxNQUFBLDhEQUFBO0lBQUE7O0VBQUEsY0FBQSxHQUFpQjs7RUFHakIsTUFBQSxHQUFTLE1BQUEsSUFBVTs7RUFHbkIsTUFBTSxDQUFDLEVBQVAsR0FBWSxTQUFBO1dBQVU7Ozs7T0FBQSxFQUFFLENBQUMsUUFBSCxFQUFZLFNBQVo7RUFBVjs7RUFHWixFQUFFLENBQUMsTUFBSCxHQUFZOztFQUdaLE1BQUEsR0FBUzs7RUFRVCxFQUFFLENBQUMsT0FBSCxHQUFhOztFQUdiLEVBQUUsQ0FBQyxPQUFILEdBQWEsSUFBSSxDQUFDLEVBQUwsR0FBVTs7RUFDdkIsRUFBRSxDQUFDLE1BQUgsR0FBWSxJQUFJLENBQUMsRUFBTCxHQUFVOztFQUd0QixFQUFFLENBQUMsb0JBQUgsR0FBMEI7O0VBQzFC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SEQ7QUFJQSxhQUFPO0lBTlU7Ozs7O0FBdEZuQiIsImZpbGUiOiJidS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiIyBCdS5jb2ZmZWU6IG5hbWVzcGFjZSwgY29uc3RhbnRzLCB1dGlsaXR5IGZ1bmN0aW9ucyBhbmQgcG9seWZpbGxzXHJcblxyXG4jIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIGBnbG9iYWxgIHZhcmlhYmxlLlxyXG5wcmV2aW91c0dsb2JhbCA9IGdsb2JhbFxyXG5cclxuIyBHZXQgdGhlIHJvb3Qgb2JqZWN0XHJcbmdsb2JhbCA9IHdpbmRvdyBvciBAXHJcblxyXG4jIERlZmluZSBvdXIgbmFtZXNwYWNlIGBCdWAuIEl0IGlzIGFsc28gYSBzaG9ydGN1dCB0byBjbGFzcyBgQnUuUmVuZGVyZXJgLlxyXG5nbG9iYWwuQnUgPSAoKSAtPiBuZXcgQnUuUmVuZGVyZXIgYXJndW1lbnRzLi4uXHJcblxyXG4jIFNhdmUgdGhlIHJvb3Qgb2JqZWN0IHRvIG91ciBuYW1lc3BhY2UuXHJcbkJ1Lmdsb2JhbCA9IGdsb2JhbFxyXG5cclxuIyBSZXR1cm4gYmFjayB0aGUgcHJldmlvdXMgZ2xvYmFsIHZhcmlhYmxlLlxyXG5nbG9iYWwgPSBwcmV2aW91c0dsb2JhbFxyXG5cclxuXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQ29uc3RhbnRzXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIFZlcnNpb24gaW5mbyBvZiB0aGlzIGxpYnJhcnlcclxuQnUuVkVSU0lPTiA9ICcwLjMuNCdcclxuXHJcbiMgTWF0aFxyXG5CdS5IQUxGX1BJID0gTWF0aC5QSSAvIDJcclxuQnUuVFdPX1BJID0gTWF0aC5QSSAqIDJcclxuXHJcbiMgRGVmYXVsdCByZW5kZXIgc3R5bGUgb2Ygc2hhcGVzXHJcbkJ1LkRFRkFVTFRfU1RST0tFX1NUWUxFID0gJyMwNDgnXHJcbkJ1LkRFRkFVTFRfRklMTF9TVFlMRSA9ICdyZ2JhKDY0LCAxMjgsIDE5MiwgMC41KSdcclxuQnUuREVGQVVMVF9EQVNIX1NUWUxFID0gWzgsIDRdXHJcblxyXG4jIERlZmF1bHQgcmVuZGVyIHN0eWxlIHdoZW4gdGhlbiBtb3VzZSBpcyBob3ZlcmVkIG9uXHJcbkJ1LkRFRkFVTFRfU1RST0tFX1NUWUxFX0hPVkVSID0gJ3JnYmEoMjU1LCAxMjgsIDAsIDAuNzUpJ1xyXG5CdS5ERUZBVUxUX0ZJTExfU1RZTEVfSE9WRVIgPSAncmdiYSgyNTUsIDEyOCwgMTI4LCAwLjUpJ1xyXG5cclxuIyBUaGUgZGVmYXVsdCBjb2xvciBvZiByZW5kZXJlZCB0ZXh0LCBQb2ludFRleHQgZm9yIG5vd1xyXG5CdS5ERUZBVUxUX1RFWFRfRklMTF9TVFlMRSA9ICdibGFjaydcclxuXHJcbiMgUG9pbnQgaXMgcmVuZGVyZWQgYXMgYSBzbWFsbCBjaXJjbGUgb24gc2NyZWVuLiBUaGlzIGlzIHRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZS5cclxuQnUuUE9JTlRfUkVOREVSX1NJWkUgPSAyLjI1XHJcblxyXG4jIFBvaW50IGNhbiBoYXZlIGxhYmVsIGFzaWRlIGl0LiBUaGlzIGlzIHRoZSBvZmZzZXQgZGlzdGFuY2UgZnJvbSB0aGUgcG9pbnQuXHJcbkJ1LlBPSU5UX0xBQkVMX09GRlNFVCA9IDVcclxuXHJcbiMgRGVmYXVsdCByZW5kZXIgc3R5bGUgb2YgYm91bmRzXHJcbkJ1LkRFRkFVTFRfQk9VTkRfU1RST0tFX1NUWUxFID0gJyM0NDQnXHJcblxyXG4jIERlZmF1bHQgZGFzaCBzdHlsZSBvZiBib3VuZHNcclxuQnUuREVGQVVMVF9CT1VORF9EQVNIX1NUWUxFID0gWzYsIDZdXHJcblxyXG4jIERlZmF1bHQgc21vb3RoIGZhY3RvciBvZiBzcGxpbmUsIHJhbmdlIGluIFswLCAxXSBhbmQgMSBpcyB0aGUgc21vb3RoZXN0XHJcbkJ1LkRFRkFVTFRfU1BMSU5FX1NNT09USCA9IDAuMjVcclxuXHJcbiMgSG93IGNsb3NlIGEgcG9pbnQgdG8gYSBsaW5lIGlzIHJlZ2FyZGVkIHRoYXQgdGhlIHBvaW50IGlzICoqT04qKiB0aGUgbGluZS5cclxuQnUuREVGQVVMVF9ORUFSX0RJU1QgPSA1XHJcblxyXG4jIEVudW1lcmF0aW9uIG9mIG1vdXNlIGJ1dHRvblxyXG5CdS5NT1VTRV9CVVRUT05fTk9ORSA9IC0xXHJcbkJ1Lk1PVVNFX0JVVFRPTl9MRUZUID0gMFxyXG5CdS5NT1VTRV9CVVRUT05fTUlERExFID0gMVxyXG5CdS5NT1VTRV9CVVRUT05fUklHSFQgPSAyXHJcblxyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBDYWxjdWxhdGUgdGhlIG1lYW4gdmFsdWUgb2YgbnVtYmVyc1xyXG5CdS5hdmVyYWdlID0gKCktPlxyXG5cdG5zID0gYXJndW1lbnRzXHJcblx0bnMgPSBhcmd1bWVudHNbMF0gaWYgdHlwZW9mIGFyZ3VtZW50c1swXSBpcyAnb2JqZWN0J1xyXG5cdHN1bSA9IDBcclxuXHRmb3IgaSBpbiBuc1xyXG5cdFx0c3VtICs9IGlcclxuXHRzdW0gLyBucy5sZW5ndGhcclxuXHJcbiMgQ2FsY3VsYXRlIHRoZSBoeXBvdGVudXNlIGZyb20gdGhlIGNhdGhldHVzZXNcclxuQnUuYmV2ZWwgPSAoeCwgeSkgLT5cclxuXHRNYXRoLnNxcnQgeCAqIHggKyB5ICogeVxyXG5cclxuIyBMaW1pdCBhIG51bWJlciBieSBtaW5pbXVtIHZhbHVlIGFuZCBtYXhpbXVtIHZhbHVlXHJcbkJ1LmNsYW1wID0gKHgsIG1pbiwgbWF4KSAtPlxyXG5cdHggPSBtaW4gaWYgeCA8IG1pblxyXG5cdHggPSBtYXggaWYgeCA+IG1heFxyXG5cdHhcclxuXHJcbiMgR2VuZXJhdGUgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIG51bWJlcnNcclxuQnUucmFuZCA9IChmcm9tLCB0bykgLT5cclxuXHRpZiBub3QgdG8/XHJcblx0XHR0byA9IGZyb21cclxuXHRcdGZyb20gPSAwXHJcblx0TWF0aC5yYW5kb20oKSAqICh0byAtIGZyb20pICsgZnJvbVxyXG5cclxuIyBDb252ZXJ0IGFuIGFuZ2xlIGZyb20gcmFkaWFuIHRvIGRlZ1xyXG5CdS5yMmQgPSAocikgLT4gKHIgKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKDEpXHJcblxyXG4jIENvbnZlcnQgYW4gYW5nbGUgZnJvbSBkZWcgdG8gcmFkaWFuXHJcbkJ1LmQyciA9IChyKSAtPiByICogTWF0aC5QSSAvIDE4MFxyXG5cclxuIyBHZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wXHJcbkJ1Lm5vdyA9IGlmIEJ1Lmdsb2JhbC5wZXJmb3JtYW5jZT8gdGhlbiAtPiBCdS5nbG9iYWwucGVyZm9ybWFuY2Uubm93KCkgZWxzZSAtPiBEYXRlLm5vdygpXHJcblxyXG4jIENvbWJpbmUgdGhlIGdpdmVuIG9wdGlvbnMgKGxhc3QgaXRlbSBvZiBhcmd1bWVudHMpIHdpdGggdGhlIGRlZmF1bHQgb3B0aW9uc1xyXG5CdS5jb21iaW5lT3B0aW9ucyA9IChhcmdzLCBkZWZhdWx0T3B0aW9ucykgLT5cclxuXHRkZWZhdWx0T3B0aW9ucyA9IHt9IGlmIG5vdCBkZWZhdWx0T3B0aW9ucz9cclxuXHRnaXZlbk9wdGlvbnMgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cclxuXHRpZiB0eXBlb2YgZ2l2ZW5PcHRpb25zIGlzICdvYmplY3QnXHJcblx0XHRmb3IgaSBvZiBnaXZlbk9wdGlvbnNcclxuXHRcdFx0ZGVmYXVsdE9wdGlvbnNbaV0gPSBnaXZlbk9wdGlvbnNbaV1cclxuXHRyZXR1cm4gZGVmYXVsdE9wdGlvbnNcclxuXHJcbiMgQ2hlY2sgaWYgYW4gb2JqZWN0IGlmIGFuIHBsYWluIG9iamVjdCwgbm90IGluc3RhbmNlIG9mIGNsYXNzL2Z1bmN0aW9uXHJcbkJ1LmlzUGxhaW5PYmplY3QgPSAobykgLT5cclxuXHRvIGluc3RhbmNlb2YgT2JqZWN0IGFuZCBvLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ09iamVjdCdcclxuXHJcbiMgQ2xvbmUgYW4gT2JqZWN0IG9yIEFycmF5XHJcbkJ1LmNsb25lID0gKHRhcmdldCwgZGVlcCA9IGZhbHNlKSAtPlxyXG5cdCMgVE9ETyBkZWFsIHdpdGggZGVlcFxyXG5cdGlmIHRhcmdldCBpbnN0YW5jZW9mIEFycmF5XHJcblx0XHRjbG9uZSA9IFtdXHJcblx0XHRjbG9uZVtpXSA9IHRhcmdldFtpXSBmb3Igb3duIGkgb2YgdGFyZ2V0XHJcblx0ZWxzZSBpZiB0YXJnZXQgaW5zdGFuY2VvZiBPYmplY3RcclxuXHRcdGNsb25lID0ge31cclxuXHRcdGNsb25lW2ldID0gdGFyZ2V0W2ldIGZvciBvd24gaSBvZiB0YXJnZXRcclxuXHJcbiMgVXNlIGxvY2FsU3RvcmFnZSB0byBwZXJzaXN0IGRhdGFcclxuQnUuZGF0YSA9IChrZXksIHZhbHVlKSAtPlxyXG5cdGlmIHZhbHVlP1xyXG5cdFx0bG9jYWxTdG9yYWdlWydCdS4nICsga2V5XSA9IEpTT04uc3RyaW5naWZ5IHZhbHVlXHJcblx0ZWxzZVxyXG5cdFx0dmFsdWUgPSBsb2NhbFN0b3JhZ2VbJ0J1LicgKyBrZXldXHJcblx0XHRpZiB2YWx1ZT8gdGhlbiBKU09OLnBhcnNlIHZhbHVlIGVsc2UgbnVsbFxyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBQb2x5ZmlsbFxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBTaG9ydGN1dCB0byBkZWZpbmUgYSBwcm9wZXJ0eSBmb3IgYSBjbGFzcy4gVGhpcyBpcyB1c2VkIHRvIHNvbHZlIHRoZSBwcm9ibGVtXHJcbiMgdGhhdCBDb2ZmZWVTY3JpcHQgZGlkbid0IHN1cHBvcnQgZ2V0dGVycyBhbmQgc2V0dGVycy5cclxuIyBjbGFzcyBQZXJzb25cclxuIyAgIEBjb25zdHJ1Y3RvcjogKGFnZSkgLT5cclxuIyAgICAgQF9hZ2UgPSBhZ2VcclxuI1xyXG4jICAgQHByb3BlcnR5ICdhZ2UnLFxyXG4jICAgICBnZXQ6IC0+IEBfYWdlXHJcbiMgICAgIHNldDogKHZhbCkgLT5cclxuIyAgICAgICBAX2FnZSA9IHZhbFxyXG4jXHJcbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjXHJcblxyXG4jIE1ha2UgYSBjb3B5IG9mIHRoaXMgZnVuY3Rpb24gd2hpY2ggaGFzIGEgbGltaXRlZCBzaG9ydGVzdCBleGVjdXRpbmcgaW50ZXJ2YWwuXHJcbkZ1bmN0aW9uOjp0aHJvdHRsZSA9IChsaW1pdCA9IDAuNSkgLT5cclxuXHRjdXJyVGltZSA9IDBcclxuXHRsYXN0VGltZSA9IDBcclxuXHJcblx0cmV0dXJuICgpID0+XHJcblx0XHRjdXJyVGltZSA9IERhdGUubm93KClcclxuXHRcdGlmIGN1cnJUaW1lIC0gbGFzdFRpbWUgPiBsaW1pdCAqIDEwMDBcclxuXHRcdFx0QGFwcGx5IG51bGwsIGFyZ3VtZW50c1xyXG5cdFx0XHRsYXN0VGltZSA9IGN1cnJUaW1lXHJcblxyXG4jIE1ha2UgYSBjb3B5IG9mIHRoaXMgZnVuY3Rpb24gd2hvc2UgZXhlY3V0aW9uIHdpbGwgYmUgY29udGludW91c2x5IHB1dCBvZmZcclxuIyBhZnRlciBldmVyeSBjYWxsaW5nIG9mIHRoaXMgZnVuY3Rpb24uXHJcbkZ1bmN0aW9uOjpkZWJvdW5jZSA9IChkZWxheSA9IDAuNSkgLT5cclxuXHRhcmdzID0gbnVsbFxyXG5cdHRpbWVvdXQgPSBudWxsXHJcblxyXG5cdGxhdGVyID0gPT5cclxuXHRcdEBhcHBseSBudWxsLCBhcmdzXHJcblxyXG5cdHJldHVybiAoKSAtPlxyXG5cdFx0YXJncyA9IGFyZ3VtZW50c1xyXG5cdFx0Y2xlYXJUaW1lb3V0IHRpbWVvdXRcclxuXHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0IGxhdGVyLCBkZWxheSAqIDEwMDBcclxuXHJcblxyXG4jIEl0ZXJhdGUgdGhpcyBBcnJheSBhbmQgZG8gc29tZXRoaW5nIHdpdGggdGhlIGl0ZW1zLlxyXG5BcnJheTo6ZWFjaCBvcj0gKGZuKSAtPlxyXG5cdGkgPSAwXHJcblx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdGZuIEBbaV1cclxuXHRcdGkrK1xyXG5cdHJldHVybiBAXHJcblxyXG4jIEl0ZXJhdGUgdGhpcyBBcnJheSBhbmQgbWFwIHRoZSBpdGVtcyB0byBhIG5ldyBBcnJheS5cclxuQXJyYXk6Om1hcCBvcj0gKGZuKSAtPlxyXG5cdGFyciA9IFtdXHJcblx0aSA9IDBcclxuXHR3aGlsZSBpIDwgQGxlbmd0aFxyXG5cdFx0YXJyLnB1c2ggZm4oQFtpXSlcclxuXHRcdGkrK1xyXG5cdHJldHVybiBAXHJcblxyXG4jIERpc3BsYXkgdmVyc2lvbiBpbmZvLiBJdCB3aWxsIGFwcGVhciBhdCBtb3N0IG9uZSB0aW1lIGEgbWludXRlLlxyXG5sYXN0Qm9vdFRpbWUgPSBCdS5kYXRhICdsYXN0SW5mbydcclxuY3VycmVudFRpbWUgPSBEYXRlLm5vdygpXHJcbnVubGVzcyBsYXN0Qm9vdFRpbWU/IGFuZCBjdXJyZW50VGltZSAtIGxhc3RCb290VGltZSA8IDYwICogMTAwMFxyXG5cdGNvbnNvbGUuaW5mbz8gJ0J1LmpzIHYnICsgQnUuVkVSU0lPTiArICcgLSBbaHR0cHM6Ly9naXRodWIuY29tL2phcnZpc25pdS9CdS5qc10nXHJcblx0QnUuZGF0YSAnbGFzdEluZm8nLCBjdXJyZW50VGltZVxyXG4iLCIjIyBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94XHJcblxyXG5jbGFzcyBCdS5Cb3VuZHNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAdGFyZ2V0KSAtPlxyXG5cclxuXHRcdEB4MSA9IEB5MSA9IEB4MiA9IEB5MiA9IDBcclxuXHRcdEBpc0VtcHR5ID0gdHJ1ZVxyXG5cclxuXHRcdEBwb2ludDEgPSBuZXcgQnUuVmVjdG9yXHJcblx0XHRAcG9pbnQyID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdEBzdHJva2VTdHlsZSA9IEJ1LkRFRkFVTFRfQk9VTkRfU1RST0tFX1NUWUxFXHJcblx0XHRAZGFzaFN0eWxlID0gQnUuREVGQVVMVF9CT1VORF9EQVNIX1NUWUxFXHJcblx0XHRAZGFzaE9mZnNldCA9IDBcclxuXHJcblx0XHRzd2l0Y2ggQHRhcmdldC50eXBlXHJcblx0XHRcdHdoZW4gJ0xpbmUnLCAnVHJpYW5nbGUnLCAnUmVjdGFuZ2xlJ1xyXG5cdFx0XHRcdGZvciB2IGluIEB0YXJnZXQucG9pbnRzXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlQb2ludCh2KVxyXG5cdFx0XHR3aGVuICdDaXJjbGUnLCAnQm93JywgJ0ZhbidcclxuXHRcdFx0XHRAZXhwYW5kQnlDaXJjbGUgQHRhcmdldFxyXG5cdFx0XHRcdEB0YXJnZXQub24gJ2NlbnRlckNoYW5nZWQnLCA9PlxyXG5cdFx0XHRcdFx0QGNsZWFyKClcclxuXHRcdFx0XHRcdEBleHBhbmRCeUNpcmNsZSBAdGFyZ2V0XHJcblx0XHRcdFx0QHRhcmdldC5vbiAncmFkaXVzQ2hhbmdlZCcsID0+XHJcblx0XHRcdFx0XHRAY2xlYXIoKVxyXG5cdFx0XHRcdFx0QGV4cGFuZEJ5Q2lyY2xlIEB0YXJnZXRcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnLCAnUG9seWdvbidcclxuXHRcdFx0XHRmb3IgdiBpbiBAdGFyZ2V0LnZlcnRpY2VzXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlQb2ludCh2KVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuICdCb3VuZHM6IG5vdCBzdXBwb3J0IHNoYXBlIHR5cGUgXCInICsgQHRhcmdldC50eXBlICsgJ1wiJ1xyXG5cclxuXHRjb250YWluc1BvaW50OiAocCkgLT5cclxuXHRcdEB4MSA8IHAueCAmJiBAeDIgPiBwLnggJiYgQHkxIDwgcC55ICYmIEB5MiA+IHAueVxyXG5cclxuXHRjbGVhcjogKCkgLT5cclxuXHRcdEB4MSA9IEB5MSA9IEB4MiA9IEB5MiA9IDBcclxuXHRcdEBpc0VtcHR5ID0gdHJ1ZVxyXG5cclxuXHRleHBhbmRCeVBvaW50OiAodikgLT5cclxuXHRcdGlmIEBpc0VtcHR5XHJcblx0XHRcdEBpc0VtcHR5ID0gZmFsc2VcclxuXHRcdFx0QHgxID0gQHgyID0gdi54XHJcblx0XHRcdEB5MSA9IEB5MiA9IHYueVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAeDEgPSB2LnggaWYgdi54IDwgQHgxXHJcblx0XHRcdEB4MiA9IHYueCBpZiB2LnggPiBAeDJcclxuXHRcdFx0QHkxID0gdi55IGlmIHYueSA8IEB5MVxyXG5cdFx0XHRAeTIgPSB2LnkgaWYgdi55ID4gQHkyXHJcblxyXG5cdGV4cGFuZEJ5Q2lyY2xlOiAoYykgLT5cclxuXHRcdGNwID0gYy5jZW50ZXJcclxuXHRcdHIgPSBjLnJhZGl1c1xyXG5cdFx0aWYgQGlzRW1wdHlcclxuXHRcdFx0QGlzRW1wdHkgPSBmYWxzZVxyXG5cdFx0XHRAeDEgPSBjcC54IC0gclxyXG5cdFx0XHRAeDIgPSBjcC54ICsgclxyXG5cdFx0XHRAeTEgPSBjcC55IC0gclxyXG5cdFx0XHRAeTIgPSBjcC55ICsgclxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAeDEgPSBjcC54IC0gciBpZiBjcC54IC0gciA8IEB4MVxyXG5cdFx0XHRAeDIgPSBjcC54ICsgciBpZiBjcC54ICsgciA+IEB4MlxyXG5cdFx0XHRAeTEgPSBjcC55IC0gciBpZiBjcC55IC0gciA8IEB5MVxyXG5cdFx0XHRAeTIgPSBjcC55ICsgciBpZiBjcC55ICsgciA+IEB5MlxyXG4iLCIjIFBhcnNlIGFuZCBzZXJpYWxpemUgY29sb3JcbiMgVE9ETyBTdXBwb3J0IGhzbCgwLCAxMDAlLCA1MCUpIGZvcm1hdC5cblxuY2xhc3MgQnUuQ29sb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgIEByID0gQGcgPSBAYiA9IDI1NVxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgYXJnID0gYXJndW1lbnRzWzBdXG4gICAgICAgICAgICBpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgQHBhcnNlIGFyZ1xuICAgICAgICAgICAgICAgIEBhID0gY2xhbXBBbHBoYSBAYVxuICAgICAgICAgICAgZWxzZSBpZiBhcmcgaW5zdGFuY2VvZiBCdS5Db2xvclxuICAgICAgICAgICAgICAgIEBjb3B5IGFyZ1xuICAgICAgICBlbHNlICMgYXJndW1lbnRzLmxlbmd0aCA9PSAzIG9yIDRcbiAgICAgICAgICAgIEByID0gYXJndW1lbnRzWzBdXG4gICAgICAgICAgICBAZyA9IGFyZ3VtZW50c1sxXVxuICAgICAgICAgICAgQGIgPSBhcmd1bWVudHNbMl1cbiAgICAgICAgICAgIEBhID0gYXJndW1lbnRzWzNdIG9yIDFcblxuICAgIHBhcnNlOiAoc3RyKSAtPlxuICAgICAgICBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JBXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50IGZvdW5kWzFdXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50IGZvdW5kWzJdXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50IGZvdW5kWzNdXG4gICAgICAgICAgICBAYSA9IHBhcnNlRmxvYXQgZm91bmRbNF1cbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JcbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgZm91bmRbMV1cbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgZm91bmRbMl1cbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgZm91bmRbM11cbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX1JHQkFfUEVSXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50KGZvdW5kWzFdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludChmb3VuZFsyXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQoZm91bmRbM10gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYSA9IHBhcnNlRmxvYXQgZm91bmRbNF1cbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JfUEVSXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50KGZvdW5kWzFdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludChmb3VuZFsyXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQoZm91bmRbM10gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYSA9IDFcbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9IRVgzXG4gICAgICAgICAgICBoZXggPSBmb3VuZFsxXVxuICAgICAgICAgICAgQHIgPSBwYXJzZUludCBoZXhbMF0sIDE2XG4gICAgICAgICAgICBAciA9IEByICogMTYgKyBAclxuICAgICAgICAgICAgQGcgPSBwYXJzZUludCBoZXhbMV0sIDE2XG4gICAgICAgICAgICBAZyA9IEBnICogMTYgKyBAZ1xuICAgICAgICAgICAgQGIgPSBwYXJzZUludCBoZXhbMl0sIDE2XG4gICAgICAgICAgICBAYiA9IEBiICogMTYgKyBAYlxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfSEVYNlxuICAgICAgICAgICAgaGV4ID0gZm91bmRbMV1cbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZygwLCAyKSwgMTZcbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZygyLCA0KSwgMTZcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZyg0LCA2KSwgMTZcbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIENTUzNfQ09MT1JTW3N0ciA9IHN0ci50b0xvd2VyQ2FzZSgpLnRyaW0oKV0/XG4gICAgICAgICAgICBAciA9IENTUzNfQ09MT1JTW3N0cl1bMF1cbiAgICAgICAgICAgIEBnID0gQ1NTM19DT0xPUlNbc3RyXVsxXVxuICAgICAgICAgICAgQGIgPSBDU1MzX0NPTE9SU1tzdHJdWzJdXG4gICAgICAgICAgICBAYSA9IENTUzNfQ09MT1JTW3N0cl1bM11cbiAgICAgICAgICAgIEBhID0gMSB1bmxlc3MgQGE/XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgXCJCdS5Db2xvci5wYXJzZShcXFwiI3sgc3RyIH1cXFwiKSBlcnJvci5cIlxuICAgICAgICBAXG5cbiAgICBjb3B5OiAoY29sb3IpIC0+XG4gICAgICAgIEByID0gY29sb3IuclxuICAgICAgICBAZyA9IGNvbG9yLmdcbiAgICAgICAgQGIgPSBjb2xvci5iXG4gICAgICAgIEBhID0gY29sb3IuYVxuICAgICAgICBAXG5cbiAgICBzZXRSR0I6IChyLCBnLCBiKSAtPlxuICAgICAgICBAciA9IHBhcnNlSW50IHJcbiAgICAgICAgQGcgPSBwYXJzZUludCBnXG4gICAgICAgIEBiID0gcGFyc2VJbnQgYlxuICAgICAgICBAYSA9IDFcbiAgICAgICAgQFxuXG4gICAgc2V0UkdCQTogKHIsIGcsIGIsIGEpIC0+XG4gICAgICAgIEByID0gcGFyc2VJbnQgclxuICAgICAgICBAZyA9IHBhcnNlSW50IGdcbiAgICAgICAgQGIgPSBwYXJzZUludCBiXG4gICAgICAgIEBhID0gY2xhbXBBbHBoYSBwYXJzZUZsb2F0IGFcbiAgICAgICAgQFxuXG4gICAgdG9SR0I6IC0+XG4gICAgICAgIFwicmdiKCN7IEByIH0sICN7IEBnIH0sICN7IEBiIH0pXCJcblxuICAgIHRvUkdCQTogLT5cbiAgICAgICAgXCJyZ2JhKCN7IEByIH0sICN7IEBnIH0sICN7IEBiIH0sICN7IEBhIH0pXCJcblxuXG4gICAgIyBQcml2YXRlIGZ1bmN0aW9uc1xuXG4gICAgY2xhbXBBbHBoYSA9IChhKSAtPiBCdS5jbGFtcCBhLCAwLCAxXG5cblxuICAgICMgUHJpdmF0ZSB2YXJpYWJsZXNcblxuICAgIFJFX1JHQiA9IC9yZ2JcXChcXHMqKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxccypcXCkvaVxuICAgIFJFX1JHQkEgPSAvcmdiYVxcKFxccyooXFxkKyksXFxzKihcXGQrKSxcXHMqKFxcZCspXFxzKixcXHMqKFsuXFxkXSspXFxzKlxcKS9pXG4gICAgUkVfUkdCX1BFUiA9IC9yZ2JcXChcXHMqKFxcZCspJSxcXHMqKFxcZCspJSxcXHMqKFxcZCspJVxccypcXCkvaVxuICAgIFJFX1JHQkFfUEVSID0gL3JnYmFcXChcXHMqKFxcZCspJSxcXHMqKFxcZCspJSxcXHMqKFxcZCspJVxccyosXFxzKihbLlxcZF0rKVxccypcXCkvaVxuICAgIFJFX0hFWDMgPSAvIyhbMC05QS1GXXszfSlcXHMqJC9pXG4gICAgUkVfSEVYNiA9IC8jKFswLTlBLUZdezZ9KVxccyokL2lcbiAgICBDU1MzX0NPTE9SUyA9XG4gICAgICAgIHRyYW5zcGFyZW50OiBbMCwgMCwgMCwgMF1cblxuICAgICAgICBhbGljZWJsdWU6IFsyNDAsIDI0OCwgMjU1XVxuICAgICAgICBhbnRpcXVld2hpdGU6IFsyNTAsIDIzNSwgMjE1XVxuICAgICAgICBhcXVhOiBbMCwgMjU1LCAyNTVdXG4gICAgICAgIGFxdWFtYXJpbmU6IFsxMjcsIDI1NSwgMjEyXVxuICAgICAgICBhenVyZTogWzI0MCwgMjU1LCAyNTVdXG4gICAgICAgIGJlaWdlOiBbMjQ1LCAyNDUsIDIyMF1cbiAgICAgICAgYmlzcXVlOiBbMjU1LCAyMjgsIDE5Nl1cbiAgICAgICAgYmxhY2s6IFswLCAwLCAwXVxuICAgICAgICBibGFuY2hlZGFsbW9uZDogWzI1NSwgMjM1LCAyMDVdXG4gICAgICAgIGJsdWU6IFswLCAwLCAyNTVdXG4gICAgICAgIGJsdWV2aW9sZXQ6IFsxMzgsIDQzLCAyMjZdXG4gICAgICAgIGJyb3duOiBbMTY1LCA0MiwgNDJdXG4gICAgICAgIGJ1cmx5d29vZDogWzIyMiwgMTg0LCAxMzVdXG4gICAgICAgIGNhZGV0Ymx1ZTogWzk1LCAxNTgsIDE2MF1cbiAgICAgICAgY2hhcnRyZXVzZTogWzEyNywgMjU1LCAwXVxuICAgICAgICBjaG9jb2xhdGU6IFsyMTAsIDEwNSwgMzBdXG4gICAgICAgIGNvcmFsOiBbMjU1LCAxMjcsIDgwXVxuICAgICAgICBjb3JuZmxvd2VyYmx1ZTogWzEwMCwgMTQ5LCAyMzddXG4gICAgICAgIGNvcm5zaWxrOiBbMjU1LCAyNDgsIDIyMF1cbiAgICAgICAgY3JpbXNvbjogWzIyMCwgMjAsIDYwXVxuICAgICAgICBjeWFuOiBbMCwgMjU1LCAyNTVdXG4gICAgICAgIGRhcmtibHVlOiBbMCwgMCwgMTM5XVxuICAgICAgICBkYXJrY3lhbjogWzAsIDEzOSwgMTM5XVxuICAgICAgICBkYXJrZ29sZGVucm9kOiBbMTg0LCAxMzQsIDExXVxuICAgICAgICBkYXJrZ3JheTogWzE2OSwgMTY5LCAxNjldXG4gICAgICAgIGRhcmtncmVlbjogWzAsIDEwMCwgMF1cbiAgICAgICAgZGFya2dyZXk6IFsxNjksIDE2OSwgMTY5XVxuICAgICAgICBkYXJra2hha2k6IFsxODksIDE4MywgMTA3XVxuICAgICAgICBkYXJrbWFnZW50YTogWzEzOSwgMCwgMTM5XVxuICAgICAgICBkYXJrb2xpdmVncmVlbjogWzg1LCAxMDcsIDQ3XVxuICAgICAgICBkYXJrb3JhbmdlOiBbMjU1LCAxNDAsIDBdXG4gICAgICAgIGRhcmtvcmNoaWQ6IFsxNTMsIDUwLCAyMDRdXG4gICAgICAgIGRhcmtyZWQ6IFsxMzksIDAsIDBdXG4gICAgICAgIGRhcmtzYWxtb246IFsyMzMsIDE1MCwgMTIyXVxuICAgICAgICBkYXJrc2VhZ3JlZW46IFsxNDMsIDE4OCwgMTQzXVxuICAgICAgICBkYXJrc2xhdGVibHVlOiBbNzIsIDYxLCAxMzldXG4gICAgICAgIGRhcmtzbGF0ZWdyYXk6IFs0NywgNzksIDc5XVxuICAgICAgICBkYXJrc2xhdGVncmV5OiBbNDcsIDc5LCA3OV1cbiAgICAgICAgZGFya3R1cnF1b2lzZTogWzAsIDIwNiwgMjA5XVxuICAgICAgICBkYXJrdmlvbGV0OiBbMTQ4LCAwLCAyMTFdXG4gICAgICAgIGRlZXBwaW5rOiBbMjU1LCAyMCwgMTQ3XVxuICAgICAgICBkZWVwc2t5Ymx1ZTogWzAsIDE5MSwgMjU1XVxuICAgICAgICBkaW1ncmF5OiBbMTA1LCAxMDUsIDEwNV1cbiAgICAgICAgZGltZ3JleTogWzEwNSwgMTA1LCAxMDVdXG4gICAgICAgIGRvZGdlcmJsdWU6IFszMCwgMTQ0LCAyNTVdXG4gICAgICAgIGZpcmVicmljazogWzE3OCwgMzQsIDM0XVxuICAgICAgICBmbG9yYWx3aGl0ZTogWzI1NSwgMjUwLCAyNDBdXG4gICAgICAgIGZvcmVzdGdyZWVuOiBbMzQsIDEzOSwgMzRdXG4gICAgICAgIGZ1Y2hzaWE6IFsyNTUsIDAsIDI1NV1cbiAgICAgICAgZ2FpbnNib3JvOiBbMjIwLCAyMjAsIDIyMF1cbiAgICAgICAgZ2hvc3R3aGl0ZTogWzI0OCwgMjQ4LCAyNTVdXG4gICAgICAgIGdvbGQ6IFsyNTUsIDIxNSwgMF1cbiAgICAgICAgZ29sZGVucm9kOiBbMjE4LCAxNjUsIDMyXVxuICAgICAgICBncmF5OiBbMTI4LCAxMjgsIDEyOF1cbiAgICAgICAgZ3JlZW46IFswLCAxMjgsIDBdXG4gICAgICAgIGdyZWVueWVsbG93OiBbMTczLCAyNTUsIDQ3XVxuICAgICAgICBncmV5OiBbMTI4LCAxMjgsIDEyOF1cbiAgICAgICAgaG9uZXlkZXc6IFsyNDAsIDI1NSwgMjQwXVxuICAgICAgICBob3RwaW5rOiBbMjU1LCAxMDUsIDE4MF1cbiAgICAgICAgaW5kaWFucmVkOiBbMjA1LCA5MiwgOTJdXG4gICAgICAgIGluZGlnbzogWzc1LCAwLCAxMzBdXG4gICAgICAgIGl2b3J5OiBbMjU1LCAyNTUsIDI0MF1cbiAgICAgICAga2hha2k6IFsyNDAsIDIzMCwgMTQwXVxuICAgICAgICBsYXZlbmRlcjogWzIzMCwgMjMwLCAyNTBdXG4gICAgICAgIGxhdmVuZGVyYmx1c2g6IFsyNTUsIDI0MCwgMjQ1XVxuICAgICAgICBsYXduZ3JlZW46IFsxMjQsIDI1MiwgMF1cbiAgICAgICAgbGVtb25jaGlmZm9uOiBbMjU1LCAyNTAsIDIwNV1cbiAgICAgICAgbGlnaHRibHVlOiBbMTczLCAyMTYsIDIzMF1cbiAgICAgICAgbGlnaHRjb3JhbDogWzI0MCwgMTI4LCAxMjhdXG4gICAgICAgIGxpZ2h0Y3lhbjogWzIyNCwgMjU1LCAyNTVdXG4gICAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiBbMjUwLCAyNTAsIDIxMF1cbiAgICAgICAgbGlnaHRncmF5OiBbMjExLCAyMTEsIDIxMV1cbiAgICAgICAgbGlnaHRncmVlbjogWzE0NCwgMjM4LCAxNDRdXG4gICAgICAgIGxpZ2h0Z3JleTogWzIxMSwgMjExLCAyMTFdXG4gICAgICAgIGxpZ2h0cGluazogWzI1NSwgMTgyLCAxOTNdXG4gICAgICAgIGxpZ2h0c2FsbW9uOiBbMjU1LCAxNjAsIDEyMl1cbiAgICAgICAgbGlnaHRzZWFncmVlbjogWzMyLCAxNzgsIDE3MF1cbiAgICAgICAgbGlnaHRza3libHVlOiBbMTM1LCAyMDYsIDI1MF1cbiAgICAgICAgbGlnaHRzbGF0ZWdyYXk6IFsxMTksIDEzNiwgMTUzXVxuICAgICAgICBsaWdodHNsYXRlZ3JleTogWzExOSwgMTM2LCAxNTNdXG4gICAgICAgIGxpZ2h0c3RlZWxibHVlOiBbMTc2LCAxOTYsIDIyMl1cbiAgICAgICAgbGlnaHR5ZWxsb3c6IFsyNTUsIDI1NSwgMjI0XVxuICAgICAgICBsaW1lOiBbMCwgMjU1LCAwXVxuICAgICAgICBsaW1lZ3JlZW46IFs1MCwgMjA1LCA1MF1cbiAgICAgICAgbGluZW46IFsyNTAsIDI0MCwgMjMwXVxuICAgICAgICBtYWdlbnRhOiBbMjU1LCAwLCAyNTVdXG4gICAgICAgIG1hcm9vbjogWzEyOCwgMCwgMF1cbiAgICAgICAgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwgMjA1LCAxNzBdXG4gICAgICAgIG1lZGl1bWJsdWU6IFswLCAwLCAyMDVdXG4gICAgICAgIG1lZGl1bW9yY2hpZDogWzE4NiwgODUsIDIxMV1cbiAgICAgICAgbWVkaXVtcHVycGxlOiBbMTQ3LCAxMTIsIDIxOV1cbiAgICAgICAgbWVkaXVtc2VhZ3JlZW46IFs2MCwgMTc5LCAxMTNdXG4gICAgICAgIG1lZGl1bXNsYXRlYmx1ZTogWzEyMywgMTA0LCAyMzhdXG4gICAgICAgIG1lZGl1bXNwcmluZ2dyZWVuOiBbMCwgMjUwLCAxNTRdXG4gICAgICAgIG1lZGl1bXR1cnF1b2lzZTogWzcyLCAyMDksIDIwNF1cbiAgICAgICAgbWVkaXVtdmlvbGV0cmVkOiBbMTk5LCAyMSwgMTMzXVxuICAgICAgICBtaWRuaWdodGJsdWU6IFsyNSwgMjUsIDExMl1cbiAgICAgICAgbWludGNyZWFtOiBbMjQ1LCAyNTUsIDI1MF1cbiAgICAgICAgbWlzdHlyb3NlOiBbMjU1LCAyMjgsIDIyNV1cbiAgICAgICAgbW9jY2FzaW46IFsyNTUsIDIyOCwgMTgxXVxuICAgICAgICBuYXZham93aGl0ZTogWzI1NSwgMjIyLCAxNzNdXG4gICAgICAgIG5hdnk6IFswLCAwLCAxMjhdXG4gICAgICAgIG9sZGxhY2U6IFsyNTMsIDI0NSwgMjMwXVxuICAgICAgICBvbGl2ZTogWzEyOCwgMTI4LCAwXVxuICAgICAgICBvbGl2ZWRyYWI6IFsxMDcsIDE0MiwgMzVdXG4gICAgICAgIG9yYW5nZTogWzI1NSwgMTY1LCAwXVxuICAgICAgICBvcmFuZ2VyZWQ6IFsyNTUsIDY5LCAwXVxuICAgICAgICBvcmNoaWQ6IFsyMTgsIDExMiwgMjE0XVxuICAgICAgICBwYWxlZ29sZGVucm9kOiBbMjM4LCAyMzIsIDE3MF1cbiAgICAgICAgcGFsZWdyZWVuOiBbMTUyLCAyNTEsIDE1Ml1cbiAgICAgICAgcGFsZXR1cnF1b2lzZTogWzE3NSwgMjM4LCAyMzhdXG4gICAgICAgIHBhbGV2aW9sZXRyZWQ6IFsyMTksIDExMiwgMTQ3XVxuICAgICAgICBwYXBheWF3aGlwOiBbMjU1LCAyMzksIDIxM11cbiAgICAgICAgcGVhY2hwdWZmOiBbMjU1LCAyMTgsIDE4NV1cbiAgICAgICAgcGVydTogWzIwNSwgMTMzLCA2M11cbiAgICAgICAgcGluazogWzI1NSwgMTkyLCAyMDNdXG4gICAgICAgIHBsdW06IFsyMjEsIDE2MCwgMjIxXVxuICAgICAgICBwb3dkZXJibHVlOiBbMTc2LCAyMjQsIDIzMF1cbiAgICAgICAgcHVycGxlOiBbMTI4LCAwLCAxMjhdXG4gICAgICAgIHJlZDogWzI1NSwgMCwgMF1cbiAgICAgICAgcm9zeWJyb3duOiBbMTg4LCAxNDMsIDE0M11cbiAgICAgICAgcm95YWxibHVlOiBbNjUsIDEwNSwgMjI1XVxuICAgICAgICBzYWRkbGVicm93bjogWzEzOSwgNjksIDE5XVxuICAgICAgICBzYWxtb246IFsyNTAsIDEyOCwgMTE0XVxuICAgICAgICBzYW5keWJyb3duOiBbMjQ0LCAxNjQsIDk2XVxuICAgICAgICBzZWFncmVlbjogWzQ2LCAxMzksIDg3XVxuICAgICAgICBzZWFzaGVsbDogWzI1NSwgMjQ1LCAyMzhdXG4gICAgICAgIHNpZW5uYTogWzE2MCwgODIsIDQ1XVxuICAgICAgICBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXVxuICAgICAgICBza3libHVlOiBbMTM1LCAyMDYsIDIzNV1cbiAgICAgICAgc2xhdGVibHVlOiBbMTA2LCA5MCwgMjA1XVxuICAgICAgICBzbGF0ZWdyYXk6IFsxMTIsIDEyOCwgMTQ0XVxuICAgICAgICBzbGF0ZWdyZXk6IFsxMTIsIDEyOCwgMTQ0XVxuICAgICAgICBzbm93OiBbMjU1LCAyNTAsIDI1MF1cbiAgICAgICAgc3ByaW5nZ3JlZW46IFswLCAyNTUsIDEyN11cbiAgICAgICAgc3RlZWxibHVlOiBbNzAsIDEzMCwgMTgwXVxuICAgICAgICB0YW46IFsyMTAsIDE4MCwgMTQwXVxuICAgICAgICB0ZWFsOiBbMCwgMTI4LCAxMjhdXG4gICAgICAgIHRoaXN0bGU6IFsyMTYsIDE5MSwgMjE2XVxuICAgICAgICB0b21hdG86IFsyNTUsIDk5LCA3MV1cbiAgICAgICAgdHVycXVvaXNlOiBbNjQsIDIyNCwgMjA4XVxuICAgICAgICB2aW9sZXQ6IFsyMzgsIDEzMCwgMjM4XVxuICAgICAgICB3aGVhdDogWzI0NSwgMjIyLCAxNzldXG4gICAgICAgIHdoaXRlOiBbMjU1LCAyNTUsIDI1NV1cbiAgICAgICAgd2hpdGVzbW9rZTogWzI0NSwgMjQ1LCAyNDVdXG4gICAgICAgIHllbGxvdzogWzI1NSwgMjU1LCAwXVxuICAgICAgICB5ZWxsb3dncmVlbjogWzE1NCwgMjA1LCA1MF1cbiIsIiMgdGhlIHNpemUgb2YgcmVjdGFuZ2xlLCBCb3VuZHMgZXRjLlxyXG5cclxuY2xhc3MgQnUuU2l6ZVxyXG5cdGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG5cdFx0QHR5cGUgPSAnU2l6ZSdcclxuXHJcblx0c2V0OiAod2lkdGgsIGhlaWdodCkgLT5cclxuXHRcdEB3aWR0aCA9IHdpZHRoXHJcblx0XHRAaGVpZ2h0ID0gaGVpZ2h0XHJcbiIsIiMgMmQgdmVjdG9yXHJcblxyXG5jbGFzcyBCdS5WZWN0b3JcclxuXHJcblx0Y29uc3RydWN0b3I6IChAeCA9IDAsIEB5ID0gMCkgLT5cclxuXHJcblx0c2V0OiAoQHgsIEB5KSAtPlxyXG4iLCIjIEFkZCBjb2xvciB0byB0aGUgc2hhcGVzXHJcblxyXG5CdS5Db2xvcmZ1bCA9ICgpIC0+XHJcblx0QHN0cm9rZVN0eWxlID0gQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVcclxuXHRAZmlsbFN0eWxlID0gQnUuREVGQVVMVF9GSUxMX1NUWUxFXHJcblx0QGRhc2hTdHlsZSA9IGZhbHNlXHJcblxyXG5cdEBsaW5lV2lkdGggPSAxXHJcblx0QGRhc2hPZmZzZXQgPSAwXHJcblxyXG5cdEBzdHJva2UgPSAodikgLT5cclxuXHRcdHYgPSB0cnVlIGlmIG5vdCB2P1xyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiB0cnVlIHRoZW4gQHN0cm9rZVN0eWxlID0gQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBzdHJva2VTdHlsZSA9IG51bGxcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBzdHJva2VTdHlsZSA9IHZcclxuXHRcdEBcclxuXHJcblx0QGZpbGwgPSAodikgLT5cclxuXHRcdHYgPSB0cnVlIGlmIG5vdCB2P1xyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBmaWxsU3R5bGUgPSBudWxsXHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBmaWxsU3R5bGUgPSBCdS5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBmaWxsU3R5bGUgPSB2XHJcblx0XHRAXHJcblxyXG5cdEBkYXNoID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSBpZiBub3Qgdj9cclxuXHRcdHYgPSBbdiwgdl0gaWYgdHlwZW9mIHYgaXMgJ251bWJlcidcclxuXHRcdHN3aXRjaCB2XHJcblx0XHRcdHdoZW4gZmFsc2UgdGhlbiBAZGFzaFN0eWxlID0gbnVsbFxyXG5cdFx0XHR3aGVuIHRydWUgdGhlbiBAZGFzaFN0eWxlID0gQnUuREVGQVVMVF9EQVNIX1NUWUxFXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAZGFzaFN0eWxlID0gdlxyXG5cdFx0QFxyXG4iLCIjIGFkZCBldmVudCBsaXN0ZW5lciB0byBjdXN0b20gb2JqZWN0c1xyXG5CdS5FdmVudCA9IC0+XHJcblx0dHlwZXMgPSB7fVxyXG5cclxuXHRAb24gPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lcnMgPSB0eXBlc1t0eXBlXSBvcj0gW11cclxuXHRcdGxpc3RlbmVycy5wdXNoIGxpc3RlbmVyIGlmIGxpc3RlbmVycy5pbmRleE9mIGxpc3RlbmVyID09IC0xXHJcblxyXG5cdEBvbmNlID0gKHR5cGUsIGxpc3RlbmVyKSAtPlxyXG5cdFx0bGlzdGVuZXIub25jZSA9IHRydWVcclxuXHRcdEBvbiB0eXBlLCBsaXN0ZW5lclxyXG5cclxuXHRAb2ZmID0gKHR5cGUsIGxpc3RlbmVyKSAtPlxyXG5cdFx0bGlzdGVuZXJzID0gdHlwZXNbdHlwZV1cclxuXHRcdGlmIGxpc3RlbmVyP1xyXG5cdFx0XHRpZiBsaXN0ZW5lcnM/XHJcblx0XHRcdFx0aW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiBsaXN0ZW5lclxyXG5cdFx0XHRcdGxpc3RlbmVycy5zcGxpY2UgaW5kZXgsIDEgaWYgaW5kZXggPiAtMVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRsaXN0ZW5lcnMubGVuZ3RoID0gMCBpZiBsaXN0ZW5lcnM/XHJcblxyXG5cdEB0cmlnZ2VyID0gKHR5cGUsIGV2ZW50RGF0YSkgLT5cclxuXHRcdGxpc3RlbmVycyA9IHR5cGVzW3R5cGVdXHJcblxyXG5cdFx0aWYgbGlzdGVuZXJzP1xyXG5cdFx0XHRldmVudERhdGEgb3I9IHt9XHJcblx0XHRcdGV2ZW50RGF0YS50YXJnZXQgPSBAXHJcblx0XHRcdGZvciBsaXN0ZW5lciBpbiBsaXN0ZW5lcnNcclxuXHRcdFx0XHRsaXN0ZW5lci5jYWxsIHRoaXMsIGV2ZW50RGF0YVxyXG5cdFx0XHRcdGlmIGxpc3RlbmVyLm9uY2VcclxuXHRcdFx0XHRcdGxpc3RlbmVycy5zcGxpY2UgaSwgMVxyXG5cdFx0XHRcdFx0aSAtPSAxXHJcbiIsIiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgTWljcm9KUXVlcnkgLSBBIG1pY3JvIHZlcnNpb24gb2YgalF1ZXJ5XHJcbiNcclxuIyBTdXBwb3J0ZWQgZmVhdHVyZXM6XHJcbiMgICAkLiAtIHN0YXRpYyBtZXRob2RzXHJcbiMgICAgIC5yZWFkeShjYikgLSBjYWxsIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBhZnRlciB0aGUgcGFnZSBpcyBsb2FkZWRcclxuIyAgICAgLmFqYXgoW3VybCxdIG9wdGlvbnMpIC0gcGVyZm9ybSBhbiBhamF4IHJlcXVlc3RcclxuIyAgICQoc2VsZWN0b3IpIC0gc2VsZWN0IGVsZW1lbnQocylcclxuIyAgICAgLm9uKHR5cGUsIGNhbGxiYWNrKSAtIGFkZCBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAub2ZmKHR5cGUsIGNhbGxiYWNrKSAtIHJlbW92ZSBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAuYXBwZW5kKHRhZ05hbWUpIC0gYXBwZW5kIGEgdGFnXHJcbiMgICAgIC50ZXh0KHRleHQpIC0gc2V0IHRoZSBpbm5lciB0ZXh0XHJcbiMgICAgIC5odG1sKGh0bWxUZXh0KSAtIHNldCB0aGUgaW5uZXIgSFRNTFxyXG4jICAgICAuc3R5bGUobmFtZSwgdmFsdWUpIC0gc2V0IHN0eWxlIChhIGNzcyBhdHRyaWJ1dGUpXHJcbiMgICAgICMuY3NzKG9iamVjdCkgLSBzZXQgc3R5bGVzIChtdWx0aXBsZSBjc3MgYXR0cmlidXRlKVxyXG4jICAgICAuaGFzQ2xhc3MoY2xhc3NOYW1lKSAtIGRldGVjdCB3aGV0aGVyIGEgY2xhc3MgZXhpc3RzXHJcbiMgICAgIC5hZGRDbGFzcyhjbGFzc05hbWUpIC0gYWRkIGEgY2xhc3NcclxuIyAgICAgLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSkgLSByZW1vdmUgYSBjbGFzc1xyXG4jICAgICAudG9nZ2xlQ2xhc3MoY2xhc3NOYW1lKSAtIHRvZ2dsZSBhIGNsYXNzXHJcbiMgICAgIC5hdHRyKG5hbWUsIHZhbHVlKSAtIHNldCBhbiBhdHRyaWJ1dGVcclxuIyAgICAgLmhhc0F0dHIobmFtZSkgLSBkZXRlY3Qgd2hldGhlciBhbiBhdHRyaWJ1dGUgZXhpc3RzXHJcbiMgICAgIC5yZW1vdmVBdHRyKG5hbWUpIC0gcmVtb3ZlIGFuIGF0dHJpYnV0ZVxyXG4jICAgTm90ZXM6XHJcbiMgICAgICAgICMgaXMgcGxhbm5lZCBidXQgbm90IGltcGxlbWVudGVkXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oKGdsb2JhbCkgLT5cclxuXHJcblx0IyBzZWxlY3RvclxyXG5cdGdsb2JhbC4kID0gKHNlbGVjdG9yKSAtPlxyXG5cdFx0c2VsZWN0aW9ucyA9IFtdXHJcblx0XHRpZiB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZydcclxuXHRcdFx0c2VsZWN0aW9ucyA9IFtdLnNsaWNlLmNhbGwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCBzZWxlY3RvclxyXG5cdFx0alF1ZXJ5LmFwcGx5IHNlbGVjdGlvbnNcclxuXHRcdHNlbGVjdGlvbnNcclxuXHJcblx0alF1ZXJ5ID0gLT5cclxuXHJcblx0XHQjIGV2ZW50XHJcblx0XHRAb24gPSAodHlwZSwgY2FsbGJhY2spID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2tcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBvZmYgPSAodHlwZSwgY2FsbGJhY2spID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2tcclxuXHRcdFx0QFxyXG5cclxuXHRcdCMgRE9NIE1hbmlwdWxhdGlvblxyXG5cclxuXHRcdFNWR19UQUdTID0gJ3N2ZyBsaW5lIHJlY3QgY2lyY2xlIGVsbGlwc2UgcG9seWxpbmUgcG9seWdvbiBwYXRoIHRleHQnXHJcblxyXG5cdFx0QGFwcGVuZCA9ICh0YWcpID0+XHJcblx0XHRcdEBlYWNoIChkb20sIGkpID0+XHJcblx0XHRcdFx0dGFnSW5kZXggPSBTVkdfVEFHUy5pbmRleE9mIHRhZy50b0xvd2VyQ2FzZSgpXHJcblx0XHRcdFx0aWYgdGFnSW5kZXggPiAtMVxyXG5cdFx0XHRcdFx0bmV3RG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG5ld0RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgdGFnXHJcblx0XHRcdFx0QFtpXSA9IGRvbS5hcHBlbmRDaGlsZCBuZXdEb21cclxuXHRcdFx0QFxyXG5cclxuXHRcdEB0ZXh0ID0gKHN0cikgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20udGV4dENvbnRlbnQgPSBzdHJcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBodG1sID0gKHN0cikgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20uaW5uZXJIVE1MID0gc3RyXHJcblx0XHRcdEBcclxuXHJcblx0XHRAc3R5bGUgPSAobmFtZSwgdmFsdWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0c3R5bGVUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnc3R5bGUnXHJcblx0XHRcdFx0c3R5bGVzID0ge31cclxuXHRcdFx0XHRpZiBzdHlsZVRleHRcclxuXHRcdFx0XHRcdHN0eWxlVGV4dC5zcGxpdCgnOycpLmVhY2ggKG4pIC0+XHJcblx0XHRcdFx0XHRcdG52ID0gbi5zcGxpdCAnOidcclxuXHRcdFx0XHRcdFx0c3R5bGVzW252WzBdXSA9IG52WzFdXHJcblx0XHRcdFx0c3R5bGVzW25hbWVdID0gdmFsdWVcclxuXHRcdFx0XHQjIGNvbmNhdFxyXG5cdFx0XHRcdHN0eWxlVGV4dCA9ICcnXHJcblx0XHRcdFx0Zm9yIGkgb2Ygc3R5bGVzXHJcblx0XHRcdFx0XHRzdHlsZVRleHQgKz0gaSArICc6ICcgKyBzdHlsZXNbaV0gKyAnOyAnXHJcblx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZSAnc3R5bGUnLCBzdHlsZVRleHRcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBoYXNDbGFzcyA9IChuYW1lKSA9PlxyXG5cdFx0XHRpZiBAbGVuZ3RoID09IDBcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0IyBpZiBtdWx0aXBsZSwgZXZlcnkgRE9NIHNob3VsZCBoYXZlIHRoZSBjbGFzc1xyXG5cdFx0XHRpID0gMFxyXG5cdFx0XHR3aGlsZSBpIDwgQGxlbmd0aFxyXG5cdFx0XHRcdGNsYXNzVGV4dCA9IEBbaV0uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHQjIG5vdCB1c2UgJyAnIHRvIGF2b2lkIG11bHRpcGxlIHNwYWNlcyBsaWtlICdhICAgYidcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgIWNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdFx0aSsrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAYWRkQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRjbGFzc1RleHQgPSBkb20uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgbm90IGNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoIG5hbWVcclxuXHRcdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ2NsYXNzJywgY2xhc3Nlcy5qb2luICcgJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHJlbW92ZUNsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSBvciAnJ1xyXG5cdFx0XHRcdGNsYXNzZXMgPSBjbGFzc1RleHQuc3BsaXQgUmVnRXhwICcgKydcclxuXHRcdFx0XHRpZiBjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdGNsYXNzZXMucmVtb3ZlIG5hbWVcclxuXHRcdFx0XHRcdGlmIGNsYXNzZXMubGVuZ3RoID4gMFxyXG5cdFx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZSAnY2xhc3MnXHJcblx0XHRcdEBcclxuXHJcblx0XHRAdG9nZ2xlQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRjbGFzc1RleHQgPSBkb20uZ2V0QXR0cmlidXRlICdjbGFzcycgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5jb250YWlucyBuYW1lXHJcblx0XHRcdFx0XHRjbGFzc2VzLnJlbW92ZSBuYW1lXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoIG5hbWVcclxuXHRcdFx0XHRpZiBjbGFzc2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ2NsYXNzJywgY2xhc3Nlcy5qb2luICcgJ1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgJ2NsYXNzJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGF0dHIgPSAobmFtZSwgdmFsdWUpID0+XHJcblx0XHRcdGlmIHZhbHVlP1xyXG5cdFx0XHRcdEBlYWNoIChkb20pIC0+IGRvbS5zZXRBdHRyaWJ1dGUgbmFtZSwgdmFsdWVcclxuXHRcdFx0XHRyZXR1cm4gQFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0cmV0dXJuIEBbMF0uZ2V0QXR0cmlidXRlIG5hbWVcclxuXHJcblx0XHRAaGFzQXR0ciA9IChuYW1lKSA9PlxyXG5cdFx0XHRpZiBAbGVuZ3RoID09IDBcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0aSA9IDBcclxuXHRcdFx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdFx0XHRpZiBub3QgQFtpXS5oYXNBdHRyaWJ1dGUgbmFtZVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdFx0aSsrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAcmVtb3ZlQXR0ciA9IChuYW1lKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgbmFtZVxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHZhbCA9ID0+IEBbMF0/LnZhbHVlXHJcblxyXG5cdCMgJC5yZWFkeSgpXHJcblx0Z2xvYmFsLiQucmVhZHkgPSAob25Mb2FkKSAtPlxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnRE9NQ29udGVudExvYWRlZCcsIG9uTG9hZFxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgJC5hamF4KClcclxuXHQjXHRvcHRpb25zOlxyXG5cdCNcdFx0dXJsOiBzdHJpbmdcclxuXHQjXHRcdD09PT1cclxuXHQjXHRcdGFzeW5jID0gdHJ1ZTogYm9vbFxyXG5cdCNcdGRhdGE6IG9iamVjdCAtIHF1ZXJ5IHBhcmFtZXRlcnMgVE9ETzogaW1wbGVtZW50IHRoaXNcclxuXHQjXHRcdG1ldGhvZCA9IEdFVDogUE9TVCwgUFVULCBERUxFVEUsIEhFQURcclxuXHQjXHRcdHVzZXJuYW1lOiBzdHJpbmdcclxuXHQjXHRcdHBhc3N3b3JkOiBzdHJpbmdcclxuXHQjXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uXHJcblx0I1x0XHRlcnJvcjogZnVuY3Rpb25cclxuXHQjXHRcdGNvbXBsZXRlOiBmdW5jdGlvblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdGdsb2JhbC4kLmFqYXggPSAodXJsLCBvcHMpIC0+XHJcblx0XHRpZiAhb3BzXHJcblx0XHRcdGlmIHR5cGVvZiB1cmwgPT0gJ29iamVjdCdcclxuXHRcdFx0XHRvcHMgPSB1cmxcclxuXHRcdFx0XHR1cmwgPSBvcHMudXJsXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRvcHMgPSB7fVxyXG5cdFx0b3BzLm1ldGhvZCBvcj0gJ0dFVCdcclxuXHRcdG9wcy5hc3luYyA9IHRydWUgdW5sZXNzIG9wcy5hc3luYz9cclxuXHJcblx0XHR4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3RcclxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG5cdFx0XHRpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XHJcblx0XHRcdFx0aWYgeGhyLnN0YXR1cyA9PSAyMDBcclxuXHRcdFx0XHRcdG9wcy5zdWNjZXNzIHhoci5yZXNwb25zZVRleHQsIHhoci5zdGF0dXMsIHhociBpZiBvcHMuc3VjY2Vzcz9cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRvcHMuZXJyb3IgeGhyLCB4aHIuc3RhdHVzIGlmIG9wcy5lcnJvcj9cclxuXHRcdFx0XHRcdG9wcy5jb21wbGV0ZSB4aHIsIHhoci5zdGF0dXMgaWYgb3BzLmNvbXBsZXRlP1xyXG5cclxuXHRcdHhoci5vcGVuIG9wcy5tZXRob2QsIHVybCwgb3BzLmFzeW5jLCBvcHMudXNlcm5hbWUsIG9wcy5wYXNzd29yZFxyXG5cdFx0eGhyLnNlbmQgbnVsbCkgQnUuZ2xvYmFsXHJcbiIsIiMgaGllcmFyY2h5IG1hbmFnZVxyXG5cclxuY2xhc3MgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6ICgpIC0+XHJcblx0XHRCdS5Db2xvcmZ1bC5hcHBseSBAXHJcblx0XHRCdS5FdmVudC5hcHBseSBAXHJcblxyXG5cdFx0QHZpc2libGUgPSB5ZXNcclxuXHRcdEBvcGFjaXR5ID0gMVxyXG5cclxuXHRcdEBwb3NpdGlvbiA9IG5ldyBCdS5WZWN0b3JcclxuXHRcdEByb3RhdGlvbiA9IDBcclxuXHRcdEBfc2NhbGUgPSBuZXcgQnUuVmVjdG9yIDEsIDFcclxuXHRcdEBza2V3ID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdCNAdG9Xb3JsZE1hdHJpeCA9IG5ldyBCdS5NYXRyaXgoKVxyXG5cdFx0I0B1cGRhdGVNYXRyaXggLT5cclxuXHJcblx0XHRAYm91bmRzID0gbnVsbCAjIGZvciBhY2NlbGVyYXRlIGNvbnRhaW4gdGVzdFxyXG5cdFx0QGtleVBvaW50cyA9IG51bGxcclxuXHRcdEBjaGlsZHJlbiA9IFtdXHJcblx0XHRAcGFyZW50ID0gbnVsbFxyXG5cclxuXHRAcHJvcGVydHkgJ3NjYWxlJyxcclxuXHRcdGdldDogLT4gQF9zY2FsZVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRpZiB0eXBlb2YgdmFsID09ICdudW1iZXInXHJcblx0XHRcdFx0QF9zY2FsZS54ID0gQF9zY2FsZS55ID0gdmFsXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAX3NjYWxlID0gdmFsXHJcblxyXG5cdGFuaW1hdGU6IChhbmltLCBhcmdzKSAtPlxyXG5cdFx0aWYgdHlwZW9mIGFuaW0gPT0gJ3N0cmluZydcclxuXHRcdFx0aWYgYW5pbSBvZiBCdS5hbmltYXRpb25zXHJcblx0XHRcdFx0QnUuYW5pbWF0aW9uc1thbmltXS5hcHBseSBALCBhcmdzXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLndhcm4gXCJCdS5hbmltYXRpb25zW1xcXCIjeyBhbmltIH1cXFwiXSBkb2Vzbid0IGV4aXN0cy5cIlxyXG5cdFx0ZWxzZSBpZiBhbmltIGluc3RhbmNlb2YgQXJyYXlcclxuXHRcdFx0YXJncyA9IFthcmdzXSB1bmxlc3MgYXJncyBpbnN0YW5jZW9mIEFycmF5XHJcblx0XHRcdEBhbmltYXRlIGFuaW1baV0sIGFyZ3MgZm9yIG93biBpIG9mIGFuaW1cclxuXHRcdGVsc2VcclxuXHRcdFx0YW5pbS5hcHBseSBALCBhcmdzXHJcblx0XHRAXHJcblxyXG5cdGNvbnRhaW5zUG9pbnQ6IChwKSAtPlxyXG5cdFx0aWYgQGJvdW5kcz8gYW5kIG5vdCBAYm91bmRzLmNvbnRhaW5zUG9pbnQgcFxyXG5cdFx0XHRyZXR1cm4gbm9cclxuXHRcdGVsc2UgaWYgQF9jb250YWluc1BvaW50XHJcblx0XHRcdHJldHVybiBAX2NvbnRhaW5zUG9pbnQgcFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gbm9cclxuIiwiIyBjYW52YXMgcmVuZGVyZXJcclxuXHJcbmNsYXNzIEJ1LlJlbmRlcmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QnUuRXZlbnQuYXBwbHkgQFxyXG5cdFx0QHR5cGUgPSAnUmVuZGVyZXInXHJcblxyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0d2lkdGg6IDgwMFxyXG5cdFx0XHRoZWlnaHQ6IDYwMFxyXG5cdFx0XHRmcHM6IDYwXHJcblx0XHRcdGZpbGxQYXJlbnQ6IG9mZlxyXG5cdFx0XHRzaG93S2V5UG9pbnRzOiBub1xyXG5cdFx0XHRiYWNrZ3JvdW5kOiAnI2VlZSdcclxuXHRcdEB3aWR0aCA9IG9wdGlvbnMud2lkdGhcclxuXHRcdEBoZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG5cdFx0QGZwcyA9IG9wdGlvbnMuZnBzXHJcblx0XHRAY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXJcclxuXHRcdEBmaWxsUGFyZW50ID0gb3B0aW9ucy5maWxsUGFyZW50XHJcblx0XHRAaXNTaG93S2V5UG9pbnRzID0gb3B0aW9ucy5zaG93S2V5UG9pbnRzXHJcblxyXG5cdFx0QHRpY2tDb3VudCA9IDBcclxuXHRcdEBpc1J1bm5pbmcgPSBub1xyXG5cclxuXHRcdEBwaXhlbFJhdGlvID0gQnUuZ2xvYmFsLmRldmljZVBpeGVsUmF0aW8gb3IgMVxyXG5cclxuXHRcdEBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0XHRAY29udGV4dCA9IEBkb20uZ2V0Q29udGV4dCAnMmQnXHJcblx0XHRAY29udGV4dC50ZXh0QmFzZWxpbmUgPSAndG9wJ1xyXG5cdFx0QGNsaXBNZXRlciA9IG5ldyBDbGlwTWV0ZXIoKSBpZiBDbGlwTWV0ZXI/XHJcblxyXG5cdFx0IyBBUElcclxuXHRcdEBzaGFwZXMgPSBbXVxyXG5cclxuXHRcdGlmIG5vdCBAZmlsbFBhcmVudFxyXG5cdFx0XHRAZG9tLnN0eWxlLndpZHRoID0gQHdpZHRoICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IEBoZWlnaHQgKyAncHgnXHJcblx0XHRcdEBkb20ud2lkdGggPSBAd2lkdGggKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAZG9tLmhlaWdodCA9IEBoZWlnaHQgKiBAcGl4ZWxSYXRpb1xyXG5cdFx0QGRvbS5zdHlsZS5jdXJzb3IgPSAnY3Jvc3NoYWlyJ1xyXG5cdFx0QGRvbS5zdHlsZS5ib3hTaXppbmcgPSAnY29udGVudC1ib3gnXHJcblx0XHRAZG9tLnN0eWxlLmJhY2tncm91bmQgPSBvcHRpb25zLmJhY2tncm91bmRcclxuXHRcdEBkb20ub25jb250ZXh0bWVudSA9IC0+IGZhbHNlXHJcblxyXG5cdFx0QnUuYW5pbWF0aW9uUnVubmVyPy5ob29rVXAgQFxyXG5cclxuXHRcdG9uUmVzaXplID0gPT5cclxuXHRcdFx0Y2FudmFzUmF0aW8gPSBAZG9tLmhlaWdodCAvIEBkb20ud2lkdGhcclxuXHRcdFx0Y29udGFpbmVyUmF0aW8gPSBAY29udGFpbmVyLmNsaWVudEhlaWdodCAvIEBjb250YWluZXIuY2xpZW50V2lkdGhcclxuXHRcdFx0aWYgY29udGFpbmVyUmF0aW8gPCBjYW52YXNSYXRpb1xyXG5cdFx0XHRcdGhlaWdodCA9IEBjb250YWluZXIuY2xpZW50SGVpZ2h0XHJcblx0XHRcdFx0d2lkdGggPSBoZWlnaHQgLyBjb250YWluZXJSYXRpb1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0d2lkdGggPSBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdFx0aGVpZ2h0ID0gd2lkdGggKiBjb250YWluZXJSYXRpb1xyXG5cdFx0XHRAd2lkdGggPSBAZG9tLndpZHRoID0gd2lkdGggKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAaGVpZ2h0ID0gQGRvbS5oZWlnaHQgPSBoZWlnaHQgKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAZG9tLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXHJcblx0XHRcdEBkb20uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xyXG5cdFx0XHRAcmVuZGVyKClcclxuXHJcblx0XHRpZiBAZmlsbFBhcmVudFxyXG5cdFx0XHRCdS5nbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIG9uUmVzaXplXHJcblx0XHRcdEBkb20uYWRkRXZlbnRMaXN0ZW5lciAnRE9NTm9kZUluc2VydGVkJywgb25SZXNpemVcclxuXHJcblxyXG5cdFx0dGljayA9ID0+XHJcblx0XHRcdGlmIEBpc1J1bm5pbmdcclxuXHRcdFx0XHRAY2xpcE1ldGVyLnN0YXJ0KCkgaWYgQGNsaXBNZXRlcj9cclxuXHRcdFx0XHRAcmVuZGVyKClcclxuXHRcdFx0XHRAdHJpZ2dlciAndXBkYXRlJywgeyd0aWNrQ291bnQnOiBAdGlja0NvdW50fVxyXG5cdFx0XHRcdEB0aWNrQ291bnQgKz0gMVxyXG5cdFx0XHRcdEBjbGlwTWV0ZXIudGljaygpIGlmIEBjbGlwTWV0ZXI/XHJcblxyXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdGlja1xyXG5cclxuXHRcdHRpY2soKVxyXG5cclxuXHRcdCMgaW5pdFxyXG5cdFx0aWYgQGNvbnRhaW5lcj9cclxuXHRcdFx0QGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgQGNvbnRhaW5lciBpZiB0eXBlb2YgQGNvbnRhaW5lciBpcyAnc3RyaW5nJ1xyXG5cdFx0XHRzZXRUaW1lb3V0ID0+XHJcblx0XHRcdFx0QGNvbnRhaW5lci5hcHBlbmRDaGlsZCBAZG9tXHJcblx0XHRcdCwgMTAwXHJcblx0XHRAaXNSdW5uaW5nID0gdHJ1ZVxyXG5cclxuXHJcblx0cGF1c2U6IC0+XHJcblx0XHRAaXNSdW5uaW5nID0gZmFsc2VcclxuXHJcblx0Y29udGludWU6IC0+XHJcblx0XHRAaXNSdW5uaW5nID0gdHJ1ZVxyXG5cclxuXHR0b2dnbGU6IC0+XHJcblx0XHRAaXNSdW5uaW5nID0gbm90IEBpc1J1bm5pbmdcclxuXHJcblx0I1x0cHJvY2Vzc0FyZ3M6IChlKSAtPlxyXG5cdCNcdFx0b2Zmc2V0WDogZS5vZmZzZXRYICogQHBpeGVsUmF0aW9cclxuXHQjXHRcdG9mZnNldFk6IGUub2Zmc2V0WSAqIEBwaXhlbFJhdGlvXHJcblx0I1x0XHRidXR0b246IGUuYnV0dG9uXHJcblxyXG5cdGFkZDogKHNoYXBlKSAtPlxyXG5cdFx0aWYgc2hhcGUgaW5zdGFuY2VvZiBBcnJheVxyXG5cdFx0XHRAc2hhcGVzLnB1c2ggcyBmb3IgcyBpbiBzaGFwZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAc2hhcGVzLnB1c2ggc2hhcGVcclxuXHRcdEBcclxuXHJcblx0cmVtb3ZlOiAoc2hhcGUpIC0+XHJcblx0XHRpbmRleCA9IEBzaGFwZXMuaW5kZXhPZiBzaGFwZVxyXG5cdFx0QHNoYXBlcy5zcGxpY2UgaW5kZXgsIDEgaWYgaW5kZXggPiAtMVxyXG5cdFx0QFxyXG5cclxuXHRyZW5kZXI6IC0+XHJcblx0XHRAY29udGV4dC5zYXZlKClcclxuXHRcdEBjb250ZXh0LnNjYWxlIEBwaXhlbFJhdGlvLCBAcGl4ZWxSYXRpb1xyXG5cdFx0QGNsZWFyQ2FudmFzKClcclxuXHRcdEBkcmF3U2hhcGVzIEBzaGFwZXNcclxuXHRcdEBjb250ZXh0LnJlc3RvcmUoKVxyXG5cdFx0QFxyXG5cclxuXHRjbGVhckNhbnZhczogLT5cclxuXHRcdEBjb250ZXh0LmNsZWFyUmVjdCAwLCAwLCBAd2lkdGgsIEBoZWlnaHRcclxuXHRcdEBcclxuXHJcblx0ZHJhd1NoYXBlczogKHNoYXBlcykgPT5cclxuXHRcdGlmIHNoYXBlcz9cclxuXHRcdFx0Zm9yIHNoYXBlIGluIHNoYXBlc1xyXG5cdFx0XHRcdEBjb250ZXh0LnNhdmUoKVxyXG5cdFx0XHRcdEBkcmF3U2hhcGUgc2hhcGVcclxuXHRcdFx0XHRAY29udGV4dC5yZXN0b3JlKClcclxuXHRcdEBcclxuXHJcblx0ZHJhd1NoYXBlOiAoc2hhcGUpID0+XHJcblx0XHRyZXR1cm4gQCB1bmxlc3Mgc2hhcGUudmlzaWJsZVxyXG5cclxuXHRcdEBjb250ZXh0LnRyYW5zbGF0ZSBzaGFwZS5wb3NpdGlvbi54LCBzaGFwZS5wb3NpdGlvbi55XHJcblx0XHRAY29udGV4dC5yb3RhdGUgc2hhcGUucm90YXRpb25cclxuXHRcdHN4ID0gc2hhcGUuc2NhbGUueFxyXG5cdFx0c3kgPSBzaGFwZS5zY2FsZS55XHJcblx0XHRpZiBzeCAvIHN5ID4gMTAwIG9yIHN4IC8gc3kgPCAwLjAxXHJcblx0XHRcdHN4ID0gMCBpZiBNYXRoLmFicyhzeCkgPCAwLjAyXHJcblx0XHRcdHN5ID0gMCBpZiBNYXRoLmFicyhzeSkgPCAwLjAyXHJcblx0XHRAY29udGV4dC5zY2FsZSBzeCwgc3lcclxuXHJcblx0XHRAY29udGV4dC5nbG9iYWxBbHBoYSAqPSBzaGFwZS5vcGFjaXR5XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzaGFwZS5zdHJva2VTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5saW5lV2lkdGggPSBzaGFwZS5saW5lV2lkdGhcclxuXHRcdFx0QGNvbnRleHQubGluZUNhcCA9IHNoYXBlLmxpbmVDYXAgaWYgc2hhcGUubGluZUNhcD9cclxuXHRcdFx0QGNvbnRleHQubGluZUpvaW4gPSBzaGFwZS5saW5lSm9pbiBpZiBzaGFwZS5saW5lSm9pbj9cclxuXHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cclxuXHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdHdoZW4gJ1BvaW50JyB0aGVuIEBkcmF3UG9pbnQgc2hhcGVcclxuXHRcdFx0d2hlbiAnTGluZScgdGhlbiBAZHJhd0xpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEBkcmF3Q2lyY2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ1RyaWFuZ2xlJyB0aGVuIEBkcmF3VHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUmVjdGFuZ2xlJyB0aGVuIEBkcmF3UmVjdGFuZ2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAZHJhd0ZhbiBzaGFwZVxyXG5cdFx0XHR3aGVuICdCb3cnIHRoZW4gQGRyYXdCb3cgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAZHJhd1BvbHlnb24gc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnIHRoZW4gQGRyYXdQb2x5bGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdTcGxpbmUnIHRoZW4gQGRyYXdTcGxpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9pbnRUZXh0JyB0aGVuIEBkcmF3UG9pbnRUZXh0IHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ltYWdlJyB0aGVuIEBkcmF3SW1hZ2Ugc2hhcGVcclxuXHRcdFx0d2hlbiAnQm91bmRzJyB0aGVuIEBkcmF3Qm91bmRzIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0dyb3VwJyAjIHRoZW4gZG8gbm90aGluZ1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5sb2cgJ2RyYXdTaGFwZXMoKTogdW5rbm93biBzaGFwZTogJywgc2hhcGVcclxuXHJcblxyXG5cdFx0aWYgc2hhcGUuZmlsbFN0eWxlP1xyXG5cdFx0XHRAY29udGV4dC5maWxsU3R5bGUgPSBzaGFwZS5maWxsU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuZmlsbCgpXHJcblxyXG5cdFx0aWYgc2hhcGUuZGFzaFN0eWxlIyBhbmQgKHNoYXBlLnR5cGUgPT0gJ1NwbGluZScgb3Igc2hhcGUudHlwZSA9PSAnUmVjdGFuZ2xlJyBhbmQgc2hhcGUuY29ybmVyUmFkaXVzID4gMClcclxuXHRcdFx0QGNvbnRleHQubGluZURhc2hPZmZzZXQgPSBzaGFwZS5kYXNoT2Zmc2V0XHJcblx0XHRcdEBjb250ZXh0LnNldExpbmVEYXNoPyBzaGFwZS5kYXNoU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlKClcclxuXHRcdFx0QGNvbnRleHQuc2V0TGluZURhc2ggW11cclxuXHRcdGVsc2UgaWYgc2hhcGUuc3Ryb2tlU3R5bGU/XHJcblx0XHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblxyXG5cdFx0QGRyYXdTaGFwZXMgc2hhcGUuY2hpbGRyZW4gaWYgc2hhcGUuY2hpbGRyZW4/XHJcblx0XHRAZHJhd1NoYXBlcyBzaGFwZS5rZXlQb2ludHMgaWYgQGlzU2hvd0tleVBvaW50c1xyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvaW50OiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUueCwgc2hhcGUueSwgQnUuUE9JTlRfUkVOREVSX1NJWkUsIDAsIE1hdGguUEkgKiAyXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3TGluZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0NpcmNsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCAwLCBNYXRoLlBJICogMlxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1RyaWFuZ2xlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzBdLngsIHNoYXBlLnBvaW50c1swXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzFdLngsIHNoYXBlLnBvaW50c1sxXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzJdLngsIHNoYXBlLnBvaW50c1syXS55XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1JlY3RhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0cmV0dXJuIEBkcmF3Um91bmRSZWN0YW5nbGUgc2hhcGUgaWYgc2hhcGUuY29ybmVyUmFkaXVzICE9IDBcclxuXHRcdEBjb250ZXh0LnJlY3Qgc2hhcGUucG9pbnRMVC54LCBzaGFwZS5wb2ludExULnksIHNoYXBlLnNpemUud2lkdGgsIHNoYXBlLnNpemUuaGVpZ2h0XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Um91bmRSZWN0YW5nbGU6IChzaGFwZSkgLT5cclxuXHRcdHgxID0gc2hhcGUucG9pbnRMVC54XHJcblx0XHR4MiA9IHNoYXBlLnBvaW50UkIueFxyXG5cdFx0eTEgPSBzaGFwZS5wb2ludExULnlcclxuXHRcdHkyID0gc2hhcGUucG9pbnRSQi55XHJcblx0XHRyID0gc2hhcGUuY29ybmVyUmFkaXVzXHJcblxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHgxLCB5MSArIHJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgxLCB5MSwgeDEgKyByLCB5MSwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgyIC0gciwgeTFcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgyLCB5MSwgeDIsIHkxICsgciwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgyLCB5MiAtIHJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgyLCB5MiwgeDIgLSByLCB5MiwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgxICsgciwgeTJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgxLCB5MiwgeDEsIHkyIC0gciwgclxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHJcblx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gc2hhcGUuZGFzaFN0eWxlIGlmIHNoYXBlLnN0cm9rZVN0eWxlPyBhbmQgc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3RmFuOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUuY3gsIHNoYXBlLmN5LCBzaGFwZS5yYWRpdXMsIHNoYXBlLmFGcm9tLCBzaGFwZS5hVG9cclxuXHRcdEBjb250ZXh0LmxpbmVUbyBzaGFwZS5jeCwgc2hhcGUuY3lcclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Qm93OiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUuY3gsIHNoYXBlLmN5LCBzaGFwZS5yYWRpdXMsIHNoYXBlLmFGcm9tLCBzaGFwZS5hVG9cclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3UG9seWdvbjogKHNoYXBlKSAtPlxyXG5cdFx0Zm9yIHBvaW50IGluIHNoYXBlLnZlcnRpY2VzXHJcblx0XHRcdEBjb250ZXh0LmxpbmVUbyBwb2ludC54LCBwb2ludC55XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvbHlsaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRmb3IgcG9pbnQgaW4gc2hhcGUudmVydGljZXNcclxuXHRcdFx0QGNvbnRleHQubGluZVRvIHBvaW50LngsIHBvaW50LnlcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdTcGxpbmU6IChzaGFwZSkgLT5cclxuXHRcdGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRsZW4gPSBzaGFwZS52ZXJ0aWNlcy5sZW5ndGhcclxuXHRcdFx0aWYgbGVuID09IDJcclxuXHRcdFx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUudmVydGljZXNbMF0ueCwgc2hhcGUudmVydGljZXNbMF0ueVxyXG5cdFx0XHRcdEBjb250ZXh0LmxpbmVUbyBzaGFwZS52ZXJ0aWNlc1sxXS54LCBzaGFwZS52ZXJ0aWNlc1sxXS55XHJcblx0XHRcdGVsc2UgaWYgbGVuID4gMlxyXG5cdFx0XHRcdEBjb250ZXh0Lm1vdmVUbyBzaGFwZS52ZXJ0aWNlc1swXS54LCBzaGFwZS52ZXJ0aWNlc1swXS55XHJcblx0XHRcdFx0Zm9yIGkgaW4gWzEuLmxlbiAtIDFdXHJcblx0XHRcdFx0XHRAY29udGV4dC5iZXppZXJDdXJ2ZVRvKFxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLmNvbnRyb2xQb2ludHNCZWhpbmRbaSAtIDFdLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQmVoaW5kW2kgLSAxXS55XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0FoZWFkW2ldLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQWhlYWRbaV0ueVxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLnZlcnRpY2VzW2ldLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS55XHJcblx0XHRcdFx0XHQpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3UG9pbnRUZXh0OiAoc2hhcGUpIC0+XHJcblx0XHRpZiB0eXBlb2Ygc2hhcGUuZm9udCA9PSAnc3RyaW5nJ1xyXG5cdFx0XHRAY29udGV4dC50ZXh0QWxpZ24gPSBzaGFwZS50ZXh0QWxpZ25cclxuXHRcdFx0QGNvbnRleHQudGV4dEJhc2VsaW5lID0gc2hhcGUudGV4dEJhc2VsaW5lXHJcblx0XHRcdEBjb250ZXh0LmZvbnQgPSBzaGFwZS5mb250XHJcblxyXG5cdFx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0XHRAY29udGV4dC5zdHJva2VUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdFx0aWYgc2hhcGUuZmlsbFN0eWxlP1xyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxTdHlsZSA9IHNoYXBlLmZpbGxTdHlsZVxyXG5cdFx0XHRcdEBjb250ZXh0LmZpbGxUZXh0IHNoYXBlLnRleHQsIHNoYXBlLngsIHNoYXBlLnlcclxuXHRcdGVsc2UgaWYgc2hhcGUuZm9udCBpbnN0YW5jZW9mIEJ1LlNwcml0ZVNoZWV0IGFuZCBzaGFwZS5mb250LnJlYWR5XHJcblx0XHRcdHRleHRXaWR0aCA9IHNoYXBlLmZvbnQubWVhc3VyZVRleHRXaWR0aCBzaGFwZS50ZXh0XHJcblx0XHRcdHhPZmZzZXQgPSBzd2l0Y2ggc2hhcGUudGV4dEFsaWduXHJcblx0XHRcdFx0d2hlbiAnbGVmdCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnY2VudGVyJyB0aGVuIC10ZXh0V2lkdGggLyAyXHJcblx0XHRcdFx0d2hlbiAncmlnaHQnIHRoZW4gLXRleHRXaWR0aFxyXG5cdFx0XHR5T2Zmc2V0ID0gc3dpdGNoIHNoYXBlLnRleHRCYXNlbGluZVxyXG5cdFx0XHRcdHdoZW4gJ3RvcCcgdGhlbiAwXHJcblx0XHRcdFx0d2hlbiAnbWlkZGxlJyB0aGVuIC1zaGFwZS5mb250LmhlaWdodCAvIDJcclxuXHRcdFx0XHR3aGVuICdib3R0b20nIHRoZW4gLXNoYXBlLmZvbnQuaGVpZ2h0XHJcblx0XHRcdGZvciBpIGluIFswLi4uc2hhcGUudGV4dC5sZW5ndGhdXHJcblx0XHRcdFx0Y2hhciA9IHNoYXBlLnRleHRbaV1cclxuXHRcdFx0XHRjaGFyQml0bWFwID0gc2hhcGUuZm9udC5nZXRGcmFtZUltYWdlIGNoYXJcclxuXHRcdFx0XHRpZiBjaGFyQml0bWFwP1xyXG5cdFx0XHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIGNoYXJCaXRtYXAsIHNoYXBlLnggKyB4T2Zmc2V0LCBzaGFwZS55ICsgeU9mZnNldFxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSBjaGFyQml0bWFwLndpZHRoXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0eE9mZnNldCArPSAxMFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ltYWdlOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5sb2FkZWRcclxuXHRcdFx0dyA9IHNoYXBlLnNpemUud2lkdGhcclxuXHRcdFx0aCA9IHNoYXBlLnNpemUuaGVpZ2h0XHJcblx0XHRcdGR4ID0gLXcgKiBzaGFwZS5waXZvdC54XHJcblx0XHRcdGR5ID0gLWggKiBzaGFwZS5waXZvdC55XHJcblx0XHRcdEBjb250ZXh0LmRyYXdJbWFnZSBzaGFwZS5pbWFnZSwgZHgsIGR5LCB3LCBoXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Qm91bmRzOiAoYm91bmRzKSAtPlxyXG5cdFx0QGNvbnRleHQucmVjdCBib3VuZHMueDEsIGJvdW5kcy55MSwgYm91bmRzLngyIC0gYm91bmRzLngxLCBib3VuZHMueTIgLSBib3VuZHMueTFcclxuXHRcdEBcclxuIiwiIyBCb3cgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LkJvdyBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUbykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0JvdydcclxuXHJcblx0XHRbQGFGcm9tLCBAYVRvXSA9IFtAYVRvLCBAYUZyb21dIGlmIEBhRnJvbSA+IEBhVG9cclxuXHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRAc3RyaW5nID0gbmV3IEJ1LkxpbmUgQGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYUZyb20pLFxyXG5cdFx0XHRcdEBjZW50ZXIuYXJjVG8oQHJhZGl1cywgQGFUbylcclxuXHRcdEBrZXlQb2ludHMgPSBAc3RyaW5nLnBvaW50c1xyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LkJvdyBAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvXHJcbiIsIiMgQ2lyY2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5DaXJjbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBfcmFkaXVzID0gMSwgY3ggPSAwLCBjeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdDaXJjbGUnXHJcblxyXG5cdFx0QF9jZW50ZXIgPSBuZXcgQnUuUG9pbnQoY3gsIGN5KVxyXG5cdFx0QGJvdW5kcyA9IG51bGwgIyBmb3IgYWNjZWxlcmF0ZSBjb250YWluIHRlc3RcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gW0BfY2VudGVyXVxyXG5cclxuXHRjbG9uZTogKCkgLT4gbmV3IEJ1LkNpcmNsZSBAcmFkaXVzLCBAY3gsIEBjeVxyXG5cclxuXHQjIHByb3BlcnR5XHJcblxyXG5cdEBwcm9wZXJ0eSAnY3gnLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci54XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnggPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY3knLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci55XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnkgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY2VudGVyJyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXJcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jZW50ZXIgPSB2YWxcclxuXHRcdFx0QGN4ID0gdmFsLnhcclxuXHRcdFx0QGN5ID0gdmFsLnlcclxuXHRcdFx0QGtleVBvaW50c1swXSA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAnY2VudGVyQ2hhbmdlZCcsIEBcclxuXHJcblx0QHByb3BlcnR5ICdyYWRpdXMnLFxyXG5cdFx0Z2V0OiAtPiBAX3JhZGl1c1xyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1cyA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAncmFkaXVzQ2hhbmdlZCcsIEBcclxuXHRcdFx0QFxyXG4iLCIjIEZhbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuRmFuIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnRmFuJ1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcgPSBuZXcgQnUuTGluZShcclxuXHRcdFx0XHRAY2VudGVyLmFyY1RvIEByYWRpdXMsIEBhRnJvbVxyXG5cdFx0XHRcdEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFUb1xyXG5cdFx0KVxyXG5cdFx0QGtleVBvaW50cyA9IFtcclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMF1cclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMV1cclxuXHRcdFx0bmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRdXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuRmFuIEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuIiwiIyBsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5MaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChwMSwgcDIsIHAzLCBwNCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0xpbmUnXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA8IDJcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQoKSwgbmV3IEJ1LlBvaW50KCldXHJcblx0XHRlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPCA0XHJcblx0XHRcdEBwb2ludHMgPSBbcDEuY2xvbmUoKSwgcDIuY2xvbmUoKV1cclxuXHRcdGVsc2UgICMgbGVuID49IDRcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQocDEsIHAyKSwgbmV3IEJ1LlBvaW50KHAzLCBwNCldXHJcblxyXG5cdFx0QGxlbmd0aCA9IDBcclxuXHRcdEBtaWRwb2ludCA9IG5ldyBCdS5Qb2ludCgpXHJcblx0XHRAa2V5UG9pbnRzID0gQHBvaW50c1xyXG5cclxuXHRcdEBvbiBcInBvaW50Q2hhbmdlXCIsID0+XHJcblx0XHRcdEBsZW5ndGggPSBAcG9pbnRzWzBdLmRpc3RhbmNlVG8oQHBvaW50c1sxXSlcclxuXHRcdFx0QG1pZHBvaW50LnNldCgoQHBvaW50c1swXS54ICsgQHBvaW50c1sxXS54KSAvIDIsIChAcG9pbnRzWzBdLnkgKyBAcG9pbnRzWzFdLnkpIC8gMilcclxuXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5MaW5lIEBwb2ludHNbMF0sIEBwb2ludHNbMV1cclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdHNldDogKGExLCBhMiwgYTMsIGE0KSAtPlxyXG5cdFx0aWYgcDQ/XHJcblx0XHRcdEBwb2ludHNbMF0uc2V0IGExLCBhMlxyXG5cdFx0XHRAcG9pbnRzWzFdLnNldCBhMywgYTRcclxuXHRcdGVsc2VcclxuXHRcdFx0QHBvaW50c1swXSA9IGExXHJcblx0XHRcdEBwb2ludHNbMV0gPSBhMlxyXG5cdFx0QHRyaWdnZXIgXCJwb2ludENoYW5nZVwiLCBAXHJcblx0XHRAXHJcblxyXG5cdHNldFBvaW50MTogKGExLCBhMikgLT5cclxuXHRcdGlmIGEyP1xyXG5cdFx0XHRAcG9pbnRzWzBdLnNldCBhMSwgYTJcclxuXHRcdGVsc2VcclxuXHRcdFx0QHBvaW50c1swXS5jb3B5IGExXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuXHRcdEBcclxuXHJcblx0c2V0UG9pbnQyOiAoYTEsIGEyKSAtPlxyXG5cdFx0aWYgYTI/XHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGExLCBhMlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzFdLmNvcHkgYTFcclxuXHRcdEB0cmlnZ2VyIFwicG9pbnRDaGFuZ2VcIiwgQFxyXG5cdFx0QFxyXG4iLCIjIHBvaW50IHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2ludCBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHggPSAwLCBAeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2ludCdcclxuXHJcblx0XHRAbGluZVdpZHRoID0gMC41XHJcblx0XHRAX2xhYmVsSW5kZXggPSAtMVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvaW50IEB4LCBAeVxyXG5cclxuXHRAcHJvcGVydHkgJ2xhYmVsJyxcclxuXHRcdGdldDogLT4gaWYgQF9sYWJlbEluZGV4ID4gLTEgdGhlbiBAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0IGVsc2UgJydcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0aWYgQF9sYWJlbEluZGV4ID09IC0xXHJcblx0XHRcdFx0cG9pbnRUZXh0ID0gbmV3IEJ1LlBvaW50VGV4dCB2YWwsIEB4ICsgQnUuUE9JTlRfTEFCRUxfT0ZGU0VULCBAeSwge2FsaWduOiAnKzAnfVxyXG5cdFx0XHRcdEBjaGlsZHJlbi5wdXNoIHBvaW50VGV4dFxyXG5cdFx0XHRcdEBfbGFiZWxJbmRleCA9IEBjaGlsZHJlbi5sZW5ndGggLSAxXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0ID0gdmFsXHJcblxyXG5cdGFyY1RvOiAocmFkaXVzLCBhcmMpIC0+XHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IEB4ICsgTWF0aC5jb3MoYXJjKSAqIHJhZGl1cywgQHkgKyBNYXRoLnNpbihhcmMpICogcmFkaXVzXHJcblxyXG5cclxuXHQjIGNvcHkgdmFsdWUgZnJvbSBvdGhlciBsaW5lXHJcblx0Y29weTogKHBvaW50KSAtPlxyXG5cdFx0QHggPSBwb2ludC54XHJcblx0XHRAeSA9IHBvaW50LnlcclxuXHRcdEB1cGRhdGVMYWJlbCgpXHJcblxyXG5cdCMgc2V0IHZhbHVlIGZyb20geCwgeVxyXG5cdHNldDogKHgsIHkpIC0+XHJcblx0XHRAeCA9IHhcclxuXHRcdEB5ID0geVxyXG5cdFx0QHVwZGF0ZUxhYmVsKClcclxuXHJcblx0dXBkYXRlTGFiZWw6IC0+XHJcblx0XHRpZiBAX2xhYmVsSW5kZXggPiAtMVxyXG5cdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS54ID0gQHggKyBCdS5QT0lOVF9MQUJFTF9PRkZTRVRcclxuXHRcdFx0QGNoaWxkcmVuW0BfbGFiZWxJbmRleF0ueSA9IEB5XHJcbiIsIiMgcG9seWdvbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUG9seWdvbiBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdCMjI1xyXG4gICAgY29uc3RydWN0b3JzXHJcbiAgICAxLiBQb2x5Z29uKHBvaW50cylcclxuICAgIDIuIFBvbHlnb24oeCwgeSwgcmFkaXVzLCBuLCBvcHRpb25zKTogdG8gZ2VuZXJhdGUgcmVndWxhciBwb2x5Z29uXHJcbiAgICBcdG9wdGlvbnM6IGFuZ2xlIC0gc3RhcnQgYW5nbGUgb2YgcmVndWxhciBwb2x5Z29uXHJcblx0IyMjXHJcblx0Y29uc3RydWN0b3I6IChwb2ludHMpIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2x5Z29uJ1xyXG5cclxuXHRcdEB2ZXJ0aWNlcyA9IFtdXHJcblx0XHRAbGluZXMgPSBbXVxyXG5cdFx0QHRyaWFuZ2xlcyA9IFtdXHJcblxyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0YW5nbGU6IDBcclxuXHJcblx0XHRpZiBwb2ludHMgaW5zdGFuY2VvZiBBcnJheVxyXG5cdFx0XHRAdmVydGljZXMgPSBwb2ludHMgaWYgcG9pbnRzP1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRpZiBhcmd1bWVudHMubGVuZ3RoIDwgNFxyXG5cdFx0XHRcdHggPSAwXHJcblx0XHRcdFx0eSA9IDBcclxuXHRcdFx0XHRyYWRpdXMgPSBhcmd1bWVudHNbMF1cclxuXHRcdFx0XHRuID0gYXJndW1lbnRzWzFdXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR4ID0gYXJndW1lbnRzWzBdXHJcblx0XHRcdFx0eSA9IGFyZ3VtZW50c1sxXVxyXG5cdFx0XHRcdHJhZGl1cyA9IGFyZ3VtZW50c1syXVxyXG5cdFx0XHRcdG4gPSBhcmd1bWVudHNbM11cclxuXHRcdFx0QHZlcnRpY2VzID0gQnUuUG9seWdvbi5nZW5lcmF0ZVJlZ3VsYXJQb2ludHMgeCwgeSwgcmFkaXVzLCBuLCBvcHRpb25zXHJcblxyXG5cdFx0IyBpbml0IGxpbmVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdKSlcclxuXHRcdFx0QGxpbmVzLnB1c2gobmV3IEJ1LkxpbmUoQHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAxXSwgQHZlcnRpY2VzWzBdKSlcclxuXHJcblx0XHQjIGluaXQgdHJpYW5nbGVzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMlxyXG5cdFx0XHRmb3IgaSBpbiBbMSAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0QHRyaWFuZ2xlcy5wdXNoKG5ldyBCdS5UcmlhbmdsZShAdmVydGljZXNbMF0sIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXSkpXHJcblxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvbHlnb24gQHZlcnRpY2VzXHJcblxyXG5cdCMgZGV0ZWN0XHJcblxyXG5cdGlzU2ltcGxlOiAoKSAtPlxyXG5cdFx0bGVuID0gQGxpbmVzLmxlbmd0aFxyXG5cdFx0Zm9yIGkgaW4gWzAuLi5sZW5dXHJcblx0XHRcdGZvciBqIGluIFtpICsgMS4uLmxlbl1cclxuXHRcdFx0XHRpZiBAbGluZXNbaV0uaXNDcm9zc1dpdGhMaW5lKEBsaW5lc1tqXSlcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdGFkZFBvaW50OiAocG9pbnQsIGluc2VydEluZGV4KSAtPlxyXG5cdFx0aWYgbm90IGluc2VydEluZGV4P1xyXG5cdFx0XHQjIGFkZCBwb2ludFxyXG5cdFx0XHRAdmVydGljZXMucHVzaCBwb2ludFxyXG5cclxuXHRcdFx0IyBhZGQgbGluZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEBsaW5lc1tAbGluZXMubGVuZ3RoIC0gMV0ucG9pbnRzWzFdID0gcG9pbnRcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdLCBAdmVydGljZXNbMF0pKVxyXG5cclxuXHRcdFx0IyBhZGQgdHJpYW5nbGVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDJcclxuXHRcdFx0XHRAdHJpYW5nbGVzLnB1c2gobmV3IEJ1LlRyaWFuZ2xlKFxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbMF1cclxuXHRcdFx0XHRcdFx0QHZlcnRpY2VzW0B2ZXJ0aWNlcy5sZW5ndGggLSAyXVxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdFx0KSlcclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgcG9pbnQpXHJcblx0IyBUT0RPIGFkZCBsaW5lcyBhbmQgdHJpYW5nbGVzXHJcblxyXG5cdEBnZW5lcmF0ZVJlZ3VsYXJQb2ludHMgPSAoY3gsIGN5LCByYWRpdXMsIG4sIG9wdGlvbnMpIC0+XHJcblx0XHRhbmdsZURlbHRhID0gb3B0aW9ucy5hbmdsZVxyXG5cdFx0ciA9IHJhZGl1c1xyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGFuZ2xlU2VjdGlvbiA9IE1hdGguUEkgKiAyIC8gblxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIG5dXHJcblx0XHRcdGEgPSBpICogYW5nbGVTZWN0aW9uICsgYW5nbGVEZWx0YVxyXG5cdFx0XHR4ID0gY3ggKyByICogTWF0aC5jb3MoYSlcclxuXHRcdFx0eSA9IGN5ICsgciAqIE1hdGguc2luKGEpXHJcblx0XHRcdHBvaW50c1tpXSA9IG5ldyBCdS5Qb2ludCB4LCB5XHJcblx0XHRyZXR1cm4gcG9pbnRzXHJcbiIsIiMgcG9seWxpbmUgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlBvbHlsaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAdmVydGljZXMgPSBbXSkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1BvbHlsaW5lJ1xyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxXHJcblx0XHRcdHZlcnRpY2VzID0gW11cclxuXHRcdFx0Zm9yIGkgaW4gWzAgLi4uIGFyZ3VtZW50cy5sZW5ndGggLyAyXVxyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2ggbmV3IEJ1LlBvaW50IGFyZ3VtZW50c1tpICogMl0sIGFyZ3VtZW50c1tpICogMiArIDFdXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IHZlcnRpY2VzXHJcblxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEBrZXlQb2ludHMgPSBAdmVydGljZXNcclxuXHJcblx0XHRAZmlsbCBvZmZcclxuXHJcblx0XHRAb24gXCJwb2ludENoYW5nZVwiLCA9PlxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEB1cGRhdGVMaW5lcygpXHJcblx0XHRcdFx0QGNhbGNMZW5ndGg/KClcclxuXHRcdFx0XHRAY2FsY1BvaW50Tm9ybWFsaXplZFBvcz8oKVxyXG5cdFx0QHRyaWdnZXIgXCJwb2ludENoYW5nZVwiLCBAXHJcblxyXG5cdGNsb25lOiA9PiBuZXcgQnUuUG9seWxpbmUgQHZlcnRpY2VzXHJcblxyXG5cdHVwZGF0ZUxpbmVzOiA9PlxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEB2ZXJ0aWNlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRpZiBAbGluZXNbaV0/XHJcblx0XHRcdFx0QGxpbmVzW2ldLnNldCBAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBsaW5lc1tpXSA9IG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXVxyXG5cdCMgVE9ETyByZW1vdmUgdGhlIHJlc3RcclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdHNldCA9IChwb2ludHMpIC0+XHJcblx0XHQjIHBvaW50c1xyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEB2ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdEB2ZXJ0aWNlc1tpXS5jb3B5IHBvaW50c1tpXVxyXG5cclxuXHRcdCMgcmVtb3ZlIHRoZSBleHRyYSBwb2ludHNcclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiBwb2ludHMubGVuZ3RoXHJcblx0XHRcdEB2ZXJ0aWNlcy5zcGxpY2UgcG9pbnRzLmxlbmd0aFxyXG5cclxuXHRcdEB0cmlnZ2VyIFwicG9pbnRDaGFuZ2VcIiwgQFxyXG5cclxuXHRhZGRQb2ludDogKHBvaW50LCBpbnNlcnRJbmRleCkgLT5cclxuXHRcdGlmIG5vdCBpbnNlcnRJbmRleD9cclxuXHRcdFx0IyBhZGQgcG9pbnRcclxuXHRcdFx0QHZlcnRpY2VzLnB1c2ggcG9pbnRcclxuXHRcdFx0IyBhZGQgbGluZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEBsaW5lcy5wdXNoIG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMl0sIEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZSBpbnNlcnRJbmRleCwgMCwgcG9pbnRcclxuXHRcdCMgVE9ETyBhZGQgbGluZXNcclxuXHRcdEB0cmlnZ2VyIFwicG9pbnRDaGFuZ2VcIiwgQFxyXG4iLCIjIHJlY3RhbmdsZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUmVjdGFuZ2xlIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJSYWRpdXMgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnUmVjdGFuZ2xlJ1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQoeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDIpXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplKHdpZHRoLCBoZWlnaHQpXHJcblxyXG5cdFx0QHBvaW50TFQgPSBuZXcgQnUuUG9pbnQoeCwgeSlcclxuXHRcdEBwb2ludFJUID0gbmV3IEJ1LlBvaW50KHggKyB3aWR0aCwgeSlcclxuXHRcdEBwb2ludFJCID0gbmV3IEJ1LlBvaW50KHggKyB3aWR0aCwgeSArIGhlaWdodClcclxuXHRcdEBwb2ludExCID0gbmV3IEJ1LlBvaW50KHgsIHkgKyBoZWlnaHQpXHJcblxyXG5cdFx0QHBvaW50cyA9IFtAcG9pbnRMVCwgQHBvaW50UlQsIEBwb2ludFJCLCBAcG9pbnRMQl1cclxuXHJcblx0XHRAY29ybmVyUmFkaXVzID0gY29ybmVyUmFkaXVzXHJcblxyXG5cdEBwcm9wZXJ0eSAnY29ybmVyUmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9jb3JuZXJSYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jb3JuZXJSYWRpdXMgPSB2YWxcclxuXHRcdFx0QGtleVBvaW50cyA9IGlmIHZhbCA+IDAgdGhlbiBbXSBlbHNlIEBwb2ludHNcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5SZWN0YW5nbGUgQHBvaW50TFQueCwgQHBvaW50TFQueSwgQHNpemUud2lkdGgsIEBzaXplLmhlaWdodFxyXG4iLCIjIHNwbGluZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuU3BsaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6ICh2ZXJ0aWNlcykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1NwbGluZSdcclxuXHJcblx0XHRpZiB2ZXJ0aWNlcyBpbnN0YW5jZW9mIEJ1LlBvbHlsaW5lXHJcblx0XHRcdHBvbHlsaW5lID0gdmVydGljZXNcclxuXHRcdFx0QHZlcnRpY2VzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0cG9seWxpbmUub24gJ3BvaW50Q2hhbmdlJywgKHBvbHlsaW5lKSA9PlxyXG5cdFx0XHRcdEB2ZXJ0aWNlcyA9IHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdFx0Y2FsY0NvbnRyb2xQb2ludHMgQFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAdmVydGljZXMgPSBCdS5jbG9uZSB2ZXJ0aWNlc1xyXG5cclxuXHRcdEBrZXlQb2ludHMgPSBAdmVydGljZXNcclxuXHRcdEBjb250cm9sUG9pbnRzQWhlYWQgPSBbXVxyXG5cdFx0QGNvbnRyb2xQb2ludHNCZWhpbmQgPSBbXVxyXG5cclxuXHRcdEBmaWxsIG9mZlxyXG5cdFx0QHNtb290aEZhY3RvciA9IEJ1LkRFRkFVTFRfU1BMSU5FX1NNT09USFxyXG5cdFx0QF9zbW9vdGhlciA9IG5vXHJcblxyXG5cdFx0Y2FsY0NvbnRyb2xQb2ludHMgQFxyXG5cclxuXHRAcHJvcGVydHkgJ3Ntb290aGVyJyxcclxuXHRcdGdldDogLT4gQF9zbW9vdGhlclxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRvbGRWYWwgPSBAX3Ntb290aGVyXHJcblx0XHRcdEBfc21vb3RoZXIgPSB2YWxcclxuXHRcdFx0Y2FsY0NvbnRyb2xQb2ludHMgQCBpZiBvbGRWYWwgIT0gQF9zbW9vdGhlclxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlNwbGluZSBAdmVydGljZXNcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCkgLT5cclxuXHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblxyXG5cdGNhbGNDb250cm9sUG9pbnRzID0gKHNwbGluZSkgLT5cclxuXHRcdHNwbGluZS5rZXlQb2ludHMgPSBzcGxpbmUudmVydGljZXNcclxuXHJcblx0XHRwID0gc3BsaW5lLnZlcnRpY2VzXHJcblx0XHRsZW4gPSBwLmxlbmd0aFxyXG5cdFx0aWYgbGVuID49IDFcclxuXHRcdFx0c3BsaW5lLmNvbnRyb2xQb2ludHNCZWhpbmRbMF0gPSBwWzBdXHJcblx0XHRpZiBsZW4gPj0gMlxyXG5cdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2xlbiAtIDFdID0gcFtsZW4gLSAxXVxyXG5cdFx0aWYgbGVuID49IDNcclxuXHRcdFx0Zm9yIGkgaW4gWzEuLi5sZW4gLSAxXVxyXG5cdFx0XHRcdHRoZXRhMSA9IE1hdGguYXRhbjIgcFtpXS55IC0gcFtpIC0gMV0ueSwgcFtpXS54IC0gcFtpIC0gMV0ueFxyXG5cdFx0XHRcdHRoZXRhMiA9IE1hdGguYXRhbjIgcFtpICsgMV0ueSAtIHBbaV0ueSwgcFtpICsgMV0ueCAtIHBbaV0ueFxyXG5cdFx0XHRcdGxlbjEgPSBCdS5iZXZlbCBwW2ldLnkgLSBwW2kgLSAxXS55LCBwW2ldLnggLSBwW2kgLSAxXS54XHJcblx0XHRcdFx0bGVuMiA9IEJ1LmJldmVsIHBbaV0ueSAtIHBbaSArIDFdLnksIHBbaV0ueCAtIHBbaSArIDFdLnhcclxuXHRcdFx0XHR0aGV0YSA9IHRoZXRhMSArICh0aGV0YTIgLSB0aGV0YTEpICogaWYgc3BsaW5lLl9zbW9vdGhlciB0aGVuIGxlbjEgLyAobGVuMSArIGxlbjIpIGVsc2UgMC41XHJcblx0XHRcdFx0dGhldGEgKz0gTWF0aC5QSSBpZiBNYXRoLmFicyh0aGV0YSAtIHRoZXRhMSkgPiBNYXRoLlBJIC8gMlxyXG5cdFx0XHRcdHhBID0gcFtpXS54IC0gbGVuMSAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLmNvcyh0aGV0YSlcclxuXHRcdFx0XHR5QSA9IHBbaV0ueSAtIGxlbjEgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5zaW4odGhldGEpXHJcblx0XHRcdFx0eEIgPSBwW2ldLnggKyBsZW4yICogc3BsaW5lLnNtb290aEZhY3RvciAqIE1hdGguY29zKHRoZXRhKVxyXG5cdFx0XHRcdHlCID0gcFtpXS55ICsgbGVuMiAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLnNpbih0aGV0YSlcclxuXHRcdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2ldID0gbmV3IEJ1LlBvaW50IHhBLCB5QVxyXG5cdFx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQmVoaW5kW2ldID0gbmV3IEJ1LlBvaW50IHhCLCB5QlxyXG5cclxuXHRcdFx0XHQjIGFkZCBjb250cm9sIGxpbmVzIGZvciBkZWJ1Z2dpbmdcclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMl0gPSBuZXcgQnUuTGluZSBzcGxpbmUudmVydGljZXNbaV0sIHNwbGluZS5jb250cm9sUG9pbnRzQWhlYWRbaV1cclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMV0gPSAgbmV3IEJ1LkxpbmUgc3BsaW5lLnZlcnRpY2VzW2ldLCBzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFtpXVxyXG4iLCIjIHRyaWFuZ2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5UcmlhbmdsZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAocDEsIHAyLCBwMykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1RyaWFuZ2xlJ1xyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gNlxyXG5cdFx0XHRbeDEsIHkxLCB4MiwgeTIsIHgzLCB5M10gPSBhcmd1bWVudHNcclxuXHRcdFx0cDEgPSBuZXcgQnUuUG9pbnQgeDEsIHkxXHJcblx0XHRcdHAyID0gbmV3IEJ1LlBvaW50IHgyLCB5MlxyXG5cdFx0XHRwMyA9IG5ldyBCdS5Qb2ludCB4MywgeTNcclxuXHJcblx0XHRAbGluZXMgPSBbXHJcblx0XHRcdG5ldyBCdS5MaW5lKHAxLCBwMilcclxuXHRcdFx0bmV3IEJ1LkxpbmUocDIsIHAzKVxyXG5cdFx0XHRuZXcgQnUuTGluZShwMywgcDEpXHJcblx0XHRdXHJcblx0XHQjQGNlbnRlciA9IG5ldyBCdS5Qb2ludCBCdS5hdmVyYWdlKHAxLngsIHAyLngsIHAzLngpLCBCdS5hdmVyYWdlKHAxLnksIHAyLnksIHAzLnkpXHJcblx0XHRAcG9pbnRzID0gW3AxLCBwMiwgcDNdXHJcblx0XHRAa2V5UG9pbnRzID0gQHBvaW50c1xyXG5cclxuXHRjbG9uZTogPT4gbmV3IEJ1LlRyaWFuZ2xlIEBwb2ludHNbMF0sIEBwb2ludHNbMV0sIEBwb2ludHNbMl1cclxuIiwiIyBHcm91cFxyXG5cclxuY2xhc3MgQnUuR3JvdXAgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0dyb3VwJyIsIiMgZHJhdyBiaXRtYXBcclxuXHJcbmNsYXNzIEJ1LkltYWdlIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAdXJsLCB4ID0gMCwgeSA9IDAsIHdpZHRoLCBoZWlnaHQpIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdJbWFnZSdcclxuXHJcblx0XHRAYXV0b1NpemUgPSB5ZXNcclxuXHRcdEBzaXplID0gbmV3IEJ1LlNpemVcclxuXHRcdEBwb3NpdGlvbiA9IG5ldyBCdS5WZWN0b3IgeCwgeVxyXG5cdFx0QGNlbnRlciA9IG5ldyBCdS5WZWN0b3IgeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDJcclxuXHRcdGlmIHdpZHRoP1xyXG5cdFx0XHRAc2l6ZS5zZXQgd2lkdGgsIGhlaWdodFxyXG5cdFx0XHRAYXV0b1NpemUgPSBub1xyXG5cclxuXHRcdEBwaXZvdCA9IG5ldyBCdS5WZWN0b3IgMC41LCAwLjVcclxuXHJcblx0XHRAaW1hZ2UgPSBuZXcgQnUuZ2xvYmFsLkltYWdlXHJcblx0XHRAbG9hZGVkID0gZmFsc2VcclxuXHJcblx0XHRAaW1hZ2Uub25sb2FkID0gKGUpID0+XHJcblx0XHRcdGlmIEBhdXRvU2l6ZVxyXG5cdFx0XHRcdEBzaXplLnNldCBAaW1hZ2Uud2lkdGgsIEBpbWFnZS5oZWlnaHRcclxuXHRcdFx0QGxvYWRlZCA9IHRydWVcclxuXHJcblx0XHRAaW1hZ2Uuc3JjID0gQHVybFxyXG4iLCIjIGRyYXcgdGV4dCBieSBhIHBvaW50XHJcblxyXG5jbGFzcyBCdS5Qb2ludFRleHQgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHQjIyNcclxuXHRvcHRpb25zLmFsaWduOlxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHR8ICAgLS0gICAgMC0gICAgKy0gICB8XHJcblx0fCAgICAgICAgIHzihpkwMCAgICAgIHxcclxuXHR8ICAgLTAgIC0tKy0+ICAgKzAgICB8XHJcblx0fCAgICAgICAgIOKGkyAgICAgICAgICB8XHJcblx0fCAgIC0rICAgIDArICAgICsrICAgfFxyXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRmb3IgZXhhbXBsZTogdGV4dCBpcyBpbiB0aGUgcmlnaHQgdG9wIG9mIHRoZSBwb2ludCwgdGhlbiBhbGlnbiA9IFwiKy1cIlxyXG5cdCMjI1xyXG5cdGNvbnN0cnVjdG9yOiAoQHRleHQsIEB4ID0gMCwgQHkgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnUG9pbnRUZXh0J1xyXG5cdFx0QHN0cm9rZVN0eWxlID0gbnVsbCAjIG5vIHN0cm9rZSBieSBkZWZhdWx0XHJcblx0XHRAZmlsbFN0eWxlID0gQnUuREVGQVVMVF9URVhUX0ZJTExfU1RZTEVcclxuXHJcblx0XHRvcHRpb25zID0gQnUuY29tYmluZU9wdGlvbnMgYXJndW1lbnRzLFxyXG5cdFx0XHRhbGlnbjogJzAwJ1xyXG5cdFx0XHRmb250RmFtaWx5OiAnVmVyZGFuYSdcclxuXHRcdFx0Zm9udFNpemU6IDExXHJcblx0XHRAYWxpZ24gPSBvcHRpb25zLmFsaWduXHJcblx0XHRAX2ZvbnRGYW1pbHkgPSBvcHRpb25zLmZvbnRGYW1pbHlcclxuXHRcdEBfZm9udFNpemUgPSBvcHRpb25zLmZvbnRTaXplXHJcblx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIiBvciBvcHRpb25zLmZvbnRcclxuXHJcblx0QHByb3BlcnR5ICdhbGlnbicsXHJcblx0XHRnZXQ6IC0+IEBfYWxpZ25cclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9hbGlnbiA9IHZhbFxyXG5cdFx0XHRAc2V0Q29udGV4dEFsaWduIEBfYWxpZ25cclxuXHJcblx0QHByb3BlcnR5ICdmb250RmFtaWx5JyxcclxuXHRcdGdldDogLT4gQF9mb250RmFtaWx5XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfZm9udEZhbWlseSA9IHZhbFxyXG5cdFx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIlxyXG5cclxuXHRAcHJvcGVydHkgJ2ZvbnRTaXplJyxcclxuXHRcdGdldDogLT4gQF9mb250U2l6ZVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2ZvbnRTaXplID0gdmFsXHJcblx0XHRcdEBmb250ID0gXCIjeyBAX2ZvbnRTaXplIH1weCAjeyBAX2ZvbnRGYW1pbHkgfVwiXHJcblxyXG5cdHNldENvbnRleHRBbGlnbjogKGFsaWduKSA9PlxyXG5cdFx0aWYgYWxpZ24ubGVuZ3RoID09IDFcclxuXHRcdFx0YWxpZ24gPSAnJyArIGFsaWduICsgYWxpZ25cclxuXHRcdGFsaWduWCA9IGFsaWduLnN1YnN0cmluZygwLCAxKVxyXG5cdFx0YWxpZ25ZID0gYWxpZ24uc3Vic3RyaW5nKDEsIDIpXHJcblx0XHRAdGV4dEFsaWduID0gc3dpdGNoIGFsaWduWFxyXG5cdFx0XHR3aGVuICctJyB0aGVuICdyaWdodCdcclxuXHRcdFx0d2hlbiAnMCcgdGhlbiAnY2VudGVyJ1xyXG5cdFx0XHR3aGVuICcrJyB0aGVuICdsZWZ0J1xyXG5cdFx0QHRleHRCYXNlbGluZSA9IHN3aXRjaCBhbGlnbllcclxuXHRcdFx0d2hlbiAnLScgdGhlbiAnYm90dG9tJ1xyXG5cdFx0XHR3aGVuICcwJyB0aGVuICdtaWRkbGUnXHJcblx0XHRcdHdoZW4gJysnIHRoZW4gJ3RvcCdcclxuIiwiIyBhbmltYXRpb24gY2xhc3MgYW5kIHByZXNldCBhbmltYXRpb25zXHJcblxyXG5jbGFzcyBCdS5BbmltYXRpb25cclxuXHJcblx0Y29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxyXG5cdFx0QGZyb20gPSBvcHRpb25zLmZyb21cclxuXHRcdEB0byA9IG9wdGlvbnMudG9cclxuXHRcdEBkYXRhID0gb3B0aW9ucy5kYXRhIG9yIHt9XHJcblx0XHRAZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIG9yIDAuNVxyXG5cdFx0QGVhc2luZyA9IG9wdGlvbnMuZWFzaW5nIG9yIGZhbHNlXHJcblx0XHRAcmVwZWF0ID0gISFvcHRpb25zLnJlcGVhdFxyXG5cdFx0QGluaXQgPSBvcHRpb25zLmluaXRcclxuXHRcdEB1cGRhdGUgPSBvcHRpb25zLnVwZGF0ZVxyXG5cdFx0QGZpbmlzaCA9IG9wdGlvbnMuZmluaXNoXHJcblxyXG5cdGFwcGx5OiAodGFyZ2V0LCBhcmdzKSAtPlxyXG5cdFx0QnUuYW5pbWF0aW9uUnVubmVyLmFkZCBALCB0YXJnZXQsIGFyZ3NcclxuXHJcbiMgUHJlc2V0IEFuaW1hdGlvbnNcclxuIyBTb21lIG9mIHRoZSBhbmltYXRpb25zIGFyZSBjb25zaXN0ZW50IHdpdGggalF1ZXJ5IFVJXHJcbkJ1LmFuaW1hdGlvbnMgPVxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgU2ltcGxlXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0ZmFkZUluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6ICh0KSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IHRcclxuXHJcblx0ZmFkZU91dDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0dXBkYXRlOiAodCkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSAxIC0gdFxyXG5cclxuXHRzcGluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6ICh0KSAtPlxyXG5cdFx0XHRAcm90YXRpb24gPSB0ICogTWF0aC5QSSAqIDJcclxuXHJcblx0c3BpbkluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSwgYXJnID0gMSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLmRzID0gYXJnXHJcblx0XHR1cGRhdGU6ICh0LCBkYXRhKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IHRcclxuXHRcdFx0QHJvdGF0aW9uID0gdCAqIE1hdGguUEkgKiA0XHJcblx0XHRcdEBzY2FsZSA9IHQgKiBkYXRhLmRzXHJcblxyXG5cdHNwaW5PdXQ6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKHQpIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gMSAtIHRcclxuXHRcdFx0QHJvdGF0aW9uID0gdCAqIE1hdGguUEkgKiA0XHJcblx0XHRcdEBzY2FsZSA9IDEgLSB0XHJcblxyXG5cdGJsaW5rOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRkdXJhdGlvbjogMC4yXHJcblx0XHRmcm9tOiAwXHJcblx0XHR0bzogNTEyXHJcblx0XHR1cGRhdGU6IChkYXRhKSAtPlxyXG5cdFx0XHRkYXRhID0gTWF0aC5mbG9vciBNYXRoLmFicyhkIC0gMjU2KVxyXG5cdFx0XHRAZmlsbFN0eWxlID0gXCJyZ2IoI3sgZGF0YSB9LCAjeyBkYXRhIH0sICN7IGRhdGEgfSlcIlxyXG5cclxuXHRzaGFrZTogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0sIGFyZykgLT5cclxuXHRcdFx0YW5pbS5kYXRhLm94ID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0YW5pbS5kYXRhLnJhbmdlID0gYXJnIG9yIDIwXHJcblx0XHR1cGRhdGU6ICh0LCBkYXRhKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueCA9IE1hdGguc2luKHQgKiBNYXRoLlBJICogOCkgKiBkYXRhLnJhbmdlICsgZGF0YS5veFxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgVG9nZ2xlZDogZGV0ZWN0IGFuZCBzYXZlIG9yaWdpbmFsIHN0YXR1c1xyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdHB1ZmY6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjE1XHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5mcm9tID1cclxuXHRcdFx0XHRvcGFjaXR5OiBAb3BhY2l0eVxyXG5cdFx0XHRcdHNjYWxlOiBAc2NhbGUueFxyXG5cdFx0XHRhbmltLnRvID1cclxuXHRcdFx0XHRpZiBAb3BhY2l0eSA9PSAxXHJcblx0XHRcdFx0XHRvcGFjaXR5OiAwXHJcblx0XHRcdFx0XHRzY2FsZTogQHNjYWxlLnggKiAxLjVcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRvcGFjaXR5OiAxXHJcblx0XHRcdFx0XHRzY2FsZTogQHNjYWxlLnggLyAxLjVcclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gZGF0YS5vcGFjaXR5XHJcblx0XHRcdEBzY2FsZSA9IGRhdGEuc2NhbGVcclxuXHJcblx0Y2xpcDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIEBzY2FsZS55ICE9IDBcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSAwXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSBAc2NhbGUueFxyXG5cdFx0dXBkYXRlOiAoZGF0YSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBkYXRhXHJcblxyXG5cdGZsaXBYOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5mcm9tID0gQHNjYWxlLnhcclxuXHRcdFx0YW5pbS50byA9IC1hbmltLmZyb21cclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdEBzY2FsZS54ID0gZGF0YVxyXG5cclxuXHRmbGlwWTogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGFuaW0uZnJvbSA9IEBzY2FsZS55XHJcblx0XHRcdGFuaW0udG8gPSAtYW5pbS5mcm9tXHJcblx0XHR1cGRhdGU6IChkYXRhKSAtPlxyXG5cdFx0XHRAc2NhbGUueSA9IGRhdGFcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFdpdGggQXJndW1lbnRzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW92ZVRvOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSwgYXJncykgLT5cclxuXHRcdFx0aWYgYXJncz9cclxuXHRcdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24ueFxyXG5cdFx0XHRcdGFuaW0udG8gPSBhcmdzXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yICdhbmltYXRpb24gbW92ZVRvIG5lZWQgYW4gYXJndW1lbnQnXHJcblx0XHR1cGRhdGU6IChkYXRhKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueCA9IGRhdGFcclxuXHJcblx0bW92ZUJ5OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSwgYXJncykgLT5cclxuXHRcdFx0aWYgYXJncz9cclxuXHRcdFx0XHRhbmltLmZyb20gPSBAcG9zaXRpb24ueFxyXG5cdFx0XHRcdGFuaW0udG8gPSBAcG9zaXRpb24ueCArIHBhcnNlRmxvYXQoYXJncylcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgJ2FuaW1hdGlvbiBtb3ZlVG8gbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gZGF0YVxyXG5cclxuXHRkaXNjb2xvcjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0sIGRlc0NvbG9yKSAtPlxyXG5cdFx0XHRkZXNDb2xvciA9IG5ldyBCdS5Db2xvciBkZXNDb2xvciBpZiB0eXBlb2YgZGVzQ29sb3IgPT0gJ3N0cmluZydcclxuXHRcdFx0YW5pbS5mcm9tID0gbmV3IEJ1LkNvbG9yIEBmaWxsU3R5bGVcclxuXHRcdFx0YW5pbS50byA9IGRlc0NvbG9yXHJcblx0XHR1cGRhdGU6IChkYXRhKSAtPlxyXG5cdFx0XHRAZmlsbFN0eWxlID0gZGF0YS50b1JHQkEoKVxyXG4iLCIjIHJ1biB0aGUgYW5pbWF0aW9uc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uUnVubmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QHJ1bm5pbmdBbmltYXRpb25zID0gW11cclxuXHJcblx0YWRkOiAoYW5pbSwgdGFyZ2V0LCBhcmdzKSAtPlxyXG5cdFx0YW5pbS5pbml0Py5jYWxsIHRhcmdldCwgYW5pbSwgYXJnc1xyXG5cdFx0aWYgaXNBbmltYXRpb25MZWdhbCBhbmltXHJcblx0XHRcdHRhc2sgPVxyXG5cdFx0XHRcdGFuaW1hdGlvbjogYW5pbVxyXG5cdFx0XHRcdHRhcmdldDogdGFyZ2V0XHJcblx0XHRcdFx0c3RhcnRUaW1lOiBCdS5ub3coKVxyXG5cdFx0XHRcdGN1cnJlbnQ6IGFuaW0uZGF0YVxyXG5cdFx0XHRcdGZpbmlzaGVkOiBub1xyXG5cdFx0XHRAcnVubmluZ0FuaW1hdGlvbnMucHVzaCB0YXNrXHJcblx0XHRcdGluaXRUYXNrIHRhc2ssIGFuaW1cclxuXHRcdGVsc2VcclxuXHRcdFx0Y29uc29sZS5lcnJvciAnQnUuQW5pbWF0aW9uUnVubmVyOiBhbmltYXRpb24gc2V0dGluZyBpcyBpbGVnYWw6ICcsIGFuaW1hdGlvblxyXG5cclxuXHR1cGRhdGU6IC0+XHJcblx0XHRub3cgPSBCdS5ub3coKVxyXG5cdFx0Zm9yIHRhc2sgaW4gQHJ1bm5pbmdBbmltYXRpb25zXHJcblx0XHRcdGNvbnRpbnVlIGlmIHRhc2suZmluaXNoZWRcclxuXHJcblx0XHRcdGFuaW0gPSB0YXNrLmFuaW1hdGlvblxyXG5cdFx0XHR0ID0gKG5vdyAtIHRhc2suc3RhcnRUaW1lKSAvIChhbmltLmR1cmF0aW9uICogMTAwMClcclxuXHRcdFx0aWYgdCA+IDFcclxuXHRcdFx0XHRmaW5pc2ggPSB0cnVlXHJcblx0XHRcdFx0aWYgYW5pbS5yZXBlYXRcclxuXHRcdFx0XHRcdHQgPSAwXHJcblx0XHRcdFx0XHR0YXNrLnN0YXJ0VGltZSA9IEJ1Lm5vdygpXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0IyMgVE9ETyByZW1vdmUgb3V0IG9mIGFycmF5XHJcblx0XHRcdFx0XHR0ID0gMVxyXG5cdFx0XHRcdFx0dGFzay5maW5pc2hlZCA9IHllc1xyXG5cclxuXHRcdFx0aWYgYW5pbS5lYXNpbmcgPT0gdHJ1ZVxyXG5cdFx0XHRcdHQgPSBlYXNpbmdGdW5jdGlvbnNbREVGQVVMVF9FQVNJTkdfRlVOQ1RJT05dIHRcclxuXHRcdFx0ZWxzZSBpZiBlYXNpbmdGdW5jdGlvbnNbYW5pbS5lYXNpbmddP1xyXG5cdFx0XHRcdHQgPSBlYXNpbmdGdW5jdGlvbnNbYW5pbS5lYXNpbmddIHRcclxuXHJcblx0XHRcdGlmIGFuaW0uZnJvbT9cclxuXHRcdFx0XHRpbnRlcnBvbGF0ZVRhc2sgdGFzaywgdFxyXG5cdFx0XHRcdGFuaW0udXBkYXRlLmFwcGx5IHRhc2sudGFyZ2V0LCBbdGFzay5jdXJyZW50LCB0XVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0YW5pbS51cGRhdGUuYXBwbHkgdGFzay50YXJnZXQsIFt0LCB0YXNrLmN1cnJlbnRdXHJcblx0XHRcdGlmIGZpbmlzaCB0aGVuIGFuaW0uZmluaXNoPy5jYWxsIHRhc2sudGFyZ2V0LCBhbmltXHJcblxyXG5cdCMgaG9vayB1cCBvbiBhbiByZW5kZXJlciwgcmVtb3ZlIG93biBzZXRJbnRlcm5hbFxyXG5cdGhvb2tVcDogKHJlbmRlcmVyKSAtPlxyXG5cdFx0cmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEB1cGRhdGUoKVxyXG5cclxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAjIFByaXZhdGUgZnVuY3Rpb25zXHJcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRpc0FuaW1hdGlvbkxlZ2FsID0gKGFuaW0pIC0+XHJcblx0XHRyZXR1cm4gdHJ1ZSB1bmxlc3MgYW5pbS5mcm9tPyBhbmQgYW5pbS50bz9cclxuXHJcblx0XHRpZiBCdS5pc1BsYWluT2JqZWN0IGFuaW0uZnJvbVxyXG5cdFx0XHRmb3Igb3duIGtleSBvZiBhbmltLmZyb21cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIGFuaW0udG9ba2V5XT9cclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuIGZhbHNlIHVubGVzcyBhbmltLnRvP1xyXG5cdFx0dHJ1ZVxyXG5cclxuXHRpbml0VGFzayA9ICh0YXNrLCBhbmltKSAtPlxyXG5cdFx0IyBjcmVhdGUgdGFzay5jdXJyZW50IG9iamVjdFxyXG5cdFx0aWYgYW5pbS5mcm9tP1xyXG5cdFx0XHRpZiBCdS5pc1BsYWluT2JqZWN0IGFuaW0uZnJvbVxyXG5cdFx0XHRcdGZvciBvd24ga2V5IG9mIGFuaW0uZnJvbVxyXG5cdFx0XHRcdFx0dGFzay5jdXJyZW50W2tleV0gPSBuZXcgYW5pbS5mcm9tW2tleV0uY29uc3RydWN0b3JcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRhc2suY3VycmVudCA9IG5ldyBhbmltLmZyb20uY29uc3RydWN0b3JcclxuXHJcblx0aW50ZXJwb2xhdGVUYXNrID0gKHRhc2ssIHQpIC0+XHJcblx0XHRhbmltID0gdGFzay5hbmltYXRpb25cclxuXHRcdGlmIHR5cGVvZiBhbmltLmZyb20gPT0gJ251bWJlcidcclxuXHRcdFx0dGFzay5jdXJyZW50ID0gaW50ZXJwb2xhdGVOdW0gYW5pbS5mcm9tLCBhbmltLnRvLCB0XHJcblx0XHRlbHNlIGlmIGFuaW0uZnJvbSBpbnN0YW5jZW9mIEJ1LkNvbG9yXHJcblx0XHRcdCMgdGFzay5jdXJyZW50ID0gbmV3IEJ1LkNvbG9yIHVubGVzcyB0YXNrLmN1cnJlbnQgaW5zdGFuY2VvZiBCdS5Db2xvclxyXG5cdFx0XHRpbnRlcnBvbGF0ZU9iamVjdCBhbmltLmZyb20sIGFuaW0udG8sIHQsIHRhc2suY3VycmVudFxyXG5cdFx0ZWxzZSBpZiBCdS5pc1BsYWluT2JqZWN0IGFuaW0uZnJvbVxyXG5cdFx0XHRmb3Igb3duIGtleSBvZiBhbmltLmZyb21cclxuXHRcdFx0XHRpZiB0eXBlb2YgYW5pbS5mcm9tW2tleV0gPT0gJ251bWJlcidcclxuXHRcdFx0XHRcdHRhc2suY3VycmVudFtrZXldID0gaW50ZXJwb2xhdGVOdW0gYW5pbS5mcm9tW2tleV0sIGFuaW0udG9ba2V5XSwgdFxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdCMgdGFzay5jdXJyZW50W2tleV0gPSBuZXcgQnUuQ29sb3IgdW5sZXNzIHRhc2suY3VycmVudFtrZXldIGluc3RhbmNlb2YgQnUuQ29sb3JcclxuXHRcdFx0XHRcdGludGVycG9sYXRlT2JqZWN0IGFuaW0uZnJvbVtrZXldLCBhbmltLnRvW2tleV0sIHQsIHRhc2suY3VycmVudFtrZXldXHJcblxyXG5cdGludGVycG9sYXRlTnVtID0gKGEsIGIsIHQpIC0+IGIgKiB0IC0gYSAqICh0IC0gMSlcclxuXHJcblx0aW50ZXJwb2xhdGVPYmplY3QgPSAoYSwgYiwgdCwgYykgLT5cclxuXHRcdGlmIGEgaW5zdGFuY2VvZiBCdS5Db2xvclxyXG5cdFx0XHRjLnNldFJHQkEgaW50ZXJwb2xhdGVOdW0oYS5yLCBiLnIsIHQpLCBpbnRlcnBvbGF0ZU51bShhLmcsIGIuZywgdCksIGludGVycG9sYXRlTnVtKGEuYiwgYi5iLCB0KSwgaW50ZXJwb2xhdGVOdW0oYS5hLCBiLmEsIHQpXHJcblx0XHRlbHNlXHJcblx0XHRcdGNvbnNvbGUuZXJyb3IgXCJBbmltYXRpb25SdW5uZXIuaW50ZXJwb2xhdGVPYmplY3QoKSBkb2Vzbid0IHN1cHBvcnQgb2JqZWN0IHR5cGU6IFwiLCBhXHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBQcml2YXRlIHZhcmlhYmxlc1xyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdERFRkFVTFRfRUFTSU5HX0ZVTkNUSU9OID0gJ3F1YWQnXHJcblx0ZWFzaW5nRnVuY3Rpb25zID1cclxuXHRcdHF1YWRJbjogKHQpIC0+IHQgKiB0XHJcblx0XHRxdWFkT3V0OiAodCkgLT4gdCAqICgyIC0gdClcclxuXHRcdHF1YWQ6ICh0KSAtPlxyXG5cdFx0XHRpZiB0IDwgMC41XHJcblx0XHRcdFx0MiAqIHQgKiB0XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHQtMiAqIHQgKiB0ICsgNCAqIHQgLSAxXHJcblxyXG5cdFx0Y3ViaWNJbjogKHQpIC0+IHQgKiogM1xyXG5cdFx0Y3ViaWNPdXQ6ICh0KSAtPiAodCAtIDEpICoqIDMgKyAxXHJcblx0XHRjdWJpYzogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQ0ICogdCAqKiAzXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHQ0ICogKHQgLSAxKSAqKiAzICsgMVxyXG5cclxuXHRcdHNpbmVJbjogKHQpIC0+IE1hdGguc2luKCh0IC0gMSkgKiBCdS5IQUxGX1BJKSArIDFcclxuXHRcdHNpbmVPdXQ6ICh0KSAtPiBNYXRoLnNpbiB0ICogQnUuSEFMRl9QSVxyXG5cdFx0c2luZTogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQoTWF0aC5zaW4oKHQgKiAyIC0gMSkgKiBCdS5IQUxGX1BJKSArIDEpIC8gMlxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0TWF0aC5zaW4oKHQgLSAwLjUpICogTWF0aC5QSSkgLyAyICsgMC41XHJcblxyXG5cdFx0IyBUT0RPIGFkZCBxdWFydCwgcXVpbnQsIGV4cG8sIGNpcmMsIGJhY2ssIGVsYXN0aWMsIGJvdW5jZVxyXG5cclxuIyBnbG9iYWwgdW5pcXVlIGluc3RhbmNlXHJcbkJ1LmFuaW1hdGlvblJ1bm5lciA9IG5ldyBCdS5BbmltYXRpb25SdW5uZXJcclxuIiwiIyBTcHJpdGUgU2hlZXRcclxuXHJcbmNsYXNzIEJ1LlNwcml0ZVNoZWV0XHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHJcblx0XHRAcmVhZHkgPSBubyAjIElmIHRoaXMgc3ByaXRlIHNoZWV0IGlzIGxvYWRlZCBhbmQgcGFyc2VkLlxyXG5cdFx0QGhlaWdodCA9IDAgIyBIZWlnaHQgb2YgdGhpcyBzcHJpdGVcclxuXHJcblx0XHRAZGF0YSA9IG51bGwgIyBUaGUgSlNPTiBkYXRhXHJcblx0XHRAaW1hZ2VzID0gW10gIyBUaGUgYEltYWdlYCBsaXN0IGxvYWRlZFxyXG5cdFx0QGZyYW1lSW1hZ2VzID0gW10gIyBQYXJzZWQgZnJhbWUgaW1hZ2VzXHJcblxyXG5cdFx0IyBsb2FkIGFuZCB0cmlnZ2VyIHBhcnNlRGF0YSgpXHJcblx0XHQkLmFqYXggQHVybCwgc3VjY2VzczogKHRleHQpID0+XHJcblx0XHRcdEBkYXRhID0gSlNPTi5wYXJzZSB0ZXh0XHJcblxyXG5cdFx0XHRpZiBub3QgQGRhdGEuaW1hZ2VzP1xyXG5cdFx0XHRcdEBkYXRhLmltYWdlcyA9IFtAdXJsLnN1YnN0cmluZyhAdXJsLmxhc3RJbmRleE9mKCcvJyksIEB1cmwubGVuZ3RoIC0gNSkgKyAnLnBuZyddXHJcblxyXG5cdFx0XHRiYXNlVXJsID0gQHVybC5zdWJzdHJpbmcgMCwgQHVybC5sYXN0SW5kZXhPZignLycpICsgMVxyXG5cdFx0XHRmb3Igb3duIGkgb2YgQGRhdGEuaW1hZ2VzXHJcblx0XHRcdFx0QGRhdGEuaW1hZ2VzW2ldID0gYmFzZVVybCArIEBkYXRhLmltYWdlc1tpXVxyXG5cclxuXHRcdFx0XHRjb3VudExvYWRlZCA9IDBcclxuXHRcdFx0XHRAaW1hZ2VzW2ldID0gbmV3IEltYWdlXHJcblx0XHRcdFx0QGltYWdlc1tpXS5vbmxvYWQgPSAoKSA9PlxyXG5cdFx0XHRcdFx0Y291bnRMb2FkZWQgKz0gMVxyXG5cdFx0XHRcdFx0QHBhcnNlRGF0YSgpIGlmIGNvdW50TG9hZGVkID09IEBkYXRhLmltYWdlcy5sZW5ndGhcclxuXHRcdFx0XHRAaW1hZ2VzW2ldLnNyYyA9IEBkYXRhLmltYWdlc1tpXVxyXG5cclxuXHRwYXJzZURhdGE6IC0+XHJcblx0XHQjIENsaXAgdGhlIGltYWdlIGZvciBldmVyeSBmcmFtZXNcclxuXHRcdGZyYW1lcyA9IEBkYXRhLmZyYW1lc1xyXG5cdFx0Zm9yIG93biBpIG9mIGZyYW1lc1xyXG5cdFx0XHRmb3IgaiBpbiBbMC4uNF1cclxuXHRcdFx0XHRpZiBub3QgZnJhbWVzW2ldW2pdP1xyXG5cdFx0XHRcdFx0ZnJhbWVzW2ldW2pdID0gaWYgZnJhbWVzW2kgLSAxXT9bal0/IHRoZW4gZnJhbWVzW2kgLSAxXVtqXSBlbHNlIDBcclxuXHRcdFx0eCA9IGZyYW1lc1tpXVswXVxyXG5cdFx0XHR5ID0gZnJhbWVzW2ldWzFdXHJcblx0XHRcdHcgPSBmcmFtZXNbaV1bMl1cclxuXHRcdFx0aCA9IGZyYW1lc1tpXVszXVxyXG5cdFx0XHRmcmFtZUluZGV4ID0gZnJhbWVzW2ldWzRdXHJcblx0XHRcdEBmcmFtZUltYWdlc1tpXSA9IGNsaXBJbWFnZSBAaW1hZ2VzW2ZyYW1lSW5kZXhdLCB4LCB5LCB3LCBoXHJcblx0XHRcdEBoZWlnaHQgPSBoIGlmIEBoZWlnaHQgPT0gMFxyXG5cclxuXHRcdEByZWFkeSA9IHllc1xyXG5cdFx0QHRyaWdnZXIgJ2xvYWRlZCdcclxuXHJcblx0Z2V0RnJhbWVJbWFnZTogKGtleSwgaW5kZXggPSAwKSAtPlxyXG5cdFx0YW5pbWF0aW9uID0gQGRhdGEuYW5pbWF0aW9uc1trZXldXHJcblx0XHRyZXR1cm4gbnVsbCB1bmxlc3MgYW5pbWF0aW9uP1xyXG5cclxuXHRcdHJldHVybiBAZnJhbWVJbWFnZXNbYW5pbWF0aW9uLmZyYW1lc1tpbmRleF1dXHJcblxyXG5cdG1lYXN1cmVUZXh0V2lkdGg6ICh0ZXh0KSAtPlxyXG5cdFx0d2lkdGggPSAwXHJcblx0XHRmb3IgY2hhciBpbiB0ZXh0XHJcblx0XHRcdHdpZHRoICs9IEBnZXRGcmFtZUltYWdlKGNoYXIpLndpZHRoXHJcblx0XHR3aWR0aFxyXG5cclxuXHQjIFN0YXRpYyBtZW1iZXJzXHJcblxyXG5cdGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcclxuXHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xyXG5cclxuXHRjbGlwSW1hZ2UgPSAoaW1hZ2UsIHgsIHksIHcsIGgpIC0+XHJcblx0XHRjYW52YXMud2lkdGggPSB3XHJcblx0XHRjYW52YXMuaGVpZ2h0ID0gaFxyXG5cdFx0Y29udGV4dC5kcmF3SW1hZ2UgaW1hZ2UsIHgsIHksIHcsIGgsIDAsIDAsIHcsIGhcclxuXHJcblx0XHRuZXdJbWFnZSA9IG5ldyBJbWFnZSgpXHJcblx0XHRuZXdJbWFnZS5zcmMgPSBjYW52YXMudG9EYXRhVVJMKClcclxuXHRcdHJldHVybiBuZXdJbWFnZVxyXG4iLCIjIEdlb21ldHJ5IEFsZ29yaXRobSBHYXRoZXJcclxuXHJcbkJ1Lmdlb21ldHJ5QWxnb3JpdGhtID0gRyA9XHJcblxyXG5cdGluamVjdDogLT5cclxuXHRcdEBpbmplY3RJbnRvIFtcclxuXHRcdFx0J3BvaW50J1xyXG5cdFx0XHQnbGluZSdcclxuXHRcdFx0J2NpcmNsZSdcclxuXHRcdFx0J3RyaWFuZ2xlJ1xyXG5cdFx0XHQncmVjdGFuZ2xlJ1xyXG5cdFx0XHQnZmFuJ1xyXG5cdFx0XHQnYm93J1xyXG5cdFx0XHQncG9seWdvbidcclxuXHRcdFx0J3BvbHlsaW5lJ1xyXG5cdFx0XVxyXG5cclxuXHRpbmplY3RJbnRvOiAoc2hhcGVzKSAtPlxyXG5cdFx0c2hhcGVzID0gW3NoYXBlc10gaWYgdHlwZW9mIHNoYXBlcyA9PSAnc3RyaW5nJ1xyXG5cclxuXHRcdGlmICdwb2ludCcgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlBvaW50OjppbkNpcmNsZSA9IChjaXJjbGUpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluQ2lyY2xlIEAsIGNpcmNsZVxyXG5cdFx0XHRCdS5Qb2ludDo6ZGlzdGFuY2VUbyA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLmRpc3RhbmNlRnJvbVBvaW50VG9Qb2ludCBALCBwb2ludFxyXG5cdFx0XHRCdS5Qb2ludDo6aXNOZWFyID0gKHRhcmdldCwgbGltaXQgPSBCdS5ERUZBVUxUX05FQVJfRElTVCkgLT5cclxuXHRcdFx0XHRzd2l0Y2ggdGFyZ2V0LnR5cGVcclxuXHRcdFx0XHRcdHdoZW4gJ1BvaW50J1xyXG5cdFx0XHRcdFx0XHRHLnBvaW50TmVhclBvaW50IEAsIHRhcmdldCwgbGltaXRcclxuXHRcdFx0XHRcdHdoZW4gJ0xpbmUnXHJcblx0XHRcdFx0XHRcdEcucG9pbnROZWFyTGluZSBALCB0YXJnZXQsIGxpbWl0XHJcblx0XHRcdFx0XHR3aGVuICdQb2x5bGluZSdcclxuXHRcdFx0XHRcdFx0Ry5wb2ludE5lYXJQb2x5bGluZSBALCB0YXJnZXQsIGxpbWl0XHJcblx0XHRcdEJ1LlBvaW50LmludGVycG9sYXRlID0gRy5pbnRlcnBvbGF0ZUJldHdlZW5Ud29Qb2ludHNcclxuXHJcblx0XHRpZiAnbGluZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LkxpbmU6OmRpc3RhbmNlVG8gPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5kaXN0YW5jZUZyb21Qb2ludFRvTGluZSBwb2ludCwgQFxyXG5cdFx0XHRCdS5MaW5lOjppc1R3b1BvaW50c1NhbWVTaWRlID0gKHAxLCBwMikgLT5cclxuXHRcdFx0XHRHLnR3b1BvaW50c1NhbWVTaWRlT2ZMaW5lIHAxLCBwMiwgQFxyXG5cdFx0XHRCdS5MaW5lOjpmb290UG9pbnRGcm9tID0gKHBvaW50LCBzYXZlVG8pIC0+XHJcblx0XHRcdFx0Ry5mb290UG9pbnRGcm9tUG9pbnRUb0xpbmUgcG9pbnQsIEAsIHNhdmVUb1xyXG5cdFx0XHRCdS5MaW5lOjpnZXRDcm9zc1BvaW50V2l0aCA9IChsaW5lKSAtPlxyXG5cdFx0XHRcdEcuZ2V0Q3Jvc3NQb2ludE9mVHdvTGluZXMgbGluZSwgQFxyXG5cdFx0XHRCdS5MaW5lOjppc0Nyb3NzV2l0aExpbmUgPSAobGluZSkgLT5cclxuXHRcdFx0XHRHLmlzVHdvTGluZXNDcm9zcyBsaW5lLCBAXHJcblxyXG5cdFx0aWYgJ2NpcmNsZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LkNpcmNsZTo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluQ2lyY2xlIHBvaW50LCBAXHJcblxyXG5cdFx0aWYgJ3RyaWFuZ2xlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuVHJpYW5nbGU6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJblRyaWFuZ2xlIHBvaW50LCBAXHJcblx0XHRcdEJ1LlRyaWFuZ2xlOjphcmVhID0gLT5cclxuXHRcdFx0XHRHLmNhbGNUcmlhbmdsZUFyZWEgQFxyXG5cclxuXHRcdGlmICdyZWN0YW5nbGUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5SZWN0YW5nbGU6OmNvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluUmVjdGFuZ2xlIHBvaW50LCBAXHJcblxyXG5cdFx0aWYgJ2ZhbicgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LkZhbjo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluRmFuIHBvaW50LCBAXHJcblxyXG5cdFx0aWYgJ2JvdycgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LkJvdzo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluQm93IHBvaW50LCBAXHJcblxyXG5cdFx0aWYgJ3BvbHlnb24nIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Qb2x5Z29uOjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5Qb2x5Z29uIHBvaW50LCBAXHJcblxyXG5cdFx0aWYgJ3BvbHlsaW5lJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUG9seWxpbmU6Omxlbmd0aCA9IDBcclxuXHRcdFx0QnUuUG9seWxpbmU6OnBvaW50Tm9ybWFsaXplZFBvcyA9IFtdXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpjYWxjTGVuZ3RoID0gKCkgLT5cclxuXHRcdFx0XHRAbGVuZ3RoID0gRy5jYWxjUG9seWxpbmVMZW5ndGggQFxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Y2FsY1BvaW50Tm9ybWFsaXplZFBvcyA9IC0+XHJcblx0XHRcdFx0Ry5jYWxjTm9ybWFsaXplZFZlcnRpY2VzUG9zT2ZQb2x5bGluZSBAXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpnZXROb3JtYWxpemVkUG9zID0gKGluZGV4KSAtPlxyXG5cdFx0XHRcdGlmIGluZGV4PyB0aGVuIEBwb2ludE5vcm1hbGl6ZWRQb3NbaW5kZXhdIGVsc2UgQHBvaW50Tm9ybWFsaXplZFBvc1xyXG5cdFx0XHRCdS5Qb2x5bGluZTo6Y29tcHJlc3MgPSAoc3RyZW5ndGggPSAwLjgpIC0+XHJcblx0XHRcdFx0Ry5jb21wcmVzc1BvbHlsaW5lIEAsIHN0cmVuZ3RoXHJcblxyXG5cdCMgUG9pbnQgaW4gc2hhcGVzXHJcblxyXG5cdHBvaW50TmVhclBvaW50OiAocG9pbnQsIHRhcmdldCwgbGltaXQgPSBCdS5ERUZBVUxUX05FQVJfRElTVCkgLT5cclxuXHRcdHBvaW50LmRpc3RhbmNlVG8odGFyZ2V0KSA8IGxpbWl0XHJcblxyXG5cdHBvaW50TmVhckxpbmU6IChwb2ludCwgbGluZSwgbGltaXQgPSBCdS5ERUZBVUxUX05FQVJfRElTVCkgLT5cclxuXHRcdHZlcnRpY2FsRGlzdCA9IGxpbmUuZGlzdGFuY2VUbyBwb2ludFxyXG5cdFx0Zm9vdFBvaW50ID0gbGluZS5mb290UG9pbnRGcm9tIHBvaW50XHJcblxyXG5cdFx0aXNCZXR3ZWVuMSA9IGZvb3RQb2ludC5kaXN0YW5jZVRvKGxpbmUucG9pbnRzWzBdKSA8IGxpbmUubGVuZ3RoICsgbGltaXRcclxuXHRcdGlzQmV0d2VlbjIgPSBmb290UG9pbnQuZGlzdGFuY2VUbyhsaW5lLnBvaW50c1sxXSkgPCBsaW5lLmxlbmd0aCArIGxpbWl0XHJcblxyXG5cdFx0cmV0dXJuIHZlcnRpY2FsRGlzdCA8IGxpbWl0IGFuZCBpc0JldHdlZW4xIGFuZCBpc0JldHdlZW4yXHJcblxyXG5cdHBvaW50TmVhclBvbHlsaW5lOiAocG9pbnQsIHBvbHlsaW5lLCBsaW1pdCA9IEJ1LkRFRkFVTFRfTkVBUl9ESVNUKSAtPlxyXG5cdFx0Zm9yIGxpbmUgaW4gcG9seWxpbmUubGluZXNcclxuXHRcdFx0cmV0dXJuIHllcyBpZiBHLnBvaW50TmVhckxpbmUgcG9pbnQsIGxpbmUsIGxpbWl0XHJcblx0XHRub1xyXG5cclxuXHRwb2ludEluQ2lyY2xlOiAocG9pbnQsIGNpcmNsZSkgLT5cclxuXHRcdGR4ID0gcG9pbnQueCAtIGNpcmNsZS5jeFxyXG5cdFx0ZHkgPSBwb2ludC55IC0gY2lyY2xlLmN5XHJcblx0XHRyZXR1cm4gQnUuYmV2ZWwoZHgsIGR5KSA8IGNpcmNsZS5yYWRpdXNcclxuXHJcblx0cG9pbnRJblJlY3RhbmdsZTogKHBvaW50LCByZWN0YW5nbGUpIC0+XHJcblx0XHRwb2ludC54ID4gcmVjdGFuZ2xlLnBvaW50TFQueCBhbmRcclxuXHRcdFx0XHRwb2ludC55ID4gcmVjdGFuZ2xlLnBvaW50TFQueSBhbmRcclxuXHRcdFx0XHRwb2ludC54IDwgcmVjdGFuZ2xlLnBvaW50TFQueCArIHJlY3RhbmdsZS5zaXplLndpZHRoIGFuZFxyXG5cdFx0XHRcdHBvaW50LnkgPCByZWN0YW5nbGUucG9pbnRMVC55ICsgcmVjdGFuZ2xlLnNpemUuaGVpZ2h0XHJcblxyXG5cdHBvaW50SW5UcmlhbmdsZTogKHBvaW50LCB0cmlhbmdsZSkgLT5cclxuXHRcdEcudHdvUG9pbnRzU2FtZVNpZGVPZkxpbmUocG9pbnQsIHRyaWFuZ2xlLnBvaW50c1syXSwgdHJpYW5nbGUubGluZXNbMF0pIGFuZFxyXG5cdFx0XHRcdEcudHdvUG9pbnRzU2FtZVNpZGVPZkxpbmUocG9pbnQsIHRyaWFuZ2xlLnBvaW50c1swXSwgdHJpYW5nbGUubGluZXNbMV0pIGFuZFxyXG5cdFx0XHRcdEcudHdvUG9pbnRzU2FtZVNpZGVPZkxpbmUocG9pbnQsIHRyaWFuZ2xlLnBvaW50c1sxXSwgdHJpYW5nbGUubGluZXNbMl0pXHJcblxyXG5cdHBvaW50SW5GYW46IChwb2ludCwgZmFuKSAtPlxyXG5cdFx0ZHggPSBwb2ludC54IC0gZmFuLmN4XHJcblx0XHRkeSA9IHBvaW50LnkgLSBmYW4uY3lcclxuXHRcdGEgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBmYW4uY3ksIHBvaW50LnggLSBmYW4uY3gpXHJcblx0XHRhICs9IE1hdGguUEkgKiAyIHdoaWxlIGEgPCBmYW4uYUZyb21cclxuXHRcdHJldHVybiBCdS5iZXZlbChkeCwgZHkpIDwgZmFuLnJhZGl1cyAmJiBhID4gZmFuLmFGcm9tICYmIGEgPCBmYW4uYVRvXHJcblxyXG5cdHBvaW50SW5Cb3c6IChwb2ludCwgYm93KSAtPlxyXG5cdFx0aWYgQnUuYmV2ZWwoYm93LmN4IC0gcG9pbnQueCwgYm93LmN5IC0gcG9pbnQueSkgPCBib3cucmFkaXVzXHJcblx0XHRcdHNhbWVTaWRlID0gYm93LnN0cmluZy5pc1R3b1BvaW50c1NhbWVTaWRlKGJvdy5jZW50ZXIsIHBvaW50KVxyXG5cdFx0XHRzbWFsbFRoYW5IYWxmQ2lyY2xlID0gYm93LmFUbyAtIGJvdy5hRnJvbSA8IE1hdGguUElcclxuXHRcdFx0cmV0dXJuIHNhbWVTaWRlIF4gc21hbGxUaGFuSGFsZkNpcmNsZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gZmFsc2VcclxuXHJcblx0cG9pbnRJblBvbHlnb246IChwb2ludCwgcG9seWdvbikgLT5cclxuXHRcdGZvciB0cmlhbmdsZSBpbiBwb2x5Z29uLnRyaWFuZ2xlc1xyXG5cdFx0XHRpZiB0cmlhbmdsZS5jb250YWluc1BvaW50IHBvaW50XHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdGZhbHNlXHJcblxyXG5cdCMgRGlzdGFuY2VcclxuXHJcblx0ZGlzdGFuY2VGcm9tUG9pbnRUb1BvaW50OiAocG9pbnQxLCBwb2ludDIpIC0+XHJcblx0XHRCdS5iZXZlbCBwb2ludDEueCAtIHBvaW50Mi54LCBwb2ludDEueSAtIHBvaW50Mi55XHJcblxyXG5cdGRpc3RhbmNlRnJvbVBvaW50VG9MaW5lOiAocG9pbnQsIGxpbmUpIC0+XHJcblx0XHRwMSA9IGxpbmUucG9pbnRzWzBdXHJcblx0XHRwMiA9IGxpbmUucG9pbnRzWzFdXHJcblx0XHRhID0gKHAxLnkgLSBwMi55KSAvIChwMS54IC0gcDIueClcclxuXHRcdGIgPSBwMS55IC0gYSAqIHAxLnhcclxuXHRcdHJldHVybiBNYXRoLmFicyhhICogcG9pbnQueCArIGIgLSBwb2ludC55KSAvIE1hdGguc3FydChhICogYSArIDEpXHJcblxyXG5cdCMgUG9pbnQgUmVsYXRlZFxyXG5cclxuXHRpbnRlcnBvbGF0ZUJldHdlZW5Ud29Qb2ludHM6IChwMSwgcDIsIGssIHAzKSAtPlxyXG5cdFx0eCA9IHAxLnggKyAocDIueCAtIHAxLngpICoga1xyXG5cdFx0eSA9IHAxLnkgKyAocDIueSAtIHAxLnkpICoga1xyXG5cclxuXHRcdGlmIHAzP1xyXG5cdFx0XHRwMy5zZXQgeCwgeVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IHgsIHlcclxuXHJcblx0IyBQb2ludCBhbmQgTGluZVxyXG5cclxuXHR0d29Qb2ludHNTYW1lU2lkZU9mTGluZTogKHAxLCBwMiwgbGluZSkgLT5cclxuXHRcdHBBID0gbGluZS5wb2ludHNbMF1cclxuXHRcdHBCID0gbGluZS5wb2ludHNbMV1cclxuXHRcdGlmIHBBLnggPT0gcEIueFxyXG5cdFx0XHQjIGlmIGJvdGggb2YgdGhlIHR3byBwb2ludHMgYXJlIG9uIHRoZSBsaW5lIHRoZW4gd2UgY29uc2lkZXIgdGhleSBhcmUgaW4gdGhlIHNhbWUgc2lkZVxyXG5cdFx0XHRyZXR1cm4gKHAxLnggLSBwQS54KSAqIChwMi54IC0gcEEueCkgPiAwXHJcblx0XHRlbHNlXHJcblx0XHRcdHkwMSA9IChwQS55IC0gcEIueSkgKiAocDEueCAtIHBBLngpIC8gKHBBLnggLSBwQi54KSArIHBBLnlcclxuXHRcdFx0eTAyID0gKHBBLnkgLSBwQi55KSAqIChwMi54IC0gcEEueCkgLyAocEEueCAtIHBCLngpICsgcEEueVxyXG5cdFx0XHRyZXR1cm4gKHAxLnkgLSB5MDEpICogKHAyLnkgLSB5MDIpID4gMFxyXG5cclxuXHRmb290UG9pbnRGcm9tUG9pbnRUb0xpbmU6IChwb2ludCwgbGluZSwgc2F2ZVRvID0gbmV3IEJ1LlBvaW50KSAtPlxyXG5cdFx0cDEgPSBsaW5lLnBvaW50c1swXVxyXG5cdFx0cDIgPSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0QSA9IChwMS55IC0gcDIueSkgLyAocDEueCAtIHAyLngpXHJcblx0XHRCID0gcDEueSAtIEEgKiBwMS54XHJcblx0XHRtID0gcG9pbnQueCArIEEgKiBwb2ludC55XHJcblx0XHR4ID0gKG0gLSBBICogQikgLyAoQSAqIEEgKyAxKVxyXG5cdFx0eSA9IEEgKiB4ICsgQlxyXG5cclxuXHRcdHNhdmVUby5zZXQgeCwgeVxyXG5cdFx0cmV0dXJuIHNhdmVUb1xyXG5cclxuXHRnZXRDcm9zc1BvaW50T2ZUd29MaW5lczogKGxpbmUxLCBsaW5lMikgLT5cclxuXHRcdFtwMSwgcDJdID0gbGluZTEucG9pbnRzXHJcblx0XHRbcTEsIHEyXSA9IGxpbmUyLnBvaW50c1xyXG5cclxuXHRcdGExID0gcDIueSAtIHAxLnlcclxuXHRcdGIxID0gcDEueCAtIHAyLnhcclxuXHRcdGMxID0gKGExICogcDEueCkgKyAoYjEgKiBwMS55KVxyXG5cdFx0YTIgPSBxMi55IC0gcTEueVxyXG5cdFx0YjIgPSBxMS54IC0gcTIueFxyXG5cdFx0YzIgPSAoYTIgKiBxMS54KSArIChiMiAqIHExLnkpXHJcblx0XHRkZXQgPSAoYTEgKiBiMikgLSAoYTIgKiBiMSlcclxuXHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50ICgoYjIgKiBjMSkgLSAoYjEgKiBjMikpIC8gZGV0LCAoKGExICogYzIpIC0gKGEyICogYzEpKSAvIGRldFxyXG5cclxuXHRpc1R3b0xpbmVzQ3Jvc3M6IChsaW5lMSwgbGluZTIpIC0+XHJcblx0XHR4MSA9IGxpbmUxLnBvaW50c1swXS54XHJcblx0XHR5MSA9IGxpbmUxLnBvaW50c1swXS55XHJcblx0XHR4MiA9IGxpbmUxLnBvaW50c1sxXS54XHJcblx0XHR5MiA9IGxpbmUxLnBvaW50c1sxXS55XHJcblx0XHR4MyA9IGxpbmUyLnBvaW50c1swXS54XHJcblx0XHR5MyA9IGxpbmUyLnBvaW50c1swXS55XHJcblx0XHR4NCA9IGxpbmUyLnBvaW50c1sxXS54XHJcblx0XHR5NCA9IGxpbmUyLnBvaW50c1sxXS55XHJcblxyXG5cdFx0ZCA9ICh5MiAtIHkxKSAqICh4NCAtIHgzKSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKVxyXG5cclxuXHRcdGlmIGQgPT0gMFxyXG5cdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdGVsc2VcclxuXHRcdFx0eDAgPSAoKHgyIC0geDEpICogKHg0IC0geDMpICogKHkzIC0geTEpICsgKHkyIC0geTEpICogKHg0IC0geDMpICogeDEgLSAoeTQgLSB5MykgKiAoeDIgLSB4MSkgKiB4MykgLyBkXHJcblx0XHRcdHkwID0gKCh5MiAtIHkxKSAqICh5NCAtIHkzKSAqICh4MyAtIHgxKSArICh4MiAtIHgxKSAqICh5NCAtIHkzKSAqIHkxIC0gKHg0IC0geDMpICogKHkyIC0geTEpICogeTMpIC8gLWRcclxuXHRcdHJldHVybiAoeDAgLSB4MSkgKiAoeDAgLSB4MikgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeDAgLSB4MykgKiAoeDAgLSB4NCkgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeTAgLSB5MSkgKiAoeTAgLSB5MikgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeTAgLSB5MykgKiAoeTAgLSB5NCkgPCAwXHJcblxyXG5cdCMgUG9seWxpbmVcclxuXHJcblx0Y2FsY1BvbHlsaW5lTGVuZ3RoOiAocG9seWxpbmUpIC0+XHJcblx0XHRsZW4gPSAwXHJcblx0XHRpZiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGggPj0gMlxyXG5cdFx0XHRmb3IgaSBpbiBbMSAuLi4gcG9seWxpbmUudmVydGljZXMubGVuZ3RoXVxyXG5cdFx0XHRcdGxlbiArPSBwb2x5bGluZS52ZXJ0aWNlc1tpXS5kaXN0YW5jZVRvIHBvbHlsaW5lLnZlcnRpY2VzW2kgLSAxXVxyXG5cdFx0cmV0dXJuIGxlblxyXG5cclxuXHRjYWxjTm9ybWFsaXplZFZlcnRpY2VzUG9zT2ZQb2x5bGluZTogKHBvbHlsaW5lKSAtPlxyXG5cdFx0Y3VyclBvcyA9IDBcclxuXHRcdHBvbHlsaW5lLnBvaW50Tm9ybWFsaXplZFBvc1swXSA9IDBcclxuXHRcdGZvciBpIGluIFsxIC4uLiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdGN1cnJQb3MgKz0gcG9seWxpbmUudmVydGljZXNbaV0uZGlzdGFuY2VUbyhwb2x5bGluZS52ZXJ0aWNlc1tpIC0gMV0pIC8gcG9seWxpbmUubGVuZ3RoXHJcblx0XHRcdHBvbHlsaW5lLnBvaW50Tm9ybWFsaXplZFBvc1tpXSA9IGN1cnJQb3NcclxuXHJcblx0Y29tcHJlc3NQb2x5bGluZTogKHBvbHlsaW5lLCBzdHJlbmd0aCkgLT5cclxuXHRcdGNvbXByZXNzZWQgPSBbXVxyXG5cdFx0Zm9yIG93biBpIG9mIHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdGlmIGkgPCAyXHJcblx0XHRcdFx0Y29tcHJlc3NlZFtpXSA9IHBvbHlsaW5lLnZlcnRpY2VzW2ldXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRbcEEsIHBNXSA9IGNvbXByZXNzZWRbLTIuLi0xXVxyXG5cdFx0XHRcdHBCID0gcG9seWxpbmUudmVydGljZXNbaV1cclxuXHRcdFx0XHRvYmxpcXVlQW5nbGUgPSBNYXRoLmFicyhNYXRoLmF0YW4yKHBBLnkgLSBwTS55LCBwQS54IC0gcE0ueCkgLSBNYXRoLmF0YW4yKHBNLnkgLSBwQi55LCBwTS54IC0gcEIueCkpXHJcblx0XHRcdFx0aWYgb2JsaXF1ZUFuZ2xlIDwgc3RyZW5ndGggKiBzdHJlbmd0aCAqIE1hdGguUEkgLyAyXHJcblx0XHRcdFx0XHRjb21wcmVzc2VkW2NvbXByZXNzZWQubGVuZ3RoIC0gMV0gPSBwQlxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGNvbXByZXNzZWQucHVzaCBwQlxyXG5cdFx0cG9seWxpbmUudmVydGljZXMgPSBjb21wcmVzc2VkXHJcblx0XHRwb2x5bGluZS5rZXlQb2ludHMgPSBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0cmV0dXJuIHBvbHlsaW5lXHJcblxyXG5cdCMgQXJlYSBDYWxjdWxhdGlvblxyXG5cclxuXHRjYWxjVHJpYW5nbGVBcmVhOiAodHJpYW5nbGUpIC0+XHJcblx0XHRbYSwgYiwgY10gPSB0cmlhbmdsZS5wb2ludHNcclxuXHRcdHJldHVybiBNYXRoLmFicygoKGIueCAtIGEueCkgKiAoYy55IC0gYS55KSkgLSAoKGMueCAtIGEueCkgKiAoYi55IC0gYS55KSkpIC8gMlxyXG5cclxuRy5pbmplY3QoKVxyXG4iLCIjIGdlbmVyYXRvciByYW5kb20gc2hhcGVzXHJcblxyXG5jbGFzcyBCdS5SYW5kb21TaGFwZUdlbmVyYXRvclxyXG5cclxuXHRNQVJHSU4gPSAzMFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBidSkgLT5cclxuXHJcblx0cmFuZG9tWDogLT5cclxuXHRcdHJldHVybiBCdS5yYW5kIE1BUkdJTiwgQGJ1LndpZHRoIC0gTUFSR0lOICogMlxyXG5cclxuXHRyYW5kb21ZOiAtPlxyXG5cdFx0cmV0dXJuIEJ1LnJhbmQgTUFSR0lOLCBAYnUuaGVpZ2h0IC0gTUFSR0lOICogMlxyXG5cclxuXHRyYW5kb21SYWRpdXM6IC0+XHJcblx0XHRyZXR1cm4gQnUucmFuZCA1LCBNYXRoLm1pbihAYnUud2lkdGgsIEBidS5oZWlnaHQpIC8gMlxyXG5cclxuXHJcblx0Z2VuZXJhdGU6ICh0eXBlKSAtPlxyXG5cdFx0c3dpdGNoIHR5cGVcclxuXHRcdFx0d2hlbiAnY2lyY2xlJyB0aGVuIEBnZW5lcmF0ZUNpcmNsZSgpXHJcblx0XHRcdHdoZW4gJ2JvdycgdGhlbiBAZ2VuZXJhdGVCb3coKVxyXG5cdFx0XHR3aGVuICd0cmlhbmdsZScgdGhlbiBAZ2VuZXJhdGVUcmlhbmdsZSgpXHJcblx0XHRcdHdoZW4gJ3JlY3RhbmdsZScgdGhlbiBAZ2VuZXJhdGVSZWN0YW5nbGUoKVxyXG5cdFx0XHR3aGVuICdmYW4nIHRoZW4gQGdlbmVyYXRlRmFuKClcclxuXHRcdFx0d2hlbiAncG9seWdvbicgdGhlbiBAZ2VuZXJhdGVQb2x5Z29uKClcclxuXHRcdFx0d2hlbiAnbGluZScgdGhlbiBAZ2VuZXJhdGVMaW5lKClcclxuXHRcdFx0d2hlbiAncG9seWxpbmUnIHRoZW4gQGdlbmVyYXRlUG9seWxpbmUoKVxyXG5cdFx0XHRlbHNlIGNvbnNvbGUud2FybiAnbm90IHN1cHBvcnQgc2hhcGU6ICcgKyB0eXBlXHJcblxyXG5cdGdlbmVyYXRlQ2lyY2xlOiAtPlxyXG5cdFx0Y2lyY2xlID0gbmV3IEJ1LkNpcmNsZSBAcmFuZG9tUmFkaXVzKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGNpcmNsZS5jZW50ZXIubGFiZWwgPSAnTydcclxuXHRcdHJldHVybiBjaXJjbGVcclxuXHJcblx0Z2VuZXJhdGVCb3c6IC0+XHJcblx0XHRhRnJvbSA9IEJ1LnJhbmQgTWF0aC5QSSAqIDJcclxuXHRcdGFUbyA9IGFGcm9tICsgQnUucmFuZCBNYXRoLlBJIC8gMiwgTWF0aC5QSSAqIDJcclxuXHJcblx0XHRib3cgPSBuZXcgQnUuQm93IEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21SYWRpdXMoKSwgYUZyb20sIGFUb1xyXG5cdFx0Ym93LnN0cmluZy5wb2ludHNbMF0ubGFiZWwgPSAnQSdcclxuXHRcdGJvdy5zdHJpbmcucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHRyZXR1cm4gYm93XHJcblxyXG5cdGdlbmVyYXRlVHJpYW5nbGU6IC0+XHJcblx0XHRwb2ludHMgPSBbXVxyXG5cdFx0Zm9yIGkgaW4gWzAuLjJdXHJcblx0XHRcdHBvaW50c1tpXSA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblxyXG5cdFx0dHJpYW5nbGUgPSBuZXcgQnUuVHJpYW5nbGUgcG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXVxyXG5cdFx0dHJpYW5nbGUucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHR0cmlhbmdsZS5wb2ludHNbMV0ubGFiZWwgPSAnQidcclxuXHRcdHRyaWFuZ2xlLnBvaW50c1syXS5sYWJlbCA9ICdDJ1xyXG5cdFx0cmV0dXJuIHRyaWFuZ2xlXHJcblxyXG5cdGdlbmVyYXRlUmVjdGFuZ2xlOiAtPlxyXG5cdFx0cmV0dXJuIG5ldyBCdS5SZWN0YW5nbGUoXHJcblx0XHRcdEJ1LnJhbmQoQGJ1LndpZHRoKVxyXG5cdFx0XHRCdS5yYW5kKEBidS5oZWlnaHQpXHJcblx0XHRcdEJ1LnJhbmQoQGJ1LndpZHRoIC8gMilcclxuXHRcdFx0QnUucmFuZChAYnUuaGVpZ2h0IC8gMilcclxuXHRcdClcclxuXHJcblx0Z2VuZXJhdGVGYW46IC0+XHJcblx0XHRhRnJvbSA9IEJ1LnJhbmQgTWF0aC5QSSAqIDJcclxuXHRcdGFUbyA9IGFGcm9tICsgQnUucmFuZCBNYXRoLlBJIC8gMiwgTWF0aC5QSSAqIDJcclxuXHJcblx0XHRmYW4gPSBuZXcgQnUuRmFuIEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21SYWRpdXMoKSwgYUZyb20sIGFUb1xyXG5cdFx0ZmFuLnN0cmluZy5wb2ludHNbMF0ubGFiZWwgPSAnQSdcclxuXHRcdGZhbi5zdHJpbmcucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHRyZXR1cm4gZmFuXHJcblxyXG5cdGdlbmVyYXRlUG9seWdvbjogLT5cclxuXHRcdHBvaW50cyA9IFtdXHJcblxyXG5cdFx0Zm9yIGkgaW4gWzAuLjNdXHJcblx0XHRcdHBvaW50ID0gbmV3IEJ1LlBvaW50IEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdFx0cG9pbnQubGFiZWwgPSAnUCcgKyBpXHJcblx0XHRcdHBvaW50cy5wdXNoIHBvaW50XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBCdS5Qb2x5Z29uIHBvaW50c1xyXG5cclxuXHRnZW5lcmF0ZUxpbmU6IC0+XHJcblx0XHRsaW5lID0gbmV3IEJ1LkxpbmUgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSwgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cdFx0bGluZS5wb2ludHNbMF0ubGFiZWwgPSAnQSdcclxuXHRcdGxpbmUucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHRyZXR1cm4gbGluZVxyXG5cclxuXHRnZW5lcmF0ZVBvbHlsaW5lOiAtPlxyXG5cdFx0cG9seWxpbmUgPSBuZXcgQnUuUG9seWxpbmVcclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2x5bGluZS5hZGRQb2ludCBwb2ludFxyXG5cdFx0cmV0dXJuIHBvbHlsaW5lXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

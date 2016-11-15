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
      if (clone.constructor.name === 'Function') {
        console.log(clone);
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
        if (type === 'mousedown' || type === 'mousemove' || type === 'mouseup' || type === 'keydown' || type === 'keyup') {
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
      ref = ['container', 'width', 'height', 'fps', 'showKeyPoints', 'showBounds', 'originAtCenter'];
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
      this.dom.style.background = options.background;
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
          return console.error('animation moveTo need an argument');
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
          return console.error('animation moveTo need an argument');
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
    var interpolateNum, interpolateObject;

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

    AnimationTask.prototype.interpolate = function() {
      var key, ref, results;
      if (Bu.isNumber(this.from)) {
        return this.current = interpolateNum(this.from, this.to, this.t);
      } else if (this.from instanceof Bu.Color) {
        return interpolateObject(this.from, this.to, this.t, this.current);
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
      }
    };

    interpolateNum = function(a, b, t) {
      return b * t - a * (t - 1);
    };

    interpolateObject = function(a, b, t, c) {
      if (a instanceof Bu.Color) {
        return c.setRGBA(interpolateNum(a.r, b.r, t), interpolateNum(a.g, b.g, t), interpolateNum(a.b, b.b, t), interpolateNum(a.a, b.a, t));
      } else {
        return console.error("AnimationTask.interpolateObject() doesn't support object type: ", a);
      }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1LmNvZmZlZSIsIkJvdW5kcy5jb2ZmZWUiLCJDb2xvci5jb2ZmZWUiLCJTaXplLmNvZmZlZSIsIlZlY3Rvci5jb2ZmZWUiLCJFdmVudC5jb2ZmZWUiLCJNaWNyb0pRdWVyeS5jb2ZmZWUiLCJPYmplY3QyRC5jb2ZmZWUiLCJTdHlsZWQuY29mZmVlIiwiQXBwLmNvZmZlZSIsIkF1ZGlvLmNvZmZlZSIsIkNhbWVyYS5jb2ZmZWUiLCJJbnB1dE1hbmFnZXIuY29mZmVlIiwiUmVuZGVyZXIuY29mZmVlIiwiU2NlbmUuY29mZmVlIiwiQm93LmNvZmZlZSIsIkNpcmNsZS5jb2ZmZWUiLCJFbGxpcHNlLmNvZmZlZSIsIkZhbi5jb2ZmZWUiLCJMaW5lLmNvZmZlZSIsIlBvaW50LmNvZmZlZSIsIlBvbHlnb24uY29mZmVlIiwiUG9seWxpbmUuY29mZmVlIiwiUmVjdGFuZ2xlLmNvZmZlZSIsIlNwbGluZS5jb2ZmZWUiLCJUcmlhbmdsZS5jb2ZmZWUiLCJJbWFnZS5jb2ZmZWUiLCJQb2ludFRleHQuY29mZmVlIiwiQW5pbWF0aW9uLmNvZmZlZSIsIkFuaW1hdGlvblJ1bm5lci5jb2ZmZWUiLCJBbmltYXRpb25UYXNrLmNvZmZlZSIsIkRhc2hGbG93TWFuYWdlci5jb2ZmZWUiLCJTcHJpdGVTaGVldC5jb2ZmZWUiLCJnZW9tZXRyeUFsZ29yaXRobS5jb2ZmZWUiLCJTaGFwZVJhbmRvbWl6ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQTtBQUFBLE1BQUEsMENBQUE7SUFBQTs7RUFBQSxNQUFBLEdBQVMsTUFBQSxJQUFVOztFQUNuQixNQUFNLENBQUMsRUFBUCxHQUFZO0lBQUMsUUFBQSxNQUFEOzs7RUFRWixFQUFFLENBQUMsT0FBSCxHQUFhOztFQUdiLEVBQUUsQ0FBQyx1QkFBSCxHQUE2QixDQUFDLFFBQUQsRUFBVyxLQUFYLEVBQWtCLElBQWxCOztFQUc3QixFQUFFLENBQUMsT0FBSCxHQUFhLElBQUksQ0FBQyxFQUFMLEdBQVU7O0VBQ3ZC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QUphOzs4QkFNZCxhQUFBLEdBQWUsU0FBQyxJQUFEO0FBQ2QsVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVixFQUFzQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXRCO0FBQUE7TUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWI7YUFDQTtJQUhjOzs4QkFLZixnQkFBQSxHQUFrQixTQUFBO0FBQ2pCLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBSSxFQUFFLENBQUM7QUFDbEIsV0FBUywwQkFBVDtRQUNDLEtBQUEsR0FBWSxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFULEVBQXFCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBckI7UUFDWixLQUFLLENBQUMsS0FBTixHQUFjLEdBQUEsR0FBTTtRQUNwQixRQUFRLENBQUMsUUFBVCxDQUFrQixLQUFsQjtBQUhEO2FBSUE7SUFOaUI7OzhCQVFsQixpQkFBQSxHQUFtQixTQUFDLFFBQUQ7QUFDbEIsVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBWCxFQUF1QixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXZCO0FBQUE7TUFDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFqQjthQUNBO0lBSGtCOzs7OztBQXBMcEIiLCJmaWxlIjoiYnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIE5hbWVzcGFjZSwgY29uc3RhbnRzLCB1dGlsaXR5IGZ1bmN0aW9ucyBhbmQgcG9seWZpbGxzXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIE5hbWVzcGFjZVxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZ2xvYmFsID0gd2luZG93IG9yIEBcclxuZ2xvYmFsLkJ1ID0ge2dsb2JhbH1cclxuXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENvbnN0YW50c1xyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuIyBWZXJzaW9uIGluZm9cclxuQnUuVkVSU0lPTiA9ICcwLjQuMCdcclxuXHJcbiMgQnJvd3NlciB2ZW5kb3IgcHJlZml4ZXMsIHVzZWQgaW4gZXhwZXJpbWVudGFsIGZlYXR1cmVzXHJcbkJ1LkJST1dTRVJfVkVORE9SX1BSRUZJWEVTID0gWyd3ZWJraXQnLCAnbW96JywgJ21zJ11cclxuXHJcbiMgTWF0aFxyXG5CdS5IQUxGX1BJID0gTWF0aC5QSSAvIDJcclxuQnUuVFdPX1BJID0gTWF0aC5QSSAqIDJcclxuXHJcbiMgRGVmYXVsdCBmb250IGZvciB0aGUgdGV4dFxyXG5CdS5ERUZBVUxUX0ZPTlRfRkFNSUxZID0gJ1ZlcmRhbmEnXHJcbkJ1LkRFRkFVTFRfRk9OVF9TSVpFID0gMTFcclxuQnUuREVGQVVMVF9GT05UID0gJzExcHggVmVyZGFuYSdcclxuXHJcbiMgUG9pbnQgaXMgcmVuZGVyZWQgYXMgYSBzbWFsbCBjaXJjbGUgb24gc2NyZWVuLiBUaGlzIGlzIHRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZS5cclxuQnUuUE9JTlRfUkVOREVSX1NJWkUgPSAyLjI1XHJcblxyXG4jIFBvaW50IGNhbiBoYXZlIGEgbGFiZWwgYXR0YWNoZWQgbmVhciBpdC4gVGhpcyBpcyB0aGUgZ2FwIGRpc3RhbmNlIGJldHdlZW4gdGhlbS5cclxuQnUuUE9JTlRfTEFCRUxfT0ZGU0VUID0gNVxyXG5cclxuIyBEZWZhdWx0IHNtb290aCBmYWN0b3Igb2Ygc3BsaW5lLCByYW5nZSBpbiBbMCwgMV0gYW5kIDEgaXMgdGhlIHNtb290aGVzdFxyXG5CdS5ERUZBVUxUX1NQTElORV9TTU9PVEggPSAwLjI1XHJcblxyXG4jIEhvdyBjbG9zZSBhIHBvaW50IHRvIGEgbGluZSBpcyByZWdhcmRlZCB0aGF0IHRoZSBwb2ludCBpcyAqKk9OKiogdGhlIGxpbmUuXHJcbkJ1LkRFRkFVTFRfTkVBUl9ESVNUID0gNVxyXG5cclxuIyBFbnVtZXJhdGlvbiBvZiBtb3VzZSBidXR0b25zXHJcbkJ1Lk1PVVNFX0JVVFRPTl9OT05FID0gLTFcclxuQnUuTU9VU0VfQlVUVE9OX0xFRlQgPSAwXHJcbkJ1Lk1PVVNFX0JVVFRPTl9NSURETEUgPSAxXHJcbkJ1Lk1PVVNFX0JVVFRPTl9SSUdIVCA9IDJcclxuXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFV0aWxpdHkgZnVuY3Rpb25zXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIENhbGN1bGF0ZSB0aGUgbWVhbiB2YWx1ZSBvZiBudW1iZXJzXHJcbkJ1LmF2ZXJhZ2UgPSAoKS0+XHJcblx0bnMgPSBhcmd1bWVudHNcclxuXHRucyA9IGFyZ3VtZW50c1swXSBpZiB0eXBlb2YgYXJndW1lbnRzWzBdIGlzICdvYmplY3QnXHJcblx0c3VtID0gMFxyXG5cdGZvciBpIGluIG5zXHJcblx0XHRzdW0gKz0gaVxyXG5cdHN1bSAvIG5zLmxlbmd0aFxyXG5cclxuIyBDYWxjdWxhdGUgdGhlIGh5cG90ZW51c2UgZnJvbSB0aGUgY2F0aGV0dXNlc1xyXG5CdS5iZXZlbCA9ICh4LCB5KSAtPlxyXG5cdE1hdGguc3FydCB4ICogeCArIHkgKiB5XHJcblxyXG4jIExpbWl0IGEgbnVtYmVyIGJ5IG1pbmltdW0gdmFsdWUgYW5kIG1heGltdW0gdmFsdWVcclxuQnUuY2xhbXAgPSAoeCwgbWluLCBtYXgpIC0+XHJcblx0eCA9IG1pbiBpZiB4IDwgbWluXHJcblx0eCA9IG1heCBpZiB4ID4gbWF4XHJcblx0eFxyXG5cclxuIyBHZW5lcmF0ZSBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gbnVtYmVyc1xyXG5CdS5yYW5kID0gKGZyb20sIHRvKSAtPlxyXG5cdGlmIG5vdCB0bz9cclxuXHRcdHRvID0gZnJvbVxyXG5cdFx0ZnJvbSA9IDBcclxuXHRNYXRoLnJhbmRvbSgpICogKHRvIC0gZnJvbSkgKyBmcm9tXHJcblxyXG4jIENvbnZlcnQgYW4gYW5nbGUgZnJvbSByYWRpYW4gdG8gZGVnXHJcbkJ1LnIyZCA9IChyKSAtPiAociAqIDE4MCAvIE1hdGguUEkpLnRvRml4ZWQoMSlcclxuXHJcbiMgQ29udmVydCBhbiBhbmdsZSBmcm9tIGRlZyB0byByYWRpYW5cclxuQnUuZDJyID0gKHIpIC0+IHIgKiBNYXRoLlBJIC8gMTgwXHJcblxyXG4jIEdldCB0aGUgY3VycmVudCB0aW1lc3RhbXBcclxuQnUubm93ID0gaWYgQnUuZ2xvYmFsLnBlcmZvcm1hbmNlPyB0aGVuIC0+IEJ1Lmdsb2JhbC5wZXJmb3JtYW5jZS5ub3coKSBlbHNlIC0+IERhdGUubm93KClcclxuXHJcbiMgQ29tYmluZSB0aGUgZ2l2ZW4gb3B0aW9ucyAobGFzdCBpdGVtIG9mIGFyZ3VtZW50cykgd2l0aCB0aGUgZGVmYXVsdCBvcHRpb25zXHJcbkJ1LmNvbWJpbmVPcHRpb25zID0gKGFyZ3MsIGRlZmF1bHRPcHRpb25zKSAtPlxyXG5cdGRlZmF1bHRPcHRpb25zID0ge30gaWYgbm90IGRlZmF1bHRPcHRpb25zP1xyXG5cdGdpdmVuT3B0aW9ucyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXVxyXG5cdGlmIEJ1LmlzUGxhaW5PYmplY3QgZ2l2ZW5PcHRpb25zXHJcblx0XHRmb3IgaSBvZiBnaXZlbk9wdGlvbnMgd2hlbiBnaXZlbk9wdGlvbnNbaV0/XHJcblx0XHRcdGRlZmF1bHRPcHRpb25zW2ldID0gZ2l2ZW5PcHRpb25zW2ldXHJcblx0cmV0dXJuIGRlZmF1bHRPcHRpb25zXHJcblxyXG4jIENoZWNrIGlmIGFuIHZhcmlhYmxlIGlzIGEgbnVtYmVyXHJcbkJ1LmlzTnVtYmVyID0gKG8pIC0+XHJcblx0dHlwZW9mIG8gPT0gJ251bWJlcidcclxuXHJcbiMgQ2hlY2sgaWYgYW4gdmFyaWFibGUgaXMgYSBzdHJpbmdcclxuQnUuaXNTdHJpbmcgPSAobykgLT5cclxuXHR0eXBlb2YgbyA9PSAnc3RyaW5nJ1xyXG5cclxuIyBDaGVjayBpZiBhbiBvYmplY3QgaXMgYW4gcGxhaW4gb2JqZWN0LCBub3QgaW5zdGFuY2Ugb2YgY2xhc3MvZnVuY3Rpb25cclxuQnUuaXNQbGFpbk9iamVjdCA9IChvKSAtPlxyXG5cdG8gaW5zdGFuY2VvZiBPYmplY3QgYW5kIG8uY29uc3RydWN0b3IubmFtZSA9PSAnT2JqZWN0J1xyXG5cclxuIyBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBmdW5jdGlvblxyXG5CdS5pc0Z1bmN0aW9uID0gKG8pIC0+XHJcblx0byBpbnN0YW5jZW9mIE9iamVjdCBhbmQgby5jb25zdHJ1Y3Rvci5uYW1lID09ICdGdW5jdGlvbidcclxuXHJcbiMgQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGEgQXJyYXlcclxuQnUuaXNBcnJheSA9IChvKSAtPlxyXG5cdG8gaW5zdGFuY2VvZiBBcnJheVxyXG5cclxuIyBDbG9uZSBhbiBPYmplY3Qgb3IgQXJyYXlcclxuQnUuY2xvbmUgPSAodGFyZ2V0KSAtPlxyXG5cdGlmIHR5cGVvZih0YXJnZXQpICE9ICdvYmplY3QnIG9yIHRhcmdldCA9PSBudWxsIG9yIEJ1LmlzRnVuY3Rpb24gdGFyZ2V0XHJcblx0XHRyZXR1cm4gdGFyZ2V0XHJcblx0ZWxzZVxyXG5cdFx0IyBGSVhNRSBjYXVzZSBzdGFjayBvdmVyZmxvdyB3aGVuIGl0cyBhIGNpcmN1bGFyIHN0cnVjdHVyZVxyXG5cdFx0aWYgQnUuaXNBcnJheSB0YXJnZXRcclxuXHRcdFx0Y2xvbmUgPSBbXVxyXG5cdFx0ZWxzZSBpZiBCdS5pc1BsYWluT2JqZWN0IHRhcmdldFxyXG5cdFx0XHRjbG9uZSA9IHt9XHJcblx0XHRlbHNlICMgaW5zdGFuY2Ugb2YgY2xhc3NcclxuXHRcdFx0Y2xvbmUgPSBPYmplY3QuY3JlYXRlIHRhcmdldC5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcclxuXHJcblx0XHRmb3Igb3duIGkgb2YgdGFyZ2V0XHJcblx0XHRcdGNsb25lW2ldID0gQnUuY2xvbmUgdGFyZ2V0W2ldXHJcblxyXG5cdFx0aWYgY2xvbmUuY29uc3RydWN0b3IubmFtZSA9PSAnRnVuY3Rpb24nXHJcblx0XHRcdGNvbnNvbGUubG9nKGNsb25lKTtcclxuXHRcdHJldHVybiBjbG9uZVxyXG5cclxuIyBVc2UgbG9jYWxTdG9yYWdlIHRvIHBlcnNpc3QgZGF0YVxyXG5CdS5kYXRhID0gKGtleSwgdmFsdWUpIC0+XHJcblx0aWYgdmFsdWU/XHJcblx0XHRsb2NhbFN0b3JhZ2VbJ0J1LicgKyBrZXldID0gSlNPTi5zdHJpbmdpZnkgdmFsdWVcclxuXHRlbHNlXHJcblx0XHR2YWx1ZSA9IGxvY2FsU3RvcmFnZVsnQnUuJyArIGtleV1cclxuXHRcdGlmIHZhbHVlPyB0aGVuIEpTT04ucGFyc2UgdmFsdWUgZWxzZSBudWxsXHJcblxyXG4jIEV4ZWN1dGUgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeVxyXG5CdS5yZWFkeSA9IChjYiwgY29udGV4dCwgYXJncykgLT5cclxuXHRpZiBkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZSdcclxuXHRcdGNiLmFwcGx5IGNvbnRleHQsIGFyZ3NcclxuXHRlbHNlXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdET01Db250ZW50TG9hZGVkJywgLT4gY2IuYXBwbHkgY29udGV4dCwgYXJnc1xyXG5cclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBQb2x5ZmlsbHNcclxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiMgU2hvcnRjdXQgdG8gZGVmaW5lIGEgcHJvcGVydHkgZm9yIGEgY2xhc3MuIFRoaXMgaXMgdXNlZCB0byBzb2x2ZSB0aGUgcHJvYmxlbVxyXG4jIHRoYXQgQ29mZmVlU2NyaXB0IGRpZG4ndCBzdXBwb3J0IGdldHRlcnMgYW5kIHNldHRlcnMuXHJcbiMgY2xhc3MgUGVyc29uXHJcbiMgICBAY29uc3RydWN0b3I6IChhZ2UpIC0+XHJcbiMgICAgIEBfYWdlID0gYWdlXHJcbiNcclxuIyAgIEBwcm9wZXJ0eSAnYWdlJyxcclxuIyAgICAgZ2V0OiAtPiBAX2FnZVxyXG4jICAgICBzZXQ6ICh2YWwpIC0+XHJcbiMgICAgICAgQF9hZ2UgPSB2YWxcclxuI1xyXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzY1xyXG5cclxuIyBNYWtlIGEgY29weSBvZiB0aGlzIGZ1bmN0aW9uIHdoaWNoIGhhcyBhIGxpbWl0ZWQgc2hvcnRlc3QgZXhlY3V0aW5nIGludGVydmFsLlxyXG5GdW5jdGlvbjo6dGhyb3R0bGUgPSAobGltaXQgPSAwLjUpIC0+XHJcblx0Y3VyclRpbWUgPSAwXHJcblx0bGFzdFRpbWUgPSAwXHJcblxyXG5cdHJldHVybiAoKSA9PlxyXG5cdFx0Y3VyclRpbWUgPSBEYXRlLm5vdygpXHJcblx0XHRpZiBjdXJyVGltZSAtIGxhc3RUaW1lID4gbGltaXQgKiAxMDAwXHJcblx0XHRcdEBhcHBseSBudWxsLCBhcmd1bWVudHNcclxuXHRcdFx0bGFzdFRpbWUgPSBjdXJyVGltZVxyXG5cclxuIyBNYWtlIGEgY29weSBvZiB0aGlzIGZ1bmN0aW9uIHdob3NlIGV4ZWN1dGlvbiB3aWxsIGJlIGNvbnRpbnVvdXNseSBwdXQgb2ZmXHJcbiMgYWZ0ZXIgZXZlcnkgY2FsbGluZyBvZiB0aGlzIGZ1bmN0aW9uLlxyXG5GdW5jdGlvbjo6ZGVib3VuY2UgPSAoZGVsYXkgPSAwLjUpIC0+XHJcblx0YXJncyA9IG51bGxcclxuXHR0aW1lb3V0ID0gbnVsbFxyXG5cclxuXHRsYXRlciA9ID0+XHJcblx0XHRAYXBwbHkgbnVsbCwgYXJnc1xyXG5cclxuXHRyZXR1cm4gKCkgLT5cclxuXHRcdGFyZ3MgPSBhcmd1bWVudHNcclxuXHRcdGNsZWFyVGltZW91dCB0aW1lb3V0XHJcblx0XHR0aW1lb3V0ID0gc2V0VGltZW91dCBsYXRlciwgZGVsYXkgKiAxMDAwXHJcblxyXG5cclxuIyBJdGVyYXRlIHRoaXMgQXJyYXkgYW5kIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBpdGVtcy5cclxuQXJyYXk6OmVhY2ggb3I9IChmbikgLT5cclxuXHRpID0gMFxyXG5cdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRmbiBAW2ldXHJcblx0XHRpKytcclxuXHRyZXR1cm4gQFxyXG5cclxuIyBJdGVyYXRlIHRoaXMgQXJyYXkgYW5kIG1hcCB0aGUgaXRlbXMgdG8gYSBuZXcgQXJyYXkuXHJcbkFycmF5OjptYXAgb3I9IChmbikgLT5cclxuXHRhcnIgPSBbXVxyXG5cdGkgPSAwXHJcblx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdGFyci5wdXNoIGZuKEBbaV0pXHJcblx0XHRpKytcclxuXHRyZXR1cm4gQFxyXG5cclxuIyBPdXRwdXQgdmVyc2lvbiBpbmZvIHRvIHRoZSBjb25zb2xlLCBhdCBtb3N0IG9uZSB0aW1lIGluIGEgbWludXRlLlxyXG5jdXJyZW50VGltZSA9IERhdGUubm93KClcclxubGFzdFRpbWUgPSBCdS5kYXRhICd2ZXJzaW9uLnRpbWVzdGFtcCdcclxudW5sZXNzIGxhc3RUaW1lPyBhbmQgY3VycmVudFRpbWUgLSBsYXN0VGltZSA8IDYwICogMTAwMFxyXG5cdGNvbnNvbGUuaW5mbz8gJ0J1LmpzIHYnICsgQnUuVkVSU0lPTiArICcgLSBbaHR0cHM6Ly9naXRodWIuY29tL2phcnZpc25pdS9CdS5qc10nXHJcblx0QnUuZGF0YSAndmVyc2lvbi50aW1lc3RhbXAnLCBjdXJyZW50VGltZVxyXG4iLCIjIyBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94XHJcblxyXG5jbGFzcyBCdS5Cb3VuZHNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAdGFyZ2V0KSAtPlxyXG5cclxuXHRcdCMgVE9ETyB1c2UgbWluLCBtYXg6IFZlY3RvclxyXG5cdFx0QHgxID0gQHkxID0gQHgyID0gQHkyID0gMFxyXG5cdFx0QGlzRW1wdHkgPSB5ZXNcclxuXHJcblx0XHRAcG9pbnQxID0gbmV3IEJ1LlZlY3RvclxyXG5cdFx0QHBvaW50MiA9IG5ldyBCdS5WZWN0b3JcclxuXHJcblx0XHRAdXBkYXRlKClcclxuXHRcdEBiaW5kRXZlbnQoKVxyXG5cclxuXHRjb250YWluc1BvaW50OiAocCkgLT5cclxuXHRcdEB4MSA8IHAueCAmJiBAeDIgPiBwLnggJiYgQHkxIDwgcC55ICYmIEB5MiA+IHAueVxyXG5cclxuXHR1cGRhdGU6ID0+XHJcblx0XHRAY2xlYXIoKVxyXG5cdFx0c3dpdGNoIEB0YXJnZXQudHlwZVxyXG5cdFx0XHR3aGVuICdMaW5lJywgJ1RyaWFuZ2xlJywgJ1JlY3RhbmdsZSdcclxuXHRcdFx0XHRmb3IgdiBpbiBAdGFyZ2V0LnBvaW50c1xyXG5cdFx0XHRcdFx0QGV4cGFuZEJ5UG9pbnQodilcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJywgJ0JvdycsICdGYW4nXHJcblx0XHRcdFx0QGV4cGFuZEJ5Q2lyY2xlIEB0YXJnZXRcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnLCAnUG9seWdvbidcclxuXHRcdFx0XHRmb3IgdiBpbiBAdGFyZ2V0LnZlcnRpY2VzXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlQb2ludCh2KVxyXG5cdFx0XHR3aGVuICdFbGxpcHNlJ1xyXG5cdFx0XHRcdEB4MSA9IC1AdGFyZ2V0LnJhZGl1c1hcclxuXHRcdFx0XHRAeDIgPSBAdGFyZ2V0LnJhZGl1c1hcclxuXHRcdFx0XHRAeTEgPSAtQHRhcmdldC5yYWRpdXNZXHJcblx0XHRcdFx0QHkyID0gQHRhcmdldC5yYWRpdXNZXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLndhcm4gXCJCb3VuZHM6IG5vdCBzdXBwb3J0IHNoYXBlIHR5cGUgI3sgQHRhcmdldC50eXBlIH1cIlxyXG5cclxuXHRiaW5kRXZlbnQ6IC0+XHJcblx0XHRzd2l0Y2ggQHRhcmdldC50eXBlXHJcblx0XHRcdHdoZW4gJ0NpcmNsZScsICdCb3cnLCAnRmFuJ1xyXG5cdFx0XHRcdEB0YXJnZXQub24gJ2NlbnRlckNoYW5nZWQnLCBAdXBkYXRlXHJcblx0XHRcdFx0QHRhcmdldC5vbiAncmFkaXVzQ2hhbmdlZCcsIEB1cGRhdGVcclxuXHRcdFx0d2hlbiAnRWxsaXBzZSdcclxuXHRcdFx0XHRAdGFyZ2V0Lm9uICdjaGFuZ2VkJywgQHVwZGF0ZVxyXG5cclxuXHRjbGVhcjogKCkgLT5cclxuXHRcdEB4MSA9IEB5MSA9IEB4MiA9IEB5MiA9IDBcclxuXHRcdEBpc0VtcHR5ID0geWVzXHJcblx0XHRAXHJcblxyXG5cdGV4cGFuZEJ5UG9pbnQ6ICh2KSAtPlxyXG5cdFx0aWYgQGlzRW1wdHlcclxuXHRcdFx0QGlzRW1wdHkgPSBub1xyXG5cdFx0XHRAeDEgPSBAeDIgPSB2LnhcclxuXHRcdFx0QHkxID0gQHkyID0gdi55XHJcblx0XHRlbHNlXHJcblx0XHRcdEB4MSA9IHYueCBpZiB2LnggPCBAeDFcclxuXHRcdFx0QHgyID0gdi54IGlmIHYueCA+IEB4MlxyXG5cdFx0XHRAeTEgPSB2LnkgaWYgdi55IDwgQHkxXHJcblx0XHRcdEB5MiA9IHYueSBpZiB2LnkgPiBAeTJcclxuXHRcdEBcclxuXHJcblx0ZXhwYW5kQnlDaXJjbGU6IChjKSAtPlxyXG5cdFx0Y3AgPSBjLmNlbnRlclxyXG5cdFx0ciA9IGMucmFkaXVzXHJcblx0XHRpZiBAaXNFbXB0eVxyXG5cdFx0XHRAaXNFbXB0eSA9IG5vXHJcblx0XHRcdEB4MSA9IGNwLnggLSByXHJcblx0XHRcdEB4MiA9IGNwLnggKyByXHJcblx0XHRcdEB5MSA9IGNwLnkgLSByXHJcblx0XHRcdEB5MiA9IGNwLnkgKyByXHJcblx0XHRlbHNlXHJcblx0XHRcdEB4MSA9IGNwLnggLSByIGlmIGNwLnggLSByIDwgQHgxXHJcblx0XHRcdEB4MiA9IGNwLnggKyByIGlmIGNwLnggKyByID4gQHgyXHJcblx0XHRcdEB5MSA9IGNwLnkgLSByIGlmIGNwLnkgLSByIDwgQHkxXHJcblx0XHRcdEB5MiA9IGNwLnkgKyByIGlmIGNwLnkgKyByID4gQHkyXHJcblx0XHRAXHJcbiIsIiMgUGFyc2UgYW5kIHNlcmlhbGl6ZSBjb2xvclxuIyBUT0RPIFN1cHBvcnQgaHNsKDAsIDEwMCUsIDUwJSkgZm9ybWF0LlxuXG5jbGFzcyBCdS5Db2xvclxuXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgICAgIEByID0gQGcgPSBAYiA9IDI1NVxuICAgICAgICBAYSA9IDFcblxuICAgICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDFcbiAgICAgICAgICAgIGFyZyA9IGFyZ3VtZW50c1swXVxuICAgICAgICAgICAgaWYgQnUuaXNTdHJpbmcgYXJnXG4gICAgICAgICAgICAgICAgQHBhcnNlIGFyZ1xuICAgICAgICAgICAgICAgIEBhID0gY2xhbXBBbHBoYSBAYVxuICAgICAgICAgICAgZWxzZSBpZiBhcmcgaW5zdGFuY2VvZiBCdS5Db2xvclxuICAgICAgICAgICAgICAgIEBjb3B5IGFyZ1xuICAgICAgICBlbHNlICMgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAzIG9yIDRcbiAgICAgICAgICAgIEByID0gYXJndW1lbnRzWzBdXG4gICAgICAgICAgICBAZyA9IGFyZ3VtZW50c1sxXVxuICAgICAgICAgICAgQGIgPSBhcmd1bWVudHNbMl1cbiAgICAgICAgICAgIEBhID0gYXJndW1lbnRzWzNdIG9yIDFcblxuICAgIHBhcnNlOiAoc3RyKSAtPlxuICAgICAgICBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JBXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50IGZvdW5kWzFdXG4gICAgICAgICAgICBAZyA9IHBhcnNlSW50IGZvdW5kWzJdXG4gICAgICAgICAgICBAYiA9IHBhcnNlSW50IGZvdW5kWzNdXG4gICAgICAgICAgICBAYSA9IHBhcnNlRmxvYXQgZm91bmRbNF1cbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JcbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgZm91bmRbMV1cbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgZm91bmRbMl1cbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgZm91bmRbM11cbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIGZvdW5kID0gc3RyLm1hdGNoIFJFX1JHQkFfUEVSXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50KGZvdW5kWzFdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludChmb3VuZFsyXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQoZm91bmRbM10gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYSA9IHBhcnNlRmxvYXQgZm91bmRbNF1cbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9SR0JfUEVSXG4gICAgICAgICAgICBAciA9IHBhcnNlSW50KGZvdW5kWzFdICogMjU1IC8gMTAwKVxuICAgICAgICAgICAgQGcgPSBwYXJzZUludChmb3VuZFsyXSAqIDI1NSAvIDEwMClcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQoZm91bmRbM10gKiAyNTUgLyAxMDApXG4gICAgICAgICAgICBAYSA9IDFcbiAgICAgICAgZWxzZSBpZiBmb3VuZCA9IHN0ci5tYXRjaCBSRV9IRVgzXG4gICAgICAgICAgICBoZXggPSBmb3VuZFsxXVxuICAgICAgICAgICAgQHIgPSBwYXJzZUludCBoZXhbMF0sIDE2XG4gICAgICAgICAgICBAciA9IEByICogMTYgKyBAclxuICAgICAgICAgICAgQGcgPSBwYXJzZUludCBoZXhbMV0sIDE2XG4gICAgICAgICAgICBAZyA9IEBnICogMTYgKyBAZ1xuICAgICAgICAgICAgQGIgPSBwYXJzZUludCBoZXhbMl0sIDE2XG4gICAgICAgICAgICBAYiA9IEBiICogMTYgKyBAYlxuICAgICAgICAgICAgQGEgPSAxXG4gICAgICAgIGVsc2UgaWYgZm91bmQgPSBzdHIubWF0Y2ggUkVfSEVYNlxuICAgICAgICAgICAgaGV4ID0gZm91bmRbMV1cbiAgICAgICAgICAgIEByID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZygwLCAyKSwgMTZcbiAgICAgICAgICAgIEBnID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZygyLCA0KSwgMTZcbiAgICAgICAgICAgIEBiID0gcGFyc2VJbnQgaGV4LnN1YnN0cmluZyg0LCA2KSwgMTZcbiAgICAgICAgICAgIEBhID0gMVxuICAgICAgICBlbHNlIGlmIENTUzNfQ09MT1JTW3N0ciA9IHN0ci50b0xvd2VyQ2FzZSgpLnRyaW0oKV0/XG4gICAgICAgICAgICBAciA9IENTUzNfQ09MT1JTW3N0cl1bMF1cbiAgICAgICAgICAgIEBnID0gQ1NTM19DT0xPUlNbc3RyXVsxXVxuICAgICAgICAgICAgQGIgPSBDU1MzX0NPTE9SU1tzdHJdWzJdXG4gICAgICAgICAgICBAYSA9IENTUzNfQ09MT1JTW3N0cl1bM11cbiAgICAgICAgICAgIEBhID0gMSB1bmxlc3MgQGE/XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgXCJCdS5Db2xvci5wYXJzZShcXFwiI3sgc3RyIH1cXFwiKSBlcnJvci5cIlxuICAgICAgICBAXG5cbiAgICBjb3B5OiAoY29sb3IpIC0+XG4gICAgICAgIEByID0gY29sb3IuclxuICAgICAgICBAZyA9IGNvbG9yLmdcbiAgICAgICAgQGIgPSBjb2xvci5iXG4gICAgICAgIEBhID0gY29sb3IuYVxuICAgICAgICBAXG5cbiAgICBzZXRSR0I6IChyLCBnLCBiKSAtPlxuICAgICAgICBAciA9IHBhcnNlSW50IHJcbiAgICAgICAgQGcgPSBwYXJzZUludCBnXG4gICAgICAgIEBiID0gcGFyc2VJbnQgYlxuICAgICAgICBAYSA9IDFcbiAgICAgICAgQFxuXG4gICAgc2V0UkdCQTogKHIsIGcsIGIsIGEpIC0+XG4gICAgICAgIEByID0gcGFyc2VJbnQgclxuICAgICAgICBAZyA9IHBhcnNlSW50IGdcbiAgICAgICAgQGIgPSBwYXJzZUludCBiXG4gICAgICAgIEBhID0gY2xhbXBBbHBoYSBwYXJzZUZsb2F0IGFcbiAgICAgICAgQFxuXG4gICAgdG9SR0I6IC0+XG4gICAgICAgIFwicmdiKCN7IEByIH0sICN7IEBnIH0sICN7IEBiIH0pXCJcblxuICAgIHRvUkdCQTogLT5cbiAgICAgICAgXCJyZ2JhKCN7IEByIH0sICN7IEBnIH0sICN7IEBiIH0sICN7IEBhIH0pXCJcblxuXG4gICAgIyBQcml2YXRlIGZ1bmN0aW9uc1xuXG4gICAgY2xhbXBBbHBoYSA9IChhKSAtPiBCdS5jbGFtcCBhLCAwLCAxXG5cblxuICAgICMgUHJpdmF0ZSB2YXJpYWJsZXNcblxuICAgIFJFX1JHQiA9IC9yZ2JcXChcXHMqKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxccypcXCkvaVxuICAgIFJFX1JHQkEgPSAvcmdiYVxcKFxccyooXFxkKyksXFxzKihcXGQrKSxcXHMqKFxcZCspXFxzKixcXHMqKFsuXFxkXSspXFxzKlxcKS9pXG4gICAgUkVfUkdCX1BFUiA9IC9yZ2JcXChcXHMqKFxcZCspJSxcXHMqKFxcZCspJSxcXHMqKFxcZCspJVxccypcXCkvaVxuICAgIFJFX1JHQkFfUEVSID0gL3JnYmFcXChcXHMqKFxcZCspJSxcXHMqKFxcZCspJSxcXHMqKFxcZCspJVxccyosXFxzKihbLlxcZF0rKVxccypcXCkvaVxuICAgIFJFX0hFWDMgPSAvIyhbMC05QS1GXXszfSlcXHMqJC9pXG4gICAgUkVfSEVYNiA9IC8jKFswLTlBLUZdezZ9KVxccyokL2lcbiAgICBDU1MzX0NPTE9SUyA9XG4gICAgICAgIHRyYW5zcGFyZW50OiBbMCwgMCwgMCwgMF1cblxuICAgICAgICBhbGljZWJsdWU6IFsyNDAsIDI0OCwgMjU1XVxuICAgICAgICBhbnRpcXVld2hpdGU6IFsyNTAsIDIzNSwgMjE1XVxuICAgICAgICBhcXVhOiBbMCwgMjU1LCAyNTVdXG4gICAgICAgIGFxdWFtYXJpbmU6IFsxMjcsIDI1NSwgMjEyXVxuICAgICAgICBhenVyZTogWzI0MCwgMjU1LCAyNTVdXG4gICAgICAgIGJlaWdlOiBbMjQ1LCAyNDUsIDIyMF1cbiAgICAgICAgYmlzcXVlOiBbMjU1LCAyMjgsIDE5Nl1cbiAgICAgICAgYmxhY2s6IFswLCAwLCAwXVxuICAgICAgICBibGFuY2hlZGFsbW9uZDogWzI1NSwgMjM1LCAyMDVdXG4gICAgICAgIGJsdWU6IFswLCAwLCAyNTVdXG4gICAgICAgIGJsdWV2aW9sZXQ6IFsxMzgsIDQzLCAyMjZdXG4gICAgICAgIGJyb3duOiBbMTY1LCA0MiwgNDJdXG4gICAgICAgIGJ1cmx5d29vZDogWzIyMiwgMTg0LCAxMzVdXG4gICAgICAgIGNhZGV0Ymx1ZTogWzk1LCAxNTgsIDE2MF1cbiAgICAgICAgY2hhcnRyZXVzZTogWzEyNywgMjU1LCAwXVxuICAgICAgICBjaG9jb2xhdGU6IFsyMTAsIDEwNSwgMzBdXG4gICAgICAgIGNvcmFsOiBbMjU1LCAxMjcsIDgwXVxuICAgICAgICBjb3JuZmxvd2VyYmx1ZTogWzEwMCwgMTQ5LCAyMzddXG4gICAgICAgIGNvcm5zaWxrOiBbMjU1LCAyNDgsIDIyMF1cbiAgICAgICAgY3JpbXNvbjogWzIyMCwgMjAsIDYwXVxuICAgICAgICBjeWFuOiBbMCwgMjU1LCAyNTVdXG4gICAgICAgIGRhcmtibHVlOiBbMCwgMCwgMTM5XVxuICAgICAgICBkYXJrY3lhbjogWzAsIDEzOSwgMTM5XVxuICAgICAgICBkYXJrZ29sZGVucm9kOiBbMTg0LCAxMzQsIDExXVxuICAgICAgICBkYXJrZ3JheTogWzE2OSwgMTY5LCAxNjldXG4gICAgICAgIGRhcmtncmVlbjogWzAsIDEwMCwgMF1cbiAgICAgICAgZGFya2dyZXk6IFsxNjksIDE2OSwgMTY5XVxuICAgICAgICBkYXJra2hha2k6IFsxODksIDE4MywgMTA3XVxuICAgICAgICBkYXJrbWFnZW50YTogWzEzOSwgMCwgMTM5XVxuICAgICAgICBkYXJrb2xpdmVncmVlbjogWzg1LCAxMDcsIDQ3XVxuICAgICAgICBkYXJrb3JhbmdlOiBbMjU1LCAxNDAsIDBdXG4gICAgICAgIGRhcmtvcmNoaWQ6IFsxNTMsIDUwLCAyMDRdXG4gICAgICAgIGRhcmtyZWQ6IFsxMzksIDAsIDBdXG4gICAgICAgIGRhcmtzYWxtb246IFsyMzMsIDE1MCwgMTIyXVxuICAgICAgICBkYXJrc2VhZ3JlZW46IFsxNDMsIDE4OCwgMTQzXVxuICAgICAgICBkYXJrc2xhdGVibHVlOiBbNzIsIDYxLCAxMzldXG4gICAgICAgIGRhcmtzbGF0ZWdyYXk6IFs0NywgNzksIDc5XVxuICAgICAgICBkYXJrc2xhdGVncmV5OiBbNDcsIDc5LCA3OV1cbiAgICAgICAgZGFya3R1cnF1b2lzZTogWzAsIDIwNiwgMjA5XVxuICAgICAgICBkYXJrdmlvbGV0OiBbMTQ4LCAwLCAyMTFdXG4gICAgICAgIGRlZXBwaW5rOiBbMjU1LCAyMCwgMTQ3XVxuICAgICAgICBkZWVwc2t5Ymx1ZTogWzAsIDE5MSwgMjU1XVxuICAgICAgICBkaW1ncmF5OiBbMTA1LCAxMDUsIDEwNV1cbiAgICAgICAgZGltZ3JleTogWzEwNSwgMTA1LCAxMDVdXG4gICAgICAgIGRvZGdlcmJsdWU6IFszMCwgMTQ0LCAyNTVdXG4gICAgICAgIGZpcmVicmljazogWzE3OCwgMzQsIDM0XVxuICAgICAgICBmbG9yYWx3aGl0ZTogWzI1NSwgMjUwLCAyNDBdXG4gICAgICAgIGZvcmVzdGdyZWVuOiBbMzQsIDEzOSwgMzRdXG4gICAgICAgIGZ1Y2hzaWE6IFsyNTUsIDAsIDI1NV1cbiAgICAgICAgZ2FpbnNib3JvOiBbMjIwLCAyMjAsIDIyMF1cbiAgICAgICAgZ2hvc3R3aGl0ZTogWzI0OCwgMjQ4LCAyNTVdXG4gICAgICAgIGdvbGQ6IFsyNTUsIDIxNSwgMF1cbiAgICAgICAgZ29sZGVucm9kOiBbMjE4LCAxNjUsIDMyXVxuICAgICAgICBncmF5OiBbMTI4LCAxMjgsIDEyOF1cbiAgICAgICAgZ3JlZW46IFswLCAxMjgsIDBdXG4gICAgICAgIGdyZWVueWVsbG93OiBbMTczLCAyNTUsIDQ3XVxuICAgICAgICBncmV5OiBbMTI4LCAxMjgsIDEyOF1cbiAgICAgICAgaG9uZXlkZXc6IFsyNDAsIDI1NSwgMjQwXVxuICAgICAgICBob3RwaW5rOiBbMjU1LCAxMDUsIDE4MF1cbiAgICAgICAgaW5kaWFucmVkOiBbMjA1LCA5MiwgOTJdXG4gICAgICAgIGluZGlnbzogWzc1LCAwLCAxMzBdXG4gICAgICAgIGl2b3J5OiBbMjU1LCAyNTUsIDI0MF1cbiAgICAgICAga2hha2k6IFsyNDAsIDIzMCwgMTQwXVxuICAgICAgICBsYXZlbmRlcjogWzIzMCwgMjMwLCAyNTBdXG4gICAgICAgIGxhdmVuZGVyYmx1c2g6IFsyNTUsIDI0MCwgMjQ1XVxuICAgICAgICBsYXduZ3JlZW46IFsxMjQsIDI1MiwgMF1cbiAgICAgICAgbGVtb25jaGlmZm9uOiBbMjU1LCAyNTAsIDIwNV1cbiAgICAgICAgbGlnaHRibHVlOiBbMTczLCAyMTYsIDIzMF1cbiAgICAgICAgbGlnaHRjb3JhbDogWzI0MCwgMTI4LCAxMjhdXG4gICAgICAgIGxpZ2h0Y3lhbjogWzIyNCwgMjU1LCAyNTVdXG4gICAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiBbMjUwLCAyNTAsIDIxMF1cbiAgICAgICAgbGlnaHRncmF5OiBbMjExLCAyMTEsIDIxMV1cbiAgICAgICAgbGlnaHRncmVlbjogWzE0NCwgMjM4LCAxNDRdXG4gICAgICAgIGxpZ2h0Z3JleTogWzIxMSwgMjExLCAyMTFdXG4gICAgICAgIGxpZ2h0cGluazogWzI1NSwgMTgyLCAxOTNdXG4gICAgICAgIGxpZ2h0c2FsbW9uOiBbMjU1LCAxNjAsIDEyMl1cbiAgICAgICAgbGlnaHRzZWFncmVlbjogWzMyLCAxNzgsIDE3MF1cbiAgICAgICAgbGlnaHRza3libHVlOiBbMTM1LCAyMDYsIDI1MF1cbiAgICAgICAgbGlnaHRzbGF0ZWdyYXk6IFsxMTksIDEzNiwgMTUzXVxuICAgICAgICBsaWdodHNsYXRlZ3JleTogWzExOSwgMTM2LCAxNTNdXG4gICAgICAgIGxpZ2h0c3RlZWxibHVlOiBbMTc2LCAxOTYsIDIyMl1cbiAgICAgICAgbGlnaHR5ZWxsb3c6IFsyNTUsIDI1NSwgMjI0XVxuICAgICAgICBsaW1lOiBbMCwgMjU1LCAwXVxuICAgICAgICBsaW1lZ3JlZW46IFs1MCwgMjA1LCA1MF1cbiAgICAgICAgbGluZW46IFsyNTAsIDI0MCwgMjMwXVxuICAgICAgICBtYWdlbnRhOiBbMjU1LCAwLCAyNTVdXG4gICAgICAgIG1hcm9vbjogWzEyOCwgMCwgMF1cbiAgICAgICAgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwgMjA1LCAxNzBdXG4gICAgICAgIG1lZGl1bWJsdWU6IFswLCAwLCAyMDVdXG4gICAgICAgIG1lZGl1bW9yY2hpZDogWzE4NiwgODUsIDIxMV1cbiAgICAgICAgbWVkaXVtcHVycGxlOiBbMTQ3LCAxMTIsIDIxOV1cbiAgICAgICAgbWVkaXVtc2VhZ3JlZW46IFs2MCwgMTc5LCAxMTNdXG4gICAgICAgIG1lZGl1bXNsYXRlYmx1ZTogWzEyMywgMTA0LCAyMzhdXG4gICAgICAgIG1lZGl1bXNwcmluZ2dyZWVuOiBbMCwgMjUwLCAxNTRdXG4gICAgICAgIG1lZGl1bXR1cnF1b2lzZTogWzcyLCAyMDksIDIwNF1cbiAgICAgICAgbWVkaXVtdmlvbGV0cmVkOiBbMTk5LCAyMSwgMTMzXVxuICAgICAgICBtaWRuaWdodGJsdWU6IFsyNSwgMjUsIDExMl1cbiAgICAgICAgbWludGNyZWFtOiBbMjQ1LCAyNTUsIDI1MF1cbiAgICAgICAgbWlzdHlyb3NlOiBbMjU1LCAyMjgsIDIyNV1cbiAgICAgICAgbW9jY2FzaW46IFsyNTUsIDIyOCwgMTgxXVxuICAgICAgICBuYXZham93aGl0ZTogWzI1NSwgMjIyLCAxNzNdXG4gICAgICAgIG5hdnk6IFswLCAwLCAxMjhdXG4gICAgICAgIG9sZGxhY2U6IFsyNTMsIDI0NSwgMjMwXVxuICAgICAgICBvbGl2ZTogWzEyOCwgMTI4LCAwXVxuICAgICAgICBvbGl2ZWRyYWI6IFsxMDcsIDE0MiwgMzVdXG4gICAgICAgIG9yYW5nZTogWzI1NSwgMTY1LCAwXVxuICAgICAgICBvcmFuZ2VyZWQ6IFsyNTUsIDY5LCAwXVxuICAgICAgICBvcmNoaWQ6IFsyMTgsIDExMiwgMjE0XVxuICAgICAgICBwYWxlZ29sZGVucm9kOiBbMjM4LCAyMzIsIDE3MF1cbiAgICAgICAgcGFsZWdyZWVuOiBbMTUyLCAyNTEsIDE1Ml1cbiAgICAgICAgcGFsZXR1cnF1b2lzZTogWzE3NSwgMjM4LCAyMzhdXG4gICAgICAgIHBhbGV2aW9sZXRyZWQ6IFsyMTksIDExMiwgMTQ3XVxuICAgICAgICBwYXBheWF3aGlwOiBbMjU1LCAyMzksIDIxM11cbiAgICAgICAgcGVhY2hwdWZmOiBbMjU1LCAyMTgsIDE4NV1cbiAgICAgICAgcGVydTogWzIwNSwgMTMzLCA2M11cbiAgICAgICAgcGluazogWzI1NSwgMTkyLCAyMDNdXG4gICAgICAgIHBsdW06IFsyMjEsIDE2MCwgMjIxXVxuICAgICAgICBwb3dkZXJibHVlOiBbMTc2LCAyMjQsIDIzMF1cbiAgICAgICAgcHVycGxlOiBbMTI4LCAwLCAxMjhdXG4gICAgICAgIHJlZDogWzI1NSwgMCwgMF1cbiAgICAgICAgcm9zeWJyb3duOiBbMTg4LCAxNDMsIDE0M11cbiAgICAgICAgcm95YWxibHVlOiBbNjUsIDEwNSwgMjI1XVxuICAgICAgICBzYWRkbGVicm93bjogWzEzOSwgNjksIDE5XVxuICAgICAgICBzYWxtb246IFsyNTAsIDEyOCwgMTE0XVxuICAgICAgICBzYW5keWJyb3duOiBbMjQ0LCAxNjQsIDk2XVxuICAgICAgICBzZWFncmVlbjogWzQ2LCAxMzksIDg3XVxuICAgICAgICBzZWFzaGVsbDogWzI1NSwgMjQ1LCAyMzhdXG4gICAgICAgIHNpZW5uYTogWzE2MCwgODIsIDQ1XVxuICAgICAgICBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXVxuICAgICAgICBza3libHVlOiBbMTM1LCAyMDYsIDIzNV1cbiAgICAgICAgc2xhdGVibHVlOiBbMTA2LCA5MCwgMjA1XVxuICAgICAgICBzbGF0ZWdyYXk6IFsxMTIsIDEyOCwgMTQ0XVxuICAgICAgICBzbGF0ZWdyZXk6IFsxMTIsIDEyOCwgMTQ0XVxuICAgICAgICBzbm93OiBbMjU1LCAyNTAsIDI1MF1cbiAgICAgICAgc3ByaW5nZ3JlZW46IFswLCAyNTUsIDEyN11cbiAgICAgICAgc3RlZWxibHVlOiBbNzAsIDEzMCwgMTgwXVxuICAgICAgICB0YW46IFsyMTAsIDE4MCwgMTQwXVxuICAgICAgICB0ZWFsOiBbMCwgMTI4LCAxMjhdXG4gICAgICAgIHRoaXN0bGU6IFsyMTYsIDE5MSwgMjE2XVxuICAgICAgICB0b21hdG86IFsyNTUsIDk5LCA3MV1cbiAgICAgICAgdHVycXVvaXNlOiBbNjQsIDIyNCwgMjA4XVxuICAgICAgICB2aW9sZXQ6IFsyMzgsIDEzMCwgMjM4XVxuICAgICAgICB3aGVhdDogWzI0NSwgMjIyLCAxNzldXG4gICAgICAgIHdoaXRlOiBbMjU1LCAyNTUsIDI1NV1cbiAgICAgICAgd2hpdGVzbW9rZTogWzI0NSwgMjQ1LCAyNDVdXG4gICAgICAgIHllbGxvdzogWzI1NSwgMjU1LCAwXVxuICAgICAgICB5ZWxsb3dncmVlbjogWzE1NCwgMjA1LCA1MF1cbiIsIiMgdGhlIHNpemUgb2YgcmVjdGFuZ2xlLCBCb3VuZHMgZXRjLlxyXG5cclxuY2xhc3MgQnUuU2l6ZVxyXG5cdGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG5cdFx0QHR5cGUgPSAnU2l6ZSdcclxuXHJcblx0c2V0OiAoQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4iLCIjIDJkIHZlY3RvclxyXG5cclxuY2xhc3MgQnUuVmVjdG9yXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHggPSAwLCBAeSA9IDApIC0+XHJcblxyXG5cdHNldDogKEB4LCBAeSkgLT5cclxuXHRcdEBcclxuXHJcblx0Y29weTogKHYpIC0+XHJcblx0XHRAeCA9IHYueFxyXG5cdFx0QHkgPSB2LnlcclxuXHRcdEBcclxuXHJcblx0dW5Qcm9qZWN0OiAob2JqKSAtPlxyXG5cdFx0IyB0cmFuc2xhdGVcclxuXHRcdEB4IC09IG9iai5wb3NpdGlvbi54XHJcblx0XHRAeSAtPSBvYmoucG9zaXRpb24ueVxyXG5cdFx0IyByb3RhdGlvblxyXG5cdFx0bGVuID0gQnUuYmV2ZWwoQHgsIEB5KVxyXG5cdFx0YSA9IE1hdGguYXRhbjIoQHksIEB4KSAtIG9iai5yb3RhdGlvblxyXG5cdFx0QHggPSBsZW4gKiBNYXRoLmNvcyhhKVxyXG5cdFx0QHkgPSBsZW4gKiBNYXRoLnNpbihhKVxyXG5cdFx0IyBzY2FsZVxyXG5cdFx0QHggLz0gb2JqLnNjYWxlLnhcclxuXHRcdEB5IC89IG9iai5zY2FsZS55XHJcblx0XHRAIiwiIyBBZGQgZXZlbnQgbGlzdGVuZXIgZmVhdHVyZSB0byBjdXN0b20gb2JqZWN0c1xyXG5cclxuQnUuRXZlbnQgPSAtPlxyXG5cdHR5cGVzID0ge31cclxuXHJcblx0QG9uID0gKHR5cGUsIGxpc3RlbmVyKSAtPlxyXG5cdFx0bGlzdGVuZXJzID0gdHlwZXNbdHlwZV0gb3I9IFtdXHJcblx0XHRsaXN0ZW5lcnMucHVzaCBsaXN0ZW5lciBpZiBsaXN0ZW5lcnMuaW5kZXhPZiBsaXN0ZW5lciA9PSAtMVxyXG5cclxuXHRAb25jZSA9ICh0eXBlLCBsaXN0ZW5lcikgLT5cclxuXHRcdGxpc3RlbmVyLm9uY2UgPSB0cnVlXHJcblx0XHRAb24gdHlwZSwgbGlzdGVuZXJcclxuXHJcblx0QG9mZiA9ICh0eXBlLCBsaXN0ZW5lcikgLT5cclxuXHRcdGxpc3RlbmVycyA9IHR5cGVzW3R5cGVdXHJcblx0XHRpZiBsaXN0ZW5lcj9cclxuXHRcdFx0aWYgbGlzdGVuZXJzP1xyXG5cdFx0XHRcdGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YgbGlzdGVuZXJcclxuXHRcdFx0XHRsaXN0ZW5lcnMuc3BsaWNlIGluZGV4LCAxIGlmIGluZGV4ID4gLTFcclxuXHRcdGVsc2VcclxuXHRcdFx0bGlzdGVuZXJzLmxlbmd0aCA9IDAgaWYgbGlzdGVuZXJzP1xyXG5cclxuXHRAdHJpZ2dlciA9ICh0eXBlLCBldmVudERhdGEpIC0+XHJcblx0XHRsaXN0ZW5lcnMgPSB0eXBlc1t0eXBlXVxyXG5cclxuXHRcdGlmIGxpc3RlbmVycz9cclxuXHRcdFx0ZXZlbnREYXRhIG9yPSB7fVxyXG5cdFx0XHRldmVudERhdGEudGFyZ2V0ID0gQFxyXG5cdFx0XHRmb3IgbGlzdGVuZXIgaW4gbGlzdGVuZXJzXHJcblx0XHRcdFx0bGlzdGVuZXIuY2FsbCB0aGlzLCBldmVudERhdGFcclxuXHRcdFx0XHRpZiBsaXN0ZW5lci5vbmNlXHJcblx0XHRcdFx0XHRsaXN0ZW5lcnMuc3BsaWNlIGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSwgMVxyXG4iLCIjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIE1pY3JvSlF1ZXJ5IC0gQSBtaWNybyB2ZXJzaW9uIG9mIGpRdWVyeVxyXG4jXHJcbiMgU3VwcG9ydGVkIGZlYXR1cmVzOlxyXG4jICAgJC4gLSBzdGF0aWMgbWV0aG9kc1xyXG4jICAgICAucmVhZHkoY2IpIC0gY2FsbCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgdGhlIHBhZ2UgaXMgbG9hZGVkXHJcbiMgICAgIC5hamF4KFt1cmwsXSBvcHRpb25zKSAtIHBlcmZvcm0gYW4gYWpheCByZXF1ZXN0XHJcbiMgICAkKHNlbGVjdG9yKSAtIHNlbGVjdCBlbGVtZW50KHMpXHJcbiMgICAgIC5vbih0eXBlLCBjYWxsYmFjaykgLSBhZGQgYW4gZXZlbnQgbGlzdGVuZXJcclxuIyAgICAgLm9mZih0eXBlLCBjYWxsYmFjaykgLSByZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXJcclxuIyAgICAgLmFwcGVuZCh0YWdOYW1lKSAtIGFwcGVuZCBhIHRhZ1xyXG4jICAgICAudGV4dCh0ZXh0KSAtIHNldCB0aGUgaW5uZXIgdGV4dFxyXG4jICAgICAuaHRtbChodG1sVGV4dCkgLSBzZXQgdGhlIGlubmVyIEhUTUxcclxuIyAgICAgLnN0eWxlKG5hbWUsIHZhbHVlKSAtIHNldCBzdHlsZSAoYSBjc3MgYXR0cmlidXRlKVxyXG4jICAgICAjLmNzcyhvYmplY3QpIC0gc2V0IHN0eWxlcyAobXVsdGlwbGUgY3NzIGF0dHJpYnV0ZSlcclxuIyAgICAgLmhhc0NsYXNzKGNsYXNzTmFtZSkgLSBkZXRlY3Qgd2hldGhlciBhIGNsYXNzIGV4aXN0c1xyXG4jICAgICAuYWRkQ2xhc3MoY2xhc3NOYW1lKSAtIGFkZCBhIGNsYXNzXHJcbiMgICAgIC5yZW1vdmVDbGFzcyhjbGFzc05hbWUpIC0gcmVtb3ZlIGEgY2xhc3NcclxuIyAgICAgLnRvZ2dsZUNsYXNzKGNsYXNzTmFtZSkgLSB0b2dnbGUgYSBjbGFzc1xyXG4jICAgICAuYXR0cihuYW1lLCB2YWx1ZSkgLSBzZXQgYW4gYXR0cmlidXRlXHJcbiMgICAgIC5oYXNBdHRyKG5hbWUpIC0gZGV0ZWN0IHdoZXRoZXIgYW4gYXR0cmlidXRlIGV4aXN0c1xyXG4jICAgICAucmVtb3ZlQXR0cihuYW1lKSAtIHJlbW92ZSBhbiBhdHRyaWJ1dGVcclxuIyAgIE5vdGVzOlxyXG4jICAgICAgICAjIGlzIHBsYW5uZWQgYnV0IG5vdCBpbXBsZW1lbnRlZFxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKChnbG9iYWwpIC0+XHJcblxyXG5cdCMgc2VsZWN0b3JcclxuXHRnbG9iYWwuJCA9IChzZWxlY3RvcikgLT5cclxuXHRcdHNlbGVjdGlvbnMgPSBbXVxyXG5cdFx0aWYgdHlwZW9mIHNlbGVjdG9yID09ICdzdHJpbmcnXHJcblx0XHRcdHNlbGVjdGlvbnMgPSBbXS5zbGljZS5jYWxsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgc2VsZWN0b3JcclxuXHRcdGpRdWVyeS5hcHBseSBzZWxlY3Rpb25zXHJcblx0XHRzZWxlY3Rpb25zXHJcblxyXG5cdGpRdWVyeSA9IC0+XHJcblxyXG5cdFx0IyBldmVudFxyXG5cdFx0QG9uID0gKHR5cGUsIGNhbGxiYWNrKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5hZGRFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAb2ZmID0gKHR5cGUsIGNhbGxiYWNrKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5yZW1vdmVFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrXHJcblx0XHRcdEBcclxuXHJcblx0XHQjIERPTSBNYW5pcHVsYXRpb25cclxuXHJcblx0XHRTVkdfVEFHUyA9ICdzdmcgbGluZSByZWN0IGNpcmNsZSBlbGxpcHNlIHBvbHlsaW5lIHBvbHlnb24gcGF0aCB0ZXh0J1xyXG5cclxuXHRcdEBhcHBlbmQgPSAodGFnKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tLCBpKSA9PlxyXG5cdFx0XHRcdHRhZ0luZGV4ID0gU1ZHX1RBR1MuaW5kZXhPZiB0YWcudG9Mb3dlckNhc2UoKVxyXG5cdFx0XHRcdGlmIHRhZ0luZGV4ID4gLTFcclxuXHRcdFx0XHRcdG5ld0RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRuZXdEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IHRhZ1xyXG5cdFx0XHRcdEBbaV0gPSBkb20uYXBwZW5kQ2hpbGQgbmV3RG9tXHJcblx0XHRcdEBcclxuXHJcblx0XHRAdGV4dCA9IChzdHIpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLnRleHRDb250ZW50ID0gc3RyXHJcblx0XHRcdEBcclxuXHJcblx0XHRAaHRtbCA9IChzdHIpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLmlubmVySFRNTCA9IHN0clxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHN0eWxlID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdHN0eWxlVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUgJ3N0eWxlJ1xyXG5cdFx0XHRcdHN0eWxlcyA9IHt9XHJcblx0XHRcdFx0aWYgc3R5bGVUZXh0XHJcblx0XHRcdFx0XHRzdHlsZVRleHQuc3BsaXQoJzsnKS5lYWNoIChuKSAtPlxyXG5cdFx0XHRcdFx0XHRudiA9IG4uc3BsaXQgJzonXHJcblx0XHRcdFx0XHRcdHN0eWxlc1tudlswXV0gPSBudlsxXVxyXG5cdFx0XHRcdHN0eWxlc1tuYW1lXSA9IHZhbHVlXHJcblx0XHRcdFx0IyBjb25jYXRcclxuXHRcdFx0XHRzdHlsZVRleHQgPSAnJ1xyXG5cdFx0XHRcdGZvciBpIG9mIHN0eWxlc1xyXG5cdFx0XHRcdFx0c3R5bGVUZXh0ICs9IGkgKyAnOiAnICsgc3R5bGVzW2ldICsgJzsgJ1xyXG5cdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ3N0eWxlJywgc3R5bGVUZXh0XHJcblx0XHRcdEBcclxuXHJcblx0XHRAaGFzQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdCMgaWYgbXVsdGlwbGUsIGV2ZXJ5IERPTSBzaG91bGQgaGF2ZSB0aGUgY2xhc3NcclxuXHRcdFx0aSA9IDBcclxuXHRcdFx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdFx0XHRjbGFzc1RleHQgPSBAW2ldLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0IyBub3QgdXNlICcgJyB0byBhdm9pZCBtdWx0aXBsZSBzcGFjZXMgbGlrZSAnYSAgIGInXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmICFjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGFkZENsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIG5vdCBjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0QFxyXG5cclxuXHRcdEByZW1vdmVDbGFzcyA9IChuYW1lKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGNsYXNzVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5jb250YWlucyBuYW1lXHJcblx0XHRcdFx0XHRjbGFzc2VzLnJlbW92ZSBuYW1lXHJcblx0XHRcdFx0XHRpZiBjbGFzc2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZSAnY2xhc3MnLCBjbGFzc2VzLmpvaW4gJyAnXHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgJ2NsYXNzJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHRvZ2dsZUNsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIGNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5yZW1vdmUgbmFtZVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5sZW5ndGggPiAwXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlICdjbGFzcydcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBhdHRyID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRpZiB2YWx1ZT9cclxuXHRcdFx0XHRAZWFjaCAoZG9tKSAtPiBkb20uc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXHJcblx0XHRcdFx0cmV0dXJuIEBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHJldHVybiBAWzBdLmdldEF0dHJpYnV0ZSBuYW1lXHJcblxyXG5cdFx0QGhhc0F0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdGkgPSAwXHJcblx0XHRcdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRcdFx0aWYgbm90IEBbaV0uaGFzQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHJlbW92ZUF0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0QFxyXG5cclxuXHRcdEB2YWwgPSA9PiBAWzBdPy52YWx1ZVxyXG5cclxuXHQjICQucmVhZHkoKVxyXG5cdGdsb2JhbC4kLnJlYWR5ID0gKG9uTG9hZCkgLT5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbkxvYWRcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjICQuYWpheCgpXHJcblx0I1x0b3B0aW9uczpcclxuXHQjXHRcdHVybDogc3RyaW5nXHJcblx0I1x0XHQ9PT09XHJcblx0I1x0XHRhc3luYyA9IHRydWU6IGJvb2xcclxuXHQjXHRkYXRhOiBvYmplY3QgLSBxdWVyeSBwYXJhbWV0ZXJzIFRPRE86IGltcGxlbWVudCB0aGlzXHJcblx0I1x0XHRtZXRob2QgPSBHRVQ6IFBPU1QsIFBVVCwgREVMRVRFLCBIRUFEXHJcblx0I1x0XHR1c2VybmFtZTogc3RyaW5nXHJcblx0I1x0XHRwYXNzd29yZDogc3RyaW5nXHJcblx0I1x0XHRzdWNjZXNzOiBmdW5jdGlvblxyXG5cdCNcdFx0ZXJyb3I6IGZ1bmN0aW9uXHJcblx0I1x0XHRjb21wbGV0ZTogZnVuY3Rpb25cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRnbG9iYWwuJC5hamF4ID0gKHVybCwgb3BzKSAtPlxyXG5cdFx0aWYgIW9wc1xyXG5cdFx0XHRpZiB0eXBlb2YgdXJsID09ICdvYmplY3QnXHJcblx0XHRcdFx0b3BzID0gdXJsXHJcblx0XHRcdFx0dXJsID0gb3BzLnVybFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0b3BzID0ge31cclxuXHRcdG9wcy5tZXRob2Qgb3I9ICdHRVQnXHJcblx0XHRvcHMuYXN5bmMgPSB0cnVlIHVubGVzcyBvcHMuYXN5bmM/XHJcblxyXG5cdFx0eGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0XHJcblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuXHRcdFx0aWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxyXG5cdFx0XHRcdGlmIHhoci5zdGF0dXMgPT0gMjAwXHJcblx0XHRcdFx0XHRvcHMuc3VjY2VzcyB4aHIucmVzcG9uc2VUZXh0LCB4aHIuc3RhdHVzLCB4aHIgaWYgb3BzLnN1Y2Nlc3M/XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0b3BzLmVycm9yIHhociwgeGhyLnN0YXR1cyBpZiBvcHMuZXJyb3I/XHJcblx0XHRcdFx0XHRvcHMuY29tcGxldGUgeGhyLCB4aHIuc3RhdHVzIGlmIG9wcy5jb21wbGV0ZT9cclxuXHJcblx0XHR4aHIub3BlbiBvcHMubWV0aG9kLCB1cmwsIG9wcy5hc3luYywgb3BzLnVzZXJuYW1lLCBvcHMucGFzc3dvcmRcclxuXHRcdHhoci5zZW5kIG51bGwpIEJ1Lmdsb2JhbFxyXG4iLCIjIEJhc2UgY2xhc3Mgb2YgYWxsIHNoYXBlcyBhbmQgb3RoZXIgcmVuZGVyYWJsZSBvYmplY3RzXHJcblxyXG5jbGFzcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEJ1LlN0eWxlZC5hcHBseSBAXHJcblx0XHRCdS5FdmVudC5hcHBseSBAXHJcblxyXG5cdFx0QHZpc2libGUgPSB5ZXNcclxuXHRcdEBvcGFjaXR5ID0gMVxyXG5cclxuXHRcdEBwb3NpdGlvbiA9IG5ldyBCdS5WZWN0b3JcclxuXHRcdEByb3RhdGlvbiA9IDBcclxuXHRcdEBfc2NhbGUgPSBuZXcgQnUuVmVjdG9yIDEsIDFcclxuXHRcdEBza2V3ID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdCNAdG9Xb3JsZE1hdHJpeCA9IG5ldyBCdS5NYXRyaXgoKVxyXG5cdFx0I0B1cGRhdGVNYXRyaXggLT5cclxuXHJcblx0XHQjIGdlb21ldHJ5IHJlbGF0ZWRcclxuXHRcdEBib3VuZHMgPSBudWxsICMgdXNlZCB0byBhY2NlbGVyYXRlIHRoZSBoaXQgdGVzdGluZ1xyXG5cdFx0QGtleVBvaW50cyA9IG51bGxcclxuXHJcblx0XHQjIGhpZXJhcmNoeVxyXG5cdFx0QGNoaWxkcmVuID0gW11cclxuXHRcdEBwYXJlbnQgPSBudWxsXHJcblxyXG5cdEBwcm9wZXJ0eSAnc2NhbGUnLFxyXG5cdFx0Z2V0OiAtPiBAX3NjYWxlXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdGlmIEJ1LmlzTnVtYmVyIHZhbFxyXG5cdFx0XHRcdEBfc2NhbGUueCA9IEBfc2NhbGUueSA9IHZhbFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QF9zY2FsZSA9IHZhbFxyXG5cclxuXHQjIFRyYW5zbGF0ZSBhbiBvYmplY3RcclxuXHR0cmFuc2xhdGU6IChkeCwgZHkpIC0+XHJcblx0XHRAcG9zaXRpb24ueCArPSBkeFxyXG5cdFx0QHBvc2l0aW9uLnkgKz0gZHlcclxuXHRcdEBcclxuXHJcblx0IyBSb3RhdGUgYW4gb2JqZWN0XHJcblx0cm90YXRlOiAoZGEpIC0+XHJcblx0XHRAcm90YXRpb24gKz0gZGFcclxuXHRcdEBcclxuXHJcblx0IyBTY2FsZSBhbiBvYmplY3QgYnlcclxuXHRzY2FsZUJ5OiAoZHMpIC0+XHJcblx0XHRAc2NhbGUgKj0gZHNcclxuXHRcdEBcclxuXHJcblx0IyBTY2FsZSBhbiBvYmplY3QgdG9cclxuXHRzY2FsZVRvOiAocykgLT5cclxuXHRcdEBzY2FsZSA9IHNcclxuXHRcdEBcclxuXHJcblx0IyBBZGQgb2JqZWN0KHMpIHRvIGNoaWxkcmVuXHJcblx0YWRkQ2hpbGQ6IChzaGFwZSkgLT5cclxuXHRcdGlmIEJ1LmlzQXJyYXkgc2hhcGVcclxuXHRcdFx0QGNoaWxkcmVuLnB1c2ggcyBmb3IgcyBpbiBzaGFwZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAY2hpbGRyZW4ucHVzaCBzaGFwZVxyXG5cdFx0QFxyXG5cclxuXHQjIFJlbW92ZSBvYmplY3QgZnJvbSBjaGlsZHJlblxyXG5cdHJlbW92ZUNoaWxkOiAoc2hhcGUpIC0+XHJcblx0XHRpbmRleCA9IEBjaGlsZHJlbi5pbmRleE9mIHNoYXBlXHJcblx0XHRAY2hpbGRyZW4uc3BsaWNlIGluZGV4LCAxIGlmIGluZGV4ID4gLTFcclxuXHRcdEBcclxuXHJcblx0IyBBcHBseSBhbiBhbmltYXRpb24gb24gdGhpcyBvYmplY3RcclxuXHQjIFRoZSB0eXBlIG9mIGBhbmltYCBtYXkgYmU6XHJcblx0IyAgICAgMS4gUHJlc2V0IGFuaW1hdGlvbnM6IHRoZSBhbmltYXRpb24gbmFtZShzdHJpbmcgdHlwZSksIGllLiBrZXkgaW4gYEJ1LmFuaW1hdGlvbnNgXHJcblx0IyAgICAgMi4gQ3VzdG9tIGFuaW1hdGlvbnM6IHRoZSBhbmltYXRpb24gb2JqZWN0IG9mIGBCdS5BbmltYXRpb25gIHR5cGVcclxuXHQjICAgICAzLiBNdWx0aXBsZSBhbmltYXRpb25zOiBBbiBhcnJheSB3aG9zZSBjaGlsZHJlbiBhcmUgYWJvdmUgdHdvIHR5cGVzXHJcblx0YW5pbWF0ZTogKGFuaW0sIGFyZ3MpIC0+XHJcblx0XHRhcmdzID0gW2FyZ3NdIHVubGVzcyBCdS5pc0FycmF5IGFyZ3NcclxuXHRcdGlmIEJ1LmlzU3RyaW5nIGFuaW1cclxuXHRcdFx0aWYgYW5pbSBvZiBCdS5hbmltYXRpb25zXHJcblx0XHRcdFx0QnUuYW5pbWF0aW9uc1thbmltXS5hcHBseVRvIEAsIGFyZ3NcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybiBcIkJ1LmFuaW1hdGlvbnNbXFxcIiN7IGFuaW0gfVxcXCJdIGRvZXNuJ3QgZXhpc3RzLlwiXHJcblx0XHRlbHNlIGlmIEJ1LmlzQXJyYXkgYW5pbVxyXG5cdFx0XHRAYW5pbWF0ZSBhbmltW2ldLCBhcmdzIGZvciBvd24gaSBvZiBhbmltXHJcblx0XHRlbHNlXHJcblx0XHRcdGFuaW0uYXBwbHlUbyBALCBhcmdzXHJcblx0XHRAXHJcblxyXG5cdCMgQ3JlYXRlIEJvdW5kcyBmb3IgdGhpcyBvYmplY3RcclxuXHRjcmVhdGVCb3VuZHM6IC0+XHJcblx0XHRAYm91bmRzID0gbmV3IEJ1LkJvdW5kcyBAXHJcblx0XHRAXHJcblxyXG5cdCMgSGl0IHRlc3Rpbmcgd2l0aCB1bnByb2plY3Rpb25zXHJcblx0aGl0VGVzdDogKHApIC0+XHJcblx0XHRwLnVuUHJvamVjdCBAXHJcblx0XHRAY29udGFpbnNQb2ludCBwXHJcblxyXG5cdCMgSGl0IHRlc3RpbmcgaW4gdGhlIHNhbWUgY29vcmRpbmF0ZVxyXG5cdGNvbnRhaW5zUG9pbnQ6IChwKSAtPlxyXG5cdFx0aWYgQGJvdW5kcz8gYW5kIG5vdCBAYm91bmRzLmNvbnRhaW5zUG9pbnQgcFxyXG5cdFx0XHRyZXR1cm4gbm9cclxuXHRcdGVsc2UgaWYgQF9jb250YWluc1BvaW50XHJcblx0XHRcdHJldHVybiBAX2NvbnRhaW5zUG9pbnQgcFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gbm9cclxuIiwiIyBBZGQgY29sb3IgdG8gdGhlIHNoYXBlc1xyXG4jIFRoaXMgb2JqZWN0IGlzIGRlZGljYXRlZCB0byBtaXhlZC1pbiB0aGUgT2JqZWN0MkQuXHJcblxyXG5CdS5TdHlsZWQgPSAoKSAtPlxyXG5cdEBzdHJva2VTdHlsZSA9IEJ1LlN0eWxlZC5ERUZBVUxUX1NUUk9LRV9TVFlMRVxyXG5cdEBmaWxsU3R5bGUgPSBCdS5TdHlsZWQuREVGQVVMVF9GSUxMX1NUWUxFXHJcblx0QGRhc2hTdHlsZSA9IGZhbHNlXHJcblx0QGRhc2hGbG93U3BlZWQgPSAwXHJcblx0QGxpbmVXaWR0aCA9IDFcclxuXHJcblx0QGRhc2hPZmZzZXQgPSAwXHJcblxyXG5cdCMgU2V0L2NvcHkgc3R5bGUgZnJvbSBvdGhlciBzdHlsZVxyXG5cdEBzdHlsZSA9IChzdHlsZSkgLT5cclxuXHRcdGlmIEJ1LmlzU3RyaW5nIHN0eWxlXHJcblx0XHRcdHN0eWxlID0gQnUuc3R5bGVzW3N0eWxlXVxyXG5cdFx0XHRpZiBub3Qgc3R5bGU/XHJcblx0XHRcdFx0c3R5bGUgPSBCdS5zdHlsZXMuZGVmYXVsdFxyXG5cdFx0XHRcdGNvbnNvbGUud2FybiBcIkJ1LlN0eWxlZDogQnUuc3R5bGVzLiN7IHN0eWxlIH0gZG9lc24ndCBleGlzdHMsIGZlbGwgYmFjayB0byBkZWZhdWx0LlwiXHJcblx0XHRlbHNlIGlmIG5vdCBzdHlsZT9cclxuXHRcdFx0c3R5bGUgPSBCdS5zdHlsZXNbJ2RlZmF1bHQnXVxyXG5cclxuXHRcdGZvciBrIGluIFsnc3Ryb2tlU3R5bGUnLCAnZmlsbFN0eWxlJywgJ2Rhc2hTdHlsZScsICdkYXNoRmxvd1NwZWVkJywgJ2xpbmVXaWR0aCddXHJcblx0XHRcdEBba10gPSBzdHlsZVtrXVxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgc3Ryb2tlIHN0eWxlXHJcblx0QHN0cm9rZSA9ICh2KSAtPlxyXG5cdFx0diA9IHRydWUgdW5sZXNzIHY/XHJcblx0XHR2ID0gQnUuc3R5bGVzW3ZdLnN0cm9rZVN0eWxlIGlmIEJ1LnN0eWxlcz8gYW5kIHYgb2YgQnUuc3R5bGVzXHJcblx0XHRzd2l0Y2ggdlxyXG5cdFx0XHR3aGVuIHRydWUgdGhlbiBAc3Ryb2tlU3R5bGUgPSBCdS5TdHlsZWQuREVGQVVMVF9TVFJPS0VfU1RZTEVcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBzdHJva2VTdHlsZSA9IG51bGxcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBzdHJva2VTdHlsZSA9IHZcclxuXHRcdEBcclxuXHJcblx0IyBTZXQgdGhlIGZpbGwgc3R5bGVcclxuXHRAZmlsbCA9ICh2KSAtPlxyXG5cdFx0diA9IHRydWUgdW5sZXNzIHY/XHJcblx0XHR2ID0gQnUuc3R5bGVzW3ZdLmZpbGxTdHlsZSBpZiBCdS5zdHlsZXM/IGFuZCB2IG9mIEJ1LnN0eWxlc1xyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBmaWxsU3R5bGUgPSBudWxsXHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBmaWxsU3R5bGUgPSBCdS5TdHlsZWQuREVGQVVMVF9GSUxMX1NUWUxFXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAZmlsbFN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHQjIFNldCB0aGUgZGFzaCBzdHlsZVxyXG5cdEBkYXNoID0gKHYpIC0+XHJcblx0XHR2ID0gdHJ1ZSB1bmxlc3Mgdj9cclxuXHRcdHYgPSBCdS5zdHlsZXNbdl0uZGFzaFN0eWxlIGlmIEJ1LnN0eWxlcz8gYW5kIHYgb2YgQnUuc3R5bGVzXHJcblx0XHR2ID0gW3YsIHZdIGlmIEJ1LmlzTnVtYmVyIHZcclxuXHRcdHN3aXRjaCB2XHJcblx0XHRcdHdoZW4gZmFsc2UgdGhlbiBAZGFzaFN0eWxlID0gbnVsbFxyXG5cdFx0XHR3aGVuIHRydWUgdGhlbiBAZGFzaFN0eWxlID0gQnUuU3R5bGVkLkRFRkFVTFRfREFTSF9TVFlMRVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QGRhc2hTdHlsZSA9IHZcclxuXHRcdEBcclxuXHJcblx0IyBTZXQgdGhlIGRhc2ggZmxvd2luZyBzcGVlZFxyXG5cdEBkYXNoRmxvdyA9IChzcGVlZCkgLT5cclxuXHRcdHNwZWVkID0gMSBpZiBzcGVlZCA9PSB0cnVlIG9yIG5vdCBzcGVlZD9cclxuXHRcdHNwZWVkID0gMCBpZiBzcGVlZCA9PSBmYWxzZVxyXG5cdFx0QnUuZGFzaEZsb3dNYW5hZ2VyLnNldFNwZWVkIEAsIHNwZWVkXHJcblx0XHRAXHJcblxyXG5cdCMgU2V0IHRoZSBsaW5lV2lkdGhcclxuXHRAc2V0TGluZVdpZHRoID0gKHcpIC0+XHJcblx0XHRAbGluZVdpZHRoID0gd1xyXG5cdFx0QFxyXG5cclxuXHRAXHJcblxyXG5CdS5TdHlsZWQuREVGQVVMVF9TVFJPS0VfU1RZTEUgPSAnIzA0OCdcclxuQnUuU3R5bGVkLkRFRkFVTFRfRklMTF9TVFlMRSA9ICdyZ2JhKDY0LCAxMjgsIDE5MiwgMC41KSdcclxuQnUuU3R5bGVkLkRFRkFVTFRfREFTSF9TVFlMRSA9IFs4LCA0XVxyXG5cclxuQnUuc3R5bGVzID1cclxuXHRkZWZhdWx0OiBuZXcgQnUuU3R5bGVkKCkuc3Ryb2tlKCkuZmlsbCgpXHJcblx0aG92ZXI6IG5ldyBCdS5TdHlsZWQoKS5zdHJva2UoJ2hzbGEoMCwgMTAwJSwgNDAlLCAwLjc1KScpLmZpbGwoJ2hzbGEoMCwgMTAwJSwgNzUlLCAwLjUpJylcclxuXHR0ZXh0OiBuZXcgQnUuU3R5bGVkKCkuc3Ryb2tlKGZhbHNlKS5maWxsKCdibGFjaycpXHJcblx0bGluZTogbmV3IEJ1LlN0eWxlZCgpLmZpbGwoZmFsc2UpXHJcblx0c2VsZWN0ZWQ6IG5ldyBCdS5TdHlsZWQoKS5zZXRMaW5lV2lkdGgoMylcclxuXHRkYXNoOiBuZXcgQnUuU3R5bGVkKCkuZGFzaCgpXHJcbiIsIiMgRGVjbGFyYXRpdmUgZnJhbWV3b3JrIGZvciBCdS5qcyBhcHBzXHJcblxyXG4jIyM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSMjXHJcbkFsbCBzdXBwb3J0ZWQgY29uc3RydWN0b3Igb3B0aW9uczpcclxuKFRoZSBhcHBlYXJhbmNlIHNlcXVlbmNlIGlzIHRoZSBwcm9jZXNzIHNlcXVlbmNlLilcclxue1xyXG4gICAgcmVuZGVyZXI6ICMgc2V0dGluZ3MgdG8gdGhlIHJlbmRlcmVyXHJcbiAgICBcdGNvbnRhaW5lcjogJyNjb250YWluZXInICMgY3NzIHNlbGVjdG9yIG9mIHRoZSBjb250YWluZXIgZG9tIG9yIGl0c2VsZlxyXG4gICAgICAgIGN1cnNvcjogJ2Nyb3NzaGFuZCcgIyB0aGUgZGVmYXVsdCBjdXJzb3Igc3R5bGUgb24gdGhlIDxjYW52YXM+XHJcbiAgICAgICAgYmFja2dyb3VuZDogJ3BpbmsnICMgdGhlIGRlZmF1bHQgYmFja2dyb3VuZCBvZiB0aGUgPGNhbnZhcz5cclxuICAgIFx0c2hvd0tleVBvaW50czogdHJ1ZSAjIHdoZXRoZXIgdG8gc2hvdyB0aGUga2V5IHBvaW50cyBvZiBzaGFwZXMgKGlmIHRoZXkgaGF2ZSkuXHJcbiAgICBkYXRhOiB7IHZhciB9ICMgdmFyaWFibGVzIG9mIHRoaXMgQnUuanMgYXBwLCB3aWxsIGJlIGNvcGllZCB0byB0aGUgYXBwIG9iamVjdFxyXG4gICAgbWV0aG9kczogeyBmdW5jdGlvbiB9IyBmdW5jdGlvbnMgb2YgdGhpcyBCdS5qcyBhcHAsIHdpbGwgYmUgY29waWVkIHRvIHRoZSBhcHAgb2JqZWN0XHJcbiAgICBvYmplY3RzOiB7fSBvciBmdW5jdGlvbiB0aGF0IHJldHVybnMge30gIyBhbGwgdGhlIHJlbmRlcmFibGUgb2JqZWN0c1xyXG5cdGhpZXJhcmNoeTogIyBhbiB0cmVlIHRoYXQgcmVwcmVzZW50IHRoZSBvYmplY3QgaGllcmFyY2h5IG9mIHRoZSBzY2VuZSwgdGhlIGtleXMgYXJlIGluIGBvYmplY3RzYFxyXG4gICAgZXZlbnRzOiAjIGV2ZW50IGxpc3RlbmVycywgJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGJvdW5kIHRvIDxjYW52YXM+XHJcbiAgICBpbml0OiBmdW5jdGlvbiAjIGNhbGxlZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeVxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAjIGNhbGxlZCBldmVyeSBmcmFtZVxyXG59XHJcbiMjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0jIyNcclxuXHJcbmNsYXNzIEJ1LkFwcFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEAkb3B0aW9ucyA9IHt9KSAtPlxyXG5cdFx0Zm9yIGsgaW4gW1wicmVuZGVyZXJcIiwgXCJkYXRhXCIsIFwib2JqZWN0c1wiLCBcImhpZXJhcmNoeVwiLCBcIm1ldGhvZHNcIiwgXCJldmVudHNcIl1cclxuXHRcdFx0QCRvcHRpb25zW2tdIG9yPSB7fVxyXG5cclxuXHRcdEAkb2JqZWN0cyA9IHt9XHJcblx0XHRAJGlucHV0TWFuYWdlciA9IG5ldyBCdS5JbnB1dE1hbmFnZXJcclxuXHJcblx0XHRCdS5yZWFkeSBAaW5pdCwgQFxyXG5cclxuXHRpbml0OiAoKSAtPlxyXG5cdFx0IyByZW5kZXJlclxyXG5cdFx0QCRyZW5kZXJlciA9IG5ldyBCdS5SZW5kZXJlciBAJG9wdGlvbnMucmVuZGVyZXJcclxuXHJcblx0XHQjIGRhdGFcclxuXHRcdGlmIEJ1LmlzRnVuY3Rpb24gQCRvcHRpb25zLmRhdGFcclxuXHRcdFx0QCRvcHRpb25zLmRhdGEgPSBAJG9wdGlvbnMuZGF0YS5hcHBseSB0aGlzXHJcblx0XHRAW2tdID0gQCRvcHRpb25zLmRhdGFba10gZm9yIGsgb2YgQCRvcHRpb25zLmRhdGFcclxuXHJcblx0XHQjIG1ldGhvZHNcclxuXHRcdEBba10gPSBAJG9wdGlvbnMubWV0aG9kc1trXSBmb3IgayBvZiBAJG9wdGlvbnMubWV0aG9kc1xyXG5cclxuXHRcdCMgb2JqZWN0c1xyXG5cdFx0aWYgQnUuaXNGdW5jdGlvbiBAJG9wdGlvbnMub2JqZWN0c1xyXG5cdFx0XHRAJG9iamVjdHMgPSBAJG9wdGlvbnMub2JqZWN0cy5hcHBseSB0aGlzXHJcblx0XHRlbHNlXHJcblx0XHRcdEAkb2JqZWN0c1tuYW1lXSA9IEAkb3B0aW9ucy5vYmplY3RzW25hbWVdIGZvciBuYW1lIG9mIEAkb3B0aW9ucy5vYmplY3RzXHJcblxyXG5cdFx0IyBoaWVyYXJjaHlcclxuXHRcdCMgVE9ETyB1c2UgYW4gYWxnb3JpdGhtIHRvIGF2b2lkIGNpcmN1bGFyIHN0cnVjdHVyZVxyXG5cdFx0YXNzZW1ibGVPYmplY3RzID0gKGNoaWxkcmVuLCBwYXJlbnQpID0+XHJcblx0XHRcdGZvciBvd24gbmFtZSBvZiBjaGlsZHJlblxyXG5cdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5wdXNoIEAkb2JqZWN0c1tuYW1lXVxyXG5cdFx0XHRcdGFzc2VtYmxlT2JqZWN0cyBjaGlsZHJlbltuYW1lXSwgQCRvYmplY3RzW25hbWVdXHJcblx0XHRhc3NlbWJsZU9iamVjdHMgQCRvcHRpb25zLmhpZXJhcmNoeSwgQCRyZW5kZXJlci5zY2VuZVxyXG5cclxuXHRcdCMgaW5pdFxyXG5cdFx0QCRvcHRpb25zLmluaXQ/LmNhbGwgQFxyXG5cclxuXHRcdCMgZXZlbnRzXHJcblx0XHRAJGlucHV0TWFuYWdlci5oYW5kbGVBcHBFdmVudHMgQCwgQCRvcHRpb25zLmV2ZW50c1xyXG5cclxuXHRcdCMgdXBkYXRlXHJcblx0XHRpZiBAJG9wdGlvbnMudXBkYXRlP1xyXG5cdFx0XHRAJHJlbmRlcmVyLm9uICd1cGRhdGUnLCA9PiBAJG9wdGlvbnMudXBkYXRlLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xyXG4iLCIjIEF1ZGlvXHJcblxyXG5jbGFzcyBCdS5BdWRpb1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKHVybCkgLT5cclxuXHRcdEBhdWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2F1ZGlvJ1xyXG5cdFx0QHVybCA9ICcnXHJcblx0XHRAcmVhZHkgPSBub1xyXG5cclxuXHRcdEBsb2FkIHVybCBpZiB1cmxcclxuXHJcblx0bG9hZDogKHVybCkgLT5cclxuXHRcdEB1cmwgPSB1cmxcclxuXHRcdEBhdWRpby5hZGRFdmVudExpc3RlbmVyICdjYW5wbGF5JywgPT5cclxuXHRcdFx0QHJlYWR5ID0geWVzXHJcblx0XHRAYXVkaW8uc3JjID0gdXJsXHJcblxyXG5cdHBsYXk6IC0+XHJcblx0XHRpZiBAcmVhZHlcclxuXHRcdFx0QGF1ZGlvLnBsYXkoKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRjb25zb2xlLndhcm4gXCJUaGUgYXVkaW8gZmlsZSAjeyBAdXJsIH0gaGFzbid0IGJlZW4gcmVhZHkuXCJcclxuIiwiIyBDYW1lcmE6IGNoYW5nZSB0aGUgdmlldyByYW5nZSBhdCB0aGUgc2NlbmVcclxuXHJcbmNsYXNzIEJ1LkNhbWVyYSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnQ2FtZXJhJ1xyXG5cclxuIiwiIyBNYW5hZ2UgdGhlIHVzZXIgaW5wdXQsIGxpa2UgbW91c2UsIGtleWJvYXJkLCB0b3VjaHNjcmVlbiBldGNcclxuXHJcbmNsYXNzIEJ1LklucHV0TWFuYWdlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxyXG5cclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IHllc1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgKGUpID0+XHJcblx0XHRcdEBrZXlTdGF0ZXNbZS5rZXlDb2RlXSA9IG5vXHJcblxyXG5cdCMgVG8gZGV0ZWN0IHdoZXRoZXIgYSBrZXkgaXMgcHJlc3NlZCBkb3duXHJcblx0aXNLZXlEb3duOiAoa2V5KSAtPlxyXG5cdFx0a2V5Q29kZSA9IEBrZXlUb0tleUNvZGUga2V5XHJcblx0XHRAa2V5U3RhdGVzW2tleUNvZGVdXHJcblxyXG5cdCMgQ29udmVydCBmcm9tIGtleUlkZW50aWZpZXJzL2tleVZhbHVlcyB0byBrZXlDb2RlXHJcblx0a2V5VG9LZXlDb2RlOiAoa2V5KSAtPlxyXG5cdFx0a2V5ID0gQGtleUFsaWFzVG9LZXlNYXBba2V5XSBvciBrZXlcclxuXHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlTWFwW2tleV1cclxuXHJcblx0IyBSZWNpZXZlIGFuZCBiaW5kIHRoZSBtb3VzZS9rZXlib2FyZCBldmVudHMgbGlzdGVuZXJzXHJcblx0aGFuZGxlQXBwRXZlbnRzOiAoYXBwLCBldmVudHMpIC0+XHJcblx0XHRrZXlkb3duTGlzdGVuZXJzID0ge31cclxuXHRcdGtleXVwTGlzdGVuZXJzID0ge31cclxuXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSA9PlxyXG5cdFx0XHRrZXlkb3duTGlzdGVuZXJzW2Uua2V5Q29kZV0/LmNhbGwgYXBwLCBlXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5dXAnLCAoZSkgPT5cclxuXHRcdFx0a2V5dXBMaXN0ZW5lcnNbZS5rZXlDb2RlXT8uY2FsbCBhcHAsIGVcclxuXHJcblx0XHRmb3IgdHlwZSBvZiBldmVudHNcclxuXHRcdFx0aWYgdHlwZSBpbiBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdrZXlkb3duJywgJ2tleXVwJ11cclxuXHRcdFx0XHRhcHAuJHJlbmRlcmVyLmRvbS5hZGRFdmVudExpc3RlbmVyIHR5cGUsIGV2ZW50c1t0eXBlXS5iaW5kKGFwcClcclxuXHRcdFx0ZWxzZSBpZiB0eXBlLmluZGV4T2YoJ2tleWRvd24uJykgPT0gMFxyXG5cdFx0XHRcdGtleSA9IHR5cGUuc3Vic3RyaW5nIDhcclxuXHRcdFx0XHRrZXlDb2RlID0gQGtleVRvS2V5Q29kZSBrZXlcclxuXHRcdFx0XHRrZXlkb3duTGlzdGVuZXJzW2tleUNvZGVdID0gZXZlbnRzW3R5cGVdXHJcblx0XHRcdGVsc2UgaWYgdHlwZS5pbmRleE9mKCdrZXl1cC4nKSA9PSAwXHJcblx0XHRcdFx0a2V5ID0gdHlwZS5zdWJzdHJpbmcgNlxyXG5cdFx0XHRcdGtleUNvZGUgPSBAa2V5VG9LZXlDb2RlIGtleVxyXG5cdFx0XHRcdGtleXVwTGlzdGVuZXJzW2tleUNvZGVdID0gZXZlbnRzW3R5cGVdXHJcblxyXG5cdCMgTWFwIGZyb20ga2V5SWRlbnRpZmllcnMva2V5VmFsdWVzIHRvIGtleUNvZGVcclxuXHRrZXlUb0tleUNvZGVNYXA6XHJcblx0XHRCYWNrc3BhY2U6ICAgIDhcclxuXHRcdFRhYjogICAgICAgICAgOVxyXG5cdFx0RW50ZXI6ICAgICAgIDEzXHJcblx0XHRTaGlmdDogICAgICAgMTZcclxuXHRcdENvbnRyb2w6ICAgICAxN1xyXG5cdFx0QWx0OiAgICAgICAgIDE4XHJcblx0XHRDYXBzTG9jazogICAgMjBcclxuXHRcdEVzY2FwZTogICAgICAyN1xyXG5cdFx0JyAnOiAgICAgICAgIDMyICAjIFNwYWNlXHJcblx0XHRQYWdlVXA6ICAgICAgMzNcclxuXHRcdFBhZ2VEb3duOiAgICAzNFxyXG5cdFx0RW5kOiAgICAgICAgIDM1XHJcblx0XHRIb21lOiAgICAgICAgMzZcclxuXHRcdEFycm93TGVmdDogICAzN1xyXG5cdFx0QXJyb3dVcDogICAgIDM4XHJcblx0XHRBcnJvd1JpZ2h0OiAgMzlcclxuXHRcdEFycm93RG93bjogICA0MFxyXG5cdFx0RGVsZXRlOiAgICAgIDQ2XHJcblxyXG5cdFx0MTogNDlcclxuXHRcdDI6IDUwXHJcblx0XHQzOiA1MVxyXG5cdFx0NDogNTJcclxuXHRcdDU6IDUzXHJcblx0XHQ2OiA1NFxyXG5cdFx0NzogNTVcclxuXHRcdDg6IDU2XHJcblx0XHQ5OiA1N1xyXG5cdFx0QTogNjVcclxuXHRcdEI6IDY2XHJcblx0XHRDOiA2N1xyXG5cdFx0RDogNjhcclxuXHRcdEU6IDY5XHJcblx0XHRGOiA3MFxyXG5cdFx0RzogNzFcclxuXHRcdEg6IDcyXHJcblx0XHRJOiA3M1xyXG5cdFx0SjogNzRcclxuXHRcdEs6IDc1XHJcblx0XHRMOiA3NlxyXG5cdFx0TTogNzdcclxuXHRcdE46IDc4XHJcblx0XHRPOiA3OVxyXG5cdFx0UDogODBcclxuXHRcdFE6IDgxXHJcblx0XHRSOiA4MlxyXG5cdFx0UzogODNcclxuXHRcdFQ6IDg0XHJcblx0XHRVOiA4NVxyXG5cdFx0VjogODZcclxuXHRcdFc6IDg3XHJcblx0XHRYOiA4OFxyXG5cdFx0WTogODlcclxuXHRcdFo6IDkwXHJcblxyXG5cdFx0RjE6ICAxMTJcclxuXHRcdEYyOiAgMTEzXHJcblx0XHRGMzogIDExNFxyXG5cdFx0RjQ6ICAxMTVcclxuXHRcdEY1OiAgMTE2XHJcblx0XHRGNjogIDExN1xyXG5cdFx0Rjc6ICAxMThcclxuXHRcdEY4OiAgMTE5XHJcblx0XHRGOTogIDEyMFxyXG5cdFx0RjEwOiAxMjFcclxuXHRcdEYxMTogMTIyXHJcblx0XHRGMTI6IDEyM1xyXG5cclxuXHRcdCdgJzogMTkyXHJcblx0XHQnPSc6IDE4N1xyXG5cdFx0JywnOiAxODhcclxuXHRcdCctJzogMTg5XHJcblx0XHQnLic6IDE5MFxyXG5cdFx0Jy8nOiAxOTFcclxuXHRcdCc7JzogMTg2XHJcblx0XHRcIidcIjogMjIyXHJcblx0XHQnWyc6IDIxOVxyXG5cdFx0J10nOiAyMjFcclxuXHRcdCdcXFxcJzogMjIwXHJcblxyXG5cdCMgTWFwIGZyb20gbm90IHN0YW5kYXJkLCBidXQgY29tbW9ubHkga25vd24ga2V5VmFsdWVzL2tleUlkZW50aWZpZXJzIHRvIGtleUNvZGVcclxuXHRrZXlBbGlhc1RvS2V5TWFwOlxyXG5cdFx0Q3RybDogICAgICAgICdDb250cm9sJyAgICAgIyAxN1xyXG5cdFx0Q3RsOiAgICAgICAgICdDb250cm9sJyAgICAgIyAxN1xyXG5cdFx0RXNjOiAgICAgICAgICdFc2NhcGUnICAgICAgIyAyN1xyXG5cdFx0U3BhY2U6ICAgICAgICcgJyAgICAgICAgICAgIyAzMlxyXG5cdFx0UGdVcDogICAgICAgICdQYWdlVXAnICAgICAgIyAzM1xyXG5cdFx0J1BhZ2UgVXAnOiAgICdQYWdlVXAnICAgICAgIyAzM1xyXG5cdFx0UGdEbjogICAgICAgICdQYWdlRG93bicgICAgIyAzNFxyXG5cdFx0J1BhZ2UgRG93bic6ICdQYWdlRG93bicgICAgIyAzNFxyXG5cdFx0TGVmdDogICAgICAgICdBcnJvd0xlZnQnICAgIyAzN1xyXG5cdFx0VXA6ICAgICAgICAgICdBcnJvd1VwJyAgICAgIyAzOFxyXG5cdFx0UmlnaHQ6ICAgICAgICdBcnJvd1JpZ2h0JyAgIyAzOVxyXG5cdFx0RG93bjogICAgICAgICdBcnJvd0Rvd24nICAgIyA0MFxyXG5cdFx0RGVsOiAgICAgICAgICdEZWxldGUnICAgICAgIyA0NlxyXG4iLCIjIFVzZWQgdG8gcmVuZGVyIGFsbCB0aGUgZHJhd2FibGUgb2JqZWN0cyB0byB0aGUgY2FudmFzXHJcblxyXG5jbGFzcyBCdS5SZW5kZXJlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHRcdEB0eXBlID0gJ1JlbmRlcmVyJ1xyXG5cclxuXHRcdCMgQVBJXHJcblx0XHRAc2NlbmUgPSBuZXcgQnUuU2NlbmVcclxuXHRcdEBjYW1lcmEgPSBuZXcgQnUuQ2FtZXJhXHJcblx0XHRAdGlja0NvdW50ID0gMFxyXG5cdFx0QGlzUnVubmluZyA9IHllc1xyXG5cdFx0QHBpeGVsUmF0aW8gPSBCdS5nbG9iYWwuZGV2aWNlUGl4ZWxSYXRpbyBvciAxXHJcblx0XHRAY2xpcE1ldGVyID0gbmV3IENsaXBNZXRlcigpIGlmIENsaXBNZXRlcj9cclxuXHJcblx0XHQjIFJlY2VpdmUgb3B0aW9uc1xyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0Y29udGFpbmVyOiAnYm9keSdcclxuXHRcdFx0YmFja2dyb3VuZDogJyNlZWUnXHJcblx0XHRcdGZwczogNjBcclxuXHRcdFx0c2hvd0tleVBvaW50czogbm9cclxuXHRcdFx0c2hvd0JvdW5kczogbm9cclxuXHRcdFx0b3JpZ2luQXRDZW50ZXI6IG5vXHJcblx0XHRcdGltYWdlU21vb3RoaW5nOiB5ZXNcclxuXHJcblx0XHQjIENvcHkgb3B0aW9uc1xyXG5cdFx0Zm9yIG5hbWUgaW4gWydjb250YWluZXInLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2ZwcycsICdzaG93S2V5UG9pbnRzJywgJ3Nob3dCb3VuZHMnLCAnb3JpZ2luQXRDZW50ZXInXVxyXG5cdFx0XHRAW25hbWVdID0gb3B0aW9uc1tuYW1lXVxyXG5cclxuXHRcdCMgSWYgb3B0aW9ucy53aWR0aCBpcyBub3QgZ2l2ZW4sIHRoZW4gZmlsbFBhcmVudCBpcyB0cnVlXHJcblx0XHRAZmlsbFBhcmVudCA9IG5vdCBCdS5pc051bWJlciBvcHRpb25zLndpZHRoXHJcblxyXG5cdFx0IyBDb252ZXJ0IHdpZHRoIGFuZCBoZWlnaHQgZnJvbSBkaXAoZGV2aWNlIGluZGVwZW5kZW50IHBpeGVscykgdG8gcGh5c2ljYWwgcGl4ZWxzXHJcblx0XHRAd2lkdGggKj0gQHBpeGVsUmF0aW9cclxuXHRcdEBoZWlnaHQgKj0gQHBpeGVsUmF0aW9cclxuXHJcblx0XHQjIFNldCBjYW52YXMgZG9tXHJcblx0XHRAZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnY2FudmFzJ1xyXG5cdFx0QGRvbS5zdHlsZS5jdXJzb3IgPSBvcHRpb25zLmN1cnNvciBvciAnZGVmYXVsdCdcclxuXHRcdEBkb20uc3R5bGUuYm94U2l6aW5nID0gJ2NvbnRlbnQtYm94J1xyXG5cdFx0QGRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gb3B0aW9ucy5iYWNrZ3JvdW5kXHJcblx0XHRAZG9tLm9uY29udGV4dG1lbnUgPSAtPiBmYWxzZVxyXG5cclxuXHRcdCMgU2V0IGNvbnRleHRcclxuXHRcdEBjb250ZXh0ID0gQGRvbS5nZXRDb250ZXh0ICcyZCdcclxuXHRcdEBjb250ZXh0LnRleHRCYXNlbGluZSA9ICd0b3AnXHJcblx0XHRAY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBvcHRpb25zLmltYWdlU21vb3RoaW5nXHJcblxyXG5cdFx0IyBTZXQgY29udGFpbmVyIGRvbVxyXG5cdFx0QGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgQGNvbnRhaW5lciBpZiBCdS5pc1N0cmluZyBAY29udGFpbmVyXHJcblx0XHRpZiBAZmlsbFBhcmVudCBhbmQgQGNvbnRhaW5lciA9PSBkb2N1bWVudC5ib2R5XHJcblx0XHRcdCQoJ2JvZHknKS5zdHlsZSgnbWFyZ2luJywgMCkuc3R5bGUoJ292ZXJmbG93JywgJ2hpZGRlbicpXHJcblx0XHRcdCQoJ2h0bWwsIGJvZHknKS5zdHlsZSgnd2lkdGgnLCAnMTAwJScpLnN0eWxlKCdoZWlnaHQnLCAnMTAwJScpXHJcblxyXG5cdFx0IyBTZXQgc2l6ZXMgZm9yIHJlbmRlcmVyIHByb3BlcnR5LCBkb20gYXR0cmlidXRlIGFuZCBkb20gc3R5bGVcclxuXHRcdG9uUmVzaXplID0gPT5cclxuXHRcdFx0Y2FudmFzUmF0aW8gPSBAZG9tLmhlaWdodCAvIEBkb20ud2lkdGhcclxuXHRcdFx0Y29udGFpbmVyUmF0aW8gPSBAY29udGFpbmVyLmNsaWVudEhlaWdodCAvIEBjb250YWluZXIuY2xpZW50V2lkdGhcclxuXHRcdFx0aWYgY29udGFpbmVyUmF0aW8gPCBjYW52YXNSYXRpb1xyXG5cdFx0XHRcdGhlaWdodCA9IEBjb250YWluZXIuY2xpZW50SGVpZ2h0XHJcblx0XHRcdFx0d2lkdGggPSBoZWlnaHQgLyBjb250YWluZXJSYXRpb1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0d2lkdGggPSBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdFx0aGVpZ2h0ID0gd2lkdGggKiBjb250YWluZXJSYXRpb1xyXG5cdFx0XHRAd2lkdGggPSBAZG9tLndpZHRoID0gd2lkdGggKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAaGVpZ2h0ID0gQGRvbS5oZWlnaHQgPSBoZWlnaHQgKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAZG9tLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXHJcblx0XHRcdEBkb20uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xyXG5cdFx0XHRAcmVuZGVyKClcclxuXHJcblx0XHRpZiBub3QgQGZpbGxQYXJlbnRcclxuXHRcdFx0QGRvbS5zdHlsZS53aWR0aCA9IChAd2lkdGggLyBAcGl4ZWxSYXRpbykgKyAncHgnXHJcblx0XHRcdEBkb20uc3R5bGUuaGVpZ2h0ID0gKEBoZWlnaHQgLyBAcGl4ZWxSYXRpbykgKyAncHgnXHJcblx0XHRcdEBkb20ud2lkdGggPSBAd2lkdGhcclxuXHRcdFx0QGRvbS5oZWlnaHQgPSBAaGVpZ2h0XHJcblx0XHRlbHNlXHJcblx0XHRcdEB3aWR0aCA9IEBjb250YWluZXIuY2xpZW50V2lkdGhcclxuXHRcdFx0QGhlaWdodCA9IEBjb250YWluZXIuY2xpZW50SGVpZ2h0XHJcblx0XHRcdEJ1Lmdsb2JhbC53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgb25SZXNpemVcclxuXHRcdFx0QGRvbS5hZGRFdmVudExpc3RlbmVyICdET01Ob2RlSW5zZXJ0ZWQnLCBvblJlc2l6ZVxyXG5cclxuXHRcdCMgUnVuIHRoZSBsb29wXHJcblx0XHR0aWNrID0gPT5cclxuXHRcdFx0aWYgQGlzUnVubmluZ1xyXG5cdFx0XHRcdEBjbGlwTWV0ZXIuc3RhcnQoKSBpZiBAY2xpcE1ldGVyP1xyXG5cdFx0XHRcdEByZW5kZXIoKVxyXG5cdFx0XHRcdEB0cmlnZ2VyICd1cGRhdGUnLCBAXHJcblx0XHRcdFx0QHRpY2tDb3VudCArPSAxXHJcblx0XHRcdFx0QGNsaXBNZXRlci50aWNrKCkgaWYgQGNsaXBNZXRlcj9cclxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHRpY2tcclxuXHRcdHRpY2soKVxyXG5cclxuXHRcdCMgQXBwZW5kIDxjYW52YXM+IGRvbSBpbnRvIHRoZSBjb250YWluZXJcclxuXHRcdGFwcGVuZERvbSA9ID0+XHJcblx0XHRcdEBjb250YWluZXIuYXBwZW5kQ2hpbGQgQGRvbVxyXG5cdFx0c2V0VGltZW91dCBhcHBlbmREb20sIDFcclxuXHJcblx0XHQjIEhvb2sgdXAgd2l0aCBydW5uaW5nIGNvbXBvbmVudHNcclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lci5ob29rVXAgQFxyXG5cdFx0QnUuZGFzaEZsb3dNYW5hZ2VyLmhvb2tVcCBAXHJcblxyXG5cclxuXHQjIFBhdXNlL2NvbnRpbnVlL3RvZ2dsZSB0aGUgcmVuZGVyaW5nIGxvb3BcclxuXHRwYXVzZTogLT4gQGlzUnVubmluZyA9IGZhbHNlXHJcblx0Y29udGludWU6IC0+IEBpc1J1bm5pbmcgPSB0cnVlXHJcblx0dG9nZ2xlOiAtPiBAaXNSdW5uaW5nID0gbm90IEBpc1J1bm5pbmdcclxuXHJcblxyXG5cdCMgUGVyZm9ybSB0aGUgZnVsbCByZW5kZXIgcHJvY2Vzc1xyXG5cdHJlbmRlcjogLT5cclxuXHRcdEBjb250ZXh0LnNhdmUoKVxyXG5cclxuXHRcdCMgQ2xlYXIgdGhlIGNhbnZhc1xyXG5cdFx0QGNsZWFyQ2FudmFzKClcclxuXHJcblx0XHQjIE1vdmUgY2VudGVyIGZyb20gbGVmdC10b3AgY29ybmVyIHRvIHNjcmVlbiBjZW50ZXJcclxuXHRcdEBjb250ZXh0LnRyYW5zbGF0ZSBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiBpZiBAb3JpZ2luQXRDZW50ZXJcclxuXHJcblx0XHQjIFpvb20gdGhlIGNhbnZhcyB3aXRoIGRldmljZVBpeGVsUmF0aW8gdG8gc3VwcG9ydCBoaWdoIGRlZmluaXRpb24gc2NyZWVuXHJcblx0XHRAY29udGV4dC5zY2FsZSBAcGl4ZWxSYXRpbywgQHBpeGVsUmF0aW9cclxuXHJcblx0XHQjIFRyYW5zZm9ybSB0aGUgY2FtZXJhXHJcblx0XHRAY29udGV4dC5zY2FsZSAxIC8gQGNhbWVyYS5zY2FsZS54LCAxIC8gQGNhbWVyYS5zY2FsZS55XHJcblx0XHRAY29udGV4dC5yb3RhdGUgLUBjYW1lcmEucm90YXRpb25cclxuXHRcdEBjb250ZXh0LnRyYW5zbGF0ZSAtQGNhbWVyYS5wb3NpdGlvbi54LCAtQGNhbWVyYS5wb3NpdGlvbi55XHJcblxyXG5cdFx0IyBEcmF3IHRoZSBzY2VuZSB0cmVlXHJcblx0XHRAZHJhd1NoYXBlIEBzY2VuZVxyXG5cdFx0QGNvbnRleHQucmVzdG9yZSgpXHJcblx0XHRAXHJcblxyXG5cdCMgQ2xlYXIgdGhlIGNhbnZhc1xyXG5cdGNsZWFyQ2FudmFzOiAtPlxyXG5cdFx0QGNvbnRleHQuY2xlYXJSZWN0IDAsIDAsIEB3aWR0aCwgQGhlaWdodFxyXG5cdFx0QFxyXG5cclxuXHQjIERyYXcgYW4gYXJyYXkgb2YgZHJhd2FibGVzXHJcblx0ZHJhd1NoYXBlczogKHNoYXBlcykgPT5cclxuXHRcdGlmIHNoYXBlcz9cclxuXHRcdFx0Zm9yIHNoYXBlIGluIHNoYXBlc1xyXG5cdFx0XHRcdEBjb250ZXh0LnNhdmUoKVxyXG5cdFx0XHRcdEBkcmF3U2hhcGUgc2hhcGVcclxuXHRcdFx0XHRAY29udGV4dC5yZXN0b3JlKClcclxuXHRcdEBcclxuXHJcblx0IyBEcmF3IGFuIGRyYXdhYmxlIHRvIHRoZSBjYW52YXNcclxuXHRkcmF3U2hhcGU6IChzaGFwZSkgPT5cclxuXHRcdHJldHVybiBAIHVubGVzcyBzaGFwZS52aXNpYmxlXHJcblxyXG5cdFx0QGNvbnRleHQudHJhbnNsYXRlIHNoYXBlLnBvc2l0aW9uLngsIHNoYXBlLnBvc2l0aW9uLnlcclxuXHRcdEBjb250ZXh0LnJvdGF0ZSBzaGFwZS5yb3RhdGlvblxyXG5cdFx0c3ggPSBzaGFwZS5zY2FsZS54XHJcblx0XHRzeSA9IHNoYXBlLnNjYWxlLnlcclxuXHRcdGlmIHN4IC8gc3kgPiAxMDAgb3Igc3ggLyBzeSA8IDAuMDFcclxuXHRcdFx0c3ggPSAwIGlmIE1hdGguYWJzKHN4KSA8IDAuMDJcclxuXHRcdFx0c3kgPSAwIGlmIE1hdGguYWJzKHN5KSA8IDAuMDJcclxuXHRcdEBjb250ZXh0LnNjYWxlIHN4LCBzeVxyXG5cclxuXHRcdEBjb250ZXh0Lmdsb2JhbEFscGhhICo9IHNoYXBlLm9wYWNpdHlcclxuXHRcdGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRAY29udGV4dC5zdHJva2VTdHlsZSA9IHNoYXBlLnN0cm9rZVN0eWxlXHJcblx0XHRcdEBjb250ZXh0LmxpbmVXaWR0aCA9IHNoYXBlLmxpbmVXaWR0aFxyXG5cdFx0XHRAY29udGV4dC5saW5lQ2FwID0gc2hhcGUubGluZUNhcCBpZiBzaGFwZS5saW5lQ2FwP1xyXG5cdFx0XHRAY29udGV4dC5saW5lSm9pbiA9IHNoYXBlLmxpbmVKb2luIGlmIHNoYXBlLmxpbmVKb2luP1xyXG5cclxuXHRcdEBjb250ZXh0LmJlZ2luUGF0aCgpXHJcblxyXG5cdFx0c3dpdGNoIHNoYXBlLnR5cGVcclxuXHRcdFx0d2hlbiAnUG9pbnQnIHRoZW4gQGRyYXdQb2ludCBzaGFwZVxyXG5cdFx0XHR3aGVuICdMaW5lJyB0aGVuIEBkcmF3TGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdDaXJjbGUnIHRoZW4gQGRyYXdDaXJjbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnRWxsaXBzZScgdGhlbiBAZHJhd0VsbGlwc2Ugc2hhcGVcclxuXHRcdFx0d2hlbiAnVHJpYW5nbGUnIHRoZW4gQGRyYXdUcmlhbmdsZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdSZWN0YW5nbGUnIHRoZW4gQGRyYXdSZWN0YW5nbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnRmFuJyB0aGVuIEBkcmF3RmFuIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0JvdycgdGhlbiBAZHJhd0JvdyBzaGFwZVxyXG5cdFx0XHR3aGVuICdQb2x5Z29uJyB0aGVuIEBkcmF3UG9seWdvbiBzaGFwZVxyXG5cdFx0XHR3aGVuICdQb2x5bGluZScgdGhlbiBAZHJhd1BvbHlsaW5lIHNoYXBlXHJcblx0XHRcdHdoZW4gJ1NwbGluZScgdGhlbiBAZHJhd1NwbGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdQb2ludFRleHQnIHRoZW4gQGRyYXdQb2ludFRleHQgc2hhcGVcclxuXHRcdFx0d2hlbiAnSW1hZ2UnIHRoZW4gQGRyYXdJbWFnZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdPYmplY3QyRCcsICdTY2VuZScgIyB0aGVuIGRvIG5vdGhpbmdcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nICdkcmF3U2hhcGVzKCk6IHVua25vd24gc2hhcGU6ICcsIHNoYXBlLnR5cGUsIHNoYXBlXHJcblxyXG5cclxuXHRcdGlmIHNoYXBlLmZpbGxTdHlsZT8gYW5kIHNoYXBlLmZpbGxhYmxlXHJcblx0XHRcdEBjb250ZXh0LmZpbGxTdHlsZSA9IHNoYXBlLmZpbGxTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5maWxsKClcclxuXHJcblx0XHRpZiBzaGFwZS5kYXNoU3R5bGVcclxuXHRcdFx0QGNvbnRleHQubGluZURhc2hPZmZzZXQgPSBzaGFwZS5kYXNoT2Zmc2V0XHJcblx0XHRcdEBjb250ZXh0LnNldExpbmVEYXNoPyBzaGFwZS5kYXNoU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlKClcclxuXHRcdFx0QGNvbnRleHQuc2V0TGluZURhc2ggW11cclxuXHRcdGVsc2UgaWYgc2hhcGUuc3Ryb2tlU3R5bGU/XHJcblx0XHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblxyXG5cdFx0QGRyYXdTaGFwZXMgc2hhcGUuY2hpbGRyZW4gaWYgc2hhcGUuY2hpbGRyZW4/XHJcblx0XHRAZHJhd1NoYXBlcyBzaGFwZS5rZXlQb2ludHMgaWYgQHNob3dLZXlQb2ludHNcclxuXHRcdEBkcmF3Qm91bmRzIHNoYXBlLmJvdW5kcyBpZiBAc2hvd0JvdW5kcyBhbmQgc2hhcGUuYm91bmRzP1xyXG5cdFx0QFxyXG5cclxuXHJcblxyXG5cdGRyYXdQb2ludDogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLngsIHNoYXBlLnksIEJ1LlBPSU5UX1JFTkRFUl9TSVpFLCAwLCBCdS5UV09fUElcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdMaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUucG9pbnRzWzBdLngsIHNoYXBlLnBvaW50c1swXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzFdLngsIHNoYXBlLnBvaW50c1sxXS55XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Q2lyY2xlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUuY3gsIHNoYXBlLmN5LCBzaGFwZS5yYWRpdXMsIDAsIEJ1LlRXT19QSVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0VsbGlwc2U6IChzaGFwZSkgLT5cclxuXHRcdEBjb250ZXh0LmVsbGlwc2UgMCwgMCwgc2hhcGUucmFkaXVzWCwgc2hhcGUucmFkaXVzWSwgMCwgQnUuVFdPX1BJLCBub1xyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1RyaWFuZ2xlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzBdLngsIHNoYXBlLnBvaW50c1swXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzFdLngsIHNoYXBlLnBvaW50c1sxXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzJdLngsIHNoYXBlLnBvaW50c1syXS55XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1JlY3RhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0cmV0dXJuIEBkcmF3Um91bmRSZWN0YW5nbGUgc2hhcGUgaWYgc2hhcGUuY29ybmVyUmFkaXVzICE9IDBcclxuXHRcdEBjb250ZXh0LnJlY3Qgc2hhcGUucG9pbnRMVC54LCBzaGFwZS5wb2ludExULnksIHNoYXBlLnNpemUud2lkdGgsIHNoYXBlLnNpemUuaGVpZ2h0XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Um91bmRSZWN0YW5nbGU6IChzaGFwZSkgLT5cclxuXHRcdHgxID0gc2hhcGUucG9pbnRMVC54XHJcblx0XHR4MiA9IHNoYXBlLnBvaW50UkIueFxyXG5cdFx0eTEgPSBzaGFwZS5wb2ludExULnlcclxuXHRcdHkyID0gc2hhcGUucG9pbnRSQi55XHJcblx0XHRyID0gc2hhcGUuY29ybmVyUmFkaXVzXHJcblxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHgxLCB5MSArIHJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgxLCB5MSwgeDEgKyByLCB5MSwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgyIC0gciwgeTFcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgyLCB5MSwgeDIsIHkxICsgciwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgyLCB5MiAtIHJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgyLCB5MiwgeDIgLSByLCB5MiwgclxyXG5cdFx0QGNvbnRleHQubGluZVRvIHgxICsgciwgeTJcclxuXHRcdEBjb250ZXh0LmFyY1RvIHgxLCB5MiwgeDEsIHkyIC0gciwgclxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHJcblx0XHRAY29udGV4dC5zZXRMaW5lRGFzaD8gc2hhcGUuZGFzaFN0eWxlIGlmIHNoYXBlLnN0cm9rZVN0eWxlPyBhbmQgc2hhcGUuZGFzaFN0eWxlXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3RmFuOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUuY3gsIHNoYXBlLmN5LCBzaGFwZS5yYWRpdXMsIHNoYXBlLmFGcm9tLCBzaGFwZS5hVG9cclxuXHRcdEBjb250ZXh0LmxpbmVUbyBzaGFwZS5jeCwgc2hhcGUuY3lcclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3Qm93OiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUuY3gsIHNoYXBlLmN5LCBzaGFwZS5yYWRpdXMsIHNoYXBlLmFGcm9tLCBzaGFwZS5hVG9cclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3UG9seWdvbjogKHNoYXBlKSAtPlxyXG5cdFx0Zm9yIHBvaW50IGluIHNoYXBlLnZlcnRpY2VzXHJcblx0XHRcdEBjb250ZXh0LmxpbmVUbyBwb2ludC54LCBwb2ludC55XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvbHlsaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRmb3IgcG9pbnQgaW4gc2hhcGUudmVydGljZXNcclxuXHRcdFx0QGNvbnRleHQubGluZVRvIHBvaW50LngsIHBvaW50LnlcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdTcGxpbmU6IChzaGFwZSkgLT5cclxuXHRcdGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRsZW4gPSBzaGFwZS52ZXJ0aWNlcy5sZW5ndGhcclxuXHRcdFx0aWYgbGVuID09IDJcclxuXHRcdFx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUudmVydGljZXNbMF0ueCwgc2hhcGUudmVydGljZXNbMF0ueVxyXG5cdFx0XHRcdEBjb250ZXh0LmxpbmVUbyBzaGFwZS52ZXJ0aWNlc1sxXS54LCBzaGFwZS52ZXJ0aWNlc1sxXS55XHJcblx0XHRcdGVsc2UgaWYgbGVuID4gMlxyXG5cdFx0XHRcdEBjb250ZXh0Lm1vdmVUbyBzaGFwZS52ZXJ0aWNlc1swXS54LCBzaGFwZS52ZXJ0aWNlc1swXS55XHJcblx0XHRcdFx0Zm9yIGkgaW4gWzEuLmxlbiAtIDFdXHJcblx0XHRcdFx0XHRAY29udGV4dC5iZXppZXJDdXJ2ZVRvKFxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLmNvbnRyb2xQb2ludHNCZWhpbmRbaSAtIDFdLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQmVoaW5kW2kgLSAxXS55XHJcblx0XHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0FoZWFkW2ldLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS5jb250cm9sUG9pbnRzQWhlYWRbaV0ueVxyXG5cdFx0XHRcdFx0XHRcdHNoYXBlLnZlcnRpY2VzW2ldLnhcclxuXHRcdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS55XHJcblx0XHRcdFx0XHQpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3UG9pbnRUZXh0OiAoc2hhcGUpIC0+XHJcblx0XHRmb250ID0gc2hhcGUuZm9udCBvciBCdS5ERUZBVUxUX0ZPTlRcclxuXHJcblx0XHRpZiBCdS5pc1N0cmluZyBmb250XHJcblx0XHRcdEBjb250ZXh0LnRleHRBbGlnbiA9IHNoYXBlLnRleHRBbGlnblxyXG5cdFx0XHRAY29udGV4dC50ZXh0QmFzZWxpbmUgPSBzaGFwZS50ZXh0QmFzZWxpbmVcclxuXHRcdFx0QGNvbnRleHQuZm9udCA9IGZvbnRcclxuXHJcblx0XHRcdGlmIHNoYXBlLnN0cm9rZVN0eWxlP1xyXG5cdFx0XHRcdEBjb250ZXh0LnN0cm9rZVRleHQgc2hhcGUudGV4dCwgc2hhcGUueCwgc2hhcGUueVxyXG5cdFx0XHRpZiBzaGFwZS5maWxsU3R5bGU/XHJcblx0XHRcdFx0QGNvbnRleHQuZmlsbFN0eWxlID0gc2hhcGUuZmlsbFN0eWxlXHJcblx0XHRcdFx0QGNvbnRleHQuZmlsbFRleHQgc2hhcGUudGV4dCwgc2hhcGUueCwgc2hhcGUueVxyXG5cdFx0ZWxzZSBpZiBmb250IGluc3RhbmNlb2YgQnUuU3ByaXRlU2hlZXQgYW5kIGZvbnQucmVhZHlcclxuXHRcdFx0dGV4dFdpZHRoID0gZm9udC5tZWFzdXJlVGV4dFdpZHRoIHNoYXBlLnRleHRcclxuXHRcdFx0eE9mZnNldCA9IHN3aXRjaCBzaGFwZS50ZXh0QWxpZ25cclxuXHRcdFx0XHR3aGVuICdsZWZ0JyB0aGVuIDBcclxuXHRcdFx0XHR3aGVuICdjZW50ZXInIHRoZW4gLXRleHRXaWR0aCAvIDJcclxuXHRcdFx0XHR3aGVuICdyaWdodCcgdGhlbiAtdGV4dFdpZHRoXHJcblx0XHRcdHlPZmZzZXQgPSBzd2l0Y2ggc2hhcGUudGV4dEJhc2VsaW5lXHJcblx0XHRcdFx0d2hlbiAndG9wJyB0aGVuIDBcclxuXHRcdFx0XHR3aGVuICdtaWRkbGUnIHRoZW4gLWZvbnQuaGVpZ2h0IC8gMlxyXG5cdFx0XHRcdHdoZW4gJ2JvdHRvbScgdGhlbiAtZm9udC5oZWlnaHRcclxuXHRcdFx0Zm9yIGkgaW4gWzAuLi5zaGFwZS50ZXh0Lmxlbmd0aF1cclxuXHRcdFx0XHRjaGFyID0gc2hhcGUudGV4dFtpXVxyXG5cdFx0XHRcdGNoYXJCaXRtYXAgPSBmb250LmdldEZyYW1lSW1hZ2UgY2hhclxyXG5cdFx0XHRcdGlmIGNoYXJCaXRtYXA/XHJcblx0XHRcdFx0XHRAY29udGV4dC5kcmF3SW1hZ2UgY2hhckJpdG1hcCwgc2hhcGUueCArIHhPZmZzZXQsIHNoYXBlLnkgKyB5T2Zmc2V0XHJcblx0XHRcdFx0XHR4T2Zmc2V0ICs9IGNoYXJCaXRtYXAud2lkdGhcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHR4T2Zmc2V0ICs9IDEwXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3SW1hZ2U6IChzaGFwZSkgLT5cclxuXHRcdGlmIHNoYXBlLnJlYWR5XHJcblx0XHRcdHcgPSBzaGFwZS5zaXplLndpZHRoXHJcblx0XHRcdGggPSBzaGFwZS5zaXplLmhlaWdodFxyXG5cdFx0XHRkeCA9IC13ICogc2hhcGUucGl2b3QueFxyXG5cdFx0XHRkeSA9IC1oICogc2hhcGUucGl2b3QueVxyXG5cdFx0XHRAY29udGV4dC5kcmF3SW1hZ2Ugc2hhcGUuaW1hZ2UsIGR4LCBkeSwgdywgaFxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0JvdW5kczogKGJvdW5kcykgLT5cclxuXHRcdEBjb250ZXh0LmJlZ2luUGF0aCgpXHJcblx0XHRAY29udGV4dC5zdHJva2VTdHlsZSA9IEJ1LlJlbmRlcmVyLkJPVU5EU19TVFJPS0VfU1RZTEVcclxuXHRcdEBjb250ZXh0LnNldExpbmVEYXNoPyBCdS5SZW5kZXJlci5CT1VORFNfREFTSF9TVFlMRVxyXG5cdFx0QGNvbnRleHQucmVjdCBib3VuZHMueDEsIGJvdW5kcy55MSwgYm91bmRzLngyIC0gYm91bmRzLngxLCBib3VuZHMueTIgLSBib3VuZHMueTFcclxuXHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblx0XHRAXHJcblxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFN0YXRpYyBtZW1iZXJzXHJcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4jIFN0cm9rZSBzdHlsZSBvZiBib3VuZHNcclxuQnUuUmVuZGVyZXIuQk9VTkRTX1NUUk9LRV9TVFlMRSA9ICdyZWQnXHJcblxyXG4jIERhc2ggc3R5bGUgb2YgYm91bmRzXHJcbkJ1LlJlbmRlcmVyLkJPVU5EU19EQVNIX1NUWUxFID0gWzYsIDZdXHJcbiIsIiMgU2NlbmUgaXMgdGhlIHJvb3Qgb2YgdGhlIG9iamVjdCB0cmVlXHJcblxyXG5jbGFzcyBCdS5TY2VuZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnU2NlbmUnXHJcbiIsIiMgQm93IHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Cb3cgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnQm93J1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdFtAYUZyb20sIEBhVG9dID0gW0BhVG8sIEBhRnJvbV0gaWYgQGFGcm9tID4gQGFUb1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcgPSBuZXcgQnUuTGluZSBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhRnJvbSksIEBjZW50ZXIuYXJjVG8oQHJhZGl1cywgQGFUbylcclxuXHRcdEBrZXlQb2ludHMgPSBAc3RyaW5nLnBvaW50c1xyXG5cclxuXHRcdEB1cGRhdGVLZXlQb2ludHMoKVxyXG5cdFx0QG9uICdjaGFuZ2VkJywgQHVwZGF0ZUtleVBvaW50c1xyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuQm93IEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuXHJcblx0dXBkYXRlS2V5UG9pbnRzOiAtPlxyXG5cdFx0QGNlbnRlci5zZXQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcucG9pbnRzWzBdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYUZyb21cclxuXHRcdEBzdHJpbmcucG9pbnRzWzFdLmNvcHkgQGNlbnRlci5hcmNUbyBAcmFkaXVzLCBAYVRvXHJcblx0XHRAa2V5UG9pbnRzID0gQHN0cmluZy5wb2ludHNcclxuXHRcdEBcclxuIiwiIyBDaXJjbGUgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LkNpcmNsZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdDaXJjbGUnXHJcblx0ZmlsbGFibGU6IHllc1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEBfcmFkaXVzID0gMSwgY3ggPSAwLCBjeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0QF9jZW50ZXIgPSBuZXcgQnUuUG9pbnQoY3gsIGN5KVxyXG5cdFx0QGJvdW5kcyA9IG51bGwgIyBmb3IgYWNjZWxlcmF0ZSBjb250YWluIHRlc3RcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gW0BfY2VudGVyXVxyXG5cdFx0QG9uICdjZW50ZXJDaGFuZ2VkJywgQHVwZGF0ZUtleVBvaW50c1xyXG5cclxuXHRjbG9uZTogKCkgLT4gbmV3IEJ1LkNpcmNsZSBAcmFkaXVzLCBAY3gsIEBjeVxyXG5cclxuXHR1cGRhdGVLZXlQb2ludHM6IC0+XHJcblx0XHRAa2V5UG9pbnRzWzBdLnNldCBAY3gsIEBjeVxyXG5cclxuXHQjIHByb3BlcnR5XHJcblxyXG5cdEBwcm9wZXJ0eSAnY3gnLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci54XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnggPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY3knLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci55XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnkgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY2VudGVyJyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXJcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jZW50ZXIgPSB2YWxcclxuXHRcdFx0QGN4ID0gdmFsLnhcclxuXHRcdFx0QGN5ID0gdmFsLnlcclxuXHRcdFx0QGtleVBvaW50c1swXSA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAnY2VudGVyQ2hhbmdlZCcsIEBcclxuXHJcblx0QHByb3BlcnR5ICdyYWRpdXMnLFxyXG5cdFx0Z2V0OiAtPiBAX3JhZGl1c1xyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1cyA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAncmFkaXVzQ2hhbmdlZCcsIEBcclxuXHRcdFx0QFxyXG4iLCIjIEVsbGlwc2UvT3ZhbCBTaGFwZVxyXG5cclxuY2xhc3MgQnUuRWxsaXBzZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdFbGxpcHNlJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAX3JhZGl1c1ggPSAyMCwgQF9yYWRpdXNZID0gMTApIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdCMgcHJvcGVydHlcclxuXHJcblx0QHByb3BlcnR5ICdyYWRpdXNYJyxcclxuXHRcdGdldDogLT4gQF9yYWRpdXNYXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfcmFkaXVzWCA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAnY2hhbmdlZCcsIEBcclxuXHJcblxyXG5cdEBwcm9wZXJ0eSAncmFkaXVzWScsXHJcblx0XHRnZXQ6IC0+IEBfcmFkaXVzWVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1c1kgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NoYW5nZWQnLCBAXHJcbiIsIiMgRmFuIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5GYW4gZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnRmFuJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdFtAYUZyb20sIEBhVG9dID0gW0BhVG8sIEBhRnJvbV0gaWYgQGFGcm9tID4gQGFUb1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcgPSBuZXcgQnUuTGluZSBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhRnJvbSksIEBjZW50ZXIuYXJjVG8oQHJhZGl1cywgQGFUbylcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gW1xyXG5cdFx0XHRAc3RyaW5nLnBvaW50c1swXVxyXG5cdFx0XHRAc3RyaW5nLnBvaW50c1sxXVxyXG5cdFx0XHRAY2VudGVyXHJcblx0XHRdXHJcblx0XHRAb24gJ2NoYW5nZWQnLCBAdXBkYXRlS2V5UG9pbnRzXHJcblx0XHRAb24gJ2NoYW5nZWQnLCA9PiBALmJvdW5kcz8udXBkYXRlKClcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5GYW4gQGN4LCBAY3ksIEByYWRpdXMsIEBhRnJvbSwgQGFUb1xyXG5cclxuXHR1cGRhdGVLZXlQb2ludHM6IC0+XHJcblx0XHRAY2VudGVyLnNldCBAY3gsIEBjeVxyXG5cdFx0QHN0cmluZy5wb2ludHNbMF0uY29weSBAY2VudGVyLmFyY1RvIEByYWRpdXMsIEBhRnJvbVxyXG5cdFx0QHN0cmluZy5wb2ludHNbMV0uY29weSBAY2VudGVyLmFyY1RvIEByYWRpdXMsIEBhVG9cclxuXHRcdEBcclxuIiwiIyBsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5MaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ0xpbmUnXHJcblx0ZmlsbGFibGU6IG5vXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAocDEsIHAyLCBwMywgcDQpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA8IDJcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQoKSwgbmV3IEJ1LlBvaW50KCldXHJcblx0XHRlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPCA0XHJcblx0XHRcdEBwb2ludHMgPSBbcDEuY2xvbmUoKSwgcDIuY2xvbmUoKV1cclxuXHRcdGVsc2UgICMgbGVuID49IDRcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQocDEsIHAyKSwgbmV3IEJ1LlBvaW50KHAzLCBwNCldXHJcblxyXG5cdFx0QGxlbmd0aCA9IDBcclxuXHRcdEBtaWRwb2ludCA9IG5ldyBCdS5Qb2ludCgpXHJcblx0XHRAa2V5UG9pbnRzID0gQHBvaW50c1xyXG5cclxuXHRcdEBvbiBcImNoYW5nZWRcIiwgPT5cclxuXHRcdFx0QGxlbmd0aCA9IEBwb2ludHNbMF0uZGlzdGFuY2VUbyhAcG9pbnRzWzFdKVxyXG5cdFx0XHRAbWlkcG9pbnQuc2V0KChAcG9pbnRzWzBdLnggKyBAcG9pbnRzWzFdLngpIC8gMiwgKEBwb2ludHNbMF0ueSArIEBwb2ludHNbMV0ueSkgLyAyKVxyXG5cclxuXHRcdEB0cmlnZ2VyIFwiY2hhbmdlZFwiXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuTGluZSBAcG9pbnRzWzBdLCBAcG9pbnRzWzFdXHJcblxyXG5cdCMgZWRpdFxyXG5cclxuXHRzZXQ6IChhMSwgYTIsIGEzLCBhNCkgLT5cclxuXHRcdGlmIHA0P1xyXG5cdFx0XHRAcG9pbnRzWzBdLnNldCBhMSwgYTJcclxuXHRcdFx0QHBvaW50c1sxXS5zZXQgYTMsIGE0XHJcblx0XHRlbHNlXHJcblx0XHRcdEBwb2ludHNbMF0gPSBhMVxyXG5cdFx0XHRAcG9pbnRzWzFdID0gYTJcclxuXHRcdEB0cmlnZ2VyIFwiY2hhbmdlZFwiXHJcblx0XHRAXHJcblxyXG5cdHNldFBvaW50MTogKGExLCBhMikgLT5cclxuXHRcdGlmIGEyP1xyXG5cdFx0XHRAcG9pbnRzWzBdLnNldCBhMSwgYTJcclxuXHRcdGVsc2VcclxuXHRcdFx0QHBvaW50c1swXS5jb3B5IGExXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG5cclxuXHRzZXRQb2ludDI6IChhMSwgYTIpIC0+XHJcblx0XHRpZiBhMj9cclxuXHRcdFx0QHBvaW50c1sxXS5zZXQgYTEsIGEyXHJcblx0XHRlbHNlXHJcblx0XHRcdEBwb2ludHNbMV0uY29weSBhMVxyXG5cdFx0QHRyaWdnZXIgXCJjaGFuZ2VkXCJcclxuXHRcdEBcclxuIiwiIyBwb2ludCBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUG9pbnQgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnUG9pbnQnXHJcblx0ZmlsbGFibGU6IHllc1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB4ID0gMCwgQHkgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEBsaW5lV2lkdGggPSAwLjVcclxuXHRcdEBfbGFiZWxJbmRleCA9IC0xXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuUG9pbnQgQHgsIEB5XHJcblxyXG5cdEBwcm9wZXJ0eSAnbGFiZWwnLFxyXG5cdFx0Z2V0OiAtPiBpZiBAX2xhYmVsSW5kZXggPiAtMSB0aGVuIEBjaGlsZHJlbltAX2xhYmVsSW5kZXhdLnRleHQgZWxzZSAnJ1xyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRpZiBAX2xhYmVsSW5kZXggPT0gLTFcclxuXHRcdFx0XHRwb2ludFRleHQgPSBuZXcgQnUuUG9pbnRUZXh0IHZhbCwgQHggKyBCdS5QT0lOVF9MQUJFTF9PRkZTRVQsIEB5LCB7YWxpZ246ICcrMCd9XHJcblx0XHRcdFx0QGNoaWxkcmVuLnB1c2ggcG9pbnRUZXh0XHJcblx0XHRcdFx0QF9sYWJlbEluZGV4ID0gQGNoaWxkcmVuLmxlbmd0aCAtIDFcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBjaGlsZHJlbltAX2xhYmVsSW5kZXhdLnRleHQgPSB2YWxcclxuXHJcblx0YXJjVG86IChyYWRpdXMsIGFyYykgLT5cclxuXHRcdHJldHVybiBuZXcgQnUuUG9pbnQgQHggKyBNYXRoLmNvcyhhcmMpICogcmFkaXVzLCBAeSArIE1hdGguc2luKGFyYykgKiByYWRpdXNcclxuXHJcblxyXG5cdCMgY29weSB2YWx1ZSBmcm9tIG90aGVyIGxpbmVcclxuXHRjb3B5OiAocG9pbnQpIC0+XHJcblx0XHRAeCA9IHBvaW50LnhcclxuXHRcdEB5ID0gcG9pbnQueVxyXG5cdFx0QHVwZGF0ZUxhYmVsKClcclxuXHJcblx0IyBzZXQgdmFsdWUgZnJvbSB4LCB5XHJcblx0c2V0OiAoeCwgeSkgLT5cclxuXHRcdEB4ID0geFxyXG5cdFx0QHkgPSB5XHJcblx0XHRAdXBkYXRlTGFiZWwoKVxyXG5cclxuXHR1cGRhdGVMYWJlbDogLT5cclxuXHRcdGlmIEBfbGFiZWxJbmRleCA+IC0xXHJcblx0XHRcdEBjaGlsZHJlbltAX2xhYmVsSW5kZXhdLnggPSBAeCArIEJ1LlBPSU5UX0xBQkVMX09GRlNFVFxyXG5cdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS55ID0gQHlcclxuIiwiIyBwb2x5Z29uIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2x5Z29uIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1BvbHlnb24nXHJcblx0ZmlsbGFibGU6IHllc1xyXG5cclxuXHQjIyNcclxuICAgIGNvbnN0cnVjdG9yc1xyXG4gICAgMS4gUG9seWdvbihwb2ludHMpXHJcbiAgICAyLiBQb2x5Z29uKHgsIHksIHJhZGl1cywgbiwgb3B0aW9ucyk6IHRvIGdlbmVyYXRlIHJlZ3VsYXIgcG9seWdvblxyXG4gICAgXHRvcHRpb25zOiBhbmdsZSAtIHN0YXJ0IGFuZ2xlIG9mIHJlZ3VsYXIgcG9seWdvblxyXG5cdCMjI1xyXG5cdGNvbnN0cnVjdG9yOiAocG9pbnRzKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEB2ZXJ0aWNlcyA9IFtdXHJcblx0XHRAbGluZXMgPSBbXVxyXG5cdFx0QHRyaWFuZ2xlcyA9IFtdXHJcblxyXG5cdFx0b3B0aW9ucyA9IEJ1LmNvbWJpbmVPcHRpb25zIGFyZ3VtZW50cyxcclxuXHRcdFx0YW5nbGU6IDBcclxuXHJcblx0XHRpZiBCdS5pc0FycmF5IHBvaW50c1xyXG5cdFx0XHRAdmVydGljZXMgPSBwb2ludHMgaWYgcG9pbnRzP1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRpZiBhcmd1bWVudHMubGVuZ3RoIDwgNFxyXG5cdFx0XHRcdHggPSAwXHJcblx0XHRcdFx0eSA9IDBcclxuXHRcdFx0XHRyYWRpdXMgPSBhcmd1bWVudHNbMF1cclxuXHRcdFx0XHRuID0gYXJndW1lbnRzWzFdXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR4ID0gYXJndW1lbnRzWzBdXHJcblx0XHRcdFx0eSA9IGFyZ3VtZW50c1sxXVxyXG5cdFx0XHRcdHJhZGl1cyA9IGFyZ3VtZW50c1syXVxyXG5cdFx0XHRcdG4gPSBhcmd1bWVudHNbM11cclxuXHRcdFx0QHZlcnRpY2VzID0gQnUuUG9seWdvbi5nZW5lcmF0ZVJlZ3VsYXJQb2ludHMgeCwgeSwgcmFkaXVzLCBuLCBvcHRpb25zXHJcblxyXG5cdFx0QG9uVmVydGljZXNDaGFuZ2VkKClcclxuXHRcdEBvbiAnY2hhbmdlZCcsIEBvblZlcnRpY2VzQ2hhbmdlZFxyXG5cdFx0QG9uICdjaGFuZ2VkJywgPT4gQC5ib3VuZHM/LnVwZGF0ZSgpXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuUG9seWdvbiBAdmVydGljZXNcclxuXHJcblx0b25WZXJ0aWNlc0NoYW5nZWQ6IC0+XHJcblx0XHRAbGluZXMgPSBbXVxyXG5cdFx0QHRyaWFuZ2xlcyA9IFtdXHJcblx0XHQjIGluaXQgbGluZXNcclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdGZvciBpIGluIFswIC4uLiBAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV0pKVxyXG5cdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdLCBAdmVydGljZXNbMF0pKVxyXG5cclxuXHRcdCMgaW5pdCB0cmlhbmdsZXNcclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAyXHJcblx0XHRcdGZvciBpIGluIFsxIC4uLiBAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRAdHJpYW5nbGVzLnB1c2gobmV3IEJ1LlRyaWFuZ2xlKEB2ZXJ0aWNlc1swXSwgQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdKSlcclxuXHJcblx0IyBkZXRlY3RcclxuXHJcblx0aXNTaW1wbGU6ICgpIC0+XHJcblx0XHRsZW4gPSBAbGluZXMubGVuZ3RoXHJcblx0XHRmb3IgaSBpbiBbMC4uLmxlbl1cclxuXHRcdFx0Zm9yIGogaW4gW2kgKyAxLi4ubGVuXVxyXG5cdFx0XHRcdGlmIEBsaW5lc1tpXS5pc0Nyb3NzV2l0aExpbmUoQGxpbmVzW2pdKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRyZXR1cm4gdHJ1ZVxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCwgaW5zZXJ0SW5kZXgpIC0+XHJcblx0XHRpZiBub3QgaW5zZXJ0SW5kZXg/XHJcblx0XHRcdCMgYWRkIHBvaW50XHJcblx0XHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblxyXG5cdFx0XHQjIGFkZCBsaW5lXHJcblx0XHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdFx0QGxpbmVzW0BsaW5lcy5sZW5ndGggLSAxXS5wb2ludHNbMV0gPSBwb2ludFxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMFxyXG5cdFx0XHRcdEBsaW5lcy5wdXNoKG5ldyBCdS5MaW5lKEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV0sIEB2ZXJ0aWNlc1swXSkpXHJcblxyXG5cdFx0XHQjIGFkZCB0cmlhbmdsZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMlxyXG5cdFx0XHRcdEB0cmlhbmdsZXMucHVzaChuZXcgQnUuVHJpYW5nbGUoXHJcblx0XHRcdFx0XHRcdEB2ZXJ0aWNlc1swXVxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDJdXHJcblx0XHRcdFx0XHRcdEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHQpKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAdmVydGljZXMuc3BsaWNlKGluc2VydEluZGV4LCAwLCBwb2ludClcclxuXHQjIFRPRE8gYWRkIGxpbmVzIGFuZCB0cmlhbmdsZXNcclxuXHJcblx0QGdlbmVyYXRlUmVndWxhclBvaW50cyA9IChjeCwgY3ksIHJhZGl1cywgbiwgb3B0aW9ucykgLT5cclxuXHRcdGFuZ2xlRGVsdGEgPSBvcHRpb25zLmFuZ2xlXHJcblx0XHRyID0gcmFkaXVzXHJcblx0XHRwb2ludHMgPSBbXVxyXG5cdFx0YW5nbGVTZWN0aW9uID0gQnUuVFdPX1BJIC8gblxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIG5dXHJcblx0XHRcdGEgPSBpICogYW5nbGVTZWN0aW9uICsgYW5nbGVEZWx0YVxyXG5cdFx0XHR4ID0gY3ggKyByICogTWF0aC5jb3MoYSlcclxuXHRcdFx0eSA9IGN5ICsgciAqIE1hdGguc2luKGEpXHJcblx0XHRcdHBvaW50c1tpXSA9IG5ldyBCdS5Qb2ludCB4LCB5XHJcblx0XHRyZXR1cm4gcG9pbnRzXHJcbiIsIiMgcG9seWxpbmUgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlBvbHlsaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0dHlwZTogJ1BvbHlsaW5lJ1xyXG5cdGZpbGxhYmxlOiBub1xyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB2ZXJ0aWNlcyA9IFtdKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxXHJcblx0XHRcdHZlcnRpY2VzID0gW11cclxuXHRcdFx0Zm9yIGkgaW4gWzAgLi4uIGFyZ3VtZW50cy5sZW5ndGggLyAyXVxyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2ggbmV3IEJ1LlBvaW50IGFyZ3VtZW50c1tpICogMl0sIGFyZ3VtZW50c1tpICogMiArIDFdXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IHZlcnRpY2VzXHJcblxyXG5cdFx0QGxpbmVzID0gW11cclxuXHRcdEBrZXlQb2ludHMgPSBAdmVydGljZXNcclxuXHJcblx0XHRAZmlsbCBvZmZcclxuXHJcblx0XHRAb24gXCJjaGFuZ2VkXCIsID0+XHJcblx0XHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdFx0QHVwZGF0ZUxpbmVzKClcclxuXHRcdFx0XHRAY2FsY0xlbmd0aD8oKVxyXG5cdFx0XHRcdEBjYWxjUG9pbnROb3JtYWxpemVkUG9zPygpXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cclxuXHRjbG9uZTogLT5cclxuXHRcdHBvbHlsaW5lID0gbmV3IEJ1LlBvbHlsaW5lIEB2ZXJ0aWNlc1xyXG5cdFx0cG9seWxpbmUuc3Ryb2tlU3R5bGUgPSBAc3Ryb2tlU3R5bGVcclxuXHRcdHBvbHlsaW5lLmZpbGxTdHlsZSA9IEBmaWxsU3R5bGVcclxuXHRcdHBvbHlsaW5lLmRhc2hTdHlsZSA9IEBkYXNoU3R5bGVcclxuXHRcdHBvbHlsaW5lLmxpbmVXaWR0aCA9IEBsaW5lV2lkdGhcclxuXHRcdHBvbHlsaW5lLmRhc2hPZmZzZXQgPSBAZGFzaE9mZnNldFxyXG5cdFx0cG9seWxpbmVcclxuXHJcblx0dXBkYXRlTGluZXM6IC0+XHJcblx0XHRmb3IgaSBpbiBbMCAuLi4gQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRcdGlmIEBsaW5lc1tpXT9cclxuXHRcdFx0XHRAbGluZXNbaV0uc2V0IEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QGxpbmVzW2ldID0gbmV3IEJ1LkxpbmUgQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdXHJcblx0XHQjIFRPRE8gcmVtb3ZlIHRoZSByZXN0XHJcblx0XHRAXHJcblxyXG5cdCMgZWRpdFxyXG5cclxuXHRzZXQgPSAocG9pbnRzKSAtPlxyXG5cdFx0IyBwb2ludHNcclxuXHRcdGZvciBpIGluIFswIC4uLiBAdmVydGljZXMubGVuZ3RoXVxyXG5cdFx0XHRAdmVydGljZXNbaV0uY29weSBwb2ludHNbaV1cclxuXHJcblx0XHQjIHJlbW92ZSB0aGUgZXh0cmEgcG9pbnRzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gcG9pbnRzLmxlbmd0aFxyXG5cdFx0XHRAdmVydGljZXMuc3BsaWNlIHBvaW50cy5sZW5ndGhcclxuXHJcblx0XHRAdHJpZ2dlciBcImNoYW5nZWRcIlxyXG5cdFx0QFxyXG5cclxuXHRhZGRQb2ludDogKHBvaW50LCBpbnNlcnRJbmRleCkgLT5cclxuXHRcdGlmIG5vdCBpbnNlcnRJbmRleD9cclxuXHRcdFx0IyBhZGQgcG9pbnRcclxuXHRcdFx0QHZlcnRpY2VzLnB1c2ggcG9pbnRcclxuXHRcdFx0IyBhZGQgbGluZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMVxyXG5cdFx0XHRcdEBsaW5lcy5wdXNoIG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMl0sIEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzLnNwbGljZSBpbnNlcnRJbmRleCwgMCwgcG9pbnRcclxuXHRcdCMgVE9ETyBhZGQgbGluZXNcclxuXHRcdEB0cmlnZ2VyIFwiY2hhbmdlZFwiXHJcblx0XHRAXHJcbiIsIiMgcmVjdGFuZ2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5SZWN0YW5nbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHR0eXBlOiAnUmVjdGFuZ2xlJ1xyXG5cdGZpbGxhYmxlOiB5ZXNcclxuXHJcblx0Y29uc3RydWN0b3I6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJSYWRpdXMgPSAwKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDJcclxuXHRcdEBzaXplID0gbmV3IEJ1LlNpemUgd2lkdGgsIGhlaWdodFxyXG5cclxuXHRcdEBwb2ludExUID0gbmV3IEJ1LlBvaW50IHgsIHlcclxuXHRcdEBwb2ludFJUID0gbmV3IEJ1LlBvaW50IHggKyB3aWR0aCwgeVxyXG5cdFx0QHBvaW50UkIgPSBuZXcgQnUuUG9pbnQgeCArIHdpZHRoLCB5ICsgaGVpZ2h0XHJcblx0XHRAcG9pbnRMQiA9IG5ldyBCdS5Qb2ludCB4LCB5ICsgaGVpZ2h0XHJcblxyXG5cdFx0QHBvaW50cyA9IFtAcG9pbnRMVCwgQHBvaW50UlQsIEBwb2ludFJCLCBAcG9pbnRMQl1cclxuXHJcblx0XHRAY29ybmVyUmFkaXVzID0gY29ybmVyUmFkaXVzXHJcblx0XHRAb24gJ2NoYW5nZWQnLCA9PiBALmJvdW5kcz8udXBkYXRlKClcclxuXHJcblx0QHByb3BlcnR5ICdjb3JuZXJSYWRpdXMnLFxyXG5cdFx0Z2V0OiAtPiBAX2Nvcm5lclJhZGl1c1xyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2Nvcm5lclJhZGl1cyA9IHZhbFxyXG5cdFx0XHRAa2V5UG9pbnRzID0gaWYgdmFsID4gMCB0aGVuIFtdIGVsc2UgQHBvaW50c1xyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlJlY3RhbmdsZSBAcG9pbnRMVC54LCBAcG9pbnRMVC55LCBAc2l6ZS53aWR0aCwgQHNpemUuaGVpZ2h0XHJcblxyXG5cdHNldDogKHgsIHksIHdpZHRoLCBoZWlnaHQpIC0+XHJcblx0XHRAY2VudGVyLnNldCB4ICsgd2lkdGggLyAyLCB5ICsgaGVpZ2h0IC8gMlxyXG5cdFx0QHNpemUuc2V0IHdpZHRoLCBoZWlnaHRcclxuXHJcblx0XHRAcG9pbnRMVC5zZXQgeCwgeVxyXG5cdFx0QHBvaW50UlQuc2V0IHggKyB3aWR0aCwgeVxyXG5cdFx0QHBvaW50UkIuc2V0IHggKyB3aWR0aCwgeSArIGhlaWdodFxyXG5cdFx0QHBvaW50TEIuc2V0IHgsIHkgKyBoZWlnaHRcclxuIiwiIyBzcGxpbmUgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlNwbGluZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdTcGxpbmUnXHJcblx0ZmlsbGFibGU6IG5vXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAodmVydGljZXMpIC0+XHJcblx0XHRzdXBlcigpXHJcblxyXG5cdFx0aWYgdmVydGljZXMgaW5zdGFuY2VvZiBCdS5Qb2x5bGluZVxyXG5cdFx0XHRwb2x5bGluZSA9IHZlcnRpY2VzXHJcblx0XHRcdEB2ZXJ0aWNlcyA9IHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdHBvbHlsaW5lLm9uICdwb2ludENoYW5nZScsIChwb2x5bGluZSkgPT5cclxuXHRcdFx0XHRAdmVydGljZXMgPSBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0XHRcdGNhbGNDb250cm9sUG9pbnRzIEBcclxuXHRcdGVsc2VcclxuXHRcdFx0QHZlcnRpY2VzID0gQnUuY2xvbmUgdmVydGljZXNcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblx0XHRAY29udHJvbFBvaW50c0FoZWFkID0gW11cclxuXHRcdEBjb250cm9sUG9pbnRzQmVoaW5kID0gW11cclxuXHJcblx0XHRAZmlsbCBvZmZcclxuXHRcdEBzbW9vdGhGYWN0b3IgPSBCdS5ERUZBVUxUX1NQTElORV9TTU9PVEhcclxuXHRcdEBfc21vb3RoZXIgPSBub1xyXG5cclxuXHRcdGNhbGNDb250cm9sUG9pbnRzIEBcclxuXHJcblx0QHByb3BlcnR5ICdzbW9vdGhlcicsXHJcblx0XHRnZXQ6IC0+IEBfc21vb3RoZXJcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0b2xkVmFsID0gQF9zbW9vdGhlclxyXG5cdFx0XHRAX3Ntb290aGVyID0gdmFsXHJcblx0XHRcdGNhbGNDb250cm9sUG9pbnRzIEAgaWYgb2xkVmFsICE9IEBfc21vb3RoZXJcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5TcGxpbmUgQHZlcnRpY2VzXHJcblxyXG5cdGFkZFBvaW50OiAocG9pbnQpIC0+XHJcblx0XHRAdmVydGljZXMucHVzaCBwb2ludFxyXG5cdFx0Y2FsY0NvbnRyb2xQb2ludHMgQFxyXG5cclxuXHRjYWxjQ29udHJvbFBvaW50cyA9IChzcGxpbmUpIC0+XHJcblx0XHRzcGxpbmUua2V5UG9pbnRzID0gc3BsaW5lLnZlcnRpY2VzXHJcblxyXG5cdFx0cCA9IHNwbGluZS52ZXJ0aWNlc1xyXG5cdFx0bGVuID0gcC5sZW5ndGhcclxuXHRcdGlmIGxlbiA+PSAxXHJcblx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQmVoaW5kWzBdID0gcFswXVxyXG5cdFx0aWYgbGVuID49IDJcclxuXHRcdFx0c3BsaW5lLmNvbnRyb2xQb2ludHNBaGVhZFtsZW4gLSAxXSA9IHBbbGVuIC0gMV1cclxuXHRcdGlmIGxlbiA+PSAzXHJcblx0XHRcdGZvciBpIGluIFsxLi4ubGVuIC0gMV1cclxuXHRcdFx0XHR0aGV0YTEgPSBNYXRoLmF0YW4yIHBbaV0ueSAtIHBbaSAtIDFdLnksIHBbaV0ueCAtIHBbaSAtIDFdLnhcclxuXHRcdFx0XHR0aGV0YTIgPSBNYXRoLmF0YW4yIHBbaSArIDFdLnkgLSBwW2ldLnksIHBbaSArIDFdLnggLSBwW2ldLnhcclxuXHRcdFx0XHRsZW4xID0gQnUuYmV2ZWwgcFtpXS55IC0gcFtpIC0gMV0ueSwgcFtpXS54IC0gcFtpIC0gMV0ueFxyXG5cdFx0XHRcdGxlbjIgPSBCdS5iZXZlbCBwW2ldLnkgLSBwW2kgKyAxXS55LCBwW2ldLnggLSBwW2kgKyAxXS54XHJcblx0XHRcdFx0dGhldGEgPSB0aGV0YTEgKyAodGhldGEyIC0gdGhldGExKSAqIGlmIHNwbGluZS5fc21vb3RoZXIgdGhlbiBsZW4xIC8gKGxlbjEgKyBsZW4yKSBlbHNlIDAuNVxyXG5cdFx0XHRcdHRoZXRhICs9IE1hdGguUEkgaWYgTWF0aC5hYnModGhldGEgLSB0aGV0YTEpID4gQnUuSEFMRl9QSVxyXG5cdFx0XHRcdHhBID0gcFtpXS54IC0gbGVuMSAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLmNvcyh0aGV0YSlcclxuXHRcdFx0XHR5QSA9IHBbaV0ueSAtIGxlbjEgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5zaW4odGhldGEpXHJcblx0XHRcdFx0eEIgPSBwW2ldLnggKyBsZW4yICogc3BsaW5lLnNtb290aEZhY3RvciAqIE1hdGguY29zKHRoZXRhKVxyXG5cdFx0XHRcdHlCID0gcFtpXS55ICsgbGVuMiAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLnNpbih0aGV0YSlcclxuXHRcdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2ldID0gbmV3IEJ1LlBvaW50IHhBLCB5QVxyXG5cdFx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQmVoaW5kW2ldID0gbmV3IEJ1LlBvaW50IHhCLCB5QlxyXG5cclxuXHRcdFx0XHQjIGFkZCBjb250cm9sIGxpbmVzIGZvciBkZWJ1Z2dpbmdcclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMl0gPSBuZXcgQnUuTGluZSBzcGxpbmUudmVydGljZXNbaV0sIHNwbGluZS5jb250cm9sUG9pbnRzQWhlYWRbaV1cclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMV0gPSAgbmV3IEJ1LkxpbmUgc3BsaW5lLnZlcnRpY2VzW2ldLCBzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFtpXVxyXG4iLCIjIHRyaWFuZ2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5UcmlhbmdsZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdHR5cGU6ICdUcmlhbmdsZSdcclxuXHRmaWxsYWJsZTogeWVzXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAocDEsIHAyLCBwMykgLT5cclxuXHRcdHN1cGVyKClcclxuXHJcblx0XHRpZiBhcmd1bWVudHMubGVuZ3RoID09IDZcclxuXHRcdFx0W3gxLCB5MSwgeDIsIHkyLCB4MywgeTNdID0gYXJndW1lbnRzXHJcblx0XHRcdHAxID0gbmV3IEJ1LlBvaW50IHgxLCB5MVxyXG5cdFx0XHRwMiA9IG5ldyBCdS5Qb2ludCB4MiwgeTJcclxuXHRcdFx0cDMgPSBuZXcgQnUuUG9pbnQgeDMsIHkzXHJcblxyXG5cdFx0QGxpbmVzID0gW1xyXG5cdFx0XHRuZXcgQnUuTGluZShwMSwgcDIpXHJcblx0XHRcdG5ldyBCdS5MaW5lKHAyLCBwMylcclxuXHRcdFx0bmV3IEJ1LkxpbmUocDMsIHAxKVxyXG5cdFx0XVxyXG5cdFx0I0BjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQnUuYXZlcmFnZShwMS54LCBwMi54LCBwMy54KSwgQnUuYXZlcmFnZShwMS55LCBwMi55LCBwMy55KVxyXG5cdFx0QHBvaW50cyA9IFtwMSwgcDIsIHAzXVxyXG5cdFx0QGtleVBvaW50cyA9IEBwb2ludHNcclxuXHRcdEBvbiAnY2hhbmdlZCcsIEB1cGRhdGVcclxuXHRcdEBvbiAnY2hhbmdlZCcsID0+IEAuYm91bmRzPy51cGRhdGUoKVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlRyaWFuZ2xlIEBwb2ludHNbMF0sIEBwb2ludHNbMV0sIEBwb2ludHNbMl1cclxuXHJcblx0dXBkYXRlOiAtPlxyXG5cdFx0QGxpbmVzWzBdLnBvaW50c1swXS5jb3B5IEBwb2ludHNbMF1cclxuXHRcdEBsaW5lc1swXS5wb2ludHNbMV0uY29weSBAcG9pbnRzWzFdXHJcblx0XHRAbGluZXNbMV0ucG9pbnRzWzBdLmNvcHkgQHBvaW50c1sxXVxyXG5cdFx0QGxpbmVzWzFdLnBvaW50c1sxXS5jb3B5IEBwb2ludHNbMl1cclxuXHRcdEBsaW5lc1syXS5wb2ludHNbMF0uY29weSBAcG9pbnRzWzJdXHJcblx0XHRAbGluZXNbMl0ucG9pbnRzWzFdLmNvcHkgQHBvaW50c1swXVxyXG4iLCIjIFVzZWQgdG8gcmVuZGVyIGJpdG1hcCB0byB0aGUgc2NyZWVuXHJcblxyXG5jbGFzcyBCdS5JbWFnZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCwgeCA9IDAsIHkgPSAwLCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnSW1hZ2UnXHJcblxyXG5cdFx0QGF1dG9TaXplID0geWVzXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplXHJcblx0XHRAcG9zaXRpb24gPSBuZXcgQnUuVmVjdG9yIHgsIHlcclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuVmVjdG9yIHggKyB3aWR0aCAvIDIsIHkgKyBoZWlnaHQgLyAyXHJcblx0XHRpZiB3aWR0aD9cclxuXHRcdFx0QHNpemUuc2V0IHdpZHRoLCBoZWlnaHRcclxuXHRcdFx0QGF1dG9TaXplID0gbm9cclxuXHJcblx0XHRAcGl2b3QgPSBuZXcgQnUuVmVjdG9yIDAuNSwgMC41XHJcblxyXG5cdFx0QF9pbWFnZSA9IG5ldyBCdS5nbG9iYWwuSW1hZ2VcclxuXHRcdEByZWFkeSA9IGZhbHNlXHJcblxyXG5cdFx0QF9pbWFnZS5vbmxvYWQgPSAoZSkgPT5cclxuXHRcdFx0aWYgQGF1dG9TaXplXHJcblx0XHRcdFx0QHNpemUuc2V0IEBfaW1hZ2Uud2lkdGgsIEBfaW1hZ2UuaGVpZ2h0XHJcblx0XHRcdEByZWFkeSA9IHRydWVcclxuXHJcblx0XHRAX2ltYWdlLnNyYyA9IEB1cmwgaWYgQHVybD9cclxuXHJcblx0QHByb3BlcnR5ICdpbWFnZScsXHJcblx0XHRnZXQ6IC0+IEBfaW1hZ2VcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9pbWFnZSA9IHZhbFxyXG5cdFx0XHRAcmVhZHkgPSB5ZXNcclxuIiwiIyBSZW5kZXIgdGV4dCBhcm91bmQgYSBwb2ludFxyXG5cclxuY2xhc3MgQnUuUG9pbnRUZXh0IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0IyMjXHJcblx0b3B0aW9ucy5hbGlnbjpcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0fCAgIC0tICAgIDAtICAgICstICAgfFxyXG5cdHwgICAgICAgICB84oaZMDAgICAgICB8XHJcblx0fCAgIC0wICAtLSstPiAgICswICAgfFxyXG5cdHwgICAgICAgICDihpMgICAgICAgICAgfFxyXG5cdHwgICAtKyAgICAwKyAgICArKyAgIHxcclxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Zm9yIGV4YW1wbGU6IHRleHQgaXMgaW4gdGhlIHJpZ2h0IHRvcCBvZiB0aGUgcG9pbnQsIHRoZW4gYWxpZ24gPSBcIistXCJcclxuXHQjIyNcclxuXHRjb25zdHJ1Y3RvcjogKEB0ZXh0LCBAeCA9IDAsIEB5ID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1BvaW50VGV4dCdcclxuXHRcdEBzdHJva2VTdHlsZSA9IG51bGwgIyBubyBzdHJva2UgYnkgZGVmYXVsdFxyXG5cdFx0QGZpbGxTdHlsZSA9ICdibGFjaydcclxuXHJcblx0XHRvcHRpb25zID0gQnUuY29tYmluZU9wdGlvbnMgYXJndW1lbnRzLFxyXG5cdFx0XHRhbGlnbjogJzAwJ1xyXG5cdFx0QGFsaWduID0gb3B0aW9ucy5hbGlnblxyXG5cdFx0aWYgb3B0aW9ucy5mb250P1xyXG5cdFx0XHRAZm9udCA9IG9wdGlvbnMuZm9udFxyXG5cdFx0ZWxzZSBpZiBvcHRpb25zLmZvbnRGYW1pbHk/IG9yIG9wdGlvbnMuZm9udFNpemU/XHJcblx0XHRcdEBfZm9udEZhbWlseSA9IG9wdGlvbnMuZm9udEZhbWlseSBvciBCdS5ERUZBVUxUX0ZPTlRfRkFNSUxZXHJcblx0XHRcdEBfZm9udFNpemUgPSBvcHRpb25zLmZvbnRTaXplIG9yIEJ1LkRFRkFVTFRfRk9OVF9TSVpFXHJcblx0XHRcdEBmb250ID0gXCIjeyBAX2ZvbnRTaXplIH1weCAjeyBAX2ZvbnRGYW1pbHkgfVwiXHJcblx0XHRlbHNlXHJcblx0XHRcdEBmb250ID0gbnVsbFxyXG5cclxuXHRAcHJvcGVydHkgJ2FsaWduJyxcclxuXHRcdGdldDogLT4gQF9hbGlnblxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2FsaWduID0gdmFsXHJcblx0XHRcdEBzZXRBbGlnbiBAX2FsaWduXHJcblxyXG5cdEBwcm9wZXJ0eSAnZm9udEZhbWlseScsXHJcblx0XHRnZXQ6IC0+IEBfZm9udEZhbWlseVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2ZvbnRGYW1pbHkgPSB2YWxcclxuXHRcdFx0QGZvbnQgPSBcIiN7IEBfZm9udFNpemUgfXB4ICN7IEBfZm9udEZhbWlseSB9XCJcclxuXHJcblx0QHByb3BlcnR5ICdmb250U2l6ZScsXHJcblx0XHRnZXQ6IC0+IEBfZm9udFNpemVcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9mb250U2l6ZSA9IHZhbFxyXG5cdFx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIlxyXG5cclxuXHRzZXRBbGlnbjogKGFsaWduKSAtPlxyXG5cdFx0aWYgYWxpZ24ubGVuZ3RoID09IDFcclxuXHRcdFx0YWxpZ24gPSAnJyArIGFsaWduICsgYWxpZ25cclxuXHRcdGFsaWduWCA9IGFsaWduLnN1YnN0cmluZygwLCAxKVxyXG5cdFx0YWxpZ25ZID0gYWxpZ24uc3Vic3RyaW5nKDEsIDIpXHJcblx0XHRAdGV4dEFsaWduID0gc3dpdGNoIGFsaWduWFxyXG5cdFx0XHR3aGVuICctJyB0aGVuICdyaWdodCdcclxuXHRcdFx0d2hlbiAnMCcgdGhlbiAnY2VudGVyJ1xyXG5cdFx0XHR3aGVuICcrJyB0aGVuICdsZWZ0J1xyXG5cdFx0QHRleHRCYXNlbGluZSA9IHN3aXRjaCBhbGlnbllcclxuXHRcdFx0d2hlbiAnLScgdGhlbiAnYm90dG9tJ1xyXG5cdFx0XHR3aGVuICcwJyB0aGVuICdtaWRkbGUnXHJcblx0XHRcdHdoZW4gJysnIHRoZW4gJ3RvcCdcclxuXHRcdEBcclxuIiwiIyBhbmltYXRpb24gY2xhc3MgYW5kIHByZXNldCBhbmltYXRpb25zXHJcblxyXG5jbGFzcyBCdS5BbmltYXRpb25cclxuXHJcblx0Y29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxyXG5cdFx0QGZyb20gPSBvcHRpb25zLmZyb21cclxuXHRcdEB0byA9IG9wdGlvbnMudG9cclxuXHRcdEBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gb3IgMC41XHJcblx0XHRAZWFzaW5nID0gb3B0aW9ucy5lYXNpbmcgb3IgZmFsc2VcclxuXHRcdEByZXBlYXQgPSAhIW9wdGlvbnMucmVwZWF0XHJcblx0XHRAaW5pdCA9IG9wdGlvbnMuaW5pdFxyXG5cdFx0QHVwZGF0ZSA9IG9wdGlvbnMudXBkYXRlXHJcblx0XHRAZmluaXNoID0gb3B0aW9ucy5maW5pc2hcclxuXHJcblx0YXBwbHlUbzogKHRhcmdldCwgYXJncykgLT5cclxuXHRcdHRhc2sgPSBuZXcgQnUuQW5pbWF0aW9uVGFzayBALCB0YXJnZXQsIGFyZ3NcclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lci5hZGQgdGFza1xyXG5cdFx0dGFza1xyXG5cclxuXHRpc0xlZ2FsOiAtPlxyXG5cdFx0cmV0dXJuIHRydWUgdW5sZXNzIEBmcm9tPyBhbmQgQHRvP1xyXG5cclxuXHRcdGlmIEJ1LmlzUGxhaW5PYmplY3QgQGZyb21cclxuXHRcdFx0Zm9yIG93biBrZXkgb2YgQGZyb21cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0b1trZXldP1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gZmFsc2UgdW5sZXNzIEB0bz9cclxuXHRcdHRydWVcclxuXHJcbiMgUHJlc2V0IEFuaW1hdGlvbnNcclxuIyBTb21lIG9mIHRoZSBhbmltYXRpb25zIGFyZSBjb25zaXN0ZW50IHdpdGggalF1ZXJ5IFVJXHJcbkJ1LmFuaW1hdGlvbnMgPVxyXG5cclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCMgU2ltcGxlXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0ZmFkZUluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IGFuaW0udFxyXG5cclxuXHRmYWRlT3V0OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IDEgLSBhbmltLnRcclxuXHJcblx0c3BpbjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDJcclxuXHJcblx0c3BpbkluOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLmRlc1NjYWxlID0gYW5pbS5hcmcgb3IgMVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLnRcclxuXHRcdFx0QHJvdGF0aW9uID0gYW5pbS50ICogTWF0aC5QSSAqIDRcclxuXHRcdFx0QHNjYWxlID0gYW5pbS50ICogYW5pbS5kYXRhLmRlc1NjYWxlXHJcblxyXG5cdHNwaW5PdXQ6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gMSAtIGFuaW0udFxyXG5cdFx0XHRAcm90YXRpb24gPSBhbmltLnQgKiBNYXRoLlBJICogNFxyXG5cdFx0XHRAc2NhbGUgPSAxIC0gYW5pbS50XHJcblxyXG5cdGJsaW5rOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRkdXJhdGlvbjogMC4yXHJcblx0XHRmcm9tOiAwXHJcblx0XHR0bzogNTEyXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRkID0gTWF0aC5mbG9vciBNYXRoLmFicyhhbmltLmN1cnJlbnQgLSAyNTYpXHJcblx0XHRcdEBmaWxsU3R5bGUgPSBcInJnYigjeyBkIH0sICN7IGQgfSwgI3sgZCB9KVwiXHJcblxyXG5cdHNoYWtlOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5kYXRhLm94ID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0YW5pbS5kYXRhLnJhbmdlID0gYW5pbS5hcmcgb3IgMjBcclxuXHRcdHVwZGF0ZTogKGFuaW0pIC0+XHJcblx0XHRcdEBwb3NpdGlvbi54ID0gTWF0aC5zaW4oYW5pbS50ICogTWF0aC5QSSAqIDgpICogYW5pbS5kYXRhLnJhbmdlICsgYW5pbS5kYXRhLm94XHJcblxyXG5cdGp1bXA6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmRhdGEub3kgPSBAcG9zaXRpb24ueVxyXG5cdFx0XHRhbmltLmRhdGEuaGVpZ2h0ID0gYW5pbS5hcmcgb3IgMTAwXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueSA9IC0gYW5pbS5kYXRhLmhlaWdodCAqIE1hdGguc2luKGFuaW0udCAqIE1hdGguUEkpICsgYW5pbS5kYXRhLm95XHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBUb2dnbGVkOiBkZXRlY3QgYW5kIHNhdmUgb3JpZ2luYWwgc3RhdHVzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0cHVmZjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0ZHVyYXRpb246IDAuMTVcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPVxyXG5cdFx0XHRcdG9wYWNpdHk6IEBvcGFjaXR5XHJcblx0XHRcdFx0c2NhbGU6IEBzY2FsZS54XHJcblx0XHRcdGFuaW0udG8gPVxyXG5cdFx0XHRcdGlmIEBvcGFjaXR5ID09IDFcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAqIDEuNVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG9wYWNpdHk6IDFcclxuXHRcdFx0XHRcdHNjYWxlOiBAc2NhbGUueCAvIDEuNVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBhbmltLmN1cnJlbnQub3BhY2l0eVxyXG5cdFx0XHRAc2NhbGUgPSBhbmltLmN1cnJlbnQuc2NhbGVcclxuXHJcblx0Y2xpcDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGlmIEBzY2FsZS55ICE9IDBcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSAwXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRcdGFuaW0udG8gPSBAc2NhbGUueFxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFg6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueFxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnggPSBhbmltLmN1cnJlbnRcclxuXHJcblx0ZmxpcFk6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueVxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHNjYWxlLnkgPSBhbmltLmN1cnJlbnRcclxuXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQjIFdpdGggQXJndW1lbnRzXHJcblx0Iy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW92ZVRvOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0aWYgYW5pbS5hcmc/XHJcblx0XHRcdFx0YW5pbS5mcm9tID0gQHBvc2l0aW9uLnhcclxuXHRcdFx0XHRhbmltLnRvID0gcGFyc2VGbG9hdCBhbmltLmFyZ1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnYW5pbWF0aW9uIG1vdmVUbyBuZWVkIGFuIGFyZ3VtZW50J1xyXG5cdFx0dXBkYXRlOiAoYW5pbSkgLT5cclxuXHRcdFx0QHBvc2l0aW9uLnggPSBhbmltLmN1cnJlbnRcclxuXHJcblx0bW92ZUJ5OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0aWYgYW5pbS5hcmdzP1xyXG5cdFx0XHRcdGFuaW0uZnJvbSA9IEBwb3NpdGlvbi54XHJcblx0XHRcdFx0YW5pbS50byA9IEBwb3NpdGlvbi54ICsgcGFyc2VGbG9hdChhbmltLmFyZ3MpXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yICdhbmltYXRpb24gbW92ZVRvIG5lZWQgYW4gYXJndW1lbnQnXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAcG9zaXRpb24ueCA9IGFuaW0uY3VycmVudFxyXG5cclxuXHRkaXNjb2xvcjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0pIC0+XHJcblx0XHRcdGRlc0NvbG9yID0gYW5pbS5hcmdcclxuXHRcdFx0ZGVzQ29sb3IgPSBuZXcgQnUuQ29sb3IgZGVzQ29sb3IgaWYgQnUuaXNTdHJpbmcgZGVzQ29sb3JcclxuXHRcdFx0YW5pbS5mcm9tID0gbmV3IEJ1LkNvbG9yIEBmaWxsU3R5bGVcclxuXHRcdFx0YW5pbS50byA9IGRlc0NvbG9yXHJcblx0XHR1cGRhdGU6IChhbmltKSAtPlxyXG5cdFx0XHRAZmlsbFN0eWxlID0gYW5pbS5jdXJyZW50LnRvUkdCQSgpXHJcbiIsIiMgUnVuIHRoZSBhbmltYXRpb24gdGFza3NcclxuXHJcbmNsYXNzIEJ1LkFuaW1hdGlvblJ1bm5lclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEBydW5uaW5nQW5pbWF0aW9ucyA9IFtdXHJcblxyXG5cdGFkZDogKHRhc2spIC0+XHJcblx0XHR0YXNrLmluaXQoKVxyXG5cdFx0aWYgdGFzay5hbmltYXRpb24uaXNMZWdhbCgpXHJcblx0XHRcdHRhc2suc3RhcnRUaW1lID0gQnUubm93KClcclxuXHRcdFx0QHJ1bm5pbmdBbmltYXRpb25zLnB1c2ggdGFza1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRjb25zb2xlLmVycm9yICdCdS5BbmltYXRpb25SdW5uZXI6IGFuaW1hdGlvbiBzZXR0aW5nIGlzIGlsbGVnYWw6ICcsIHRhc2suYW5pbWF0aW9uXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdG5vdyA9IEJ1Lm5vdygpXHJcblx0XHRmb3IgdGFzayBpbiBAcnVubmluZ0FuaW1hdGlvbnNcclxuXHRcdFx0Y29udGludWUgaWYgdGFzay5maW5pc2hlZFxyXG5cclxuXHRcdFx0YW5pbSA9IHRhc2suYW5pbWF0aW9uXHJcblx0XHRcdHQgPSAobm93IC0gdGFzay5zdGFydFRpbWUpIC8gKGFuaW0uZHVyYXRpb24gKiAxMDAwKVxyXG5cdFx0XHRpZiB0ID4gMVxyXG5cdFx0XHRcdGZpbmlzaCA9IHRydWVcclxuXHRcdFx0XHRpZiBhbmltLnJlcGVhdFxyXG5cdFx0XHRcdFx0dCA9IDBcclxuXHRcdFx0XHRcdHRhc2suc3RhcnRUaW1lID0gQnUubm93KClcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHQjIFRPRE8gcmVtb3ZlIHRoZSBmaW5pc2hlZCB0YXNrcyBvdXRcclxuXHRcdFx0XHRcdHQgPSAxXHJcblx0XHRcdFx0XHR0YXNrLmZpbmlzaGVkID0geWVzXHJcblxyXG5cdFx0XHRpZiBhbmltLmVhc2luZyA9PSB0cnVlXHJcblx0XHRcdFx0dCA9IGVhc2luZ0Z1bmN0aW9uc1tERUZBVUxUX0VBU0lOR19GVU5DVElPTl0gdFxyXG5cdFx0XHRlbHNlIGlmIGVhc2luZ0Z1bmN0aW9uc1thbmltLmVhc2luZ10/XHJcblx0XHRcdFx0dCA9IGVhc2luZ0Z1bmN0aW9uc1thbmltLmVhc2luZ10gdFxyXG5cclxuXHRcdFx0dGFzay50ID0gdFxyXG5cdFx0XHR0YXNrLmludGVycG9sYXRlKClcclxuXHJcblx0XHRcdGFuaW0udXBkYXRlLmNhbGwgdGFzay50YXJnZXQsIHRhc2tcclxuXHRcdFx0aWYgZmluaXNoIHRoZW4gYW5pbS5maW5pc2g/LmNhbGwgdGFzay50YXJnZXQsIHRhc2tcclxuXHJcblx0IyBIb29rIHVwIG9uIGFuIHJlbmRlcmVyLCByZW1vdmUgb3duIHNldEludGVybmFsXHJcblx0aG9va1VwOiAocmVuZGVyZXIpIC0+XHJcblx0XHRyZW5kZXJlci5vbiAndXBkYXRlJywgPT4gQHVwZGF0ZSgpXHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBQcml2YXRlIHZhcmlhYmxlc1xyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdERFRkFVTFRfRUFTSU5HX0ZVTkNUSU9OID0gJ3F1YWQnXHJcblx0ZWFzaW5nRnVuY3Rpb25zID1cclxuXHRcdHF1YWRJbjogKHQpIC0+IHQgKiB0XHJcblx0XHRxdWFkT3V0OiAodCkgLT4gdCAqICgyIC0gdClcclxuXHRcdHF1YWQ6ICh0KSAtPlxyXG5cdFx0XHRpZiB0IDwgMC41XHJcblx0XHRcdFx0MiAqIHQgKiB0XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHQtMiAqIHQgKiB0ICsgNCAqIHQgLSAxXHJcblxyXG5cdFx0Y3ViaWNJbjogKHQpIC0+IHQgKiogM1xyXG5cdFx0Y3ViaWNPdXQ6ICh0KSAtPiAodCAtIDEpICoqIDMgKyAxXHJcblx0XHRjdWJpYzogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQ0ICogdCAqKiAzXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHQ0ICogKHQgLSAxKSAqKiAzICsgMVxyXG5cclxuXHRcdHNpbmVJbjogKHQpIC0+IE1hdGguc2luKCh0IC0gMSkgKiBCdS5IQUxGX1BJKSArIDFcclxuXHRcdHNpbmVPdXQ6ICh0KSAtPiBNYXRoLnNpbiB0ICogQnUuSEFMRl9QSVxyXG5cdFx0c2luZTogKHQpIC0+XHJcblx0XHRcdGlmIHQgPCAwLjVcclxuXHRcdFx0XHQoTWF0aC5zaW4oKHQgKiAyIC0gMSkgKiBCdS5IQUxGX1BJKSArIDEpIC8gMlxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0TWF0aC5zaW4oKHQgLSAwLjUpICogTWF0aC5QSSkgLyAyICsgMC41XHJcblxyXG5cdFx0IyBUT0RPIGFkZCBxdWFydCwgcXVpbnQsIGV4cG8sIGNpcmMsIGJhY2ssIGVsYXN0aWMsIGJvdW5jZVxyXG5cclxuIyBEZWZpbmUgdGhlIGdsb2JhbCB1bmlxdWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzc1xyXG5CdS5hbmltYXRpb25SdW5uZXIgPSBuZXcgQnUuQW5pbWF0aW9uUnVubmVyXHJcbiIsIiMgQW5pbWF0aW9uVGFzayBpcyBhbiBpbnN0YW5jZSBvZiBBbmltYXRpb24sIHJ1biBieSBBbmltYXRpb25SdW5uZXJcblxuY2xhc3MgQnUuQW5pbWF0aW9uVGFza1xuXG4gICAgY29uc3RydWN0b3I6IChAYW5pbWF0aW9uLCBAdGFyZ2V0LCBAYXJncyA9IFtdKSAtPlxuICAgICAgICBAc3RhcnRUaW1lID0gMFxuICAgICAgICBAZmluaXNoZWQgPSBub1xuICAgICAgICBAZnJvbSA9IEJ1LmNsb25lIEBhbmltYXRpb24uZnJvbVxuICAgICAgICBAY3VycmVudCA9IEJ1LmNsb25lIEBhbmltYXRpb24uZnJvbVxuICAgICAgICBAdG8gPSBCdS5jbG9uZSBAYW5pbWF0aW9uLnRvXG4gICAgICAgIEBkYXRhID0ge31cbiAgICAgICAgQHQgPSAwXG4gICAgICAgIEBhcmcgPSBAYXJnc1swXVxuXG4gICAgaW5pdDogLT5cbiAgICAgICAgQGFuaW1hdGlvbi5pbml0Py5jYWxsIEB0YXJnZXQsIEBcbiAgICAgICAgQGN1cnJlbnQgPSBCdS5jbG9uZSBAZnJvbVxuXG4gICAgaW50ZXJwb2xhdGU6IC0+XG4gICAgICAgIGlmIEJ1LmlzTnVtYmVyIEBmcm9tXG4gICAgICAgICAgICBAY3VycmVudCA9IGludGVycG9sYXRlTnVtIEBmcm9tLCBAdG8sIEB0XG4gICAgICAgIGVsc2UgaWYgQGZyb20gaW5zdGFuY2VvZiBCdS5Db2xvclxuICAgICAgICAgICAgaW50ZXJwb2xhdGVPYmplY3QgQGZyb20sIEB0bywgQHQsIEBjdXJyZW50XG4gICAgICAgIGVsc2UgaWYgQnUuaXNQbGFpbk9iamVjdCBAZnJvbVxuICAgICAgICAgICAgZm9yIG93biBrZXkgb2YgQGZyb21cbiAgICAgICAgICAgICAgICBpZiBCdS5pc051bWJlciBAZnJvbVtrZXldXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50W2tleV0gPSBpbnRlcnBvbGF0ZU51bSBAZnJvbVtrZXldLCBAdG9ba2V5XSwgQHRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRlT2JqZWN0IEBmcm9tW2tleV0sIEB0b1trZXldLCBAdCwgQGN1cnJlbnRba2V5XVxuXG4gICAgaW50ZXJwb2xhdGVOdW0gPSAoYSwgYiwgdCkgLT4gYiAqIHQgLSBhICogKHQgLSAxKVxuXG4gICAgaW50ZXJwb2xhdGVPYmplY3QgPSAoYSwgYiwgdCwgYykgLT5cbiAgICAgICAgaWYgYSBpbnN0YW5jZW9mIEJ1LkNvbG9yXG4gICAgICAgICAgICBjLnNldFJHQkEgaW50ZXJwb2xhdGVOdW0oYS5yLCBiLnIsIHQpLCBpbnRlcnBvbGF0ZU51bShhLmcsIGIuZywgdCksIGludGVycG9sYXRlTnVtKGEuYiwgYi5iLCB0KSwgaW50ZXJwb2xhdGVOdW0oYS5hLCBiLmEsIHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgXCJBbmltYXRpb25UYXNrLmludGVycG9sYXRlT2JqZWN0KCkgZG9lc24ndCBzdXBwb3J0IG9iamVjdCB0eXBlOiBcIiwgYVxuIiwiIyBNYW5hZ2UgYW4gT2JqZWN0MkQgbGlzdCBhbmQgdXBkYXRlIGl0cyBkYXNoT2Zmc2V0XHJcblxyXG5jbGFzcyBCdS5EYXNoRmxvd01hbmFnZXJcclxuXHJcblx0Y29uc3RydWN0b3I6IC0+XHJcblx0XHRAZmxvd2luZ09iamVjdHMgPSBbXVxyXG5cclxuXHRzZXRTcGVlZDogKHRhcmdldCwgc3BlZWQpIC0+XHJcblx0XHR0YXJnZXQuZGFzaEZsb3dTcGVlZCA9IHNwZWVkXHJcblx0XHRpID0gQGZsb3dpbmdPYmplY3RzLmluZGV4T2YgdGFyZ2V0XHJcblx0XHRpZiBzcGVlZCAhPSAwXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5wdXNoIHRhcmdldCBpZiBpID09IC0xXHJcblx0XHRlbHNlXHJcblx0XHRcdEBmbG93aW5nT2JqZWN0cy5zcGxpY2UoaSwgMSkgaWYgaSA+IC0xXHJcblxyXG5cdHVwZGF0ZTogLT5cclxuXHRcdGZvciBvIGluIEBmbG93aW5nT2JqZWN0c1xyXG5cdFx0XHRvLmRhc2hPZmZzZXQgKz0gby5kYXNoRmxvd1NwZWVkXHJcblxyXG5cdCMgSG9vayB1cCBvbiBhbiByZW5kZXJlciwgcmVtb3ZlIG93biBzZXRJbnRlcm5hbFxyXG5cdGhvb2tVcDogKHJlbmRlcmVyKSAtPlxyXG5cdFx0cmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEB1cGRhdGUoKVxyXG5cclxuIyBHbG9iYWwgdW5pcXVlIGluc3RhbmNlXHJcbkJ1LmRhc2hGbG93TWFuYWdlciA9IG5ldyBCdS5EYXNoRmxvd01hbmFnZXJcclxuIiwiIyBTcHJpdGUgU2hlZXRcclxuXHJcbmNsYXNzIEJ1LlNwcml0ZVNoZWV0XHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHJcblx0XHRAcmVhZHkgPSBubyAgIyBJZiB0aGlzIHNwcml0ZSBzaGVldCBpcyBsb2FkZWQgYW5kIHBhcnNlZC5cclxuXHRcdEBoZWlnaHQgPSAwICAjIEhlaWdodCBvZiB0aGlzIHNwcml0ZVxyXG5cclxuXHRcdEBkYXRhID0gbnVsbCAgIyBUaGUgSlNPTiBkYXRhXHJcblx0XHRAaW1hZ2VzID0gW10gICMgVGhlIGBJbWFnZWAgbGlzdCBsb2FkZWRcclxuXHRcdEBmcmFtZUltYWdlcyA9IFtdICAjIFBhcnNlZCBmcmFtZSBpbWFnZXNcclxuXHJcblx0XHQjIGxvYWQgYW5kIHRyaWdnZXIgcGFyc2VEYXRhKClcclxuXHRcdCQuYWpheCBAdXJsLCBzdWNjZXNzOiAodGV4dCkgPT5cclxuXHRcdFx0QGRhdGEgPSBKU09OLnBhcnNlIHRleHRcclxuXHJcblx0XHRcdGlmIG5vdCBAZGF0YS5pbWFnZXM/XHJcblx0XHRcdFx0QGRhdGEuaW1hZ2VzID0gW0B1cmwuc3Vic3RyaW5nKEB1cmwubGFzdEluZGV4T2YoJy8nKSwgQHVybC5sZW5ndGggLSA1KSArICcucG5nJ11cclxuXHJcblx0XHRcdGJhc2VVcmwgPSBAdXJsLnN1YnN0cmluZyAwLCBAdXJsLmxhc3RJbmRleE9mKCcvJykgKyAxXHJcblx0XHRcdGZvciBvd24gaSBvZiBAZGF0YS5pbWFnZXNcclxuXHRcdFx0XHRAZGF0YS5pbWFnZXNbaV0gPSBiYXNlVXJsICsgQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdFx0XHRcdGNvdW50TG9hZGVkID0gMFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0gPSBuZXcgSW1hZ2VcclxuXHRcdFx0XHRAaW1hZ2VzW2ldLm9ubG9hZCA9ICgpID0+XHJcblx0XHRcdFx0XHRjb3VudExvYWRlZCArPSAxXHJcblx0XHRcdFx0XHRAcGFyc2VEYXRhKCkgaWYgY291bnRMb2FkZWQgPT0gQGRhdGEuaW1hZ2VzLmxlbmd0aFxyXG5cdFx0XHRcdEBpbWFnZXNbaV0uc3JjID0gQGRhdGEuaW1hZ2VzW2ldXHJcblxyXG5cdHBhcnNlRGF0YTogLT5cclxuXHRcdCMgQ2xpcCB0aGUgaW1hZ2UgZm9yIGV2ZXJ5IGZyYW1lc1xyXG5cdFx0ZnJhbWVzID0gQGRhdGEuZnJhbWVzXHJcblx0XHRmb3Igb3duIGkgb2YgZnJhbWVzXHJcblx0XHRcdGZvciBqIGluIFswLi40XVxyXG5cdFx0XHRcdGlmIG5vdCBmcmFtZXNbaV1bal0/XHJcblx0XHRcdFx0XHRmcmFtZXNbaV1bal0gPSBpZiBmcmFtZXNbaSAtIDFdP1tqXT8gdGhlbiBmcmFtZXNbaSAtIDFdW2pdIGVsc2UgMFxyXG5cdFx0XHR4ID0gZnJhbWVzW2ldWzBdXHJcblx0XHRcdHkgPSBmcmFtZXNbaV1bMV1cclxuXHRcdFx0dyA9IGZyYW1lc1tpXVsyXVxyXG5cdFx0XHRoID0gZnJhbWVzW2ldWzNdXHJcblx0XHRcdGZyYW1lSW5kZXggPSBmcmFtZXNbaV1bNF1cclxuXHRcdFx0QGZyYW1lSW1hZ2VzW2ldID0gY2xpcEltYWdlIEBpbWFnZXNbZnJhbWVJbmRleF0sIHgsIHksIHcsIGhcclxuXHRcdFx0QGhlaWdodCA9IGggaWYgQGhlaWdodCA9PSAwXHJcblxyXG5cdFx0QHJlYWR5ID0geWVzXHJcblx0XHRAdHJpZ2dlciAnbG9hZGVkJ1xyXG5cclxuXHRnZXRGcmFtZUltYWdlOiAoa2V5LCBpbmRleCA9IDApIC0+XHJcblx0XHRyZXR1cm4gbnVsbCB1bmxlc3MgQHJlYWR5XHJcblx0XHRhbmltYXRpb24gPSBAZGF0YS5hbmltYXRpb25zW2tleV1cclxuXHRcdHJldHVybiBudWxsIHVubGVzcyBhbmltYXRpb24/XHJcblxyXG5cdFx0cmV0dXJuIEBmcmFtZUltYWdlc1thbmltYXRpb24uZnJhbWVzW2luZGV4XV1cclxuXHJcblx0bWVhc3VyZVRleHRXaWR0aDogKHRleHQpIC0+XHJcblx0XHR3aWR0aCA9IDBcclxuXHRcdGZvciBjaGFyIGluIHRleHRcclxuXHRcdFx0d2lkdGggKz0gQGdldEZyYW1lSW1hZ2UoY2hhcikud2lkdGhcclxuXHRcdHdpZHRoXHJcblxyXG5cdCMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0IyBQcml2YXRlIG1lbWJlcnNcclxuXHQjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcclxuXHJcblx0Y2xpcEltYWdlID0gKGltYWdlLCB4LCB5LCB3LCBoKSAtPlxyXG5cdFx0Y2FudmFzLndpZHRoID0gd1xyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGhcclxuXHRcdGNvbnRleHQuZHJhd0ltYWdlIGltYWdlLCB4LCB5LCB3LCBoLCAwLCAwLCB3LCBoXHJcblxyXG5cdFx0bmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG5cdFx0bmV3SW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpXHJcblx0XHRyZXR1cm4gbmV3SW1hZ2VcclxuIiwiIyBHZW9tZXRyeSBBbGdvcml0aG0gQ29sbGVjdGlvblxyXG5cclxuQnUuZ2VvbWV0cnlBbGdvcml0aG0gPSBHID1cclxuXHJcblx0aW5qZWN0OiAtPlxyXG5cdFx0QGluamVjdEludG8gW1xyXG5cdFx0XHQncG9pbnQnXHJcblx0XHRcdCdsaW5lJ1xyXG5cdFx0XHQnY2lyY2xlJ1xyXG5cdFx0XHQnZWxsaXBzZSdcclxuXHRcdFx0J3RyaWFuZ2xlJ1xyXG5cdFx0XHQncmVjdGFuZ2xlJ1xyXG5cdFx0XHQnZmFuJ1xyXG5cdFx0XHQnYm93J1xyXG5cdFx0XHQncG9seWdvbidcclxuXHRcdFx0J3BvbHlsaW5lJ1xyXG5cdFx0XVxyXG5cclxuXHRpbmplY3RJbnRvOiAoc2hhcGVzKSAtPlxyXG5cdFx0c2hhcGVzID0gW3NoYXBlc10gaWYgQnUuaXNTdHJpbmcgc2hhcGVzXHJcblxyXG5cdFx0aWYgJ3BvaW50JyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuUG9pbnQ6OmluQ2lyY2xlID0gKGNpcmNsZSkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5DaXJjbGUgQCwgY2lyY2xlXHJcblx0XHRcdEJ1LlBvaW50OjpkaXN0YW5jZVRvID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcuZGlzdGFuY2VGcm9tUG9pbnRUb1BvaW50IEAsIHBvaW50XHJcblx0XHRcdEJ1LlBvaW50Ojppc05lYXIgPSAodGFyZ2V0LCBsaW1pdCA9IEJ1LkRFRkFVTFRfTkVBUl9ESVNUKSAtPlxyXG5cdFx0XHRcdHN3aXRjaCB0YXJnZXQudHlwZVxyXG5cdFx0XHRcdFx0d2hlbiAnUG9pbnQnXHJcblx0XHRcdFx0XHRcdEcucG9pbnROZWFyUG9pbnQgQCwgdGFyZ2V0LCBsaW1pdFxyXG5cdFx0XHRcdFx0d2hlbiAnTGluZSdcclxuXHRcdFx0XHRcdFx0Ry5wb2ludE5lYXJMaW5lIEAsIHRhcmdldCwgbGltaXRcclxuXHRcdFx0XHRcdHdoZW4gJ1BvbHlsaW5lJ1xyXG5cdFx0XHRcdFx0XHRHLnBvaW50TmVhclBvbHlsaW5lIEAsIHRhcmdldCwgbGltaXRcclxuXHRcdFx0QnUuUG9pbnQuaW50ZXJwb2xhdGUgPSBHLmludGVycG9sYXRlQmV0d2VlblR3b1BvaW50c1xyXG5cclxuXHRcdGlmICdsaW5lJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuTGluZTo6ZGlzdGFuY2VUbyA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lIHBvaW50LCBAXHJcblx0XHRcdEJ1LkxpbmU6OmlzVHdvUG9pbnRzU2FtZVNpZGUgPSAocDEsIHAyKSAtPlxyXG5cdFx0XHRcdEcudHdvUG9pbnRzU2FtZVNpZGVPZkxpbmUgcDEsIHAyLCBAXHJcblx0XHRcdEJ1LkxpbmU6OmZvb3RQb2ludEZyb20gPSAocG9pbnQsIHNhdmVUbykgLT5cclxuXHRcdFx0XHRHLmZvb3RQb2ludEZyb21Qb2ludFRvTGluZSBwb2ludCwgQCwgc2F2ZVRvXHJcblx0XHRcdEJ1LkxpbmU6OmdldENyb3NzUG9pbnRXaXRoID0gKGxpbmUpIC0+XHJcblx0XHRcdFx0Ry5nZXRDcm9zc1BvaW50T2ZUd29MaW5lcyBsaW5lLCBAXHJcblx0XHRcdEJ1LkxpbmU6OmlzQ3Jvc3NXaXRoTGluZSA9IChsaW5lKSAtPlxyXG5cdFx0XHRcdEcuaXNUd29MaW5lc0Nyb3NzIGxpbmUsIEBcclxuXHJcblx0XHRpZiAnY2lyY2xlJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuQ2lyY2xlOjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5DaXJjbGUgcG9pbnQsIEBcclxuXHJcblx0XHRpZiAnZWxsaXBzZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LkVsbGlwc2U6Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJbkVsbGlwc2UgcG9pbnQsIEBcclxuXHJcblx0XHRpZiAndHJpYW5nbGUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5UcmlhbmdsZTo6X2NvbnRhaW5zUG9pbnQgPSAocG9pbnQpIC0+XHJcblx0XHRcdFx0Ry5wb2ludEluVHJpYW5nbGUgcG9pbnQsIEBcclxuXHRcdFx0QnUuVHJpYW5nbGU6OmFyZWEgPSAtPlxyXG5cdFx0XHRcdEcuY2FsY1RyaWFuZ2xlQXJlYSBAXHJcblxyXG5cdFx0aWYgJ3JlY3RhbmdsZScgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlJlY3RhbmdsZTo6Y29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5SZWN0YW5nbGUgcG9pbnQsIEBcclxuXHJcblx0XHRpZiAnZmFuJyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuRmFuOjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5GYW4gcG9pbnQsIEBcclxuXHJcblx0XHRpZiAnYm93JyBpbiBzaGFwZXNcclxuXHRcdFx0QnUuQm93OjpfY29udGFpbnNQb2ludCA9IChwb2ludCkgLT5cclxuXHRcdFx0XHRHLnBvaW50SW5Cb3cgcG9pbnQsIEBcclxuXHJcblx0XHRpZiAncG9seWdvbicgaW4gc2hhcGVzXHJcblx0XHRcdEJ1LlBvbHlnb246Ol9jb250YWluc1BvaW50ID0gKHBvaW50KSAtPlxyXG5cdFx0XHRcdEcucG9pbnRJblBvbHlnb24gcG9pbnQsIEBcclxuXHJcblx0XHRpZiAncG9seWxpbmUnIGluIHNoYXBlc1xyXG5cdFx0XHRCdS5Qb2x5bGluZTo6bGVuZ3RoID0gMFxyXG5cdFx0XHRCdS5Qb2x5bGluZTo6cG9pbnROb3JtYWxpemVkUG9zID0gW11cclxuXHRcdFx0QnUuUG9seWxpbmU6OmNhbGNMZW5ndGggPSAoKSAtPlxyXG5cdFx0XHRcdEBsZW5ndGggPSBHLmNhbGNQb2x5bGluZUxlbmd0aCBAXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpjYWxjUG9pbnROb3JtYWxpemVkUG9zID0gLT5cclxuXHRcdFx0XHRHLmNhbGNOb3JtYWxpemVkVmVydGljZXNQb3NPZlBvbHlsaW5lIEBcclxuXHRcdFx0QnUuUG9seWxpbmU6OmdldE5vcm1hbGl6ZWRQb3MgPSAoaW5kZXgpIC0+XHJcblx0XHRcdFx0aWYgaW5kZXg/IHRoZW4gQHBvaW50Tm9ybWFsaXplZFBvc1tpbmRleF0gZWxzZSBAcG9pbnROb3JtYWxpemVkUG9zXHJcblx0XHRcdEJ1LlBvbHlsaW5lOjpjb21wcmVzcyA9IChzdHJlbmd0aCA9IDAuOCkgLT5cclxuXHRcdFx0XHRHLmNvbXByZXNzUG9seWxpbmUgQCwgc3RyZW5ndGhcclxuXHJcblx0IyBQb2ludCBpbiBzaGFwZXNcclxuXHJcblx0cG9pbnROZWFyUG9pbnQ6IChwb2ludCwgdGFyZ2V0LCBsaW1pdCA9IEJ1LkRFRkFVTFRfTkVBUl9ESVNUKSAtPlxyXG5cdFx0cG9pbnQuZGlzdGFuY2VUbyh0YXJnZXQpIDwgbGltaXRcclxuXHJcblx0cG9pbnROZWFyTGluZTogKHBvaW50LCBsaW5lLCBsaW1pdCA9IEJ1LkRFRkFVTFRfTkVBUl9ESVNUKSAtPlxyXG5cdFx0dmVydGljYWxEaXN0ID0gbGluZS5kaXN0YW5jZVRvIHBvaW50XHJcblx0XHRmb290UG9pbnQgPSBsaW5lLmZvb3RQb2ludEZyb20gcG9pbnRcclxuXHJcblx0XHRpc0JldHdlZW4xID0gZm9vdFBvaW50LmRpc3RhbmNlVG8obGluZS5wb2ludHNbMF0pIDwgbGluZS5sZW5ndGggKyBsaW1pdFxyXG5cdFx0aXNCZXR3ZWVuMiA9IGZvb3RQb2ludC5kaXN0YW5jZVRvKGxpbmUucG9pbnRzWzFdKSA8IGxpbmUubGVuZ3RoICsgbGltaXRcclxuXHJcblx0XHRyZXR1cm4gdmVydGljYWxEaXN0IDwgbGltaXQgYW5kIGlzQmV0d2VlbjEgYW5kIGlzQmV0d2VlbjJcclxuXHJcblx0cG9pbnROZWFyUG9seWxpbmU6IChwb2ludCwgcG9seWxpbmUsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRmb3IgbGluZSBpbiBwb2x5bGluZS5saW5lc1xyXG5cdFx0XHRyZXR1cm4geWVzIGlmIEcucG9pbnROZWFyTGluZSBwb2ludCwgbGluZSwgbGltaXRcclxuXHRcdG5vXHJcblxyXG5cdHBvaW50SW5DaXJjbGU6IChwb2ludCwgY2lyY2xlKSAtPlxyXG5cdFx0ZHggPSBwb2ludC54IC0gY2lyY2xlLmN4XHJcblx0XHRkeSA9IHBvaW50LnkgLSBjaXJjbGUuY3lcclxuXHRcdHJldHVybiBCdS5iZXZlbChkeCwgZHkpIDwgY2lyY2xlLnJhZGl1c1xyXG5cclxuXHRwb2ludEluRWxsaXBzZTogKHBvaW50LCBlbGxpcHNlKSAtPlxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKHBvaW50LnggLyBlbGxpcHNlLnJhZGl1c1gsIHBvaW50LnkgLyBlbGxpcHNlLnJhZGl1c1kpIDwgMVxyXG5cclxuXHRwb2ludEluUmVjdGFuZ2xlOiAocG9pbnQsIHJlY3RhbmdsZSkgLT5cclxuXHRcdHBvaW50LnggPiByZWN0YW5nbGUucG9pbnRMVC54IGFuZFxyXG5cdFx0XHRcdHBvaW50LnkgPiByZWN0YW5nbGUucG9pbnRMVC55IGFuZFxyXG5cdFx0XHRcdHBvaW50LnggPCByZWN0YW5nbGUucG9pbnRMVC54ICsgcmVjdGFuZ2xlLnNpemUud2lkdGggYW5kXHJcblx0XHRcdFx0cG9pbnQueSA8IHJlY3RhbmdsZS5wb2ludExULnkgKyByZWN0YW5nbGUuc2l6ZS5oZWlnaHRcclxuXHJcblx0cG9pbnRJblRyaWFuZ2xlOiAocG9pbnQsIHRyaWFuZ2xlKSAtPlxyXG5cdFx0Ry50d29Qb2ludHNTYW1lU2lkZU9mTGluZShwb2ludCwgdHJpYW5nbGUucG9pbnRzWzJdLCB0cmlhbmdsZS5saW5lc1swXSkgYW5kXHJcblx0XHRcdFx0Ry50d29Qb2ludHNTYW1lU2lkZU9mTGluZShwb2ludCwgdHJpYW5nbGUucG9pbnRzWzBdLCB0cmlhbmdsZS5saW5lc1sxXSkgYW5kXHJcblx0XHRcdFx0Ry50d29Qb2ludHNTYW1lU2lkZU9mTGluZShwb2ludCwgdHJpYW5nbGUucG9pbnRzWzFdLCB0cmlhbmdsZS5saW5lc1syXSlcclxuXHJcblx0cG9pbnRJbkZhbjogKHBvaW50LCBmYW4pIC0+XHJcblx0XHRkeCA9IHBvaW50LnggLSBmYW4uY3hcclxuXHRcdGR5ID0gcG9pbnQueSAtIGZhbi5jeVxyXG5cdFx0YSA9IE1hdGguYXRhbjIocG9pbnQueSAtIGZhbi5jeSwgcG9pbnQueCAtIGZhbi5jeClcclxuXHRcdGEgKz0gQnUuVFdPX1BJIHdoaWxlIGEgPCBmYW4uYUZyb21cclxuXHRcdHJldHVybiBCdS5iZXZlbChkeCwgZHkpIDwgZmFuLnJhZGl1cyAmJiBhID4gZmFuLmFGcm9tICYmIGEgPCBmYW4uYVRvXHJcblxyXG5cdHBvaW50SW5Cb3c6IChwb2ludCwgYm93KSAtPlxyXG5cdFx0aWYgQnUuYmV2ZWwoYm93LmN4IC0gcG9pbnQueCwgYm93LmN5IC0gcG9pbnQueSkgPCBib3cucmFkaXVzXHJcblx0XHRcdHNhbWVTaWRlID0gYm93LnN0cmluZy5pc1R3b1BvaW50c1NhbWVTaWRlKGJvdy5jZW50ZXIsIHBvaW50KVxyXG5cdFx0XHRzbWFsbFRoYW5IYWxmQ2lyY2xlID0gYm93LmFUbyAtIGJvdy5hRnJvbSA8IE1hdGguUElcclxuXHRcdFx0cmV0dXJuIHNhbWVTaWRlIF4gc21hbGxUaGFuSGFsZkNpcmNsZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gZmFsc2VcclxuXHJcblx0cG9pbnRJblBvbHlnb246IChwb2ludCwgcG9seWdvbikgLT5cclxuXHRcdGZvciB0cmlhbmdsZSBpbiBwb2x5Z29uLnRyaWFuZ2xlc1xyXG5cdFx0XHRpZiB0cmlhbmdsZS5jb250YWluc1BvaW50IHBvaW50XHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdGZhbHNlXHJcblxyXG5cdCMgRGlzdGFuY2VcclxuXHJcblx0ZGlzdGFuY2VGcm9tUG9pbnRUb1BvaW50OiAocG9pbnQxLCBwb2ludDIpIC0+XHJcblx0XHRCdS5iZXZlbCBwb2ludDEueCAtIHBvaW50Mi54LCBwb2ludDEueSAtIHBvaW50Mi55XHJcblxyXG5cdGRpc3RhbmNlRnJvbVBvaW50VG9MaW5lOiAocG9pbnQsIGxpbmUpIC0+XHJcblx0XHRwMSA9IGxpbmUucG9pbnRzWzBdXHJcblx0XHRwMiA9IGxpbmUucG9pbnRzWzFdXHJcblx0XHRhID0gKHAxLnkgLSBwMi55KSAvIChwMS54IC0gcDIueClcclxuXHRcdGIgPSBwMS55IC0gYSAqIHAxLnhcclxuXHRcdHJldHVybiBNYXRoLmFicyhhICogcG9pbnQueCArIGIgLSBwb2ludC55KSAvIE1hdGguc3FydChhICogYSArIDEpXHJcblxyXG5cdCMgUG9pbnQgUmVsYXRlZFxyXG5cclxuXHRpbnRlcnBvbGF0ZUJldHdlZW5Ud29Qb2ludHM6IChwMSwgcDIsIGssIHAzKSAtPlxyXG5cdFx0eCA9IHAxLnggKyAocDIueCAtIHAxLngpICoga1xyXG5cdFx0eSA9IHAxLnkgKyAocDIueSAtIHAxLnkpICoga1xyXG5cclxuXHRcdGlmIHAzP1xyXG5cdFx0XHRwMy5zZXQgeCwgeVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IHgsIHlcclxuXHJcblx0IyBQb2ludCBhbmQgTGluZVxyXG5cclxuXHR0d29Qb2ludHNTYW1lU2lkZU9mTGluZTogKHAxLCBwMiwgbGluZSkgLT5cclxuXHRcdHBBID0gbGluZS5wb2ludHNbMF1cclxuXHRcdHBCID0gbGluZS5wb2ludHNbMV1cclxuXHRcdGlmIHBBLnggPT0gcEIueFxyXG5cdFx0XHQjIGlmIGJvdGggb2YgdGhlIHR3byBwb2ludHMgYXJlIG9uIHRoZSBsaW5lIHRoZW4gd2UgY29uc2lkZXIgdGhleSBhcmUgaW4gdGhlIHNhbWUgc2lkZVxyXG5cdFx0XHRyZXR1cm4gKHAxLnggLSBwQS54KSAqIChwMi54IC0gcEEueCkgPiAwXHJcblx0XHRlbHNlXHJcblx0XHRcdHkwMSA9IChwQS55IC0gcEIueSkgKiAocDEueCAtIHBBLngpIC8gKHBBLnggLSBwQi54KSArIHBBLnlcclxuXHRcdFx0eTAyID0gKHBBLnkgLSBwQi55KSAqIChwMi54IC0gcEEueCkgLyAocEEueCAtIHBCLngpICsgcEEueVxyXG5cdFx0XHRyZXR1cm4gKHAxLnkgLSB5MDEpICogKHAyLnkgLSB5MDIpID4gMFxyXG5cclxuXHRmb290UG9pbnRGcm9tUG9pbnRUb0xpbmU6IChwb2ludCwgbGluZSwgc2F2ZVRvID0gbmV3IEJ1LlBvaW50KSAtPlxyXG5cdFx0cDEgPSBsaW5lLnBvaW50c1swXVxyXG5cdFx0cDIgPSBsaW5lLnBvaW50c1sxXVxyXG5cdFx0QSA9IChwMS55IC0gcDIueSkgLyAocDEueCAtIHAyLngpXHJcblx0XHRCID0gcDEueSAtIEEgKiBwMS54XHJcblx0XHRtID0gcG9pbnQueCArIEEgKiBwb2ludC55XHJcblx0XHR4ID0gKG0gLSBBICogQikgLyAoQSAqIEEgKyAxKVxyXG5cdFx0eSA9IEEgKiB4ICsgQlxyXG5cclxuXHRcdHNhdmVUby5zZXQgeCwgeVxyXG5cdFx0cmV0dXJuIHNhdmVUb1xyXG5cclxuXHRnZXRDcm9zc1BvaW50T2ZUd29MaW5lczogKGxpbmUxLCBsaW5lMikgLT5cclxuXHRcdFtwMSwgcDJdID0gbGluZTEucG9pbnRzXHJcblx0XHRbcTEsIHEyXSA9IGxpbmUyLnBvaW50c1xyXG5cclxuXHRcdGExID0gcDIueSAtIHAxLnlcclxuXHRcdGIxID0gcDEueCAtIHAyLnhcclxuXHRcdGMxID0gKGExICogcDEueCkgKyAoYjEgKiBwMS55KVxyXG5cdFx0YTIgPSBxMi55IC0gcTEueVxyXG5cdFx0YjIgPSBxMS54IC0gcTIueFxyXG5cdFx0YzIgPSAoYTIgKiBxMS54KSArIChiMiAqIHExLnkpXHJcblx0XHRkZXQgPSAoYTEgKiBiMikgLSAoYTIgKiBiMSlcclxuXHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50ICgoYjIgKiBjMSkgLSAoYjEgKiBjMikpIC8gZGV0LCAoKGExICogYzIpIC0gKGEyICogYzEpKSAvIGRldFxyXG5cclxuXHRpc1R3b0xpbmVzQ3Jvc3M6IChsaW5lMSwgbGluZTIpIC0+XHJcblx0XHR4MSA9IGxpbmUxLnBvaW50c1swXS54XHJcblx0XHR5MSA9IGxpbmUxLnBvaW50c1swXS55XHJcblx0XHR4MiA9IGxpbmUxLnBvaW50c1sxXS54XHJcblx0XHR5MiA9IGxpbmUxLnBvaW50c1sxXS55XHJcblx0XHR4MyA9IGxpbmUyLnBvaW50c1swXS54XHJcblx0XHR5MyA9IGxpbmUyLnBvaW50c1swXS55XHJcblx0XHR4NCA9IGxpbmUyLnBvaW50c1sxXS54XHJcblx0XHR5NCA9IGxpbmUyLnBvaW50c1sxXS55XHJcblxyXG5cdFx0ZCA9ICh5MiAtIHkxKSAqICh4NCAtIHgzKSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKVxyXG5cclxuXHRcdGlmIGQgPT0gMFxyXG5cdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdGVsc2VcclxuXHRcdFx0eDAgPSAoKHgyIC0geDEpICogKHg0IC0geDMpICogKHkzIC0geTEpICsgKHkyIC0geTEpICogKHg0IC0geDMpICogeDEgLSAoeTQgLSB5MykgKiAoeDIgLSB4MSkgKiB4MykgLyBkXHJcblx0XHRcdHkwID0gKCh5MiAtIHkxKSAqICh5NCAtIHkzKSAqICh4MyAtIHgxKSArICh4MiAtIHgxKSAqICh5NCAtIHkzKSAqIHkxIC0gKHg0IC0geDMpICogKHkyIC0geTEpICogeTMpIC8gLWRcclxuXHRcdHJldHVybiAoeDAgLSB4MSkgKiAoeDAgLSB4MikgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeDAgLSB4MykgKiAoeDAgLSB4NCkgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeTAgLSB5MSkgKiAoeTAgLSB5MikgPCAwIGFuZFxyXG5cdFx0XHRcdFx0XHQoeTAgLSB5MykgKiAoeTAgLSB5NCkgPCAwXHJcblxyXG5cdCMgUG9seWxpbmVcclxuXHJcblx0Y2FsY1BvbHlsaW5lTGVuZ3RoOiAocG9seWxpbmUpIC0+XHJcblx0XHRsZW4gPSAwXHJcblx0XHRpZiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGggPj0gMlxyXG5cdFx0XHRmb3IgaSBpbiBbMSAuLi4gcG9seWxpbmUudmVydGljZXMubGVuZ3RoXVxyXG5cdFx0XHRcdGxlbiArPSBwb2x5bGluZS52ZXJ0aWNlc1tpXS5kaXN0YW5jZVRvIHBvbHlsaW5lLnZlcnRpY2VzW2kgLSAxXVxyXG5cdFx0cmV0dXJuIGxlblxyXG5cclxuXHRjYWxjTm9ybWFsaXplZFZlcnRpY2VzUG9zT2ZQb2x5bGluZTogKHBvbHlsaW5lKSAtPlxyXG5cdFx0Y3VyclBvcyA9IDBcclxuXHRcdHBvbHlsaW5lLnBvaW50Tm9ybWFsaXplZFBvc1swXSA9IDBcclxuXHRcdGZvciBpIGluIFsxIC4uLiBwb2x5bGluZS52ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdGN1cnJQb3MgKz0gcG9seWxpbmUudmVydGljZXNbaV0uZGlzdGFuY2VUbyhwb2x5bGluZS52ZXJ0aWNlc1tpIC0gMV0pIC8gcG9seWxpbmUubGVuZ3RoXHJcblx0XHRcdHBvbHlsaW5lLnBvaW50Tm9ybWFsaXplZFBvc1tpXSA9IGN1cnJQb3NcclxuXHJcblx0Y29tcHJlc3NQb2x5bGluZTogKHBvbHlsaW5lLCBzdHJlbmd0aCkgLT5cclxuXHRcdGNvbXByZXNzZWQgPSBbXVxyXG5cdFx0Zm9yIG93biBpIG9mIHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdGlmIGkgPCAyXHJcblx0XHRcdFx0Y29tcHJlc3NlZFtpXSA9IHBvbHlsaW5lLnZlcnRpY2VzW2ldXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRbcEEsIHBNXSA9IGNvbXByZXNzZWRbLTIuLi0xXVxyXG5cdFx0XHRcdHBCID0gcG9seWxpbmUudmVydGljZXNbaV1cclxuXHRcdFx0XHRvYmxpcXVlQW5nbGUgPSBNYXRoLmFicyhNYXRoLmF0YW4yKHBBLnkgLSBwTS55LCBwQS54IC0gcE0ueCkgLSBNYXRoLmF0YW4yKHBNLnkgLSBwQi55LCBwTS54IC0gcEIueCkpXHJcblx0XHRcdFx0aWYgb2JsaXF1ZUFuZ2xlIDwgc3RyZW5ndGggKiBzdHJlbmd0aCAqIEJ1LkhBTEZfUElcclxuXHRcdFx0XHRcdGNvbXByZXNzZWRbY29tcHJlc3NlZC5sZW5ndGggLSAxXSA9IHBCXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0Y29tcHJlc3NlZC5wdXNoIHBCXHJcblx0XHRwb2x5bGluZS52ZXJ0aWNlcyA9IGNvbXByZXNzZWRcclxuXHRcdHBvbHlsaW5lLmtleVBvaW50cyA9IHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRyZXR1cm4gcG9seWxpbmVcclxuXHJcblx0IyBBcmVhIENhbGN1bGF0aW9uXHJcblxyXG5cdGNhbGNUcmlhbmdsZUFyZWE6ICh0cmlhbmdsZSkgLT5cclxuXHRcdFthLCBiLCBjXSA9IHRyaWFuZ2xlLnBvaW50c1xyXG5cdFx0cmV0dXJuIE1hdGguYWJzKCgoYi54IC0gYS54KSAqIChjLnkgLSBhLnkpKSAtICgoYy54IC0gYS54KSAqIChiLnkgLSBhLnkpKSkgLyAyXHJcblxyXG5HLmluamVjdCgpXHJcbiIsIiMgVXNlZCB0byBnZW5lcmF0ZSByYW5kb20gc2hhcGVzXHJcblxyXG5jbGFzcyBCdS5TaGFwZVJhbmRvbWl6ZXJcclxuXHJcblx0TUFSR0lOID0gMzBcclxuXHJcblx0cmFuZ2VXaWR0aDogODAwXHJcblx0cmFuZ2VIZWlnaHQ6IDQ1MFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogLT5cclxuXHJcblx0cmFuZG9tWDogLT5cclxuXHRcdEJ1LnJhbmQgTUFSR0lOLCBAcmFuZ2VXaWR0aCAtIE1BUkdJTiAqIDJcclxuXHJcblx0cmFuZG9tWTogLT5cclxuXHRcdEJ1LnJhbmQgTUFSR0lOLCBAcmFuZ2VIZWlnaHQgLSBNQVJHSU4gKiAyXHJcblxyXG5cdHJhbmRvbVJhZGl1czogLT5cclxuXHRcdEJ1LnJhbmQgNSwgTWF0aC5taW4oQHJhbmdlV2lkdGgsIEByYW5nZUhlaWdodCkgLyAyXHJcblxyXG5cdHNldFJhbmdlOiAodywgaCkgLT5cclxuXHRcdEByYW5nZVdpZHRoID0gd1xyXG5cdFx0QHJhbmdlSGVpZ2h0ID0gaFxyXG5cclxuXHRnZW5lcmF0ZTogKHR5cGUpIC0+XHJcblx0XHRzd2l0Y2ggdHlwZVxyXG5cdFx0XHR3aGVuICdjaXJjbGUnIHRoZW4gQGdlbmVyYXRlQ2lyY2xlKClcclxuXHRcdFx0d2hlbiAnYm93JyB0aGVuIEBnZW5lcmF0ZUJvdygpXHJcblx0XHRcdHdoZW4gJ3RyaWFuZ2xlJyB0aGVuIEBnZW5lcmF0ZVRyaWFuZ2xlKClcclxuXHRcdFx0d2hlbiAncmVjdGFuZ2xlJyB0aGVuIEBnZW5lcmF0ZVJlY3RhbmdsZSgpXHJcblx0XHRcdHdoZW4gJ2ZhbicgdGhlbiBAZ2VuZXJhdGVGYW4oKVxyXG5cdFx0XHR3aGVuICdwb2x5Z29uJyB0aGVuIEBnZW5lcmF0ZVBvbHlnb24oKVxyXG5cdFx0XHR3aGVuICdsaW5lJyB0aGVuIEBnZW5lcmF0ZUxpbmUoKVxyXG5cdFx0XHR3aGVuICdwb2x5bGluZScgdGhlbiBAZ2VuZXJhdGVQb2x5bGluZSgpXHJcblx0XHRcdGVsc2UgY29uc29sZS53YXJuICdub3Qgc3VwcG9ydCBzaGFwZTogJyArIHR5cGVcclxuXHRcdEByYW5nZUhlaWdodCA9IGhcclxuXHJcblx0cmFuZG9taXplOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBCdS5pc0FycmF5IHNoYXBlXHJcblx0XHRcdEByYW5kb21pemUgcyBmb3IgcyBpbiBzaGFwZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRzd2l0Y2ggc2hhcGUudHlwZVxyXG5cdFx0XHRcdHdoZW4gJ0NpcmNsZScgdGhlbiBAcmFuZG9taXplQ2lyY2xlIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnRWxsaXBzZScgdGhlbiBAcmFuZG9taXplRWxsaXBzZSBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ0JvdycgdGhlbiBAcmFuZG9taXplQm93IHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnVHJpYW5nbGUnIHRoZW4gQHJhbmRvbWl6ZVRyaWFuZ2xlIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnUmVjdGFuZ2xlJyB0aGVuIEByYW5kb21pemVSZWN0YW5nbGUgc2hhcGVcclxuXHRcdFx0XHR3aGVuICdGYW4nIHRoZW4gQHJhbmRvbWl6ZUZhbiBzaGFwZVxyXG5cdFx0XHRcdHdoZW4gJ1BvbHlnb24nIHRoZW4gQHJhbmRvbWl6ZVBvbHlnb24gc2hhcGVcclxuXHRcdFx0XHR3aGVuICdMaW5lJyB0aGVuIEByYW5kb21pemVMaW5lIHNoYXBlXHJcblx0XHRcdFx0d2hlbiAnUG9seWxpbmUnIHRoZW4gQHJhbmRvbWl6ZVBvbHlsaW5lIHNoYXBlXHJcblx0XHRcdFx0ZWxzZSBjb25zb2xlLndhcm4gJ25vdCBzdXBwb3J0IHNoYXBlOiAnICsgc2hhcGUudHlwZVxyXG5cclxuXHRyYW5kb21pemVQb3NpdGlvbjogKHNoYXBlKSAtPlxyXG5cdFx0c2hhcGUucG9zaXRpb24ueCA9IEByYW5kb21YKClcclxuXHRcdHNoYXBlLnBvc2l0aW9uLnkgPSBAcmFuZG9tWSgpXHJcblx0XHRzaGFwZS50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZUNpcmNsZTogLT5cclxuXHRcdGNpcmNsZSA9IG5ldyBCdS5DaXJjbGUgQHJhbmRvbVJhZGl1cygpLCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRjaXJjbGUuY2VudGVyLmxhYmVsID0gJ08nXHJcblx0XHRjaXJjbGVcclxuXHJcblx0cmFuZG9taXplQ2lyY2xlOiAoY2lyY2xlKSAtPlxyXG5cdFx0Y2lyY2xlLmN4ID0gQHJhbmRvbVgoKVxyXG5cdFx0Y2lyY2xlLmN5ID0gQHJhbmRvbVkoKVxyXG5cdFx0Y2lyY2xlLnJhZGl1cyA9IEByYW5kb21SYWRpdXMoKVxyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZUVsbGlwc2U6IC0+XHJcblx0XHRlbGxpcHNlID0gbmV3IEJ1LkVsbGlwc2UgQHJhbmRvbVJhZGl1cygpLCBAcmFuZG9tUmFkaXVzKClcclxuXHRcdEByYW5kb21pemVQb3NpdGlvbiBlbGxpcHNlXHJcblx0XHRlbGxpcHNlXHJcblxyXG5cdHJhbmRvbWl6ZUVsbGlwc2U6IChlbGxpcHNlKSAtPlxyXG5cdFx0ZWxsaXBzZS5yYWRpdXNYID0gQHJhbmRvbVJhZGl1cygpXHJcblx0XHRlbGxpcHNlLnJhZGl1c1kgPSBAcmFuZG9tUmFkaXVzKClcclxuXHRcdEByYW5kb21pemVQb3NpdGlvbiBlbGxpcHNlXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlQm93OiAtPlxyXG5cdFx0YUZyb20gPSBCdS5yYW5kIEJ1LlRXT19QSVxyXG5cdFx0YVRvID0gYUZyb20gKyBCdS5yYW5kIEJ1LkhBTEZfUEksIEJ1LlRXT19QSVxyXG5cclxuXHRcdGJvdyA9IG5ldyBCdS5Cb3cgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSwgQHJhbmRvbVJhZGl1cygpLCBhRnJvbSwgYVRvXHJcblx0XHRib3cuc3RyaW5nLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0Ym93LnN0cmluZy5wb2ludHNbMV0ubGFiZWwgPSAnQidcclxuXHRcdGJvd1xyXG5cclxuXHRyYW5kb21pemVCb3c6IChib3cpIC0+XHJcblx0XHRhRnJvbSA9IEJ1LnJhbmQgQnUuVFdPX1BJXHJcblx0XHRhVG8gPSBhRnJvbSArIEJ1LnJhbmQgQnUuSEFMRl9QSSwgQnUuVFdPX1BJXHJcblxyXG5cdFx0Ym93LmN4ID0gQHJhbmRvbVgoKVxyXG5cdFx0Ym93LmN5ID0gQHJhbmRvbVkoKVxyXG5cdFx0Ym93LnJhZGl1cyA9IEByYW5kb21SYWRpdXMoKVxyXG5cdFx0Ym93LmFGcm9tID0gYUZyb21cclxuXHRcdGJvdy5hVG8gPSBhVG9cclxuXHRcdGJvdy50cmlnZ2VyICdjaGFuZ2VkJ1xyXG5cdFx0QFxyXG5cclxuXHRnZW5lcmF0ZUZhbjogLT5cclxuXHRcdGFGcm9tID0gQnUucmFuZCBCdS5UV09fUElcclxuXHRcdGFUbyA9IGFGcm9tICsgQnUucmFuZCBCdS5IQUxGX1BJLCBCdS5UV09fUElcclxuXHJcblx0XHRmYW4gPSBuZXcgQnUuRmFuIEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21SYWRpdXMoKSwgYUZyb20sIGFUb1xyXG5cdFx0ZmFuLmNlbnRlci5sYWJlbCA9ICdPJ1xyXG5cdFx0ZmFuLnN0cmluZy5wb2ludHNbMF0ubGFiZWwgPSAnQSdcclxuXHRcdGZhbi5zdHJpbmcucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHRmYW5cclxuXHJcblx0cmFuZG9taXplRmFuOiBAOjpyYW5kb21pemVCb3dcclxuXHJcblx0Z2VuZXJhdGVUcmlhbmdsZTogLT5cclxuXHRcdHBvaW50cyA9IFtdXHJcblx0XHRmb3IgaSBpbiBbMC4uMl1cclxuXHRcdFx0cG9pbnRzW2ldID0gbmV3IEJ1LlBvaW50IEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHJcblx0XHR0cmlhbmdsZSA9IG5ldyBCdS5UcmlhbmdsZSBwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdXHJcblx0XHR0cmlhbmdsZS5wb2ludHNbMF0ubGFiZWwgPSAnQSdcclxuXHRcdHRyaWFuZ2xlLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0dHJpYW5nbGUucG9pbnRzWzJdLmxhYmVsID0gJ0MnXHJcblx0XHR0cmlhbmdsZVxyXG5cclxuXHRyYW5kb21pemVUcmlhbmdsZTogKHRyaWFuZ2xlKSAtPlxyXG5cdFx0dHJpYW5nbGUucG9pbnRzW2ldLnNldCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpIGZvciBpIGluIFswLi4yXVxyXG5cdFx0dHJpYW5nbGUudHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVSZWN0YW5nbGU6IC0+XHJcblx0XHRyZWN0ID0gbmV3IEJ1LlJlY3RhbmdsZShcclxuXHRcdFx0QnUucmFuZChAcmFuZ2VXaWR0aClcclxuXHRcdFx0QnUucmFuZChAcmFuZ2VIZWlnaHQpXHJcblx0XHRcdEJ1LnJhbmQoQHJhbmdlV2lkdGggLyAyKVxyXG5cdFx0XHRCdS5yYW5kKEByYW5nZUhlaWdodCAvIDIpXHJcblx0XHQpXHJcblx0XHRyZWN0LnBvaW50TFQubGFiZWwgPSAnQSdcclxuXHRcdHJlY3QucG9pbnRSVC5sYWJlbCA9ICdCJ1xyXG5cdFx0cmVjdC5wb2ludFJCLmxhYmVsID0gJ0MnXHJcblx0XHRyZWN0LnBvaW50TEIubGFiZWwgPSAnRCdcclxuXHRcdHJlY3RcclxuXHJcblx0cmFuZG9taXplUmVjdGFuZ2xlOiAocmVjdGFuZ2xlKSAtPlxyXG5cdFx0cmVjdGFuZ2xlLnNldCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRyZWN0YW5nbGUudHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVQb2x5Z29uOiAtPlxyXG5cdFx0cG9pbnRzID0gW11cclxuXHJcblx0XHRmb3IgaSBpbiBbMC4uM11cclxuXHRcdFx0cG9pbnQgPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cdFx0XHRwb2ludC5sYWJlbCA9ICdQJyArIGlcclxuXHRcdFx0cG9pbnRzLnB1c2ggcG9pbnRcclxuXHJcblx0XHRuZXcgQnUuUG9seWdvbiBwb2ludHNcclxuXHJcblx0cmFuZG9taXplUG9seWdvbjogKHBvbHlnb24pIC0+XHJcblx0XHR2ZXJ0ZXguc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCkgZm9yIHZlcnRleCBpbiBwb2x5Z29uLnZlcnRpY2VzXHJcblx0XHRwb2x5Z29uLnRyaWdnZXIgJ2NoYW5nZWQnXHJcblx0XHRAXHJcblxyXG5cdGdlbmVyYXRlTGluZTogLT5cclxuXHRcdGxpbmUgPSBuZXcgQnUuTGluZSBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRsaW5lLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0bGluZS5wb2ludHNbMV0ubGFiZWwgPSAnQidcclxuXHRcdGxpbmVcclxuXHJcblx0cmFuZG9taXplTGluZTogKGxpbmUpIC0+XHJcblx0XHRwb2ludC5zZXQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSBmb3IgcG9pbnQgaW4gbGluZS5wb2ludHNcclxuXHRcdGxpbmUudHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuXHJcblx0Z2VuZXJhdGVQb2x5bGluZTogLT5cclxuXHRcdHBvbHlsaW5lID0gbmV3IEJ1LlBvbHlsaW5lXHJcblx0XHRmb3IgaSBpbiBbMC4uM11cclxuXHRcdFx0cG9pbnQgPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cdFx0XHRwb2ludC5sYWJlbCA9ICdQJyArIGlcclxuXHRcdFx0cG9seWxpbmUuYWRkUG9pbnQgcG9pbnRcclxuXHRcdHBvbHlsaW5lXHJcblxyXG5cdHJhbmRvbWl6ZVBvbHlsaW5lOiAocG9seWxpbmUpIC0+XHJcblx0XHR2ZXJ0ZXguc2V0IEByYW5kb21YKCksIEByYW5kb21ZKCkgZm9yIHZlcnRleCBpbiBwb2x5bGluZS52ZXJ0aWNlc1xyXG5cdFx0cG9seWxpbmUudHJpZ2dlciAnY2hhbmdlZCdcclxuXHRcdEBcclxuIl19

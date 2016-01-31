// Generated by CoffeeScript 1.10.0
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
    this.x = x;
    this.y = y;
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
    this.setContextAlign(this.align);
  }

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

//# sourceMappingURL=PointText.js.map

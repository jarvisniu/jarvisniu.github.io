// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bu.Image = (function(superClass) {
  extend(Image, superClass);

  function Image(url, x, y, width, height) {
    this.url = url;
    Image.__super__.constructor.call(this);
    this.type = 'Image';
    this.autoSize = true;
    this.size = new Bu.Size(Bu.DEFAULT_IMAGE_SIZE, Bu.DEFAULT_IMAGE_SIZE);
    this.translate = new Bu.Vector(x, y);
    this.center = new Bu.Vector(x + width / 2, y + height / 2);
    if (width != null) {
      this.size.set(width, height);
      this.autoSize = false;
    }
    this.pivot = new Bu.Vector(0.5, 0.5);
    this.image = new window.Image;
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

//# sourceMappingURL=Image.js.map

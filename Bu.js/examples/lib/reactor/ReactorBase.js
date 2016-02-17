// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Bu.ReactorBase = (function() {
  function ReactorBase() {
    this._onMouseUp = bind(this._onMouseUp, this);
    this._onMouseMove = bind(this._onMouseMove, this);
    this._onMouseDown = bind(this._onMouseDown, this);
    this.enabled = false;
  }

  ReactorBase.prototype.enable = function() {
    this.addListeners();
    return this.enabled = true;
  };

  ReactorBase.prototype.disable = function() {
    this.removeListeners();
    return this.enabled = false;
  };

  ReactorBase.prototype._onMouseDown = function(e) {
    return typeof this.onMouseDown === "function" ? this.onMouseDown(this.renderer.processArgs(e)) : void 0;
  };

  ReactorBase.prototype._onMouseMove = function(e) {
    return typeof this.onMouseMove === "function" ? this.onMouseMove(this.renderer.processArgs(e)) : void 0;
  };

  ReactorBase.prototype._onMouseUp = function(e) {
    return typeof this.onMouseUp === "function" ? this.onMouseUp(this.renderer.processArgs(e)) : void 0;
  };

  ReactorBase.prototype.addListeners = function() {
    this.renderer.dom.addEventListener('mousedown', this._onMouseDown);
    this.renderer.dom.addEventListener('mousemove', this._onMouseMove);
    return this.renderer.dom.addEventListener('mouseup', this._onMouseUp);
  };

  ReactorBase.prototype.removeListeners = function() {
    this.renderer.dom.removeEventListener('mousedown', this._onMouseDown);
    this.renderer.dom.removeEventListener('mousemove', this._onMouseMove);
    return this.renderer.dom.removeEventListener('mouseup', this._onMouseUp);
  };

  return ReactorBase;

})();

//# sourceMappingURL=ReactorBase.js.map

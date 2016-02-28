(function() {
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
      return typeof this.onMouseDown === "function" ? this.onMouseDown(e) : void 0;
    };

    ReactorBase.prototype._onMouseMove = function(e) {
      return typeof this.onMouseMove === "function" ? this.onMouseMove(e) : void 0;
    };

    ReactorBase.prototype._onMouseUp = function(e) {
      return typeof this.onMouseUp === "function" ? this.onMouseUp(e) : void 0;
    };

    ReactorBase.prototype.addListeners = function() {
      this.bu.dom.addEventListener('mousedown', this._onMouseDown);
      this.bu.dom.addEventListener('mousemove', this._onMouseMove);
      return this.bu.dom.addEventListener('mouseup', this._onMouseUp);
    };

    ReactorBase.prototype.removeListeners = function() {
      this.bu.dom.removeEventListener('mousedown', this._onMouseDown);
      this.bu.dom.removeEventListener('mousemove', this._onMouseMove);
      return this.bu.dom.removeEventListener('mouseup', this._onMouseUp);
    };

    return ReactorBase;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0b3IvUmVhY3RvckJhc2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBQUEsTUFBQTs7RUFBTSxFQUFFLENBQUM7SUFFSyxxQkFBQTs7OztNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFEQzs7MEJBR2IsTUFBQSxHQUFRLFNBQUE7TUFDUCxJQUFDLENBQUEsWUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUZKOzswQkFJUixPQUFBLEdBQVMsU0FBQTtNQUNSLElBQUMsQ0FBQSxlQUFELENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO0lBRkg7OzBCQUlULFlBQUEsR0FBYyxTQUFDLENBQUQ7c0RBQ2IsSUFBQyxDQUFBLFlBQWE7SUFERDs7MEJBR2QsWUFBQSxHQUFjLFNBQUMsQ0FBRDtzREFDYixJQUFDLENBQUEsWUFBYTtJQUREOzswQkFHZCxVQUFBLEdBQVksU0FBQyxDQUFEO29EQUNYLElBQUMsQ0FBQSxVQUFXO0lBREQ7OzBCQUdaLFlBQUEsR0FBYyxTQUFBO01BQ2IsSUFBQyxDQUFBLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsV0FBekIsRUFBc0MsSUFBQyxDQUFBLFlBQXZDO01BQ0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsV0FBekIsRUFBc0MsSUFBQyxDQUFBLFlBQXZDO2FBQ0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBQyxDQUFBLFVBQXJDO0lBSGE7OzBCQUtkLGVBQUEsR0FBaUIsU0FBQTtNQUNoQixJQUFDLENBQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBUixDQUE0QixXQUE1QixFQUF5QyxJQUFDLENBQUEsWUFBMUM7TUFDQSxJQUFDLENBQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBUixDQUE0QixXQUE1QixFQUF5QyxJQUFDLENBQUEsWUFBMUM7YUFDQSxJQUFDLENBQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBUixDQUE0QixTQUE1QixFQUF1QyxJQUFDLENBQUEsVUFBeEM7SUFIZ0I7Ozs7O0FBM0JsQiIsImZpbGUiOiJyZWFjdG9yL1JlYWN0b3JCYXNlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBtb3ZlIGEgcG9pbnQgYnkgZHJhZ2dpbmcgaXRcclxuXHJcbmNsYXNzIEJ1LlJlYWN0b3JCYXNlXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAtPlxyXG5cdFx0QGVuYWJsZWQgPSBmYWxzZVxyXG5cclxuXHRlbmFibGU6IC0+XHJcblx0XHRAYWRkTGlzdGVuZXJzKClcclxuXHRcdEBlbmFibGVkID0gdHJ1ZVxyXG5cclxuXHRkaXNhYmxlOiAtPlxyXG5cdFx0QHJlbW92ZUxpc3RlbmVycygpXHJcblx0XHRAZW5hYmxlZCA9IGZhbHNlXHJcblxyXG5cdF9vbk1vdXNlRG93bjogKGUpID0+XHJcblx0XHRAb25Nb3VzZURvd24/IGVcclxuXHJcblx0X29uTW91c2VNb3ZlOiAoZSkgPT5cclxuXHRcdEBvbk1vdXNlTW92ZT8gZVxyXG5cclxuXHRfb25Nb3VzZVVwOiAoZSkgPT5cclxuXHRcdEBvbk1vdXNlVXA/IGVcclxuXHJcblx0YWRkTGlzdGVuZXJzOiAtPlxyXG5cdFx0QGJ1LmRvbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCBAX29uTW91c2VEb3duXHJcblx0XHRAYnUuZG9tLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsIEBfb25Nb3VzZU1vdmVcclxuXHRcdEBidS5kb20uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBfb25Nb3VzZVVwXHJcblxyXG5cdHJlbW92ZUxpc3RlbmVyczogLT5cclxuXHRcdEBidS5kb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgQF9vbk1vdXNlRG93blxyXG5cdFx0QGJ1LmRvbS5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBAX29uTW91c2VNb3ZlXHJcblx0XHRAYnUuZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCBAX29uTW91c2VVcFxyXG4iXX0=

// Generated by CoffeeScript 1.10.0
Bu.RandomShapeGenerator = (function() {
  var MARGIN;

  MARGIN = 30;

  function RandomShapeGenerator(renderer) {
    this.renderer = renderer;
  }

  RandomShapeGenerator.prototype.randomX = function() {
    return Bu.rand(MARGIN, this.renderer.width - MARGIN * 2);
  };

  RandomShapeGenerator.prototype.randomY = function() {
    return Bu.rand(MARGIN, this.renderer.height - MARGIN * 2);
  };

  RandomShapeGenerator.prototype.randomRadius = function() {
    return Bu.rand(5, Math.min(this.renderer.width, this.renderer.height) / 2);
  };

  RandomShapeGenerator.prototype.generateCircle = function() {
    var circle;
    circle = new Bu.Circle(this.randomX(), this.randomY(), this.randomRadius());
    circle.center.label = "O";
    return circle;
  };

  RandomShapeGenerator.prototype.generateBow = function() {
    var aFrom, aTo, bow;
    aFrom = Bu.rand(Math.PI * 2);
    aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
    bow = new Bu.Bow(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
    bow.string.points[0].label = "A";
    bow.string.points[1].label = "B";
    return bow;
  };

  RandomShapeGenerator.prototype.generateTriangle = function() {
    var i, j, points, triangle;
    points = [];
    for (i = j = 0; j <= 2; i = ++j) {
      points[i] = new Bu.Point(this.randomX(), this.randomY());
    }
    triangle = new Bu.Triangle(points[0], points[1], points[2]);
    triangle.points[0].label = "A";
    triangle.points[1].label = "B";
    triangle.points[2].label = "C";
    return triangle;
  };

  RandomShapeGenerator.prototype.generateRectangle = function() {
    return new Bu.Rectangle(Bu.rand(this.renderer.width), Bu.rand(this.renderer.height), Bu.rand(this.renderer.width / 2), Bu.rand(this.renderer.height / 2));
  };

  RandomShapeGenerator.prototype.generateFan = function() {
    var aFrom, aTo, fan;
    aFrom = Bu.rand(Math.PI * 2);
    aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
    fan = new Bu.Fan(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
    fan.string.points[0].label = "A";
    fan.string.points[1].label = "B";
    return fan;
  };

  RandomShapeGenerator.prototype.generatePolygon = function() {
    var i, j, point, points;
    points = [];
    for (i = j = 0; j <= 3; i = ++j) {
      point = new Bu.Point(this.randomX(), this.randomY());
      point.label = "P" + i;
      points.push(point);
    }
    return new Bu.Polygon(points);
  };

  RandomShapeGenerator.prototype.generateLine = function() {
    return new Bu.Line(this.randomX(), this.randomY(), this.randomX(), this.randomY());
  };

  RandomShapeGenerator.prototype.generatePolyline = function() {
    var i, j, polyline;
    polyline = new Bu.Polyline;
    for (i = j = 0; j <= 3; i = ++j) {
      polyline.addPoint(new Bu.Point(this.randomX(), this.randomY()));
    }
    return polyline;
  };

  return RandomShapeGenerator;

})();

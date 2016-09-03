(function() {
// A composite projection for the United States, configured by default for
// 960×500. Also works quite well at 960×600 with scale 1285. The set of
// standard parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
d3.geo.albersCompositeUsa = function() {

  // American Samoa
  // Guam
  // Northern Mariana Islands
  // Puerto Rico
  // U.S. Virgin Islands

  var lower48 = d3.geo.albers();

  // EPSG:3338
  var alaska = d3.geo.conicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]);

  // ESRI:102007
  var hawaii = d3.geo.conicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]);

  // EPSG:2155
  var americanSamoa = d3.geo.conicConformal() // Lambert
      .rotate([157, 0])
      .center([170, -14.26666666666667])
      .parallels([-24, -14]);

  var point;
  var pointStream = {point: function(x, y) { point = [x, y]; }};
  var lower48Point;
  var alaskaPoint;
  var hawaiiPoint;

  function albersUsa(coordinates) {
    /*jshint -W030 */
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (lower48Point(x, y), point) ||
        (alaskaPoint(x, y), point) ||
        hawaiiPoint(x, y);
        return point;
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert(coordinates);
  };

  // A naïve multi-projection stream.
  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  albersUsa.stream = function(stream) {
    var lower48Stream = lower48.stream(stream);
    var alaskaStream = alaska.stream(stream);
    var hawaiiStream = hawaii.stream(stream);
    var americanSamoaStream = americanSamoa.stream(stream);
    return {
      point: function(x, y) {
        lower48Stream.point(x, y);
        alaskaStream.point(x, y);
        hawaiiStream.point(x, y);
        americanSamoaStream.point(x, y);
      },
      sphere: function() {
        lower48Stream.sphere();
        alaskaStream.sphere();
        hawaiiStream.sphere();
        americanSamoaStream.sphere();
      },
      lineStart: function() {
        lower48Stream.lineStart();
        alaskaStream.lineStart();
        hawaiiStream.lineStart();
        americanSamoaStream.lineStart();
      },
      lineEnd: function() {
        lower48Stream.lineEnd();
        alaskaStream.lineEnd();
        hawaiiStream.lineEnd();
        americanSamoaStream.lineEnd();
      },
      polygonStart: function() {
        lower48Stream.polygonStart();
        alaskaStream.polygonStart();
        hawaiiStream.polygonStart();
        americanSamoaStream.polygonStart();
      },
      polygonEnd: function() {
        lower48Stream.polygonEnd();
        alaskaStream.polygonEnd();
        hawaiiStream.polygonEnd();
        americanSamoaStream.polygonEnd();
      }
    };
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    americanSamoa.precision(_);
    return albersUsa;
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_);
    alaska.scale(_ * 0.35);
    hawaii.scale(_);
    americanSamoa.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    var ε = 1*10E-6;
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream).point;

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + ε, y + 0.120 * k + ε], [x - 0.214 * k - ε, y + 0.234 * k - ε]])
        .stream(pointStream).point;

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.4 * k]) // 0.212
        .clipExtent([[x - 0.214 * k + ε, y + 0.166 * k + ε], [x - 0.115 * k - ε, y + 0.234 * k - ε]])
        .stream(pointStream).point;

    americanSamoaPoint = americanSamoa
        .translate([x - 0 * k, y + 0.212 * k])
        .clipExtent([[x - 0.115 * k + ε, y + 0.166 * k + ε], [x - 0 * k - ε, y + 0.234 * k - ε]])
        .stream(pointStream).point;   

    return albersUsa;
  };
  albersUsa.getCompositionBorders = function() {
    var hawaii1 = lower48([-102.91, 26.3]);
    var hawaii2 = lower48([-104.0, 27.5]);
    var hawaii3 = lower48([-108.0, 29.1]);
    var hawaii4 = lower48([-110.0, 29.1]);

    var alaska1 = lower48([-110.0, 26.7]);
    var alaska2 = lower48([-112.8, 27.6]);
    var alaska3 = lower48([-114.3, 30.6]);
    var alaska4 = lower48([-119.3, 30.1]);

    var americanSamoa1 = lower48([-127.49999999975, 29.3]);
    var americanSamoa2 = lower48([-126, 29.4]);
    var americanSamoa3 = lower48([-123.7, 27.6]);
    var americanSamoa4 = lower48([-123.7, 26.1]);

    return "M"+hawaii1[0]+" "+hawaii1[1]+"L"+hawaii2[0]+" "+hawaii2[1]+
      "L"+hawaii3[0]+" "+hawaii3[1]+"L"+hawaii4[0]+" "+hawaii4[1]+
      "M"+americanSamoa1[0]+" "+americanSamoa1[1]+"L"+americanSamoa2[0]+" "+americanSamoa2[1]+
      "L"+americanSamoa3[0]+" "+americanSamoa3[1]+"L"+americanSamoa4[0]+" "+americanSamoa4[1]+
      "M"+alaska1[0]+" "+alaska1[1]+"L"+alaska2[0]+" "+alaska2[1]+
      "L"+alaska3[0]+" "+alaska3[1]+"L"+alaska4[0]+" "+alaska4[1];
  };

  return albersUsa.scale(1070);
};


})();

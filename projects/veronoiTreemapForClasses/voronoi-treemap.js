//begin: constants
var _2PI = 2*Math.PI;
//end: constants
//begin: layout conf.
var svgWidth = 900,
    svgHeight = 725,
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    height = svgHeight - margin.top - margin.bottom,
    width = svgWidth - margin.left - margin.right,
    halfWidth = width/2,
    halfHeight = height/2,
    quarterWidth = width/4,
    quarterHeight = height/4,
    titleY = 20,
    legendsMinY = height - 20,
    treemapRadius = 325,
    treemapCenter = [halfWidth, halfHeight-30];
//end: layout conf.

//begin: treemap conf.
var _voronoiTreemap = d3.voronoiTreemap();
var hierarchy, circlingPolygon;
//end: treemap conf.

//begin: drawing conf.
var fontScale = d3.scaleLinear();
//end: drawing conf.

//begin: reusable d3Selection
var svg, drawingArea, treemapContainer;
//end: reusable d3Selection

d3.json("https://cdn.jsdelivr.net/gh/Evans-Brian/Website/projects/veronoiTreemapForClasses/classes.json", function(error, rootData) {
  if (error) throw error;

  initData();
  initLayout(rootData);

  hierarchy = d3.hierarchy(rootData).sum(function(d){ return d.weight; });
  _voronoiTreemap
    .clip(circlingPolygon)
    (hierarchy);

  drawTreemap(hierarchy);
});

function initData(rootData) {
  circlingPolygon = computeCirclingPolygon(treemapRadius);
  fontScale.domain([12, 20]).range([12.5, 20]).clamp(true);
}

function computeCirclingPolygon(radius) {
  var points = 100,
      increment = _2PI/points,
      circlingPolygon = [];

  for (var a=0, i=0; i<points; i++, a+=increment) {
    circlingPolygon.push(
      [radius + radius*Math.cos(a), radius + radius*Math.sin(a)]
    )
  }

  return circlingPolygon;
};

function initLayout(rootData) {
  svg = d3.select("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  drawingArea = svg.append("g")
    .classed("drawingArea", true)
    .attr("transform", "translate("+[margin.left,margin.top]+")");

  treemapContainer = drawingArea.append("g")
    .classed("treemap-container", true)
    .attr("transform", "translate("+treemapCenter+")");

  treemapContainer.append("path")
    .classed("world", true)
    .attr("transform", "translate("+[-treemapRadius,-treemapRadius]+")")
    .attr("d", "M"+circlingPolygon.join(",")+"Z");

  drawTitle();
  drawFooter();
  drawLegends(rootData);
}

function drawTitle() {
  drawingArea.append("text")
    .attr("id", "title")
    .attr("transform", "translate("+[halfWidth, titleY]+")")
    .attr("text-anchor", "middle")
}

function drawFooter() {
  drawingArea.append("text")
    .classed("tiny light", true)
    .attr("transform", "translate("+[halfWidth*.2, height]+")")
    .attr("text-anchor", "middle")
    .text("Click Class for Link to Page")
  drawingArea.append("text")
    .classed("tiny light", true)
    .attr("transform", "translate("+[width, height]+")")
    .attr("text-anchor", "end")
    .text("bl.ocks.org/Kcnarf/fa95aa7b076f537c00aed614c29bb568")
}

function drawLegends(rootData) {
  var legendHeight = 13,
      interLegend = 4,
      colorWidth = legendHeight*6,
      AreasOfStudy = rootData.children.reverse();

  var legendContainer = drawingArea.append("g")
    .classed("legend", true)
    .attr("transform", "translate("+[0, legendsMinY]+")");

  var legends = legendContainer.selectAll(".legend")
    .data(AreasOfStudy)
    .enter();

  var legend = legends.append("g")
    .classed("legend", true)
    .attr("transform", function(d,i){
      return "translate("+[0, -i*(legendHeight+interLegend)]+")";
    })

  legend.append("rect")
    .classed("legend-color", true)
    .attr("y", -legendHeight)
    .attr("width", colorWidth*.8)
    .attr("height", legendHeight)
    .style("fill", function(d){ return d.color; });
  legend.append("text")
    .classed("tiny", true)
    .attr("transform", "translate("+[colorWidth*.8+5, -2]+")")
    .text(function(d){ return d.name; });

  legendContainer.append("text")
    .attr("transform", "translate("+[0, -AreasOfStudy.length*(legendHeight+interLegend)-5]+")")
    .text("Areas of Study");
}

function drawTreemap(hierarchy) {
  var leaves=hierarchy.leaves();

  var cells = treemapContainer.append("g")
    .classed('cells', true)
    .attr("transform", "translate("+[-treemapRadius,-treemapRadius]+")")
    .selectAll(".cell")
    .data(leaves)
    .enter()
      .append("path")
        .classed("cell", true)
        .attr("d", function(d){ return "M"+d.polygon.join(",")+"z"; })
        .style("fill", function(d){
          return d.parent.data.color;
        });

  var labels = treemapContainer.append("g")
    .classed('labels', true)
    .attr("transform", "translate("+[-treemapRadius,-treemapRadius]+")")
    .selectAll(".label")
    .data(leaves)
    .enter()
      .append("g")
        .classed("label", true)
        .attr("transform", function(d){
          return "translate("+[d.polygon.site.x, d.polygon.site.y]+")";
        })
        .style("font-size", function(d){ return fontScale(d.data.weight); });

  labels.append("text")
    .classed("name1", true)
    .text(function(d){ return d.data.name1;});
  labels.append("text")
    .classed("name2", true)
    .text(function(d){ return d.data.name2;});

  var hoverers = treemapContainer.append("g")
    .classed('hoverers', true)
    .attr("transform", "translate("+[-treemapRadius,-treemapRadius]+")")
    .selectAll(".hoverer")
    .data(leaves)
    .enter()
      .append("path")
        .classed("hoverer", true)
        .attr("d", function(d){ return "M"+d.polygon.join(",")+"z"; });

    hoverers.on('click', function(d, i) {
      var url = d.data.url;
      window.open(url, '_blank');
      })

    hoverers.on('mouseover', function(d) {
      d3.select(this).style("cursor", "pointer");
  })


  hoverers.append("title")
    .text(function(d) { return d.value + " hours"; });

}

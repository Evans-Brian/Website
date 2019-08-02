// load csv file and create the chart
d3.csv('nfl_stats.csv', function(data) {
	data2 = data.filter(function(data) {
		return data["Class"] == "H";
	});

function MakeGraph(data2) { 
  var avg_array = [];
  data2.forEach(function(d, i){
    avg_array[i] = d["Avg"];
  });
  stat_max = d3.max(avg_array);
  stat_min = d3.min(avg_array);
  console.log(avg_array)
	var gradient = d3.scale.linear()
	  .domain([stat_min, stat_max])
	  .range(["#add8e6", "#00008b"]);

	var parcoords = d3.parcoords()("#example")
	  .color(function(d){
      if(d.Team == "CLE") { return "#FF7F00"}//#8B4513
      if(d.Team == "CIN") { return "#FB4F14"}
      else {return gradient(d.Avg);}
	  })
	  .alpha(function(d){
	  if(d.Team == "CLE") { return 1}
      if(d.Team == "CIN") { return 1}
      else {return .02}
      });


  parcoords
    .data(data2)
    .render()
    .brushMode("1D-axes");  // enable brushing

  // create data table, row hover highlighting
  var grid = d3.divgrid();
  d3.select("#grid")
    .datum(data2)
    .call(grid)
    .selectAll(".row")
    .on({
      "mouseover": function(d) { parcoords.highlight([d]) },
      "mouseout": parcoords.unhighlight
    });

  // update data table on brush event
  parcoords.on("brush", function(d) {
    d3.select("#grid")
      .datum(d)
      .call(grid)
      .selectAll(".row")
      .on({
        "mouseover": function(d) { parcoords.highlight([d]) },
        "mouseout": parcoords.unhighlight
      });
  });
  };
  //Initial Graph
  	MakeGraph(data2);

	//DropDownBoxes
  	var x = ['COMP', 'ATT-P', 'PCT', 'YDS-P','AVG-P','P-YDsPerGm','TD-P','INT','QBR', 'LNG'];
	var y = ['ATT-R', 'YDS-R','AVG-R','R-YDsPerGm','TD-R','BIG','FUM', 'FUML'];
	var dropdownChange = function() {
		d3.selectAll("#example > *").remove();
		var val = d3.select(this).property('value'),
		data1 = data.filter(function(d2) {
				return d2["Stat"] == val;
		});
		MakeGraph(data1);
	};
  var dropdown = d3.select("#vis-container")
		.insert("select", "svg")
		.on("change", dropdownChange);

	dropdown.selectAll("option")
		.data(x)
	  .enter().append("option")
		.attr("value", function (d) { return d; })
		.text(function (d) {
			return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
		});
  var dropdown2 = d3.select("#vis-container2")
	.insert("select", "svg")
	.on("change", dropdownChange);

dropdown2.selectAll("option")
	.data(y)
  .enter().append("option")
	.attr("value", function (d) { return d; })
	.text(function (d) {
		return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
	});
});
function createWeekPercentChart(input){
	d3.select("svg").remove();
	var data;
	$.getJSON("../countData/weekCounts-" + input.replace( /\s/g, '') + ".json", function(json){
	    data = json;

	var width = 1700;
	var height = 950;
	var margin = 325;
	var duration = 150;

	var lineOpacity = "1";
	var lineOpacityHover = "1";
	var otherLinesOpacityHover = "0.1";
	var lineStroke = "4px";
	var lineStrokeHover = "6.5px";

	var circleOpacity = '0.99';
	var otherCirclesOpacityOnHover = "0.1"
	var circleRadius = 3;
	var circleRadiusHover = 4;

	var active = false;

  Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}


	/* Format Data */
	var parseDate = d3.timeParse("%Y-%m-%W");
	data.forEach(function(d, i) {
		team = d.team;
		conference = d.conference;
		division = d.division;
	  d.values.forEach(function(d) {
	    d.id = i;
	    d.date = parseDate(d.date);
	    d.percent = d.percent;
			d.team = team;
			d.conference = conference;
			d.division = division;
	  });
	});

	// array of all percents for this timeframe. 
	// Used to find max value for axis
	var domain = []
	data.forEach(function(i){
		i.values.forEach(function(j){
			domain.push(parseInt(j.percent));
		});
	});

	/* Scale */
	var xScale = d3.scaleTime()
	  .domain(d3.extent(data[0].values, d => d.date))
	  .range([0, width-margin]);
	var yScale = d3.scaleLinear()
	  .domain([0, d3.max(domain)])
	  .range([height-margin, 0]);

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	/* Add SVG */
	var svg = d3.select("#chart").append("svg")
	  .attr("width", (width+margin)+"px")
	  .attr("height", (height+margin-200)+"px")
	  .append('g')
	  .attr("transform", `translate(${margin}, ${margin})`);
	  
	svg.append("text")
	  .attr("x", (width*.41))             
	  .attr("y", -150)
	  .attr("text-anchor", "middle")  
	  .style("font-size", "40px") 
	  .text(input + " Team Percentage of Mentions");

	/* Add line into SVG */
	var line = d3.line()
	  .x(d => xScale(d.date))
	  .y(d => yScale(d.percent))

	let lines = svg.append('g')
	  .attr('class', 'lines');
	lines.selectAll('.line-group')
	  .data(data).enter()
	  .append('g')
	  .attr('class', 'line-group')
	  .on("mouseover", function(d, i) {
	      svg.append("text")
					.attr("class", "title-text")
					.attr('font-size', '40px')
	        .style("fill", d.primaryColor)
	        .text(d.team)
	        .attr("text-anchor", "middle")
	        .attr("x", (width+margin)/2)
	        .attr("y", 350);
	    })
	  .on("mouseout", function(d) {
	      svg.select(".title-text")
	        .transition()
	        .duration(0)
	        .remove();
	    })
	  .append('path')
	  .attr('class', (d, i) => 'line path'+i)
	  .attr('team', (d, i) => d.team)
		.attr('conference', (d, i) => d.conference)
		.attr('division', (d, i) => d.division)
	  .attr('d', d => line(d.values))
	  .style('stroke', (d, i) => d.primaryColor)
	  .style('opacity', lineOpacity)
	  .on("mouseover", function(d) {
				if (!active){
		      d3.selectAll('.line')
							.style('opacity', otherLinesOpacityHover);
		      d3.selectAll('.circle')
							.style('opacity', otherCirclesOpacityOnHover);
					d3.selectAll('rect')
							.style('opacity', otherCirclesOpacityOnHover);
		      d3.select(this)
		        .style('opacity', lineOpacityHover)
		        .style("stroke-width", lineStrokeHover)
		        .style("cursor", "pointer");
						d3.selectAll("[team=" + d.team + "]")
								.style('opacity', lineOpacityHover);
				}
	    })
	  .on("mouseout", function(d) {
			if (!active){
	      d3.selectAll(".line")
						.style('opacity', lineOpacity);
	      d3.selectAll('.circle')
						.style('opacity', circleOpacity);
	      d3.select(this)
	        .style("stroke-width", lineStroke)
	        .style("cursor", "none")
					.selectAll(".text").remove();
				d3.selectAll("[conference]")
						.style('opacity', lineOpacityHover);
				}
	    });
	/* Add circles in the line */
  lines.selectAll("circle-group")
	  .data(data).enter()
	  .append("g")
	  .style("fill", (d, i) => d.secondaryColor)
	  .selectAll("circle")
	  .data(d => d.values).enter()
	  .append("g")
	  .on("mouseover", function(d) {
	      d3.select(this)
	        .style("cursor", "pointer")
	        .append("text")
	        .attr("class", "text")
	        .text(parseFloat(Math.round(`${d.percent}` * 100) / 100).toFixed(2)+ '%')
	        .attr("x", d => xScale(d.date)-25)
	        .attr("y", d => yScale(d.percent)-40);

				d3.select(this)
					.style("cursor", "pointer")
					.append("text")
					.attr("class", "text")
          //calculates week number of year

					.text(d.date.getWeek() + ", " + d.date.getFullYear())
					.attr("x", d => xScale(d.date)-55)
					.attr("y", d => yScale(d.percent)-15);

				if (!active){
					d3.selectAll('.line')
							.style('opacity', otherLinesOpacityHover);
					d3.selectAll('.circle')
							.style('opacity', otherCirclesOpacityOnHover);
					d3.selectAll('rect')
							.style('opacity', otherCirclesOpacityOnHover);
					d3.select(this)
						.style('opacity', lineOpacityHover)
						.style("stroke-width", lineStrokeHover)
						.style("cursor", "pointer");
						d3.selectAll("[team=" + d.team + "]")
								.style('opacity', lineOpacityHover);
				}
	    })
	  .on("mouseout", function(d) {
	      d3.select(this)
	        .style("cursor", "none")
	        .transition()
	        .duration(0)
	        .selectAll(".text").remove();
	      d3.select(this)
	        .transition()
	        .selectAll('rect').remove();

					if (!active){
						d3.selectAll(".line")
								.style('opacity', lineOpacity);
						d3.selectAll('.circle')
								.style('opacity', circleOpacity);
						d3.select(this)
							.style("stroke-width", lineStroke)
							.style("cursor", "none")
							.selectAll(".text").remove();
						d3.selectAll("[conference]")
								.style('opacity', lineOpacityHover);
						}
	    })
	  .append("circle")
	  .attr("class", d => 'circle circle' + d.id)
		.attr("team", d => d.team)
		.attr("conference", d => d.conference)
		.attr("division", d => d.division)
	  .attr("cx", d => xScale(d.date))
	  .attr("cy", d => yScale(d.percent))
	  .attr("r", circleRadius)
	  .style('opacity', circleOpacity)
	  .on("mouseover", function(d, i) {
				if (!active){
	        d3.selectAll('.line')
						.style('opacity', otherLinesOpacityHover);
	        d3.select('.path'+d.id)
						.style('opacity', lineOpacityHover)
	          .style("stroke-width", lineStrokeHover);
	        d3.selectAll('circle')
	  				.style('opacity', otherCirclesOpacityOnHover);
	        d3.selectAll('.circle'+d.id)
	  				.style('opacity', circleOpacity);
	        d3.select(this)
	          .transition()
	          .duration(0)
	          .attr("r", circleRadiusHover);
					}
	      })
	    .on("mouseout", function(d) {
				if (!active){
	        d3.selectAll('.line')
						.style('opacity', lineOpacity)
	          .style("stroke-width", lineStroke);
	        d3.selectAll('circle')
	  				.style('opacity', circleOpacity);
	        d3.select(this)
	          .transition()
	          .duration(0)
	          .attr("r", circleRadius);
					}
	      });


	/* Add Axis into SVG */
	var xAxis = d3.axisBottom(xScale).ticks(6);
	var yAxis = d3.axisLeft(yScale).ticks(10);


	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", `translate(0, ${height-margin})`)
	  .call(xAxis);

	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
	  .append('text')
	  .attr("y", 15)
	  .attr("transform", "rotate(-90)")
	  .attr("fill", "#000")
	  .text("Percentage of Total Mentions");


			x = width + 80
			y = 225

				for(var i = 0; i < data.length; i++) {
					data[i]['x'] = x
					data[i]['y'] = y

					if (i == data.length/2){
						x = width + 205
						y = 225
					}
					if (i => data.length/2){
						data[i]['x'] = x
						data[i]['y'] = y
					}
					y = y + 50
				}

			var svg = d3.select("svg");
			var teamLabels = svg.selectAll("teamLabel")
				.data(data)
				.enter()
				.append("rect")

			teamLabels.attr("x", d=>d['x'])
				.data(data)
				.attr("y", d=>d['y'])
				.attr("width", '118')
				.attr("height", "43")
				.attr('team', d=>d['team'])
				.attr('conference', d=>d['conference'])
				.attr('division', d=>d['division'])
				.attr('stroke', d=>d['secondaryColor'])
				.attr('stroke-width', 4)
				.style('fill', d=>d['primaryColor'])
				.on("click", function(d){
					active = true;
					if (!d3.select(this).classed("selected")){
						d3.select(this).classed("selected", true)
						d3.selectAll('.line')
							.style('opacity', otherLinesOpacityHover);
						d3.selectAll('.circle')
							.style('opacity', otherLinesOpacityHover);
						d3.selectAll('rect')
							.style('opacity', otherLinesOpacityHover);
						d3.select(this)
							d3.selectAll("[team=" + d.team + "]")
								  .attr("r", circleRadiusHover)
									.style('opacity', lineOpacityHover)
									.style("stroke-width", lineStrokeHover);
					}else{
						active = false;
						d3.select(this).classed("selected", false);
						d3.selectAll('.line')
							.style('opacity', lineOpacityHover)
							.style("stroke-width", lineStroke);
						d3.selectAll('.circle')
								.attr("r", circleRadius)
								.style('opacity', lineOpacityHover);
						d3.selectAll('rect')
								.style('opacity', lineOpacityHover);
						d3.select(this)
							d3.selectAll("[team=" + d.team + "]")
								.style("stroke-width", lineStroke);
							}
				})


				var teamLabelText = svg.selectAll("teamLabelText")
					.data(data)
					.enter()
					.append("text")

				teamLabelText.text(d=>d['team'])
					.attr('x', d=>d['x'] + 14)
					.attr('y', d=>d['y'] + 27)
					.attr('font-size', '19px')
					.attr('fill', 'white')
					.attr('conference', d=>d['conference'])
					.attr('division', d=>d['division'])
					.on("click", function(d){
						if (!d3.select(this).classed("selected") ){
							active = true;
							d3.select(this).classed("selected", true)
							d3.selectAll('.line')
								.style('opacity', otherLinesOpacityHover);
							d3.selectAll('.circle')
									.style('opacity', otherLinesOpacityHover);
							d3.selectAll('rect')
									.style('opacity', otherLinesOpacityHover);
							d3.select(this)
								d3.selectAll("[team=" + d.team + "]")
										.attr("r", circleRadiusHover)
										.style('opacity', lineOpacityHover)
										.style("stroke-width", lineStrokeHover);
						}else{
							active = false;
							d3.select(this).classed("selected", false);
							d3.selectAll('.line')
								.style('opacity', lineOpacityHover)
								.style("stroke-width", lineStroke);
							d3.selectAll('.circle')
									.style('opacity', lineOpacityHover)
									.attr("r", circleRadius);
							d3.selectAll('rect')
									.style('opacity', lineOpacityHover);
								d3.select(this)
									d3.selectAll("[team=" + d.team + "]")
										.style("stroke-width", lineStroke);
									}
					})

					var conferences = [{'conference': 'AFC', 'primaryColor': '#D2122E', 'secondaryColor': '#000000', 'x':70, 'y':340},
					{'conference': 'NFC', 'primaryColor': '#013369', 'secondaryColor': '#000000', 'x':70, 'y':640}]

					var svg = d3.select("svg");
					var conferenceLabels = svg.selectAll("conferenceLabel")
						.data(conferences)
						.enter()
						.append("rect")

					conferenceLabels.attr("x", d=>d['x'])
						.attr("y", d=>d['y'])
						.attr("width", '128')
						.attr("height", "49")
						.attr('stroke', d=>d['secondaryColor'])
						.attr('stroke-width', 4)
						.style('fill', d=>d['primaryColor'])
						.attr('conference', d=>d['conference'])
						.on("click", function(d){
							active = true;
							if (!d3.select(this).classed("selected") ){
								d3.select(this).classed("selected", true)
								d3.selectAll('.line')
									.style('opacity', otherLinesOpacityHover);
								d3.selectAll('.circle')
										.style('opacity', otherLinesOpacityHover);
								d3.selectAll('rect')
										.style('opacity', otherLinesOpacityHover);
								d3.select(this)
									d3.selectAll("[conference=" + d.conference + "]")
											.attr("r", circleRadiusHover)
											.style('opacity', lineOpacityHover)
											.style("stroke-width", lineStrokeHover);
							}else{
								active = false;
								d3.select(this).classed("selected", false);
								d3.selectAll('.line')
									.style('opacity', lineOpacityHover)
									.style("stroke-width", lineStroke);
								d3.selectAll('.circle')
									.attr("r", circleRadius)
									.style('opacity', lineOpacityHover);
								d3.selectAll('rect')
									.style('opacity', lineOpacityHover);
								d3.select(this)
									d3.selectAll("[conference=" + d.conference + "]")
										.style("stroke-width", lineStroke);
									}
						})

						var conferenceLabelsText = svg.selectAll("conferenceLabelText")
						  .data(conferences)
						  .enter()
						  .append("text")
						conferenceLabelsText.text(d=>d['conference'])
						  .attr('x', d=>d['x'] + 30)
						  .attr('y', d=>d['y'] + 35)
							.attr('font-size', '35px')
						  .attr('fill', 'black')
						  .attr('conference', d=>d['conference'])
						  .on("click", function(d){
						    if (!d3.select(this).classed("selected") ){
									active = true;
						      d3.select(this).classed("selected", true)
						      d3.selectAll('.line')
						        .style('opacity', otherLinesOpacityHover);
						      d3.selectAll('.circle')
						          .style('opacity', otherLinesOpacityHover);
						      d3.selectAll('rect')
						          .style('opacity', otherLinesOpacityHover);
						      d3.select(this)
						        d3.selectAll("[conference=" + d.conference + "]")
						            .style('opacity', lineOpacityHover)
												.attr("r", circleRadiusHover)
												.style("stroke-width", lineStrokeHover);
						    }else{
									active = false;
						      d3.select(this).classed("selected", false);
						      d3.selectAll('.line')
						        .style('opacity', lineOpacityHover)
						        .style("stroke-width", lineStroke);
						      d3.selectAll('.circle')
										.attr("r", circleRadius)
						      	.style('opacity', lineOpacityHover);
						      d3.selectAll('rect')
						        .style('opacity', lineOpacityHover);
									d3.select(this)
										d3.selectAll("[conference=" + d.conference + "]")
											.style("stroke-width", lineStroke);
						        }
						  })


						var divisions = [{'conference': 'AFC', 'division': 'AFCNorth', 'text': "North", 'primaryColor': '#D2122E', 'secondaryColor': '#D3D3D3', 'x':75, 'y':400},
						{'conference': 'AFC', 'division': 'AFCEast',  'text': "East", 'primaryColor': '#D2122E', 'secondaryColor': '#D3D3D3', 'x':140, 'y':450},
						{'conference': 'AFC', 'division': 'AFCSouth',  'text': "South", 'primaryColor': '#D2122E', 'secondaryColor': '#D3D3D3', 'x':75, 'y':500},
						{'conference': 'AFC', 'division': 'AFCWest',  'text': "West", 'primaryColor': '#D2122E', 'secondaryColor': '#D3D3D3', 'x':10, 'y':450},
						{'conference': 'NFC', 'division': 'NFCNorth',  'text': "North", 'primaryColor': '#013369', 'secondaryColor': '#D3D3D3', 'x':75, 'y':700},
						{'conference': 'NFC', 'division': 'NFCEast',  'text': "East", 'primaryColor': '#013369', 'secondaryColor': '#D3D3D3', 'x':140, 'y':750},
						{'conference': 'NFC', 'division': 'NFCSouth',  'text': "South", 'primaryColor': '#013369', 'secondaryColor': '#D3D3D3', 'x':75, 'y':800},
						{'conference': 'NFC', 'division': 'NFCWest',  'text': "West", 'primaryColor': '#013369', 'secondaryColor': '##D3D3D3', 'x':10, 'y':750},
				]

				var svg = d3.select("svg");
				var divisionLabels = svg.selectAll("divisionLabel")
				  .data(divisions)
				  .enter()
				  .append("rect")

				divisionLabels.attr("x", d=>d['x'])
				  .data(divisions)
				  .attr("y", d=>d['y'])
				  .attr("width", '118')
				  .attr("height", "43")
				  .attr('stroke', d=>d['secondaryColor'])
				  .attr('stroke-width', 4)
				  .style('fill', d=>d['primaryColor'])
					.attr('conference', d=>d['conference'])
					.attr('division', d=>d['division'])
					.on("click", function(d){
						if (!d3.select(this).classed("selected") ){
							active = true;
							d3.select(this).classed("selected", true)
							d3.selectAll('.line')
								.style('opacity', otherLinesOpacityHover);
							d3.selectAll('.circle')
									.style('opacity', otherLinesOpacityHover);
							d3.selectAll('rect')
									.style('opacity', otherLinesOpacityHover);
							d3.select(this)
								d3.selectAll("[division=" + d.division + "]")
										.attr("r", circleRadiusHover)
										.style('opacity', lineOpacityHover)
										.style("stroke-width", lineStrokeHover);
						}else{
							active = false;
							d3.select(this).classed("selected", false);
							d3.selectAll('.line')
								.style('opacity', lineOpacityHover)
								.style("stroke-width", lineStroke);
							d3.selectAll('.circle')
								.attr("r", circleRadius)
								.style('opacity', lineOpacityHover);
							d3.selectAll('rect')
								.style('opacity', lineOpacityHover);
							d3.select(this)
								d3.selectAll("[division=" + d.division + "]")
									.style("stroke-width", lineStroke);
								}
					})

					var divisionLabelsText = svg.selectAll("divisionLabelText")
					  .data(divisions)
					  .enter()
					  .append("text")

					divisionLabelsText.text(d=>d['text'])
					  .attr('x', d=>d['x'] + 30)
					  .attr('y', d=>d['y'] + 30)
					  .attr('font-size', '25px')
					  .attr('fill', 'black')
					  .attr('division', d=>d['division'])
					  .on("click", function(d){
					    if (!d3.select(this).classed("selected") ){
								active = true;
					      d3.select(this).classed("selected", true)
					      d3.selectAll('.line')
					        .style('opacity', otherLinesOpacityHover);
					      d3.selectAll('.circle')
					          .style('opacity', otherLinesOpacityHover);
								d3.selectAll('rect')
										.style('opacity', otherLinesOpacityHover);
					      d3.select(this)
					        d3.selectAll("[division=" + d.division + "]")
										.attr("r", circleRadiusHover)
					          .style('opacity', lineOpacityHover)
										.style("stroke-width", lineStrokeHover);
					    }else{
								active = false;
					      d3.select(this).classed("selected", false);
					      d3.selectAll('.line')
					        .style('opacity', lineOpacityHover)
					        .style("stroke-width", lineStroke);
					      d3.selectAll('.circle')
									.attr("r", circleRadius)
					      	.style('opacity', lineOpacityHover);
					      d3.selectAll('rect')
					      	.style('opacity', lineOpacityHover);
								d3.select(this)
									d3.selectAll("[division=" + d.division + "]")
										.style("stroke-width", lineStroke);
					        }
					  })
	});
}

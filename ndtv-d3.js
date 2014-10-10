var nodes, width, height, container, maxRadius, xScale, yScale, zScale, currTime, edges, maxTime, slider, animate, prevTime;
var defaultDuration = 800;

var resize = function() {
  init();
  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})
  .attr({
    x1: function(d, i) { return xScale(nodes[d.inl[0]-1]["animation.x.active"][0][currTime]); },
    y1: function(d, i) { return yScale(nodes[d.inl[0]-1]["animation.y.active"][0][currTime]); },
    x2: function(d, i) { return xScale(nodes[d.outl[0]-1]["animation.x.active"][0][currTime]); },
    y2: function(d, i) { return yScale(nodes[d.outl[0]-1]["animation.y.active"][0][currTime]); },
  });

  var circles = container.select('#nodes').selectAll('circle').data(nodes)
    .attr("cx", function(d) { return xScale(d["animation.x.active"][0][currTime]); })
    .attr("cy", function(d) { return yScale(d["animation.y.active"][0][currTime]); })

  var labels = container.select('#labels').selectAll('text').data(nodes)
    .attr("x", function(d) { return xScale(d["animation.x.active"][0][currTime])+textPadding; })
    .attr("y", function(d) { return yScale(d["animation.y.active"][0][currTime])+textPadding; })
}

var init = function() {
  width = $(window).width()-30;
  height = $(window).height()-80;

  d3.selectAll('#circles svg, #background')
    .attr({
      height: height,
      width: width
    })

  yScale = d3.scale.linear()
    .domain([graph.gal['xlim.active'][0][0].xlim[0],graph.gal['xlim.active'][0][0].xlim[1]])
    .range([maxRadius,height-maxRadius]);

  xScale = d3.scale.linear()
    .domain([graph.gal['ylim.active'][0][0].ylim[0],graph.gal['ylim.active'][0][0].ylim[1]])
    .domain([-4,4])
    .range([maxRadius,width-maxRadius]);
}

var updateCount = function() {
  init();
  nodes = graph.val;
  edges = graph.mel;
  maxTime = 24;

  slider = d3.slider().axis(true).step(1);
  slider.max(maxTime)
  slider.animate(defaultDuration)
  slider.on('slide', function(ext, value) {
      endAnimation();
      var duration = 200/Math.abs(currTime-value);
      animateGraph(currTime, value, duration, true);
    })
  d3.select('#slider').call(slider);

  drawCircles(defaultDuration);
}

var edgeFilter = function(e) {
  return $.grep(edges, function(edge, i) {
    var active = false;
    $.each(edge.atl.active, function(i, e) {
      if(e[0] <= currTime && e[1] >= currTime) {
        active = true;
        return false;
      }
    })
    return active;
  });
}

var drawCircles = function(duration) {
  var textPadding = 12;

  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})

    lines.enter().append('line')
      .attr('class', 'edge')
      .attr({
        x1: function(d, i) { return xScale(nodes[d.inl[0]-1]["animation.x.active"][0][prevTime]); },
        y1: function(d, i) { return yScale(nodes[d.inl[0]-1]["animation.y.active"][0][prevTime]); },
        x2: function(d, i) { return xScale(nodes[d.outl[0]-1]["animation.x.active"][0][prevTime]); },
        y2: function(d, i) { return yScale(nodes[d.outl[0]-1]["animation.y.active"][0][prevTime]); },
        opacity: 0
      })
      .style('stroke', 'green')
      .transition()
      .duration(duration*0.45)
      .attr({opacity: 1})
      // .transition()
      // .delay(duration*0.45)
      // .duration(0)
      // .style('stroke', 'black')

      lines.transition()
        .delay(duration/2)
        .duration(duration/2)
        .attr({
          x1: function(d, i) { return xScale(nodes[d.inl[0]-1]["animation.x.active"][0][currTime]); },
          y1: function(d, i) { return yScale(nodes[d.inl[0]-1]["animation.y.active"][0][currTime]); },
          x2: function(d, i) { return xScale(nodes[d.outl[0]-1]["animation.x.active"][0][currTime]); },
          y2: function(d, i) { return yScale(nodes[d.outl[0]-1]["animation.y.active"][0][currTime]); },
        })
        .style('stroke', 'black')

    lines.exit()
      .style('stroke', 'red')
      .transition()
      .duration(duration/2)
      .attr('opacity', 0)          
      .remove();

  var circles = container.select('#nodes').selectAll('circle').data(nodes);
    circles.enter().append('circle')
      .attr('class', 'node')
      .attr("cx", function(d) { return xScale(d["animation.x.active"][0][currTime]); })
      .attr("cy", function(d) { return yScale(d["animation.y.active"][0][currTime]); })
      .attr("r", 10) //function(d) { return d.z[state]; })
      .attr('opacity', 0)
      .transition()
      .duration(duration/2)
      .attr('opacity', 1)

    circles.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr("cx", function(d) { return xScale(d["animation.x.active"][0][currTime]); })
      .attr("cy", function(d) { return yScale(d["animation.y.active"][0][currTime]); })
  //          .attr("r", function(d) { return d.z[currTime]; })
    circles.exit().remove();

  var labels = container.select('#labels').selectAll('text').data(nodes);
    labels.enter().append('text')
      .attr('class', 'label')
      .attr("x", function(d) { return xScale(d["animation.x.active"][0][currTime])+textPadding; })
      .attr("y", function(d) { return yScale(d["animation.y.active"][0][currTime]); })
      .text(function(d) { return d['vertex.names'][0]; })
      .attr('opacity', 0) 
    labels.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr("x", function(d) { return xScale(d["animation.x.active"][0][currTime])+textPadding; })
      .attr("y", function(d) { return yScale(d["animation.y.active"][0][currTime]); })
      .attr('opacity', 1)
    labels.exit().remove();

}

var animateGraph = function(time, endTime, duration, noUpdate) {

  if(! noUpdate) {
    slider.value(time);
  }
  duration = duration === undefined ? defaultDuration : duration;
  if (endTime !== undefined && ! $.isNumeric(endTime)) { return; }
  endTime = endTime === undefined ? maxTime : endTime;
  var nextTime = endTime > time ? time +1 : time -1;
  //console.log(nextTime)
  prevTime = currTime;
  currTime = time;
  //console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)
  drawCircles(duration);
  if (time != endTime) {
    animate = setTimeout(function(){
      animateGraph(nextTime, endTime, duration, noUpdate);
    }, duration)
  }
}

var endAnimation = function(){
  clearTimeout(animate);
}

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}

$(function() {
  minRadius = 15;
  maxRadius = 2;
  currTime = 0;
  prevTime = 0;
  $(window).resize(resize);
  var svg = d3.select("#circles")
    .append("svg:svg")
    .append('g')
    .attr("transform", "translate(" + 10 + "," + 10 + ")")
    .call(zoom)

  var rect = svg.append("rect")
    .attr('id', 'background')
    .style("fill", "none")
    .style("pointer-events", "all");

  container = svg.append("g")
    .attr('id', 'container')
  container.append('g').attr('id', 'edges');
  container.append('g').attr('id', 'nodes');
  container.append('g').attr('id', 'labels');

  updateCount();
/*        $('#circles').on('click', function() { 
    if (currTime != maxTime) { 
      animateGraph(currTime); 
    } else {
      animateGraph(currTime, 0); 
    }
  })
*/      })
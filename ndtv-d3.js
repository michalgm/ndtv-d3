var nodes, width, height, container, maxRadius, xScale, yScale, zScale, currTime, edges, maxTime, slider, animate, prevTime, baseNodeSize;
var defaultDuration = 800;
var margin = {x: 20, y: 10};
var textPadding = 12;

var resize = function() {
  init();
  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})
  .attr({
    x1: function(d, i) { return xScale(getActive('coord', currTime)[d.inl[0]-1][0]); },
    y1: function(d, i) { return yScale(getActive('coord', currTime)[d.inl[0]-1][1]); },
    x2: function(d, i) { return xScale(getActive('coord', currTime)[d.outl[0]-1][0]); },
    y2: function(d, i) { return yScale(getActive('coord', currTime)[d.outl[0]-1][1]); },
  });

  var circles = container.select('#nodes').selectAll('circle').data(nodes)
  .attr({
    cx: function(d, i) { return xScale(getActive('coord', currTime)[i][0]); },
    cy: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
    r: function(d, i) { return getActive('vertex.cex', currTime)[i] * baseNodeSize; },
  });

  var labels = container.select('#labels').selectAll('text').data(nodes)
    .attr({
      x: function(d, i) { return xScale(getActive('coord', currTime)[i][0])+textPadding; },
      y: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
    })
}

var init = function() {
  width = $(window).width() - (margin.x*2);
  height = $(window).height() - (margin.y*2) - 110;

  baseNodeSize = width > height ? height /100 : width/100;

  d3.selectAll('#graph svg, #background')
    .attr({
      width: width + margin.x * 2,
      height: height + margin.y * 2
    })

  d3.select('#container')
    .attr("transform", "translate(" + margin.x + "," + margin.y + ")");

  xScale = d3.scale.linear()
    .domain([graph.gal['xlim.active'][0][0].xlim[0],graph.gal['xlim.active'][0][0].xlim[1]])
    .range([0, width]);

  yScale = d3.scale.linear()
    .domain([graph.gal['ylim.active'][0][0].ylim[0],graph.gal['ylim.active'][0][0].ylim[1]])
    .range([height, 0]);
}

var updateCount = function() {
  init();
  nodes = graph.val;
  edges = graph.mel;
  maxTime = 24;

  slider = d3.slider().axis(true).step(1);
  slider.min(1)
  slider.max(maxTime+1)
  slider.animate(defaultDuration)
  slider.value(1)
  slider.on('slide', function(ext, value) {
      endAnimation();
      var duration = 200/Math.abs(currTime-value-1);
      animateGraph(currTime, value-1, duration, true);
    })
  d3.select('#slider').call(slider);

  drawCircles(defaultDuration);
}

var getActive = function(prop, time) {
  var value;
  var props = graph.gal[prop+'.active'];
  $.each(props[1], function(i, times){
    if (times[0] <= time && times[1] > time) {
      value = props[0][i][prop];
    }
  })
  return value;
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

  $('#key').html(getActive('xlab', currTime)[0])

  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})

    lines.enter().append('line')
      .attr('class', 'edge')
      .attr({
        x1: function(d, i) { return xScale(getActive('coord', prevTime)[d.inl[0]-1][0]); },
        y1: function(d, i) { return yScale(getActive('coord', prevTime)[d.inl[0]-1][1]); },
        x2: function(d, i) { return xScale(getActive('coord', prevTime)[d.outl[0]-1][0]); },
        y2: function(d, i) { return yScale(getActive('coord', prevTime)[d.outl[0]-1][1]); },
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
          x1: function(d, i) { return xScale(getActive('coord', currTime)[d.inl[0]-1][0]); },
          y1: function(d, i) { return yScale(getActive('coord', currTime)[d.inl[0]-1][1]); },
          x2: function(d, i) { return xScale(getActive('coord', currTime)[d.outl[0]-1][0]); },
          y2: function(d, i) { return yScale(getActive('coord', currTime)[d.outl[0]-1][1]); },
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
      .attr({
        class: 'node',
        cx: function(d, i) { return xScale(getActive('coord', currTime)[i][0]); },
        cy: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
        r: function(d, i) { return getActive('vertex.cex', currTime)[i] * baseNodeSize; },
        opacity: 0,
      })
      .transition()
      .duration(duration/2)
      .attr('opacity', 1)
      .style('fill', function(d, i) {
        return getActive('vertex.col', currTime)[i];
      })

    circles.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr({
        cx: function(d, i) { return xScale(getActive('coord', currTime)[i][0]); },
        cy: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
        r: function(d, i) { return getActive('vertex.cex', currTime)[i] * baseNodeSize; },
      })
      .style('fill', function(d, i) {
        return getActive('vertex.col', currTime)[i];
      })

    circles.exit()
      .transition()
      .duration(duration*.4)
      .attr('opacity', 0)
      .remove();

  var labels = container.select('#labels').selectAll('text').data(nodes);
    labels.enter().append('text')
      .attr({
        class: 'label',
        x: function(d, i) { return xScale(getActive('coord', currTime)[i][0])+textPadding; },
        y: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
        opacity: 0
      })
      .text(function(d, i) { return getActive('label', currTime)[i]; })

    labels.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr({
        x: function(d, i) { return xScale(getActive('coord', currTime)[i][0])+textPadding; },
        y: function(d, i) { return yScale(getActive('coord', currTime)[i][1]); },
        opacity: 1
      })
      .text(function(d, i) { return getActive('label', currTime)[i]; })

    labels.exit().remove();

}

var animateGraph = function(time, endTime, duration, noUpdate) {
  if (endTime !== undefined && ! $.isNumeric(endTime)) { return; }
  if (time > maxTime) { return; }
  // console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)

  if(! noUpdate) {
    slider.value(time+1);
  }
  duration = duration === undefined ? defaultDuration : duration;
  endTime = endTime === undefined ? maxTime : endTime;
  var nextTime = endTime > time ? time +1 : time -1;
  //console.log(nextTime)
  prevTime = currTime;
  currTime = time;
  // console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)
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
  var svg = d3.select("#graph")
    .append("svg:svg")
    .append('g')
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
})
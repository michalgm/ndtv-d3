var nodes, width, height, container, xScale, yScale, zScale, edges, maxTime, slider, animate, baseNodeSize, timeIndex;
var currTime = 0;
var prevTime = 0;

var defaultDuration = 800;
var margin = {x: 20, y: 10};
var textPadding = 12;

var resize = function() {
  initScales();
  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})
    .attr({
      x1: function(d, i) { return xScale(timeIndex[currTime].data.coord[d.inl[0]-1][0]); },
      y1: function(d, i) { return yScale(timeIndex[currTime].data.coord[d.inl[0]-1][1]); },
      x2: function(d, i) { return xScale(timeIndex[currTime].data.coord[d.outl[0]-1][0]); },
      y2: function(d, i) { return yScale(timeIndex[currTime].data.coord[d.outl[0]-1][1]); },
    });

  var circles = container.select('#nodes').selectAll('circle').data(nodes)
    .attr({
      cx: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0]); },
      cy: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
      r: function(d, i) { return timeIndex[currTime].data['vertex.cex'][i] * baseNodeSize; },
    });

  var labels = container.select('#labels').selectAll('text').data(nodes)
    .attr({
      x: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0])+textPadding; },
      y: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
    })
}

var initScales = function() {
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

var loadData = function(url) {
  $.getJSON(url, function(data) {
    graph = data;
    initScales();
    nodes = graph.val;
    edges = graph.mel;

    var sliceInfo = graph.gal['slice.par'];
    minTime = sliceInfo.start[0];
    maxTime = sliceInfo.end[0];
    interval = sliceInfo.interval[0];

    var valIndex = {};
    timeIndex = [];
    var i = 0;
    for(var t = minTime; t<=maxTime-interval; t+=interval) {
      var slice = {
        startTime: t,
        endTime: t+sliceInfo['aggregate.dur'][0],
        data: {}
      };
      $.each(['coord', 'vertex.cex', 'label', 'vertex.col', 'xlab'], function(i, prop) {
        var props = graph.gal[prop+'.active'];
        $.each(props[1], function(i, slices){
          if (slices[0] <= t && slices[1] > t) {
            slice.data[prop] = props[0][i][prop];
            return false;
          }
        })      
      })
      timeIndex.push(slice);
      valIndex[t] = i;
      i++;
    }

    slider = d3.slider().axis(true).step(interval);
    slider.min(minTime)
    slider.max(maxTime-interval)
    slider.animate(defaultDuration)
    slider.value(minTime)
    slider.on('slide', function(ext, value) {
        endAnimation();
        var duration = 200/Math.abs(currTime-value);
        animateGraph(currTime, valIndex[value], duration, true);
      })
    d3.select('#slider').call(slider);
    drawGraph(defaultDuration);
  })
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

var drawGraph = function(duration) {

  $('#key').html(timeIndex[currTime].data.xlab[0])

  var lines = container.select('#edges').selectAll('line').data(edgeFilter(), function(e) { return e.inl[0]+'_'+e.outl[0]})

    lines.enter().append('line')
      .attr('class', 'edge')
      .attr({
        x1: function(d, i) { return xScale(timeIndex[prevTime].data.coord[d.inl[0]-1][0]); },
        y1: function(d, i) { return yScale(timeIndex[prevTime].data.coord[d.inl[0]-1][1]); },
        x2: function(d, i) { return xScale(timeIndex[prevTime].data.coord[d.outl[0]-1][0]); },
        y2: function(d, i) { return yScale(timeIndex[prevTime].data.coord[d.outl[0]-1][1]); },
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
          x1: function(d, i) { return xScale(timeIndex[currTime].data.coord[d.inl[0]-1][0]); },
          y1: function(d, i) { return yScale(timeIndex[currTime].data.coord[d.inl[0]-1][1]); },
          x2: function(d, i) { return xScale(timeIndex[currTime].data.coord[d.outl[0]-1][0]); },
          y2: function(d, i) { return yScale(timeIndex[currTime].data.coord[d.outl[0]-1][1]); },
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
        cx: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0]); },
        cy: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
        r: function(d, i) { return timeIndex[currTime].data['vertex.cex'][i] * baseNodeSize; },
        opacity: 0,
      })
      .transition()
      .duration(duration/2)
      .attr('opacity', 1)
      .style('fill', function(d, i) {
        return timeIndex[currTime].data['vertex.col'][i];
      })

    circles.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr({
        cx: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0]); },
        cy: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
        r: function(d, i) { return timeIndex[currTime].data['vertex.cex'][i] * baseNodeSize; },
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
        x: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0])+textPadding; },
        y: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
        opacity: 0
      })
      .text(function(d, i) { return timeIndex[currTime].data.label[i]; })

    labels.transition()
      .delay(duration/2)
      .duration(duration/2)
      .attr({
        x: function(d, i) { return xScale(timeIndex[currTime].data.coord[i][0])+textPadding; },
        y: function(d, i) { return yScale(timeIndex[currTime].data.coord[i][1]); },
        opacity: 1
      })
      .text(function(d, i) { return timeIndex[currTime].data.label[i]; })

    labels.exit().remove();
}

var animateGraph = function(time, endTime, duration, noUpdate) {
  //if (endTime !== undefined && ! $.isNumeric(endTime)) { return; }
  if (time > maxTime-1) { return; }
  //console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)

  if(! noUpdate) {
    slider.value(timeIndex[time].startTime);
  }
  duration = duration === undefined ? defaultDuration : duration;
  endTime = endTime === undefined ? maxTime : endTime;
  var nextTime = endTime > time ? time +1 : time -1;
  //console.log(nextTime)
  prevTime = currTime;
  currTime = time;
  // console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)
  drawGraph(duration);
  if (time != endTime) {
    animate = setTimeout(function(){
      animateGraph(nextTime, endTime, duration, noUpdate);
    }, duration)
  }
}

var endAnimation = function(){
  clearTimeout(animate);
}

var SVGSetup = function() {
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
}

$(function() {
  SVGSetup();
  loadData('data/data.json');
})
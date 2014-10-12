var ndtv_d3 = (function() {
  var options = {
    defaultDuration: 800, //Duration of each step animation during play or step actions
    scrubDuration: 100, //Sum duration of all step animations when scrubbing, regardless of # of steps
    edgeTransitionFactor: 0, //fraction (0-1) of total step animation time that edge enter/exit animations should take
    labelOffset: { //offset of labels FIXME
      x: 12,
      y: 0
    },
    nodeSizeFactor: 100, //sets default node size, as viewport / nodeSizeFactor
    dataChooser: false, //show a select box for choosing different graphs?
    dataChooserDir: 'data/', //web path to dir containing data json files
    playControls: true, //show the player controls
    slider: true, //show the slider control
    animateOnLoad: false, //play the graph animation on page load
    margin: { //svg margins - may be overridden when setting fixed aspect ratio
      x: 20,
      y: 10
    },
    initialDataUrl: null,
  }
  
  var nodes,
      graph,
      edges,
      container,
      xScale,
      yScale,
      maxTime, 
      slider,
      animate,
      baseNodeSize,
      timeIndex,
      currTime = 0,
      prevTime = 0;

  //Private Functions

  //constructor
  var n3 = function(opts) {
    var _this = this;
    $.extend(true, options, opts); //replace defaults with user-specified options
    if (options.dataChooser) { createDataChooser(); }
    if (options.playControls) { createPlayControls(); }
    SVGSetup();
    if(options.initialDataUrl) { n3.loadData(options.initialDataUrl); }
    this._timeIndex = []; 
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

    $(window).resize(n3.resizeGraph);

    var svg = d3.select("#graph")
      .append("svg:svg")
      .append("defs").append("marker")
        .attr("id", 'arrowhead')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 7)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("markerUnits", "strokeWidth")
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    var svg = d3.select('#graph svg')
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

  var initScales = function() {
    var window_width = $(window).width();
    var window_height = $(window).height()-110;
    if (window_width > window_height) { 
      options.margin.x = (window_width - window_height)/2
    } else {
      options.margin.y = (window_height - window_width)/2
    }

    var width = window_width - (options.margin.x*2);
    var height = window_height - (options.margin.y*2);

    baseNodeSize = width > height ? height /100 : width/100;

    d3.selectAll('#graph svg, #background')
      .attr({
        width: width + options.margin.x * 2,
        height: height + options.margin.y * 2
      })

    d3.select('#container')
      .attr("transform", "translate(" + options.margin.x + "," + options.margin.y + ")");

    xScale = d3.scale.linear()
      .domain([graph.gal['xlim.active'][0][0].xlim[0],graph.gal['xlim.active'][0][0].xlim[1]])
      .range([0, width]);

    yScale = d3.scale.linear()
      .domain([graph.gal['ylim.active'][0][0].ylim[0],graph.gal['ylim.active'][0][0].ylim[1]])
      .range([height, 0]);
  }

  function createDataChooser() {
    var setVidLink = function(url) {
      $('#video_link').attr('href', url.replace('.json', '.mp4'))
    }
    $('body').append($("<div id='data_chooser_container'></div>").append("<select id='data_chooser'/>").append("<a id='video_link' target='_blank'>Video</a>"));
    $.get('data/', function(data){
      $('#data_chooser').change(function() {
        var url = $('#data_chooser').val();
        n3.loadData(url);
        setVidLink(url)
      })
      var matches = data.match(/<td><a href="[^"]*"/g);
      $.each(matches, function(i, m) {
        var url = m.match(/href="([^"]*)"/)[1];
        if (url.match(/.json$/)) {
          $('#data_chooser').append("<option>data/"+url+"</option>")
        }
        if (i == 1) {
          setVidLink(url);
        }
      })
    })
  }
 
  var createPlayControls = function() {
    $('#play-control-container').show();
    $('#step-back-control').click(function() { n3.animateGraph(currTime-1, currTime-1); });
    $('#play-back-control').click(function() { n3.animateGraph(currTime-1, 0); });
    $('#pause-control').click(function() { n3.endAnimation(); });
    $('#play-forward-control').click(function() { n3.animateGraph(currTime+1); });
    $('#step-forward-control').click(function() { n3.animateGraph(currTime+1, currTime+1); });
  }

  var dataFilter = function(type) {
    var dataList = type == 'node' ? nodes : edges;

    return $.grep(dataList, function(item, i) {
      return n3._timeIndex[currTime].data.active[type+'s'][item.id];
    });
  }

  var timeLookup = function(property, index, time) {
    time = time === undefined ? currTime : time;
    var defaults = {
      'vertex.cex': 1,
      'vertex.sides': 50,
      'vertex.rot': 0,
      'vertex.col': 'red',
      //'vertex.col': 'inherit'
    }
    if (n3._timeIndex[time].data[property] !== undefined && n3._timeIndex[time].data[property][index] !== undefined) {
      return n3._timeIndex[time].data[property][index];
    } else {
      if (property == 'coord') {
        console.log(index)
        console.log(time)
      }
      return defaults[property];
    }
  }


  var drawLine = function() {
    return d3.svg.line()
      .x(function(d){return d[0];})
      .y(function(d){return d[1];})
  }

  var drawPolygon = function(d) { //sides, size, centerx, centery, rotation) { 
    var sides = timeLookup('vertex.sides', d.id);
    var size = timeLookup('vertex.cex', d.id) * baseNodeSize;
    var coords = timeLookup('coord', d.id);
    var rotation = timeLookup('vertex.rot', d.id)
    var poly = [];
    var rot = (rotation-45)/360*2*Math.PI
    var t1 = 2 * Math.PI / sides;
    var t2 = (Math.PI / sides) + rot;
    
    for (var i = 0; i < sides; i++) {
        var t = t2 + t1 * i;
        var x = size* Math.sin(t) + xScale(coords[0]);
        var y = size * Math.cos(t)+ yScale(coords[1]);
        poly.push([x, y]);
    }
    return drawLine()(poly) + 'Z';
  }

  var getLineCoords = function(d, time) {
    var time1 = time; 
    var time2 = time;
    if (time == prevTime) {
      if (! n3._timeIndex[time].data.active.nodes[d.inl[0]-1]) { time1 = currTime; }
      if (! n3._timeIndex[time].data.active.nodes[d.outl[0]-1]) { time2 = currTime; }
    }
    var coord1 = timeLookup('coord', d.inl[0]-1, time1);
    var coord2 = timeLookup('coord', d.outl[0]-1, time2);
    var x1 = xScale(coord1[0]);
    var y1 = yScale(coord1[1]);
    var x2 = xScale(coord2[0]);
    var y2 = yScale(coord2[1]);
    var radius = timeLookup('vertex.cex', d.outl[0]-1, time) * baseNodeSize + 2;

    // Determine line lengths
    var xlen = x2 - x1;
    var ylen = y2 - y1;

    // Determine hypotenuse length
    var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));

    // Determine the ratio between they shortened value and the full hypotenuse.
    var ratio = (hlen - radius) / hlen;

    var edgeX = x1 + (xlen * ratio);
    var edgeY = y1 + (ylen * ratio);
    return 'M '+x1+' '+y1+' L '+edgeX+' '+edgeY;
  }

  //Public Functions

  n3.loadData = function(url) {
    n3.endAnimation();
    currTime = 0;
    prevTime = 0;
    $.getJSON(url, function(data) {
      console.time('loadData');
      graph = data;
      if (options.dataChooser) {
        $('#data_chooser').val(url);
      }
      container.select('#edges').selectAll('*').remove();
      container.select('#labels').selectAll('*').remove();
      container.select('#nodes').selectAll('*').remove();

      initScales();
      nodes = graph.val;
      edges = graph.mel;

      $.each(nodes, function(i, n) {
        if (! $.isEmptyObject(n)) {
          n.id = i;
        }
      })
      $.each(edges, function(i, e) {
        if (! $.isEmptyObject(e)) {
          e.id = i;
        }
      })

      var sliceInfo = graph.gal['slice.par'];
      minTime = sliceInfo.start[0];
      maxTime = sliceInfo.end[0];
      interval = sliceInfo.interval[0];

      var valIndex = {};
      n3._timeIndex = [];
      var i = 0;

      var checkInterval = function(start, end, slice) {
        $.each(slice, function(i, num){
          if (num == 'Inf') { slice[i] = Infinity; }
          if (num == '-Inf') { slice[i] = -Infinity; }
        })

        if (
          (slice[0] < end && slice[1] > start) ||
          (start == end)
        ) {
          return true;
        } else {
          return false;
        }
      }
      window.check = checkInterval;

      for(var t = minTime; t<=maxTime-interval; t+=interval) {
        var slice = {
          startTime: t,
          endTime: t+sliceInfo['aggregate.dur'][0],
          data: {}
        };
        
        slice.data.active = {
          nodes: {},
          edges: {},
          node_index: [],
          edge_index: []
        };

        $.each(['node', 'edge'], function(i, type) {
          var data = type == 'node' ? nodes : edges;
          $.each(data, function(i, item){
            var active = false;
            if (! $.isEmptyObject(item)) {
              if (item.active || (item.atl && item.atl.active)) {
                var activeProperty = type == 'node' ? item.active : item.atl.active;
                $.each(activeProperty, function(i, s) {
                  if(checkInterval(slice.startTime, slice.endTime, s)) {
                    active = true;
                    return false;
                  }
                })
              } else {
                active = true;
              }
              slice.data.active[type+'s'][item.id] = active;
              if (active) {
                slice.data.active[type+'_index'].push(item.id);
              }
            } 
          })
        })

        var activeProperties = [
          ['xlab', 'graph'],
          ['displaylabels', 'graph'],
          ['coord', 'node'],
          ['vertex.cex', 'node'],
          ['label', 'node'],
          ['vertex.col', 'node'],
          ['vertex.sides', 'node'],
          ['vertex.rot', 'node'],
        ];
        $.each(activeProperties, function(i, prop) {
          var name = prop[0];
          var type = prop[1];
          var props = graph.gal[name+'.active'];

          slice.data[name] = {};
          if (! props) { 
            //console.log('no property: '+prop); 
            return;
          }
          $.each(props[1], function(i, s){
            if(checkInterval(slice.startTime, slice.endTime, s)) {
              if (type == 'graph') {
                slice.data[name] = props[0][i][name];
              } else {
                $.each(props[0][i][name], function(i, value){
                  var id = slice.data.active[type+'_index'][i];
                  slice.data[name][id] = value;
                })
              }
              return false;
            }
          })      
        })
        n3._timeIndex.push(slice);
        valIndex[t] = i;
        i++;
      }
      window.timeIndex = n3._timeIndex;
      window.graphdata = graph;

      $('#slider').html('');

      slider = d3.slider().axis(true).step(interval);
      slider.min(minTime)
      slider.max(maxTime-interval)
      slider.animate(options.defaultDuration)
      slider.value(minTime)
      slider.on('slide', function(ext, value) {
        n3.endAnimation();
        var duration = options.scrubDuration/Math.abs(currTime-value);
        n3.animateGraph(currTime, valIndex[value], duration, true);
      })
      
      slider.on('slideend', function() {
        slider.animate(options.defaultDuration);
      })
      d3.select('#slider').call(slider);
      $('#slider').mousedown(function(e) { 
        slider.animate(options.scrubDuration);
      })
      console.timeEnd('loadData');

      n3.drawGraph(options.defaultDuration);
    })
  }

  n3.drawGraph = function(duration) {

    var edgeDuration = duration * options.edgeTransitionFactor;
    var nodeDuration = duration * 1-options.edgeTransitionFactor;

    $('#key').html(timeLookup('xlab', 0))
    var lines = container.select('#edges').selectAll('.edge').data(dataFilter('edge'), function(e) { return e.id})
      lines.enter().append('path')
        .attr('class', 'edge')
        .attr({
          d: function(d) {return getLineCoords(d, prevTime);  },
          opacity: 0,
          "marker-end": "url(#arrowhead)"
        })
        .style('stroke', 'green')
        .transition()
        .duration(edgeDuration)
        .attr({opacity: 1})
        // .transition()
        // .delay(duration*0.45)
        // .duration(0)
        // .style('stroke', 'black')

      lines.transition()
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          d: function(d) { return getLineCoords(d, currTime); },
          opacity: 1,
        })
        .each(function(d) { 
          getLineCoords(d);
        })
        .style('stroke', 'black')

      lines.exit()
        .style('stroke', 'red')
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 0)          
        .remove();

    var nodes = container.select('#nodes').selectAll('.node').data(dataFilter('node'), function(e) { return e.id});
      nodes.enter().append('path')
        .attr({
          class: 'node',
          d: function(d, i) { return drawPolygon(d) },
          //cx: function(d, i) { return xScale(timeLookup('coord', i)[0]); },
          //cy: function(d, i) { return yScale(timeLookup('coord', i)[1]); },
          //r: function(d, i) { return timeLookup('vertex.cex', i) * baseNodeSize; },
          opacity: 0,
        })
        .style('fill', function(d, i) {
          return timeLookup('vertex.col', d.id);
        })
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 1)

      nodes.transition()
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          d: function(d, i) { return drawPolygon(d) },
          // cx: function(d, i) { return xScale(timeLookup('coord', i)[0]); },
          // cy: function(d, i) { return yScale(timeLookup('coord', i)[1]); },
          // r: function(d, i) { return timeLookup('vertex.cex', i) * baseNodeSize; },
          opacity: 1
        })
        .style('fill', function(d, i) {
          return timeLookup('vertex.col', d.id);
        })

      nodes.exit()
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 0)
        .remove();

    var labels = container.select('#labels').selectAll('text').data(dataFilter('node'), function(e) { return e.id});
      labels.enter().append('text').filter(function(d) { return timeLookup('displaylabels', 0)})
        .attr({
          class: 'label',
          x: function(d, i) { return xScale(timeLookup('coord', d.id)[0])+options.labelOffset.x; },
          y: function(d, i) { return yScale(timeLookup('coord', d.id)[1])+options.labelOffset.y; },
          opacity: 0
        })
        .text(function(d, i) { return timeLookup('label', d.id); })

      labels.transition().filter(function(d) { return timeLookup('displaylabels', 0) !== false})
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          x: function(d, i) { return xScale(timeLookup('coord', d.id)[0])+options.labelOffset.x; },
          y: function(d, i) { return yScale(timeLookup('coord', d.id)[1])+options.labelOffset.y; },
          opacity: 1
        })
        .text(function(d, i) { return timeLookup('label', d.id); })

      labels.exit().remove();
  }

  n3.resizeGraph = function() {
    initScales();
    var lines = container.select('#edges').selectAll('.edge').data(dataFilter('edge'), function(e) { return e.id})
      .attr({
        d: function(d) { return getLineCoords(d, currTime); },
      });

    var nodes = container.select('#nodes').selectAll('.node').data(dataFilter('node'), function(e) { return e.id})
      .attr({
        d: function(d, i) { return drawPolygon(d) },
      });

    var labels = container.select('#labels').selectAll('text').data(dataFilter('node'), function(e) { return e.id})
      .attr({
        x: function(d, i) { return xScale(timeLookup('coord', d.id)[0])+options.labelOffset.x; },
        y: function(d, i) { return yScale(timeLookup('coord', d.id)[1])+options.labelOffset.y; },
      })
  }

  n3.animateGraph = function(time, endTime, duration, noUpdate) {
    //if (endTime !== undefined && ! $.isNumeric(endTime)) { return; }
    if (time > maxTime-1) { return; }
    //console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)
    if(! noUpdate) {
      slider.value(n3._timeIndex[time].startTime);
    }
    duration = duration === undefined ? options.defaultDuration : duration;
    //console.log(duration)
    endTime = endTime === undefined ? maxTime : endTime;
    var nextTime = endTime > time ? time +1 : time -1;
    //console.log(nextTime)
    //console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime)

    prevTime = currTime;
    currTime = time == currTime ? nextTime : time;
    //console.log(currTime + ' '+time+' '+endTime+ ' '+nextTime+ ' '+prevTime)
    n3.drawGraph(duration);
    if (currTime != endTime) {
      animate = setTimeout(function(){
        n3.animateGraph(nextTime, endTime, duration, noUpdate);
      }, duration)
    }
  }

  n3.endAnimation = function(){
    clearTimeout(animate);
  }
  return n3;
}()); 

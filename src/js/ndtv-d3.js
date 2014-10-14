(function (root, factory) {
  root.ndtv_d3 = factory();
}(this, function() {
  //return function module() {
  "use strict";

  //constructor
  var n3 = function(opts, target) {
    var _this = this;
    $.extend(true, this.options, opts); //replace defaults with user-specified n3.options
    if (!target) {
      target = d3.select('body').append('div').style({width: '100%', height: '100%'}).node();
    }
    this.domTarget = d3.select(target);
    this.domTarget.classed({'ndtv-d3-container': true});
    this.SVGSetup();
    if (this.options.playControls || this.options.slider) {
      this.domTarget.append('div').attr('class', 'controls');
    }
    if (this.options.dataChooser) { this.createDataChooser(); }
    if (this.options.playControls) { this.createPlayControls(); }
    if (this.options.slider) { this.createSliderControl(); }

    if(this.options.graphData) { this.loadData(this.options.graphData); }
  }

  n3.prototype = {
    nodes: null,
    edges: null,
    svg: null,
    xScale: null,
    yScale: null,
    minTime: null,
    interval: null,
    maxTime: null,
    animate: null,
    baseNodeSize: null,
    currTime: 0,
    prevTime:0,
    graph: null,
    timeIndex:null,
    domTarget:null,
    slider:null,
  };
  
  n3.prototype.options = {
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
    animateOnLoad: false, //play the n3.graph animation on page load
    margin: { //svg margins - may be overridden when setting fixed aspect ratio
      x: 20,
      y: 10
    },
    graphData: null,
  };

  n3.prototype.SVGSetup = function() {
    var n3 = this;
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    var drag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    function zoomed() {
      n3.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
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

    $(n3.domTarget).resize(function(n) { 
      n3.resizeGraph(n);
    });
    $(window).resize(function(n) { 
      n3.resizeGraph(n);
    });

    n3.domTarget
      .append('div').attr('class', 'graph')
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
    n3.domTarget.select('.graph').append('div').attr('class', 'key');

    var svg = n3.domTarget.select('svg')
      .append('g')
      .call(zoom)

    var rect = svg.append("rect")
      .attr('class', 'background')
      .style("fill", "none")
      .style("pointer-events", "all");

    n3.container = svg.append("g")
      .attr('class', 'n3.container')
    n3.container.append('g').attr('class', 'edges');
    n3.container.append('g').attr('class', 'nodes');
    n3.container.append('g').attr('class', 'labels');
  }

  n3.prototype.initScales = function() {
    var n3 = this;
    var div_width = n3.domTarget.node().offsetWidth
    var div_height = n3.domTarget.node().offsetHeight -110;
    if (div_width > div_height) { 
      n3.options.margin.x = (div_width - div_height)/2
    } else {
      n3.options.margin.y = (div_height - div_width)/2
    }

    var width = div_width - (n3.options.margin.x*2);
    var height = div_height - (n3.options.margin.y*2);

    n3.baseNodeSize = width > height ? height /100 : width/100;

    n3.domTarget.selectAll('svg, .background')
      .attr({
        width: width + n3.options.margin.x * 2,
        height: height + n3.options.margin.y * 2
      })

    n3.container
      .attr("transform", "translate(" + n3.options.margin.x + "," + n3.options.margin.y + ")");

    n3.xScale = d3.scale.linear()
      .domain([n3.timeIndex[0].data.xlim[0],n3.timeIndex[0].data.xlim[1]])
//      .domain([n3.graph.gal['xlim.active'][0][0].xlim[0],n3.graph.gal['xlim.active'][0][0].xlim[1]])
      .range([0, width]);

    n3.yScale = d3.scale.linear()
      .domain([n3.timeIndex[0].data.ylim[0],n3.timeIndex[0].data.ylim[1]])
      //.domain([n3.graph.gal['ylim.active'][0][0].ylim[0],n3.graph.gal['ylim.active'][0][0].ylim[1]])
      .range([height, 0]);
  }

  n3.prototype.createDataChooser = function() {
    var n3 = this;

    var div = n3.domTarget.append('div').attr('class', 'data_chooser_container')
    div.append('select').attr('class', 'data_chooser')
    div.append('a').attr({'class': 'video_link', 'target': '_blank'}).html('Video');

    var setVidLink = function(url) {
      div.select('.video_link').attr('href', url.replace('.json', '.mp4'))
    }
    $.get('data/', function(data){
      div.select('.data_chooser').on('change', function() {
        var url = $(this).val();
        n3.loadData(url);
        setVidLink(url)
      })
      var matches = data.match(/<td><a href="[^"]*"/g);
      $.each(matches, function(i, m) {
        var url = m.match(/href="([^"]*)"/)[1];
        if (url.match(/.json$/)) {
          div.select('.data_chooser').append('option').attr('value', "data/"+url).html(url);
        }
        if (i == 1) {
          setVidLink(url);
        }
      })
    })
  }
  
  n3.prototype.createPlayControls = function() {
    var n3 = this;

    var div = n3.domTarget.select('.controls').append('div').attr('class', 'play-control-container');
    div.html(
      "<div><svg class='icon step-back-control' viewBox='0 0 32 32'><use xlink:href='#icon-first'></use></svg></div>"+
      "<div><svg class='icon play-back-control' viewBox='0 0 32 32'><g transform='rotate(180, 16, 16)'><use xlink:href='#icon-play'></use></g></svg></div>"+
      "<div><svg class='icon pause-control' viewBox='0 0 32 32'><use xlink:href='#icon-pause'></use></svg></div>"+
      "<div><svg class='icon play-forward-control' viewBox='0 0 32 32'><use xlink:href='#icon-play'></use></svg></div>"+
      "<div><svg class='icon step-forward-control' viewBox='0 0 32 32'><g transform='rotate(180, 16, 16)'><use xlink:href='#icon-first'></use></g></svg></div>"
    );

    div.select('.step-back-control').on('click', function() { n3.animateGraph(n3.currTime-1, n3.currTime-1); });
    div.select('.play-back-control').on('click', function() { n3.animateGraph(n3.currTime-1, 0); });
    div.select('.pause-control').on('click', function() { n3.endAnimation(); });
    div.select('.play-forward-control').on('click', function() { n3.animateGraph(n3.currTime+1); });
    div.select('.step-forward-control').on('click', function() { n3.animateGraph(n3.currTime+1, n3.currTime+1); });
  }

  n3.prototype.createSliderControl = function() {
    var n3 = this;
    n3.domTarget.select('.controls').append('div').attr('class', 'slider');
  }

  n3.prototype.dataFilter = function(type) {
    var n3 = this;
    var dataList = type == 'node' ? n3.nodes : n3.edges;

    return $.grep(dataList, function(item, i) {
      return n3.timeIndex[n3.currTime].data.active[type+'s'][item.id];
    });
  }

  n3.prototype.timeLookup = function(property, index, time) {
    var n3 = this;
    time = time === undefined ? n3.currTime : time;
    
    var data = n3.timeIndex[time].data;
    var properties = {
      'xlab': {
        type: 'graph',
      },
      'displaylabels': {
        type:  'graph'
      },
      'coord': { 
        type:  'node'
      },
      'vertex.cex': {
        type:  'node',
        default: 1
      },
      'label': { 
        type:  'node'
      },
      'vertex.col': { 
        type:  'node',
        default: 'red'
      },
      'vertex.sides': { 
        type:  'node',
        default: 50
      },
      'vertex.rot': { 
        type:  'node',
        default: 0
      },
    }

    var type = properties[property].type;
    var value = properties[property].default;

    if (data[property] !== undefined) {
      if (type == 'graph') {
        if (data[property] !== undefined) {
          value = data[property];
        }
      } else {
        var lookup = data.active[type+'s'][index];
        if (lookup === undefined) {
          console.log('attempting to access property '+property+ ' for inactive '+type+' id '+index);
          if (property == 'coord') {
            console.log('missing coordinates for node '+index+ ' at time '+time+' ('+n3.timeIndex[time].start+'-'+n3.timeIndex[time].end+')');
            console.log('valid time slices for node '+index+' are '+n3.graph.val[index].active.join(','))
          }
        } else if (data[property][lookup] !== undefined) {
          value = data[property][lookup];
        }
      }
    }
    return value;
  }

  var drawLine = function() {
    return d3.svg.line()
      .x(function(d){return d[0];})
      .y(function(d){return d[1];})
  }

  n3.prototype.drawPolygon = function(d) { //sides, size, centerx, centery, rotation) { 
    var n3 = this;
    var sides = n3.timeLookup('vertex.sides', d.id);
    var size = n3.timeLookup('vertex.cex', d.id) * n3.baseNodeSize;
    var coords = n3.timeLookup('coord', d.id);
    var rotation = n3.timeLookup('vertex.rot', d.id)
    var centerX = n3.xScale(coords[0]);
    var centerY = n3.yScale(coords[1]);

    var rot = rotation * 2 * Math.PI/360
    var base = 1/sides * 2 * Math.PI;
    var poly = [];

    for (var i = 1; i <= sides; i++) {
        var ang = i * base + rot;
        var x = centerX + size * Math.cos(ang);
        var y = centerY + size * Math.sin(ang);
        poly.push([x, y]);
    }
    return drawLine()(poly) + 'Z';
  }

  n3.prototype.getLineCoords = function(d, time) {
    var n3 = this;
    var time1 = time; 
    var time2 = time;
    if (time == n3.prevTime) {
      if (! n3.timeIndex[time].data.active.nodes[d.inl[0]]) { time1 = n3.currTime; }
      if (! n3.timeIndex[time].data.active.nodes[d.outl[0]]) { time2 = n3.currTime; }
    }
    var coord1 = n3.timeLookup('coord', d.inl[0], time1);
    var coord2 = n3.timeLookup('coord', d.outl[0], time2);
    var x1 = n3.xScale(coord1[0]);
    var y1 = n3.yScale(coord1[1]);
    var x2 = n3.xScale(coord2[0]);
    var y2 = n3.yScale(coord2[1]);
    var radius = n3.timeLookup('vertex.cex', d.outl[0], time) * n3.baseNodeSize + 2;

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
 
  n3.prototype.loadData = function(graphData) {
    var n3 = this;
    n3.endAnimation();
    n3.currTime = 0;
    n3.prevTime = 0;

    var processData = function(data) {
      console.time('loadData');
      n3.graph = data.network;
      n3.timeIndex = data.render;
      if (n3.options.dataChooser && ! $.isPlainObject(graphData)) {
        $(n3.domTarget.select('.data_chooser').node()).val(graphData);
        n3.domTarget.select('.video_link').attr('href', graphData.replace('.json', '.mp4'))
      }
      n3.container.select('.edges').selectAll('*').remove();
      n3.container.select('.labels').selectAll('*').remove();
      n3.container.select('.nodes').selectAll('*').remove();

      n3.initScales();
      n3.nodes = n3.graph.val;
      n3.edges = n3.graph.mel;

      $.each(n3.nodes, function(i, n) {
        if (! $.isEmptyObject(n)) {
          n.id = i+1;
        }
      })
      $.each(n3.edges, function(i, e) {
        if (! $.isEmptyObject(e)) {
          e.id = i+1;
        }
      })
      var sliceInfo = n3.graph.gal['slice.par'];
      
      n3.minTime = sliceInfo.start[0];
      n3.maxTime = sliceInfo.end[0];
      n3.interval = sliceInfo.interval[0];
      var valIndex = {};
      $.each(n3.timeIndex, function(i, t){
        valIndex[t.start] = i;
      })      
      /*

      n3.timeIndex = [];
      var i = 0;

      var checkInterval = function(start, end, slice) {
        if (start == end ) {
          return true; 
        } else {
          $.each(slice, function(i, num){
            if (num == 'Inf') { slice[i] = Infinity; }
            if (num == '-Inf') { slice[i] = -Infinity; }
          })

          if (
            (end > slice[0] && start < slice[1])
            //(slice[0] < end && slice[1] > start)
          ) {
            return true;
          }
        }
        return false;
      }

      for(var t = n3.minTime; t<=n3.maxTime-n3.interval; t+=n3.interval) {
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
          var data = type == 'node' ? n3.nodes : n3.edges;
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
          ['xlab', 'n3.graph'],
          ['displaylabels', 'n3.graph'],
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
          var props = n3.graph.gal[name+'.active'];

          slice.data[name] = {};
          if (! props) { 
            //console.log('no property: '+prop); 
            return;
          }
          $.each(props[1], function(i, s){
            if(checkInterval(slice.startTime, slice.endTime, s)) {
              if (type == 'n3.graph') {
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
        n3.timeIndex.push(slice);
        valIndex[t] = i;
        i++;
      }
      */
      if(n3.options.slider) {
        var sliderDiv = n3.domTarget.select('.slider');

        sliderDiv.html('');

        n3.slider = d3.slider().axis(true).step(n3.interval);
        n3.slider.min(n3.minTime)
        n3.slider.max(n3.maxTime-n3.interval+sliceInfo['aggregate.dur'][0])
        n3.slider.animate(n3.options.defaultDuration)
        n3.slider.value(n3.minTime)
        n3.slider.interval(sliceInfo['aggregate.dur'][0])
        n3.slider.on('slide', function(ext, value) {
          n3.endAnimation();
          var duration = n3.options.scrubDuration/Math.abs(n3.currTime-value);
          n3.animateGraph(n3.currTime, valIndex[value], duration, true);
        })
        
        n3.slider.on('slideend', function() {
          n3.slider.animate(n3.options.defaultDuration);
        })
        sliderDiv.on('mousedown', function(e) { 
          n3.slider.animate(n3.options.scrubDuration);
        })

        sliderDiv.call(n3.slider);
      }
      
      console.timeEnd('loadData');
      n3.drawGraph(n3.options.defaultDuration);
    };

    if($.isPlainObject(graphData)) {
      processData(graphData)
    } else {
      $.getJSON(graphData, function(data) {
        processData(data);
      });
    }
  }

  n3.prototype.drawGraph = function(duration) {
    var n3 = this;

    var edgeDuration = duration * n3.options.edgeTransitionFactor;
    var nodeDuration = duration * 1-n3.options.edgeTransitionFactor;

    n3.domTarget.select('.key').html(n3.timeLookup('xlab', 0))
    var lines = n3.container.select('.edges').selectAll('.edge').data(n3.dataFilter('edge'), function(e) { return e.id})
      lines.enter().append('path')
        .attr('class', 'edge')
        .attr({
          d: function(d) {return n3.getLineCoords(d, n3.prevTime);  },
          opacity: 0,
          "marker-end": "url(#arrowhead)"
        })
        .style('stroke', 'green')
        .transition()
        .duration(edgeDuration)
        .attr({opacity: 1})
       
      // lines.transition()
      //   .delay(edgeDuration-6)
      //   .duration(0)
      lines.exit()
        .style('stroke', 'red')
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 0)          
        .remove();

      lines.transition()
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          d: function(d) { return n3.getLineCoords(d, n3.currTime); },
          opacity: 1
        })
        .style('stroke', 'black')

    var nodes = n3.container.select('.nodes').selectAll('.node').data(n3.dataFilter('node'), function(e) { return e.id});
      nodes.enter().append('path')
        .attr({
          class: 'node',
          d: function(d, i) { return n3.drawPolygon(d) },
          //cx: function(d, i) { return n3.xScale(n3.timeLookup('coord', i)[0]); },
          //cy: function(d, i) { return n3.yScale(n3.timeLookup('coord', i)[1]); },
          //r: function(d, i) { return n3.timeLookup('vertex.cex', i) * baseNodeSize; },
          opacity: 0,
        })
        .style('fill', function(d, i) {
          return n3.timeLookup('vertex.col', d.id);
        })
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 1)

      nodes.transition()
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          d: function(d, i) { return n3.drawPolygon(d) },
          // cx: function(d, i) { return n3.xScale(n3.timeLookup('coord', i)[0]); },
          // cy: function(d, i) { return n3.yScale(n3.timeLookup('coord', i)[1]); },
          // r: function(d, i) { return n3.timeLookup('vertex.cex', i) * baseNodeSize; },
          opacity: 1
        })
        .style('fill', function(d, i) {
          return n3.timeLookup('vertex.col', d.id);
        })

      nodes.exit()
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 0)
        .remove();

    var labels = n3.container.select('.labels').selectAll('text').data(n3.dataFilter('node'), function(e) { return e.id});
      labels.enter().append('text').filter(function(d) { return n3.timeLookup('displaylabels', 0)})
        .attr({
          class: 'label',
          x: function(d, i) { return n3.xScale(n3.timeLookup('coord', d.id)[0])+n3.options.labelOffset.x; },
          y: function(d, i) { return n3.yScale(n3.timeLookup('coord', d.id)[1])+n3.options.labelOffset.y; },
          opacity: 0
        })
        .text(function(d, i) { return n3.timeLookup('label', d.id); })
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 1)

      labels.transition().filter(function(d) { return n3.timeLookup('displaylabels', 0) !== false})
        .delay(edgeDuration)
        .duration(nodeDuration)
        .attr({
          x: function(d, i) { return n3.xScale(n3.timeLookup('coord', d.id)[0])+n3.options.labelOffset.x; },
          y: function(d, i) { return n3.yScale(n3.timeLookup('coord', d.id)[1])+n3.options.labelOffset.y; },
          opacity: 1
        })
        .text(function(d, i) { return n3.timeLookup('label', d.id); })

      labels.exit()
        .transition()
        .duration(edgeDuration)
        .attr('opacity', 0)
        .remove();
  }

  n3.prototype.resizeGraph = function() {
    var n3 = this;
    n3.initScales();
    var lines = n3.container.select('.edges').selectAll('.edge').data(n3.dataFilter('edge'), function(e) { return e.id})
      .attr({
        d: function(d) { return n3.getLineCoords(d, n3.currTime); },
      });

    var nodes = n3.container.select('.nodes').selectAll('.node').data(n3.dataFilter('node'), function(e) { return e.id})
      .attr({
        d: function(d, i) { return n3.drawPolygon(d) },
      });

    var labels = n3.container.select('.labels').selectAll('text').data(n3.dataFilter('node'), function(e) { return e.id})
      .attr({
        x: function(d, i) { return n3.xScale(n3.timeLookup('coord', d.id)[0])+n3.options.labelOffset.x; },
        y: function(d, i) { return n3.yScale(n3.timeLookup('coord', d.id)[1])+n3.options.labelOffset.y; },
      })

    //redraw the slider control 
    if (n3.options.slider) {
      var sliderDiv = n3.domTarget.select('.slider');
      sliderDiv.html('');
      sliderDiv.call(n3.slider);
    } 
  }

  n3.prototype.animateGraph = function(time, endTime, duration, noUpdate) {
    var n3 = this;
    if (time > n3.maxTime-1 || time < n3.minTime) { return; }

    duration = duration === undefined ? n3.options.defaultDuration : duration;
    endTime = endTime === undefined ? n3.maxTime : endTime;
    var nextTime;
    if (time == endTime) {
      nextTime = time;
    } else if (endTime > time) {
      nextTime = time +1;
    } else {
      nextTime = time -1;
    }

    n3.prevTime = n3.currTime;
    n3.currTime = time == n3.currTime ? nextTime : time;
    //console.log(n3.currTime + ' '+time+' '+endTime+ ' '+nextTime+ ' '+n3.prevTime)
    if(! noUpdate && n3.options.slider) {
      n3.slider.value(n3.timeIndex[n3.currTime].start);
    }
    n3.drawGraph(duration);
    if (n3.currTime != endTime) {
      n3.animate = setTimeout(function(){
        n3.animateGraph(nextTime, endTime, duration, noUpdate);
      }, duration)
    }
  }

  n3.prototype.endAnimation = function(){
    var n3 = this;
    clearTimeout(n3.animate);
  }

  return n3;
}));

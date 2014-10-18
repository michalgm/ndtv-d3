#Index

**Classes**

* [class: ndtv_d3](#ndtv_d3)
  * [new ndtv_d3()](#new_ndtv_d3)
  * [ndtv_d3.SVGSetup()](#ndtv_d3#SVGSetup)
  * [ndtv_d3.initScales()](#ndtv_d3#initScales)
  * [ndtv_d3.createDataChooser()](#ndtv_d3#createDataChooser)
  * [ndtv_d3.createPlayControls()](#ndtv_d3#createPlayControls)
  * [ndtv_d3.createSliderControl()](#ndtv_d3#createSliderControl)
  * [ndtv_d3.getLineCoords(d, usearrows, start)](#ndtv_d3#getLineCoords)
  * [ndtv_d3.loadData(graphData)](#ndtv_d3#loadData)
  * [ndtv_d3.drawGraph(duration)](#ndtv_d3#drawGraph)
  * [ndtv_d3.resizeGraph()](#ndtv_d3#resizeGraph)
  * [ndtv_d3.animateGraph(time, endTime, duration, noUpdate)](#ndtv_d3#animateGraph)
  * [ndtv_d3.moveTooltip()](#ndtv_d3#moveTooltip)
  * [ndtv_d3.hideTooltip()](#ndtv_d3#hideTooltip)
  * [ndtv_d3.endAnimation(noHalt)](#ndtv_d3#endAnimation)
  * [ndtv_d3.stepAnimation(reverse)](#ndtv_d3#stepAnimation)
  * [ndtv_d3.playAnimation(reverse)](#ndtv_d3#playAnimation)

**Constants**

* [const: default_options](#default_options)
* [const: ndtvProperties](#ndtvProperties)
* [const: graph](#graph)
 
<a name="ndtv_d3"></a>
#class: ndtv_d3
**Members**

* [class: ndtv_d3](#ndtv_d3)
  * [new ndtv_d3()](#new_ndtv_d3)
  * [ndtv_d3.SVGSetup()](#ndtv_d3#SVGSetup)
  * [ndtv_d3.initScales()](#ndtv_d3#initScales)
  * [ndtv_d3.createDataChooser()](#ndtv_d3#createDataChooser)
  * [ndtv_d3.createPlayControls()](#ndtv_d3#createPlayControls)
  * [ndtv_d3.createSliderControl()](#ndtv_d3#createSliderControl)
  * [ndtv_d3.getLineCoords(d, usearrows, start)](#ndtv_d3#getLineCoords)
  * [ndtv_d3.loadData(graphData)](#ndtv_d3#loadData)
  * [ndtv_d3.drawGraph(duration)](#ndtv_d3#drawGraph)
  * [ndtv_d3.resizeGraph()](#ndtv_d3#resizeGraph)
  * [ndtv_d3.animateGraph(time, endTime, duration, noUpdate)](#ndtv_d3#animateGraph)
  * [ndtv_d3.moveTooltip()](#ndtv_d3#moveTooltip)
  * [ndtv_d3.hideTooltip()](#ndtv_d3#hideTooltip)
  * [ndtv_d3.endAnimation(noHalt)](#ndtv_d3#endAnimation)
  * [ndtv_d3.stepAnimation(reverse)](#ndtv_d3#stepAnimation)
  * [ndtv_d3.playAnimation(reverse)](#ndtv_d3#playAnimation)

<a name="new_ndtv_d3"></a>
##new ndtv_d3()
Initialize a new ndtv-d3 instance

**Params**

-  `object` - An object of default options overrides  
-  `string` | `HTMLElement` - A CSS selector string or DOM element reference specifying the target dom element the network should be initialized to  

<a name="ndtv_d3#SVGSetup"></a>
##ndtv_d3.SVGSetup()
Initialize the SVG element and related DOM elements and listeners

<a name="ndtv_d3#initScales"></a>
##ndtv_d3.initScales()
sets positioning on svg elements based on current DOM container size and sets data scaling factors accordingly FIXME - rename?

<a name="ndtv_d3#createDataChooser"></a>
##ndtv_d3.createDataChooser()
creates the optional dataChooser element to be used for slecting among multiple JSON files for debugging

<a name="ndtv_d3#createPlayControls"></a>
##ndtv_d3.createPlayControls()
creates the optional play controls div using svg icons and defines the attached events

<a name="ndtv_d3#createSliderControl"></a>
##ndtv_d3.createSliderControl()
creates the time slider controls and defines attached events

<a name="ndtv_d3#getLineCoords"></a>
##ndtv_d3.getLineCoords(d, usearrows, start)
look up the coordinates for an edge given the time

**Params**

- d `object` - the D3 data object  
- usearrows `boolean` - If true, positions end of line offset of node radius to accomodate arrowhead  
- start `boolean` - If true, draws path using current node positions (before animation begins)  

<a name="ndtv_d3#loadData"></a>
##ndtv_d3.loadData(graphData)
load and process the JSON formatted data

**Params**

- graphData `url` | `JSON` - either a NDTV-generated JSON object, or a URL path to file containing JSON data  

<a name="ndtv_d3#drawGraph"></a>
##ndtv_d3.drawGraph(duration)
render the graph to reflect the state at currTime, transitioning elements over a given duration

**Params**

- duration `milliseconds` - the amount of time the transition animation should take  

<a name="ndtv_d3#resizeGraph"></a>
##ndtv_d3.resizeGraph()
resizes graph and other display elements to fill the target viewport

<a name="ndtv_d3#animateGraph"></a>
##ndtv_d3.animateGraph(time, endTime, duration, noUpdate)
graph animation controller

**Params**

- time `integer` - render the graph to the state at this timeslice index  
- endTime `integer` - function will recursively call itself until time equals this value  
- duration `milliseconds` - the amount of time the transition animation should take  
- noUpdate `boolean` - don't update time slider - FIXME - do we really need this?  

<a name="ndtv_d3#moveTooltip"></a>
##ndtv_d3.moveTooltip()
redraw the info popover //FIXME - needs renamed

<a name="ndtv_d3#hideTooltip"></a>
##ndtv_d3.hideTooltip()
hide the tooltip and unset the selected global

<a name="ndtv_d3#endAnimation"></a>
##ndtv_d3.endAnimation(noHalt)
stop the current animation cycle

**Params**

- noHalt `boolean` - if true, immediate halt all active transitions (otherwise, let animation continue to next time slice)  

<a name="ndtv_d3#stepAnimation"></a>
##ndtv_d3.stepAnimation(reverse)
step the animation by one time slice

**Params**

- reverse `boolean` - if true, go to previous time slice, else go forward  

<a name="ndtv_d3#playAnimation"></a>
##ndtv_d3.playAnimation(reverse)
animate the graph over all time slices, starting at current slice

**Params**

- reverse `boolean` - if true, animate slices backwards until beginning of time index, other play until end  

<a name="default_options"></a>
#const: default_options
Public options to control visualization functionality

**Type**: `object`  
**Default**: `{"animationDuration":800,"scrubDuration":0,"enterExitAnimationFactor":0,"labelOffset":"","nodeSizeFactor":0.01,"dataChooser":false,"dataChooserDir":"data/","playControls":true,"slider":true,"animateOnLoad":false,"margin":"","graphData":null}`  
<a name="ndtvProperties"></a>
#const: ndtvProperties
Supported NDTV network properties and their default values

**Type**: `object`  
**Default**: `{"graph":"","node":"","edge":""}`  
<a name="graph"></a>
#const: graph
**Type**: `object`  

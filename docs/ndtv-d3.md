#Index

**Modules**

* [ndtv-d3](#module_ndtv-d3)

**Classes**

* [class: ndtv_d3](#ndtv_d3)
  * [new ndtv_d3()](#new_ndtv_d3)
  * [ndtv_d3.SVGSetup(domTarget)](#ndtv_d3#SVGSetup)
  * [ndtv_d3.updateDimensions()](#ndtv_d3#updateDimensions)
  * [ndtv_d3.createDataChooser()](#ndtv_d3#createDataChooser)
  * [ndtv_d3.createMenu()](#ndtv_d3#createMenu)
  * [ndtv_d3.createPlayControls()](#ndtv_d3#createPlayControls)
  * [ndtv_d3.createSliderControl()](#ndtv_d3#createSliderControl)
  * [ndtv_d3.loadData(graphData)](#ndtv_d3#loadData)
  * [ndtv_d3.updateSelectedNetwork()](#ndtv_d3#updateSelectedNetwork)
  * [ndtv_d3.unSelectNetwork()](#ndtv_d3#unSelectNetwork)
  * [ndtv_d3.updateGraph(duration)](#ndtv_d3#updateGraph)
  * [ndtv_d3.resizeGraph()](#ndtv_d3#resizeGraph)
  * [ndtv_d3.animateGraph(time, endTime, immediate)](#ndtv_d3#animateGraph)
  * [ndtv_d3.moveTooltip()](#ndtv_d3#moveTooltip)
  * [ndtv_d3.convertCoords()](#ndtv_d3#convertCoords)
  * [ndtv_d3.hideTooltip()](#ndtv_d3#hideTooltip)
  * [ndtv_d3.endAnimation(noHalt)](#ndtv_d3#endAnimation)
  * [ndtv_d3.stepAnimation(reverse)](#ndtv_d3#stepAnimation)
  * [ndtv_d3.playAnimation(reverse)](#ndtv_d3#playAnimation)

**Constants**

* [const: default_options](#default_options)
* [const: ndtvProperties](#ndtvProperties)
 
<a name="module_ndtv-d3"></a>
#ndtv-d3
ndtv-d3 is a d3-based HTML5 network animation player for the ndtv package (http://cran.r-project.org/web/packages/ndtv/index.html)

The ndtv-d3 library was created by Greg Michalec and Skye Bender-deMoll for the statnet project http://statnet.org funded by NICHD grant R01HD068395.

This software is distributed under the GPL-3 license (http://choosealicense.com/licenses/gpl-3.0/).  It is free, open source, and has the attribution requirements (GPL Section 7) at http://statnet.org/attribution:

a. you agree to retain in ndtv-d3 and any modifications to ndtv-d3 the copyright, author attribution and URL information as provided at a http://statnetproject.org/attribution.

b. you agree that ndtv-d3 and any modifications to ndtv-d3 will, when used, display the attribution:

    Based on 'statnet' project software (http://statnetproject.org). For license and citation information see http://statnetproject.org/attribution

Copyright 2014 Statnet Commons http://statnet.org

To cite this project, please use:

Greg Michalec, Skye Bender-deMoll, Martina Morris (2014) 'ndtv-d3: an HTML5 network animation player for the ndtv package' The statnet project. http://statnet.org

<a name="ndtv_d3"></a>
#class: ndtv_d3
**Members**

* [class: ndtv_d3](#ndtv_d3)
  * [new ndtv_d3()](#new_ndtv_d3)
  * [ndtv_d3.SVGSetup(domTarget)](#ndtv_d3#SVGSetup)
  * [ndtv_d3.updateDimensions()](#ndtv_d3#updateDimensions)
  * [ndtv_d3.createDataChooser()](#ndtv_d3#createDataChooser)
  * [ndtv_d3.createMenu()](#ndtv_d3#createMenu)
  * [ndtv_d3.createPlayControls()](#ndtv_d3#createPlayControls)
  * [ndtv_d3.createSliderControl()](#ndtv_d3#createSliderControl)
  * [ndtv_d3.loadData(graphData)](#ndtv_d3#loadData)
  * [ndtv_d3.updateSelectedNetwork()](#ndtv_d3#updateSelectedNetwork)
  * [ndtv_d3.unSelectNetwork()](#ndtv_d3#unSelectNetwork)
  * [ndtv_d3.updateGraph(duration)](#ndtv_d3#updateGraph)
  * [ndtv_d3.resizeGraph()](#ndtv_d3#resizeGraph)
  * [ndtv_d3.animateGraph(time, endTime, immediate)](#ndtv_d3#animateGraph)
  * [ndtv_d3.moveTooltip()](#ndtv_d3#moveTooltip)
  * [ndtv_d3.convertCoords()](#ndtv_d3#convertCoords)
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
##ndtv_d3.SVGSetup(domTarget)
Initialize the SVG element and related DOM elements and listeners

**Params**

- domTarget `D3Selection` - DOM element to insert svg into  

<a name="ndtv_d3#updateDimensions"></a>
##ndtv_d3.updateDimensions()
sets positioning on svg elements based on current DOM container size and sets data scaling factors accordingly

<a name="ndtv_d3#createDataChooser"></a>
##ndtv_d3.createDataChooser()
creates the optional dataChooser element to be used for slecting among multiple JSON files for debugging

<a name="ndtv_d3#createMenu"></a>
##ndtv_d3.createMenu()
creates the optional menu element to be used for controlling settings and displaying 'about' link

<a name="ndtv_d3#createPlayControls"></a>
##ndtv_d3.createPlayControls()
creates the optional play controls div using svg icons and defines the attached events

<a name="ndtv_d3#createSliderControl"></a>
##ndtv_d3.createSliderControl()
creates the time slider controls and defines attached events

<a name="ndtv_d3#loadData"></a>
##ndtv_d3.loadData(graphData)
load and process the JSON formatted data

**Params**

- graphData `url` | `JSON` - either a NDTV-generated JSON object, or a URL path to file containing JSON data  

<a name="ndtv_d3#updateSelectedNetwork"></a>
##ndtv_d3.updateSelectedNetwork()
highlights the currently selected network

<a name="ndtv_d3#unSelectNetwork"></a>
##ndtv_d3.unSelectNetwork()
unhighlights the currently selected network

<a name="ndtv_d3#updateGraph"></a>
##ndtv_d3.updateGraph(duration)
render the graph to reflect the state at currTime, transitioning elements over a given duration

**Params**

- duration `milliseconds` - the amount of time the transition animation should take  

<a name="ndtv_d3#resizeGraph"></a>
##ndtv_d3.resizeGraph()
resizes graph and other display elements to fill the target viewport

<a name="ndtv_d3#animateGraph"></a>
##ndtv_d3.animateGraph(time, endTime, immediate)
graph animation controller

**Params**

- time `integer` - render the graph to the state at this timeslice index  
- endTime `integer` - function will recursively call itself until time equals this value  
- immediate `boolean` - should the graph update immediately, or animate?  

<a name="ndtv_d3#moveTooltip"></a>
##ndtv_d3.moveTooltip()
redraw the info popover //FIXME - needs renamed

<a name="ndtv_d3#convertCoords"></a>
##ndtv_d3.convertCoords()
get center point of edge or node, in DOM pixels

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
**Default**: `{"animationDuration":800,"enterExitAnimationFactor":0,"labelOffset":"","baseFontSize":"14","nodeSizeFactor":0.01,"dataChooser":false,"dataChooserDir":"data/","playControls":true,"slider":true,"menu":true,"animateOnLoad":false,"margin":"","graphData":null,"debugFrameInfo":false,"debugDurationControl":false}`  
<a name="ndtvProperties"></a>
#const: ndtvProperties
Supported NDTV network properties and their default values

**Type**: `object`  
**Default**: `{"graph":"","node":"","edge":""}`  

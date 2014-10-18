# Global





* * *

## Class: ndtv_d3
Initialize a new ndtv-d3 instance

**default_options**:  , Public options to control visualization functionality
**ndtvProperties**:  , Supported NDTV network properties and their default values
### ndtv_d3.SVGSetup() 

Initialize the SVG element and related DOM elements and listeners


### ndtv_d3.initScales() 

sets positioning on svg elements based on current DOM container size and sets data scaling factors accordingly FIXME - rename?


### ndtv_d3.createDataChooser() 

creates the optional dataChooser element to be used for slecting among multiple JSON files for debugging


### ndtv_d3.createPlayControls() 

creates the optional play controls div using svg icons and defines the attached events


### ndtv_d3.createSliderControl() 

creates the time slider controls and defines attached events


### ndtv_d3.getLineCoords(d, usearrows, start) 

look up the coordinates for an edge given the time

**Parameters**

**d**: `object`, the D3 data object

**usearrows**: `boolean`, If true, positions end of line offset of node radius to accomodate arrowhead

**start**: `boolean`, If true, draws path using current node positions (before animation begins)


### ndtv_d3.loadData(graphData) 

load and process the JSON formatted data

**Parameters**

**graphData**: `url | JSON`, either a NDTV-generated JSON object, or a URL path to file containing JSON data


### ndtv_d3.drawGraph(duration) 

render the graph to reflect the state at currTime, transitioning elements over a given duration

**Parameters**

**duration**: `milliseconds`, the amount of time the transition animation should take


### ndtv_d3.resizeGraph() 

resizes graph and other display elements to fill the target viewport


### ndtv_d3.animateGraph(time, endTime, duration, noUpdate) 

graph animation controller

**Parameters**

**time**: `integer`, render the graph to the state at this timeslice index

**endTime**: `integer`, function will recursively call itself until time equals this value

**duration**: `milliseconds`, the amount of time the transition animation should take

**noUpdate**: `boolean`, don't update time slider - FIXME - do we really need this?


### ndtv_d3.moveTooltip() 

redraw the info popover //FIXME - needs renamed


### ndtv_d3.hideTooltip() 

hide the tooltip and unset the selected global


### ndtv_d3.endAnimation(noHalt) 

stop the current animation cycle

**Parameters**

**noHalt**: `boolean`, if true, immediate halt all active transitions (otherwise, let animation continue to next time slice)


### ndtv_d3.stepAnimation(reverse) 

step the animation by one time slice

**Parameters**

**reverse**: `boolean`, if true, go to previous time slice, else go forward


### ndtv_d3.playAnimation(reverse) 

animate the graph over all time slices, starting at current slice

**Parameters**

**reverse**: `boolean`, if true, animate slices backwards until beginning of time index, other play until end




* * *











---
output: html_document
---
ndtv-d3 : Interactive HTML5 Network Graph Animation for NDTV-generated graphs using D3
=======

ndtv-d3 is an web-based interactive player app for animations of dynamic networks created with the [ndtv R package](http://cran.r-project.org/web/packages/ndtv/index.html). It takes JSON-formatted input files (normally produced by ndtv) describing the node positions, changing network relationships and graphic properties and displays them as a 'movie' illustrating the changes in a network object over time. The 'movie' is a zoomable, interactive SVG object with animation play controls and a scrub-able timeline for navigation.  

The ndtv-d3 library was created by Greg Michalec and Skye Bender-deMoll for the [statnet project](http://statnet.org) funded by NICHD grant R01HD068395. Based on 'statnet' project software (http://statnetproject.org). For license and attribution information, please see the [LICENSE file](https://github.com/michalgm/ndtv-d3/blob/master/LICENSE) or http://statnetproject.org/attribution

For a demo, please see http://michalgm.github.io/ndtv-d3

If the ndtv package is install in R, networks can be exported with
```
library(ndtv)  
data(short.stergm.sim)  
render.d3movie(short.stergm.sim)
```

For a quick vignette, see http://statnet.csde.washington.edu/workshops/SUNBELT/current/ndtv/ndtv-d3_vignette.html


Copyright 2015 Statnet Commons http://statnet.org

To cite this project, please use:
```
Greg Michalec, Skye Bender-deMoll, Martina Morris (2014) 'ndtv-d3: an HTML5 network animation player for the ndtv package' The statnet project. http://statnet.org
```

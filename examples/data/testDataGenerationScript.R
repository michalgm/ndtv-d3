# these files are R scripts to generate the example data files
# i'm including them all in one place so we can re-do when we make 
# changes to the export script
library(ndtv)

saveVideo=TRUE  # should video versions of the json files be rendered for debugging? (slower)
saveHTML=TRUE

# delete the various movie files so that they can be overwritten
unlink('inst/javascript/ndtv-d3/examples/data/shortStergm.mp4')
unlink('inst/javascript/ndtv-d3/examples/data/msmSim.mp4')
unlink('inst/javascript/ndtv-d3/examples/data/windsurfers.mp4')
unlink('inst/javascript/ndtv-d3/examples/data/mcfarlandClass.mp4')
unlink('inst/javascript/ndtv-d3/examples/data/EpiSim.mp4')

# this renders out a version of the 'flo-marriage' short.stergm.sim object
# added some arbitrary vertex attribute transformations to make it useful
# includes a formula rendered using 'show.stats' which should appear as the plot xlable
data(short.stergm.sim)
library(tergm)
compute.animation(short.stergm.sim)
render.d3movie(short.stergm.sim,filename='inst/javascript/ndtv-d3/examples/data/shortStergm.json',
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               render.par=list(show.stats="~edges+gwesp(0,fixed=TRUE)"),
               output.mode='JSON')
if(saveHTML){
  render.d3movie(short.stergm.sim,filename='inst/javascript/ndtv-d3/examples/data/shortStergm.html',
                 vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
                 vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
                 render.par=list(show.stats="~edges+gwesp(0,fixed=TRUE)"),
                 output.mode='HTML')
}

if(saveVideo){
saveVideo(render.animation(short.stergm.sim,
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               render.par=list(show.stats="~edges+gwesp(0,fixed=TRUE)"),render.cache='none'),video.name='inst/javascript/ndtv-d3/examples/data/shortStergm.mp4')
}

# msm.sim is a much larger network
# but still has static attributes
# it also has a bunch of deleted edges which will appear as blank entries on mel
data(msm.sim)
msm.sim <- compute.animation(msm.sim,slice.par=list(start=0,end=10,interval=1,aggregate.dur=3, rule='earliest'))
render.d3movie(msm.sim,filename='inst/javascript/ndtv-d3/examples/data/msmSim.json',
               vertex.sides=ifelse(msm.sim%v%'race'==1,3,4),  # change shape based on race
               edge.lwd=function(slice){runif(network.edgecount(slice),0.5,5)},# change edge width randomly
               vertex.cex=function(slice){sapply(1:network.size(slice),function(v){0.1+length(get.edgeIDs(slice,v))/4})}, # change sizes in proportion to number of edges
               displaylabels=FALSE,  # don't show labels
               output.mode='JSON'
               )
if (saveHTML){
  render.d3movie(msm.sim,filename='inst/javascript/ndtv-d3/examples/data/msmSim.html',
                 vertex.sides=ifelse(msm.sim%v%'race'==1,3,4),  # change shape based on race
                 edge.lwd=function(slice){runif(network.edgecount(slice),0.5,5)},# change edge width randomly
                 vertex.cex=function(slice){sapply(1:network.size(slice),function(v){0.1+length(get.edgeIDs(slice,v))/4})}, # change sizes in proportion to number of edges
                 displaylabels=FALSE,  # don't show labels
                 output.mode='HTML')
}
if (saveVideo){
saveVideo(render.animation(msm.sim,
                vertex.sides=ifelse(msm.sim%v%'race'==1,3,4),  # change shape based on race
                edge.lwd=function(slice){runif(network.edgecount(slice),0.5,5)},# change edge width randomly
                vertex.cex=function(slice){sapply(1:network.size(slice),function(v){0.1+length(get.edgeIDs(slice,v))/4})}, # change sizes in proportion to number of edges
                vertex.col='gray',
                displaylabels=FALSE,  # don't show labels
                render.cache = 'none'),
          video.name ='inst/javascript/ndtv-d3/examples/data/msmSim.mp4')
}

# example including vertex activity
# layout calculated with mdsj
# includes a main plot label
data(windsurfers)
slice.par<-list(start=0,end=24,interval=1,aggregate.dur=7,rule="latest")
windsurfers<-compute.animation(windsurfers,slice.par=slice.par, default.dist=3, animation.mode='MDSJ')
render.d3movie(windsurfers,
               vertex.col="group1", 
               edge.col="darkgray",
               displaylabels=TRUE,
               label.cex=.6,
               label.col="blue",
               main="Freeman's windsurfer contact network\nwith 7 day aggregation",
               bg='yellow',
               filename='inst/javascript/ndtv-d3/examples/data/windsurfers.json',
               output.mode='JSON')
if(saveHTML){
  render.d3movie(windsurfers,
                 vertex.col="group1", 
                 edge.col="darkgray",
                 displaylabels=TRUE,
                 label.cex=.6,
                 label.col="blue",
                 main="Freeman's windsurfer contact network\nwith 7 day aggregation",
                 bg='yellow',
                 filename='inst/javascript/ndtv-d3/examples/data/windsurfers.html',
                 output.mode='HTML')
}
if(saveVideo){
saveVideo(render.animation(windsurfers,
                           vertex.col="group1", 
                           edge.col="darkgray",
                           displaylabels=TRUE,
                           label.cex=.6,
                           label.col="blue",
                           main="Freeman's windsurfer contact network\nwith 7 day aggregation",
                           render.cache='none'),video.name='inst/javascript/ndtv-d3/examples/data/windsurfers.mp4')
}


# mcfarland example  this is in continous time with 0-duration events
data(McFarland_cls33_10_16_96)
slice.par<-list(start=0,end=40,interval=0.5,aggregate.dur=2.5,rule="latest")
compute.animation(cls33_10_16_96,slice.par=slice.par,animation.mode='MDSJ')
render.d3movie(cls33_10_16_96,filename='inst/javascript/ndtv-d3/examples/data/mcfarlandClass.json',output.mode='JSON',vertex.col='type',vertex.sides=ifelse(cls33_10_16_96%v%'gender'==1,4,50))

if(saveHTML){
  slice.par<-list(start=0,end=40,interval=0.5,aggregate.dur=2.5,rule="latest")
  compute.animation(cls33_10_16_96,slice.par=slice.par,animation.mode='MDSJ')
  render.d3movie(cls33_10_16_96,filename='inst/javascript/ndtv-d3/examples/data/mcfarlandClass.html',output.mode='HTML',vertex.col='type',vertex.sides=ifelse(cls33_10_16_96%v%'gender'==1,4,50))
}

if(saveVideo){
  saveVideo(render.animation(cls33_10_16_96,,vertex.col='type',vertex.sides=ifelse(cls33_10_16_96%v%'gender'==1,4,50),render.cache='none'), video.name='inst/javascript/ndtv-d3/examples/data/mcfarlandClass.mp4')
}

# example including edge and vertex labels
render.d3movie(short.stergm.sim,
               vertex.tooltip=function(slice){paste('name:',network.vertex.names(slice),"<br>",
                                                    'randomVal:',runif(network.size(slice)),"<br>",
                                                    'wealth:',slice%v%'wealth',"<br>",
                                                    'priorates:',slice%v%'priorates')},
               edge.tooltip="<span style='color:blue'>I have a blue label!</span>",
               displaylabels=FALSE,
               filename='inst/javascript/ndtv-d3/examples/data/tooltipTest.json',output.mode='JSON')
if(saveHTML){
render.d3movie(short.stergm.sim,
               vertex.tooltip=function(slice){paste('name:',network.vertex.names(slice),"<br>",
                                                    'randomVal:',runif(network.size(slice)),"<br>",
                                                    'wealth:',slice%v%'wealth',"<br>",
                                                    'priorates:',slice%v%'priorates')},
               edge.tooltip="<span style='color:blue'>I have a blue label!</span>",
               displaylabels=FALSE,
               filename='inst/javascript/ndtv-d3/examples/data/tooltipTest.html')
}

# example including html classes
test<-network.initialize(5)
test[,]<-1
activate.vertex.attribute(test,'vertex.css.class','myVertex1',onset=0,terminus=1)
activate.vertex.attribute(test,'vertex.css.class','myVertex2',onset=1,terminus=2)
activate.vertex.attribute(test,'vertex.label.css.class','myLabel1',onset=0,terminus=1)
activate.vertex.attribute(test,'vertex.label.css.class','myLabel2',onset=1,terminus=2)
activate.vertex.attribute(test,'edge.css.class','myEdge1',onset=0,terminus=1)
activate.vertex.attribute(test,'edge.css.class','myEdge2',onset=1,terminus=2)
render.d3movie(test,
               vertex.css.class=function(slice){slice%v%'vertex.css.class'},
               edge.css.class=function(slice){slice%e%'edge.css.class'},
               vertex.label.css.class=function(slice){slice%v%'vertex.label.css.class'},
               filename='cssClassTest.html')
if(saveHTML){
render.d3movie(test,
                 vertex.css.class=function(slice){slice%v%'vertex.css.class'},
                 edge.css.class=function(slice){slice%e%'edge.css.class'},
                 vertex.label.css.class=function(slice){slice%v%'vertex.label.css.class'},
               filename='cssClassTest.json',output.mode='JSON')
}



# epimodel example
library(EpiModel)

## Estimation
nw <- network.initialize(n = 100, directed = FALSE)
formation <- ~ edges
target.stats <- 50
dissolution <- ~ offset(edges)
coef.diss <- dissolution_coefs(dissolution, duration = 10)
est <- netest(nw,
              formation,
              dissolution,
              target.stats,
              coef.diss,
              verbose = FALSE)

## Epidemic simulation
param <- param.net(inf.prob = 0.8)
init <- init.net(i.num = 5)
control <- control.net(type = "SI", nsteps = 25, nsims = 1, verbose =
                         FALSE)
sim <- netsim(est, param, init, control)
## Movies
nw.sim <- get_network(sim)
nw.sim <- color_tea(nw.sim)

slice.par <- list(start = 1, end = 25, interval = 1,
                  aggregate.dur = 1, rule = "any")
render.par <- list(tween.frames = 10, show.time = FALSE)
plot.par <- list(mar = c(0, 0, 0, 0))

compute.animation(nw.sim, slice.par = slice.par)

render.d3movie(
  nw.sim,
  render.par = render.par,
  plot.par = plot.par,
  vertex.cex = 0.9,
  vertex.col = "ndtvcol",
  edge.col = "darkgrey",
  vertex.border = "lightgrey",
  displaylabels = FALSE,
  vertex.tooltip = function(slice){paste('name:',slice%v%'vertex.names','<br>','status:', slice%v%'testatus')},
  filename='inst/javascript/ndtv-d3/examples/data/EpiSim.json',output.mode='JSON')


if (saveHTML){
render.d3movie(
  nw.sim,
  render.par = render.par,
  plot.par = plot.par,
  vertex.cex = 0.9,
  vertex.col = "ndtvcol",
  edge.col = "darkgrey",
  vertex.border = "lightgrey",
  displaylabels = FALSE,
  vertex.tooltip = function(slice){paste('name:',slice%v%'vertex.names','<br>','status:', slice%v%'testatus')},
  filename='inst/javascript/ndtv-d3/examples/data/EpiSim.html')
}

if(saveVideo){

saveVideo(render.animation(
  nw.sim,
  render.par = render.par,
  plot.par = plot.par,
  vertex.cex = 0.9,
  vertex.col = "ndtvcol",
  edge.col = "darkgrey",
  vertex.border = "lightgrey",
  displaylabels = FALSE,render.cache='none'), ani.width = 500, ani.height = 500, video.name='inst/javascript/ndtv-d3/examples/data/EpiSim.mp4')

}


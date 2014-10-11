# these files are R scripts to generate the example data files
# i'm including them all in one place so we can re-do when we make 
# changes to the export script
library(ndtv)


# this renders out a version of the 'flo-marriage' short.stergm.sim object
# added some arbitrary vertex attribute transformations to make it useful
# includes a formula rendered using 'show.stats' which should appear as the plot xlable
data(short.stergm.sim)
library(tergm)
compute.animation(short.stergm.sim)
render.d3movie(short.stergm.sim,filename='js/ndtv-d3/data/shortStergm.json',
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               render.par=list(show.stats="~edges+gwesp(0,fixed=TRUE)"))
saveVideo(render.animation(short.stergm.sim,
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               render.par=list(show.stats="~edges+gwesp(0,fixed=TRUE)"),render.cache='none'),video.name='js/ndtv-d3/data/shortStergm.mp4')

# msm.sim is a much larger network
# but still has static attributes
# it also has a bunch of deleted edges which will appear as blank entries on mel
data(msm.sim)
msm.sim <- compute.animation(msm.sim,slice.par=list(start=0,end=10,interval=1,aggregate.dur=3, rule='earliest'))
render.d3movie(msm.sim,filename='js/ndtv-d3/data/msmSim.json',
               vertex.sides=ifelse(msm.sim%v%'race'==1,3,4),  # change shape based on race
               edge.lwd=function(slice){runif(network.edgecount(slice),0.5,5)},# change edge width randomly
               vertex.cex=function(slice){sapply(1:network.size(slice),function(v){0.1+length(get.edgeIDs(slice,v))/2})}, # change sizes in proportion to number of edges
               displaylabels=FALSE  # don't show labels
               )

saveVideo(render.animation(msm.sim,
                vertex.sides=ifelse(msm.sim%v%'race'==1,3,4),  # change shape based on race
                edge.lwd=function(slice){runif(network.edgecount(slice),0.5,5)},# change edge width randomly
                vertex.cex=function(slice){sapply(1:network.size(slice),function(v){0.1+length(get.edgeIDs(slice,v))/2})}, # change sizes in proportion to number of edges
                vertex.col='gray',
                displaylabels=FALSE,  # don't show labels
                render.cache = 'none'),
          video.name ='js/ndtv-d3/data/msmSim.mp4')


# example including vertex activity
# layout calculated with mdsj
# includes a main plot label
data(windsurfers)
slice.par<-list(start=0,end=24,interval=1,aggregate.dur=7,rule="latest")
windsurfers<-compute.animation(windsurfers,slice.par=slice.par, default.dist=3, animation.mode='MDSJ')
saveVideo(render.animation(windsurfers,
                           vertex.col="group1", 
                           edge.col="darkgray",
                           displaylabels=TRUE,
                           label.cex=.6,
                           label.col="blue",
                           main="Freeman's windsurfer contact network\nwith 7 day aggregation",
                           render.cache='none'),video.name='js/ndtv-d3/data/windsurfers.mp4')
render.d3movie(windsurfers,
               vertex.col="group1", 
               edge.col="darkgray",
               displaylabels=TRUE,
               label.cex=.6,
               label.col="blue",
               main="Freeman's windsurfer contact network\nwith 7 day aggregation",
               bg='yellow',
               filename='js/ndtv-d3/data/windsurfers.json')

# example including html classes



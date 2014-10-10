# these files are R scripts to generate the example data files
# i'm including them all in one place so we can re-do when we make 
# changes to the export script
library(ndtv)


# this renders out a version of the 'flo-marriage' short.stergm.sim object
# added some arbitrary vertex attribute transformations to make it useful
data(short.stergm.sim)
compute.animation(short.stergm.sim)
render.d3movie(short.stergm.sim,filename='js/ndtv-d3/data/shortStergm.json',
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               show.stats="~edges+gwesp(0,fixed=TRUE)")
saveVideo(render.animation(short.stergm.sim,
               vertex.col=function(slice,onset){rgb(((slice%v%'wealth')/146),0.5,0.5)},
               vertex.cex=function(slice,onset){slice%v%'wealth'/100+onset},
               show.stats="~edges+gwesp(0,fixed=TRUE)",render.cache='none'),video.name='js/ndtv-d3/data/shortStergm.mp4')

# msm.sim is a much larger network
# but still has static attributes
data(msm.sim)
msm.sim <- compute.animation(msm.sim,slice.par=list(start=0,end=10,interval=1,aggregate.dur=3, rule='earliest'))
render.d3movie(msm.sim,filename='js/ndtv-d3/data/msmSim.json')
saveVideo(render.animation(msm.sim,render.cache = 'none'),video.name ='js/ndtv-d3/data/msmSim.mp4' )


# example including vertex activity
data(windsurfers)
slice.par<-list(start=0,end=24,interval=1,aggregate.dur=7,rule="latest")
windsurfers<-compute.animation(windsurfers,slice.par=slice.par, default.dist=3, animation.mode='MDSJ')
saveVideo(render.animation(windsurfers,vertex.col="group1", edge.col="darkgray",displaylabels=TRUE,label.cex=.6,label.col="blue",render.cache='none'),video.name='js/ndtv-d3/data/windsurfers.json.mp4')
render.d3movie(windsurfers,vertex.col="group1", edge.col="darkgray",displaylabels=TRUE,label.cex=.6,label.col="blue",filename='js/ndtv-d3/data/windsurfers.json')

# example including html classes



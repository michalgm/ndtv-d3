<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel='stylesheet' href='../src/lib/d3.slider.css'/>
    <link rel='stylesheet' href='../src/css/styles.css'/>
  </head>
  <body>
    <script src="../src/lib/d3/d3.min.js" charset="utf-8"></script>
    <script src="../src/lib/jquery/dist/jquery.min.js"></script>
    <script src="../src/lib/d3.slider.js"></script>
    <script src="../src/js/ndtv-d3.js"></script>
    <script>
      //INIT GRAPH DATA HERE
      var graphData = {};
      var options = {};
      //END GRAPH DATA INIT
	   
      //Insert init JS Here
      $(function() {
        options.graphData = graphData;
        graph = new ndtv_d3(options);        
		  })
    </script>
  </body>
</html>

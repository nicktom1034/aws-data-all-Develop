from jinja2 import Template

TEMPLATE = """
<!doctype html>

<meta charset="utf-8">
<title>Dagre D3 Renderer Demo</title>

<script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
<script src="https://www.unpkg.com/dagre-d3@0.6.4/dist/dagre-d3.js"></script>

<style>

  body {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
    background: #333;
  }


  @-webkit-keyframes flash {
    0%, 50%, 100% {
      opacity: 1;
    }

    25%, 75% {
      opacity: 0.2;
    }
  }

  @keyframes flash {
    0%, 50%, 100% {
      opacity: 1;
    }

    25%, 75% {
      opacity: 0.2;
    }
  }

  .warn {
    -webkit-animation-duration: 5s;
    animation-duration: 5s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-iteration-count: 1;
    animation-iteration-count: 1;
  }

  .live.map {
    width: 100%;
    height: 100%;
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .live.map text {
    font-weight: 300;
    font-size: 14px;
  }

  .live.map .node rect {
    stroke-width: 1.5px;
    stroke: #bbb;
    fill: #666;
  }

  .live.map .status {
    height: 100%;
    width: 15px;
    display: block;
    float: left;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    margin-right: 4px;
  }

  .live.map .running .status {
    background-color: #7f7;
  }

  .live.map .running.warn .status {
    background-color: #ffed68;
  }

  .live.map .stopped .status {
    background-color: #f77;
  }

  .live.map .warn .queue {
    color: #f77;
  }

  .warn {
    -webkit-animation-name: flash;
    animation-name: flash;
  }

  .live.map .consumers {
    margin-right: 2px;
  }

  .live.map .consumers,
  .live.map .name {
    margin-top: 4px;
  }

  .live.map .consumers:after {
    content: "";
  }

  .live.map .queue {
    display: block;
    float: left;
    width: 130px;
    height: 20px;
    font-size: 12px;
    margin-top: 2px;
  }

  .live.map .node g div {
    width: 200px;
    height: 40px;
    color: #fff;
  }

  .live.map .node g div span.consumers {
    display: inline-block;
    width: 20px;
  }

  .live.map .edgeLabel text {
    width: 50px;
    fill: #fff;
  }

  .live.map .edgePath path {
    stroke: #999;
    stroke-width: 1.5px;
    fill: #999;
  }
</style>

<body>
<div class="live map">
  <svg><g/></svg>
</div>

<script>

  var workers = {{nodes}}

  // Set up zoom support
  var svg = d3.select("svg"),
      inner = svg.select("g"),
      zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
      });
  svg.call(zoom);

  var render = new dagreD3.render();

  // Left-to-right layout
  var g = new dagreD3.graphlib.Graph();
  g.setGraph({
    nodesep: 70,
    ranksep: 50,
    rankdir: "LR",
    marginx: 20,
    marginy: 20
  });

  function draw(isUpdate) {
    for (var id in workers) {
      var worker = workers[id];
      var className = worker.status=="success" ? "success" : "warn";
      
      var html=`<div class="${className}"> ${worker.name} (${worker.status})</div>`
      g.setNode(id, {
        labelType: "html",
        label: html,
        rx: 5,
        ry: 5,
        padding: 0,
        class: className
      });

      if (worker.parents) {
		  if (worker.parents.push){
			worker.parents.forEach((q)=>{
				g.setEdge(q, id, {width: 40});
			})
		  }else {
			 g.setEdge(worker.parents, id, {width: 40});
		  }
      }
    }

    inner.call(render, g);

    // Zoom and scale to fit
    var graphWidth = g.graph().width + 80;
    var graphHeight = g.graph().height + 40;
    var width = parseInt(svg.style("width").replace(/px/, ""));
    var height = parseInt(svg.style("height").replace(/px/, ""));
    var zoomScale = Math.min(width / graphWidth, height / graphHeight);
    var translateX = (width / 2) - ((graphWidth * zoomScale) / 2)
    var translateY = (height / 2) - ((graphHeight * zoomScale) / 2);
    var svgZoom = isUpdate ? svg.transition().duration(500) : svg;
    svgZoom.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(zoomScale));
  }

  // Do some mock queue status updates
  

  // Initial draw, once the DOM is ready
  document.addEventListener("DOMContentLoaded", draw);
</script>
</body>
</html>
"""


def render(nodes):
    tpl = Template(TEMPLATE)
    return tpl.render(nodes=nodes)

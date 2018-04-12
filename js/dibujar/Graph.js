var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function newSVG(){
  svg = d3.select("svg");
  width = +svg.attr("width");
  height = +svg.attr("height");
}

function dibujarGraph(graph) {

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 7)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  // node.append("text")
  //     .attr("x", function(d){ return d.x; })
  //     .attr("y", function(d){ return d.x; })
  //     .text(function(d) { 
  //         var puntoRegExp = new RegExp(/\./g);
  //         puntoRegExp.exec(d.id);
  //         puntoRegExp.exec(d.id);
  //         puntoRegExp.exec(d.id);
  //         var last = parseInt(d.id.substring(puntoRegExp.lastIndex));
  //         return last; 
  //       })
  //     .attr("fill", "black")
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", "20px");

  // var text = node.append("text")
  //     .text(function(d) { 
  //         var puntoRegExp = new RegExp(/\./g);
  //         puntoRegExp.exec(d.id);
  //         puntoRegExp.exec(d.id);
  //         puntoRegExp.exec(d.id);
  //         var last = parseInt(d.id.substring(puntoRegExp.lastIndex));
  //         return last; 
  //       })
  //     .attr("fill", "black")
  //     .attr("font-family", "sans-serif");

  node.append("title")
      // .text(function(d) { return d.id; });

  // var texto = svg.selectAll("text")
  //   .data(graph.nodes)
  //   .enter()
  //   .append("text")
  //   .text(function(d){
  //       var puntoRegExp = new RegExp(/\./g);
  //       puntoRegExp.exec(d.id);
  //       puntoRegExp.exec(d.id);
  //       puntoRegExp.exec(d.id);
  //       var last = parseInt(d.id.substring(puntoRegExp.lastIndex));
  //       return last;
  //   })
  //   .attr("font-family", "sans-serif")
  //   .attr("font-size", "10px");

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    // texto
    //     .attr("x", function(d){ return d.x + 3.5; })
    //     .attr("y", function(d){ return d.y + 3.5; })
  }
}

function dragstarted(d) {
  if(d["id"] != "internet"){
    $("#ip").text(d["id"]);
    $("#ip").attr('href', "http://"+d["id"]);
    tablaInformativa(d["id"], informacion);
    // $('#infoModal').modal('toggle');
    ipSeleccionado = d["id"];
  }else{
    ipSeleccionado = null;
  }

  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
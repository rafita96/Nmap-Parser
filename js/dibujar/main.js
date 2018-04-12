var puntoRegExp = new RegExp(/\./g);
var informacion = null;
var ipSeleccionado = null;
$(document).ready(function(){
    document.getElementById('file').addEventListener('change', readSingleFile, false);
    document.getElementById('descargar').addEventListener('click', function(){
        if(informacion != null){
            var texto = JSON.stringify(informacion);

            var blob = new Blob([texto], {
                type: "text/plain;charset=utf-8;",
            });
            saveAs(blob, "mapa.json");        }
    });

    document.getElementById("agregar").addEventListener("click", function(){
        agregarCampo();
    });

});

function agregarCampo(){
    if(ipSeleccionado != null){
        var key = $("#key").val();
        var propiedad = $("#propiedad").val();

        if(key != "" && propiedad != ""){
            informacion[ipSeleccionado]["extra"][key] = propiedad;

            var extra_div = document.getElementById("extra");
            var tabla = $(extra_div).find("table");
            if(tabla.length == 0){
                tablaInformativaExtra(ipSeleccionado, informacion);
            }else{
                agregarFilaTablaExtra(tabla[0], key, informacion[ipSeleccionado]["extra"]);
            }

            $("#key").val("");
            $("#propiedad").val("");
        }else{
            console.log("Esta vacio");
        }

    }else{
        console.log("No has seleccionado un nodo");
    }
};

function readSingleFile(evt) {
    var f = evt.target.files[0]; 

    if (!f) {
        console.log("Fallo al cargar el archivo.");
    } else {
        var r = new FileReader();
        r.onload = function(e) {
            if(informacion == null){
                if(e.target.result.charAt(0) == "<"){
                    informacion =  xmlnmap2json(e.target.result);
                }else{
                    informacion = JSON.parse(e.target.result);
                }
            }else{
                if(e.target.result.charAt(0) == "<"){
                    var extra = xmlnmap2json(e.target.result);
                }
                else{
                    var extra = JSON.parse(e.target.result);
                }
                agregarInfo(extra);
                d3.select("svg").remove();
                d3.select("#mapa")
                    .append('svg')
                    .attr('width', 1320)
                    .attr('height', 860)
                    .attr("viewBox","0 0 1640 860");
                newSVG();
            }
            // console.log(informacion);
            var grafo = construirGrafo(informacion);
            dibujarGraph(grafo);
            // dibujar(informacion);
        }
    }

    r.readAsText(f);
}

function ordenarIps(ips, informacion){

    var ordenado = {};
    for(var i = 0; i < ips.length; i++){
        var ip = ips[i];
        var puntoRegExp = new RegExp(/\./g);
        puntoRegExp.exec(ip);
        puntoRegExp.exec(ip);
        puntoRegExp.exec(ip);
        
        var key = ip.substring(0,puntoRegExp.lastIndex-1);
        if(key in ordenado){
            ordenado[key].push(ip) 
        }else{
            ordenado[key] = [ip] 
        }
    }

    for(key in ordenado){
        ordenado[key].sort(function(ip1, ip2){
            var temp1 = ip1.split(".");
            var temp2 = ip2.split(".");

            return parseInt(temp1[3]) - parseInt(temp2[3]);
        });
    }

    var bloques = [];

    for(key in ordenado){

        for (var i = 0; i < ordenado[key].length; i++) {
            var ip = ordenado[key][i];
            var servicios = informacion[ip]["services"];
            if(isSwitch(servicios)){
                bloques.push([ip]);
            }else{
                if(bloques.length > 0){
                    bloques[bloques.length-1].push(ip);
                }else{
                    bloques.push([ip]);
                }
            }
        }
    }

    return bloques;
}

function construirGrafo(informacion){
    var grafo = {nodes: [{id: "internet", group: 0}], links: []};
    var ips = new Array();
    for (var key in informacion) {
        ips.push(key);
    }

    var bloques = ordenarIps(ips, informacion);
    for (var i = 0; i < bloques.length; i++) {
        var bloque = bloques[i];
        var switchIp = bloque[0];

        grafo["nodes"].push({id: switchIp, group: i+1});
        grafo["links"].push({source: switchIp, target: "internet", value: (i+1)*2});

        for(var j = 1; j < bloque.length; j++){
            var ip = bloque[j];
            grafo["nodes"].push({id: ip, group: i+1});
            grafo["links"].push({source: ip, target: switchIp, value: j*2});
        }
    }
    
    return grafo;
};

function isSwitch(servicios){
    if(servicios.length > 1){
        return false;
    }
    for(var j = 0; j < servicios.length; j++){
        var servicio = servicios[j];
        if(servicio["name"] == "telnet"){
            return true;
        }
    }
    return false;
}

function getNewCol(tam = null){
    var col = document.createElement("div");
    if(tam === null){
        col.setAttribute("class","col border");
    }else{
        col.setAttribute("class","col-"+tam+" border");
    }
    return col;
}

function getNewRow(){
    var row = document.createElement("div");
    row.setAttribute("class","row col-12");
    row.setAttribute("style","margin: 10px;");
    return row;
}

function addText(row, titulo, texto){
    var row_in = getNewRow();

    var col = getNewCol();
    var label = document.createElement("label");
    label.innerHTML = titulo+":";
    col.appendChild(label);
    row_in.appendChild(col);

    var col = getNewCol();
    var info = document.createElement("div");
    info.innerHTML = texto;
    col.appendChild(info);
    row_in.appendChild(col);

    row.appendChild(row_in);
}

function agregarFilaTablaExtra(tabla, key, informacion){
    var tr = document.createElement("tr");

    var td = document.createElement("td");
    td.innerHTML = key;
    tr.appendChild(td);

    td = document.createElement("td");
    td.innerHTML = informacion[key];
    tr.appendChild(td);

    tabla.appendChild(tr);
}

function tablaInformativaExtra(ip, informacion){
    var extra_div = document.getElementById("extra");

    var tabla = document.createElement("table");
    tabla.setAttribute("class", "table table-bordered");
    extra_div.appendChild(tabla);
    for(key in informacion[ip]["extra"]){

        agregarFilaTablaExtra(tabla, key, informacion[ip]["extra"]);
    }
};

function tablaInformativa(ip, informacion){
    var div = document.getElementById("servicios");
    div.innerHTML = "";
    var extra_div = document.getElementById("extra");
    extra_div.innerHTML = "";

    var servicios = informacion[ip]["services"];
    for(var i = 0; i < servicios.length; i++)
    {
        var tabla = document.createElement("table");
        tabla.setAttribute("class", "table table-bordered");
        div.appendChild(tabla);

        var servicio = servicios[i];
        var tr = document.createElement("tr");

        var th = document.createElement("th");
        th.innerHTML = "Puerto";
        th.setAttribute("class", "col-2");
        tr.appendChild(th);

        th = document.createElement("th");
        th.innerHTML = servicio["port"];
        th.setAttribute("class", "col");
        tr.appendChild(th);
        tabla.appendChild(tr);

        for(key in servicio){
            if(key != "port"){
                var tr = document.createElement("tr");

                var td = document.createElement("td");
                td.innerHTML = key;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = servicio[key];
                tr.appendChild(td);

                tabla.appendChild(tr);
            }
        }

        div.appendChild(tabla);
    }

    if(Object.keys(informacion[ip]["extra"]).length > 0){
        // var titulo = document.createElement("h3");
        // titulo.setAttribute("class", "text-center");
        // titulo.innerHTML = "Información Extra";
        // extra_div.appendChild(titulo);

        tablaInformativaExtra(ip, informacion);
    }
}

function construirColumna(ip, informacion, row, swt){
    var img = new Image();
    if(swt){
        img.src = "img/switch.png";
        img.width = 64;
        img.height = 32;
    }else{
        img.src = "img/pc.png";
        img.width = 54;
        img.height = 64;
    }

    // Columna que engloba todo
    var col = getNewCol();
    row.appendChild(col);

    var row_in = getNewRow();
    row_in.appendChild(img);
    col.appendChild(row_in);

    var row_in = getNewRow();
    var label = document.createElement("label");
    label.innerHTML = ip;
    row_in.appendChild(label);
    col.appendChild(row_in);

    col.addEventListener("click", function(){
        $("#ip").text(ip);
        $("#ip").attr('href', "http://"+ip);
        tablaInformativa(ip, informacion);
        $('#infoModal').modal('toggle');
    });
}

function construirFila(ips, informacion, row){
    construirColumna(ips[0], informacion, row, true);
    for (var i = 1; i < ips.length; i++) {
        construirColumna(ips[i], informacion, row, false);
    }
}

function dibujar(informacion){
    var ips = new Array();
    for (var key in informacion) {
        ips.push(key);
    }

    var bloques = ordenarIps(ips, informacion);
    // console.log(bloques); 
    var div = document.getElementById("red");
    for (var i = 0; i < bloques.length; i++) {
        var row = getNewRow();
        div.appendChild(row);

        construirFila(bloques[i], informacion, row);
    }
}

function agregarInfo(extra){
    
    for(key in extra){
        if(informacion.hasOwnProperty(key)){
            informacion[key] = extra[key];
        }else{
            informacion[key] = extra[key];
        }
    }
};
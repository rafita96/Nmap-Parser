var puntoRegExp = new RegExp(/\./g);

$(document).ready(function(){
    document.getElementById('file').addEventListener('change', readSingleFile, false);
});

function readSingleFile(evt) {
    var f = evt.target.files[0]; 

    if (!f) {
        console.log("Fallo al cargar el archivo.");
    } else {
        var r = new FileReader();
        r.onload = function(e) {
            var informacion =  xmlnmap2json(e.target.result);
            // console.log(informacion);
            dibujar(informacion);
        }
    }

    r.readAsText(f);
}

function ordenarIps(ips, informacion){
    ips.sort(function(ip1, ip2){
        var puntoRegExp = new RegExp(/\./g);
        puntoRegExp.exec(ip1);
        puntoRegExp.exec(ip1);
        puntoRegExp.exec(ip1);
        var last1 = parseInt(ip1.substring(puntoRegExp.lastIndex));

        var puntoRegExp = new RegExp(/\./g);
        puntoRegExp.exec(ip2);
        puntoRegExp.exec(ip2);
        puntoRegExp.exec(ip2);
        var last2 = parseInt(ip2.substring(puntoRegExp.lastIndex));

        return last1 - last2;
    });

    var bloques = [];

    for (var i = 0; i < ips.length; i++) {
        var ip = ips[i];
        var servicios = informacion[ip]["services"];
        if(isSwitch(servicios)){
            bloques.push([ip]);
        }else{
            bloques[bloques.length-1].push(ip);
        }
    }

    return bloques;
}

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
        var titulo = document.createElement("h3");
        titulo.setAttribute("class", "text-center");
        titulo.innerHTML = "Información Extra";
        extra_div.appendChild(titulo);

        var tabla = document.createElement("table");
        tabla.setAttribute("class", "table table-bordered");
        extra_div.appendChild(tabla);
        for(key in informacion[ip]["extra"]){
            var tr = document.createElement("tr");

            var td = document.createElement("td");
            td.innerHTML = key;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = informacion[ip]["extra"][key];
            tr.appendChild(td);

            tabla.appendChild(tr);
        }
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
function xmlParser(text){
    var parser = new DOMParser();
    var xml = parser.parseFromString(text,"text/xml");

    return xml;
}

function xmlnmap2json(text){
	var xml = xmlParser(text);
	var hosts = xml.getElementsByTagName("nmaprun")[0].getElementsByTagName("host");

	var ips = {};
	for(var i = 0; i < hosts.length; i++){
		var host = hosts[i];

		var ip = host.getElementsByTagName("address")[0].getAttribute('addr');
		var puertos = host.getElementsByTagName("ports")[0].getElementsByTagName("port");

		var servicios = [];
		ips[ip] = {};
		ips[ip]["services"] = servicios;
		ips[ip]["extra"] = {};
		for(var j = 0; j < puertos.length; j++){
			var info = {};
			var puerto = puertos[j];

			info["port"] = puerto.getAttribute('portid');
			info["protocol"] = puerto.getAttribute("protocol");

			var statetag = puerto.getElementsByTagName("state")[0];
			info["state"] = statetag.getAttribute("state");
			info["reason"] = statetag.getAttribute("reason");

			var servicetag = puerto.getElementsByTagName("service")[0];
			info["name"] = servicetag.getAttribute("name");

			if(servicetag.hasAttribute("product")){
				info["product"] = servicetag.getAttribute("product");
			}
			if(servicetag.hasAttribute("version")){
				info["version"] = servicetag.getAttribute("version");
			}
			if(servicetag.hasAttribute("hostname")){
				info["hostname"] = servicetag.getAttribute("hostname");
			}

			if(servicetag.hasAttribute("ostype") && ips[ip]["extra"].ostype === undefined){
				ips[ip]["extra"].ostype = servicetag.getAttribute("ostype");
			}

			if((cpetag = servicetag.getElementsByTagName("cpe")).length > 0 && ips[ip]["extra"].cpe === undefined){
				ips[ip]["extra"].cpe = cpetag[0].textContent;
			}
			
			servicios.push(info);
		}

	}
	return ips;
}
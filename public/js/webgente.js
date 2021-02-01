var viewInicial = {
    lat: -20.754645,
    lng: -42.873973110001806,
    zoom: 17
}

var map = L.map('map').setView([viewInicial.lat, viewInicial.lng], viewInicial.zoom);

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var google = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

var baseMaps = {
    'OpenStreetMaps' : osm,
    'Google Satelite' : google
};

var overlayMaps = {};

lc = L.control.layers(baseMaps,overlayMaps).addTo(map);

/* Inicializando o mapa */

var initView = {
    lat: -20.754645, // Latitude Inicial
    lng: -42.873973110001806, // Longitude Inicial
    zoom: 17 // Zoom Inicial
}

var map = L.map('map').setView([initView.lat, initView.lng], initView.zoom);

/* Camadas base do OpenStreetMaps e Google */

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var google = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

/* Inicializa o Controle de Camadas */

var baseMaps = {
    'OpenStreetMaps' : osm,
    'Google Satelite' : google
};

var overlayMaps = {};

lc = L.control.layers(baseMaps,overlayMaps).addTo(map);

/* Inicializando o mapa, initView é inicializado dentro de uma tag script do index.ejs pois recebe dados do backend */

var map = L.map('map').setView([initView.lat, initView.lng], initView.zoom);

/* Adicionando escala gráfica ao mapa */

var optionsScale = {
    metric: true, //Define a unidade em m/km
    imperial: false //Define a unidade em mi/ft
};

L.control.scale(optionsScale).addTo(map);

/* Camadas base do OpenStreetMaps e Google */

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var google = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

/* Inicializa o Controle de Camadas com as Camadas Base Estáticas */

var baseMaps = {
    'OpenStreetMaps' : osm,
    'Google Satelite' : google
};

var overlayMaps = {};

var optionsControl = {
    collapsed: true,
    groupsCollapsable: true,
    groupCheckboxes: true
};

Lc = L.control.groupedLayers(baseMaps,overlayMaps,optionsControl).addTo(map);

/* Lendo camadas da Base de Dados e adicionando ao controle */

var metadata = '<a href="/metadata/CAD_Lote.txt" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>'

function addLayer (layer){
    if (layer.type == 2) { // Adiciona como Overlay

        var l = L.tileLayer.gfiWMS(layer.host,{
            layers: layer.layer,
            format: 'image/png',
            transparent: true,
            attribution: layer.attribution,
            maxZoom: 30
        });
        if (layer.defaultBaseLayer == 1) {
            Lc.addOverlay(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>', layer.group);
            l.addTo(map);
        } else {
            Lc.addOverlay(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>', layer.group);
        };
    
    } else { // Adiciona como Base

        var l = L.tileLayer.wms(layer.host,{
            layers: layer.layer,
            format: 'image/jpeg',
            transparent: false,
            attribution: layer.attribution,
            maxZoom: 30
        })
        if (layer.defaultBaseLayer == 1) {
            Lc.addBaseLayer(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>');
            l.addTo(map);
        } else {
            Lc.addBaseLayer(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>');
        };
    }
};

$.get('/listlayers',function(data){
    console.log("1");
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        addLayer(element)
    }
},'json');

/* Inicializando botões de ferramentas */

// Adicionando botão de set view para visao inicial
var home = L.easyButton('<img src="img/home.png">', function(btn, map){
    var initial = [initView.lat,initView.lng];
    map.setView(initial,initView.zoom);
},'Voltar o mapa à vista inicial').addTo(map);

// Adiciona o botao de visualizar informacoes com dois estados
var gfi = false; // Variável que habilita o GetFeatureInfo
var info = L.easyButton({
    states: [{
                stateName: 'info_disabled',
                icon:      '<img src="img/info_enabled.png">',
                title:     'Habilita a ferramenta de visualização de informações das camadas',   
                onClick: function(btn) {       
                    info.state('info_enabled');
                    btn.state('info_enabled');  
                    gfi=true;  
                }
            }, {
                stateName: 'info_enabled',   
                icon:      '<img src="img/info_disabled.png">',               
                title:     'Desabilita a ferramenta de visualização de informações das camadas',
                onClick: function(btn) {
                    info.state('info_disabled');
                    btn.state('info_disabled'); 
                    gfi=false;   
                }
        }]
    }).addTo(map);

// Adiciona botao para ativar a ferramenta de pesquisas
var pesquisas = L.easyButton('<img src="img/lupa.png">', function(){
    $.get('/listqueryable',function(data){
    queryLayers(data);
},'json');
},'Habilitar ferramenta de pesquisa por atributo nas camadas').addTo(map);

// 
L.DomEvent.disableScrollPropagation(L.DomUtil.get('search'));

// Adiciona botão para habilitar ou desabilitar a legenda

var legend = L.easyButton({
    id: 'legend-button',
    states: [{
                stateName: 'legend_enabled',   
                icon:      '<img src="img/legend_enabled.png">',               
                title:     'Desabilita a legenda',
                onClick: function(btn) {
                    info.state('legend_disabled');
                    btn.state('legend_disabled');
                    document.getElementById('webgente-legend-container').style.visibility = "hidden";
                }
            }, {
                stateName: 'legend_disabled',
                icon:      '<img src="img/legend_disabled.png">',
                title:     'Habilita a legenda',   
                onClick: function(btn) {       
                    info.state('legend_enabled');
                    btn.state('legend_enabled');
                    document.getElementById('webgente-legend-container').style.visibility = "visible";
                }
        }]
    }).addTo(map);

/* Geolocalização */

var legend = L.easyButton({
    states: [{
            stateName: 'geolocation_disabled',
            icon:      'fas fa-map-marker-alt',
            title:     'Onde estou?',   
            onClick: function(btn) {       
                info.state('geolocation_enabled');
                btn.state('geolocation_enabled');
                map.locate({setView: true, watch: true, maxZoom: 20});
            }
        },
        {
            stateName: 'geolocation_enabled',   
            icon:      'fas fa-map-marker-alt',               
            title:     'Parar de me seguir',
            onClick: function(btn) {
                info.state('geolocation_disabled');
                btn.state('geolocation_disabled');
                map.stopLocate()
            }
        }]
    }).addTo(map);

locationIcon = L.divIcon({
    html: '<i class="fas fa-location-arrow fa-4x"></i>',
    iconSize: [20, 20],
    className: 'location'
    });

var locationMarker = null;

function onLocationFound(e) {
    if (locationMarker !== null) { // Remove marker anterior
        map.removeLayer(locationMarker);
    }
    L.marker(e.latlng).addTo(map)
    .bindPopup('Você está aqui: ' + e.latlng)
    console.log('Geolocalização encontrada')
}

function onLocationError(e) {
    alert(e.message);
    console.log('Geolocalização não encontrada')
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

// Adiciona botão para habilitar ou desabilitar ferramentas de medição

var legend = L.easyButton({
    states: [{
                stateName: 'measurement_enabled',   
                icon:      'fas fa-ruler',               
                title:     'Habilita as Ferramentas de Medição',
                onClick: function(btn) {
                    info.state('measurement_disabled');
                    btn.state('measurement_disabled');
                    document.getElementsByClassName('leaflet-draw-toolbar')[0].style.visibility = 'visible'
                }
            }, {
                stateName: 'measurement_disabled',
                icon:      'fas fa-ruler',
                title:     'Desabilita as Ferramentas de Medição',   
                onClick: function(btn) {       
                    info.state('measurement_enabled');
                    btn.state('measurement_enabled');
                    document.getElementsByClassName('leaflet-draw-toolbar')[0].style.visibility = 'hidden'
                }
        }]
    }).addTo(map);
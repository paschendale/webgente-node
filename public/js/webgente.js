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
    
    if (layer.type == 1) { // Adiciona como Base

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

    } else if (layer.type == 2) { // Adiciona como Overlay

        var l = L.tileLayer.gfiWMS(layer.host,{
            layers: layer.layer,
            format: 'image/png',
            transparent: true,
            attribution: layer.attribution,
            maxZoom: 30
        });
        if (layer.defaultBaseLayer == 1) {
            Lc.addOverlay(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>', layer.group);
            
            // O comportamento de defaultBaseLayer = true só é ativado se não houver indicação de camadas no hash
            if(window.location.hash == '') {
                l.addTo(map);
            }

        } else {
            Lc.addOverlay(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>', layer.group);
        };
    
    } else if (layer.type == 3) { // Adiciona como MDT, modalidade de camada base com GetFeatureInfo
        
        var l = L.tileLayer.gfiWMS(layer.host,{
            layers: layer.layer,
            format: 'image/jpeg',
            transparent: false,
            tiled: false,
            attribution: layer.attribution,
            maxZoom: 30
        });
        if (layer.defaultBaseLayer == 1) {
            Lc.addBaseLayer(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>');
            
            // O comportamento de defaultBaseLayer = true só é ativado se não houver indicação de camadas no hash
            if(window.location.hash == '') {
                l.addTo(map);
            }

        } else {
            Lc.addBaseLayer(l, layer.layerName + ' <a href="' + layer.metadata + '" target="_blank" style="outline: none;"><i class="fas fa-info-circle"></i></a>');
        };
    }
};

$.get('/listlayers',function(data){

    // Reorder data: 1 -> Type 1 data (basemaps), Type 3 data (dem's) and Type 2 data (overlays)

    baseLayers = [];
    overlayLayers = [];
    demLayers = [];

    for (i = 0; i < data.length ; i++) {
        if (data[i].type == 1) baseLayers.push(data[i]);
        if (data[i].type == 2) overlayLayers.push(data[i]);
        if (data[i].type == 3) demLayers.push(data[i]);
    }

    data = [].concat(baseLayers).concat(demLayers).concat(overlayLayers);

    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        addLayer(element)
    }    
    existsBasemap(data);
    getMapStateFromURL();
},'json');

function existsBasemap(data){
    if (data.map(e => e.type).indexOf(1) == -1) { // If there's no Basemap enabled on /listlayers WebGENTE will automatically enable OSM
        osm.addTo(map);
    } else {
        return null
    }
}

/* Inicializando botões de ferramentas */

// Adicionando botão de set view para visao inicial
var home = L.easyButton('<img src="img/home.png">', function(btn, map){
    var initial = [initView.lat,initView.lng];
    map.setView(initial,initView.zoom);
},'Voltar o mapa à vista inicial').addTo(map);

// Adiciona o botao de seleção de feições
var select= false; // Variável que habilita o GetFeatureInfo
var selectButton = L.easyButton({
    states: [{
                stateName: 'select_disabled',
                icon:      'fas fa-hand-pointer',
                title:     'Habilita a ferramenta de seleção de feições das camadas ligadas',   
                onClick: function(btn) {       
                    selectButton.state('select_enabled');
                    btn.state('select_enabled');  
                    select=true;              
                    Lc.addOverlay(selectedLayers,'<a id="selected-download-link" href="" download="webgente-selected-data-'+new Date().getTime()+'.geojson" target="_blank" style="outline: none;">Download <i class="fas fa-cloud-download-alt"></i></a>','Dados selecionados')
                }
            }, {
                stateName: 'select_enabled',   
                icon:      'far fa-hand-pointer',               
                title:     'Desabilita a ferramenta de seleção de feições das camadas ligadas',
                onClick: function(btn) {
                    selectButton.state('select_disabled');
                    btn.state('select_disabled'); 
                    select=false;   
                    Lc.removeLayer(selectedLayers)
                }
        }]
    }).addTo(map);

// Adiciona o botao de visualizar informacoes com dois estados
var gfi = false; // Variável que habilita o GetFeatureInfo
var infoButton = L.easyButton({
    states: [{
                stateName: 'info_disabled',
                icon:      '<img src="img/info_enabled.png">',
                title:     'Habilita a ferramenta de visualização de informações das camadas',   
                onClick: function(btn) {       
                    infoButton.state('info_enabled');
                    btn.state('info_enabled');  
                    gfi=true;  
                }
            }, {
                stateName: 'info_enabled',   
                icon:      '<img src="img/info_disabled.png">',               
                title:     'Desabilita a ferramenta de visualização de informações das camadas',
                onClick: function(btn) {
                    infoButton.state('info_disabled');
                    btn.state('info_disabled'); 
                    gfi=false;   
                }
        }]
    }).addTo(map);

// Adiciona botao para ativar a ferramenta de pesquisas
var searchButton = L.easyButton({
    states: [{
                stateName: 'search_disabled',
                icon:      '<img src="/img/search_enabled.png">',
                title:     'Habilitar ferramenta de pesquisa por atributo nas camadas',   
                onClick: function(btn) {       
                    searchButton.state('search_enabled');
                    btn.state('search_enabled');  
                    document.getElementById('search').style.visibility = "visible";
                    $.get('/search', function( data ) {
                        $('#search').html(data)
                            })
                }
            }, {
                stateName: 'search_enabled',   
                icon:      '<img src="/img/search_disabled.png"">',               
                title:     'Desabilitar ferramenta de pesquisa por atributo nas camadas',
                onClick: function(btn) {
                    searchButton.state('search_disabled');
                    btn.state('search_disabled'); 
                    $('#search').html(" ")
                    closeTable()
                    document.getElementById('search').style.visibility = "hidden";
                     
                }
        }]
    }).addTo(map);

// 
L.DomEvent.disableScrollPropagation(L.DomUtil.get('search'));

// Adiciona botão para habilitar ou desabilitar a legenda

var legendButton = L.easyButton({
    id: 'legend-button',
    states: [{
                stateName: 'legend_enabled',   
                icon:      '<img src="img/legend_enabled.png">',               
                title:     'Desabilita a legenda',
                onClick: function(btn) {
                    legendButton.state('legend_disabled');
                    btn.state('legend_disabled');
                    document.getElementById('webgente-legend-container').style.visibility = "hidden";
                }
            }, {
                stateName: 'legend_disabled',
                icon:      '<img src="img/legend_disabled.png">',
                title:     'Habilita a legenda',   
                onClick: function(btn) {       
                    legendButton.state('legend_enabled');
                    btn.state('legend_enabled');
                    document.getElementById('webgente-legend-container').style.visibility = "visible";
                }
        }]
    }).addTo(map);

/* Geolocalização */

var geolocationButton = L.easyButton({
    states: [{
            stateName: 'geolocation_disabled',
            icon:      'fas fa-map-marker-alt',
            title:     'Onde estou?',   
            onClick: function(btn) {       
                geolocationButton.state('geolocation_enabled');
                btn.state('geolocation_enabled');
                map.locate({setView: true, watch: true, maxZoom: 20});
            }
        },
        {
            stateName: 'geolocation_enabled',   
            icon:      'fas fa-map-marker-alt',               
            title:     'Parar de me seguir',
            onClick: function(btn) {
                geolocationButton.state('geolocation_disabled');
                btn.state('geolocation_disabled');
                map.stopLocate()
            }
        }]
    }).addTo(map);

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

var measurementButton = L.easyButton({
    states: [{
                stateName: 'measurement_enabled',   
                icon:      'fas fa-ruler',               
                title:     'Habilita as Ferramentas de Medição',
                onClick: function(btn) {
                    measurementButton.state('measurement_disabled');
                    btn.state('measurement_disabled');
                    document.getElementsByClassName('leaflet-draw-toolbar')[0].style.visibility = 'visible'
                }
            }, {
                stateName: 'measurement_disabled',
                icon:      'fas fa-ruler',
                title:     'Desabilita as Ferramentas de Medição',   
                onClick: function(btn) {       
                    measurementButton.state('measurement_enabled');
                    btn.state('measurement_enabled');
                    document.getElementsByClassName('leaflet-draw-toolbar')[0].style.visibility = 'hidden'
                }
        }]
    }).addTo(map);

/* Manutenção de camadas pelo nome de chamada no LayerControl */

function addLayerByName(nameString) {
	Lc._layers.find(x => x.layer.options.layers === nameString).layer.addTo(map)
	return null
};

function removeLayerByName(nameString) {
	Lc._layers.find(x => x.layer.options.layers === nameString).layer.remove()
	return null
};

/* Verificação de camadas e coordenadas no HASH e atualização do mapa com as informações */

var activeLayers = []; // Variável global com camadas ativas e GetFeatureInfo habilitado

function setMapStateInURL() {
    
    if(activeLayers.length != 0) {
        window.location.hash = '/'+ map.getCenter().lat + '/' + map.getCenter().lng + '/' + map.getZoom() + '/' + activeLayers.join(',')
    } else {
        window.location.hash = '/'+ map.getCenter().lat + '/' + map.getCenter().lng + '/' + map.getZoom()
    }   
};

map.on("moveend", function () {
    setMapStateInURL()
});

map.on("zoomend", function () {
    setMapStateInURL()
});

function getMapStateFromURL () {
    if (window.location.hash != '') {

        var url = window.location.hash.split('/')
        map.setView([url[1],url[2]],url[3])
    
        if (url[4] != undefined) { // Se houverem camadas na URL, ativa-las
           
            layersFromURL = url[4].split(',')
            for(i = 0; i < layersFromURL.length; i++) {
                addLayerByName(layersFromURL[i])
            }
        }
    }
};

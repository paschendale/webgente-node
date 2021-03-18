var drawCounter = 0;
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polyline: {
            showLength: true
        },
        polygon: {
            metric: ['km', 'm'],
            showLength: false,
            showArea: true,
            allowIntersection: false,
            precision:{km: 2, m: 2}
        },
        circle: false,
        marker: false,
        rectangle: false,
        circlemarker: false
    }
});

map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
    type = e.layerType,
    layer = e.layer;

    if (type === 'polygon') {
        area = L.GeometryUtil.geodesicArea(e.layer.getLatLngs()[0]);
        layer.bindPopup('Area: ' + area.toFixed(4) + 'm²');
        Lc.addOverlay(layer,drawCounter + ': Polígono ' + downloadShp(layer.toGeoJSON(),'webgente-user-feature-'+drawCounter+'-'+new Date().getTime()),'Desenhos do Usuário')
    } else if (type === 'polyline') {
        tempLatLng = null;
        totalDistance = 0.00000;
        $.each(e.layer._latlngs, function(i, latlng){
            if(tempLatLng == null){
                tempLatLng = latlng;
                return;
            }    
            totalDistance += tempLatLng.distanceTo(latlng);
            tempLatLng = latlng;
        });

        layer.bindPopup('Distância: ' +(totalDistance).toFixed(2) + ' metros');
        Lc.addOverlay(layer,drawCounter + ': Linha '+ downloadShp(layer.toGeoJSON(),'webgente-user-feature-'+drawCounter+'-'+new Date().getTime()),'Desenhos do Usuário')
    }

    drawCounter++;

    drawnItems.addLayer(layer);
});

map.on(L.Draw.Event.EDITED, function (e) {
    var layers = e.layers;
    var countOfEditedLayers = 0;
    layers.eachLayer(function (layer) {
        countOfEditedLayers++;
    });
    console.log("Edited " + countOfEditedLayers + " layers");
});

/* Inicializando a barra escondida */
document.getElementsByClassName('leaflet-draw-toolbar')[0].style.visibility = 'hidden' 

/* Cria botão de download de um shape desenhado no menu de controle de camadas */
function downloadShp (geojson,placeholder) {

    /* Este método esta retornando um erro, alguns users sugeriram alterações no código fonte de shp-write aqui: https://github.com/mapbox/shp-write/issues/48
    return '<a onClick="shpwrite.download(\'' + geojson + '\')" target="_blank" style="outline: none;"><i class="fas fa-cloud-download-alt"></i></a>'
    Deixei implementado um método para download do GeoJSON, enquanto nao resolver o problema
    */
    geojson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
    return '<a href="data:' + geojson + '" download="'+placeholder+'.geojson" target="_blank" style="outline: none;"><i class="fas fa-cloud-download-alt"></i></a>'

}

/* Adicionando evento de click no mapa para execução do getFeatureInfo */
map.addEventListener('click',getFeature);

selectedLayers = L.geoJSON().addTo(map);

selectedLayers.on('click', function(e){
    map.fitBounds(selectedLayers.getBounds())
});

function getFeature(e) {

    var index=activeLayers.length
    if (select && index>0) { //Impede seleção quando ferramenta está desabilitada e não houver layers ativadas

        if (!e.originalEvent.shiftKey) {
            selectedLayers.clearLayers() // Limpa seleção anterior
        }
    
        pixelSize = (40075016.686 * Math.abs(Math.cos(map.getCenter().lat / 180 * Math.PI)) / Math.pow(2, map.getZoom()+8))/111120
       
        
        params = {	
            layers: activeLayers[index-1],       
            lat: e.latlng.lat-0.5*pixelSize,
            lng: e.latlng.lng-0.5*pixelSize,
            srs: 'urn:ogc:def:crs:EPSG:4326'
        }
            wfs_recursive(params,index)
  
    } 
}
function wfs_recursive(params, index){
   
    url = '/select/' + Object.values(params).join('/');
    $.ajax({
        url: url,
        success: function (data, status, xhr) {
            loadFeatureAsLayer(data)
            index-=1
            params.layers=activeLayers[index-1]
            if(index>0)
            wfs_recursive(params,index)
        },
        error: function (xhr, status, error) {
            console.log(error)
        }
    }); 

}
function loadFeatureAsLayer (data) {
    data = JSON.parse(data)
    selectedLayers.addData(data)
    updateSelectedDownloadLink() // Atualiza o link de download após a exibição das feições selecionadas

    if(data.features.length != 0){  
        map.fitBounds(selectedLayers.getBounds())
    }
}

function updateSelectedDownloadLink () {

    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    $.each(selectedLayers._layers,(i,val) => geojson.features.push(val.toGeoJSON()))

    geojson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));

    $('#selected-download-link').attr('href','data:' + geojson)
    $('#selected-download-link').attr('download','webgente-selected-data-'+new Date().getTime()+'.geojson')

}